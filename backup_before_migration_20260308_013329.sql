--
-- PostgreSQL database dump
--

\restrict Yw04olxbp645WaZLaNEFviB62Jw1r0zKYj9Mab3KFk6tgHewcNz2Egee9pe8oyf

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountType" AS ENUM (
    'CUSTOMER',
    'SUPPLIER',
    'BOTH'
);


ALTER TYPE public."AccountType" OWNER TO postgres;

--
-- Name: AddressType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AddressType" AS ENUM (
    'DELIVERY',
    'INVOICE',
    'CENTER',
    'BRANCH',
    'WAREHOUSE',
    'OTHER',
    'SHIPMENT'
);


ALTER TYPE public."AddressType" OWNER TO postgres;

--
-- Name: AdvanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdvanceStatus" AS ENUM (
    'OPEN',
    'PARTIAL',
    'CLOSED'
);


ALTER TYPE public."AdvanceStatus" OWNER TO postgres;

--
-- Name: BankAccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankAccountType" AS ENUM (
    'DEMAND_DEPOSIT',
    'LOAN',
    'POS',
    'COMPANY_CREDIT_CARD',
    'TIME_DEPOSIT',
    'INVESTMENT',
    'GOLD',
    'CURRENCY',
    'OTHER'
);


ALTER TYPE public."BankAccountType" OWNER TO postgres;

--
-- Name: BankMovementSubType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankMovementSubType" AS ENUM (
    'INCOMING_TRANSFER',
    'OUTGOING_TRANSFER',
    'LOAN_USAGE',
    'LOAN_PAYMENT',
    'GUARANTEE_CHECK',
    'GUARANTEE_PROMISSORY',
    'POS_COLLECTION',
    'CARD_EXPENSE',
    'CARD_PAYMENT',
    'TRANSFER',
    'OTHER',
    'LOAN_INSTALLMENT_PAYMENT'
);


ALTER TYPE public."BankMovementSubType" OWNER TO postgres;

--
-- Name: BankMovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankMovementType" AS ENUM (
    'INCOMING',
    'OUTGOING'
);


ALTER TYPE public."BankMovementType" OWNER TO postgres;

--
-- Name: BillingPeriod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'LIFETIME'
);


ALTER TYPE public."BillingPeriod" OWNER TO postgres;

--
-- Name: CashboxMovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashboxMovementType" AS ENUM (
    'COLLECTION',
    'PAYMENT',
    'INCOMING_TRANSFER',
    'OUTGOING_TRANSFER',
    'CREDIT_CARD',
    'TRANSFER',
    'CARRY_FORWARD',
    'CHECK_RECEIVED',
    'CHECK_GIVEN',
    'PROMISSORY_RECEIVED',
    'PROMISSORY_GIVEN',
    'CHECK_COLLECTION',
    'PROMISSORY_COLLECTION'
);


ALTER TYPE public."CashboxMovementType" OWNER TO postgres;

--
-- Name: CashboxType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashboxType" AS ENUM (
    'CASH',
    'POS',
    'COMPANY_CREDIT_CARD',
    'BANK',
    'CHECK_PROMISSORY'
);


ALTER TYPE public."CashboxType" OWNER TO postgres;

--
-- Name: CheckBillStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CheckBillStatus" AS ENUM (
    'IN_PORTFOLIO',
    'UNPAID',
    'GIVEN_TO_BANK',
    'COLLECTED',
    'PAID',
    'ENDORSED',
    'RETURNED',
    'WITHOUT_COVERAGE',
    'IN_BANK_COLLECTION',
    'IN_BANK_GUARANTEE'
);


ALTER TYPE public."CheckBillStatus" OWNER TO postgres;

--
-- Name: CheckBillType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CheckBillType" AS ENUM (
    'CHECK',
    'PROMISSORY'
);


ALTER TYPE public."CheckBillType" OWNER TO postgres;

--
-- Name: CollectionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CollectionType" AS ENUM (
    'COLLECTION',
    'PAYMENT'
);


ALTER TYPE public."CollectionType" OWNER TO postgres;

--
-- Name: CompanyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CompanyType" AS ENUM (
    'CORPORATE',
    'INDIVIDUAL'
);


ALTER TYPE public."CompanyType" OWNER TO postgres;

--
-- Name: CreditPlanStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CreditPlanStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'PARTIALLY_PAID'
);


ALTER TYPE public."CreditPlanStatus" OWNER TO postgres;

--
-- Name: DebitCredit; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DebitCredit" AS ENUM (
    'DEBIT',
    'CREDIT',
    'CARRY_FORWARD'
);


ALTER TYPE public."DebitCredit" OWNER TO postgres;

--
-- Name: DeliveryNoteSourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryNoteSourceType" AS ENUM (
    'ORDER',
    'DIRECT',
    'INVOICE_AUTOMATIC'
);


ALTER TYPE public."DeliveryNoteSourceType" OWNER TO postgres;

--
-- Name: DeliveryNoteStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryNoteStatus" AS ENUM (
    'NOT_INVOICED',
    'INVOICED'
);


ALTER TYPE public."DeliveryNoteStatus" OWNER TO postgres;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'INVOICE',
    'COLLECTION',
    'PAYMENT',
    'CHECK_PROMISSORY',
    'CARRY_FORWARD',
    'CORRECTION',
    'CHECK_ENTRY',
    'CHECK_EXIT',
    'RETURN'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- Name: EInvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EInvoiceStatus" AS ENUM (
    'PENDING',
    'SENT',
    'ERROR',
    'DRAFT'
);


ALTER TYPE public."EInvoiceStatus" OWNER TO postgres;

--
-- Name: EmployeePaymentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmployeePaymentType" AS ENUM (
    'ENTITLEMENT',
    'SALARY',
    'ADVANCE',
    'BONUS',
    'DEDUCTION',
    'ALLOCATION',
    'ALLOCATION_RETURN'
);


ALTER TYPE public."EmployeePaymentType" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'NOT_SPECIFIED'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: InventoryTransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InventoryTransactionType" AS ENUM (
    'DEDUCTION',
    'RETURN'
);


ALTER TYPE public."InventoryTransactionType" OWNER TO postgres;

--
-- Name: InvitationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."InvitationStatus" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'CLOSED',
    'PARTIALLY_PAID',
    'APPROVED',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: InvoiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceType" AS ENUM (
    'PURCHASE',
    'SALE',
    'SALES_RETURN',
    'PURCHASE_RETURN'
);


ALTER TYPE public."InvoiceType" OWNER TO postgres;

--
-- Name: JournalType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."JournalType" AS ENUM (
    'ENTRY_PAYROLL',
    'EXIT_PAYROLL',
    'CUSTOMER_DOCUMENT_ENTRY',
    'CUSTOMER_DOCUMENT_EXIT',
    'OWN_DOCUMENT_ENTRY',
    'OWN_DOCUMENT_EXIT',
    'BANK_COLLECTION_ENDORSEMENT',
    'BANK_GUARANTEE_ENDORSEMENT',
    'ACCOUNT_DOCUMENT_ENDORSEMENT',
    'DEBIT_DOCUMENT_EXIT',
    'RETURN_PAYROLL'
);


ALTER TYPE public."JournalType" OWNER TO postgres;

--
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseType" AS ENUM (
    'BASE_PLAN',
    'MODULE'
);


ALTER TYPE public."LicenseType" OWNER TO postgres;

--
-- Name: LoanStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LoanStatus" AS ENUM (
    'ACTIVE',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."LoanStatus" OWNER TO postgres;

--
-- Name: LoanType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LoanType" AS ENUM (
    'EQUAL_INSTALLMENT',
    'REVOLVING'
);


ALTER TYPE public."LoanType" OWNER TO postgres;

--
-- Name: LogAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LogAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'STATUS_CHANGE',
    'CANCELLATION',
    'RESTORE',
    'CONVERTED_TO_ORDER',
    'EINVOICE_SENT',
    'EINVOICE_SEND_ERROR',
    'SHIPMENT',
    'ENDORSEMENT'
);


ALTER TYPE public."LogAction" OWNER TO postgres;

--
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED'
);


ALTER TYPE public."MaritalStatus" OWNER TO postgres;

--
-- Name: ModuleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ModuleType" AS ENUM (
    'WAREHOUSE',
    'CASHBOX',
    'PERSONNEL',
    'PRODUCT',
    'CUSTOMER',
    'INVOICE_SALES',
    'INVOICE_PURCHASE',
    'ORDER_SALES',
    'ORDER_PURCHASE',
    'INVENTORY_COUNT',
    'QUOTE',
    'DELIVERY_NOTE_SALES',
    'DELIVERY_NOTE_PURCHASE',
    'WAREHOUSE_TRANSFER',
    'TECHNICIAN',
    'WORK_ORDER',
    'SERVICE_INVOICE'
);


ALTER TYPE public."ModuleType" OWNER TO postgres;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MovementType" AS ENUM (
    'ENTRY',
    'EXIT',
    'SALE',
    'RETURN',
    'CANCELLATION_ENTRY',
    'CANCELLATION_EXIT',
    'COUNT',
    'COUNT_SURPLUS',
    'COUNT_SHORTAGE'
);


ALTER TYPE public."MovementType" OWNER TO postgres;

--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED'
);


ALTER TYPE public."OrderItemStatus" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: OrderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderType" AS ENUM (
    'SALE',
    'PURCHASE'
);


ALTER TYPE public."OrderType" OWNER TO postgres;

--
-- Name: PartRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartRequestStatus" AS ENUM (
    'REQUESTED',
    'SUPPLIED',
    'USED',
    'CANCELLED'
);


ALTER TYPE public."PartRequestStatus" OWNER TO postgres;

--
-- Name: PartWorkflowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartWorkflowStatus" AS ENUM (
    'NOT_STARTED',
    'PARTS_SUPPLIED_DIRECT',
    'PARTS_PENDING',
    'PARTIALLY_SUPPLIED',
    'ALL_PARTS_SUPPLIED'
);


ALTER TYPE public."PartWorkflowStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'CHECK',
    'PROMISSORY_NOTE',
    'GIFT_CARD',
    'LOAN_ACCOUNT'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED',
    'CANCELED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PortfolioType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PortfolioType" AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public."PortfolioType" OWNER TO postgres;

--
-- Name: PosSessionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PosSessionStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


ALTER TYPE public."PosSessionStatus" OWNER TO postgres;

--
-- Name: PriceCardType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PriceCardType" AS ENUM (
    'SALE',
    'PURCHASE'
);


ALTER TYPE public."PriceCardType" OWNER TO postgres;

--
-- Name: PurchaseOrderLocalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PurchaseOrderLocalStatus" AS ENUM (
    'PENDING',
    'PREPARING',
    'PREPARED',
    'SHIPPED',
    'PARTIALLY_SHIPPED',
    'ORDER_PLACED',
    'INVOICED',
    'CANCELLED'
);


ALTER TYPE public."PurchaseOrderLocalStatus" OWNER TO postgres;

--
-- Name: QuoteStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuoteStatus" AS ENUM (
    'OFFERED',
    'APPROVED',
    'REJECTED',
    'CONVERTED_TO_ORDER'
);


ALTER TYPE public."QuoteStatus" OWNER TO postgres;

--
-- Name: QuoteType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuoteType" AS ENUM (
    'SALE',
    'PURCHASE'
);


ALTER TYPE public."QuoteType" OWNER TO postgres;

--
-- Name: RiskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskStatus" AS ENUM (
    'NORMAL',
    'RISKY',
    'BLACK_LIST',
    'IN_COLLECTION'
);


ALTER TYPE public."RiskStatus" OWNER TO postgres;

--
-- Name: SalaryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SalaryStatus" AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'FULLY_PAID',
    'PENDING'
);


ALTER TYPE public."SalaryStatus" OWNER TO postgres;

--
-- Name: SalesOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SalesOrderStatus" AS ENUM (
    'PENDING',
    'PREPARING',
    'PREPARED',
    'SHIPPED',
    'PARTIALLY_SHIPPED',
    'INVOICED',
    'CANCELLED'
);


ALTER TYPE public."SalesOrderStatus" OWNER TO postgres;

--
-- Name: SimpleOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SimpleOrderStatus" AS ENUM (
    'AWAITING_APPROVAL',
    'APPROVED',
    'ORDER_PLACED',
    'INVOICED',
    'CANCELLED'
);


ALTER TYPE public."SimpleOrderStatus" OWNER TO postgres;

--
-- Name: StockMoveType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockMoveType" AS ENUM (
    'PUT_AWAY',
    'TRANSFER',
    'PICKING',
    'ADJUSTMENT',
    'SALE',
    'RETURN',
    'DAMAGE'
);


ALTER TYPE public."StockMoveType" OWNER TO postgres;

--
-- Name: StocktakeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StocktakeStatus" AS ENUM (
    'DRAFT',
    'COMPLETED',
    'APPROVED',
    'CANCELLED'
);


ALTER TYPE public."StocktakeStatus" OWNER TO postgres;

--
-- Name: StocktakeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StocktakeType" AS ENUM (
    'PRODUCT_BASED',
    'SHELF_BASED'
);


ALTER TYPE public."StocktakeType" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'PENDING',
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantStatus" AS ENUM (
    'TRIAL',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'PURGED',
    'EXPIRED',
    'CHURNED',
    'DELETED',
    'PENDING'
);


ALTER TYPE public."TenantStatus" OWNER TO postgres;

--
-- Name: TenantType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantType" AS ENUM (
    'INDIVIDUAL',
    'CORPORATE'
);


ALTER TYPE public."TenantType" OWNER TO postgres;

--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'PREPARING',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TransferStatus" OWNER TO postgres;

--
-- Name: TransferType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransferType" AS ENUM (
    'INCOMING',
    'OUTGOING'
);


ALTER TYPE public."TransferType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'TENANT_ADMIN',
    'ADMIN',
    'USER',
    'VIEWER',
    'SUPPORT',
    'MANAGER',
    'TECHNICIAN',
    'WORKSHOP_MANAGER',
    'RECEPTION',
    'SERVICE_MANAGER',
    'PROCUREMENT',
    'WAREHOUSE',
    'ADVISOR',
    'PARTS_MANAGER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: VehicleExpenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VehicleExpenseType" AS ENUM (
    'FUEL',
    'MAINTENANCE',
    'INSPECTION',
    'TRAFFIC_INSURANCE',
    'CASCO',
    'PENALTY',
    'HGS_OGS',
    'PARKING',
    'CAR_WASH',
    'OTHER'
);


ALTER TYPE public."VehicleExpenseType" OWNER TO postgres;

--
-- Name: VehicleServiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VehicleServiceStatus" AS ENUM (
    'WAITING',
    'CUSTOMER_APPROVAL_PENDING',
    'IN_PROGRESS',
    'PART_WAITING',
    'PARTS_SUPPLIED',
    'VEHICLE_READY',
    'COMPLETED'
);


ALTER TYPE public."VehicleServiceStatus" OWNER TO postgres;

--
-- Name: VehicleWorkflowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VehicleWorkflowStatus" AS ENUM (
    'WAITING',
    'IN_PROGRESS',
    'READY',
    'DELIVERED'
);


ALTER TYPE public."VehicleWorkflowStatus" OWNER TO postgres;

--
-- Name: WorkOrderItemType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkOrderItemType" AS ENUM (
    'LABOR',
    'PART'
);


ALTER TYPE public."WorkOrderItemType" OWNER TO postgres;

--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'WAITING_DIAGNOSIS',
    'PENDING_APPROVAL',
    'APPROVED_IN_PROGRESS',
    'PART_WAITING',
    'PARTS_SUPPLIED',
    'VEHICLE_READY',
    'INVOICED_CLOSED',
    'CLOSED_WITHOUT_INVOICE',
    'CANCELLED'
);


ALTER TYPE public."WorkOrderStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_addresses (
    id text NOT NULL,
    account_id text NOT NULL,
    title text NOT NULL,
    type public."AddressType" NOT NULL,
    address text NOT NULL,
    city text,
    district text,
    postal_code text,
    is_default boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account_addresses OWNER TO postgres;

--
-- Name: account_banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_banks (
    id text NOT NULL,
    account_id text NOT NULL,
    bank_name text NOT NULL,
    branch_name text,
    branch_code text,
    account_no text,
    iban text NOT NULL,
    currency text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account_banks OWNER TO postgres;

--
-- Name: account_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_contacts (
    id text NOT NULL,
    account_id text NOT NULL,
    full_name text NOT NULL,
    title text,
    phone text,
    email text,
    extension text,
    is_default boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account_contacts OWNER TO postgres;

--
-- Name: account_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_movements (
    id text NOT NULL,
    account_id text NOT NULL,
    type public."DebitCredit" NOT NULL,
    amount numeric(12,2) NOT NULL,
    balance numeric(12,2) NOT NULL,
    document_type public."DocumentType",
    document_no text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" text
);


ALTER TABLE public.account_movements OWNER TO postgres;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    code text NOT NULL,
    "tenantId" text,
    title text NOT NULL,
    type public."AccountType" NOT NULL,
    company_type public."CompanyType" DEFAULT 'CORPORATE'::public."CompanyType",
    tax_number text,
    tax_office text,
    national_id text,
    full_name text,
    phone text,
    email text,
    country text DEFAULT 'Turkey'::text,
    city text,
    district text,
    address text,
    contact_name text,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    payment_term_days integer,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    sales_agent_id text,
    credit_limit numeric(12,2),
    credit_status public."RiskStatus" DEFAULT 'NORMAL'::public."RiskStatus",
    collateral_amount numeric(12,2),
    sector text,
    custom_code1 text,
    custom_code2 text,
    website text,
    fax text,
    due_days integer,
    currency text,
    bank_info text,
    price_list_id text
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: advance_settlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advance_settlements (
    id text NOT NULL,
    "tenantId" text,
    advance_id text NOT NULL,
    salary_plan_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text
);


ALTER TABLE public.advance_settlements OWNER TO postgres;

--
-- Name: advances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advances (
    id text NOT NULL,
    "tenantId" text,
    employee_id text NOT NULL,
    cashbox_id text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount numeric(12,2) NOT NULL,
    settled_amount numeric(12,2) DEFAULT 0 NOT NULL,
    remaining_amount numeric(12,2) NOT NULL,
    notes text,
    status public."AdvanceStatus" DEFAULT 'OPEN'::public."AdvanceStatus" NOT NULL,
    created_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.advances OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    "tenantId" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: bank_account_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_account_movements (
    id text NOT NULL,
    bank_account_id text NOT NULL,
    movement_type public."BankMovementType" NOT NULL,
    movement_sub_type public."BankMovementSubType",
    amount numeric(15,2) NOT NULL,
    commission_rate numeric(5,2),
    commission_amount numeric(15,2),
    net_amount numeric(15,2),
    balance numeric(15,2) NOT NULL,
    notes text,
    reference_no text,
    account_id text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bank_account_movements OWNER TO postgres;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id text NOT NULL,
    bank_id text NOT NULL,
    code text NOT NULL,
    name text,
    account_no text,
    iban text,
    type public."BankAccountType" NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    commission_rate numeric(5,2),
    credit_limit numeric(15,2),
    used_credit_limit numeric(15,2),
    card_limit numeric(15,2),
    statement_day integer,
    payment_due_day integer,
    terminal_no text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: bank_loan_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_loan_plans (
    id text NOT NULL,
    loan_id text NOT NULL,
    installment_no integer NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    amount numeric(15,2) NOT NULL,
    paid_amount numeric(15,2) DEFAULT 0 NOT NULL,
    status public."CreditPlanStatus" DEFAULT 'PENDING'::public."CreditPlanStatus" NOT NULL,
    "tenantId" text
);


ALTER TABLE public.bank_loan_plans OWNER TO postgres;

--
-- Name: bank_loans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_loans (
    id text NOT NULL,
    bank_account_id text NOT NULL,
    amount numeric(15,2) NOT NULL,
    total_repayment numeric(15,2) NOT NULL,
    total_interest numeric(15,2) NOT NULL,
    installment_count integer NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    notes text,
    loan_type public."LoanType" DEFAULT 'EQUAL_INSTALLMENT'::public."LoanType" NOT NULL,
    status public."LoanStatus" DEFAULT 'ACTIVE'::public."LoanStatus" NOT NULL,
    annual_interest_rate numeric(5,2),
    payment_frequency integer DEFAULT 1 NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_loans OWNER TO postgres;

--
-- Name: bank_transfer_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_transfer_logs (
    id text NOT NULL,
    bank_transfer_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bank_transfer_logs OWNER TO postgres;

--
-- Name: bank_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_transfers (
    id text NOT NULL,
    "tenantId" text,
    transfer_type public."TransferType" NOT NULL,
    cashbox_id text,
    account_id text NOT NULL,
    amount numeric(15,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    reference_no text,
    sender text,
    receiver text,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    bank_account_id text
);


ALTER TABLE public.bank_transfers OWNER TO postgres;

--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id text NOT NULL,
    "tenantId" text,
    name text NOT NULL,
    branch text,
    city text,
    contact_name text,
    phone text,
    logo text,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- Name: cashbox_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashbox_movements (
    id text NOT NULL,
    cashbox_id text NOT NULL,
    movement_type public."CashboxMovementType" NOT NULL,
    amount numeric(15,2) NOT NULL,
    commission_amount numeric(15,2),
    bsmv_amount numeric(15,2),
    net_amount numeric(15,2),
    balance numeric(15,2) NOT NULL,
    document_type text,
    document_no text,
    account_id text,
    notes text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_transferred boolean DEFAULT false NOT NULL,
    transfer_date timestamp(3) without time zone,
    created_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cashbox_movements OWNER TO postgres;

--
-- Name: cashboxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashboxes (
    id text NOT NULL,
    code text NOT NULL,
    "tenantId" text,
    name text NOT NULL,
    type public."CashboxType" NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cashboxes OWNER TO postgres;

--
-- Name: check_bill_journal_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_bill_journal_items (
    id text NOT NULL,
    journal_id text NOT NULL,
    check_bill_id text NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.check_bill_journal_items OWNER TO postgres;

--
-- Name: check_bill_journals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_bill_journals (
    id text NOT NULL,
    journal_no text NOT NULL,
    type public."JournalType" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    account_id text,
    notes text,
    "tenantId" text,
    created_by_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    bank_account_id text
);


ALTER TABLE public.check_bill_journals OWNER TO postgres;

--
-- Name: check_bill_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_bill_logs (
    id text NOT NULL,
    check_bill_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.check_bill_logs OWNER TO postgres;

--
-- Name: checks_bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checks_bills (
    id text NOT NULL,
    "tenantId" text,
    type public."CheckBillType" NOT NULL,
    portfolio_type public."PortfolioType" NOT NULL,
    account_id text NOT NULL,
    amount numeric(15,2) NOT NULL,
    remaining_amount numeric(15,2) DEFAULT 0 NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    bank text,
    branch text,
    account_no text,
    check_no text,
    serial_no text,
    status public."CheckBillStatus",
    collection_date timestamp(3) without time zone,
    collection_cashbox_id text,
    is_endorsed boolean DEFAULT false NOT NULL,
    endorsement_date timestamp(3) without time zone,
    endorsed_to text,
    notes text,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    last_journal_id text
);


ALTER TABLE public.checks_bills OWNER TO postgres;

--
-- Name: code_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.code_templates (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    module public."ModuleType" NOT NULL,
    name text NOT NULL,
    prefix text NOT NULL,
    "digitCount" integer DEFAULT 3 NOT NULL,
    "currentValue" integer DEFAULT 0 NOT NULL,
    "includeYear" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.code_templates OWNER TO postgres;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id text NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    invoice_id text,
    service_invoice_id text,
    type public."CollectionType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payment_type public."PaymentMethod" NOT NULL,
    cashbox_id text,
    bank_account_id text,
    company_credit_card_id text,
    notes text,
    created_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    sales_agent_id text
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: company_credit_card_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_credit_card_movements (
    id text NOT NULL,
    card_id text NOT NULL,
    amount numeric(15,2) NOT NULL,
    balance numeric(15,2) NOT NULL,
    notes text,
    account_id text,
    reference_no text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.company_credit_card_movements OWNER TO postgres;

--
-- Name: company_credit_card_reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_credit_card_reminders (
    id text NOT NULL,
    card_id text NOT NULL,
    type text NOT NULL,
    day integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_credit_card_reminders OWNER TO postgres;

--
-- Name: company_credit_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_credit_cards (
    id text NOT NULL,
    cashbox_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    bank_name text NOT NULL,
    card_type text,
    last_four_digits text,
    credit_limit numeric(15,2),
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    statement_date timestamp(3) without time zone,
    payment_due_date timestamp(3) without time zone
);


ALTER TABLE public.company_credit_cards OWNER TO postgres;

--
-- Name: company_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_vehicles (
    id text NOT NULL,
    "tenantId" text,
    plate text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer,
    chassis_no text,
    engine_no text,
    registration_date timestamp(3) without time zone,
    vehicle_type text,
    fuel_type text,
    is_active boolean DEFAULT true NOT NULL,
    assigned_employee_id text,
    registration_image_url text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.company_vehicles OWNER TO postgres;

--
-- Name: customer_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_vehicles (
    id text NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    plate text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer,
    chassis_no text,
    engine_power integer,
    engine_size text,
    fuel_type text,
    transmission text,
    color text,
    registration_date timestamp(3) without time zone,
    registration_no text,
    registration_owner text,
    mileage integer,
    notes text,
    service_status public."VehicleServiceStatus",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_vehicles OWNER TO postgres;

--
-- Name: deleted_bank_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_bank_transfers (
    id text NOT NULL,
    original_id text NOT NULL,
    transfer_type public."TransferType" NOT NULL,
    cashbox_id text NOT NULL,
    cashbox_name text NOT NULL,
    account_id text NOT NULL,
    account_name text NOT NULL,
    amount numeric(15,2) NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    notes text,
    reference_no text,
    sender text,
    receiver text,
    original_created_by text,
    original_updated_by text,
    original_created_at timestamp(3) without time zone NOT NULL,
    original_updated_at timestamp(3) without time zone NOT NULL,
    deleted_by text,
    deleted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delete_reason text
);


ALTER TABLE public.deleted_bank_transfers OWNER TO postgres;

--
-- Name: deleted_checks_bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_checks_bills (
    id text NOT NULL,
    original_id text NOT NULL,
    type public."CheckBillType" NOT NULL,
    portfolio_type public."PortfolioType" NOT NULL,
    account_id text NOT NULL,
    account_name text NOT NULL,
    amount numeric(15,2) NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    bank text,
    branch text,
    account_no text,
    check_no text,
    serial_no text,
    status public."CheckBillStatus" NOT NULL,
    collection_date timestamp(3) without time zone,
    collection_cashbox_id text,
    is_endorsed boolean NOT NULL,
    endorsement_date timestamp(3) without time zone,
    endorsed_to text,
    notes text,
    original_created_by text,
    original_updated_by text,
    original_created_at timestamp(3) without time zone NOT NULL,
    original_updated_at timestamp(3) without time zone NOT NULL,
    deleted_by text,
    deleted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delete_reason text
);


ALTER TABLE public.deleted_checks_bills OWNER TO postgres;

--
-- Name: einvoice_inbox; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.einvoice_inbox (
    id integer NOT NULL,
    ettn text NOT NULL,
    "senderVkn" text NOT NULL,
    "senderTitle" text NOT NULL,
    "invoiceNo" text,
    "invoiceDate" timestamp(3) without time zone,
    "rawXml" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.einvoice_inbox OWNER TO postgres;

--
-- Name: einvoice_inbox_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.einvoice_inbox_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.einvoice_inbox_id_seq OWNER TO postgres;

--
-- Name: einvoice_inbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.einvoice_inbox_id_seq OWNED BY public.einvoice_inbox.id;


--
-- Name: einvoice_xml; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.einvoice_xml (
    id text NOT NULL,
    invoice_id text NOT NULL,
    xml_data text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.einvoice_xml OWNER TO postgres;

--
-- Name: employee_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_payments (
    id text NOT NULL,
    employee_id text NOT NULL,
    type public."EmployeePaymentType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    period text,
    notes text,
    cashbox_id text,
    created_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employee_payments OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id text NOT NULL,
    employee_code text NOT NULL,
    "tenantId" text,
    identity_number text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    birth_date timestamp(3) without time zone,
    gender public."Gender",
    marital_status public."MaritalStatus",
    phone text,
    email text,
    address text,
    city text,
    district text,
    "position" text,
    department text,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    salary numeric(10,2),
    salary_day integer,
    social_security_no text,
    iban text,
    balance numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by text,
    updated_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    bonus numeric(10,2)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: equivalency_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equivalency_groups (
    id text NOT NULL,
    name text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.equivalency_groups OWNER TO postgres;

--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_categories (
    id text NOT NULL,
    name text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.expense_categories OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    "tenantId" text,
    category_id text NOT NULL,
    notes text,
    amount numeric(10,2) NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payment_type public."PaymentMethod" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: hizli_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hizli_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    "loginHash" text NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hizli_tokens OWNER TO postgres;

--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hizli_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hizli_tokens_id_seq OWNER TO postgres;

--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hizli_tokens_id_seq OWNED BY public.hizli_tokens.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    id text NOT NULL,
    "tenantId" text,
    "partRequestId" text NOT NULL,
    product_id text NOT NULL,
    "warehouseId" text,
    quantity integer NOT NULL,
    "transactionType" public."InventoryTransactionType" DEFAULT 'DEDUCTION'::public."InventoryTransactionType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id text NOT NULL,
    email text NOT NULL,
    "tenantId" text NOT NULL,
    "invitedBy" text NOT NULL,
    token text NOT NULL,
    status public."InvitationStatus" DEFAULT 'PENDING'::public."InvitationStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "acceptedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: invoice_collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_collections (
    id text NOT NULL,
    invoice_id text NOT NULL,
    collection_id text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text
);


ALTER TABLE public.invoice_collections OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    invoice_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    discount_rate numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    withholding_code text,
    withholding_rate numeric(5,2),
    sct_rate numeric(5,2),
    sct_amount numeric(10,2),
    vat_exemption_reason text,
    unit text,
    shelf text,
    purchase_order_item_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoice_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_logs (
    id text NOT NULL,
    invoice_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoice_logs OWNER TO postgres;

--
-- Name: invoice_payment_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_payment_plans (
    id text NOT NULL,
    invoice_id text NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_type text,
    notes text,
    is_paid boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_payment_plans OWNER TO postgres;

--
-- Name: invoice_profit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_profit (
    id text NOT NULL,
    invoice_id text NOT NULL,
    invoice_item_id text,
    product_id text NOT NULL,
    "tenantId" text,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    unit_cost numeric(12,4) NOT NULL,
    total_sales_amount numeric(12,2) NOT NULL,
    total_cost numeric(12,2) NOT NULL,
    profit numeric(12,2) NOT NULL,
    profit_rate numeric(10,2) NOT NULL,
    computed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_profit OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    invoice_no text NOT NULL,
    invoice_type public."InvoiceType" NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp(3) without time zone,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    sct_total numeric(12,2) DEFAULT 0 NOT NULL,
    withholding_total numeric(12,2) DEFAULT 0 NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    foreign_total numeric(12,2),
    currency text DEFAULT 'TRY'::text NOT NULL,
    exchange_rate numeric(10,4) DEFAULT 1 NOT NULL,
    notes text,
    status public."InvoiceStatus" DEFAULT 'OPEN'::public."InvoiceStatus" NOT NULL,
    payable_amount numeric(12,2),
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    order_no text,
    purchase_order_id text,
    procurement_order_id text,
    delivery_note_id text,
    purchase_delivery_note_id text,
    einvoice_status public."EInvoiceStatus" DEFAULT 'PENDING'::public."EInvoiceStatus",
    einvoice_ettn text,
    e_scenario text,
    e_invoice_type text,
    gib_alias text,
    delivery_method text,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    sales_agent_id text,
    warehouse_id text
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id text NOT NULL,
    "tenantId" text,
    "referenceType" text NOT NULL,
    "referenceId" text NOT NULL,
    "serviceInvoiceId" text,
    "entryDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entry_lines (
    id text NOT NULL,
    "journalEntryId" text NOT NULL,
    "accountCode" text NOT NULL,
    "accountName" text NOT NULL,
    debit numeric(12,2) DEFAULT 0 NOT NULL,
    credit numeric(12,2) DEFAULT 0 NOT NULL,
    description text
);


ALTER TABLE public.journal_entry_lines OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    layer integer NOT NULL,
    corridor text NOT NULL,
    side integer NOT NULL,
    section integer NOT NULL,
    level integer NOT NULL,
    code text NOT NULL,
    barcode text NOT NULL,
    name text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: module_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_licenses (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    "moduleId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.module_licenses OWNER TO postgres;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: order_pickings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_pickings (
    id text NOT NULL,
    order_id text NOT NULL,
    order_item_id text NOT NULL,
    location_id text NOT NULL,
    quantity integer NOT NULL,
    picked_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_pickings OWNER TO postgres;

--
-- Name: part_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.part_requests (
    id text NOT NULL,
    "tenantId" text,
    "workOrderId" text NOT NULL,
    "requestedBy" text NOT NULL,
    description text NOT NULL,
    product_id text,
    "requestedQty" integer DEFAULT 1 NOT NULL,
    "suppliedQty" integer,
    status public."PartRequestStatus" DEFAULT 'REQUESTED'::public."PartRequestStatus" NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "suppliedBy" text,
    "suppliedAt" timestamp(3) without time zone,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.part_requests OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "iyzicoPaymentId" text,
    "iyzicoToken" text,
    "conversationId" text,
    "invoiceNumber" text,
    "invoiceUrl" text,
    "paidAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "refundedAt" timestamp(3) without time zone,
    "errorCode" text,
    "errorMessage" text,
    "paymentMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "billingPeriod" public."BillingPeriod" DEFAULT 'MONTHLY'::public."BillingPeriod" NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    "baseUserLimit" integer DEFAULT 1 NOT NULL,
    features jsonb,
    limits jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPopular" boolean DEFAULT false NOT NULL,
    "isBasePlan" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: pos_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_payments (
    id text NOT NULL,
    invoice_id text NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    amount numeric(12,2) NOT NULL,
    change numeric(12,2),
    gift_card_id text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" text,
    created_by text,
    updated_by text
);


ALTER TABLE public.pos_payments OWNER TO postgres;

--
-- Name: pos_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_sessions (
    id text NOT NULL,
    session_no text NOT NULL,
    cashier_id text NOT NULL,
    cashbox_id text NOT NULL,
    opening_amount numeric(12,2) NOT NULL,
    closing_amount numeric(12,2),
    closing_notes text,
    status public."PosSessionStatus" NOT NULL,
    opened_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" text,
    created_by text,
    updated_by text
);


ALTER TABLE public.pos_sessions OWNER TO postgres;

--
-- Name: postal_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postal_codes (
    id text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    neighborhood text NOT NULL,
    "postalCode" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.postal_codes OWNER TO postgres;

--
-- Name: price_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_cards (
    id text NOT NULL,
    product_id text NOT NULL,
    type public."PriceCardType" NOT NULL,
    price numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    effective_from timestamp(3) without time zone,
    effective_to timestamp(3) without time zone,
    note text,
    created_by text,
    updated_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_cards OWNER TO postgres;

--
-- Name: price_list_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list_items (
    id text NOT NULL,
    price_list_id text NOT NULL,
    product_id text NOT NULL,
    price numeric(12,2) NOT NULL,
    discount_rate numeric(5,2) DEFAULT 0,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_list_items OWNER TO postgres;

--
-- Name: price_lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_lists (
    id text NOT NULL,
    name text NOT NULL,
    "tenantId" text,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_lists OWNER TO postgres;

--
-- Name: procurement_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurement_orders (
    id text NOT NULL,
    order_no text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    status public."PurchaseOrderLocalStatus" DEFAULT 'PENDING'::public."PurchaseOrderLocalStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    due_date timestamp(3) without time zone,
    invoice_no text,
    created_by text,
    updated_by text,
    deleted_by text,
    deleted_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deliveryNoteId" text
);


ALTER TABLE public.procurement_orders OWNER TO postgres;

--
-- Name: product_barcodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_barcodes (
    id text NOT NULL,
    "productId" text NOT NULL,
    barcode text NOT NULL,
    symbology text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_barcodes OWNER TO postgres;

--
-- Name: product_equivalents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_equivalents (
    id text NOT NULL,
    product1_id text NOT NULL,
    product2_id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_equivalents OWNER TO postgres;

--
-- Name: product_location_stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_location_stocks (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    "locationId" text NOT NULL,
    "productId" text NOT NULL,
    "qtyOnHand" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_location_stocks OWNER TO postgres;

--
-- Name: product_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_movements (
    id text NOT NULL,
    product_id text NOT NULL,
    movement_type public."MovementType" NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "warehouseId" text,
    invoice_item_id text,
    "tenantId" text
);


ALTER TABLE public.product_movements OWNER TO postgres;

--
-- Name: product_shelves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_shelves (
    id text NOT NULL,
    product_id text NOT NULL,
    shelf_id text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_shelves OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    code text NOT NULL,
    "tenantId" text,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    vat_rate integer DEFAULT 20 NOT NULL,
    critical_qty integer DEFAULT 0 NOT NULL,
    category text,
    main_category text,
    sub_category text,
    brand text,
    model text,
    oem text,
    size text,
    shelf text,
    barcode text,
    supplier_code text,
    equivalency_group_id text,
    vehicle_brand text,
    vehicle_model text,
    vehicle_engine_size text,
    vehicle_fuel_type text,
    is_category_only boolean DEFAULT false,
    is_brand_only boolean DEFAULT false,
    weight numeric(12,4),
    weight_unit text,
    dimensions text,
    country_of_origin text,
    warranty_months integer,
    internal_note text,
    min_order_qty integer,
    lead_time_days integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    unit_id text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: purchase_delivery_note_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_delivery_note_items (
    id text NOT NULL,
    "tenantId" text,
    delivery_note_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_delivery_note_items OWNER TO postgres;

--
-- Name: purchase_delivery_note_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_delivery_note_logs (
    id text NOT NULL,
    "tenantId" text,
    delivery_note_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_delivery_note_logs OWNER TO postgres;

--
-- Name: purchase_delivery_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_delivery_notes (
    id text NOT NULL,
    delivery_note_no text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    warehouse_id text,
    source_type public."DeliveryNoteSourceType" NOT NULL,
    source_id text,
    status public."DeliveryNoteStatus" DEFAULT 'NOT_INVOICED'::public."DeliveryNoteStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by text,
    updated_by text,
    deleted_by text,
    deleted_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_delivery_notes OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id text NOT NULL,
    purchase_order_id text NOT NULL,
    product_id text NOT NULL,
    ordered_quantity integer NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    status public."OrderItemStatus" DEFAULT 'PENDING'::public."OrderItemStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_order_local_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_local_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    delivered_quantity integer DEFAULT 0 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_order_local_items OWNER TO postgres;

--
-- Name: purchase_order_local_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_local_logs (
    id text NOT NULL,
    order_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_order_local_logs OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "tenantId" text,
    supplier_id text NOT NULL,
    order_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_delivery_date timestamp(3) without time zone,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_items (
    id text NOT NULL,
    quote_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    discount_rate numeric(5,2),
    discount_amount numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quote_items OWNER TO postgres;

--
-- Name: quote_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_logs (
    id text NOT NULL,
    quote_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quote_logs OWNER TO postgres;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotes (
    id text NOT NULL,
    quote_no text NOT NULL,
    "tenantId" text,
    quote_type public."QuoteType" NOT NULL,
    account_id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until timestamp(3) without time zone,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    notes text,
    status public."QuoteStatus" DEFAULT 'OFFERED'::public."QuoteStatus" NOT NULL,
    order_id text,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotes OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isSystemRole" boolean DEFAULT false NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: salary_payment_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_payment_details (
    id text NOT NULL,
    "tenantId" text,
    salary_payment_id text NOT NULL,
    cashbox_id text,
    bank_account_id text,
    amount numeric(12,2) NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    reference_no text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.salary_payment_details OWNER TO postgres;

--
-- Name: salary_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_payments (
    id text NOT NULL,
    "tenantId" text,
    employee_id text NOT NULL,
    plan_id text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    payment_date timestamp(3) without time zone,
    status public."SalaryStatus" DEFAULT 'PENDING'::public."SalaryStatus" NOT NULL,
    notes text,
    created_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.salary_payments OWNER TO postgres;

--
-- Name: salary_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_plans (
    id text NOT NULL,
    "tenantId" text,
    employee_id text NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    salary numeric(10,2) NOT NULL,
    bonus numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    status public."SalaryStatus" DEFAULT 'UNPAID'::public."SalaryStatus" NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
    remaining_amount numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.salary_plans OWNER TO postgres;

--
-- Name: sales_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_agents (
    id text NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    is_active boolean DEFAULT true NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales_agents OWNER TO postgres;

--
-- Name: sales_delivery_note_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_delivery_note_items (
    id text NOT NULL,
    "tenantId" text,
    delivery_note_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    invoiced_quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales_delivery_note_items OWNER TO postgres;

--
-- Name: sales_delivery_note_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_delivery_note_logs (
    id text NOT NULL,
    delivery_note_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sales_delivery_note_logs OWNER TO postgres;

--
-- Name: sales_delivery_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_delivery_notes (
    id text NOT NULL,
    delivery_note_no text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    warehouse_id text,
    source_type public."DeliveryNoteSourceType" NOT NULL,
    source_id text,
    status public."DeliveryNoteStatus" DEFAULT 'NOT_INVOICED'::public."DeliveryNoteStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales_delivery_notes OWNER TO postgres;

--
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_order_items (
    id text NOT NULL,
    "tenantId" text,
    order_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    vat_rate integer NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    delivered_quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales_order_items OWNER TO postgres;

--
-- Name: sales_order_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_order_logs (
    id text NOT NULL,
    order_id text NOT NULL,
    user_id text,
    action_type public."LogAction" NOT NULL,
    changes text,
    ip_address text,
    user_agent text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sales_order_logs OWNER TO postgres;

--
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_orders (
    id text NOT NULL,
    order_no text NOT NULL,
    type public."OrderType" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    account_id text NOT NULL,
    status public."SalesOrderStatus" DEFAULT 'PENDING'::public."SalesOrderStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    due_date timestamp(3) without time zone,
    invoice_no text,
    created_by text,
    updated_by text,
    deleted_by text,
    deleted_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deliveryNoteId" text
);


ALTER TABLE public.sales_orders OWNER TO postgres;

--
-- Name: service_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_invoices (
    id text NOT NULL,
    "tenantId" text,
    "invoiceNo" text NOT NULL,
    "workOrderId" text NOT NULL,
    account_id text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    subtotal numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "grandTotal" numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.service_invoices OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "refreshToken" text,
    "ipAddress" text,
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: shelves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shelves (
    id text NOT NULL,
    warehouse_id text NOT NULL,
    code text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shelves OWNER TO postgres;

--
-- Name: simple_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simple_orders (
    id text NOT NULL,
    "tenantId" text,
    company_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    status public."SimpleOrderStatus" DEFAULT 'AWAITING_APPROVAL'::public."SimpleOrderStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    supplied_quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.simple_orders OWNER TO postgres;

--
-- Name: stock_cost_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_cost_history (
    id text NOT NULL,
    product_id text NOT NULL,
    cost numeric(12,4) NOT NULL,
    method text DEFAULT 'WEIGHTED_AVERAGE'::text NOT NULL,
    computed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    brand text,
    main_category text,
    sub_category text,
    note text
);


ALTER TABLE public.stock_cost_history OWNER TO postgres;

--
-- Name: stock_moves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_moves (
    id text NOT NULL,
    "productId" text NOT NULL,
    "fromWarehouseId" text,
    "fromLocationId" text,
    "toWarehouseId" text NOT NULL,
    "toLocationId" text NOT NULL,
    qty integer NOT NULL,
    "moveType" public."StockMoveType" NOT NULL,
    "refType" text,
    "refId" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public.stock_moves OWNER TO postgres;

--
-- Name: stocktake_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocktake_items (
    id text NOT NULL,
    stocktake_id text NOT NULL,
    product_id text NOT NULL,
    location_id text,
    system_quantity integer NOT NULL,
    counted_quantity integer NOT NULL,
    difference integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stocktake_items OWNER TO postgres;

--
-- Name: stocktakes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocktakes (
    id text NOT NULL,
    stocktake_no text NOT NULL,
    "tenantId" text,
    stocktake_type public."StocktakeType" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."StocktakeStatus" DEFAULT 'DRAFT'::public."StocktakeStatus" NOT NULL,
    notes text,
    created_by text,
    updated_by text,
    approved_by text,
    approval_date timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stocktakes OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "planId" text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'TRIAL'::public."SubscriptionStatus" NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "trialEndsAt" timestamp(3) without time zone,
    "canceledAt" timestamp(3) without time zone,
    "nextBillingDate" timestamp(3) without time zone,
    "lastBillingDate" timestamp(3) without time zone,
    "autoRenew" boolean DEFAULT true NOT NULL,
    "iyzicoSubscriptionRef" text,
    "additionalUsers" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: system_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_parameters (
    id text NOT NULL,
    "tenantId" text,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    category text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_parameters OWNER TO postgres;

--
-- Name: tenant_purge_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_purge_audits (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "adminId" text NOT NULL,
    "adminEmail" text NOT NULL,
    "ipAddress" text NOT NULL,
    "deletedFiles" integer DEFAULT 0 NOT NULL,
    errors jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenant_purge_audits OWNER TO postgres;

--
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_settings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "companyName" text,
    "taxNumber" text,
    address text,
    "logoUrl" text,
    features jsonb,
    limits jsonb,
    timezone text DEFAULT 'Europe/Istanbul'::text NOT NULL,
    locale text DEFAULT 'tr-TR'::text NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    city text,
    "companyType" text DEFAULT 'COMPANY'::text,
    country text,
    district text,
    email text,
    "firstName" text,
    "lastName" text,
    "mersisNo" text,
    neighborhood text,
    phone text,
    "postalCode" text,
    "taxOffice" text,
    "tcNo" text,
    website text
);


ALTER TABLE public.tenant_settings OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    uuid text NOT NULL,
    name text NOT NULL,
    subdomain text,
    domain text,
    status public."TenantStatus" DEFAULT 'TRIAL'::public."TenantStatus" NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "purgedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantType" public."TenantType" DEFAULT 'CORPORATE'::public."TenantType" NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: unit_sets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_sets (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.unit_sets OWNER TO postgres;

--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id text NOT NULL,
    unit_set_id text NOT NULL,
    name text NOT NULL,
    code text,
    conversion_rate numeric(12,4) DEFAULT 1 NOT NULL,
    is_base_unit boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: user_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_licenses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "licenseType" public."LicenseType" NOT NULL,
    "moduleId" text,
    "assignedBy" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "revokedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_licenses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    uuid text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    "fullName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    department text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "refreshToken" text,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "tenantId" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vehicle_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_catalog (
    id text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    engine_volume text NOT NULL,
    fuel_type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vehicle_catalog OWNER TO postgres;

--
-- Name: vehicle_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_expenses (
    id text NOT NULL,
    "tenantId" text,
    "vehicleId" text NOT NULL,
    expense_type public."VehicleExpenseType" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount numeric(12,2) NOT NULL,
    notes text,
    document_no text,
    mileage integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.vehicle_expenses OWNER TO postgres;

--
-- Name: warehouse_critical_stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_critical_stocks (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    "productId" text NOT NULL,
    "criticalQty" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouse_critical_stocks OWNER TO postgres;

--
-- Name: warehouse_transfer_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfer_items (
    id text NOT NULL,
    "transferId" text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    "fromLocationId" text,
    "toLocationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.warehouse_transfer_items OWNER TO postgres;

--
-- Name: warehouse_transfer_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfer_logs (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.warehouse_transfer_logs OWNER TO postgres;

--
-- Name: warehouse_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfers (
    id text NOT NULL,
    "transferNo" text NOT NULL,
    "tenantId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fromWarehouseId" text NOT NULL,
    "toWarehouseId" text NOT NULL,
    status public."TransferStatus" DEFAULT 'PREPARING'::public."TransferStatus" NOT NULL,
    "driverName" text,
    "vehiclePlate" text,
    notes text,
    prepared_by_id text,
    approved_by_id text,
    received_by_id text,
    shipping_date timestamp(3) without time zone,
    delivery_date timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouse_transfers OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id text NOT NULL,
    code text NOT NULL,
    "tenantId" text,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    address text,
    phone text,
    manager text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: work_order_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_activities (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    action text NOT NULL,
    "userId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.work_order_activities OWNER TO postgres;

--
-- Name: work_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_items (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    type public."WorkOrderItemType" NOT NULL,
    description text NOT NULL,
    product_id text,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "taxRate" integer DEFAULT 20 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.work_order_items OWNER TO postgres;

--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_orders (
    id text NOT NULL,
    "workOrderNo" text NOT NULL,
    "tenantId" text,
    status public."WorkOrderStatus" DEFAULT 'WAITING_DIAGNOSIS'::public."WorkOrderStatus" NOT NULL,
    "partWorkflowStatus" public."PartWorkflowStatus" DEFAULT 'NOT_STARTED'::public."PartWorkflowStatus" NOT NULL,
    "vehicleWorkflowStatus" public."VehicleWorkflowStatus" DEFAULT 'WAITING'::public."VehicleWorkflowStatus" NOT NULL,
    "customerVehicleId" text NOT NULL,
    account_id text NOT NULL,
    "technicianId" text,
    description text,
    "diagnosisNotes" text,
    "supplyResponseNotes" text,
    "estimatedCompletionDate" timestamp(3) without time zone,
    "actualCompletionDate" timestamp(3) without time zone,
    "totalLaborCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalPartsCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "grandTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.work_orders OWNER TO postgres;

--
-- Name: einvoice_inbox id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.einvoice_inbox ALTER COLUMN id SET DEFAULT nextval('public.einvoice_inbox_id_seq'::regclass);


--
-- Name: hizli_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hizli_tokens ALTER COLUMN id SET DEFAULT nextval('public.hizli_tokens_id_seq'::regclass);


--
-- Data for Name: account_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_addresses (id, account_id, title, type, address, city, district, postal_code, is_default, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: account_banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_banks (id, account_id, bank_name, branch_name, branch_code, account_no, iban, currency, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: account_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_contacts (id, account_id, full_name, title, phone, email, extension, is_default, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: account_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_movements (id, account_id, type, amount, balance, document_type, document_no, date, notes, "createdAt", "updatedAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, code, "tenantId", title, type, company_type, tax_number, tax_office, national_id, full_name, phone, email, country, city, district, address, contact_name, balance, payment_term_days, is_active, "createdAt", "updatedAt", sales_agent_id, credit_limit, credit_status, collateral_amount, sector, custom_code1, custom_code2, website, fax, due_days, currency, bank_info, price_list_id) FROM stdin;
1fabc8c3-4a3b-48cc-8f4b-5623a253cc53	MUS001	\N	Ahmet Yılmaz	CUSTOMER	INDIVIDUAL	12345678901	İstanbul Vergi Dairesi	\N	Ahmet Yılmaz	5551234567	ahmet.yilmaz@example.com	Turkey	İstanbul	\N	İstanbul, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.426	2026-03-07 20:41:51.426	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e0faef9b-f336-41ae-861e-1dec4846eddd	MUS002	\N	Mehmet Demir	CUSTOMER	INDIVIDUAL	98765432109	Ankara Vergi Dairesi	\N	Mehmet Demir	5552345678	mehmet.demir@example.com	Turkey	Ankara	\N	Ankara, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.436	2026-03-07 20:41:51.436	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
96340f83-394d-42e8-9181-03b4507c9cf7	MUS003	\N	Ayşe Kaya	CUSTOMER	INDIVIDUAL	45678912301	İzmir Vergi Dairesi	\N	Ayşe Kaya	55534567890	ayse.kaya@example.com	Turkey	İzmir	\N	İzmir, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.44	2026-03-07 20:41:51.44	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5e16dd8f-15a4-4ca6-b441-eb78ea2864ff	MUS004	\N	Oto Tamir Hizmetleri A.Ş.	CUSTOMER	CORPORATE	1234567890	İstanbul Vergi Dairesi	\N	\N	2124567890	info@ototamirhizmetleri.com	Turkey	İstanbul	\N	İstanbul, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.444	2026-03-07 20:41:51.444	\N	\N	NORMAL	\N	\N	\N	\N	www.ototamirhizmetleri.com	\N	\N	\N	\N	\N
9aa1027a-5bac-4875-b830-206aa55ec0b4	MUS005	\N	Yıldız Oto Yedek Parça Ltd. Şti.	CUSTOMER	CORPORATE	9876543210	Bursa Vergi Dairesi	\N	\N	2241234567	satis@yildizotoyedek.com	Turkey	Bursa	\N	Bursa, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.449	2026-03-07 20:41:51.449	\N	\N	NORMAL	\N	\N	\N	\N	www.yildizotoyedek.com	\N	\N	\N	\N	\N
5449e26f-d81c-4a4f-9f28-67c24068dbe2	TED001	\N	Bosch Türkiye	SUPPLIER	CORPORATE	1112223330	İstanbul Vergi Dairesi	\N	\N	2125555555	satis@bosch-turkey.com	Turkey	İstanbul	\N	İstanbul, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.453	2026-03-07 20:41:51.453	\N	\N	NORMAL	\N	\N	\N	\N	www.bosch.com.tr	\N	\N	\N	\N	\N
f64842ce-a837-475e-96db-94db3dea012e	TED002	\N	TRW Otomotiv	SUPPLIER	CORPORATE	2223334440	Kocaeli Vergi Dairesi	\N	\N	2621234567	tedarik@trw-oto.com	Turkey	Kocaeli	\N	Kocaeli, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.456	2026-03-07 20:41:51.456	\N	\N	NORMAL	\N	\N	\N	\N	www.trw.com	\N	\N	\N	\N	\N
e00858b2-db2f-4500-a06a-5334831f7e11	TED003	\N	Mann Filter Türkiye	SUPPLIER	CORPORATE	3334445550	Bursa Vergi Dairesi	\N	\N	2249876543	sales@mann-filter-tr.com	Turkey	Bursa	\N	Bursa, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.46	2026-03-07 20:41:51.46	\N	\N	NORMAL	\N	\N	\N	\N	www.mann-filter.com	\N	\N	\N	\N	\N
0a48ac75-bc8c-4fe7-b01b-bc98f8837aa3	TED004	\N	Valeo Türkiye	SUPPLIER	CORPORATE	4445556660	Sakarya Vergi Dairesi	\N	\N	2641234567	info@valeo-turkey.com	Turkey	Sakarya	\N	Sakarya, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.463	2026-03-07 20:41:51.463	\N	\N	NORMAL	\N	\N	\N	\N	www.valeo.com	\N	\N	\N	\N	\N
440e3c52-6b95-4fbf-9fbf-7cd76efe2b68	TED005	\N	NGK Türkiye	SUPPLIER	CORPORATE	5556667770	Manisa Vergi Dairesi	\N	\N	2362345678	orders@ngk-turkey.com	Turkey	Manisa	\N	Manisa, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.466	2026-03-07 20:41:51.466	\N	\N	NORMAL	\N	\N	\N	\N	www.ngk.com.tr	\N	\N	\N	\N	\N
180ac732-8b3f-4199-81dc-7e88ee9bd7b7	TED006	\N	Brembo Türkiye	SUPPLIER	CORPORATE	6667778880	İstanbul Vergi Dairesi	\N	\N	2123456789	turkey@brembo.com	Turkey	İstanbul	\N	İstanbul, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.47	2026-03-07 20:41:51.47	\N	\N	NORMAL	\N	\N	\N	\N	www.brembo.com	\N	\N	\N	\N	\N
0ca050d2-c4b2-4ff0-9a2f-60fdcedef130	TED007	\N	Continental Türkiye	SUPPLIER	CORPORATE	7778889990	Ankara Vergi Dairesi	\N	\N	3121234567	sales@continental-tr.com	Turkey	Ankara	\N	Ankara, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.473	2026-03-07 20:41:51.473	\N	\N	NORMAL	\N	\N	\N	\N	www.continental.com	\N	\N	\N	\N	\N
c9df17c4-3b84-4804-8869-cd603294c2ac	TED008	\N	Sachs Türkiye	SUPPLIER	CORPORATE	8889990000	Kocaeli Vergi Dairesi	\N	\N	2629876543	info@sachs-turkey.com	Turkey	Kocaeli	\N	Kocaeli, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.476	2026-03-07 20:41:51.476	\N	\N	NORMAL	\N	\N	\N	\N	www.sachs.com	\N	\N	\N	\N	\N
f02eec11-0293-486f-beb5-0a85cd270384	TED009	\N	Denso Türkiye	SUPPLIER	CORPORATE	9990001110	Bursa Vergi Dairesi	\N	\N	2243456789	orders@denso-turkey.com	Turkey	Bursa	\N	Bursa, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.479	2026-03-07 20:41:51.479	\N	\N	NORMAL	\N	\N	\N	\N	www.denso.com.tr	\N	\N	\N	\N	\N
ad16820a-fe8f-498e-a116-61fa39fa8b2f	TED010	\N	Gates Türkiye	SUPPLIER	CORPORATE	0001112220	İstanbul Vergi Dairesi	\N	\N	2161234567	sales@gates-turkey.com	Turkey	İstanbul	\N	İstanbul, Türkiye	\N	0.00	\N	t	2026-03-07 20:41:51.482	2026-03-07 20:41:51.482	\N	\N	NORMAL	\N	\N	\N	\N	www.gates.com	\N	\N	\N	\N	\N
\.


--
-- Data for Name: advance_settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advance_settlements (id, "tenantId", advance_id, salary_plan_id, amount, date, description) FROM stdin;
\.


--
-- Data for Name: advances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advances (id, "tenantId", employee_id, cashbox_id, date, amount, settled_amount, remaining_amount, notes, status, created_by, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", "tenantId", action, resource, "resourceId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_account_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_account_movements (id, bank_account_id, movement_type, movement_sub_type, amount, commission_rate, commission_amount, net_amount, balance, notes, reference_no, account_id, date, "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, bank_id, code, name, account_no, iban, type, balance, is_active, commission_rate, credit_limit, used_credit_limit, card_limit, statement_day, payment_due_day, terminal_no, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bank_loan_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_loan_plans (id, loan_id, installment_no, due_date, amount, paid_amount, status, "tenantId") FROM stdin;
\.


--
-- Data for Name: bank_loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_loans (id, bank_account_id, amount, total_repayment, total_interest, installment_count, start_date, notes, loan_type, status, annual_interest_rate, payment_frequency, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bank_transfer_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_transfer_logs (id, bank_transfer_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_transfers (id, "tenantId", transfer_type, cashbox_id, account_id, amount, date, notes, reference_no, sender, receiver, created_by, updated_by, deleted_at, deleted_by, "createdAt", "updatedAt", bank_account_id) FROM stdin;
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, "tenantId", name, branch, city, contact_name, phone, logo, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cashbox_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashbox_movements (id, cashbox_id, movement_type, amount, commission_amount, bsmv_amount, net_amount, balance, document_type, document_no, account_id, notes, date, is_transferred, transfer_date, created_by, "createdAt") FROM stdin;
\.


--
-- Data for Name: cashboxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashboxes (id, code, "tenantId", name, type, balance, is_active, "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: check_bill_journal_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_bill_journal_items (id, journal_id, check_bill_id, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: check_bill_journals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_bill_journals (id, journal_no, type, date, account_id, notes, "tenantId", created_by_id, "createdAt", "updatedAt", bank_account_id) FROM stdin;
\.


--
-- Data for Name: check_bill_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_bill_logs (id, check_bill_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: checks_bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checks_bills (id, "tenantId", type, portfolio_type, account_id, amount, remaining_amount, due_date, bank, branch, account_no, check_no, serial_no, status, collection_date, collection_cashbox_id, is_endorsed, endorsement_date, endorsed_to, notes, created_by, updated_by, deleted_at, deleted_by, "createdAt", "updatedAt", last_journal_id) FROM stdin;
\.


--
-- Data for Name: code_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.code_templates (id, "tenantId", module, name, prefix, "digitCount", "currentValue", "includeYear", "isActive", "createdAt", "updatedAt") FROM stdin;
668f3170-9992-4358-abd1-55875e58bc0b	cmmg5gp2v0007vmr8dgnfw7bu	WAREHOUSE	Depo Kodu	D	3	0	f	t	2026-03-07 19:41:29.067	2026-03-07 19:41:29.067
30afbf33-aa28-47d5-9087-f910952c5e54	cmmg5gp2v0007vmr8dgnfw7bu	CASHBOX	Kasa Kodu	K	3	0	f	t	2026-03-07 19:41:29.138	2026-03-07 19:41:29.138
c21a95d8-6560-4241-b5a3-e3aecd4b8604	cmmg5gp2v0007vmr8dgnfw7bu	PERSONNEL	Personel Kodu	P	4	0	f	t	2026-03-07 19:41:29.164	2026-03-07 19:41:29.164
465d4ba5-b2f1-4c4c-a0f1-b871edc50e26	cmmg5gp2v0007vmr8dgnfw7bu	CUSTOMER	Cari Kodu	C	4	0	f	t	2026-03-07 19:41:29.39	2026-03-07 19:41:29.39
8e2b3055-83c5-451b-bceb-5c366d08894a	cmmg5gp2v0007vmr8dgnfw7bu	INVOICE_PURCHASE	Alış Fatura No	AF	6	0	f	t	2026-03-07 19:41:29.431	2026-03-07 19:41:29.431
0fc990db-e7a2-4097-b398-2acf53f6d85c	cmmg5gp2v0007vmr8dgnfw7bu	ORDER_SALES	Satış Sipariş No	SS	6	0	f	t	2026-03-07 19:41:29.452	2026-03-07 19:41:29.452
6e176a5d-f253-4d1c-b6b5-64a9976cadcd	cmmg5gp2v0007vmr8dgnfw7bu	ORDER_PURCHASE	Satın Alma Sipariş No	SAS	6	0	f	t	2026-03-07 19:41:29.471	2026-03-07 19:41:29.471
4debde42-2680-4d95-96f5-99f51f2d9851	cmmg5gp2v0007vmr8dgnfw7bu	INVENTORY_COUNT	Sayım Kodu	SY	4	0	f	t	2026-03-07 19:41:29.491	2026-03-07 19:41:29.491
ef751b06-4aee-48a5-8c2c-1ee5a937c975	cmmg5gp2v0007vmr8dgnfw7bu	QUOTE	Teklif No	TK	6	0	f	t	2026-03-07 19:41:29.512	2026-03-07 19:41:29.512
f57c8168-4afb-4e52-b7f1-a22e364b13b9	cmmg5gp2v0007vmr8dgnfw7bu	DELIVERY_NOTE_SALES	Satış İrsaliye No	SI	6	0	f	t	2026-03-07 19:41:29.532	2026-03-07 19:41:29.532
a41b04e9-9f40-491d-803f-90236d4477f6	cmmg5gp2v0007vmr8dgnfw7bu	DELIVERY_NOTE_PURCHASE	Alış İrsaliye No	AI	6	0	f	t	2026-03-07 19:41:29.556	2026-03-07 19:41:29.556
7a19d824-7662-4c49-9f42-55d796f77802	cmmg5gp2v0007vmr8dgnfw7bu	TECHNICIAN	Teknisyen Kodu	T	3	0	f	t	2026-03-07 19:41:29.581	2026-03-07 19:41:29.581
2b2f9bb0-63c2-48c8-a39a-c29789f5606b	cmmg5gp2v0007vmr8dgnfw7bu	WORK_ORDER	İş Emri No	IE	5	0	f	t	2026-03-07 19:41:29.606	2026-03-07 19:41:29.606
06a4b4fb-181c-4d5a-8284-fb847afe3747	cmmg5gp2v0007vmr8dgnfw7bu	SERVICE_INVOICE	Servis Fatura No	SF	6	0	f	t	2026-03-07 19:41:29.631	2026-03-07 19:41:29.631
5da62ecc-ec82-46ef-85ca-a9dd1bfbeab1	cmmg5gp2v0007vmr8dgnfw7bu	WAREHOUSE_TRANSFER	Depo Transfer No	DT	6	0	f	t	2026-03-07 19:45:40.498	2026-03-07 19:45:40.498
a2350568-e610-45fa-b24c-cd8fd18c9253	cmmg5gp2v0007vmr8dgnfw7bu	INVOICE_SALES	Satış Fatura No	AZM	9	8	t	t	2026-03-07 19:41:29.411	2026-03-07 19:59:14.418
84423f27-4ab2-44a3-9095-9a2093a0c7cb	cmmg5gp2v0007vmr8dgnfw7bu	PRODUCT	Ürün Kodu	ST	4	5	f	t	2026-03-07 19:41:29.188	2026-03-07 20:37:41.001
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, "tenantId", account_id, invoice_id, service_invoice_id, type, amount, date, payment_type, cashbox_id, bank_account_id, company_credit_card_id, notes, created_by, deleted_at, deleted_by, "createdAt", "updatedAt", sales_agent_id) FROM stdin;
\.


--
-- Data for Name: company_credit_card_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_credit_card_movements (id, card_id, amount, balance, notes, account_id, reference_no, date, "createdAt") FROM stdin;
\.


--
-- Data for Name: company_credit_card_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_credit_card_reminders (id, card_id, type, day, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_credit_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_credit_cards (id, cashbox_id, code, name, bank_name, card_type, last_four_digits, credit_limit, balance, is_active, "createdAt", "updatedAt", statement_date, payment_due_date) FROM stdin;
\.


--
-- Data for Name: company_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_vehicles (id, "tenantId", plate, brand, model, year, chassis_no, engine_no, registration_date, vehicle_type, fuel_type, is_active, assigned_employee_id, registration_image_url, notes, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_vehicles (id, "tenantId", account_id, plate, brand, model, year, chassis_no, engine_power, engine_size, fuel_type, transmission, color, registration_date, registration_no, registration_owner, mileage, notes, service_status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deleted_bank_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deleted_bank_transfers (id, original_id, transfer_type, cashbox_id, cashbox_name, account_id, account_name, amount, date, notes, reference_no, sender, receiver, original_created_by, original_updated_by, original_created_at, original_updated_at, deleted_by, deleted_at, delete_reason) FROM stdin;
\.


--
-- Data for Name: deleted_checks_bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deleted_checks_bills (id, original_id, type, portfolio_type, account_id, account_name, amount, due_date, bank, branch, account_no, check_no, serial_no, status, collection_date, collection_cashbox_id, is_endorsed, endorsement_date, endorsed_to, notes, original_created_by, original_updated_by, original_created_at, original_updated_at, deleted_by, deleted_at, delete_reason) FROM stdin;
\.


--
-- Data for Name: einvoice_inbox; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.einvoice_inbox (id, ettn, "senderVkn", "senderTitle", "invoiceNo", "invoiceDate", "rawXml", "createdAt") FROM stdin;
\.


--
-- Data for Name: einvoice_xml; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.einvoice_xml (id, invoice_id, xml_data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employee_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_payments (id, employee_id, type, amount, date, period, notes, cashbox_id, created_by, "createdAt") FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, employee_code, "tenantId", identity_number, first_name, last_name, birth_date, gender, marital_status, phone, email, address, city, district, "position", department, start_date, end_date, is_active, salary, salary_day, social_security_no, iban, balance, notes, created_by, updated_by, "createdAt", "updatedAt", bonus) FROM stdin;
\.


--
-- Data for Name: equivalency_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equivalency_groups (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_categories (id, name, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, "tenantId", category_id, notes, amount, date, payment_type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: hizli_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hizli_tokens (id, token, "loginHash", "generatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, "tenantId", "partRequestId", product_id, "warehouseId", quantity, "transactionType", "createdAt") FROM stdin;
\.


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitations (id, email, "tenantId", "invitedBy", token, status, "expiresAt", "acceptedAt", "acceptedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_collections (id, invoice_id, collection_id, amount, "createdAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, invoice_id, product_id, quantity, unit_price, vat_rate, vat_amount, amount, discount_rate, discount_amount, withholding_code, withholding_rate, sct_rate, sct_amount, vat_exemption_reason, unit, shelf, purchase_order_item_id, "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_logs (id, invoice_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice_payment_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_payment_plans (id, invoice_id, due_date, amount, payment_type, notes, is_paid, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_profit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_profit (id, invoice_id, invoice_item_id, product_id, "tenantId", quantity, unit_price, unit_cost, total_sales_amount, total_cost, profit, profit_rate, computed_at, "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_no, invoice_type, "tenantId", account_id, date, due_date, discount, total_amount, vat_amount, sct_total, withholding_total, grand_total, foreign_total, currency, exchange_rate, notes, status, payable_amount, paid_amount, order_no, purchase_order_id, procurement_order_id, delivery_note_id, purchase_delivery_note_id, einvoice_status, einvoice_ettn, e_scenario, e_invoice_type, gib_alias, delivery_method, created_by, updated_by, deleted_at, deleted_by, "createdAt", "updatedAt", sales_agent_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, "tenantId", "referenceType", "referenceId", "serviceInvoiceId", "entryDate", description, "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: journal_entry_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entry_lines (id, "journalEntryId", "accountCode", "accountName", debit, credit, description) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, "warehouseId", layer, corridor, side, section, level, code, barcode, name, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: module_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_licenses (id, "subscriptionId", "moduleId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, slug, description, price, currency, "isActive", "createdAt", "updatedAt") FROM stdin;
cmmg5gp2n0004vmr8a0np6j3y	Ek Kullanıcı	additional-user	Ek kullanıcı lisansı - Her ek kullanıcı için yıllık	1435.00	TRY	t	2026-03-07 09:57:37.392	2026-03-07 09:57:37.392
cmmg5gp2r0005vmr8rqol7ul1	Depo Yönetimi Modülü	warehouse-module	Gelişmiş depo yönetimi özellikleri	2870.00	TRY	t	2026-03-07 09:57:37.395	2026-03-07 09:57:37.395
cmmg5gp2t0006vmr8xffl128y	Gelişmiş Raporlama Modülü	advanced-reporting	Gelişmiş raporlama ve analiz özellikleri	1435.00	TRY	t	2026-03-07 09:57:37.397	2026-03-07 09:57:37.397
\.


--
-- Data for Name: order_pickings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_pickings (id, order_id, order_item_id, location_id, quantity, picked_by, "createdAt") FROM stdin;
\.


--
-- Data for Name: part_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.part_requests (id, "tenantId", "workOrderId", "requestedBy", description, product_id, "requestedQty", "suppliedQty", status, version, "suppliedBy", "suppliedAt", "usedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "subscriptionId", amount, currency, status, "iyzicoPaymentId", "iyzicoToken", "conversationId", "invoiceNumber", "invoiceUrl", "paidAt", "failedAt", "refundedAt", "errorCode", "errorMessage", "paymentMethod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module, action, description, "createdAt") FROM stdin;
39699f9e-9029-4ece-8086-4cec118b24e8	dashboard	view	dashboard module - view action	2026-03-07 20:39:41.379
271f93ea-fb2b-4133-b542-6b1a2bc55e13	dashboard	list	dashboard module - list action	2026-03-07 20:39:41.385
30cbfd22-042d-40cd-92d4-087f16c8897f	dashboard	create	dashboard module - create action	2026-03-07 20:39:41.388
4f4b2162-e65b-4020-907b-1baf4ee532ef	dashboard	update	dashboard module - update action	2026-03-07 20:39:41.39
75448ea3-0ad4-4bc1-9a71-c9176fe5e417	dashboard	delete	dashboard module - delete action	2026-03-07 20:39:41.393
835a6d1e-0558-4d22-89a6-8c6ac2d8f35d	dashboard	export	dashboard module - export action	2026-03-07 20:39:41.396
0ff96eea-690e-4181-b1f5-018915e84edc	dashboard	import	dashboard module - import action	2026-03-07 20:39:41.399
f797c3ca-7701-42c7-b97d-c75cff5a7b0d	dashboard	approve	dashboard module - approve action	2026-03-07 20:39:41.402
7f35d2b1-04d4-4960-84a7-81aa8dd1fd07	dashboard	cancel	dashboard module - cancel action	2026-03-07 20:39:41.404
e4b325ae-f792-4c33-af14-eb272de10c76	dashboard	print	dashboard module - print action	2026-03-07 20:39:41.407
64249d10-081d-4440-b464-93b02cf10160	users	view	users module - view action	2026-03-07 20:39:41.409
b45fad44-1d26-42ce-bdac-e674cd657e18	users	list	users module - list action	2026-03-07 20:39:41.411
7c3b0605-04c7-4c4c-b35f-e11aa87da37e	users	create	users module - create action	2026-03-07 20:39:41.414
e763be08-5456-4bd3-b99c-e158ffce35a7	users	update	users module - update action	2026-03-07 20:39:41.416
8a958824-2875-4f93-99fb-3df8b15bc575	users	delete	users module - delete action	2026-03-07 20:39:41.418
c38998dc-c602-4da3-812b-32a65185e66b	users	export	users module - export action	2026-03-07 20:39:41.42
7e7eb6f6-903d-44b1-b8db-0165492b5f2b	users	import	users module - import action	2026-03-07 20:39:41.423
0c5566f7-538d-4b31-88db-e0a4dbc51c23	users	approve	users module - approve action	2026-03-07 20:39:41.425
95c8a8c8-cb0e-4ff8-bc6e-f3b0599a37dd	users	cancel	users module - cancel action	2026-03-07 20:39:41.427
525d09e4-f187-4668-baee-bba8f86dd36f	users	print	users module - print action	2026-03-07 20:39:41.429
abb1280f-893e-4493-bb82-06a853d32dce	roles	view	roles module - view action	2026-03-07 20:39:41.431
fd1ddd6f-211a-4f65-afbe-a125341070f4	roles	list	roles module - list action	2026-03-07 20:39:41.434
9cd1a458-e5cf-4fbc-a775-cbcb77edd5be	roles	create	roles module - create action	2026-03-07 20:39:41.436
c9026867-5076-4740-b5a9-c827a85ca659	roles	update	roles module - update action	2026-03-07 20:39:41.438
a326e88e-6008-4516-b4c6-7e17f0095e26	roles	delete	roles module - delete action	2026-03-07 20:39:41.44
b3db7985-e4a6-4b06-a084-222349edea7b	roles	export	roles module - export action	2026-03-07 20:39:41.443
a9c00d71-8e5a-4559-8c37-e1e4db371752	roles	import	roles module - import action	2026-03-07 20:39:41.445
72a2ad24-052d-44b9-a2f7-c7523dfde948	roles	approve	roles module - approve action	2026-03-07 20:39:41.447
f10aa31a-a83e-414d-bc99-8b6d6bd94a64	roles	cancel	roles module - cancel action	2026-03-07 20:39:41.45
8f5a1820-84f1-4a33-858a-4c77bbc5f6d5	roles	print	roles module - print action	2026-03-07 20:39:41.452
7a0b7d35-e7b4-4521-b56a-2cf036b409f3	permissions	view	permissions module - view action	2026-03-07 20:39:41.454
79dd153c-1f6e-427d-ab11-26fc3208a7cd	permissions	list	permissions module - list action	2026-03-07 20:39:41.456
443c20aa-c3d2-47b2-9f20-c6c86be4ee5c	permissions	create	permissions module - create action	2026-03-07 20:39:41.459
992a8b32-d443-4812-ac6f-b456665d95fe	permissions	update	permissions module - update action	2026-03-07 20:39:41.461
c9f0ad3b-85c9-4903-b687-8de7cfef2607	permissions	delete	permissions module - delete action	2026-03-07 20:39:41.464
d3b11425-c984-49df-b4f0-568fb6b80c3c	permissions	export	permissions module - export action	2026-03-07 20:39:41.466
c1de362e-a802-4991-95a8-80f0fa6fb413	permissions	import	permissions module - import action	2026-03-07 20:39:41.468
d99aec78-3ebe-46b5-95ae-6a1777872cba	permissions	approve	permissions module - approve action	2026-03-07 20:39:41.47
01d6de90-b7e1-469c-92d5-0d8500fca5ad	permissions	cancel	permissions module - cancel action	2026-03-07 20:39:41.473
f8a7dede-ce8d-42fe-9ef7-e7be94734e49	permissions	print	permissions module - print action	2026-03-07 20:39:41.475
988e9a7a-f03f-4831-8010-6616b6bd3452	invoices	view	invoices module - view action	2026-03-07 20:39:41.477
785f3222-f7f8-473d-bb7e-47e948567dca	invoices	list	invoices module - list action	2026-03-07 20:39:41.48
fee5f457-b444-4215-b03a-bb146fcbd36c	invoices	create	invoices module - create action	2026-03-07 20:39:41.482
55340bd1-cac3-4f08-a43f-262b8570460a	invoices	update	invoices module - update action	2026-03-07 20:39:41.484
9b3e61fc-037b-42d2-b49c-dc105f196a1e	invoices	delete	invoices module - delete action	2026-03-07 20:39:41.486
4067267f-8d63-4d67-ab00-c09e3c968689	invoices	export	invoices module - export action	2026-03-07 20:39:41.488
4dce1a5f-266f-4fdc-ac8e-8aa98c62aa2d	invoices	import	invoices module - import action	2026-03-07 20:39:41.491
ef5c87e5-897e-4808-8d1d-8e72b46259ce	invoices	approve	invoices module - approve action	2026-03-07 20:39:41.493
bc92432e-c7b5-4d1a-a4a5-a8bc03f6c7f3	invoices	cancel	invoices module - cancel action	2026-03-07 20:39:41.495
55161f2f-5908-4f74-836c-045a651bba00	invoices	print	invoices module - print action	2026-03-07 20:39:41.497
942ebe4e-0d78-4c15-a506-02217827f056	cariye	view	cariye module - view action	2026-03-07 20:39:41.499
f433746f-62a7-4580-a556-5ca87b15ec63	cariye	list	cariye module - list action	2026-03-07 20:39:41.501
50d6243e-a058-4725-939c-fde677ad09c1	cariye	create	cariye module - create action	2026-03-07 20:39:41.504
cdce86d1-0a4d-4f37-a21b-64e5446d1ac9	cariye	update	cariye module - update action	2026-03-07 20:39:41.506
2a304eb6-93ba-41b1-93e8-dde97dd1805c	cariye	delete	cariye module - delete action	2026-03-07 20:39:41.509
4b01fadf-ab15-4330-8abc-cf922a6ec09e	cariye	export	cariye module - export action	2026-03-07 20:39:41.511
1128df69-234c-4302-a814-5d3da7ac2276	cariye	import	cariye module - import action	2026-03-07 20:39:41.513
c7320480-8495-4dc7-b4dc-9fc23c14c647	cariye	approve	cariye module - approve action	2026-03-07 20:39:41.515
1446c4d4-584a-4f5e-b38a-508c46fccb18	cariye	cancel	cariye module - cancel action	2026-03-07 20:39:41.518
f467f04b-4d2b-4929-968b-d0cd4a2f4dfe	cariye	print	cariye module - print action	2026-03-07 20:39:41.52
b75b5fde-c911-470c-a210-b9daa16c13ae	products	view	products module - view action	2026-03-07 20:39:41.522
b2f363b9-5b76-4883-a895-ed263f64d0cd	products	list	products module - list action	2026-03-07 20:39:41.524
dbbd18d3-0083-4392-82bb-78b65ae457d9	products	create	products module - create action	2026-03-07 20:39:41.527
107246db-3b73-4e3d-8c9b-e0733f7e6654	products	update	products module - update action	2026-03-07 20:39:41.529
548f064c-0cbe-490b-a371-e2c3e128f17e	products	delete	products module - delete action	2026-03-07 20:39:41.531
12239483-6717-436e-910c-57a3474bc93c	products	export	products module - export action	2026-03-07 20:39:41.533
a8b30a52-eba1-4318-a138-5d3eb50a0a56	products	import	products module - import action	2026-03-07 20:39:41.535
41ba512a-e6ac-4a00-a3bd-3ff6fc8c646b	products	approve	products module - approve action	2026-03-07 20:39:41.539
f2a4c856-1f13-47b0-a558-1a7d90efd387	products	cancel	products module - cancel action	2026-03-07 20:39:41.541
dfc4820b-f78b-49ad-b030-2012ce3c16ff	products	print	products module - print action	2026-03-07 20:39:41.543
e7aef756-e869-4940-ae15-a4419d574963	expenses	view	expenses module - view action	2026-03-07 20:39:41.545
b1910d22-a92d-4405-b3d8-c4135788c436	expenses	list	expenses module - list action	2026-03-07 20:39:41.547
a2f434af-5230-4cc1-ae00-9410a8c0af8f	expenses	create	expenses module - create action	2026-03-07 20:39:41.549
02bd4330-4ae3-4695-8a73-1f7aec6d12bd	expenses	update	expenses module - update action	2026-03-07 20:39:41.552
4edb273f-f418-4370-9c15-b26b352b1a3b	expenses	delete	expenses module - delete action	2026-03-07 20:39:41.554
3c805cec-f343-4f57-b2c4-12cd534e7647	expenses	export	expenses module - export action	2026-03-07 20:39:41.556
25f4c2a7-725d-483e-bb4f-0a8313123c46	expenses	import	expenses module - import action	2026-03-07 20:39:41.559
bd9ec505-4e7c-4d65-a2b3-595372c82306	expenses	approve	expenses module - approve action	2026-03-07 20:39:41.561
f52b536c-929b-417c-b960-19235aff52d0	expenses	cancel	expenses module - cancel action	2026-03-07 20:39:41.564
1106d685-09aa-4503-b4a9-8d038eaeafbe	expenses	print	expenses module - print action	2026-03-07 20:39:41.566
1483c78c-8b9d-43f6-9815-e01b8235392b	reports	view	reports module - view action	2026-03-07 20:39:41.569
94271e4c-6843-4f43-b436-f9a9bcc12b73	reports	list	reports module - list action	2026-03-07 20:39:41.571
bb37a2e2-e0d4-4bad-bb28-eb868b722a4b	reports	create	reports module - create action	2026-03-07 20:39:41.575
9671fc77-2c09-4c1e-97d4-939ceec91759	reports	update	reports module - update action	2026-03-07 20:39:41.578
f475c00c-3e5e-49a1-9610-24709593544c	reports	delete	reports module - delete action	2026-03-07 20:39:41.581
1c74398f-6288-4fc0-a440-4b4ec5967853	reports	export	reports module - export action	2026-03-07 20:39:41.583
3684a479-0fcc-43a0-89f0-9937a0755139	reports	import	reports module - import action	2026-03-07 20:39:41.586
4d802d69-2de0-4d14-a960-31033290e8b4	reports	approve	reports module - approve action	2026-03-07 20:39:41.589
a4295fc5-6315-48f7-bce3-aa53ca61e2be	reports	cancel	reports module - cancel action	2026-03-07 20:39:41.592
17ef8643-c919-49bc-84dd-f7de328b838a	reports	print	reports module - print action	2026-03-07 20:39:41.595
e4d4c2ed-24cb-41b7-a210-9095744b5341	settings	view	settings module - view action	2026-03-07 20:39:41.597
6816988d-61c7-4201-aec9-1e40185d101b	settings	list	settings module - list action	2026-03-07 20:39:41.6
ffec3096-c74f-4faf-bce3-023feaba0f60	settings	create	settings module - create action	2026-03-07 20:39:41.602
430401a9-fc78-4dad-8736-4f178b8463ed	settings	update	settings module - update action	2026-03-07 20:39:41.604
fa312bc4-5158-421f-bccf-96b76fc00319	settings	delete	settings module - delete action	2026-03-07 20:39:41.607
992d9b1e-ec23-46e4-a085-88efacedc95e	settings	export	settings module - export action	2026-03-07 20:39:41.609
d3f4e756-c576-445b-9ff9-9c286bd2497d	settings	import	settings module - import action	2026-03-07 20:39:41.611
7983fb6c-82fe-48c9-b2dc-7d466c18d086	settings	approve	settings module - approve action	2026-03-07 20:39:41.613
23956ae3-a859-44b7-aa57-d697bc080656	settings	cancel	settings module - cancel action	2026-03-07 20:39:41.616
c26afa45-110a-47ff-b116-22181f49c25d	settings	print	settings module - print action	2026-03-07 20:39:41.618
b60795ac-46a6-45a9-88c4-483248fb7b8b	work_orders	view	work_orders module - view action	2026-03-07 20:39:41.62
a3dfca74-4e89-4841-ada5-273d84faa51f	work_orders	list	work_orders module - list action	2026-03-07 20:39:41.622
412289b9-38e3-4acf-8e10-82ffbb29143f	work_orders	create	work_orders module - create action	2026-03-07 20:39:41.624
e923a49e-2144-4365-819c-65173747f906	work_orders	update	work_orders module - update action	2026-03-07 20:39:41.626
bc1eb050-bcf6-4e7f-b6cc-5f6cdb7e0657	work_orders	delete	work_orders module - delete action	2026-03-07 20:39:41.629
1ec25752-8aef-4493-b245-84c57d924b96	work_orders	export	work_orders module - export action	2026-03-07 20:39:41.631
7c36e9be-01be-4af0-b834-dcbfae1fab22	work_orders	import	work_orders module - import action	2026-03-07 20:39:41.633
0b22e001-20d8-471c-8e54-0e58e84faa63	work_orders	approve	work_orders module - approve action	2026-03-07 20:39:41.635
fb18220f-ca66-4341-899b-46c33a7ae5d0	work_orders	cancel	work_orders module - cancel action	2026-03-07 20:39:41.637
8de0a55b-957f-4712-8684-13975aa12c7a	work_orders	print	work_orders module - print action	2026-03-07 20:39:41.64
fa625889-ad6a-46b2-a1b6-7507060d0328	vehicles	view	vehicles module - view action	2026-03-07 20:39:41.642
0f855243-6687-4e91-a8d0-60656266df47	vehicles	list	vehicles module - list action	2026-03-07 20:39:41.645
7199f8f4-b276-4857-9377-887dfbc1e986	vehicles	create	vehicles module - create action	2026-03-07 20:39:41.647
7dfb2e8c-6d9e-46bc-96e1-ed1c6a95370f	vehicles	update	vehicles module - update action	2026-03-07 20:39:41.649
0a6c9057-8270-4412-b898-145dd8d9c936	vehicles	delete	vehicles module - delete action	2026-03-07 20:39:41.651
f0ac239a-a647-4c86-8742-091a58496441	vehicles	export	vehicles module - export action	2026-03-07 20:39:41.653
af2c7c11-6823-4cf4-b7a9-01809b40ce57	vehicles	import	vehicles module - import action	2026-03-07 20:39:41.656
6486bb78-d903-4793-9e24-21290cce1795	vehicles	approve	vehicles module - approve action	2026-03-07 20:39:41.658
8d8ffe95-ebe7-4d17-8503-37c09bb7af7f	vehicles	cancel	vehicles module - cancel action	2026-03-07 20:39:41.661
10e315ef-1d14-408f-a678-5251df101619	vehicles	print	vehicles module - print action	2026-03-07 20:39:41.663
1428835b-d82e-4501-8206-95b7ca4efa28	technicians	view	technicians module - view action	2026-03-07 20:39:41.665
070cd663-25a1-42c0-bbd7-28588710e21a	technicians	list	technicians module - list action	2026-03-07 20:39:41.667
8ebc703e-abfe-4035-b682-f973c3d3e9c5	technicians	create	technicians module - create action	2026-03-07 20:39:41.669
ea6f083a-898a-443e-b735-f5d0940eebc0	technicians	update	technicians module - update action	2026-03-07 20:39:41.671
69b7b245-3bb1-4f4f-a375-cacc17cc96c2	technicians	delete	technicians module - delete action	2026-03-07 20:39:41.673
2e597bbe-f55e-4e2e-b83d-ceb34b6a5b8e	technicians	export	technicians module - export action	2026-03-07 20:39:41.676
cc6a1c56-40ef-454f-85d4-178d667f971c	technicians	import	technicians module - import action	2026-03-07 20:39:41.678
d2739e3a-dda7-4166-a048-1c14ec58d703	technicians	approve	technicians module - approve action	2026-03-07 20:39:41.68
2f4aadf0-ff84-45a5-9ced-0dbb04b9f890	technicians	cancel	technicians module - cancel action	2026-03-07 20:39:41.683
9faab475-4cce-42af-b5e8-1d5221b81c12	technicians	print	technicians module - print action	2026-03-07 20:39:41.685
a00c3430-b6fc-4b38-ba87-b5d00c9066cc	procurement	view	procurement module - view action	2026-03-07 20:39:41.687
824e821a-5dc7-4b6a-b4bf-722d10f057b8	procurement	list	procurement module - list action	2026-03-07 20:39:41.69
13e45d4b-d39f-4790-a3fd-32a1c48556d3	procurement	create	procurement module - create action	2026-03-07 20:39:41.692
15b75218-fd33-4b67-9144-6d19a509f775	procurement	update	procurement module - update action	2026-03-07 20:39:41.695
1bb3487d-9b1e-46ce-b40b-9d5f726dde8f	procurement	delete	procurement module - delete action	2026-03-07 20:39:41.697
8cdb2209-6d5f-4b07-9540-7c7a0ce6f3e2	procurement	export	procurement module - export action	2026-03-07 20:39:41.699
8a9cfc14-c6e2-455a-8ce9-144b31723112	procurement	import	procurement module - import action	2026-03-07 20:39:41.702
e85bb0fd-8536-4cf6-962f-873508323daf	procurement	approve	procurement module - approve action	2026-03-07 20:39:41.705
9b5ff91c-d02f-487b-8d10-ede67650675c	procurement	cancel	procurement module - cancel action	2026-03-07 20:39:41.707
1ffb8ef2-3b99-41f2-99f0-84130aa24458	procurement	print	procurement module - print action	2026-03-07 20:39:41.71
e02a41b7-e9da-49a4-8ed2-89e25fe8c33d	finance	view	finance module - view action	2026-03-07 20:39:41.712
18f2c146-3544-42e1-a98d-bab22707ac66	finance	list	finance module - list action	2026-03-07 20:39:41.715
cc36d59b-63e8-4dc5-a330-02079729d0e0	finance	create	finance module - create action	2026-03-07 20:39:41.717
6dfc1c2f-d45d-4b7f-a8fd-c7589dc7f3f1	finance	update	finance module - update action	2026-03-07 20:39:41.72
af3acc7d-8793-494f-be5c-f11b41e01351	finance	delete	finance module - delete action	2026-03-07 20:39:41.722
c0318d54-0548-4bab-8deb-cfdefeb87778	finance	export	finance module - export action	2026-03-07 20:39:41.725
c3b3ebca-50da-4405-8f5e-382217ccb592	finance	import	finance module - import action	2026-03-07 20:39:41.728
426a3c1d-4071-4d00-8403-eb8c4229bea1	finance	approve	finance module - approve action	2026-03-07 20:39:41.73
cfbd4e0e-bbec-42f9-be17-40b72dc2c722	finance	cancel	finance module - cancel action	2026-03-07 20:39:41.732
9b05c659-a13d-4970-958c-7930cfbcc9f9	finance	print	finance module - print action	2026-03-07 20:39:41.735
6883b340-2318-4ba4-b559-6ef868175816	collecting	view	collecting module - view action	2026-03-07 20:39:41.737
0add751e-9e83-4048-b2bb-495313d7be52	collecting	list	collecting module - list action	2026-03-07 20:39:41.739
8e33fdc5-0e8e-499c-8592-4cf461d3a820	collecting	create	collecting module - create action	2026-03-07 20:39:41.742
411b99ee-e35d-4b6e-a235-874ece1354fd	collecting	update	collecting module - update action	2026-03-07 20:39:41.744
f3f18b87-7f23-4995-b20b-976f46b24850	collecting	delete	collecting module - delete action	2026-03-07 20:39:41.747
f48f4af7-e3b8-4a8a-b757-6eb2fc15d157	collecting	export	collecting module - export action	2026-03-07 20:39:41.749
a4b18893-3928-4966-886c-ec71c1d81ec0	collecting	import	collecting module - import action	2026-03-07 20:39:41.753
2007e727-e69b-47c9-86ca-60e7b3f6e118	collecting	approve	collecting module - approve action	2026-03-07 20:39:41.756
5db65f11-2f6a-48fa-9a16-391a44ec64e1	collecting	cancel	collecting module - cancel action	2026-03-07 20:39:41.758
a7df620c-5d3e-49a1-80c5-8a91c642c9cc	collecting	print	collecting module - print action	2026-03-07 20:39:41.76
210860a4-8447-4e00-87a1-0bf9ab792842	payments	view	payments module - view action	2026-03-07 20:39:41.763
fda4d844-8924-4e4b-9cde-d467d0c6f808	payments	list	payments module - list action	2026-03-07 20:39:41.765
22517646-b71b-43d9-b8d0-0282a8a53d98	payments	create	payments module - create action	2026-03-07 20:39:41.767
18eef1af-fec9-456f-af17-dc85aea3acea	payments	update	payments module - update action	2026-03-07 20:39:41.769
44a54628-0e64-48d3-81a5-8d0d113334fd	payments	delete	payments module - delete action	2026-03-07 20:39:41.771
6a8e77a4-f582-41c3-aeb9-60fd595763c4	payments	export	payments module - export action	2026-03-07 20:39:41.774
b0e915d3-96de-4996-9423-12d4ecc5ed28	payments	import	payments module - import action	2026-03-07 20:39:41.776
33210624-0289-4f2b-8a14-56333c4837f9	payments	approve	payments module - approve action	2026-03-07 20:39:41.778
87d190e7-b468-48af-b8b0-32b82dd19124	payments	cancel	payments module - cancel action	2026-03-07 20:39:41.781
88c6a65a-e421-4a34-8263-3f58ca0ba2d9	payments	print	payments module - print action	2026-03-07 20:39:41.783
905c2f90-bca6-4fa0-97df-03fd0d50d235	cek_senet	view	cek_senet module - view action	2026-03-07 20:39:41.785
ae82c106-126b-40fd-8108-b1a193058f81	cek_senet	list	cek_senet module - list action	2026-03-07 20:39:41.787
aa099743-f056-4cad-afed-b17f1e74133d	cek_senet	create	cek_senet module - create action	2026-03-07 20:39:41.79
d603e566-df43-482d-8095-6f7b6320a910	cek_senet	update	cek_senet module - update action	2026-03-07 20:39:41.792
4413fb2a-3edc-4b0b-8c44-8e2a7c158e5c	cek_senet	delete	cek_senet module - delete action	2026-03-07 20:39:41.794
668febe4-9162-4e0b-844a-db654e3a2be1	cek_senet	export	cek_senet module - export action	2026-03-07 20:39:41.796
0ef148f7-e855-4393-b234-f4bd05ed2041	cek_senet	import	cek_senet module - import action	2026-03-07 20:39:41.799
9a214da6-880b-4513-8e3f-f15ea71e811e	cek_senet	approve	cek_senet module - approve action	2026-03-07 20:39:41.801
0ea75cfa-16c9-4626-9786-1eb73ab9a19a	cek_senet	cancel	cek_senet module - cancel action	2026-03-07 20:39:41.805
93d8f90e-3eb3-490f-90cf-4f3ae3f075e2	cek_senet	print	cek_senet module - print action	2026-03-07 20:39:41.807
5ad5fc23-d608-4ee6-8b0d-549401184369	teklif	view	teklif module - view action	2026-03-07 20:39:41.81
a657fcfb-cc4d-42c7-82cd-3ba4d3b94e68	teklif	list	teklif module - list action	2026-03-07 20:39:41.812
27eea808-1ffb-4a7c-9c28-71ccd4661596	teklif	create	teklif module - create action	2026-03-07 20:39:41.815
b19542d9-4bd1-4808-b2bb-0c9e17a97291	teklif	update	teklif module - update action	2026-03-07 20:39:41.817
6e8d9206-22ab-47f9-be05-78a175766aee	teklif	delete	teklif module - delete action	2026-03-07 20:39:41.819
e71c67fa-6a5e-4b7b-a829-5103879d5229	teklif	export	teklif module - export action	2026-03-07 20:39:41.821
b0651dcc-8f0b-4228-934c-acba4a7654b2	teklif	import	teklif module - import action	2026-03-07 20:39:41.824
1fabb0be-43ad-43c9-a275-e76d25428c9b	teklif	approve	teklif module - approve action	2026-03-07 20:39:41.826
a8806e62-ddc2-42c6-80be-1a9db1e757a8	teklif	cancel	teklif module - cancel action	2026-03-07 20:39:41.829
646672cd-1d26-4124-a00c-b3d48323b068	teklif	print	teklif module - print action	2026-03-07 20:39:41.831
2f7d1f03-8c51-4c24-9517-32ccf61120b2	siparis	view	siparis module - view action	2026-03-07 20:39:41.833
2aa0d060-1029-4468-be33-b934f30db60b	siparis	list	siparis module - list action	2026-03-07 20:39:41.835
bdb2c16b-211c-441b-8403-9484a80484b4	siparis	create	siparis module - create action	2026-03-07 20:39:41.837
112dd098-45d7-4a88-abdf-6343e1fb2d47	siparis	update	siparis module - update action	2026-03-07 20:39:41.839
97e69aa8-4f20-4b2f-b40b-0ac6304c965e	siparis	delete	siparis module - delete action	2026-03-07 20:39:41.842
e8c24cbd-cff2-4d88-af3b-971c2fc160f8	siparis	export	siparis module - export action	2026-03-07 20:39:41.844
61bb2750-2bdb-4e78-ae05-69068e707385	siparis	import	siparis module - import action	2026-03-07 20:39:41.846
9f46bf8a-749c-4ff8-a8c0-d83d113dd75b	siparis	approve	siparis module - approve action	2026-03-07 20:39:41.848
cc230b36-f765-4838-96d5-6eb69436b1a0	siparis	cancel	siparis module - cancel action	2026-03-07 20:39:41.851
9df3ca2c-2c28-4e83-9163-900dc4c129d0	siparis	print	siparis module - print action	2026-03-07 20:39:41.853
c9a6bba0-2d59-440d-a167-ff79f90045c8	irsaliye	view	irsaliye module - view action	2026-03-07 20:39:41.855
9f7e50d3-b015-4035-a964-86b416f6dcaf	irsaliye	list	irsaliye module - list action	2026-03-07 20:39:41.858
863c76ea-59fa-4b26-9ef0-33b64a0c74d6	irsaliye	create	irsaliye module - create action	2026-03-07 20:39:41.86
3b101d2c-f92f-43f6-9cf5-c443f1fd1519	irsaliye	update	irsaliye module - update action	2026-03-07 20:39:41.863
6f9f55fb-5b08-4915-964a-9e21299f8472	irsaliye	delete	irsaliye module - delete action	2026-03-07 20:39:41.866
8fb7cb0e-f4ae-4bd7-a42f-c26f77497e4e	irsaliye	export	irsaliye module - export action	2026-03-07 20:39:41.868
a30e6b93-2a25-4b98-9062-844060cf7f5c	irsaliye	import	irsaliye module - import action	2026-03-07 20:39:41.87
048bf182-a858-4a45-8a7c-1dc14afd590e	irsaliye	approve	irsaliye module - approve action	2026-03-07 20:39:41.873
0ec78b2c-ebb4-4bd3-a7c8-843b1749760d	irsaliye	cancel	irsaliye module - cancel action	2026-03-07 20:39:41.875
0b14bbab-ca7e-4e3d-9f54-934c50d8914b	irsaliye	print	irsaliye module - print action	2026-03-07 20:39:41.877
d6534bbd-6139-4236-adc2-5eefbf0516bd	kasa	view	kasa module - view action	2026-03-07 20:39:41.88
1dc8fd70-e789-4070-a6d8-e2518ed7108b	kasa	list	kasa module - list action	2026-03-07 20:39:41.882
222c6a0b-86ef-495f-8bfc-4be0aa8e4093	kasa	create	kasa module - create action	2026-03-07 20:39:41.884
48257d05-25b5-42b6-972b-cdc2bff75703	kasa	update	kasa module - update action	2026-03-07 20:39:41.887
da511f64-1168-4cbf-aeed-4de8b85d7d09	kasa	delete	kasa module - delete action	2026-03-07 20:39:41.889
1b109b13-bdcb-4562-9dda-b97ab83ac1e5	kasa	export	kasa module - export action	2026-03-07 20:39:41.891
8cb04d55-9f94-4d56-bb3c-88f1d093b9cb	kasa	import	kasa module - import action	2026-03-07 20:39:41.893
a57e540b-60c7-44d8-b21d-5b68a16f9569	kasa	approve	kasa module - approve action	2026-03-07 20:39:41.896
795ccd62-e47d-462e-bcba-b64babf9b735	kasa	cancel	kasa module - cancel action	2026-03-07 20:39:41.898
bd276c9a-822d-43ed-95c9-bd5031a9a2b6	kasa	print	kasa module - print action	2026-03-07 20:39:41.9
d6adca3c-5253-4ea1-836b-66997f4ee94e	banka	view	banka module - view action	2026-03-07 20:39:41.903
3c3886d2-fd05-4c47-bd56-5333cee678cf	banka	list	banka module - list action	2026-03-07 20:39:41.905
53d82c61-1149-4954-b363-4b082f0375f6	banka	create	banka module - create action	2026-03-07 20:39:41.908
3f67ae4c-5ab1-4ee0-bb50-ec398fd5836f	banka	update	banka module - update action	2026-03-07 20:39:41.91
d2cf63d6-2acf-4ca6-bc2e-ad00146896d4	banka	delete	banka module - delete action	2026-03-07 20:39:41.912
d7642381-47f3-4b49-9d60-03ade81978bb	banka	export	banka module - export action	2026-03-07 20:39:41.914
2e18e9b3-630c-4671-9edd-ca76fc8aa600	banka	import	banka module - import action	2026-03-07 20:39:41.916
2da20aa9-f5e9-46ee-9d75-a3573fb851cb	banka	approve	banka module - approve action	2026-03-07 20:39:41.919
513349ad-b21e-493c-bae4-990cb69d13b9	banka	cancel	banka module - cancel action	2026-03-07 20:39:41.921
59ddd6f4-8f0d-4266-9edf-b33608415c9f	banka	print	banka module - print action	2026-03-07 20:39:41.923
0a7fb955-d759-4d74-ac56-e8d7b1c5d404	ik	view	ik module - view action	2026-03-07 20:39:41.926
7d7bd5e1-b606-4235-bdb5-7bc5bfbd262d	ik	list	ik module - list action	2026-03-07 20:39:41.928
b9be469b-7eca-4077-8695-9be3c082ebac	ik	create	ik module - create action	2026-03-07 20:39:41.931
2c94ff0b-1dd2-4608-8239-277c4e242e78	ik	update	ik module - update action	2026-03-07 20:39:41.933
9f6aa651-e975-44d1-b858-95c62cd59376	ik	delete	ik module - delete action	2026-03-07 20:39:41.936
13fe8755-5bd6-4d66-b8c3-e6cf0d364d17	ik	export	ik module - export action	2026-03-07 20:39:41.938
631ab374-1b44-4b18-91dd-0171ebbd3be4	ik	import	ik module - import action	2026-03-07 20:39:41.941
fcf6699c-e1e8-475b-b197-33d8dd60957f	ik	approve	ik module - approve action	2026-03-07 20:39:41.943
0c0bbf3d-8099-417d-903c-16ce534b9ac9	ik	cancel	ik module - cancel action	2026-03-07 20:39:41.946
2fe635a7-18df-4bcd-aea9-663a79853b6f	ik	print	ik module - print action	2026-03-07 20:39:41.948
8fa4cf2b-04bb-410b-89c5-95cb69c5cb38	depo	view	depo module - view action	2026-03-07 20:39:41.95
846085ed-5fcc-4e65-adf3-e9e6f4e4cf5e	depo	list	depo module - list action	2026-03-07 20:39:41.953
f6a194f0-237f-4df3-beb4-dd93c4c3c395	depo	create	depo module - create action	2026-03-07 20:39:41.955
586fb0c3-5844-4d60-abcf-9dfd48f0e40f	depo	update	depo module - update action	2026-03-07 20:39:41.957
678dfc54-6aec-4cfd-9bb0-cb8cd7dbfa5d	depo	delete	depo module - delete action	2026-03-07 20:39:41.96
a38cc19e-8984-48ec-96ae-58ec16aa148e	depo	export	depo module - export action	2026-03-07 20:39:41.962
7fb3d33b-ea64-4b0d-9086-e56fe8889edb	depo	import	depo module - import action	2026-03-07 20:39:41.965
c8cdeda0-0eae-4c20-81f9-df4fccf7dcf7	depo	approve	depo module - approve action	2026-03-07 20:39:41.967
d3bf3071-34a9-4c7c-a63a-9381f482c95f	depo	cancel	depo module - cancel action	2026-03-07 20:39:41.969
6cf6bf62-fda6-429f-a377-7f03f36b8ed0	depo	print	depo module - print action	2026-03-07 20:39:41.971
967a6d36-cf5d-4123-84a8-bb2297d4fdfb	veri_aktarim	view	veri_aktarim module - view action	2026-03-07 20:39:41.974
b0a4357c-c1e4-43b5-be22-677f5cb8e16d	veri_aktarim	list	veri_aktarim module - list action	2026-03-07 20:39:41.976
fb45bb80-d617-4d93-a34d-da434f5affc8	veri_aktarim	create	veri_aktarim module - create action	2026-03-07 20:39:41.978
8e06871f-ca0e-4509-b22a-2c891523c641	veri_aktarim	update	veri_aktarim module - update action	2026-03-07 20:39:41.981
d645be12-d5a7-48f4-9c66-714849fec4b1	veri_aktarim	delete	veri_aktarim module - delete action	2026-03-07 20:39:41.983
aa3f44b9-f745-4f72-8818-e21ace37edaa	veri_aktarim	export	veri_aktarim module - export action	2026-03-07 20:39:41.985
835eec55-9fb6-4a0b-8cfd-4e686e13986b	veri_aktarim	import	veri_aktarim module - import action	2026-03-07 20:39:41.987
df66d37c-744f-4e1f-be44-45f28903defc	veri_aktarim	approve	veri_aktarim module - approve action	2026-03-07 20:39:41.991
61959920-ff17-4453-9f73-872efcb38926	veri_aktarim	cancel	veri_aktarim module - cancel action	2026-03-07 20:39:41.994
65b0332c-b406-4b1f-8dea-37e819334c55	veri_aktarim	print	veri_aktarim module - print action	2026-03-07 20:39:41.996
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, name, slug, description, price, currency, "billingPeriod", "trialDays", "baseUserLimit", features, limits, "isActive", "isPopular", "isBasePlan", "createdAt", "updatedAt") FROM stdin;
cmmg5gp260000vmr89yvff4qf	Trial	trial	14 gün ücretsiz deneme	0.00	TRY	MONTHLY	14	1	{"support": "email", "maxUsers": 1, "maxInvoices": 50}	{"storage": "500MB", "maxUsers": 1, "maxInvoices": 50}	t	f	t	2026-03-07 09:57:37.374	2026-03-07 09:57:37.374
cmmg5gp2g0001vmr8bwtffadh	Basic	basic	Temel özellikler, küçük işletmeler için - 1 kullanıcı, 1 yıl	2870.00	TRY	YEARLY	0	1	{"support": "email", "maxUsers": 1, "maxInvoices": 100}	{"storage": "1GB", "maxUsers": 1, "maxInvoices": 100}	t	f	t	2026-03-07 09:57:37.384	2026-03-07 09:57:37.384
cmmg5gp2j0002vmr8vle3tz8n	Professional	professional	Gelişmiş özellikler, orta ölçekli işletmeler için - 1 kullanıcı, 1 yıl	5750.00	TRY	YEARLY	0	1	{"support": "priority", "maxUsers": 1, "maxInvoices": 1000, "advancedReports": true}	{"storage": "10GB", "maxUsers": 1, "maxInvoices": 1000}	t	t	t	2026-03-07 09:57:37.387	2026-03-07 09:57:37.387
cmmg5gp2l0003vmr8jcqt84rk	Enterprise	enterprise	Tüm özellikler, büyük işletmeler için - 1 kullanıcı, 1 yıl	0.00	TRY	YEARLY	0	1	{"support": "dedicated", "maxUsers": 1, "apiAccess": true, "maxInvoices": -1, "advancedReports": true, "customIntegration": true}	{"storage": "unlimited", "maxUsers": 1, "maxInvoices": -1}	t	f	t	2026-03-07 09:57:37.389	2026-03-07 09:57:37.389
\.


--
-- Data for Name: pos_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_payments (id, invoice_id, payment_method, amount, change, gift_card_id, notes, "createdAt", "updatedAt", "tenantId", created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: pos_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_sessions (id, session_no, cashier_id, cashbox_id, opening_amount, closing_amount, closing_notes, status, opened_at, closed_at, "createdAt", "updatedAt", "tenantId", created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: postal_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postal_codes (id, city, district, neighborhood, "postalCode", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: price_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_cards (id, product_id, type, price, currency, effective_from, effective_to, note, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: price_list_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list_items (id, price_list_id, product_id, price, discount_rate, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: price_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_lists (id, name, "tenantId", start_date, end_date, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: procurement_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurement_orders (id, order_no, date, "tenantId", account_id, status, total_amount, vat_amount, grand_total, discount, notes, due_date, invoice_no, created_by, updated_by, deleted_by, deleted_at, "createdAt", "updatedAt", "deliveryNoteId") FROM stdin;
\.


--
-- Data for Name: product_barcodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_barcodes (id, "productId", barcode, symbology, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_equivalents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_equivalents (id, product1_id, product2_id, "createdAt") FROM stdin;
\.


--
-- Data for Name: product_location_stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_location_stocks (id, "warehouseId", "locationId", "productId", "qtyOnHand", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_movements (id, product_id, movement_type, quantity, unit_price, notes, "createdAt", "warehouseId", invoice_item_id, "tenantId") FROM stdin;
\.


--
-- Data for Name: product_shelves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_shelves (id, product_id, shelf_id, quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, code, "tenantId", name, description, unit, purchase_price, sale_price, vat_rate, critical_qty, category, main_category, sub_category, brand, model, oem, size, shelf, barcode, supplier_code, equivalency_group_id, vehicle_brand, vehicle_model, vehicle_engine_size, vehicle_fuel_type, is_category_only, is_brand_only, weight, weight_unit, dimensions, country_of_origin, warranty_months, internal_note, min_order_qty, lead_time_days, "createdAt", "updatedAt", unit_id) FROM stdin;
2bc12c69-6702-42e0-b783-9c7fdd9fe8ba	ST0001	\N	Fren Balatası Ön Takım	\N	Takım	120.00	180.00	20	0	\N	Fren Sistemleri	Fren Balatası	Bosch	\N	0 986 479 782	12x1.5	\N	8690123456789	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.834	2026-03-07 20:44:20.834	\N
8e67d84f-9686-4ad7-97af-fefffe2cdc74	ST0002	\N	Fren Balatası Arka Takım	\N	Takım	95.00	145.00	20	0	\N	Fren Sistemleri	Fren Balatası	Valeo	\N	V5578	10x1.2	\N	8690123456790	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.841	2026-03-07 20:44:20.841	\N
7610c2a4-8b92-4659-aa63-08b6da69f93e	ST0003	\N	Fren Diski Ön	\N	Adet	250.00	380.00	20	0	\N	Fren Sistemleri	Fren Diski	Brembo	\N	09.9772.11	280x22mm	\N	8690123456791	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.846	2026-03-07 20:44:20.846	\N
53083ea1-8b45-423a-823b-4bffe56bd434	ST0004	\N	Fren Diski Arka	\N	Adet	180.00	280.00	20	0	\N	Fren Sistemleri	Fren Diski	Brembo	\N	09.9772.12	260x10mm	\N	8690123456792	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.851	2026-03-07 20:44:20.851	\N
4019226a-4e45-41f9-8b08-b16dc69ac026	ST0005	\N	Fren Hortumu Ön	\N	Adet	45.00	75.00	20	0	\N	Fren Sistemleri	Fren Hortumu	TRW	\N	PFG446	\N	\N	8690123456793	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.855	2026-03-07 20:44:20.855	\N
0d4cd9f9-43ec-4c26-a592-fd055afc2947	ST0006	\N	Fren Kaliperi Ön Sağ	\N	Adet	320.00	480.00	20	0	\N	Fren Sistemleri	Fren Kaliperi	Continental	\N	ATE 13.0460-7513.2	\N	\N	8690123456794	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.859	2026-03-07 20:44:20.859	\N
d195929b-df71-49c7-8f18-aeda8fce14df	ST0007	\N	Motor Yağı 5W-30	\N	Litre	85.00	135.00	20	0	\N	Motor Parçaları	Motor Yağı	Mobil	\N	\N	5W-30	\N	8690123456795	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.863	2026-03-07 20:44:20.863	\N
d7af2d69-e515-40e8-b06c-59e14a31f38d	ST0008	\N	Motor Yağı 10W-40	\N	Litre	75.00	120.00	20	0	\N	Motor Parçaları	Motor Yağı	Castrol	\N	\N	10W-40	\N	8690123456796	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.868	2026-03-07 20:44:20.868	\N
8fc2e555-57cb-4624-b106-75c905d58bd2	ST0009	\N	Yağ Filtresi	\N	Adet	35.00	65.00	20	0	\N	Motor Parçaları	Yağ Filtresi	Mann Filter	\N	W 712/75	\N	\N	8690123456797	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.872	2026-03-07 20:44:20.872	\N
b61d9d84-050c-4b4e-adf9-fa3902586c6d	ST0010	\N	Hava Filtresi	\N	Adet	42.00	78.00	20	0	\N	Motor Parçaları	Hava Filtresi	Mann Filter	\N	C 27 038	\N	\N	8690123456798	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.876	2026-03-07 20:44:20.876	\N
e1507865-10d5-469e-877d-bedc7121cd36	ST0011	\N	Yakıt Filtresi	\N	Adet	55.00	95.00	20	0	\N	Motor Parçaları	Yakıt Filtresi	Mann Filter	\N	WK 712/11	\N	\N	8690123456799	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.88	2026-03-07 20:44:20.88	\N
9d8951d7-aa1a-4b01-b4a5-b4603351c900	ST0012	\N	Buji	\N	Adet	28.00	52.00	20	0	\N	Motor Parçaları	Buji	NGK	\N	BKR6E	14mm	\N	8690123456800	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.884	2026-03-07 20:44:20.884	\N
21f16c53-4422-4b44-a93f-41081fce159b	ST0013	\N	Buji	\N	Adet	32.00	58.00	20	0	\N	Motor Parçaları	Buji	Denso	\N	IK20	14mm	\N	8690123456801	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.887	2026-03-07 20:44:20.887	\N
8076553e-0bd4-4beb-a552-c3495929d00f	ST0014	\N	Termostat	\N	Adet	68.00	110.00	20	0	\N	Motor Parçaları	Termostat	Mahle	\N	TH 102 87	\N	\N	8690123456802	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.892	2026-03-07 20:44:20.892	\N
9e76b359-da3e-4505-b7f9-1d7683137f1f	ST0015	\N	Amortisör Ön Sağ	\N	Adet	450.00	680.00	20	0	\N	Süspansiyon	Amortisör	Sachs	\N	313-267	\N	\N	8690123456803	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.896	2026-03-07 20:44:20.896	\N
037b133c-7ea9-4de2-a666-314a96072fe5	ST0016	\N	Amortisör Ön Sol	\N	Adet	450.00	680.00	20	0	\N	Süspansiyon	Amortisör	Sachs	\N	313-268	\N	\N	8690123456804	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.9	2026-03-07 20:44:20.9	\N
c4b31f36-4dfd-418e-bd5a-f74ce44b3287	ST0017	\N	Amortisör Arka Sağ	\N	Adet	380.00	580.00	20	0	\N	Süspansiyon	Amortisör	Sachs	\N	313-269	\N	\N	8690123456805	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.905	2026-03-07 20:44:20.905	\N
b310a0da-8c72-4f0a-8525-f9bcec08aba8	ST0018	\N	Yay Ön	\N	Adet	220.00	350.00	20	0	\N	Süspansiyon	Yay	Febi Bilstein	\N	28755	\N	\N	8690123456806	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.909	2026-03-07 20:44:20.909	\N
dfa66a79-73f7-43a6-bf3a-e86c3c583404	ST0019	\N	Rot Başı	\N	Adet	95.00	155.00	20	0	\N	Süspansiyon	Rot Başı	Lemförder	\N	36673 01	\N	\N	8690123456807	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.914	2026-03-07 20:44:20.914	\N
5265bf21-fb27-4101-b8b8-d9440cb038ae	ST0020	\N	Rotil	\N	Adet	78.00	125.00	20	0	\N	Süspansiyon	Rotil	Meyle	\N	ME-83384	\N	\N	8690123456808	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.918	2026-03-07 20:44:20.918	\N
2690869d-800a-4932-a9a7-9b950b4f44eb	ST0021	\N	Far Ampulü H7	\N	Adet	25.00	45.00	20	0	\N	Aydınlatma	Far Ampulü	Osram	\N	H7 12V 55W	H7	\N	8690123456809	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.922	2026-03-07 20:44:20.922	\N
e2178559-1b31-4396-9670-7847f1334eb1	ST0022	\N	Stop Ampulü	\N	Adet	8.00	18.00	20	0	\N	Aydınlatma	Stop Ampulü	Osram	\N	P21/5W	\N	\N	8690123456810	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.926	2026-03-07 20:44:20.926	\N
240f11cc-3629-4528-adee-5080f9beab79	ST0023	\N	Sinyal Ampulü	\N	Adet	6.00	15.00	20	0	\N	Aydınlatma	Sinyal Ampulü	Osram	\N	PY21W	\N	\N	8690123456811	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.93	2026-03-07 20:44:20.93	\N
32da758f-e788-4d6e-9ea2-27006b7927c4	ST0024	\N	Akü 60Ah	\N	Adet	580.00	850.00	20	0	\N	Elektrik Sistemleri	Akü	Varta	\N	E11	60Ah	\N	8690123456812	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.934	2026-03-07 20:44:20.934	\N
47556386-4539-4475-bffd-3b93aa07c6a7	ST0025	\N	Alternatör	\N	Adet	1250.00	1850.00	20	0	\N	Elektrik Sistemleri	Alternatör	Bosch	\N	0 120 487 035	\N	\N	8690123456813	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.937	2026-03-07 20:44:20.937	\N
b43158be-18bb-4ec2-9c92-ebccad102ca2	ST0026	\N	Marş Motoru	\N	Adet	980.00	1450.00	20	0	\N	Elektrik Sistemleri	Marş Motoru	Bosch	\N	0 001 357 034	\N	\N	8690123456814	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.941	2026-03-07 20:44:20.941	\N
c4785b6e-c3ce-4440-b296-a7da1154b4d6	ST0027	\N	Buji Kablosu Set	\N	Takım	125.00	220.00	20	0	\N	Elektrik Sistemleri	Buji Kablosu	NGK	\N	RC-ZE76	\N	\N	8690123456815	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.945	2026-03-07 20:44:20.945	\N
ba761e2b-af46-4e82-b646-c7bd2e679420	ST0028	\N	Radyatör	\N	Adet	680.00	1050.00	20	0	\N	Soğutma Sistemi	Radyatör	Nissens	\N	67002A	\N	\N	8690123456816	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.949	2026-03-07 20:44:20.949	\N
013beb85-2334-4530-8e7d-76208d66794e	ST0029	\N	Su Pompası	\N	Adet	280.00	450.00	20	0	\N	Soğutma Sistemi	Su Pompası	Gates	\N	42268	\N	\N	8690123456817	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.953	2026-03-07 20:44:20.953	\N
49fd9375-d829-484b-9603-77fcdc6ed12b	ST0030	\N	Soğutma Suyu	\N	Litre	35.00	65.00	20	0	\N	Soğutma Sistemi	Soğutma Suyu	Shell	\N	\N	5L	\N	8690123456818	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.957	2026-03-07 20:44:20.957	\N
f591bd1d-02bd-463e-8acf-fde2e4ab28a4	ST0031	\N	Fan	\N	Adet	320.00	520.00	20	0	\N	Soğutma Sistemi	Fan	Valeo	\N	7901	\N	\N	8690123456819	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.962	2026-03-07 20:44:20.962	\N
4188eee5-c5b0-49f4-9643-b86dc2a9e93b	ST0032	\N	Yakıt Pompası	\N	Adet	580.00	920.00	20	0	\N	Yakıt Sistemi	Yakıt Pompası	Bosch	\N	0 580 464 024	\N	\N	8690123456820	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.966	2026-03-07 20:44:20.966	\N
55280e17-2e6c-4de2-a06f-e25e2a5e1dd3	ST0033	\N	Enjektör	\N	Adet	420.00	680.00	20	0	\N	Yakıt Sistemi	Enjektör	Bosch	\N	0 280 158 148	\N	\N	8690123456821	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.97	2026-03-07 20:44:20.97	\N
75fd1d06-bd70-48b5-9b75-ad99827962ab	ST0034	\N	Egzoz Borusu	\N	Adet	450.00	720.00	20	0	\N	Egzoz Sistemi	Egzoz Borusu	Walker	\N	21261	\N	\N	8690123456822	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.975	2026-03-07 20:44:20.975	\N
7fb53fb0-310e-4f0a-a318-b6b21011b6a7	ST0035	\N	Katalizör	\N	Adet	1850.00	2800.00	20	0	\N	Egzoz Sistemi	Katalizör	Bosal	\N	099-691	\N	\N	8690123456823	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.98	2026-03-07 20:44:20.98	\N
d0d98610-3ab6-4426-b4f1-64251f0acabe	ST0036	\N	Rulman Ön	\N	Adet	125.00	210.00	20	0	\N	Rulman ve Yataklar	Rulman	SKF	\N	VKBA 3543	\N	\N	8690123456824	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.983	2026-03-07 20:44:20.983	\N
1d7d02b3-699a-4127-8420-75b19a3386fe	ST0037	\N	Rulman Arka	\N	Adet	95.00	165.00	20	0	\N	Rulman ve Yataklar	Rulman	FAG	\N	562052	\N	\N	8690123456825	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.987	2026-03-07 20:44:20.987	\N
518245b1-691a-4dca-a7a7-051df80424d8	ST0038	\N	Conta Seti	\N	Takım	85.00	145.00	20	0	\N	Rulman ve Yataklar	Conta	Elring	\N	220.850	\N	\N	8690123456826	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.992	2026-03-07 20:44:20.992	\N
cdac882d-b524-47b5-a4ce-47de4d69c8d2	ST0039	\N	V Kayışı	\N	Adet	45.00	85.00	20	0	\N	Kayış ve Kasnaklar	V Kayışı	Gates	\N	6PK1193	6PK 1193	\N	8690123456827	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:20.996	2026-03-07 20:44:20.996	\N
c67ca261-d424-4c1a-af14-e1f2b4db8fe2	ST0040	\N	Zamanlama Kayışı	\N	Adet	125.00	220.00	20	0	\N	Kayış ve Kasnaklar	Zamanlama Kayışı	Gates	\N	5516XS	\N	\N	8690123456828	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:21	2026-03-07 20:44:21	\N
2f761e53-c6d5-4cb0-8ae7-6b2756cf5123	ST0041	\N	Kasnak	\N	Adet	180.00	320.00	20	0	\N	Kayış ve Kasnaklar	Kasnak	INA	\N	531 0107 10	\N	\N	8690123456829	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-07 20:44:21.005	2026-03-07 20:44:21.005	\N
\.


--
-- Data for Name: purchase_delivery_note_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_delivery_note_items (id, "tenantId", delivery_note_id, product_id, quantity, unit_price, vat_rate, vat_amount, total_amount, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: purchase_delivery_note_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_delivery_note_logs (id, "tenantId", delivery_note_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: purchase_delivery_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_delivery_notes (id, delivery_note_no, date, "tenantId", account_id, warehouse_id, source_type, source_id, status, total_amount, vat_amount, grand_total, discount, notes, created_by, updated_by, deleted_by, deleted_at, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, ordered_quantity, received_quantity, unit_price, status, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_local_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_local_items (id, order_id, product_id, quantity, delivered_quantity, unit_price, vat_rate, vat_amount, amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: purchase_order_local_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_local_logs (id, order_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, "orderNumber", "tenantId", supplier_id, order_date, expected_delivery_date, status, total_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_items (id, quote_id, product_id, quantity, unit_price, vat_rate, vat_amount, amount, discount_rate, discount_amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: quote_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_logs (id, quote_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, quote_no, "tenantId", quote_type, account_id, date, valid_until, discount, total_amount, vat_amount, grand_total, notes, status, order_id, created_by, updated_by, deleted_at, deleted_by, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, "roleId", "permissionId", "createdAt") FROM stdin;
50d2c45a-5e21-4edc-b4b4-b2bae37fcbab	61836065-2df8-4d71-b18b-c74280c73b04	39699f9e-9029-4ece-8086-4cec118b24e8	2026-03-07 20:39:42.006
eb088e73-f420-4d98-b39d-cf5c03a571f4	61836065-2df8-4d71-b18b-c74280c73b04	271f93ea-fb2b-4133-b542-6b1a2bc55e13	2026-03-07 20:39:42.006
4849489e-3c18-4447-bd4d-ebb3bd60cd48	61836065-2df8-4d71-b18b-c74280c73b04	30cbfd22-042d-40cd-92d4-087f16c8897f	2026-03-07 20:39:42.006
5e0217e8-5919-40e0-b48d-2707509cca63	61836065-2df8-4d71-b18b-c74280c73b04	4f4b2162-e65b-4020-907b-1baf4ee532ef	2026-03-07 20:39:42.006
8b0ba24e-d750-4afc-8257-5c7a6ad661ca	61836065-2df8-4d71-b18b-c74280c73b04	75448ea3-0ad4-4bc1-9a71-c9176fe5e417	2026-03-07 20:39:42.006
650501c3-a7e1-45b2-8419-d07ee2f29fae	61836065-2df8-4d71-b18b-c74280c73b04	835a6d1e-0558-4d22-89a6-8c6ac2d8f35d	2026-03-07 20:39:42.006
4cbd965e-33de-4c54-a8f7-06d852cbba19	61836065-2df8-4d71-b18b-c74280c73b04	0ff96eea-690e-4181-b1f5-018915e84edc	2026-03-07 20:39:42.006
2d14718b-8ca9-405e-97e7-535a5aa606cc	61836065-2df8-4d71-b18b-c74280c73b04	f797c3ca-7701-42c7-b97d-c75cff5a7b0d	2026-03-07 20:39:42.006
47a77850-e053-492b-a789-39500c1a8dfe	61836065-2df8-4d71-b18b-c74280c73b04	7f35d2b1-04d4-4960-84a7-81aa8dd1fd07	2026-03-07 20:39:42.006
06e9aa2d-3f3e-4eee-999e-d4fb6fd1c356	61836065-2df8-4d71-b18b-c74280c73b04	e4b325ae-f792-4c33-af14-eb272de10c76	2026-03-07 20:39:42.006
7e0d50e5-7e62-4c7a-8788-243c5633a136	61836065-2df8-4d71-b18b-c74280c73b04	64249d10-081d-4440-b464-93b02cf10160	2026-03-07 20:39:42.006
f021e725-1b07-48ba-bf67-a18c338df490	61836065-2df8-4d71-b18b-c74280c73b04	b45fad44-1d26-42ce-bdac-e674cd657e18	2026-03-07 20:39:42.006
d21a8a35-484f-48e2-a9e4-61d9633a9ec4	61836065-2df8-4d71-b18b-c74280c73b04	7c3b0605-04c7-4c4c-b35f-e11aa87da37e	2026-03-07 20:39:42.006
371fe753-945b-4681-844b-040e0fdfe541	61836065-2df8-4d71-b18b-c74280c73b04	e763be08-5456-4bd3-b99c-e158ffce35a7	2026-03-07 20:39:42.006
9f19d173-39d2-48b9-a9ba-ae3c0028a75c	61836065-2df8-4d71-b18b-c74280c73b04	8a958824-2875-4f93-99fb-3df8b15bc575	2026-03-07 20:39:42.006
5485a37f-74d0-4ca6-9f23-7fc8f2cbae4a	61836065-2df8-4d71-b18b-c74280c73b04	c38998dc-c602-4da3-812b-32a65185e66b	2026-03-07 20:39:42.006
971b2efb-3676-4d54-ac92-bc298147203f	61836065-2df8-4d71-b18b-c74280c73b04	7e7eb6f6-903d-44b1-b8db-0165492b5f2b	2026-03-07 20:39:42.006
5928c007-0a38-4615-a6da-9f00a06c4644	61836065-2df8-4d71-b18b-c74280c73b04	0c5566f7-538d-4b31-88db-e0a4dbc51c23	2026-03-07 20:39:42.006
93954f5a-5960-4863-81be-bced0b702aa5	61836065-2df8-4d71-b18b-c74280c73b04	95c8a8c8-cb0e-4ff8-bc6e-f3b0599a37dd	2026-03-07 20:39:42.006
03cf1a3b-e1f2-49aa-bb96-0ca1970f9bb1	61836065-2df8-4d71-b18b-c74280c73b04	525d09e4-f187-4668-baee-bba8f86dd36f	2026-03-07 20:39:42.006
83c0b594-ea2a-4b4b-8299-39ea0daec052	61836065-2df8-4d71-b18b-c74280c73b04	abb1280f-893e-4493-bb82-06a853d32dce	2026-03-07 20:39:42.006
ee31f2fd-8df2-4628-aed4-b16bafb2a3b1	61836065-2df8-4d71-b18b-c74280c73b04	fd1ddd6f-211a-4f65-afbe-a125341070f4	2026-03-07 20:39:42.006
7bb3d53b-8988-4654-b018-c57170fb51a0	61836065-2df8-4d71-b18b-c74280c73b04	9cd1a458-e5cf-4fbc-a775-cbcb77edd5be	2026-03-07 20:39:42.006
d2feaad7-ff40-488f-91a7-bcb3ad3b03dd	61836065-2df8-4d71-b18b-c74280c73b04	c9026867-5076-4740-b5a9-c827a85ca659	2026-03-07 20:39:42.006
4cd3da45-143f-40e9-a656-57719f6d14bc	61836065-2df8-4d71-b18b-c74280c73b04	a326e88e-6008-4516-b4c6-7e17f0095e26	2026-03-07 20:39:42.006
b040435c-afe0-4f64-a3c2-826eb07be315	61836065-2df8-4d71-b18b-c74280c73b04	b3db7985-e4a6-4b06-a084-222349edea7b	2026-03-07 20:39:42.006
5b861c91-5da3-420d-b60f-06c5f8829f88	61836065-2df8-4d71-b18b-c74280c73b04	a9c00d71-8e5a-4559-8c37-e1e4db371752	2026-03-07 20:39:42.006
ad50edb5-4b73-4262-b05a-4f00538fcd1a	61836065-2df8-4d71-b18b-c74280c73b04	72a2ad24-052d-44b9-a2f7-c7523dfde948	2026-03-07 20:39:42.006
402de1c2-89e9-4b07-8103-7b8b162c9dcc	61836065-2df8-4d71-b18b-c74280c73b04	f10aa31a-a83e-414d-bc99-8b6d6bd94a64	2026-03-07 20:39:42.006
45c4f4a6-abaa-41e1-813b-fe287c71351d	61836065-2df8-4d71-b18b-c74280c73b04	8f5a1820-84f1-4a33-858a-4c77bbc5f6d5	2026-03-07 20:39:42.006
b21d2d12-1d96-40f5-8779-271672a4ed5f	61836065-2df8-4d71-b18b-c74280c73b04	7a0b7d35-e7b4-4521-b56a-2cf036b409f3	2026-03-07 20:39:42.006
71fd5d1a-e2cf-4197-8f91-04a848d83190	61836065-2df8-4d71-b18b-c74280c73b04	79dd153c-1f6e-427d-ab11-26fc3208a7cd	2026-03-07 20:39:42.006
21f02a42-eef7-47c1-b886-c6296b850cc7	61836065-2df8-4d71-b18b-c74280c73b04	443c20aa-c3d2-47b2-9f20-c6c86be4ee5c	2026-03-07 20:39:42.006
8a0241a4-a002-45b6-8de2-ffbcec9f445a	61836065-2df8-4d71-b18b-c74280c73b04	992a8b32-d443-4812-ac6f-b456665d95fe	2026-03-07 20:39:42.006
32aca7c1-a95a-459a-b645-9771ee3ccee7	61836065-2df8-4d71-b18b-c74280c73b04	c9f0ad3b-85c9-4903-b687-8de7cfef2607	2026-03-07 20:39:42.006
17641c25-cbf9-4488-bf11-c538acb6aa91	61836065-2df8-4d71-b18b-c74280c73b04	d3b11425-c984-49df-b4f0-568fb6b80c3c	2026-03-07 20:39:42.006
01cd6edb-287c-4494-91f2-75515e544a95	61836065-2df8-4d71-b18b-c74280c73b04	c1de362e-a802-4991-95a8-80f0fa6fb413	2026-03-07 20:39:42.006
b2041582-0422-4cd5-83f2-98ccd357d6ed	61836065-2df8-4d71-b18b-c74280c73b04	d99aec78-3ebe-46b5-95ae-6a1777872cba	2026-03-07 20:39:42.006
d8e25cc0-f8e5-4d2d-b59e-c71c0159d7fd	61836065-2df8-4d71-b18b-c74280c73b04	01d6de90-b7e1-469c-92d5-0d8500fca5ad	2026-03-07 20:39:42.006
dfc0b4dc-9a77-4273-a829-0eaf4d709937	61836065-2df8-4d71-b18b-c74280c73b04	f8a7dede-ce8d-42fe-9ef7-e7be94734e49	2026-03-07 20:39:42.006
150e6070-7621-43c3-9f00-b0d6301a8c03	61836065-2df8-4d71-b18b-c74280c73b04	988e9a7a-f03f-4831-8010-6616b6bd3452	2026-03-07 20:39:42.006
0303c65c-7403-41ec-8360-2616c82ff130	61836065-2df8-4d71-b18b-c74280c73b04	785f3222-f7f8-473d-bb7e-47e948567dca	2026-03-07 20:39:42.006
eb9e1cb4-a131-42e3-ac85-72676746561e	61836065-2df8-4d71-b18b-c74280c73b04	fee5f457-b444-4215-b03a-bb146fcbd36c	2026-03-07 20:39:42.006
78a74740-26e3-4667-9693-0ec108c9f228	61836065-2df8-4d71-b18b-c74280c73b04	55340bd1-cac3-4f08-a43f-262b8570460a	2026-03-07 20:39:42.006
ab60ea41-0313-44f1-ba3c-da9e9ccdd5ef	61836065-2df8-4d71-b18b-c74280c73b04	9b3e61fc-037b-42d2-b49c-dc105f196a1e	2026-03-07 20:39:42.006
b396ed4b-a926-482c-bda3-9ec9366d7a99	61836065-2df8-4d71-b18b-c74280c73b04	4067267f-8d63-4d67-ab00-c09e3c968689	2026-03-07 20:39:42.006
df26cfd3-3621-4520-be95-44752ef2fc9d	61836065-2df8-4d71-b18b-c74280c73b04	4dce1a5f-266f-4fdc-ac8e-8aa98c62aa2d	2026-03-07 20:39:42.006
2bc05edc-d8b6-48dc-946a-b6483634f6ff	61836065-2df8-4d71-b18b-c74280c73b04	ef5c87e5-897e-4808-8d1d-8e72b46259ce	2026-03-07 20:39:42.006
8e647dd2-44a1-43aa-9590-46ce45ce4d75	61836065-2df8-4d71-b18b-c74280c73b04	bc92432e-c7b5-4d1a-a4a5-a8bc03f6c7f3	2026-03-07 20:39:42.006
cd89fb93-c929-405c-9bfb-d4cdeb431134	61836065-2df8-4d71-b18b-c74280c73b04	55161f2f-5908-4f74-836c-045a651bba00	2026-03-07 20:39:42.006
b27e2528-eed2-4a0a-823c-3a0563e88436	61836065-2df8-4d71-b18b-c74280c73b04	942ebe4e-0d78-4c15-a506-02217827f056	2026-03-07 20:39:42.006
27b8a3ce-fe5b-4273-b370-35cb17058964	61836065-2df8-4d71-b18b-c74280c73b04	f433746f-62a7-4580-a556-5ca87b15ec63	2026-03-07 20:39:42.006
ea1ff4cd-cb49-4df3-bd70-81166ffb1659	61836065-2df8-4d71-b18b-c74280c73b04	50d6243e-a058-4725-939c-fde677ad09c1	2026-03-07 20:39:42.006
52b782c1-7f18-424c-94ed-b08a8bc93266	61836065-2df8-4d71-b18b-c74280c73b04	cdce86d1-0a4d-4f37-a21b-64e5446d1ac9	2026-03-07 20:39:42.006
42d09309-c35f-498e-b313-8cee637954b2	61836065-2df8-4d71-b18b-c74280c73b04	2a304eb6-93ba-41b1-93e8-dde97dd1805c	2026-03-07 20:39:42.006
a7fa33bf-6f32-4e1c-af2d-ef1b23762260	61836065-2df8-4d71-b18b-c74280c73b04	4b01fadf-ab15-4330-8abc-cf922a6ec09e	2026-03-07 20:39:42.006
fb970a2e-8624-49c2-b0a4-17fb9ae29678	61836065-2df8-4d71-b18b-c74280c73b04	1128df69-234c-4302-a814-5d3da7ac2276	2026-03-07 20:39:42.006
79438f3c-cc3d-4daf-9308-ef93782c8c95	61836065-2df8-4d71-b18b-c74280c73b04	c7320480-8495-4dc7-b4dc-9fc23c14c647	2026-03-07 20:39:42.006
c47a5547-78b5-41fb-8951-d92c6649b0b5	61836065-2df8-4d71-b18b-c74280c73b04	1446c4d4-584a-4f5e-b38a-508c46fccb18	2026-03-07 20:39:42.006
facd0ad9-e9b2-433b-b9aa-d7fe9cca3492	61836065-2df8-4d71-b18b-c74280c73b04	f467f04b-4d2b-4929-968b-d0cd4a2f4dfe	2026-03-07 20:39:42.006
7cbbb5fb-c8d1-4a2c-aebd-db7503e0ebe5	61836065-2df8-4d71-b18b-c74280c73b04	b75b5fde-c911-470c-a210-b9daa16c13ae	2026-03-07 20:39:42.006
bae66190-c2e2-4b2e-98e2-7e602788037f	61836065-2df8-4d71-b18b-c74280c73b04	b2f363b9-5b76-4883-a895-ed263f64d0cd	2026-03-07 20:39:42.006
fc6b774e-cfe2-4f36-83cf-7aa9ea2b324e	61836065-2df8-4d71-b18b-c74280c73b04	dbbd18d3-0083-4392-82bb-78b65ae457d9	2026-03-07 20:39:42.006
a6abf371-e0e5-4bf0-9217-c1cf8801954f	61836065-2df8-4d71-b18b-c74280c73b04	107246db-3b73-4e3d-8c9b-e0733f7e6654	2026-03-07 20:39:42.006
12f0793a-6477-4163-88a0-e5eff4d13a7b	61836065-2df8-4d71-b18b-c74280c73b04	548f064c-0cbe-490b-a371-e2c3e128f17e	2026-03-07 20:39:42.006
106abc90-ad27-4ed4-a88c-04c5e13d8408	61836065-2df8-4d71-b18b-c74280c73b04	12239483-6717-436e-910c-57a3474bc93c	2026-03-07 20:39:42.006
bfb079b3-7c21-4e54-81ac-40a7d038f8c6	61836065-2df8-4d71-b18b-c74280c73b04	a8b30a52-eba1-4318-a138-5d3eb50a0a56	2026-03-07 20:39:42.006
9e420396-0f9e-4667-bbb9-ef371ae19e21	61836065-2df8-4d71-b18b-c74280c73b04	41ba512a-e6ac-4a00-a3bd-3ff6fc8c646b	2026-03-07 20:39:42.006
e01aa682-51ca-45af-98fb-02d47c6ffb21	61836065-2df8-4d71-b18b-c74280c73b04	f2a4c856-1f13-47b0-a558-1a7d90efd387	2026-03-07 20:39:42.006
1aa187de-4702-4e8a-bf8c-4fefe9511458	61836065-2df8-4d71-b18b-c74280c73b04	dfc4820b-f78b-49ad-b030-2012ce3c16ff	2026-03-07 20:39:42.006
da72e62f-1aa4-46a2-ac11-aed23394d670	61836065-2df8-4d71-b18b-c74280c73b04	e7aef756-e869-4940-ae15-a4419d574963	2026-03-07 20:39:42.006
54a436b7-3b67-4bec-9308-6d0a81198aea	61836065-2df8-4d71-b18b-c74280c73b04	b1910d22-a92d-4405-b3d8-c4135788c436	2026-03-07 20:39:42.006
519ccffa-7b91-47f9-a8e7-e3afb1c9ca9c	61836065-2df8-4d71-b18b-c74280c73b04	a2f434af-5230-4cc1-ae00-9410a8c0af8f	2026-03-07 20:39:42.006
3b2a9d89-b11e-40fe-8390-b139eef586fa	61836065-2df8-4d71-b18b-c74280c73b04	02bd4330-4ae3-4695-8a73-1f7aec6d12bd	2026-03-07 20:39:42.006
b75e5717-cc45-4baf-a642-28186de80c22	61836065-2df8-4d71-b18b-c74280c73b04	4edb273f-f418-4370-9c15-b26b352b1a3b	2026-03-07 20:39:42.006
c3a5407b-e6c7-4ae4-9777-6829c688d523	61836065-2df8-4d71-b18b-c74280c73b04	3c805cec-f343-4f57-b2c4-12cd534e7647	2026-03-07 20:39:42.006
f0e86578-0774-4959-ad89-cce7da4b12a7	61836065-2df8-4d71-b18b-c74280c73b04	25f4c2a7-725d-483e-bb4f-0a8313123c46	2026-03-07 20:39:42.006
8cbdda3a-c4ad-4e72-ac9f-4f3a78fc1546	61836065-2df8-4d71-b18b-c74280c73b04	bd9ec505-4e7c-4d65-a2b3-595372c82306	2026-03-07 20:39:42.006
3ab27941-02f9-471e-8fb7-9855440db901	61836065-2df8-4d71-b18b-c74280c73b04	f52b536c-929b-417c-b960-19235aff52d0	2026-03-07 20:39:42.006
65f59d9f-7fa1-404e-98af-b684d939f8ca	61836065-2df8-4d71-b18b-c74280c73b04	1106d685-09aa-4503-b4a9-8d038eaeafbe	2026-03-07 20:39:42.006
23ce6c4c-a2df-4cf4-90d5-df7540b094de	61836065-2df8-4d71-b18b-c74280c73b04	1483c78c-8b9d-43f6-9815-e01b8235392b	2026-03-07 20:39:42.006
b0455971-b0e1-422d-be74-3d52f12eaf09	61836065-2df8-4d71-b18b-c74280c73b04	94271e4c-6843-4f43-b436-f9a9bcc12b73	2026-03-07 20:39:42.006
4ce381b2-c0cc-4358-a5ef-86b5b6b09cb9	61836065-2df8-4d71-b18b-c74280c73b04	bb37a2e2-e0d4-4bad-bb28-eb868b722a4b	2026-03-07 20:39:42.006
4d95ccdb-146a-4c69-886c-a436a3804c67	61836065-2df8-4d71-b18b-c74280c73b04	9671fc77-2c09-4c1e-97d4-939ceec91759	2026-03-07 20:39:42.006
fb9b9966-4e73-447b-97c7-ea8451beed43	61836065-2df8-4d71-b18b-c74280c73b04	f475c00c-3e5e-49a1-9610-24709593544c	2026-03-07 20:39:42.006
58945586-af07-46bc-a070-99883c07f041	61836065-2df8-4d71-b18b-c74280c73b04	1c74398f-6288-4fc0-a440-4b4ec5967853	2026-03-07 20:39:42.006
78553d59-0d96-459d-a7b0-18ae60e70c18	61836065-2df8-4d71-b18b-c74280c73b04	3684a479-0fcc-43a0-89f0-9937a0755139	2026-03-07 20:39:42.006
94ca549f-713c-4164-9228-b35d9447be56	61836065-2df8-4d71-b18b-c74280c73b04	4d802d69-2de0-4d14-a960-31033290e8b4	2026-03-07 20:39:42.006
c47a909c-f1bc-48c1-882a-fc15dc05630c	61836065-2df8-4d71-b18b-c74280c73b04	a4295fc5-6315-48f7-bce3-aa53ca61e2be	2026-03-07 20:39:42.006
7ec2d0b3-a7c8-43c7-93cd-23e5df04c9b8	61836065-2df8-4d71-b18b-c74280c73b04	17ef8643-c919-49bc-84dd-f7de328b838a	2026-03-07 20:39:42.006
c36f49e6-3294-4260-81df-5b2bd5a22544	61836065-2df8-4d71-b18b-c74280c73b04	e4d4c2ed-24cb-41b7-a210-9095744b5341	2026-03-07 20:39:42.006
afd39930-58f5-4329-ae3f-4ec807ae1217	61836065-2df8-4d71-b18b-c74280c73b04	6816988d-61c7-4201-aec9-1e40185d101b	2026-03-07 20:39:42.006
ea69de42-d50c-4692-9ab8-00bde1637806	61836065-2df8-4d71-b18b-c74280c73b04	ffec3096-c74f-4faf-bce3-023feaba0f60	2026-03-07 20:39:42.006
8aecc968-140f-49a8-92e8-9a25fa792ba4	61836065-2df8-4d71-b18b-c74280c73b04	430401a9-fc78-4dad-8736-4f178b8463ed	2026-03-07 20:39:42.006
43254569-7eed-4166-b245-64a17eb93088	61836065-2df8-4d71-b18b-c74280c73b04	fa312bc4-5158-421f-bccf-96b76fc00319	2026-03-07 20:39:42.006
6f613a5b-43d8-4af5-a2d0-90866a794a5b	61836065-2df8-4d71-b18b-c74280c73b04	992d9b1e-ec23-46e4-a085-88efacedc95e	2026-03-07 20:39:42.006
257c636d-82ed-41b6-a2dd-d02e1fe933c7	61836065-2df8-4d71-b18b-c74280c73b04	d3f4e756-c576-445b-9ff9-9c286bd2497d	2026-03-07 20:39:42.006
88b14d88-bf0d-4b77-b52e-fd871f61bbe9	61836065-2df8-4d71-b18b-c74280c73b04	7983fb6c-82fe-48c9-b2dc-7d466c18d086	2026-03-07 20:39:42.006
5b7f005e-f77a-4093-85c1-5abd4c4a1ffe	61836065-2df8-4d71-b18b-c74280c73b04	23956ae3-a859-44b7-aa57-d697bc080656	2026-03-07 20:39:42.006
bf711a4f-d199-407c-98ec-d21ddf2eb753	61836065-2df8-4d71-b18b-c74280c73b04	c26afa45-110a-47ff-b116-22181f49c25d	2026-03-07 20:39:42.006
5acba9c9-88c3-4344-9524-7b25dbb960d1	61836065-2df8-4d71-b18b-c74280c73b04	b60795ac-46a6-45a9-88c4-483248fb7b8b	2026-03-07 20:39:42.006
0447fed2-f574-4079-893a-c6dc901039a0	61836065-2df8-4d71-b18b-c74280c73b04	a3dfca74-4e89-4841-ada5-273d84faa51f	2026-03-07 20:39:42.006
42b1380e-25b7-42b9-bdd2-95becb7a859c	61836065-2df8-4d71-b18b-c74280c73b04	412289b9-38e3-4acf-8e10-82ffbb29143f	2026-03-07 20:39:42.006
7dfaa92f-1b8c-4c48-8939-9c61930b6559	61836065-2df8-4d71-b18b-c74280c73b04	e923a49e-2144-4365-819c-65173747f906	2026-03-07 20:39:42.006
a8075d8f-bbc9-43ef-82ff-e2ab739052b6	61836065-2df8-4d71-b18b-c74280c73b04	bc1eb050-bcf6-4e7f-b6cc-5f6cdb7e0657	2026-03-07 20:39:42.006
1e0db6e7-de9d-41f8-b290-f4f00713d087	61836065-2df8-4d71-b18b-c74280c73b04	1ec25752-8aef-4493-b245-84c57d924b96	2026-03-07 20:39:42.006
90f55ad7-a98f-416b-bd2b-8b99dbfc1fb9	61836065-2df8-4d71-b18b-c74280c73b04	7c36e9be-01be-4af0-b834-dcbfae1fab22	2026-03-07 20:39:42.006
0b38559c-0e70-4e8d-875e-49afc5858930	61836065-2df8-4d71-b18b-c74280c73b04	0b22e001-20d8-471c-8e54-0e58e84faa63	2026-03-07 20:39:42.006
b4398b68-49b1-4651-a25d-5b773d2bec96	61836065-2df8-4d71-b18b-c74280c73b04	fb18220f-ca66-4341-899b-46c33a7ae5d0	2026-03-07 20:39:42.006
fe63d7a2-a464-4fba-ab2b-3bb64d26f05e	61836065-2df8-4d71-b18b-c74280c73b04	8de0a55b-957f-4712-8684-13975aa12c7a	2026-03-07 20:39:42.006
b8260f16-903c-4f0e-b482-79e1a3374997	61836065-2df8-4d71-b18b-c74280c73b04	fa625889-ad6a-46b2-a1b6-7507060d0328	2026-03-07 20:39:42.006
7d597ffb-139b-4a19-ab3c-81da8ec80562	61836065-2df8-4d71-b18b-c74280c73b04	0f855243-6687-4e91-a8d0-60656266df47	2026-03-07 20:39:42.006
126754e3-99b7-4f6e-ac94-6f5251295fae	61836065-2df8-4d71-b18b-c74280c73b04	7199f8f4-b276-4857-9377-887dfbc1e986	2026-03-07 20:39:42.006
b04a21a6-7ff5-4bf2-8cdd-79a92c0f2735	61836065-2df8-4d71-b18b-c74280c73b04	7dfb2e8c-6d9e-46bc-96e1-ed1c6a95370f	2026-03-07 20:39:42.006
06296c11-34bd-48d9-accf-e141e771922b	61836065-2df8-4d71-b18b-c74280c73b04	0a6c9057-8270-4412-b898-145dd8d9c936	2026-03-07 20:39:42.006
caab11d8-556f-4895-af76-ac92117e5385	61836065-2df8-4d71-b18b-c74280c73b04	f0ac239a-a647-4c86-8742-091a58496441	2026-03-07 20:39:42.006
29bb842c-e209-468a-8425-8a73cb07d2c2	61836065-2df8-4d71-b18b-c74280c73b04	af2c7c11-6823-4cf4-b7a9-01809b40ce57	2026-03-07 20:39:42.006
e22537fb-871f-406a-8e84-3ae19a201510	61836065-2df8-4d71-b18b-c74280c73b04	6486bb78-d903-4793-9e24-21290cce1795	2026-03-07 20:39:42.006
aebf0fee-d706-46d2-9e2d-0ba83b205e94	61836065-2df8-4d71-b18b-c74280c73b04	8d8ffe95-ebe7-4d17-8503-37c09bb7af7f	2026-03-07 20:39:42.006
55994597-63fd-4225-97cd-84c6e42a409b	61836065-2df8-4d71-b18b-c74280c73b04	10e315ef-1d14-408f-a678-5251df101619	2026-03-07 20:39:42.006
89665830-7a98-490a-9f01-f4a046f0bbbc	61836065-2df8-4d71-b18b-c74280c73b04	1428835b-d82e-4501-8206-95b7ca4efa28	2026-03-07 20:39:42.006
2cb7edca-907b-41b1-be04-12180cf84773	61836065-2df8-4d71-b18b-c74280c73b04	070cd663-25a1-42c0-bbd7-28588710e21a	2026-03-07 20:39:42.006
dfafd4b1-23f2-4075-b58e-002cc53ca761	61836065-2df8-4d71-b18b-c74280c73b04	8ebc703e-abfe-4035-b682-f973c3d3e9c5	2026-03-07 20:39:42.006
45426426-2c8a-44d0-963d-0ca73d1fa36f	61836065-2df8-4d71-b18b-c74280c73b04	ea6f083a-898a-443e-b735-f5d0940eebc0	2026-03-07 20:39:42.006
efd5450f-ef6f-4640-aa54-33410ddded3e	61836065-2df8-4d71-b18b-c74280c73b04	69b7b245-3bb1-4f4f-a375-cacc17cc96c2	2026-03-07 20:39:42.006
5b3397e2-d0fb-4dfb-83bb-70389791f243	61836065-2df8-4d71-b18b-c74280c73b04	2e597bbe-f55e-4e2e-b83d-ceb34b6a5b8e	2026-03-07 20:39:42.006
fb54aca4-8b04-46b9-8954-a55e709b3fdc	61836065-2df8-4d71-b18b-c74280c73b04	cc6a1c56-40ef-454f-85d4-178d667f971c	2026-03-07 20:39:42.006
36959890-f3e0-4c97-a9f2-9550122bfa27	61836065-2df8-4d71-b18b-c74280c73b04	d2739e3a-dda7-4166-a048-1c14ec58d703	2026-03-07 20:39:42.006
b53b21d2-6077-4f93-b2b3-d773020f3cf1	61836065-2df8-4d71-b18b-c74280c73b04	2f4aadf0-ff84-45a5-9ced-0dbb04b9f890	2026-03-07 20:39:42.006
ae2f2e50-243e-47ab-a17e-5470a6574db1	61836065-2df8-4d71-b18b-c74280c73b04	9faab475-4cce-42af-b5e8-1d5221b81c12	2026-03-07 20:39:42.006
28911ec4-9ab6-41dd-8162-9637d5d34df0	61836065-2df8-4d71-b18b-c74280c73b04	a00c3430-b6fc-4b38-ba87-b5d00c9066cc	2026-03-07 20:39:42.006
af80ce54-e233-46bd-9347-8bb7ccdd32e9	61836065-2df8-4d71-b18b-c74280c73b04	824e821a-5dc7-4b6a-b4bf-722d10f057b8	2026-03-07 20:39:42.006
668c5466-26c2-4986-ae93-551a87c309bc	61836065-2df8-4d71-b18b-c74280c73b04	13e45d4b-d39f-4790-a3fd-32a1c48556d3	2026-03-07 20:39:42.006
c76739ca-26d5-4c7e-b310-53b01732824c	61836065-2df8-4d71-b18b-c74280c73b04	15b75218-fd33-4b67-9144-6d19a509f775	2026-03-07 20:39:42.006
d042079f-d3cc-4ac4-a6bc-79f8bb0d5116	61836065-2df8-4d71-b18b-c74280c73b04	1bb3487d-9b1e-46ce-b40b-9d5f726dde8f	2026-03-07 20:39:42.006
48d82587-24ef-4428-bf64-cee923ef7cff	61836065-2df8-4d71-b18b-c74280c73b04	8cdb2209-6d5f-4b07-9540-7c7a0ce6f3e2	2026-03-07 20:39:42.006
e6c8765d-94ee-489d-b6c0-02ffc7402386	61836065-2df8-4d71-b18b-c74280c73b04	8a9cfc14-c6e2-455a-8ce9-144b31723112	2026-03-07 20:39:42.006
263c9d5d-326a-4bf9-90d9-e54f75f63f4b	61836065-2df8-4d71-b18b-c74280c73b04	e85bb0fd-8536-4cf6-962f-873508323daf	2026-03-07 20:39:42.006
dec6be4c-65e8-4c7f-abe6-64b8268f3dfa	61836065-2df8-4d71-b18b-c74280c73b04	9b5ff91c-d02f-487b-8d10-ede67650675c	2026-03-07 20:39:42.006
10720198-a26e-41a6-9caa-15549ad1bd29	61836065-2df8-4d71-b18b-c74280c73b04	1ffb8ef2-3b99-41f2-99f0-84130aa24458	2026-03-07 20:39:42.006
d9567e54-d4c0-4e68-9314-72e58850bd85	61836065-2df8-4d71-b18b-c74280c73b04	e02a41b7-e9da-49a4-8ed2-89e25fe8c33d	2026-03-07 20:39:42.006
fc1777df-17f9-4563-9c2b-acfe75982838	61836065-2df8-4d71-b18b-c74280c73b04	18f2c146-3544-42e1-a98d-bab22707ac66	2026-03-07 20:39:42.006
9bd97adc-ed4e-4678-97fd-ccde074156f3	61836065-2df8-4d71-b18b-c74280c73b04	cc36d59b-63e8-4dc5-a330-02079729d0e0	2026-03-07 20:39:42.006
291af2cf-b1a2-4be7-860f-ae37773a61d3	61836065-2df8-4d71-b18b-c74280c73b04	6dfc1c2f-d45d-4b7f-a8fd-c7589dc7f3f1	2026-03-07 20:39:42.006
0f0a5a3a-7b57-4034-9699-0e039d2f918f	61836065-2df8-4d71-b18b-c74280c73b04	af3acc7d-8793-494f-be5c-f11b41e01351	2026-03-07 20:39:42.006
74531e40-d9df-45d2-af5c-9ca2af044a1d	61836065-2df8-4d71-b18b-c74280c73b04	c0318d54-0548-4bab-8deb-cfdefeb87778	2026-03-07 20:39:42.006
0c2b2a33-5283-4c87-aa74-d0df0a6195f8	61836065-2df8-4d71-b18b-c74280c73b04	c3b3ebca-50da-4405-8f5e-382217ccb592	2026-03-07 20:39:42.006
1a6debd7-e090-44d8-a129-032df7447585	61836065-2df8-4d71-b18b-c74280c73b04	426a3c1d-4071-4d00-8403-eb8c4229bea1	2026-03-07 20:39:42.006
893bb2b2-3f3d-4cf3-87d7-4b9488b42890	61836065-2df8-4d71-b18b-c74280c73b04	cfbd4e0e-bbec-42f9-be17-40b72dc2c722	2026-03-07 20:39:42.006
b974dd98-2050-49aa-8e17-c15ede21d153	61836065-2df8-4d71-b18b-c74280c73b04	9b05c659-a13d-4970-958c-7930cfbcc9f9	2026-03-07 20:39:42.006
d65c5972-cb7c-4486-8c0f-cf51c687344e	61836065-2df8-4d71-b18b-c74280c73b04	6883b340-2318-4ba4-b559-6ef868175816	2026-03-07 20:39:42.006
9683997e-33a6-4d6d-a72d-1c06bf958503	61836065-2df8-4d71-b18b-c74280c73b04	0add751e-9e83-4048-b2bb-495313d7be52	2026-03-07 20:39:42.006
3d6dd9cc-e0c0-4df6-b7e7-fd5ee6bdfd62	61836065-2df8-4d71-b18b-c74280c73b04	8e33fdc5-0e8e-499c-8592-4cf461d3a820	2026-03-07 20:39:42.006
ed97b576-2f17-4b75-bdde-d1bc2981df4a	61836065-2df8-4d71-b18b-c74280c73b04	411b99ee-e35d-4b6e-a235-874ece1354fd	2026-03-07 20:39:42.006
b4a1a45c-6232-4d1a-8127-710dc3a481df	61836065-2df8-4d71-b18b-c74280c73b04	f3f18b87-7f23-4995-b20b-976f46b24850	2026-03-07 20:39:42.006
57582d42-0245-4a40-9c4b-7e4ebb31806c	61836065-2df8-4d71-b18b-c74280c73b04	f48f4af7-e3b8-4a8a-b757-6eb2fc15d157	2026-03-07 20:39:42.006
17f19a6b-b7ed-4e15-b162-24fd8c545825	61836065-2df8-4d71-b18b-c74280c73b04	a4b18893-3928-4966-886c-ec71c1d81ec0	2026-03-07 20:39:42.006
4f054753-5d9f-4877-89d0-89cede854239	61836065-2df8-4d71-b18b-c74280c73b04	2007e727-e69b-47c9-86ca-60e7b3f6e118	2026-03-07 20:39:42.006
6047e9f9-05e9-4322-86c0-7bb13e383748	61836065-2df8-4d71-b18b-c74280c73b04	5db65f11-2f6a-48fa-9a16-391a44ec64e1	2026-03-07 20:39:42.006
81e43055-91df-468b-bf04-e61fdb138222	61836065-2df8-4d71-b18b-c74280c73b04	a7df620c-5d3e-49a1-80c5-8a91c642c9cc	2026-03-07 20:39:42.006
6b40c5dc-8c5e-457d-86da-952d4cbf541a	61836065-2df8-4d71-b18b-c74280c73b04	210860a4-8447-4e00-87a1-0bf9ab792842	2026-03-07 20:39:42.006
83049784-652d-43eb-9415-5ce7c52fd528	61836065-2df8-4d71-b18b-c74280c73b04	fda4d844-8924-4e4b-9cde-d467d0c6f808	2026-03-07 20:39:42.006
209c437e-5ee1-4ca6-aad7-c53e3c028752	61836065-2df8-4d71-b18b-c74280c73b04	22517646-b71b-43d9-b8d0-0282a8a53d98	2026-03-07 20:39:42.006
bf4ad730-51d4-4841-a557-3ec177d82ceb	61836065-2df8-4d71-b18b-c74280c73b04	18eef1af-fec9-456f-af17-dc85aea3acea	2026-03-07 20:39:42.006
b55f4548-b545-424b-970b-d8ec5648aab3	61836065-2df8-4d71-b18b-c74280c73b04	44a54628-0e64-48d3-81a5-8d0d113334fd	2026-03-07 20:39:42.006
e89e2dd1-531d-4c5f-babb-d9aadfb480de	61836065-2df8-4d71-b18b-c74280c73b04	6a8e77a4-f582-41c3-aeb9-60fd595763c4	2026-03-07 20:39:42.006
8a126689-7ec5-49e6-b287-e3f14400673e	61836065-2df8-4d71-b18b-c74280c73b04	b0e915d3-96de-4996-9423-12d4ecc5ed28	2026-03-07 20:39:42.006
78a10103-47ce-4519-925a-6002a2a42279	61836065-2df8-4d71-b18b-c74280c73b04	33210624-0289-4f2b-8a14-56333c4837f9	2026-03-07 20:39:42.006
f9ed99e4-0211-4757-bae5-cba073f629dd	61836065-2df8-4d71-b18b-c74280c73b04	87d190e7-b468-48af-b8b0-32b82dd19124	2026-03-07 20:39:42.006
d895a0f2-66ff-4f65-aa86-f54e92df73f2	61836065-2df8-4d71-b18b-c74280c73b04	88c6a65a-e421-4a34-8263-3f58ca0ba2d9	2026-03-07 20:39:42.006
227791df-6e7d-4c6e-9783-3d15f96792e6	61836065-2df8-4d71-b18b-c74280c73b04	905c2f90-bca6-4fa0-97df-03fd0d50d235	2026-03-07 20:39:42.006
e7ff9a31-358b-4059-8455-bdeabf3fd9ff	61836065-2df8-4d71-b18b-c74280c73b04	ae82c106-126b-40fd-8108-b1a193058f81	2026-03-07 20:39:42.006
d02089a0-9351-47fe-a0b2-df28c8c2095c	61836065-2df8-4d71-b18b-c74280c73b04	aa099743-f056-4cad-afed-b17f1e74133d	2026-03-07 20:39:42.006
5a8378e2-f3cb-45a4-84ed-a960366d8a98	61836065-2df8-4d71-b18b-c74280c73b04	d603e566-df43-482d-8095-6f7b6320a910	2026-03-07 20:39:42.006
d5f849c5-9f42-4c55-a03f-590fd63f5336	61836065-2df8-4d71-b18b-c74280c73b04	4413fb2a-3edc-4b0b-8c44-8e2a7c158e5c	2026-03-07 20:39:42.006
2aacaab4-4a5f-4ff4-ad11-0f40b46aecdd	61836065-2df8-4d71-b18b-c74280c73b04	668febe4-9162-4e0b-844a-db654e3a2be1	2026-03-07 20:39:42.006
2ad7b9bd-7434-402b-8625-38107d81ba21	61836065-2df8-4d71-b18b-c74280c73b04	0ef148f7-e855-4393-b234-f4bd05ed2041	2026-03-07 20:39:42.006
151845ae-ec03-43c8-ad52-bb642c3903c0	61836065-2df8-4d71-b18b-c74280c73b04	9a214da6-880b-4513-8e3f-f15ea71e811e	2026-03-07 20:39:42.006
164b5b7e-93ae-437e-a2bf-b5bf0f15a984	61836065-2df8-4d71-b18b-c74280c73b04	0ea75cfa-16c9-4626-9786-1eb73ab9a19a	2026-03-07 20:39:42.006
b9b54932-a3a4-42e2-ade3-5a8b74525693	61836065-2df8-4d71-b18b-c74280c73b04	93d8f90e-3eb3-490f-90cf-4f3ae3f075e2	2026-03-07 20:39:42.006
a5f36444-581b-4a73-af74-7575775d66a1	61836065-2df8-4d71-b18b-c74280c73b04	5ad5fc23-d608-4ee6-8b0d-549401184369	2026-03-07 20:39:42.006
84b02145-4e20-4756-991c-a3eb378fe2f3	61836065-2df8-4d71-b18b-c74280c73b04	a657fcfb-cc4d-42c7-82cd-3ba4d3b94e68	2026-03-07 20:39:42.006
41f6eb51-a8f9-4def-885b-818893be0018	61836065-2df8-4d71-b18b-c74280c73b04	27eea808-1ffb-4a7c-9c28-71ccd4661596	2026-03-07 20:39:42.006
b71b357a-1806-45c9-94e4-192677df50b3	61836065-2df8-4d71-b18b-c74280c73b04	b19542d9-4bd1-4808-b2bb-0c9e17a97291	2026-03-07 20:39:42.006
280409bd-58ce-499b-a3b8-a4868a194835	61836065-2df8-4d71-b18b-c74280c73b04	6e8d9206-22ab-47f9-be05-78a175766aee	2026-03-07 20:39:42.006
c5a5b953-5d29-4192-bfab-29fa50f10716	61836065-2df8-4d71-b18b-c74280c73b04	e71c67fa-6a5e-4b7b-a829-5103879d5229	2026-03-07 20:39:42.006
e06d5594-bd30-4e01-8560-36b6d186d581	61836065-2df8-4d71-b18b-c74280c73b04	b0651dcc-8f0b-4228-934c-acba4a7654b2	2026-03-07 20:39:42.006
c55342a3-63b9-4417-90d1-99c97cdebc6a	61836065-2df8-4d71-b18b-c74280c73b04	1fabb0be-43ad-43c9-a275-e76d25428c9b	2026-03-07 20:39:42.006
595432c9-5870-44e9-9944-d4778ccddcd9	61836065-2df8-4d71-b18b-c74280c73b04	a8806e62-ddc2-42c6-80be-1a9db1e757a8	2026-03-07 20:39:42.006
a42b514a-928f-4e5d-8032-64fff9f271f4	61836065-2df8-4d71-b18b-c74280c73b04	646672cd-1d26-4124-a00c-b3d48323b068	2026-03-07 20:39:42.006
d943b93d-d1fe-45ad-b799-c10fdb377981	61836065-2df8-4d71-b18b-c74280c73b04	2f7d1f03-8c51-4c24-9517-32ccf61120b2	2026-03-07 20:39:42.006
cc3cf691-2b7f-492b-aa32-d03570714fa3	61836065-2df8-4d71-b18b-c74280c73b04	2aa0d060-1029-4468-be33-b934f30db60b	2026-03-07 20:39:42.006
c36bc077-5745-4f73-9368-5969a63d168c	61836065-2df8-4d71-b18b-c74280c73b04	bdb2c16b-211c-441b-8403-9484a80484b4	2026-03-07 20:39:42.006
1ff5720a-1ba7-4df6-b7b1-27f874ebe941	61836065-2df8-4d71-b18b-c74280c73b04	112dd098-45d7-4a88-abdf-6343e1fb2d47	2026-03-07 20:39:42.006
c1dc1936-6147-47ef-ab0a-339cc39db8d6	61836065-2df8-4d71-b18b-c74280c73b04	97e69aa8-4f20-4b2f-b40b-0ac6304c965e	2026-03-07 20:39:42.006
c2fecf58-4e0f-4fd0-a4d4-4fa7d7ef0d44	61836065-2df8-4d71-b18b-c74280c73b04	e8c24cbd-cff2-4d88-af3b-971c2fc160f8	2026-03-07 20:39:42.006
6768dde6-0aa3-4c1e-b81a-13265a3194fb	61836065-2df8-4d71-b18b-c74280c73b04	61bb2750-2bdb-4e78-ae05-69068e707385	2026-03-07 20:39:42.006
a4089eb9-b248-48a0-8ae0-86b90b0e9cad	61836065-2df8-4d71-b18b-c74280c73b04	9f46bf8a-749c-4ff8-a8c0-d83d113dd75b	2026-03-07 20:39:42.006
136d4c34-555f-44a3-821f-77c6201a02b6	61836065-2df8-4d71-b18b-c74280c73b04	cc230b36-f765-4838-96d5-6eb69436b1a0	2026-03-07 20:39:42.006
333c8625-e00c-4bef-9bef-73b5a0769da2	61836065-2df8-4d71-b18b-c74280c73b04	9df3ca2c-2c28-4e83-9163-900dc4c129d0	2026-03-07 20:39:42.006
e32d3eaf-f9ad-413d-b9db-c130842ece5b	61836065-2df8-4d71-b18b-c74280c73b04	c9a6bba0-2d59-440d-a167-ff79f90045c8	2026-03-07 20:39:42.006
4dea31c5-19e7-4555-b790-e039b01d8dd3	61836065-2df8-4d71-b18b-c74280c73b04	9f7e50d3-b015-4035-a964-86b416f6dcaf	2026-03-07 20:39:42.006
1a707564-86bb-479e-ac69-7bf5a0c75378	61836065-2df8-4d71-b18b-c74280c73b04	863c76ea-59fa-4b26-9ef0-33b64a0c74d6	2026-03-07 20:39:42.006
9e72d2cd-8761-450a-a56c-66093a0ff96d	61836065-2df8-4d71-b18b-c74280c73b04	3b101d2c-f92f-43f6-9cf5-c443f1fd1519	2026-03-07 20:39:42.006
71d6d9ee-7011-4037-bc9d-f392103b7d43	61836065-2df8-4d71-b18b-c74280c73b04	6f9f55fb-5b08-4915-964a-9e21299f8472	2026-03-07 20:39:42.006
03fa67be-e4ca-412a-a0c1-8a98d06660a5	61836065-2df8-4d71-b18b-c74280c73b04	8fb7cb0e-f4ae-4bd7-a42f-c26f77497e4e	2026-03-07 20:39:42.006
2dbcc0d6-8427-490d-b056-69c1c09fee07	61836065-2df8-4d71-b18b-c74280c73b04	a30e6b93-2a25-4b98-9062-844060cf7f5c	2026-03-07 20:39:42.006
5948a3f6-a756-401e-b611-18f316188e94	61836065-2df8-4d71-b18b-c74280c73b04	048bf182-a858-4a45-8a7c-1dc14afd590e	2026-03-07 20:39:42.006
73eb8299-2ce8-4ec2-9b1c-46edb0592845	61836065-2df8-4d71-b18b-c74280c73b04	0ec78b2c-ebb4-4bd3-a7c8-843b1749760d	2026-03-07 20:39:42.006
b854298b-61f2-473d-a009-dcca0e3b4d3b	61836065-2df8-4d71-b18b-c74280c73b04	0b14bbab-ca7e-4e3d-9f54-934c50d8914b	2026-03-07 20:39:42.006
bf44e6d2-4c1e-4232-9e5d-f33e708dc3ff	61836065-2df8-4d71-b18b-c74280c73b04	d6534bbd-6139-4236-adc2-5eefbf0516bd	2026-03-07 20:39:42.006
f8f8482a-8617-41e4-a32d-13ca728a6b94	61836065-2df8-4d71-b18b-c74280c73b04	1dc8fd70-e789-4070-a6d8-e2518ed7108b	2026-03-07 20:39:42.006
30719cdc-ac9c-435a-a448-f2dd31e1512c	61836065-2df8-4d71-b18b-c74280c73b04	222c6a0b-86ef-495f-8bfc-4be0aa8e4093	2026-03-07 20:39:42.006
8bf617b4-f6b8-45bf-aaac-6b4917fb81a4	61836065-2df8-4d71-b18b-c74280c73b04	48257d05-25b5-42b6-972b-cdc2bff75703	2026-03-07 20:39:42.006
1e9f0024-e0d3-42c9-a609-2a9b0e1c692d	61836065-2df8-4d71-b18b-c74280c73b04	da511f64-1168-4cbf-aeed-4de8b85d7d09	2026-03-07 20:39:42.006
34151ec5-0165-4268-a99a-b7f7e8f08748	61836065-2df8-4d71-b18b-c74280c73b04	1b109b13-bdcb-4562-9dda-b97ab83ac1e5	2026-03-07 20:39:42.006
0050e622-213c-4338-9d29-7b5d228083bd	61836065-2df8-4d71-b18b-c74280c73b04	8cb04d55-9f94-4d56-bb3c-88f1d093b9cb	2026-03-07 20:39:42.006
ee1e8556-633d-4bdf-8f5a-c6cfa1982b98	61836065-2df8-4d71-b18b-c74280c73b04	a57e540b-60c7-44d8-b21d-5b68a16f9569	2026-03-07 20:39:42.006
cc03b9d1-a607-4d74-b88e-b095015caebc	61836065-2df8-4d71-b18b-c74280c73b04	795ccd62-e47d-462e-bcba-b64babf9b735	2026-03-07 20:39:42.006
aa17413e-3b18-4ca0-920e-74ce1c1ac2f9	61836065-2df8-4d71-b18b-c74280c73b04	bd276c9a-822d-43ed-95c9-bd5031a9a2b6	2026-03-07 20:39:42.006
771e56b2-0d02-4093-a6cb-63f8ece45ac1	61836065-2df8-4d71-b18b-c74280c73b04	d6adca3c-5253-4ea1-836b-66997f4ee94e	2026-03-07 20:39:42.006
2adf49fd-786d-4528-a7b6-cf03dd3eae93	61836065-2df8-4d71-b18b-c74280c73b04	3c3886d2-fd05-4c47-bd56-5333cee678cf	2026-03-07 20:39:42.006
aeb7c19b-fcff-4a4c-866b-c6857380e27d	61836065-2df8-4d71-b18b-c74280c73b04	53d82c61-1149-4954-b363-4b082f0375f6	2026-03-07 20:39:42.006
622eec0d-f611-427b-a397-21141523d633	61836065-2df8-4d71-b18b-c74280c73b04	3f67ae4c-5ab1-4ee0-bb50-ec398fd5836f	2026-03-07 20:39:42.006
4c9ada20-8ca1-4dff-8a5e-b9500c8ebefd	61836065-2df8-4d71-b18b-c74280c73b04	d2cf63d6-2acf-4ca6-bc2e-ad00146896d4	2026-03-07 20:39:42.006
f3cc57f9-8863-4e17-b35b-0e61dd4282d0	61836065-2df8-4d71-b18b-c74280c73b04	d7642381-47f3-4b49-9d60-03ade81978bb	2026-03-07 20:39:42.006
97d5952d-6cc1-4347-8637-c550d597466d	61836065-2df8-4d71-b18b-c74280c73b04	2e18e9b3-630c-4671-9edd-ca76fc8aa600	2026-03-07 20:39:42.006
dd35e1b7-c741-49ae-839e-3910f826a930	61836065-2df8-4d71-b18b-c74280c73b04	2da20aa9-f5e9-46ee-9d75-a3573fb851cb	2026-03-07 20:39:42.006
c3220faa-4932-49c3-be93-249d6acd1173	61836065-2df8-4d71-b18b-c74280c73b04	513349ad-b21e-493c-bae4-990cb69d13b9	2026-03-07 20:39:42.006
af8b8cc6-8204-4ef1-88a9-40d47ea23380	61836065-2df8-4d71-b18b-c74280c73b04	59ddd6f4-8f0d-4266-9edf-b33608415c9f	2026-03-07 20:39:42.006
7f931ea9-f3aa-49cc-95d0-0a4f7771ddc2	61836065-2df8-4d71-b18b-c74280c73b04	0a7fb955-d759-4d74-ac56-e8d7b1c5d404	2026-03-07 20:39:42.006
caa356bd-6a1e-42d4-a5a7-a274c90c13fc	61836065-2df8-4d71-b18b-c74280c73b04	7d7bd5e1-b606-4235-bdb5-7bc5bfbd262d	2026-03-07 20:39:42.006
578d6a64-f84f-491c-a20a-3118a1f6fc50	61836065-2df8-4d71-b18b-c74280c73b04	b9be469b-7eca-4077-8695-9be3c082ebac	2026-03-07 20:39:42.006
4c1321bc-0c8f-4b0a-857b-f96f73851af6	61836065-2df8-4d71-b18b-c74280c73b04	2c94ff0b-1dd2-4608-8239-277c4e242e78	2026-03-07 20:39:42.006
b2f4cefe-5a96-40d4-9f8d-6800d4e5919b	61836065-2df8-4d71-b18b-c74280c73b04	9f6aa651-e975-44d1-b858-95c62cd59376	2026-03-07 20:39:42.006
c94202d8-a417-4f55-a649-f13bc40543c3	61836065-2df8-4d71-b18b-c74280c73b04	13fe8755-5bd6-4d66-b8c3-e6cf0d364d17	2026-03-07 20:39:42.006
8bd6d0cc-27e0-45b0-841e-6b711236fead	61836065-2df8-4d71-b18b-c74280c73b04	631ab374-1b44-4b18-91dd-0171ebbd3be4	2026-03-07 20:39:42.006
691eac9e-4f66-4098-9a5c-493ef8949a33	61836065-2df8-4d71-b18b-c74280c73b04	fcf6699c-e1e8-475b-b197-33d8dd60957f	2026-03-07 20:39:42.006
dc62d3f6-5e8c-43f0-9897-50e884252ce5	61836065-2df8-4d71-b18b-c74280c73b04	0c0bbf3d-8099-417d-903c-16ce534b9ac9	2026-03-07 20:39:42.006
3e8ba6e7-ead7-4b2f-a1ec-72a847908482	61836065-2df8-4d71-b18b-c74280c73b04	2fe635a7-18df-4bcd-aea9-663a79853b6f	2026-03-07 20:39:42.006
fc4d89a7-3bbd-4b5e-9afd-166a5939e60e	61836065-2df8-4d71-b18b-c74280c73b04	8fa4cf2b-04bb-410b-89c5-95cb69c5cb38	2026-03-07 20:39:42.006
b503f57f-e735-4519-943e-420dd5f8e945	61836065-2df8-4d71-b18b-c74280c73b04	846085ed-5fcc-4e65-adf3-e9e6f4e4cf5e	2026-03-07 20:39:42.006
83f42a99-d061-4181-aa15-c6266a36efe8	61836065-2df8-4d71-b18b-c74280c73b04	f6a194f0-237f-4df3-beb4-dd93c4c3c395	2026-03-07 20:39:42.006
4a0ad255-f6e7-417a-b491-4811cc3b4a7b	61836065-2df8-4d71-b18b-c74280c73b04	586fb0c3-5844-4d60-abcf-9dfd48f0e40f	2026-03-07 20:39:42.006
18907899-a198-4df9-aad0-ab9c91363cba	61836065-2df8-4d71-b18b-c74280c73b04	678dfc54-6aec-4cfd-9bb0-cb8cd7dbfa5d	2026-03-07 20:39:42.006
3db64286-9aa8-466f-a969-8d68149d71ae	61836065-2df8-4d71-b18b-c74280c73b04	a38cc19e-8984-48ec-96ae-58ec16aa148e	2026-03-07 20:39:42.006
92344285-a93e-4a3b-ac76-8a280eb67afd	61836065-2df8-4d71-b18b-c74280c73b04	7fb3d33b-ea64-4b0d-9086-e56fe8889edb	2026-03-07 20:39:42.006
c0ad5f48-d880-4a16-9207-43ae6e22d39f	61836065-2df8-4d71-b18b-c74280c73b04	c8cdeda0-0eae-4c20-81f9-df4fccf7dcf7	2026-03-07 20:39:42.006
f87f6705-4fa7-4b09-b054-1d90ec7d7e97	61836065-2df8-4d71-b18b-c74280c73b04	d3bf3071-34a9-4c7c-a63a-9381f482c95f	2026-03-07 20:39:42.006
15a728d9-1e80-4662-b4ae-eef569565ead	61836065-2df8-4d71-b18b-c74280c73b04	6cf6bf62-fda6-429f-a377-7f03f36b8ed0	2026-03-07 20:39:42.006
21534440-e36e-421d-8dd8-a70ede0e98de	61836065-2df8-4d71-b18b-c74280c73b04	967a6d36-cf5d-4123-84a8-bb2297d4fdfb	2026-03-07 20:39:42.006
b1128040-2bf4-4688-b1fc-12ad083aca01	61836065-2df8-4d71-b18b-c74280c73b04	b0a4357c-c1e4-43b5-be22-677f5cb8e16d	2026-03-07 20:39:42.006
d8030f06-c36c-464c-9c23-7e6de7d50ec4	61836065-2df8-4d71-b18b-c74280c73b04	fb45bb80-d617-4d93-a34d-da434f5affc8	2026-03-07 20:39:42.006
221e5451-ed6a-4025-ad6d-9f6f6e6270ee	61836065-2df8-4d71-b18b-c74280c73b04	8e06871f-ca0e-4509-b22a-2c891523c641	2026-03-07 20:39:42.006
0e2e8881-d4b9-424c-be7f-be84a29fb317	61836065-2df8-4d71-b18b-c74280c73b04	d645be12-d5a7-48f4-9c66-714849fec4b1	2026-03-07 20:39:42.006
0c437032-cf3f-4cc9-8200-13733036a100	61836065-2df8-4d71-b18b-c74280c73b04	aa3f44b9-f745-4f72-8818-e21ace37edaa	2026-03-07 20:39:42.006
24fa0c02-069f-4192-9349-a9e45117c2aa	61836065-2df8-4d71-b18b-c74280c73b04	835eec55-9fb6-4a0b-8cfd-4e686e13986b	2026-03-07 20:39:42.006
f6c8ce9b-3d9b-4930-881e-7d8ef2987739	61836065-2df8-4d71-b18b-c74280c73b04	df66d37c-744f-4e1f-be44-45f28903defc	2026-03-07 20:39:42.006
30396695-5725-46af-bf8e-e1b9b2558134	61836065-2df8-4d71-b18b-c74280c73b04	61959920-ff17-4453-9f73-872efcb38926	2026-03-07 20:39:42.006
2d79def5-405e-4f62-8225-793dd3af7a01	61836065-2df8-4d71-b18b-c74280c73b04	65b0332c-b406-4b1f-8dea-37e819334c55	2026-03-07 20:39:42.006
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "isSystemRole", "tenantId", "createdAt", "updatedAt") FROM stdin;
61836065-2df8-4d71-b18b-c74280c73b04	Yönetici	Tam yetkili sistem yöneticisi	t	cmmg5gp2v0007vmr8dgnfw7bu	2026-03-07 20:39:41.999	2026-03-07 20:39:41.999
\.


--
-- Data for Name: salary_payment_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_payment_details (id, "tenantId", salary_payment_id, cashbox_id, bank_account_id, amount, payment_method, reference_no, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: salary_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_payments (id, "tenantId", employee_id, plan_id, month, year, total_amount, payment_date, status, notes, created_by, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: salary_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_plans (id, "tenantId", employee_id, year, month, salary, bonus, total, status, paid_amount, remaining_amount, is_active, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_agents (id, full_name, phone, email, is_active, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales_delivery_note_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_delivery_note_items (id, "tenantId", delivery_note_id, product_id, quantity, unit_price, vat_rate, vat_amount, total_amount, invoiced_quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales_delivery_note_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_delivery_note_logs (id, delivery_note_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: sales_delivery_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_delivery_notes (id, delivery_note_no, date, "tenantId", account_id, warehouse_id, source_type, source_id, status, total_amount, vat_amount, grand_total, discount, notes, created_by, updated_by, deleted_at, deleted_by, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_order_items (id, "tenantId", order_id, product_id, quantity, unit_price, vat_rate, vat_amount, total_amount, delivered_quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales_order_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_order_logs (id, order_id, user_id, action_type, changes, ip_address, user_agent, "createdAt") FROM stdin;
\.


--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_orders (id, order_no, type, date, "tenantId", account_id, status, total_amount, vat_amount, grand_total, discount, notes, due_date, invoice_no, created_by, updated_by, deleted_by, deleted_at, "createdAt", "updatedAt", "deliveryNoteId") FROM stdin;
\.


--
-- Data for Name: service_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_invoices (id, "tenantId", "invoiceNo", "workOrderId", account_id, "issueDate", "dueDate", subtotal, "taxAmount", "grandTotal", currency, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "userId", token, "refreshToken", "ipAddress", "userAgent", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shelves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shelves (id, warehouse_id, code, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: simple_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.simple_orders (id, "tenantId", company_id, product_id, quantity, status, "createdAt", "updatedAt", supplied_quantity) FROM stdin;
\.


--
-- Data for Name: stock_cost_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_cost_history (id, product_id, cost, method, computed_at, brand, main_category, sub_category, note) FROM stdin;
\.


--
-- Data for Name: stock_moves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_moves (id, "productId", "fromWarehouseId", "fromLocationId", "toWarehouseId", "toLocationId", qty, "moveType", "refType", "refId", note, "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: stocktake_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocktake_items (id, stocktake_id, product_id, location_id, system_quantity, counted_quantity, difference, "createdAt") FROM stdin;
\.


--
-- Data for Name: stocktakes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocktakes (id, stocktake_no, "tenantId", stocktake_type, date, status, notes, created_by, updated_by, approved_by, approval_date, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, "tenantId", "planId", status, "startDate", "endDate", "trialEndsAt", "canceledAt", "nextBillingDate", "lastBillingDate", "autoRenew", "iyzicoSubscriptionRef", "additionalUsers", "createdAt", "updatedAt") FROM stdin;
cmmg5gp36000avmr8k2pccb5w	cmmg5gp2v0007vmr8dgnfw7bu	cmmg5gp2j0002vmr8vle3tz8n	TRIAL	2026-03-07 09:57:37.409	2026-03-21 09:57:37.409	2026-03-21 09:57:37.409	\N	\N	\N	t	\N	0	2026-03-07 09:57:37.41	2026-03-07 09:57:37.41
\.


--
-- Data for Name: system_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_parameters (id, "tenantId", key, value, description, category, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tenant_purge_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_purge_audits (id, "tenantId", "adminId", "adminEmail", "ipAddress", "deletedFiles", errors, "createdAt") FROM stdin;
\.


--
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_settings (id, "tenantId", "companyName", "taxNumber", address, "logoUrl", features, limits, timezone, locale, currency, "createdAt", "updatedAt", city, "companyType", country, district, email, "firstName", "lastName", "mersisNo", neighborhood, phone, "postalCode", "taxOffice", "tcNo", website) FROM stdin;
cmmg5gp2v0008vmr8djuyi6dl	cmmg5gp2v0007vmr8dgnfw7bu	Demo Şirket A.Ş.	1234567890	İstanbul, Türkiye	\N	\N	\N	Europe/Istanbul	tr-TR	TRY	2026-03-07 09:57:37.4	2026-03-07 09:57:37.4	\N	COMPANY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, uuid, name, subdomain, domain, status, "cancelledAt", "purgedAt", "createdAt", "updatedAt", "tenantType") FROM stdin;
cmmg5gp2v0007vmr8dgnfw7bu	cd899444-f832-477a-9122-8e6799099250	Demo Şirket	demo	demo.otomuhasebe.com	TRIAL	\N	\N	2026-03-07 09:57:37.4	2026-03-07 09:57:37.4	CORPORATE
\.


--
-- Data for Name: unit_sets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_sets (id, tenant_id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, unit_set_id, name, code, conversion_rate, is_base_unit, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_licenses (id, "userId", "licenseType", "moduleId", "assignedBy", "assignedAt", "revokedAt", "revokedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, uuid, email, username, password, "firstName", "lastName", "fullName", phone, "avatarUrl", role, department, status, "isActive", "refreshToken", "tokenVersion", "tenantId", "emailVerified", "lastLoginAt", "createdAt", "updatedAt", "roleId") FROM stdin;
1876f14c-f9ca-4b12-a2d2-c8fb38585d7f	a68e197c-a562-4947-a2c3-4bdd846e6456	admin@demo.otomuhasebe.com	demo-admin	$2b$10$/f92Dl9l7n3Th4DVpSWXgOT1FM56QO/bIXusj/42I2lytcTGKDBTG	Demo	Admin	Demo Admin	\N	\N	TENANT_ADMIN	\N	ACTIVE	t	\N	0	cmmg5gp2v0007vmr8dgnfw7bu	f	\N	2026-03-07 09:57:37.462	2026-03-07 09:57:37.462	\N
373baa44-4d91-41ad-8efd-6235ffc74e0d	3f7c9464-114a-42cf-9854-09ff8b0270af	info@azemyazilim.com	info@azemyazilim.com	$2b$10$MM7jOkXZ0dbYCM4/NQSdWe87CYNrsBmBG.F2zFaeaN5Vge600LHjW	Super	Admin	Super Admin	\N	\N	SUPER_ADMIN	\N	ACTIVE	t	$2b$10$MEa8VNQnMX1zN2RoL5r45OTEJO3bLj9apjsdCAV9/QrAJqjKQUYuK	0	cmmg5gp2v0007vmr8dgnfw7bu	f	2026-03-07 20:26:44.778	2026-03-07 09:57:37.47	2026-03-07 20:39:42.071	61836065-2df8-4d71-b18b-c74280c73b04
\.


--
-- Data for Name: vehicle_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_catalog (id, brand, model, engine_volume, fuel_type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: vehicle_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_expenses (id, "tenantId", "vehicleId", expense_type, date, amount, notes, document_no, mileage, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_critical_stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_critical_stocks (id, "warehouseId", "productId", "criticalQty", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfer_items (id, "transferId", product_id, quantity, "fromLocationId", "toLocationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfer_logs (id, "transferId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfers (id, "transferNo", "tenantId", date, "fromWarehouseId", "toWarehouseId", status, "driverName", "vehiclePlate", notes, prepared_by_id, approved_by_id, received_by_id, shipping_date, delivery_date, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, code, "tenantId", name, active, address, phone, manager, "createdAt", "updatedAt", "isDefault") FROM stdin;
007358a0-5d0c-4ce9-9b03-031aa2b7ea04	01	cmmg5gp2v0007vmr8dgnfw7bu	Seyhan	t			\N	2026-03-07 19:49:11.48	2026-03-07 19:49:11.48	t
\.


--
-- Data for Name: work_order_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_activities (id, "workOrderId", action, "userId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: work_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_items (id, "workOrderId", type, description, product_id, quantity, "unitPrice", "taxRate", "taxAmount", "totalPrice", version, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_orders (id, "workOrderNo", "tenantId", status, "partWorkflowStatus", "vehicleWorkflowStatus", "customerVehicleId", account_id, "technicianId", description, "diagnosisNotes", "supplyResponseNotes", "estimatedCompletionDate", "actualCompletionDate", "totalLaborCost", "totalPartsCost", "taxAmount", "grandTotal", version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: einvoice_inbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.einvoice_inbox_id_seq', 1, false);


--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hizli_tokens_id_seq', 1, false);


--
-- Name: account_addresses account_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_addresses
    ADD CONSTRAINT account_addresses_pkey PRIMARY KEY (id);


--
-- Name: account_banks account_banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_banks
    ADD CONSTRAINT account_banks_pkey PRIMARY KEY (id);


--
-- Name: account_contacts account_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_contacts
    ADD CONSTRAINT account_contacts_pkey PRIMARY KEY (id);


--
-- Name: account_movements account_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_movements
    ADD CONSTRAINT account_movements_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: advance_settlements advance_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_settlements
    ADD CONSTRAINT advance_settlements_pkey PRIMARY KEY (id);


--
-- Name: advances advances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_account_movements bank_account_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_movements
    ADD CONSTRAINT bank_account_movements_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_loan_plans bank_loan_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_loan_plans
    ADD CONSTRAINT bank_loan_plans_pkey PRIMARY KEY (id);


--
-- Name: bank_loans bank_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_loans
    ADD CONSTRAINT bank_loans_pkey PRIMARY KEY (id);


--
-- Name: bank_transfer_logs bank_transfer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfer_logs
    ADD CONSTRAINT bank_transfer_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_transfers bank_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_pkey PRIMARY KEY (id);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: cashbox_movements cashbox_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashbox_movements
    ADD CONSTRAINT cashbox_movements_pkey PRIMARY KEY (id);


--
-- Name: cashboxes cashboxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes
    ADD CONSTRAINT cashboxes_pkey PRIMARY KEY (id);


--
-- Name: check_bill_journal_items check_bill_journal_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journal_items
    ADD CONSTRAINT check_bill_journal_items_pkey PRIMARY KEY (id);


--
-- Name: check_bill_journals check_bill_journals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journals
    ADD CONSTRAINT check_bill_journals_pkey PRIMARY KEY (id);


--
-- Name: check_bill_logs check_bill_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_logs
    ADD CONSTRAINT check_bill_logs_pkey PRIMARY KEY (id);


--
-- Name: checks_bills checks_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_pkey PRIMARY KEY (id);


--
-- Name: code_templates code_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT code_templates_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: company_credit_card_movements company_credit_card_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_card_movements
    ADD CONSTRAINT company_credit_card_movements_pkey PRIMARY KEY (id);


--
-- Name: company_credit_card_reminders company_credit_card_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_card_reminders
    ADD CONSTRAINT company_credit_card_reminders_pkey PRIMARY KEY (id);


--
-- Name: company_credit_cards company_credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_cards
    ADD CONSTRAINT company_credit_cards_pkey PRIMARY KEY (id);


--
-- Name: company_vehicles company_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT company_vehicles_pkey PRIMARY KEY (id);


--
-- Name: customer_vehicles customer_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_pkey PRIMARY KEY (id);


--
-- Name: deleted_bank_transfers deleted_bank_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_bank_transfers
    ADD CONSTRAINT deleted_bank_transfers_pkey PRIMARY KEY (id);


--
-- Name: deleted_checks_bills deleted_checks_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_checks_bills
    ADD CONSTRAINT deleted_checks_bills_pkey PRIMARY KEY (id);


--
-- Name: einvoice_inbox einvoice_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.einvoice_inbox
    ADD CONSTRAINT einvoice_inbox_pkey PRIMARY KEY (id);


--
-- Name: einvoice_xml einvoice_xml_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.einvoice_xml
    ADD CONSTRAINT einvoice_xml_pkey PRIMARY KEY (id);


--
-- Name: employee_payments employee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_payments
    ADD CONSTRAINT employee_payments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: equivalency_groups equivalency_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equivalency_groups
    ADD CONSTRAINT equivalency_groups_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: hizli_tokens hizli_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hizli_tokens
    ADD CONSTRAINT hizli_tokens_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invoice_collections invoice_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_collections
    ADD CONSTRAINT invoice_collections_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_logs invoice_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_logs
    ADD CONSTRAINT invoice_logs_pkey PRIMARY KEY (id);


--
-- Name: invoice_payment_plans invoice_payment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_payment_plans
    ADD CONSTRAINT invoice_payment_plans_pkey PRIMARY KEY (id);


--
-- Name: invoice_profit invoice_profit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: module_licenses module_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT module_licenses_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: order_pickings order_pickings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_pickings
    ADD CONSTRAINT order_pickings_pkey PRIMARY KEY (id);


--
-- Name: part_requests part_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT part_requests_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: pos_payments pos_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_pkey PRIMARY KEY (id);


--
-- Name: pos_sessions pos_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT pos_sessions_pkey PRIMARY KEY (id);


--
-- Name: postal_codes postal_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_codes
    ADD CONSTRAINT postal_codes_pkey PRIMARY KEY (id);


--
-- Name: price_cards price_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_pkey PRIMARY KEY (id);


--
-- Name: price_list_items price_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_pkey PRIMARY KEY (id);


--
-- Name: price_lists price_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_pkey PRIMARY KEY (id);


--
-- Name: procurement_orders procurement_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT procurement_orders_pkey PRIMARY KEY (id);


--
-- Name: product_barcodes product_barcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT product_barcodes_pkey PRIMARY KEY (id);


--
-- Name: product_equivalents product_equivalents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_equivalents
    ADD CONSTRAINT product_equivalents_pkey PRIMARY KEY (id);


--
-- Name: product_location_stocks product_location_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT product_location_stocks_pkey PRIMARY KEY (id);


--
-- Name: product_movements product_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_movements
    ADD CONSTRAINT product_movements_pkey PRIMARY KEY (id);


--
-- Name: product_shelves product_shelves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_shelves
    ADD CONSTRAINT product_shelves_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_delivery_note_items purchase_delivery_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_items
    ADD CONSTRAINT purchase_delivery_note_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_delivery_note_logs purchase_delivery_note_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_logs
    ADD CONSTRAINT purchase_delivery_note_logs_pkey PRIMARY KEY (id);


--
-- Name: purchase_delivery_notes purchase_delivery_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_local_items purchase_order_local_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_items
    ADD CONSTRAINT purchase_order_local_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_local_logs purchase_order_local_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_logs
    ADD CONSTRAINT purchase_order_local_logs_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quote_logs quote_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_logs
    ADD CONSTRAINT quote_logs_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salary_payment_details salary_payment_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payment_details
    ADD CONSTRAINT salary_payment_details_pkey PRIMARY KEY (id);


--
-- Name: salary_payments salary_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_pkey PRIMARY KEY (id);


--
-- Name: salary_plans salary_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_plans
    ADD CONSTRAINT salary_plans_pkey PRIMARY KEY (id);


--
-- Name: sales_agents sales_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_agents
    ADD CONSTRAINT sales_agents_pkey PRIMARY KEY (id);


--
-- Name: sales_delivery_note_items sales_delivery_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_items
    ADD CONSTRAINT sales_delivery_note_items_pkey PRIMARY KEY (id);


--
-- Name: sales_delivery_note_logs sales_delivery_note_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_logs
    ADD CONSTRAINT sales_delivery_note_logs_pkey PRIMARY KEY (id);


--
-- Name: sales_delivery_notes sales_delivery_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_pkey PRIMARY KEY (id);


--
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- Name: sales_order_logs sales_order_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_logs
    ADD CONSTRAINT sales_order_logs_pkey PRIMARY KEY (id);


--
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- Name: service_invoices service_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT service_invoices_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: shelves shelves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelves
    ADD CONSTRAINT shelves_pkey PRIMARY KEY (id);


--
-- Name: simple_orders simple_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simple_orders
    ADD CONSTRAINT simple_orders_pkey PRIMARY KEY (id);


--
-- Name: stock_cost_history stock_cost_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_pkey PRIMARY KEY (id);


--
-- Name: stock_moves stock_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_pkey PRIMARY KEY (id);


--
-- Name: stocktake_items stocktake_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktake_items
    ADD CONSTRAINT stocktake_items_pkey PRIMARY KEY (id);


--
-- Name: stocktakes stocktakes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktakes
    ADD CONSTRAINT stocktakes_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: system_parameters system_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT system_parameters_pkey PRIMARY KEY (id);


--
-- Name: tenant_purge_audits tenant_purge_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT tenant_purge_audits_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: unit_sets unit_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_sets
    ADD CONSTRAINT unit_sets_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: user_licenses user_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT user_licenses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_catalog vehicle_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_catalog
    ADD CONSTRAINT vehicle_catalog_pkey PRIMARY KEY (id);


--
-- Name: vehicle_expenses vehicle_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT vehicle_expenses_pkey PRIMARY KEY (id);


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT warehouse_critical_stocks_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_items warehouse_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT warehouse_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT warehouse_transfer_logs_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfers warehouse_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: work_order_activities work_order_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT work_order_activities_pkey PRIMARY KEY (id);


--
-- Name: work_order_items work_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: account_addresses_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_addresses_account_id_idx ON public.account_addresses USING btree (account_id);


--
-- Name: account_banks_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_banks_account_id_idx ON public.account_banks USING btree (account_id);


--
-- Name: account_contacts_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_contacts_account_id_idx ON public.account_contacts USING btree (account_id);


--
-- Name: account_movements_account_id_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_movements_account_id_date_idx ON public.account_movements USING btree (account_id, date);


--
-- Name: account_movements_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "account_movements_tenantId_idx" ON public.account_movements USING btree ("tenantId");


--
-- Name: accounts_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "accounts_code_tenantId_key" ON public.accounts USING btree (code, "tenantId");


--
-- Name: accounts_tenantId_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "accounts_tenantId_code_idx" ON public.accounts USING btree ("tenantId", code);


--
-- Name: accounts_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "accounts_tenantId_idx" ON public.accounts USING btree ("tenantId");


--
-- Name: advance_settlements_advance_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX advance_settlements_advance_id_idx ON public.advance_settlements USING btree (advance_id);


--
-- Name: advance_settlements_salary_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX advance_settlements_salary_plan_id_idx ON public.advance_settlements USING btree (salary_plan_id);


--
-- Name: advance_settlements_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "advance_settlements_tenantId_idx" ON public.advance_settlements USING btree ("tenantId");


--
-- Name: advances_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX advances_date_idx ON public.advances USING btree (date);


--
-- Name: advances_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX advances_employee_id_idx ON public.advances USING btree (employee_id);


--
-- Name: advances_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "advances_tenantId_idx" ON public.advances USING btree ("tenantId");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_idx" ON public.audit_logs USING btree ("tenantId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: bank_account_movements_bank_account_id_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_account_movements_bank_account_id_date_idx ON public.bank_account_movements USING btree (bank_account_id, date);


--
-- Name: bank_account_movements_movement_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_account_movements_movement_type_idx ON public.bank_account_movements USING btree (movement_type);


--
-- Name: bank_accounts_bank_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_accounts_bank_id_idx ON public.bank_accounts USING btree (bank_id);


--
-- Name: bank_accounts_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bank_accounts_code_key ON public.bank_accounts USING btree (code);


--
-- Name: bank_accounts_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_accounts_type_idx ON public.bank_accounts USING btree (type);


--
-- Name: bank_loan_plans_loan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_loan_plans_loan_id_idx ON public.bank_loan_plans USING btree (loan_id);


--
-- Name: bank_loans_bank_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_loans_bank_account_id_idx ON public.bank_loans USING btree (bank_account_id);


--
-- Name: bank_transfer_logs_bank_transfer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfer_logs_bank_transfer_id_idx ON public.bank_transfer_logs USING btree (bank_transfer_id);


--
-- Name: bank_transfer_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfer_logs_user_id_idx ON public.bank_transfer_logs USING btree (user_id);


--
-- Name: bank_transfers_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfers_account_id_idx ON public.bank_transfers USING btree (account_id);


--
-- Name: bank_transfers_cashbox_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfers_cashbox_id_idx ON public.bank_transfers USING btree (cashbox_id);


--
-- Name: bank_transfers_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfers_date_idx ON public.bank_transfers USING btree (date);


--
-- Name: bank_transfers_tenantId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bank_transfers_tenantId_date_idx" ON public.bank_transfers USING btree ("tenantId", date);


--
-- Name: bank_transfers_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bank_transfers_tenantId_idx" ON public.bank_transfers USING btree ("tenantId");


--
-- Name: bank_transfers_transfer_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bank_transfers_transfer_type_idx ON public.bank_transfers USING btree (transfer_type);


--
-- Name: banks_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banks_tenantId_idx" ON public.banks USING btree ("tenantId");


--
-- Name: cashbox_movements_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cashbox_movements_account_id_idx ON public.cashbox_movements USING btree (account_id);


--
-- Name: cashbox_movements_cashbox_id_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cashbox_movements_cashbox_id_date_idx ON public.cashbox_movements USING btree (cashbox_id, date);


--
-- Name: cashbox_movements_is_transferred_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cashbox_movements_is_transferred_idx ON public.cashbox_movements USING btree (is_transferred);


--
-- Name: cashboxes_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "cashboxes_code_tenantId_key" ON public.cashboxes USING btree (code, "tenantId");


--
-- Name: cashboxes_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cashboxes_is_active_idx ON public.cashboxes USING btree (is_active);


--
-- Name: cashboxes_tenantId_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cashboxes_tenantId_code_idx" ON public.cashboxes USING btree ("tenantId", code);


--
-- Name: cashboxes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cashboxes_tenantId_idx" ON public.cashboxes USING btree ("tenantId");


--
-- Name: cashboxes_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cashboxes_type_idx ON public.cashboxes USING btree (type);


--
-- Name: check_bill_journal_items_check_bill_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_bill_journal_items_check_bill_id_idx ON public.check_bill_journal_items USING btree (check_bill_id);


--
-- Name: check_bill_journal_items_journal_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_bill_journal_items_journal_id_idx ON public.check_bill_journal_items USING btree (journal_id);


--
-- Name: check_bill_journal_items_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "check_bill_journal_items_tenantId_idx" ON public.check_bill_journal_items USING btree ("tenantId");


--
-- Name: check_bill_logs_check_bill_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_bill_logs_check_bill_id_idx ON public.check_bill_logs USING btree (check_bill_id);


--
-- Name: check_bill_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_bill_logs_user_id_idx ON public.check_bill_logs USING btree (user_id);


--
-- Name: checks_bills_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checks_bills_account_id_idx ON public.checks_bills USING btree (account_id);


--
-- Name: checks_bills_due_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checks_bills_due_date_idx ON public.checks_bills USING btree (due_date);


--
-- Name: checks_bills_portfolio_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checks_bills_portfolio_type_idx ON public.checks_bills USING btree (portfolio_type);


--
-- Name: checks_bills_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checks_bills_status_idx ON public.checks_bills USING btree (status);


--
-- Name: checks_bills_tenantId_due_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "checks_bills_tenantId_due_date_idx" ON public.checks_bills USING btree ("tenantId", due_date);


--
-- Name: checks_bills_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "checks_bills_tenantId_idx" ON public.checks_bills USING btree ("tenantId");


--
-- Name: checks_bills_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checks_bills_type_idx ON public.checks_bills USING btree (type);


--
-- Name: code_templates_module_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "code_templates_module_tenantId_key" ON public.code_templates USING btree (module, "tenantId");


--
-- Name: collections_tenantId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "collections_tenantId_date_idx" ON public.collections USING btree ("tenantId", date);


--
-- Name: collections_tenantId_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "collections_tenantId_deleted_at_idx" ON public.collections USING btree ("tenantId", deleted_at);


--
-- Name: collections_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "collections_tenantId_idx" ON public.collections USING btree ("tenantId");


--
-- Name: company_credit_card_movements_card_id_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_credit_card_movements_card_id_date_idx ON public.company_credit_card_movements USING btree (card_id, date);


--
-- Name: company_credit_card_reminders_card_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_credit_card_reminders_card_id_idx ON public.company_credit_card_reminders USING btree (card_id);


--
-- Name: company_credit_card_reminders_card_id_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX company_credit_card_reminders_card_id_type_key ON public.company_credit_card_reminders USING btree (card_id, type);


--
-- Name: company_credit_card_reminders_day_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_credit_card_reminders_day_is_active_idx ON public.company_credit_card_reminders USING btree (day, is_active);


--
-- Name: company_credit_cards_cashbox_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_credit_cards_cashbox_id_idx ON public.company_credit_cards USING btree (cashbox_id);


--
-- Name: company_credit_cards_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX company_credit_cards_code_key ON public.company_credit_cards USING btree (code);


--
-- Name: company_vehicles_assigned_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_vehicles_assigned_employee_id_idx ON public.company_vehicles USING btree (assigned_employee_id);


--
-- Name: company_vehicles_plate_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "company_vehicles_plate_tenantId_key" ON public.company_vehicles USING btree (plate, "tenantId");


--
-- Name: company_vehicles_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "company_vehicles_tenantId_idx" ON public.company_vehicles USING btree ("tenantId");


--
-- Name: customer_vehicles_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_vehicles_account_id_idx ON public.customer_vehicles USING btree (account_id);


--
-- Name: customer_vehicles_chassis_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "customer_vehicles_chassis_no_tenantId_key" ON public.customer_vehicles USING btree (chassis_no, "tenantId");


--
-- Name: customer_vehicles_plate_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "customer_vehicles_plate_tenantId_key" ON public.customer_vehicles USING btree (plate, "tenantId");


--
-- Name: customer_vehicles_service_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customer_vehicles_service_status_idx ON public.customer_vehicles USING btree (service_status);


--
-- Name: customer_vehicles_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customer_vehicles_tenantId_idx" ON public.customer_vehicles USING btree ("tenantId");


--
-- Name: deleted_bank_transfers_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_bank_transfers_account_id_idx ON public.deleted_bank_transfers USING btree (account_id);


--
-- Name: deleted_bank_transfers_cashbox_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_bank_transfers_cashbox_id_idx ON public.deleted_bank_transfers USING btree (cashbox_id);


--
-- Name: deleted_bank_transfers_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_bank_transfers_deleted_at_idx ON public.deleted_bank_transfers USING btree (deleted_at);


--
-- Name: deleted_bank_transfers_original_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_bank_transfers_original_id_idx ON public.deleted_bank_transfers USING btree (original_id);


--
-- Name: deleted_checks_bills_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_checks_bills_account_id_idx ON public.deleted_checks_bills USING btree (account_id);


--
-- Name: deleted_checks_bills_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_checks_bills_deleted_at_idx ON public.deleted_checks_bills USING btree (deleted_at);


--
-- Name: deleted_checks_bills_original_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deleted_checks_bills_original_id_idx ON public.deleted_checks_bills USING btree (original_id);


--
-- Name: einvoice_inbox_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "einvoice_inbox_createdAt_idx" ON public.einvoice_inbox USING btree ("createdAt");


--
-- Name: einvoice_inbox_ettn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX einvoice_inbox_ettn_key ON public.einvoice_inbox USING btree (ettn);


--
-- Name: einvoice_inbox_senderVkn_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "einvoice_inbox_senderVkn_idx" ON public.einvoice_inbox USING btree ("senderVkn");


--
-- Name: einvoice_xml_invoice_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX einvoice_xml_invoice_id_key ON public.einvoice_xml USING btree (invoice_id);


--
-- Name: employee_payments_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employee_payments_date_idx ON public.employee_payments USING btree (date);


--
-- Name: employee_payments_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employee_payments_employee_id_idx ON public.employee_payments USING btree (employee_id);


--
-- Name: employee_payments_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employee_payments_type_idx ON public.employee_payments USING btree (type);


--
-- Name: employees_department_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_department_idx ON public.employees USING btree (department);


--
-- Name: employees_employee_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "employees_employee_code_tenantId_key" ON public.employees USING btree (employee_code, "tenantId");


--
-- Name: employees_identity_number_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "employees_identity_number_tenantId_key" ON public.employees USING btree (identity_number, "tenantId");


--
-- Name: employees_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employees_is_active_idx ON public.employees USING btree (is_active);


--
-- Name: employees_tenantId_employee_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "employees_tenantId_employee_code_idx" ON public.employees USING btree ("tenantId", employee_code);


--
-- Name: employees_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "employees_tenantId_idx" ON public.employees USING btree ("tenantId");


--
-- Name: expense_categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX expense_categories_name_key ON public.expense_categories USING btree (name);


--
-- Name: expenses_tenantId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "expenses_tenantId_date_idx" ON public.expenses USING btree ("tenantId", date);


--
-- Name: expenses_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "expenses_tenantId_idx" ON public.expenses USING btree ("tenantId");


--
-- Name: hizli_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "hizli_tokens_expiresAt_idx" ON public.hizli_tokens USING btree ("expiresAt");


--
-- Name: hizli_tokens_loginHash_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "hizli_tokens_loginHash_idx" ON public.hizli_tokens USING btree ("loginHash");


--
-- Name: inventory_transactions_partRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_transactions_partRequestId_idx" ON public.inventory_transactions USING btree ("partRequestId");


--
-- Name: inventory_transactions_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transactions_product_id_idx ON public.inventory_transactions USING btree (product_id);


--
-- Name: inventory_transactions_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_transactions_tenantId_createdAt_idx" ON public.inventory_transactions USING btree ("tenantId", "createdAt");


--
-- Name: inventory_transactions_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_transactions_tenantId_idx" ON public.inventory_transactions USING btree ("tenantId");


--
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_email_idx ON public.invitations USING btree (email);


--
-- Name: invitations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_status_idx ON public.invitations USING btree (status);


--
-- Name: invitations_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invitations_tenantId_idx" ON public.invitations USING btree ("tenantId");


--
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_token_idx ON public.invitations USING btree (token);


--
-- Name: invitations_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invitations_token_key ON public.invitations USING btree (token);


--
-- Name: invoice_collections_invoice_id_collection_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoice_collections_invoice_id_collection_id_key ON public.invoice_collections USING btree (invoice_id, collection_id);


--
-- Name: invoice_collections_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_collections_tenantId_idx" ON public.invoice_collections USING btree ("tenantId");


--
-- Name: invoice_items_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_items_invoice_id_idx ON public.invoice_items USING btree (invoice_id);


--
-- Name: invoice_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_items_product_id_idx ON public.invoice_items USING btree (product_id);


--
-- Name: invoice_logs_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_logs_invoice_id_idx ON public.invoice_logs USING btree (invoice_id);


--
-- Name: invoice_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_logs_user_id_idx ON public.invoice_logs USING btree (user_id);


--
-- Name: invoice_payment_plans_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_payment_plans_invoice_id_idx ON public.invoice_payment_plans USING btree (invoice_id);


--
-- Name: invoice_profit_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_profit_invoice_id_idx ON public.invoice_profit USING btree (invoice_id);


--
-- Name: invoice_profit_invoice_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_profit_invoice_item_id_idx ON public.invoice_profit USING btree (invoice_item_id);


--
-- Name: invoice_profit_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoice_profit_product_id_idx ON public.invoice_profit USING btree (product_id);


--
-- Name: invoice_profit_tenantId_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_profit_tenantId_invoice_id_idx" ON public.invoice_profit USING btree ("tenantId", invoice_id);


--
-- Name: invoices_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_account_id_idx ON public.invoices USING btree (account_id);


--
-- Name: invoices_delivery_note_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_delivery_note_id_idx ON public.invoices USING btree (delivery_note_id);


--
-- Name: invoices_einvoice_ettn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_einvoice_ettn_key ON public.invoices USING btree (einvoice_ettn);


--
-- Name: invoices_invoice_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_invoice_no_tenantId_key" ON public.invoices USING btree (invoice_no, "tenantId");


--
-- Name: invoices_procurement_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_procurement_order_id_key ON public.invoices USING btree (procurement_order_id);


--
-- Name: invoices_purchase_delivery_note_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_purchase_delivery_note_id_key ON public.invoices USING btree (purchase_delivery_note_id);


--
-- Name: invoices_purchase_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_purchase_order_id_key ON public.invoices USING btree (purchase_order_id);


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: invoices_tenantId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_tenantId_date_idx" ON public.invoices USING btree ("tenantId", date);


--
-- Name: invoices_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_tenantId_idx" ON public.invoices USING btree ("tenantId");


--
-- Name: invoices_tenantId_invoice_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_tenantId_invoice_type_idx" ON public.invoices USING btree ("tenantId", invoice_type);


--
-- Name: invoices_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_tenantId_status_idx" ON public.invoices USING btree ("tenantId", status);


--
-- Name: invoices_warehouse_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_warehouse_id_idx ON public.invoices USING btree (warehouse_id);


--
-- Name: journal_entries_entryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "journal_entries_entryDate_idx" ON public.journal_entries USING btree ("entryDate");


--
-- Name: journal_entries_serviceInvoiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "journal_entries_serviceInvoiceId_key" ON public.journal_entries USING btree ("serviceInvoiceId");


--
-- Name: journal_entries_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "journal_entries_tenantId_idx" ON public.journal_entries USING btree ("tenantId");


--
-- Name: journal_entries_tenantId_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "journal_entries_tenantId_referenceType_referenceId_idx" ON public.journal_entries USING btree ("tenantId", "referenceType", "referenceId");


--
-- Name: journal_entry_lines_journalEntryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "journal_entry_lines_journalEntryId_idx" ON public.journal_entry_lines USING btree ("journalEntryId");


--
-- Name: locations_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX locations_barcode_idx ON public.locations USING btree (barcode);


--
-- Name: locations_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX locations_barcode_key ON public.locations USING btree (barcode);


--
-- Name: locations_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX locations_code_idx ON public.locations USING btree (code);


--
-- Name: locations_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX locations_code_key ON public.locations USING btree (code);


--
-- Name: locations_warehouseId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON public.locations USING btree ("warehouseId", code);


--
-- Name: locations_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "locations_warehouseId_idx" ON public.locations USING btree ("warehouseId");


--
-- Name: module_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "module_licenses_moduleId_idx" ON public.module_licenses USING btree ("moduleId");


--
-- Name: module_licenses_subscriptionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "module_licenses_subscriptionId_idx" ON public.module_licenses USING btree ("subscriptionId");


--
-- Name: modules_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "modules_isActive_idx" ON public.modules USING btree ("isActive");


--
-- Name: modules_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX modules_slug_idx ON public.modules USING btree (slug);


--
-- Name: modules_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX modules_slug_key ON public.modules USING btree (slug);


--
-- Name: order_pickings_location_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_pickings_location_id_idx ON public.order_pickings USING btree (location_id);


--
-- Name: order_pickings_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_pickings_order_id_idx ON public.order_pickings USING btree (order_id);


--
-- Name: order_pickings_order_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_pickings_order_item_id_idx ON public.order_pickings USING btree (order_item_id);


--
-- Name: part_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX part_requests_status_idx ON public.part_requests USING btree (status);


--
-- Name: part_requests_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "part_requests_tenantId_idx" ON public.part_requests USING btree ("tenantId");


--
-- Name: part_requests_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "part_requests_workOrderId_idx" ON public.part_requests USING btree ("workOrderId");


--
-- Name: payments_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_conversationId_idx" ON public.payments USING btree ("conversationId");


--
-- Name: payments_conversationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_conversationId_key" ON public.payments USING btree ("conversationId");


--
-- Name: payments_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_createdAt_idx" ON public.payments USING btree ("createdAt");


--
-- Name: payments_iyzicoPaymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_iyzicoPaymentId_idx" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoPaymentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_iyzicoPaymentId_key" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_iyzicoToken_key" ON public.payments USING btree ("iyzicoToken");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_subscriptionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_subscriptionId_idx" ON public.payments USING btree ("subscriptionId");


--
-- Name: permissions_module_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_module_action_key ON public.permissions USING btree (module, action);


--
-- Name: plans_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "plans_isActive_idx" ON public.plans USING btree ("isActive");


--
-- Name: plans_isBasePlan_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "plans_isBasePlan_idx" ON public.plans USING btree ("isBasePlan");


--
-- Name: plans_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX plans_slug_idx ON public.plans USING btree (slug);


--
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- Name: pos_payments_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pos_payments_invoice_id_idx ON public.pos_payments USING btree (invoice_id);


--
-- Name: pos_payments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pos_payments_tenantId_idx" ON public.pos_payments USING btree ("tenantId");


--
-- Name: pos_sessions_cashier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pos_sessions_cashier_id_idx ON public.pos_sessions USING btree (cashier_id);


--
-- Name: pos_sessions_session_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "pos_sessions_session_no_tenantId_key" ON public.pos_sessions USING btree (session_no, "tenantId");


--
-- Name: pos_sessions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pos_sessions_status_idx ON public.pos_sessions USING btree (status);


--
-- Name: pos_sessions_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pos_sessions_tenantId_idx" ON public.pos_sessions USING btree ("tenantId");


--
-- Name: postal_codes_city_district_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_district_idx ON public.postal_codes USING btree (city, district);


--
-- Name: postal_codes_city_district_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_district_neighborhood_idx ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_district_neighborhood_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX postal_codes_city_district_neighborhood_key ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_idx ON public.postal_codes USING btree (city);


--
-- Name: postal_codes_district_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_district_idx ON public.postal_codes USING btree (district);


--
-- Name: postal_codes_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_neighborhood_idx ON public.postal_codes USING btree (neighborhood);


--
-- Name: postal_codes_postalCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "postal_codes_postalCode_idx" ON public.postal_codes USING btree ("postalCode");


--
-- Name: price_cards_product_id_type_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX price_cards_product_id_type_created_at_idx ON public.price_cards USING btree (product_id, type, created_at);


--
-- Name: price_list_items_price_list_id_product_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX price_list_items_price_list_id_product_id_key ON public.price_list_items USING btree (price_list_id, product_id);


--
-- Name: price_list_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX price_list_items_product_id_idx ON public.price_list_items USING btree (product_id);


--
-- Name: price_lists_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "price_lists_tenantId_idx" ON public.price_lists USING btree ("tenantId");


--
-- Name: procurement_orders_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX procurement_orders_account_id_idx ON public.procurement_orders USING btree (account_id);


--
-- Name: procurement_orders_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX procurement_orders_date_idx ON public.procurement_orders USING btree (date);


--
-- Name: procurement_orders_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "procurement_orders_deliveryNoteId_key" ON public.procurement_orders USING btree ("deliveryNoteId");


--
-- Name: procurement_orders_order_no_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX procurement_orders_order_no_idx ON public.procurement_orders USING btree (order_no);


--
-- Name: procurement_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX procurement_orders_status_idx ON public.procurement_orders USING btree (status);


--
-- Name: procurement_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "procurement_orders_tenantId_idx" ON public.procurement_orders USING btree ("tenantId");


--
-- Name: product_barcodes_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_barcodes_barcode_idx ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_barcodes_barcode_key ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_barcodes_productId_idx" ON public.product_barcodes USING btree ("productId");


--
-- Name: product_equivalents_product1_id_product2_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_equivalents_product1_id_product2_id_key ON public.product_equivalents USING btree (product1_id, product2_id);


--
-- Name: product_location_stocks_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_locationId_idx" ON public.product_location_stocks USING btree ("locationId");


--
-- Name: product_location_stocks_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_productId_idx" ON public.product_location_stocks USING btree ("productId");


--
-- Name: product_location_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_warehouseId_idx" ON public.product_location_stocks USING btree ("warehouseId");


--
-- Name: product_location_stocks_warehouseId_locationId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_location_stocks_warehouseId_locationId_productId_key" ON public.product_location_stocks USING btree ("warehouseId", "locationId", "productId");


--
-- Name: product_movements_invoice_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_movements_invoice_item_id_idx ON public.product_movements USING btree (invoice_item_id);


--
-- Name: product_movements_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_movements_tenantId_idx" ON public.product_movements USING btree ("tenantId");


--
-- Name: product_shelves_product_id_shelf_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_shelves_product_id_shelf_id_key ON public.product_shelves USING btree (product_id, shelf_id);


--
-- Name: products_barcode_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "products_barcode_tenantId_key" ON public.products USING btree (barcode, "tenantId");


--
-- Name: products_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "products_code_tenantId_key" ON public.products USING btree (code, "tenantId");


--
-- Name: products_tenantId_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_tenantId_barcode_idx" ON public.products USING btree ("tenantId", barcode);


--
-- Name: products_tenantId_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_tenantId_code_idx" ON public.products USING btree ("tenantId", code);


--
-- Name: products_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_tenantId_idx" ON public.products USING btree ("tenantId");


--
-- Name: purchase_delivery_note_items_delivery_note_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_note_items_delivery_note_id_idx ON public.purchase_delivery_note_items USING btree (delivery_note_id);


--
-- Name: purchase_delivery_note_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_note_items_product_id_idx ON public.purchase_delivery_note_items USING btree (product_id);


--
-- Name: purchase_delivery_note_items_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_delivery_note_items_tenantId_idx" ON public.purchase_delivery_note_items USING btree ("tenantId");


--
-- Name: purchase_delivery_note_logs_delivery_note_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_note_logs_delivery_note_id_idx ON public.purchase_delivery_note_logs USING btree (delivery_note_id);


--
-- Name: purchase_delivery_note_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_delivery_note_logs_tenantId_idx" ON public.purchase_delivery_note_logs USING btree ("tenantId");


--
-- Name: purchase_delivery_note_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_note_logs_user_id_idx ON public.purchase_delivery_note_logs USING btree (user_id);


--
-- Name: purchase_delivery_notes_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_notes_account_id_idx ON public.purchase_delivery_notes USING btree (account_id);


--
-- Name: purchase_delivery_notes_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_notes_date_idx ON public.purchase_delivery_notes USING btree (date);


--
-- Name: purchase_delivery_notes_delivery_note_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "purchase_delivery_notes_delivery_note_no_tenantId_key" ON public.purchase_delivery_notes USING btree (delivery_note_no, "tenantId");


--
-- Name: purchase_delivery_notes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_delivery_notes_status_idx ON public.purchase_delivery_notes USING btree (status);


--
-- Name: purchase_delivery_notes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_delivery_notes_tenantId_idx" ON public.purchase_delivery_notes USING btree ("tenantId");


--
-- Name: purchase_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_product_id_idx ON public.purchase_order_items USING btree (product_id);


--
-- Name: purchase_order_items_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_purchase_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: purchase_order_local_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_local_items_order_id_idx ON public.purchase_order_local_items USING btree (order_id);


--
-- Name: purchase_order_local_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_local_items_product_id_idx ON public.purchase_order_local_items USING btree (product_id);


--
-- Name: purchase_order_local_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_local_logs_order_id_idx ON public.purchase_order_local_logs USING btree (order_id);


--
-- Name: purchase_order_local_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_local_logs_user_id_idx ON public.purchase_order_local_logs USING btree (user_id);


--
-- Name: purchase_orders_orderNumber_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "purchase_orders_orderNumber_tenantId_key" ON public.purchase_orders USING btree ("orderNumber", "tenantId");


--
-- Name: purchase_orders_order_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_order_date_idx ON public.purchase_orders USING btree (order_date);


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_supplier_id_idx ON public.purchase_orders USING btree (supplier_id);


--
-- Name: purchase_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_orders_tenantId_idx" ON public.purchase_orders USING btree ("tenantId");


--
-- Name: purchase_orders_tenantId_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_orders_tenantId_orderNumber_idx" ON public.purchase_orders USING btree ("tenantId", "orderNumber");


--
-- Name: quote_logs_quote_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quote_logs_quote_id_idx ON public.quote_logs USING btree (quote_id);


--
-- Name: quote_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quote_logs_user_id_idx ON public.quote_logs USING btree (user_id);


--
-- Name: quotes_quote_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "quotes_quote_no_tenantId_key" ON public.quotes USING btree (quote_no, "tenantId");


--
-- Name: quotes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quotes_tenantId_idx" ON public.quotes USING btree ("tenantId");


--
-- Name: quotes_tenantId_quote_no_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "quotes_tenantId_quote_no_idx" ON public.quotes USING btree ("tenantId", quote_no);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "roles_tenantId_idx" ON public.roles USING btree ("tenantId");


--
-- Name: roles_tenantId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "roles_tenantId_name_key" ON public.roles USING btree ("tenantId", name);


--
-- Name: salary_payment_details_bank_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_payment_details_bank_account_id_idx ON public.salary_payment_details USING btree (bank_account_id);


--
-- Name: salary_payment_details_cashbox_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_payment_details_cashbox_id_idx ON public.salary_payment_details USING btree (cashbox_id);


--
-- Name: salary_payment_details_salary_payment_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_payment_details_salary_payment_id_idx ON public.salary_payment_details USING btree (salary_payment_id);


--
-- Name: salary_payment_details_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salary_payment_details_tenantId_idx" ON public.salary_payment_details USING btree ("tenantId");


--
-- Name: salary_payments_employee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_payments_employee_id_idx ON public.salary_payments USING btree (employee_id);


--
-- Name: salary_payments_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_payments_plan_id_idx ON public.salary_payments USING btree (plan_id);


--
-- Name: salary_payments_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salary_payments_tenantId_idx" ON public.salary_payments USING btree ("tenantId");


--
-- Name: salary_plans_employee_id_year_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_plans_employee_id_year_idx ON public.salary_plans USING btree (employee_id, year);


--
-- Name: salary_plans_employee_id_year_month_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX salary_plans_employee_id_year_month_key ON public.salary_plans USING btree (employee_id, year, month);


--
-- Name: salary_plans_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_plans_status_idx ON public.salary_plans USING btree (status);


--
-- Name: salary_plans_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salary_plans_tenantId_idx" ON public.salary_plans USING btree ("tenantId");


--
-- Name: salary_plans_year_month_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salary_plans_year_month_idx ON public.salary_plans USING btree (year, month);


--
-- Name: sales_agents_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_agents_tenantId_idx" ON public.sales_agents USING btree ("tenantId");


--
-- Name: sales_delivery_note_items_delivery_note_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_note_items_delivery_note_id_idx ON public.sales_delivery_note_items USING btree (delivery_note_id);


--
-- Name: sales_delivery_note_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_note_items_product_id_idx ON public.sales_delivery_note_items USING btree (product_id);


--
-- Name: sales_delivery_note_items_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_delivery_note_items_tenantId_idx" ON public.sales_delivery_note_items USING btree ("tenantId");


--
-- Name: sales_delivery_note_logs_delivery_note_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_note_logs_delivery_note_id_idx ON public.sales_delivery_note_logs USING btree (delivery_note_id);


--
-- Name: sales_delivery_note_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_note_logs_user_id_idx ON public.sales_delivery_note_logs USING btree (user_id);


--
-- Name: sales_delivery_notes_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_notes_account_id_idx ON public.sales_delivery_notes USING btree (account_id);


--
-- Name: sales_delivery_notes_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_notes_date_idx ON public.sales_delivery_notes USING btree (date);


--
-- Name: sales_delivery_notes_delivery_note_no_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_notes_delivery_note_no_idx ON public.sales_delivery_notes USING btree (delivery_note_no);


--
-- Name: sales_delivery_notes_delivery_note_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sales_delivery_notes_delivery_note_no_tenantId_key" ON public.sales_delivery_notes USING btree (delivery_note_no, "tenantId");


--
-- Name: sales_delivery_notes_source_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_notes_source_id_idx ON public.sales_delivery_notes USING btree (source_id);


--
-- Name: sales_delivery_notes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_delivery_notes_status_idx ON public.sales_delivery_notes USING btree (status);


--
-- Name: sales_delivery_notes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_delivery_notes_tenantId_idx" ON public.sales_delivery_notes USING btree ("tenantId");


--
-- Name: sales_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_order_items_order_id_idx ON public.sales_order_items USING btree (order_id);


--
-- Name: sales_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_order_items_product_id_idx ON public.sales_order_items USING btree (product_id);


--
-- Name: sales_order_items_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_order_items_tenantId_idx" ON public.sales_order_items USING btree ("tenantId");


--
-- Name: sales_order_logs_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_order_logs_order_id_idx ON public.sales_order_logs USING btree (order_id);


--
-- Name: sales_order_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_order_logs_user_id_idx ON public.sales_order_logs USING btree (user_id);


--
-- Name: sales_orders_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_orders_account_id_idx ON public.sales_orders USING btree (account_id);


--
-- Name: sales_orders_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_orders_date_idx ON public.sales_orders USING btree (date);


--
-- Name: sales_orders_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sales_orders_deliveryNoteId_key" ON public.sales_orders USING btree ("deliveryNoteId");


--
-- Name: sales_orders_order_no_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_orders_order_no_idx ON public.sales_orders USING btree (order_no);


--
-- Name: sales_orders_order_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sales_orders_order_no_tenantId_key" ON public.sales_orders USING btree (order_no, "tenantId");


--
-- Name: sales_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_orders_status_idx ON public.sales_orders USING btree (status);


--
-- Name: sales_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_orders_tenantId_idx" ON public.sales_orders USING btree ("tenantId");


--
-- Name: service_invoices_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX service_invoices_account_id_idx ON public.service_invoices USING btree (account_id);


--
-- Name: service_invoices_invoiceNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "service_invoices_invoiceNo_tenantId_key" ON public.service_invoices USING btree ("invoiceNo", "tenantId");


--
-- Name: service_invoices_issueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_invoices_issueDate_idx" ON public.service_invoices USING btree ("issueDate");


--
-- Name: service_invoices_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_invoices_tenantId_idx" ON public.service_invoices USING btree ("tenantId");


--
-- Name: service_invoices_workOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "service_invoices_workOrderId_key" ON public.service_invoices USING btree ("workOrderId");


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_refreshToken_idx" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sessions_refreshToken_key" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: shelves_warehouse_id_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shelves_warehouse_id_code_key ON public.shelves USING btree (warehouse_id, code);


--
-- Name: simple_orders_company_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simple_orders_company_id_idx ON public.simple_orders USING btree (company_id);


--
-- Name: simple_orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "simple_orders_createdAt_idx" ON public.simple_orders USING btree ("createdAt");


--
-- Name: simple_orders_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simple_orders_product_id_idx ON public.simple_orders USING btree (product_id);


--
-- Name: simple_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simple_orders_status_idx ON public.simple_orders USING btree (status);


--
-- Name: simple_orders_tenantId_company_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "simple_orders_tenantId_company_id_idx" ON public.simple_orders USING btree ("tenantId", company_id);


--
-- Name: simple_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "simple_orders_tenantId_idx" ON public.simple_orders USING btree ("tenantId");


--
-- Name: simple_orders_tenantId_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "simple_orders_tenantId_product_id_idx" ON public.simple_orders USING btree ("tenantId", product_id);


--
-- Name: stock_cost_history_product_id_computed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_cost_history_product_id_computed_at_idx ON public.stock_cost_history USING btree (product_id, computed_at);


--
-- Name: stock_moves_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_createdAt_idx" ON public.stock_moves USING btree ("createdAt");


--
-- Name: stock_moves_fromWarehouseId_fromLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_fromWarehouseId_fromLocationId_idx" ON public.stock_moves USING btree ("fromWarehouseId", "fromLocationId");


--
-- Name: stock_moves_moveType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_moveType_idx" ON public.stock_moves USING btree ("moveType");


--
-- Name: stock_moves_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_productId_idx" ON public.stock_moves USING btree ("productId");


--
-- Name: stock_moves_refType_refId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_refType_refId_idx" ON public.stock_moves USING btree ("refType", "refId");


--
-- Name: stock_moves_toWarehouseId_toLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_toWarehouseId_toLocationId_idx" ON public.stock_moves USING btree ("toWarehouseId", "toLocationId");


--
-- Name: stocktake_items_location_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stocktake_items_location_id_idx ON public.stocktake_items USING btree (location_id);


--
-- Name: stocktake_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stocktake_items_product_id_idx ON public.stocktake_items USING btree (product_id);


--
-- Name: stocktake_items_stocktake_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stocktake_items_stocktake_id_idx ON public.stocktake_items USING btree (stocktake_id);


--
-- Name: stocktakes_stocktake_no_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stocktakes_stocktake_no_tenantId_key" ON public.stocktakes USING btree (stocktake_no, "tenantId");


--
-- Name: stocktakes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stocktakes_tenantId_idx" ON public.stocktakes USING btree ("tenantId");


--
-- Name: stocktakes_tenantId_stocktake_no_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stocktakes_tenantId_stocktake_no_idx" ON public.stocktakes USING btree ("tenantId", stocktake_no);


--
-- Name: subscriptions_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_endDate_idx" ON public.subscriptions USING btree ("endDate");


--
-- Name: subscriptions_iyzicoSubscriptionRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_iyzicoSubscriptionRef_key" ON public.subscriptions USING btree ("iyzicoSubscriptionRef");


--
-- Name: subscriptions_nextBillingDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_nextBillingDate_idx" ON public.subscriptions USING btree ("nextBillingDate");


--
-- Name: subscriptions_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_planId_idx" ON public.subscriptions USING btree ("planId");


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_tenantId_idx" ON public.subscriptions USING btree ("tenantId");


--
-- Name: subscriptions_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON public.subscriptions USING btree ("tenantId");


--
-- Name: system_parameters_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_parameters_category_idx ON public.system_parameters USING btree (category);


--
-- Name: system_parameters_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "system_parameters_tenantId_idx" ON public.system_parameters USING btree ("tenantId");


--
-- Name: system_parameters_tenantId_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "system_parameters_tenantId_key_key" ON public.system_parameters USING btree ("tenantId", key);


--
-- Name: tenant_purge_audits_adminId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_adminId_idx" ON public.tenant_purge_audits USING btree ("adminId");


--
-- Name: tenant_purge_audits_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_createdAt_idx" ON public.tenant_purge_audits USING btree ("createdAt");


--
-- Name: tenant_purge_audits_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_tenantId_idx" ON public.tenant_purge_audits USING btree ("tenantId");


--
-- Name: tenant_settings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tenant_settings_tenantId_key" ON public.tenant_settings USING btree ("tenantId");


--
-- Name: tenants_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenants_createdAt_idx" ON public.tenants USING btree ("createdAt");


--
-- Name: tenants_domain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_domain_idx ON public.tenants USING btree (domain);


--
-- Name: tenants_domain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_domain_key ON public.tenants USING btree (domain);


--
-- Name: tenants_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_status_idx ON public.tenants USING btree (status);


--
-- Name: tenants_subdomain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_subdomain_idx ON public.tenants USING btree (subdomain);


--
-- Name: tenants_subdomain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_subdomain_key ON public.tenants USING btree (subdomain);


--
-- Name: tenants_uuid_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_uuid_key ON public.tenants USING btree (uuid);


--
-- Name: unit_sets_tenant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX unit_sets_tenant_id_idx ON public.unit_sets USING btree (tenant_id);


--
-- Name: units_unit_set_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX units_unit_set_id_idx ON public.units USING btree (unit_set_id);


--
-- Name: user_licenses_licenseType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_licenseType_idx" ON public.user_licenses USING btree ("licenseType");


--
-- Name: user_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_moduleId_idx" ON public.user_licenses USING btree ("moduleId");


--
-- Name: user_licenses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_userId_idx" ON public.user_licenses USING btree ("userId");


--
-- Name: user_licenses_userId_licenseType_moduleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_licenses_userId_licenseType_moduleId_key" ON public.user_licenses USING btree ("userId", "licenseType", "moduleId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_email_tenantId_key" ON public.users USING btree (email, "tenantId");


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_tenantId_idx" ON public.users USING btree ("tenantId");


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_uuid_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_uuid_key ON public.users USING btree (uuid);


--
-- Name: vehicle_catalog_brand_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_catalog_brand_idx ON public.vehicle_catalog USING btree (brand);


--
-- Name: vehicle_catalog_brand_model_engine_volume_fuel_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vehicle_catalog_brand_model_engine_volume_fuel_type_key ON public.vehicle_catalog USING btree (brand, model, engine_volume, fuel_type);


--
-- Name: vehicle_catalog_fuel_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_catalog_fuel_type_idx ON public.vehicle_catalog USING btree (fuel_type);


--
-- Name: vehicle_catalog_model_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_catalog_model_idx ON public.vehicle_catalog USING btree (model);


--
-- Name: vehicle_expenses_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vehicle_expenses_date_idx ON public.vehicle_expenses USING btree (date);


--
-- Name: vehicle_expenses_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vehicle_expenses_tenantId_idx" ON public.vehicle_expenses USING btree ("tenantId");


--
-- Name: vehicle_expenses_vehicleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vehicle_expenses_vehicleId_idx" ON public.vehicle_expenses USING btree ("vehicleId");


--
-- Name: warehouse_critical_stocks_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_critical_stocks_productId_idx" ON public.warehouse_critical_stocks USING btree ("productId");


--
-- Name: warehouse_critical_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_critical_stocks_warehouseId_idx" ON public.warehouse_critical_stocks USING btree ("warehouseId");


--
-- Name: warehouse_critical_stocks_warehouseId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouse_critical_stocks_warehouseId_productId_key" ON public.warehouse_critical_stocks USING btree ("warehouseId", "productId");


--
-- Name: warehouse_transfer_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX warehouse_transfer_items_product_id_idx ON public.warehouse_transfer_items USING btree (product_id);


--
-- Name: warehouse_transfer_items_transferId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_items_transferId_idx" ON public.warehouse_transfer_items USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_transferId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_logs_transferId_idx" ON public.warehouse_transfer_logs USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_logs_userId_idx" ON public.warehouse_transfer_logs USING btree ("userId");


--
-- Name: warehouse_transfers_fromWarehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_fromWarehouseId_idx" ON public.warehouse_transfers USING btree ("fromWarehouseId");


--
-- Name: warehouse_transfers_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_tenantId_idx" ON public.warehouse_transfers USING btree ("tenantId");


--
-- Name: warehouse_transfers_tenantId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_tenantId_status_idx" ON public.warehouse_transfers USING btree ("tenantId", status);


--
-- Name: warehouse_transfers_toWarehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_toWarehouseId_idx" ON public.warehouse_transfers USING btree ("toWarehouseId");


--
-- Name: warehouse_transfers_transferNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouse_transfers_transferNo_tenantId_key" ON public.warehouse_transfers USING btree ("transferNo", "tenantId");


--
-- Name: warehouses_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouses_code_tenantId_key" ON public.warehouses USING btree (code, "tenantId");


--
-- Name: warehouses_tenantId_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouses_tenantId_code_idx" ON public.warehouses USING btree ("tenantId", code);


--
-- Name: warehouses_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouses_tenantId_idx" ON public.warehouses USING btree ("tenantId");


--
-- Name: work_order_activities_workOrderId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_order_activities_workOrderId_createdAt_idx" ON public.work_order_activities USING btree ("workOrderId", "createdAt");


--
-- Name: work_order_activities_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_order_activities_workOrderId_idx" ON public.work_order_activities USING btree ("workOrderId");


--
-- Name: work_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_order_items_product_id_idx ON public.work_order_items USING btree (product_id);


--
-- Name: work_order_items_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_order_items_workOrderId_idx" ON public.work_order_items USING btree ("workOrderId");


--
-- Name: work_orders_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_orders_account_id_idx ON public.work_orders USING btree (account_id);


--
-- Name: work_orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_orders_createdAt_idx" ON public.work_orders USING btree ("createdAt");


--
-- Name: work_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_orders_status_idx ON public.work_orders USING btree (status);


--
-- Name: work_orders_technicianId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_orders_technicianId_idx" ON public.work_orders USING btree ("technicianId");


--
-- Name: work_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "work_orders_tenantId_idx" ON public.work_orders USING btree ("tenantId");


--
-- Name: work_orders_workOrderNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "work_orders_workOrderNo_tenantId_key" ON public.work_orders USING btree ("workOrderNo", "tenantId");


--
-- Name: account_addresses account_addresses_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_addresses
    ADD CONSTRAINT account_addresses_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account_banks account_banks_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_banks
    ADD CONSTRAINT account_banks_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account_contacts account_contacts_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_contacts
    ADD CONSTRAINT account_contacts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account_movements account_movements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_movements
    ADD CONSTRAINT account_movements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account_movements account_movements_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_movements
    ADD CONSTRAINT "account_movements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: accounts accounts_sales_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_sales_agent_id_fkey FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: accounts accounts_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advance_settlements advance_settlements_advance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_settlements
    ADD CONSTRAINT advance_settlements_advance_id_fkey FOREIGN KEY (advance_id) REFERENCES public.advances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advance_settlements advance_settlements_salary_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_settlements
    ADD CONSTRAINT advance_settlements_salary_plan_id_fkey FOREIGN KEY (salary_plan_id) REFERENCES public.salary_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advance_settlements advance_settlements_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_settlements
    ADD CONSTRAINT "advance_settlements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advances advances_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: advances advances_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: advances advances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advances advances_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT "advances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_account_movements bank_account_movements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_movements
    ADD CONSTRAINT bank_account_movements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_account_movements bank_account_movements_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_movements
    ADD CONSTRAINT bank_account_movements_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_accounts bank_accounts_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_loan_plans bank_loan_plans_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_loan_plans
    ADD CONSTRAINT bank_loan_plans_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.bank_loans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_loans bank_loans_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_loans
    ADD CONSTRAINT bank_loans_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_transfer_logs bank_transfer_logs_bank_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfer_logs
    ADD CONSTRAINT bank_transfer_logs_bank_transfer_id_fkey FOREIGN KEY (bank_transfer_id) REFERENCES public.bank_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_transfer_logs bank_transfer_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfer_logs
    ADD CONSTRAINT bank_transfer_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transfers bank_transfers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bank_transfers bank_transfers_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transfers bank_transfers_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transfers bank_transfers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transfers bank_transfers_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transfers bank_transfers_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT "bank_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_transfers bank_transfers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banks banks_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT "banks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cashbox_movements cashbox_movements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashbox_movements
    ADD CONSTRAINT cashbox_movements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cashbox_movements cashbox_movements_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashbox_movements
    ADD CONSTRAINT cashbox_movements_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cashbox_movements cashbox_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashbox_movements
    ADD CONSTRAINT cashbox_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cashboxes cashboxes_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes
    ADD CONSTRAINT "cashboxes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cashboxes cashboxes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes
    ADD CONSTRAINT "cashboxes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cashboxes cashboxes_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes
    ADD CONSTRAINT "cashboxes_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: check_bill_journal_items check_bill_journal_items_check_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journal_items
    ADD CONSTRAINT check_bill_journal_items_check_bill_id_fkey FOREIGN KEY (check_bill_id) REFERENCES public.checks_bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: check_bill_journal_items check_bill_journal_items_journal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journal_items
    ADD CONSTRAINT check_bill_journal_items_journal_id_fkey FOREIGN KEY (journal_id) REFERENCES public.check_bill_journals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: check_bill_journal_items check_bill_journal_items_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journal_items
    ADD CONSTRAINT "check_bill_journal_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: check_bill_journals check_bill_journals_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journals
    ADD CONSTRAINT check_bill_journals_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: check_bill_journals check_bill_journals_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journals
    ADD CONSTRAINT check_bill_journals_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: check_bill_journals check_bill_journals_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journals
    ADD CONSTRAINT check_bill_journals_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: check_bill_journals check_bill_journals_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_journals
    ADD CONSTRAINT "check_bill_journals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: check_bill_logs check_bill_logs_check_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_logs
    ADD CONSTRAINT check_bill_logs_check_bill_id_fkey FOREIGN KEY (check_bill_id) REFERENCES public.checks_bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: check_bill_logs check_bill_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_bill_logs
    ADD CONSTRAINT check_bill_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checks_bills checks_bills_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checks_bills checks_bills_collection_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_collection_cashbox_id_fkey FOREIGN KEY (collection_cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checks_bills checks_bills_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checks_bills checks_bills_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checks_bills checks_bills_last_journal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_last_journal_id_fkey FOREIGN KEY (last_journal_id) REFERENCES public.check_bill_journals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checks_bills checks_bills_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT "checks_bills_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checks_bills checks_bills_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checks_bills
    ADD CONSTRAINT checks_bills_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: code_templates code_templates_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT "code_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collections collections_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: collections collections_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_company_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_company_credit_card_id_fkey FOREIGN KEY (company_credit_card_id) REFERENCES public.company_credit_cards(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_sales_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_sales_agent_id_fkey FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_service_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_service_invoice_id_fkey FOREIGN KEY (service_invoice_id) REFERENCES public.service_invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: collections collections_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT "collections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_credit_card_movements company_credit_card_movements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_card_movements
    ADD CONSTRAINT company_credit_card_movements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_credit_card_movements company_credit_card_movements_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_card_movements
    ADD CONSTRAINT company_credit_card_movements_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.company_credit_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_credit_card_reminders company_credit_card_reminders_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_card_reminders
    ADD CONSTRAINT company_credit_card_reminders_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.company_credit_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_credit_cards company_credit_cards_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_credit_cards
    ADD CONSTRAINT company_credit_cards_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_vehicles company_vehicles_assigned_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT company_vehicles_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_vehicles company_vehicles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT "company_vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_vehicles customer_vehicles_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_vehicles customer_vehicles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT "customer_vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deleted_bank_transfers deleted_bank_transfers_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_bank_transfers
    ADD CONSTRAINT deleted_bank_transfers_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deleted_checks_bills deleted_checks_bills_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_checks_bills
    ADD CONSTRAINT deleted_checks_bills_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: einvoice_xml einvoice_xml_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.einvoice_xml
    ADD CONSTRAINT einvoice_xml_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_payments employee_payments_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_payments
    ADD CONSTRAINT employee_payments_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_payments employee_payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_payments
    ADD CONSTRAINT employee_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_payments employee_payments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_payments
    ADD CONSTRAINT employee_payments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_partRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_partRequestId_fkey" FOREIGN KEY ("partRequestId") REFERENCES public.part_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invitations invitations_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_collections invoice_collections_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_collections
    ADD CONSTRAINT invoice_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_collections invoice_collections_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_collections
    ADD CONSTRAINT invoice_collections_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_collections invoice_collections_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_collections
    ADD CONSTRAINT "invoice_collections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_items invoice_items_purchase_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_purchase_order_item_id_fkey FOREIGN KEY (purchase_order_item_id) REFERENCES public.purchase_order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoice_logs invoice_logs_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_logs
    ADD CONSTRAINT invoice_logs_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_logs invoice_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_logs
    ADD CONSTRAINT invoice_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoice_payment_plans invoice_payment_plans_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_payment_plans
    ADD CONSTRAINT invoice_payment_plans_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_invoice_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_invoice_item_id_fkey FOREIGN KEY (invoice_item_id) REFERENCES public.invoice_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_profit invoice_profit_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_delivery_note_id_fkey FOREIGN KEY (delivery_note_id) REFERENCES public.sales_delivery_notes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_procurement_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_procurement_order_id_fkey FOREIGN KEY (procurement_order_id) REFERENCES public.procurement_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_purchase_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_purchase_delivery_note_id_fkey FOREIGN KEY (purchase_delivery_note_id) REFERENCES public.purchase_delivery_notes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_sales_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_sales_agent_id_fkey FOREIGN KEY (sales_agent_id) REFERENCES public.sales_agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_serviceInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_serviceInvoiceId_fkey" FOREIGN KEY ("serviceInvoiceId") REFERENCES public.service_invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: journal_entry_lines journal_entry_lines_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT "journal_entry_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public.journal_entries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: locations locations_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_licenses module_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_licenses module_licenses_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_pickings order_pickings_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_pickings
    ADD CONSTRAINT order_pickings_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_pickings order_pickings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_pickings
    ADD CONSTRAINT order_pickings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_pickings order_pickings_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_pickings
    ADD CONSTRAINT order_pickings_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.sales_order_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_pickings order_pickings_picked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_pickings
    ADD CONSTRAINT order_pickings_picked_by_fkey FOREIGN KEY (picked_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: part_requests part_requests_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT part_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: part_requests part_requests_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: part_requests part_requests_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_requests part_requests_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pos_payments pos_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pos_payments pos_payments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT "pos_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pos_sessions pos_sessions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT "pos_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_cards price_cards_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_cards price_cards_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_cards price_cards_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_list_items price_list_items_price_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_price_list_id_fkey FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_list_items price_list_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: price_lists price_lists_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT "price_lists_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: procurement_orders procurement_orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT procurement_orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: procurement_orders procurement_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT procurement_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: procurement_orders procurement_orders_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT procurement_orders_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: procurement_orders procurement_orders_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT "procurement_orders_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.purchase_delivery_notes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: procurement_orders procurement_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT "procurement_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: procurement_orders procurement_orders_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_orders
    ADD CONSTRAINT procurement_orders_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_barcodes product_barcodes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT "product_barcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_equivalents product_equivalents_product1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_equivalents
    ADD CONSTRAINT product_equivalents_product1_id_fkey FOREIGN KEY (product1_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_equivalents product_equivalents_product2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_equivalents
    ADD CONSTRAINT product_equivalents_product2_id_fkey FOREIGN KEY (product2_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_movements product_movements_invoice_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_movements
    ADD CONSTRAINT product_movements_invoice_item_id_fkey FOREIGN KEY (invoice_item_id) REFERENCES public.invoice_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_movements product_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_movements
    ADD CONSTRAINT product_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_movements product_movements_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_movements
    ADD CONSTRAINT "product_movements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_movements product_movements_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_movements
    ADD CONSTRAINT "product_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_shelves product_shelves_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_shelves
    ADD CONSTRAINT product_shelves_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_shelves product_shelves_shelf_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_shelves
    ADD CONSTRAINT product_shelves_shelf_id_fkey FOREIGN KEY (shelf_id) REFERENCES public.shelves(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_equivalency_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_equivalency_group_id_fkey FOREIGN KEY (equivalency_group_id) REFERENCES public.equivalency_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_note_items purchase_delivery_note_items_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_items
    ADD CONSTRAINT purchase_delivery_note_items_delivery_note_id_fkey FOREIGN KEY (delivery_note_id) REFERENCES public.purchase_delivery_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_delivery_note_items purchase_delivery_note_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_items
    ADD CONSTRAINT purchase_delivery_note_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_delivery_note_logs purchase_delivery_note_logs_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_logs
    ADD CONSTRAINT purchase_delivery_note_logs_delivery_note_id_fkey FOREIGN KEY (delivery_note_id) REFERENCES public.purchase_delivery_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_delivery_note_logs purchase_delivery_note_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_note_logs
    ADD CONSTRAINT purchase_delivery_note_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.procurement_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT "purchase_delivery_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_delivery_notes purchase_delivery_notes_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_delivery_notes
    ADD CONSTRAINT purchase_delivery_notes_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_local_items purchase_order_local_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_items
    ADD CONSTRAINT purchase_order_local_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.procurement_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_local_items purchase_order_local_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_items
    ADD CONSTRAINT purchase_order_local_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_local_logs purchase_order_local_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_logs
    ADD CONSTRAINT purchase_order_local_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.procurement_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_local_logs purchase_order_local_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_local_logs
    ADD CONSTRAINT purchase_order_local_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote_items quote_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote_logs quote_logs_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_logs
    ADD CONSTRAINT quote_logs_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote_logs quote_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_logs
    ADD CONSTRAINT quote_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotes quotes_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotes quotes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotes quotes_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotes quotes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotes quotes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "quotes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotes quotes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_payment_details salary_payment_details_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payment_details
    ADD CONSTRAINT salary_payment_details_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: salary_payment_details salary_payment_details_cashbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payment_details
    ADD CONSTRAINT salary_payment_details_cashbox_id_fkey FOREIGN KEY (cashbox_id) REFERENCES public.cashboxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: salary_payment_details salary_payment_details_salary_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payment_details
    ADD CONSTRAINT salary_payment_details_salary_payment_id_fkey FOREIGN KEY (salary_payment_id) REFERENCES public.salary_payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_payment_details salary_payment_details_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payment_details
    ADD CONSTRAINT "salary_payment_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_payments salary_payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: salary_payments salary_payments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_payments salary_payments_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.salary_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_payments salary_payments_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT "salary_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_plans salary_plans_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_plans
    ADD CONSTRAINT salary_plans_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_plans salary_plans_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_plans
    ADD CONSTRAINT "salary_plans_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_agents sales_agents_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_agents
    ADD CONSTRAINT "sales_agents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_delivery_note_items sales_delivery_note_items_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_items
    ADD CONSTRAINT sales_delivery_note_items_delivery_note_id_fkey FOREIGN KEY (delivery_note_id) REFERENCES public.sales_delivery_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_delivery_note_items sales_delivery_note_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_items
    ADD CONSTRAINT sales_delivery_note_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_delivery_note_logs sales_delivery_note_logs_delivery_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_logs
    ADD CONSTRAINT sales_delivery_note_logs_delivery_note_id_fkey FOREIGN KEY (delivery_note_id) REFERENCES public.sales_delivery_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_delivery_note_logs sales_delivery_note_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_note_logs
    ADD CONSTRAINT sales_delivery_note_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_delivery_notes sales_delivery_notes_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_delivery_notes sales_delivery_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_delivery_notes sales_delivery_notes_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_delivery_notes sales_delivery_notes_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_delivery_notes sales_delivery_notes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT "sales_delivery_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_delivery_notes sales_delivery_notes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_delivery_notes sales_delivery_notes_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_delivery_notes
    ADD CONSTRAINT sales_delivery_notes_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_order_items sales_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_order_items sales_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_order_logs sales_order_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_logs
    ADD CONSTRAINT sales_order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_order_logs sales_order_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_logs
    ADD CONSTRAINT sales_order_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_orders sales_orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_orders sales_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_orders sales_orders_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_orders sales_orders_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT "sales_orders_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.sales_delivery_notes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_orders sales_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT "sales_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_orders sales_orders_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_invoices service_invoices_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT service_invoices_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_invoices service_invoices_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_invoices service_invoices_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_invoices service_invoices_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shelves shelves_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelves
    ADD CONSTRAINT shelves_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simple_orders simple_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simple_orders
    ADD CONSTRAINT simple_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: simple_orders simple_orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simple_orders
    ADD CONSTRAINT simple_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: simple_orders simple_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simple_orders
    ADD CONSTRAINT "simple_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_cost_history stock_cost_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_moves stock_moves_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocktake_items stocktake_items_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktake_items
    ADD CONSTRAINT stocktake_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stocktake_items stocktake_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktake_items
    ADD CONSTRAINT stocktake_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stocktake_items stocktake_items_stocktake_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktake_items
    ADD CONSTRAINT stocktake_items_stocktake_id_fkey FOREIGN KEY (stocktake_id) REFERENCES public.stocktakes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stocktakes stocktakes_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktakes
    ADD CONSTRAINT stocktakes_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stocktakes stocktakes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktakes
    ADD CONSTRAINT stocktakes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stocktakes stocktakes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktakes
    ADD CONSTRAINT "stocktakes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stocktakes stocktakes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocktakes
    ADD CONSTRAINT stocktakes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: system_parameters system_parameters_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT "system_parameters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_purge_audits tenant_purge_audits_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT "tenant_purge_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_settings tenant_settings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unit_sets unit_sets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_sets
    ADD CONSTRAINT unit_sets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: units units_unit_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_unit_set_id_fkey FOREIGN KEY (unit_set_id) REFERENCES public.unit_sets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_licenses user_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_licenses user_licenses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicle_expenses vehicle_expenses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT "vehicle_expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vehicle_expenses vehicle_expenses_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT "vehicle_expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public.company_vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT warehouse_transfer_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_prepared_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_prepared_by_id_fkey FOREIGN KEY (prepared_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_received_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfers warehouse_transfers_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouses warehouses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_order_activities work_order_activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT "work_order_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_order_activities work_order_activities_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT "work_order_activities_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_order_items work_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_order_items work_order_items_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT "work_order_items_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_orders work_orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_customerVehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES public.customer_vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_orders work_orders_technicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_orders work_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Yw04olxbp645WaZLaNEFviB62Jw1r0zKYj9Mab3KFk6tgHewcNz2Egee9pe8oyf

