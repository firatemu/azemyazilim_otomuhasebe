export enum InvoiceType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    SALES_RETURN = 'SALES_RETURN',
    PURCHASE_RETURN = 'PURCHASE_RETURN'
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED'
}
