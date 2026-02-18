import { BadRequestException, Injectable } from '@nestjs/common';
import { Cari, Fatura, FaturaKalemi, Stok, TenantSettings } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface BuildEInvoiceInput {
  fatura: Fatura;
  kalemler: Array<FaturaKalemi & { stok?: Pick<Stok, 'stokAdi' | 'stokKodu'> }>
  cari: Cari;
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
    const { fatura, kalemler, cari, supplier } = input;

    const uuid = fatura.efaturaEttn || uuidv4();
    const documentId = fatura.faturaNo;
    const documentDate = this.formatDate(fatura.tarih);

    const supplierVkn = supplier?.taxNumber;
    if (!supplierVkn) {
      throw new BadRequestException('Tenant vergi numarası (supplier taxNumber) eksik');
    }

    const customerIdentifier = cari.vergiNo || cari.tcKimlikNo;
    if (!customerIdentifier) {
      throw new BadRequestException('Cari için VKN/TCKN zorunludur');
    }

    const xmlLines = kalemler
      .map((kalem, index) => {
        const lineExtensionAmount = this.formatAmount(kalem.tutar);
        const quantity = kalem.miktar;
        const unitPrice = this.formatAmount(kalem.birimFiyat);
        const kdvAmount = this.formatAmount(kalem.kdvTutar);
        const kdvOrani = kalem.kdvOrani || 0;
        const itemName = kalem.stok?.stokAdi || kalem.stokId;

        return `
      <cac:InvoiceLine>
        <cbc:ID>${index + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="NIU">${quantity}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="TRY">${lineExtensionAmount}</cbc:LineExtensionAmount>
        <cac:TaxTotal>
          <cbc:TaxAmount currencyID="TRY">${kdvAmount}</cbc:TaxAmount>
          <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="TRY">${lineExtensionAmount}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="TRY">${kdvAmount}</cbc:TaxAmount>
            <cbc:Percent>${kdvOrani}</cbc:Percent>
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

    const lineCount = kalemler.length;
    const taxTotal = this.formatAmount(fatura.kdvTutar);
    const lineExtensionTotal = this.formatAmount(fatura.toplamTutar);
    const payableAmount = this.formatAmount(fatura.genelToplam);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ubltr="urn:oasis:names:specification:ubl:schema:xsd:TurkishCustomizationExtensionComponents">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TICARIFATURA</cbc:ProfileID>
  <cbc:ID>${this.escapeXml(documentId)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${documentDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${lineCount}</cbc:LineCountNumeric>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${supplierVkn}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${this.escapeXml(supplier?.companyName || 'Tedarikçi')}</cbc:Name>
      </cac:PartyName>
      ${this.buildAddress(supplier?.address)}
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${cari.vergiNo ? 'VKN' : 'TCKN'}">${customerIdentifier}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${this.escapeXml(cari.unvan)}</cbc:Name>
      </cac:PartyName>
      ${this.buildAddress(cari.adres)}
    </cac:Party>
  </cac:AccountingCustomerParty>
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
          <cbc:Name>Türkiye</cbc:Name>
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
