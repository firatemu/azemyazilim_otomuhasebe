import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, Invoice, InvoiceItem, Product, TenantSettings, Unit } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface BuildEInvoiceInput {
  invoice: Invoice;
  items: Array<
    InvoiceItem & {
      product?: Pick<Product, 'name' | 'code' | 'unitId'> & {
        unitRef?: Pick<Unit, 'code'> | null;
      };
    }
  >;
  account: Account;
  supplier: TenantSettings | null;
}

export interface BuildEInvoiceResult {
  xml: string;
  uuid: string;
  documentId: string;
  documentDate: string; // YYYY-MM-DD
}

@Injectable()
export class EInvoiceBuilderService {
  build(input: BuildEInvoiceInput): BuildEInvoiceResult {
    const { invoice, items, account, supplier } = input;

    const uuid = (invoice as any).eInvoiceEttn || uuidv4();
    const documentId = invoice.invoiceNo;
    const documentDate = this.formatDate(invoice.date);

    const supplierVkn = supplier?.taxNumber;
    if (!supplierVkn) {
      throw new BadRequestException('Tenant vergi numarası (supplier taxNumber) eksik');
    }

    const customerIdentifier = account.taxNumber || account.nationalId;
    if (!customerIdentifier) {
      throw new BadRequestException('Cari için VKN/TCKN zorunludur');
    }

    // e-Dönüşüm: Senaryo ve Invoice Tipi (dinamik)
    const profileId = (invoice as any).eScenario || 'TICARI_FATURA'; // TEMEL_FATURA | TICARI_FATURA | KAMU_FATURASI
    const invoiceTypeCode = (invoice as any).eInvoiceType || 'SALE'; // SALES | IADE | TEVKIFAT | ISTISNA | OZEL_MATRAH | IHRAC_KAYITLI
    const buyerAlias = (invoice as any).gibAlias || null;

    const xmlLines = items
      .map((item, index) => {
        const lineExtensionAmount = this.formatAmount(item.amount);
        const quantity = item.quantity;
        const unitPrice = this.formatAmount(item.unitPrice);
        const vatAmount = this.formatAmount(item.vatAmount);
        const vatRate = item.vatRate || 0;
        const itemName = item.product?.name || item.productId;

        // Universal Unit Code logic: Prioritize Unit.code, fallback to NIU
        const unitCode = item.product?.unitRef?.code || 'NIU';

        return `
      <cac:InvoiceLine>
        <cbc:ID>${index + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="${unitCode}">${quantity}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="TRY">${lineExtensionAmount}</cbc:LineExtensionAmount>
        <cac:TaxTotal>
          <cbc:TaxAmount currencyID="TRY">${vatAmount}</cbc:TaxAmount>
          <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="TRY">${lineExtensionAmount}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="TRY">${vatAmount}</cbc:TaxAmount>
            <cbc:Percent>${vatRate}</cbc:Percent>
            <cac:TaxCategory>
              <cac:TaxScheme>
                <cbc:Name>KDV</cbc:Name>
                <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
              </cac:TaxScheme>
            </cac:TaxCategory>
          </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
          <cbc:Name>${this.escapeXml(itemName)}</cbc:Name>
        </cac:Item>
        <cac:Price>
          <cbc:PriceAmount currencyID="TRY">${unitPrice}</cbc:PriceAmount>
        </cac:Price>
      </cac:InvoiceLine>`;
      })
      .join('');

    const lineCount = items.length;
    const taxTotal = this.formatAmount(invoice.vatAmount);
    const lineExtensionTotal = this.formatAmount(invoice.totalAmount);
    const payableAmount = this.formatAmount(invoice.grandTotal);
    const accountTitle = account.title || account.fullName || 'Customer';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ubltr="urn:oasis:names:specification:ubl:schema:xsd:TurkishCustomizationExtensionComponents">
  \u003ccbc:UBLVersionID\u003e2.1\u003c/cbc:UBLVersionID\u003e
  \u003ccbc:CustomizationID\u003eTR1.2\u003c/cbc:CustomizationID\u003e
  \u003ccbc:ProfileID\u003e${profileId}\u003c/cbc:ProfileID\u003e
  \u003ccbc:ID\u003e${this.escapeXml(documentId)}\u003c/cbc:ID\u003e
  \u003ccbc:UUID\u003e${uuid}\u003c/cbc:UUID\u003e
  \u003ccbc:IssueDate\u003e${documentDate}\u003c/cbc:IssueDate\u003e
  \u003ccbc:InvoiceTypeCode\u003e${invoiceTypeCode}\u003c/cbc:InvoiceTypeCode\u003e
  \u003ccbc:DocumentCurrencyCode\u003eTRY\u003c/cbc:DocumentCurrencyCode\u003e
  \u003ccbc:LineCountNumeric\u003e${lineCount}\u003c/cbc:LineCountNumeric\u003e
  \u003ccac:AccountingSupplierParty\u003e
    \u003ccac:Party\u003e
      \u003ccac:PartyIdentification\u003e
        \u003ccbc:ID schemeID="VKN"\u003e${supplierVkn}\u003c/cbc:ID\u003e
      \u003c/cac:PartyIdentification\u003e
      \u003ccac:PartyName\u003e
        \u003ccbc:Name\u003e${this.escapeXml(supplier?.companyName || 'Tedarikçi')}\u003c/cbc:Name\u003e
      \u003c/cac:PartyName\u003e
      ${this.buildAddress(supplier?.address)}
    \u003c/cac:Party\u003e
  \u003c/cac:AccountingSupplierParty\u003e
  \u003ccac:AccountingCustomerParty\u003e
    \u003ccac:Party\u003e
      \u003ccac:PartyIdentification\u003e
        \u003ccbc:ID schemeID="${account.taxNumber ? 'VKN' : 'TCKN'}"\u003e${customerIdentifier}\u003c/cbc:ID\u003e
      \u003c/cac:PartyIdentification\u003e
      \u003ccac:PartyName\u003e
        \u003ccbc:Name\u003e${this.escapeXml(accountTitle)}\u003c/cbc:Name\u003e
      \u003c/cac:PartyName\u003e
      ${buyerAlias ? `\u003ccbc:EndpointID schemeID="GLN"\u003e${this.escapeXml(buyerAlias)}\u003c/cbc:EndpointID\u003e` : ''}
      ${this.buildAddress(account.address)}
    \u003c/cac:Party\u003e
  \u003c/cac:AccountingCustomerParty\u003e
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${taxTotal}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${lineExtensionTotal}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${taxTotal}</cbc:TaxAmount>
      <cbc:Percent>18</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${lineExtensionTotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${lineExtensionTotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${payableAmount}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">${payableAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${xmlLines}
</Invoice>`;

    return { xml, uuid, documentId, documentDate };
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  private formatAmount(value: any): string {
    const num = Number(value || 0);
    return num.toFixed(2);
  }

  private buildAddress(address?: string | null): string {
    if (!address) {
      return '';
    }
    return `
      <cac:PostalAddress>
        <cbc:StreetName>${this.escapeXml(address)}</cbc:StreetName>
        <cbc:CountrySubentity>TR</cbc:CountrySubentity>
        <cac:Country>
          <cbc:Name>Turkey</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>`;
  }

  private escapeXml(value: string): string {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
