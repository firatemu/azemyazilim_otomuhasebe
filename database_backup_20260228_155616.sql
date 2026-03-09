--
-- PostgreSQL database dump
--

\restrict OVZaN5aMizjVO6fPodafYlYo3RGn0euN2vAHvCgP2O8Gutb8GBCIpcgotYQHdTS

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

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
-- Name: AdresTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdresTipi" AS ENUM (
    'TESLIMAT',
    'FATURA',
    'MERKEZ',
    'SUBE',
    'DEPO',
    'DIGER'
);


--
-- Name: AvansDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AvansDurum" AS ENUM (
    'ACIK',
    'KISMI',
    'KAPALI'
);


--
-- Name: BankaHareketAltTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BankaHareketAltTipi" AS ENUM (
    'HAVALE_GELEN',
    'HAVALE_GIDEN',
    'KREDI_KULLANIM',
    'KREDI_ODEME',
    'TEMINAT_CEK',
    'TEMINAT_SENET',
    'POS_TAHSILAT',
    'KART_HARCAMA',
    'KART_ODEME',
    'VIRMAN',
    'DIGER',
    'KREDI_TAKSIT_ODEME'
);


--
-- Name: BankaHareketTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BankaHareketTipi" AS ENUM (
    'GELEN',
    'GIDEN'
);


--
-- Name: BankaHesapTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BankaHesapTipi" AS ENUM (
    'VADESIZ',
    'KREDI',
    'POS',
    'FIRMA_KREDI_KARTI',
    'VADELI',
    'YATIRIM',
    'ALTIN',
    'DOVIZ',
    'DIGER'
);


--
-- Name: BasitSiparisDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BasitSiparisDurum" AS ENUM (
    'ONAY_BEKLIYOR',
    'ONAYLANDI',
    'SIPARIS_VERILDI',
    'FATURALANDI',
    'IPTAL_EDILDI'
);


--
-- Name: BelgeTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BelgeTipi" AS ENUM (
    'FATURA',
    'TAHSILAT',
    'ODEME',
    'CEK_SENET',
    'DEVIR',
    'DUZELTME',
    'CEK_GIRIS',
    'CEK_CIKIS',
    'IADE'
);


--
-- Name: BillingPeriod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BillingPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'LIFETIME'
);


--
-- Name: BorcAlacak; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BorcAlacak" AS ENUM (
    'BORC',
    'ALACAK',
    'DEVIR'
);


--
-- Name: BordroTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BordroTipi" AS ENUM (
    'GIRIS_BORDROSU',
    'CIKIS_BORDROSU',
    'MUSTERI_EVRAK_GIRISI',
    'MUSTERI_EVRAK_CIKIS',
    'KENDI_EVRAK_GIRIS',
    'KENDI_EVRAK_CIKIS',
    'BANKA_TAHSIL_CIROSU',
    'BANKA_TEMINAT_CIROSU',
    'CARIYE_EVRAK_CIROSU',
    'BORC_EVRAK_CIKISI',
    'IADE_BORDROSU'
);


--
-- Name: CariTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CariTip" AS ENUM (
    'MUSTERI',
    'TEDARIKCI',
    'HER_IKISI'
);


--
-- Name: CekSenetDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CekSenetDurum" AS ENUM (
    'PORTFOYDE',
    'ODENMEDI',
    'BANKAYA_VERILDI',
    'TAHSIL_EDILDI',
    'ODENDI',
    'CIRO_EDILDI',
    'IADE_EDILDI',
    'KARSILIKIZ',
    'BANKA_TAHSILDE',
    'BANKA_TEMINATTA'
);


--
-- Name: CekSenetTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CekSenetTip" AS ENUM (
    'CEK',
    'SENET'
);


--
-- Name: Cinsiyet; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Cinsiyet" AS ENUM (
    'ERKEK',
    'KADIN',
    'BELIRTILMEMIS'
);


--
-- Name: EFaturaStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EFaturaStatus" AS ENUM (
    'PENDING',
    'SENT',
    'ERROR',
    'DRAFT'
);


--
-- Name: FaturaDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FaturaDurum" AS ENUM (
    'ACIK',
    'KAPALI',
    'KISMEN_ODENDI',
    'ONAYLANDI',
    'IPTAL'
);


--
-- Name: FaturaTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FaturaTipi" AS ENUM (
    'ALIS',
    'SATIS',
    'SATIS_IADE',
    'ALIS_IADE'
);


--
-- Name: HareketTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HareketTipi" AS ENUM (
    'GIRIS',
    'CIKIS',
    'SATIS',
    'IADE',
    'SAYIM',
    'SAYIM_FAZLA',
    'SAYIM_EKSIK'
);


--
-- Name: HavaleTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HavaleTipi" AS ENUM (
    'GELEN',
    'GIDEN'
);


--
-- Name: InventoryTransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InventoryTransactionType" AS ENUM (
    'DEDUCTION',
    'RETURN'
);


--
-- Name: InvitationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: IrsaliyeDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IrsaliyeDurum" AS ENUM (
    'FATURALANMADI',
    'FATURALANDI'
);


--
-- Name: IrsaliyeKaynakTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IrsaliyeKaynakTip" AS ENUM (
    'SIPARIS',
    'DOGRUDAN',
    'FATURA_OTOMATIK'
);


--
-- Name: KasaHareketTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KasaHareketTipi" AS ENUM (
    'TAHSILAT',
    'ODEME',
    'HAVALE_GELEN',
    'HAVALE_GIDEN',
    'KREDI_KARTI',
    'VIRMAN',
    'DEVIR',
    'CEK_ALINDI',
    'CEK_VERILDI',
    'SENET_ALINDI',
    'SENET_VERILDI',
    'CEK_TAHSIL',
    'SENET_TAHSIL'
);


--
-- Name: KasaTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KasaTipi" AS ENUM (
    'NAKIT',
    'POS',
    'FIRMA_KREDI_KARTI',
    'BANKA',
    'CEK_SENET'
);


--
-- Name: KrediDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KrediDurum" AS ENUM (
    'AKTIF',
    'KAPANDI',
    'IPTAL'
);


--
-- Name: KrediPlanDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KrediPlanDurum" AS ENUM (
    'BEKLIYOR',
    'ODENDI',
    'GECIKMEDE',
    'KISMI_ODENDI'
);


--
-- Name: KrediTuru; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KrediTuru" AS ENUM (
    'ESIT_TAKSITLI',
    'ROTATIF'
);


--
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LicenseType" AS ENUM (
    'BASE_PLAN',
    'MODULE'
);


--
-- Name: LogAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LogAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'DURUM_DEGISIKLIK',
    'IPTAL',
    'RESTORE',
    'SIPARISE_DONUSTU',
    'EFATURA_GONDERILDI',
    'EFATURA_GONDERIM_HATASI',
    'SEVK',
    'CIRO'
);


--
-- Name: MaasDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaasDurum" AS ENUM (
    'ODENMEDI',
    'KISMI_ODENDI',
    'TAMAMEN_ODENDI'
);


--
-- Name: MedeniDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MedeniDurum" AS ENUM (
    'BEKAR',
    'EVLI'
);


--
-- Name: ModuleType; Type: TYPE; Schema: public; Owner: -
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
    'TEKLIF',
    'DELIVERY_NOTE_SALES',
    'DELIVERY_NOTE_PURCHASE',
    'WAREHOUSE_TRANSFER',
    'TECHNICIAN',
    'WORK_ORDER',
    'SERVICE_INVOICE'
);


--
-- Name: OdemeTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OdemeTipi" AS ENUM (
    'NAKIT',
    'KREDI_KARTI',
    'BANKA_HAVALESI',
    'CEK',
    'SENET'
);


--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: PartRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PartRequestStatus" AS ENUM (
    'REQUESTED',
    'SUPPLIED',
    'USED',
    'CANCELLED'
);


--
-- Name: PartWorkflowStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PartWorkflowStatus" AS ENUM (
    'NOT_STARTED',
    'PARTS_SUPPLIED_DIRECT',
    'PARTS_PENDING',
    'PARTIALLY_SUPPLIED',
    'ALL_PARTS_SUPPLIED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED',
    'CANCELED'
);


--
-- Name: PersonelOdemeTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PersonelOdemeTip" AS ENUM (
    'HAK_EDIS',
    'MAAS',
    'AVANS',
    'PRIM',
    'KESINTI',
    'ZIMMET',
    'ZIMMET_IADE'
);


--
-- Name: PortfoyTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PortfoyTip" AS ENUM (
    'ALACAK',
    'BORC'
);


--
-- Name: PriceCardType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PriceCardType" AS ENUM (
    'SALE',
    'PURCHASE'
);


--
-- Name: RiskDurumu; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RiskDurumu" AS ENUM (
    'NORMAL',
    'RISKLI',
    'KARA_LISTE',
    'TAKIPTE'
);


--
-- Name: SatınAlmaSiparisDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SatınAlmaSiparisDurum" AS ENUM (
    'BEKLEMEDE',
    'HAZIRLANIYOR',
    'HAZIRLANDI',
    'SEVK_EDILDI',
    'KISMI_SEVK',
    'SIPARIS_VERILDI',
    'FATURALANDI',
    'IPTAL'
);


--
-- Name: SayimDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SayimDurum" AS ENUM (
    'TASLAK',
    'TAMAMLANDI',
    'ONAYLANDI',
    'IPTAL'
);


--
-- Name: SayimTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SayimTipi" AS ENUM (
    'URUN_BAZLI',
    'RAF_BAZLI'
);


--
-- Name: SiparisDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SiparisDurum" AS ENUM (
    'BEKLEMEDE',
    'HAZIRLANIYOR',
    'HAZIRLANDI',
    'SEVK_EDILDI',
    'KISMI_SEVK',
    'FATURALANDI',
    'IPTAL'
);


--
-- Name: SiparisTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SiparisTipi" AS ENUM (
    'SATIS',
    'SATIN_ALMA'
);


--
-- Name: SirketTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SirketTipi" AS ENUM (
    'KURUMSAL',
    'SAHIS'
);


--
-- Name: StockMoveType; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'PENDING',
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED'
);


--
-- Name: TahsilatTip; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TahsilatTip" AS ENUM (
    'TAHSILAT',
    'ODEME'
);


--
-- Name: TeklifDurum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeklifDurum" AS ENUM (
    'TEKLIF',
    'ONAYLANDI',
    'REDDEDILDI',
    'SIPARISE_DONUSTU'
);


--
-- Name: TeklifTipi; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeklifTipi" AS ENUM (
    'SATIS',
    'SATIN_ALMA'
);


--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: TenantType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TenantType" AS ENUM (
    'INDIVIDUAL',
    'CORPORATE'
);


--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'HAZIRLANIYOR',
    'YOLDA',
    'TAMAMLANDI',
    'IPTAL'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION'
);


--
-- Name: VehicleExpenseType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VehicleExpenseType" AS ENUM (
    'YAKIT',
    'BAKIM',
    'MUAYENE',
    'TRAFIK_SIGORTASI',
    'KASKO',
    'CEZA',
    'OGS_HGS',
    'OTOPARK',
    'YIKAMA',
    'DIGER'
);


--
-- Name: VehicleServiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VehicleServiceStatus" AS ENUM (
    'BEKLEMEDE',
    'MUSTERI_ONAYI_BEKLIYOR',
    'YAPIM_ASAMASINDA',
    'PARCA_BEKLIYOR',
    'PARCALAR_TEDARIK_EDILDI',
    'ARAC_HAZIR',
    'TAMAMLANDI'
);


--
-- Name: VehicleWorkflowStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VehicleWorkflowStatus" AS ENUM (
    'WAITING',
    'IN_PROGRESS',
    'READY',
    'DELIVERED'
);


--
-- Name: WorkOrderItemType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WorkOrderItemType" AS ENUM (
    'LABOR',
    'PART'
);


--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: -
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: araclar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.araclar (
    id text NOT NULL,
    marka text NOT NULL,
    model text NOT NULL,
    "motorHacmi" text NOT NULL,
    "yakitTipi" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: avans_mahsuplasmalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avans_mahsuplasmalar (
    id text NOT NULL,
    "tenantId" text,
    "avansId" text NOT NULL,
    "planId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text
);


--
-- Name: avanslar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avanslar (
    id text NOT NULL,
    "tenantId" text,
    "personelId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "kasaId" text,
    "mahsupEdilen" numeric(10,2) DEFAULT 0 NOT NULL,
    kalan numeric(10,2) NOT NULL,
    durum public."AvansDurum" DEFAULT 'ACIK'::public."AvansDurum" NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: banka_havale_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_havale_logs (
    id text NOT NULL,
    "bankaHavaleId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: banka_havaleler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_havaleler (
    id text NOT NULL,
    "tenantId" text,
    "hareketTipi" public."HavaleTipi" NOT NULL,
    "bankaHesabiId" text,
    "cariId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "referansNo" text,
    gonderen text,
    alici text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankaHesapId" text
);


--
-- Name: banka_hesap_hareketler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_hesap_hareketler (
    id text NOT NULL,
    "hesapId" text NOT NULL,
    "hareketTipi" public."BankaHareketTipi" NOT NULL,
    "hareketAltTipi" public."BankaHareketAltTipi",
    tutar numeric(15,2) NOT NULL,
    "komisyonOrani" numeric(5,2),
    "komisyonTutar" numeric(15,2),
    "netTutar" numeric(15,2),
    bakiye numeric(15,2) NOT NULL,
    aciklama text,
    "referansNo" text,
    "cariId" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: banka_hesaplari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_hesaplari (
    id text NOT NULL,
    "bankaId" text NOT NULL,
    "hesapKodu" text NOT NULL,
    "hesapAdi" text,
    "hesapNo" text,
    iban text,
    "hesapTipi" public."BankaHesapTipi" NOT NULL,
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "komisyonOrani" numeric(5,2),
    "krediLimiti" numeric(15,2),
    "kullanilanLimit" numeric(15,2),
    "kartLimiti" numeric(15,2),
    "hesapKesimGunu" integer,
    "sonOdemeGunu" integer,
    "terminalNo" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: banka_kredi_planlari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_kredi_planlari (
    id text NOT NULL,
    "krediId" text NOT NULL,
    "taksitNo" integer NOT NULL,
    "vadeTarihi" timestamp(3) without time zone NOT NULL,
    tutar numeric(15,2) NOT NULL,
    odenen numeric(15,2) DEFAULT 0 NOT NULL,
    durum public."KrediPlanDurum" DEFAULT 'BEKLIYOR'::public."KrediPlanDurum" NOT NULL,
    "tenantId" text
);


--
-- Name: banka_krediler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banka_krediler (
    id text NOT NULL,
    "bankaHesapId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "toplamGeriOdeme" numeric(15,2) NOT NULL,
    "toplamFaiz" numeric(15,2) NOT NULL,
    "taksitSayisi" integer NOT NULL,
    "baslangicTarihi" timestamp(3) without time zone NOT NULL,
    aciklama text,
    "krediTuru" public."KrediTuru" DEFAULT 'ESIT_TAKSITLI'::public."KrediTuru" NOT NULL,
    durum public."KrediDurum" DEFAULT 'AKTIF'::public."KrediDurum" NOT NULL,
    "yillikFaizOrani" numeric(5,2),
    "odemeSikligi" integer DEFAULT 1 NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: bankalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bankalar (
    id text NOT NULL,
    "tenantId" text,
    ad text NOT NULL,
    sube text,
    sehir text,
    yetkili text,
    telefon text,
    logo text,
    durum boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: basit_siparisler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.basit_siparisler (
    id text NOT NULL,
    "tenantId" text,
    "firmaId" text NOT NULL,
    "urunId" text NOT NULL,
    miktar integer NOT NULL,
    durum public."BasitSiparisDurum" DEFAULT 'ONAY_BEKLIYOR'::public."BasitSiparisDurum" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tedarikEdilenMiktar" integer DEFAULT 0 NOT NULL
);


--
-- Name: bordrolar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bordrolar (
    id text NOT NULL,
    "bordroNo" text NOT NULL,
    tip public."BordroTipi" NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cariId" text,
    aciklama text,
    "tenantId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankaHesabiId" text
);


--
-- Name: cari_adresler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cari_adresler (
    id text NOT NULL,
    "cariId" text NOT NULL,
    baslik text NOT NULL,
    tip public."AdresTipi" NOT NULL,
    adres text NOT NULL,
    il text,
    ilce text,
    "postaKodu" text,
    varsayilan boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cari_bankalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cari_bankalar (
    id text NOT NULL,
    "cariId" text NOT NULL,
    "bankaAdi" text NOT NULL,
    "subeAdi" text,
    "subeKodu" text,
    "hesapNo" text,
    iban text NOT NULL,
    "paraBirimi" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cari_hareketler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cari_hareketler (
    id text NOT NULL,
    "cariId" text NOT NULL,
    tip public."BorcAlacak" NOT NULL,
    tutar numeric(12,2) NOT NULL,
    bakiye numeric(12,2) NOT NULL,
    "belgeTipi" public."BelgeTipi",
    "belgeNo" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" text
);


--
-- Name: cari_yetkililer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cari_yetkililer (
    id text NOT NULL,
    "cariId" text NOT NULL,
    "adSoyad" text NOT NULL,
    unvan text,
    telefon text,
    email text,
    dahili text,
    varsayilan boolean DEFAULT false NOT NULL,
    notlar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cariler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cariler (
    id text NOT NULL,
    "cariKodu" text NOT NULL,
    "tenantId" text,
    unvan text NOT NULL,
    tip public."CariTip" NOT NULL,
    "sirketTipi" public."SirketTipi" DEFAULT 'KURUMSAL'::public."SirketTipi",
    "vergiNo" text,
    "vergiDairesi" text,
    "tcKimlikNo" text,
    "isimSoyisim" text,
    telefon text,
    email text,
    ulke text DEFAULT 'Türkiye'::text,
    il text,
    ilce text,
    adres text,
    yetkili text,
    bakiye numeric(12,2) DEFAULT 0 NOT NULL,
    "vadeSuresi" integer,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text,
    "riskLimiti" numeric(12,2),
    "riskDurumu" public."RiskDurumu" DEFAULT 'NORMAL'::public."RiskDurumu",
    "teminatTutar" numeric(12,2),
    sektor text,
    "ozelKod1" text,
    "ozelKod2" text,
    "webSite" text,
    faks text,
    "vadeGun" integer,
    "paraBirimi" text,
    "bankaBilgileri" text
);


--
-- Name: cek_senet_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cek_senet_logs (
    id text NOT NULL,
    "cekSenetId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cek_senetler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cek_senetler (
    id text NOT NULL,
    "tenantId" text,
    tip public."CekSenetTip" NOT NULL,
    "portfoyTip" public."PortfoyTip" NOT NULL,
    "cariId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "kalanTutar" numeric(15,2) DEFAULT 0 NOT NULL,
    vade timestamp(3) without time zone NOT NULL,
    banka text,
    sube text,
    "hesapNo" text,
    "cekNo" text,
    "seriNo" text,
    durum public."CekSenetDurum",
    "tahsilTarihi" timestamp(3) without time zone,
    "tahsilKasaId" text,
    "ciroEdildi" boolean DEFAULT false NOT NULL,
    "ciroTarihi" timestamp(3) without time zone,
    "ciroEdilen" text,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sonBordroId" text
);


--
-- Name: code_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.code_templates (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    module public."ModuleType" NOT NULL,
    name text NOT NULL,
    prefix text NOT NULL,
    "digitCount" integer DEFAULT 3 NOT NULL,
    "currentValue" integer DEFAULT 0 NOT NULL,
    "includeYear" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: company_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_vehicles (
    id text NOT NULL,
    "tenantId" text,
    plaka text NOT NULL,
    marka text NOT NULL,
    model text NOT NULL,
    yil integer,
    saseno text,
    "motorNo" text,
    "tescilTarihi" timestamp(3) without time zone,
    "aracTipi" text,
    "yakitTipi" text,
    durum boolean DEFAULT true NOT NULL,
    "zimmetliPersonelId" text,
    "ruhsatGorselUrl" text,
    notlar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: customer_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_vehicles (
    id text NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    plaka text NOT NULL,
    saseno text,
    yil integer,
    km integer,
    "aracMarka" text NOT NULL,
    "aracModel" text NOT NULL,
    "aracMotorHacmi" text,
    "aracYakitTipi" text,
    "ruhsatNo" text,
    "tescilTarihi" timestamp(3) without time zone,
    "ruhsatSahibi" text,
    "motorGucu" integer,
    sanziman text,
    renk text,
    aciklama text,
    "ruhsatPhotoUrl" text,
    "servisDurum" public."VehicleServiceStatus",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: deleted_banka_havaleler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deleted_banka_havaleler (
    id text NOT NULL,
    "originalId" text NOT NULL,
    "hareketTipi" public."HavaleTipi" NOT NULL,
    "bankaHesabiId" text NOT NULL,
    "bankaHesabiAdi" text NOT NULL,
    "cariId" text NOT NULL,
    "cariUnvan" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    tarih timestamp(3) without time zone NOT NULL,
    aciklama text,
    "referansNo" text,
    gonderen text,
    alici text,
    "originalCreatedBy" text,
    "originalUpdatedBy" text,
    "originalCreatedAt" timestamp(3) without time zone NOT NULL,
    "originalUpdatedAt" timestamp(3) without time zone NOT NULL,
    "deletedBy" text,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleteReason" text
);


--
-- Name: deleted_cek_senetler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deleted_cek_senetler (
    id text NOT NULL,
    "originalId" text NOT NULL,
    tip public."CekSenetTip" NOT NULL,
    "portfoyTip" public."PortfoyTip" NOT NULL,
    "cariId" text NOT NULL,
    "cariUnvan" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    vade timestamp(3) without time zone NOT NULL,
    banka text,
    sube text,
    "hesapNo" text,
    "cekNo" text,
    "seriNo" text,
    durum public."CekSenetDurum" NOT NULL,
    "tahsilTarihi" timestamp(3) without time zone,
    "tahsilKasaId" text,
    "ciroEdildi" boolean NOT NULL,
    "ciroTarihi" timestamp(3) without time zone,
    "ciroEdilen" text,
    aciklama text,
    "originalCreatedBy" text,
    "originalUpdatedBy" text,
    "originalCreatedAt" timestamp(3) without time zone NOT NULL,
    "originalUpdatedAt" timestamp(3) without time zone NOT NULL,
    "deletedBy" text,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleteReason" text
);


--
-- Name: depolar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depolar (
    id text NOT NULL,
    "depoAdi" text NOT NULL,
    adres text,
    yetkili text,
    telefon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: efatura_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.efatura_inbox (
    id integer NOT NULL,
    ettn text NOT NULL,
    "senderVkn" text NOT NULL,
    "senderTitle" text NOT NULL,
    "invoiceNo" text,
    "invoiceDate" timestamp(3) without time zone,
    "rawXml" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.efatura_inbox_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.efatura_inbox_id_seq OWNED BY public.efatura_inbox.id;


--
-- Name: efatura_xml; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.efatura_xml (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "xmlData" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: esdeger_gruplar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.esdeger_gruplar (
    id text NOT NULL,
    "grupAdi" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: fatura_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fatura_kalemleri (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "iskontoOrani" numeric(10,2) DEFAULT 0,
    "iskontoTutari" numeric(10,2) DEFAULT 0,
    raf text,
    "purchaseOrderItemId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fatura_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fatura_logs (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fatura_tahsilatlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fatura_tahsilatlar (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "tahsilatId" text NOT NULL,
    tutar numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text
);


--
-- Name: faturalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faturalar (
    id text NOT NULL,
    "faturaNo" text NOT NULL,
    "faturaTipi" public."FaturaTipi" NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    "dovizToplam" numeric(12,2),
    "dovizCinsi" text DEFAULT 'TRY'::text NOT NULL,
    "dovizKuru" numeric(10,4) DEFAULT 1 NOT NULL,
    aciklama text,
    durum public."FaturaDurum" DEFAULT 'ACIK'::public."FaturaDurum" NOT NULL,
    "odenecekTutar" numeric(12,2),
    "odenenTutar" numeric(12,2) DEFAULT 0 NOT NULL,
    "siparisNo" text,
    "purchaseOrderId" text,
    "satinAlmaSiparisiId" text,
    "deliveryNoteId" text,
    "satinAlmaIrsaliyeId" text,
    "efaturaStatus" public."EFaturaStatus" DEFAULT 'PENDING'::public."EFaturaStatus",
    "efaturaEttn" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text,
    "warehouseId" text
);


--
-- Name: firma_kredi_karti_hareketler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firma_kredi_karti_hareketler (
    id text NOT NULL,
    "kartId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    bakiye numeric(15,2) NOT NULL,
    aciklama text,
    "cariId" text,
    "referansNo" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: firma_kredi_karti_hatirlaticilar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firma_kredi_karti_hatirlaticilar (
    id text NOT NULL,
    "kartId" text NOT NULL,
    tip text NOT NULL,
    gun integer NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: firma_kredi_kartlari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firma_kredi_kartlari (
    id text NOT NULL,
    "kasaId" text NOT NULL,
    "kartKodu" text NOT NULL,
    "kartAdi" text NOT NULL,
    "bankaAdi" text NOT NULL,
    "kartTipi" text,
    "sonDortHane" text,
    "limit" numeric(15,2),
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "hesapKesimTarihi" timestamp(3) without time zone,
    "sonOdemeTarihi" timestamp(3) without time zone
);


--
-- Name: hizli_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hizli_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    "loginHash" text NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hizli_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hizli_tokens_id_seq OWNED BY public.hizli_tokens.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id text NOT NULL,
    "tenantId" text,
    "partRequestId" text NOT NULL,
    "stokId" text NOT NULL,
    "warehouseId" text,
    quantity integer NOT NULL,
    "transactionType" public."InventoryTransactionType" DEFAULT 'DEDUCTION'::public."InventoryTransactionType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: invoice_profit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_profit (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "faturaKalemiId" text,
    "stokId" text NOT NULL,
    "tenantId" text,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "birimMaliyet" numeric(12,4) NOT NULL,
    "toplamSatisTutari" numeric(12,2) NOT NULL,
    "toplamMaliyet" numeric(12,2) NOT NULL,
    kar numeric(12,2) NOT NULL,
    "karOrani" numeric(10,2) NOT NULL,
    "hesaplamaTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id text NOT NULL,
    "tenantId" text,
    "referenceType" text NOT NULL,
    "referenceId" text NOT NULL,
    "serviceInvoiceId" text,
    "entryDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: kasa_hareketler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kasa_hareketler (
    id text NOT NULL,
    "kasaId" text NOT NULL,
    "hareketTipi" public."KasaHareketTipi" NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "komisyonTutari" numeric(15,2),
    "bsmvTutari" numeric(15,2),
    "netTutar" numeric(15,2),
    bakiye numeric(15,2) NOT NULL,
    "belgeTipi" text,
    "belgeNo" text,
    "cariId" text,
    aciklama text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "transferEdildi" boolean DEFAULT false NOT NULL,
    "transferTarihi" timestamp(3) without time zone,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: kasalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kasalar (
    id text NOT NULL,
    "kasaKodu" text NOT NULL,
    "tenantId" text,
    "kasaAdi" text NOT NULL,
    "kasaTipi" public."KasaTipi" NOT NULL,
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: maas_odeme_detaylari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maas_odeme_detaylari (
    id text NOT NULL,
    "tenantId" text,
    "odemeId" text NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "kasaId" text,
    "bankaHesapId" text,
    "referansNo" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: maas_odemeler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maas_odemeler (
    id text NOT NULL,
    "tenantId" text,
    "planId" text NOT NULL,
    "personelId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: maas_planlari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maas_planlari (
    id text NOT NULL,
    "tenantId" text,
    "personelId" text NOT NULL,
    yil integer NOT NULL,
    ay integer NOT NULL,
    maas numeric(10,2) NOT NULL,
    prim numeric(10,2) DEFAULT 0 NOT NULL,
    toplam numeric(10,2) NOT NULL,
    durum public."MaasDurum" DEFAULT 'ODENMEDI'::public."MaasDurum" NOT NULL,
    "odenenTutar" numeric(10,2) DEFAULT 0 NOT NULL,
    "kalanTutar" numeric(10,2) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: masraf_kategoriler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.masraf_kategoriler (
    id text NOT NULL,
    "kategoriAdi" text NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: masraflar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.masraflar (
    id text NOT NULL,
    "tenantId" text,
    "kategoriId" text NOT NULL,
    aciklama text,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: module_licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_licenses (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    "moduleId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: part_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_requests (
    id text NOT NULL,
    "tenantId" text,
    "workOrderId" text NOT NULL,
    "requestedBy" text NOT NULL,
    description text NOT NULL,
    "stokId" text,
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


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: personel_odemeler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personel_odemeler (
    id text NOT NULL,
    "personelId" text NOT NULL,
    tip public."PersonelOdemeTip" NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    donem text,
    aciklama text,
    "kasaId" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: personeller; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personeller (
    id text NOT NULL,
    "personelKodu" text NOT NULL,
    "tenantId" text,
    "tcKimlikNo" text,
    ad text NOT NULL,
    soyad text NOT NULL,
    "dogumTarihi" timestamp(3) without time zone,
    cinsiyet public."Cinsiyet",
    "medeniDurum" public."MedeniDurum",
    telefon text,
    email text,
    adres text,
    il text,
    ilce text,
    pozisyon text,
    departman text,
    "iseBaslamaTarihi" timestamp(3) without time zone,
    "istenCikisTarihi" timestamp(3) without time zone,
    aktif boolean DEFAULT true NOT NULL,
    maas numeric(10,2),
    "maasGunu" integer,
    "sgkNo" text,
    "ibanNo" text,
    bakiye numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    prim numeric(10,2)
);


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: postal_codes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: price_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_cards (
    id text NOT NULL,
    stok_id text NOT NULL,
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


--
-- Name: product_barcodes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: product_location_stocks; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: raflar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.raflar (
    id text NOT NULL,
    "depoId" text NOT NULL,
    "rafKodu" text NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: satin_alma_irsaliyeleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_irsaliyeleri (
    id text NOT NULL,
    "irsaliyeNo" text NOT NULL,
    "irsaliyeTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "depoId" text,
    "kaynakTip" public."IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" text,
    durum public."IrsaliyeDurum" DEFAULT 'FATURALANMADI'::public."IrsaliyeDurum" NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: satin_alma_irsaliyesi_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_irsaliyesi_kalemleri (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: satin_alma_irsaliyesi_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_irsaliyesi_logs (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: satin_alma_siparis_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_siparis_kalemleri (
    id text NOT NULL,
    "satınAlmaSiparisId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "sevkEdilenMiktar" integer DEFAULT 0 NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: satin_alma_siparis_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_siparis_logs (
    id text NOT NULL,
    "satınAlmaSiparisId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: satin_alma_siparisleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satin_alma_siparisleri (
    id text NOT NULL,
    "siparisNo" text NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."SatınAlmaSiparisDurum" DEFAULT 'BEKLEMEDE'::public."SatınAlmaSiparisDurum" NOT NULL,
    "faturaNo" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deliveryNoteId" text
);


--
-- Name: satis_elemanlari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satis_elemanlari (
    id text NOT NULL,
    "adSoyad" text NOT NULL,
    telefon text,
    email text,
    aktif boolean DEFAULT true NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: satis_irsaliyeleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satis_irsaliyeleri (
    id text NOT NULL,
    "irsaliyeNo" text NOT NULL,
    "irsaliyeTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "depoId" text,
    "kaynakTip" public."IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" text,
    durum public."IrsaliyeDurum" DEFAULT 'FATURALANMADI'::public."IrsaliyeDurum" NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: satis_irsaliyesi_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satis_irsaliyesi_kalemleri (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "faturalananMiktar" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: satis_irsaliyesi_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satis_irsaliyesi_logs (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sayim_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sayim_kalemleri (
    id text NOT NULL,
    "sayimId" text NOT NULL,
    "stokId" text NOT NULL,
    "locationId" text,
    "sistemMiktari" integer NOT NULL,
    "sayilanMiktar" integer NOT NULL,
    "farkMiktari" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sayimlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sayimlar (
    id text NOT NULL,
    "sayimNo" text NOT NULL,
    "tenantId" text,
    "sayimTipi" public."SayimTipi" NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    durum public."SayimDurum" DEFAULT 'TASLAK'::public."SayimDurum" NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "onaylayanId" text,
    "onayTarihi" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: service_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_invoices (
    id text NOT NULL,
    "tenantId" text,
    "invoiceNo" text NOT NULL,
    "workOrderId" text NOT NULL,
    "cariId" text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    subtotal numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "grandTotal" numeric(12,2) NOT NULL,
    "dovizCinsi" text DEFAULT 'TRY'::text NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: siparis_hazirliklar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparis_hazirliklar (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "siparisKalemiId" text NOT NULL,
    "locationId" text NOT NULL,
    miktar integer NOT NULL,
    hazirlayan text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: siparis_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparis_kalemleri (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "sevkEdilenMiktar" integer DEFAULT 0 NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: siparis_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparis_logs (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: siparisler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparisler (
    id text NOT NULL,
    "siparisNo" text NOT NULL,
    "tenantId" text,
    "siparisTipi" public."SiparisTipi" NOT NULL,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."SiparisDurum" DEFAULT 'BEKLEMEDE'::public."SiparisDurum" NOT NULL,
    "faturaNo" text,
    "deliveryNoteId" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stock_cost_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_cost_history (
    id text NOT NULL,
    stok_id text NOT NULL,
    cost numeric(12,4) NOT NULL,
    method text DEFAULT 'WEIGHTED_AVERAGE'::text NOT NULL,
    computed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    marka text,
    "anaKategori" text,
    "altKategori" text,
    note text
);


--
-- Name: stock_moves; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: stok_esdegers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stok_esdegers (
    id text NOT NULL,
    "stok1Id" text NOT NULL,
    "stok2Id" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stok_hareketleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stok_hareketleri (
    id text NOT NULL,
    "stokId" text NOT NULL,
    "hareketTipi" public."HareketTipi" NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "warehouseId" text,
    "tenantId" text,
    "faturaKalemiId" text
);


--
-- Name: stoklar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stoklar (
    id text NOT NULL,
    "stokKodu" text NOT NULL,
    "tenantId" text,
    "stokAdi" text NOT NULL,
    aciklama text,
    birim text NOT NULL,
    "alisFiyati" numeric(10,2) NOT NULL,
    "satisFiyati" numeric(10,2) NOT NULL,
    "kdvOrani" integer DEFAULT 20 NOT NULL,
    "kritikStokMiktari" integer DEFAULT 0 NOT NULL,
    kategori text,
    "anaKategori" text,
    "altKategori" text,
    marka text,
    model text,
    oem text,
    olcu text,
    raf text,
    barkod text,
    "tedarikciKodu" text,
    "esdegerGrupId" text,
    "aracMarka" text,
    "aracModel" text,
    "aracMotorHacmi" text,
    "aracYakitTipi" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sadeceKategoriTanimi" boolean DEFAULT false,
    "sadeceMarkaTanimi" boolean DEFAULT false
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: system_parameters; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: tahsilatlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tahsilatlar (
    id text NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "faturaId" text,
    "serviceInvoiceId" text,
    tip public."TahsilatTip" NOT NULL,
    tutar numeric(12,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    "kasaId" text,
    "bankaHesapId" text,
    "firmaKrediKartiId" text,
    aciklama text,
    "createdBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text
);


--
-- Name: teklif_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teklif_kalemleri (
    id text NOT NULL,
    "teklifId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "iskontoOran" numeric(5,2),
    "iskontoTutar" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: teklif_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teklif_logs (
    id text NOT NULL,
    "teklifId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: teklifler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teklifler (
    id text NOT NULL,
    "teklifNo" text NOT NULL,
    "tenantId" text,
    "teklifTipi" public."TeklifTipi" NOT NULL,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gecerlilikTarihi" timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."TeklifDurum" DEFAULT 'TEKLIF'::public."TeklifDurum" NOT NULL,
    "siparisId" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: tenant_purge_audits; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: urun_raflar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.urun_raflar (
    id text NOT NULL,
    "stokId" text NOT NULL,
    "rafId" text NOT NULL,
    miktar integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_licenses; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: vehicle_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_expenses (
    id text NOT NULL,
    "tenantId" text,
    "vehicleId" text NOT NULL,
    "masrafTipi" public."VehicleExpenseType" NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tutar numeric(12,2) NOT NULL,
    aciklama text,
    "belgeNo" text,
    kilometre integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: warehouse_critical_stocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse_critical_stocks (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    "productId" text NOT NULL,
    "criticalQty" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: warehouse_transfer_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse_transfer_items (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "fromLocationId" text,
    "toLocationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: warehouse_transfer_logs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: warehouse_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse_transfers (
    id text NOT NULL,
    "transferNo" text NOT NULL,
    "tenantId" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fromWarehouseId" text NOT NULL,
    "toWarehouseId" text NOT NULL,
    durum public."TransferStatus" DEFAULT 'HAZIRLANIYOR'::public."TransferStatus" NOT NULL,
    "driverName" text,
    "vehiclePlate" text,
    aciklama text,
    "hazirlayanUserId" text,
    "onaylayanUserId" text,
    "teslimAlanUserId" text,
    "sevkTarihi" timestamp(3) without time zone,
    "teslimTarihi" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: work_order_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_activities (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    action text NOT NULL,
    "userId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: work_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_items (
    id text NOT NULL,
    "workOrderId" text NOT NULL,
    type public."WorkOrderItemType" NOT NULL,
    description text NOT NULL,
    "stokId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "taxRate" integer DEFAULT 20 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id text NOT NULL,
    "workOrderNo" text NOT NULL,
    "tenantId" text,
    status public."WorkOrderStatus" DEFAULT 'WAITING_DIAGNOSIS'::public."WorkOrderStatus" NOT NULL,
    "partWorkflowStatus" public."PartWorkflowStatus" DEFAULT 'NOT_STARTED'::public."PartWorkflowStatus" NOT NULL,
    "vehicleWorkflowStatus" public."VehicleWorkflowStatus" DEFAULT 'WAITING'::public."VehicleWorkflowStatus" NOT NULL,
    "customerVehicleId" text NOT NULL,
    "cariId" text NOT NULL,
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


--
-- Name: efatura_inbox id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.efatura_inbox ALTER COLUMN id SET DEFAULT nextval('public.efatura_inbox_id_seq'::regclass);


--
-- Name: hizli_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hizli_tokens ALTER COLUMN id SET DEFAULT nextval('public.hizli_tokens_id_seq'::regclass);


--
-- Data for Name: araclar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.araclar (id, marka, model, "motorHacmi", "yakitTipi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", "tenantId", action, resource, "resourceId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: avans_mahsuplasmalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.avans_mahsuplasmalar (id, "tenantId", "avansId", "planId", tutar, tarih, aciklama) FROM stdin;
\.


--
-- Data for Name: avanslar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.avanslar (id, "tenantId", "personelId", tutar, tarih, aciklama, "kasaId", "mahsupEdilen", kalan, durum, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: banka_havale_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_havale_logs (id, "bankaHavaleId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: banka_havaleler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_havaleler (id, "tenantId", "hareketTipi", "bankaHesabiId", "cariId", tutar, tarih, aciklama, "referansNo", gonderen, alici, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "bankaHesapId") FROM stdin;
\.


--
-- Data for Name: banka_hesap_hareketler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_hesap_hareketler (id, "hesapId", "hareketTipi", "hareketAltTipi", tutar, "komisyonOrani", "komisyonTutar", "netTutar", bakiye, aciklama, "referansNo", "cariId", tarih, "createdAt") FROM stdin;
\.


--
-- Data for Name: banka_hesaplari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_hesaplari (id, "bankaId", "hesapKodu", "hesapAdi", "hesapNo", iban, "hesapTipi", bakiye, aktif, "komisyonOrani", "krediLimiti", "kullanilanLimit", "kartLimiti", "hesapKesimGunu", "sonOdemeGunu", "terminalNo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: banka_kredi_planlari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_kredi_planlari (id, "krediId", "taksitNo", "vadeTarihi", tutar, odenen, durum, "tenantId") FROM stdin;
\.


--
-- Data for Name: banka_krediler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banka_krediler (id, "bankaHesapId", tutar, "toplamGeriOdeme", "toplamFaiz", "taksitSayisi", "baslangicTarihi", aciklama, "krediTuru", durum, "yillikFaizOrani", "odemeSikligi", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bankalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bankalar (id, "tenantId", ad, sube, sehir, yetkili, telefon, logo, durum, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: basit_siparisler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.basit_siparisler (id, "tenantId", "firmaId", "urunId", miktar, durum, "createdAt", "updatedAt", "tedarikEdilenMiktar") FROM stdin;
\.


--
-- Data for Name: bordrolar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bordrolar (id, "bordroNo", tip, tarih, "cariId", aciklama, "tenantId", "createdById", "createdAt", "updatedAt", "bankaHesabiId") FROM stdin;
\.


--
-- Data for Name: cari_adresler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cari_adresler (id, "cariId", baslik, tip, adres, il, ilce, "postaKodu", varsayilan, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cari_bankalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cari_bankalar (id, "cariId", "bankaAdi", "subeAdi", "subeKodu", "hesapNo", iban, "paraBirimi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cari_hareketler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cari_hareketler (id, "cariId", tip, tutar, bakiye, "belgeTipi", "belgeNo", tarih, aciklama, "createdAt", "updatedAt", "tenantId") FROM stdin;
771b6e1a-6ba5-4dea-b03a-21e0e84b22a8	073863fe-4194-4895-99c4-a9eade2aaa69	BORC	202282.02	-309401.27	FATURA	SF-2026-001	2026-02-20 00:00:00	Satış Faturası: SF-2026-001	2026-02-22 22:04:00.935	2026-02-22 22:04:00.935	clxyedekparca00001
65539957-ac86-446a-a717-a6175e6421c2	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	7666.97	-34723.42	FATURA	AF-2026-017	2025-10-29 00:00:00	Alış Faturası: AF-2026-017	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e8a415a1-70a2-4061-8c55-5e3e6f2ced57	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	946.93	-34723.42	FATURA	AF-2026-020	2025-10-29 00:00:00	Alış Faturası: AF-2026-020	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
2a24da59-ef3d-49ba-9439-68741f8eed1e	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	2714.02	-34723.42	FATURA	AF-2026-018	2025-10-29 00:00:00	Alış Faturası: AF-2026-018	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
c13e0ed4-8b21-4f2f-82a8-8915d7fa8356	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	2917.39	-34723.42	FATURA	AF-2026-019	2025-10-29 00:00:00	Alış Faturası: AF-2026-019	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
cfbf6206-272a-4c93-a051-415abd87efce	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	20478.11	-34723.42	FATURA	AF-2026-016	2025-10-29 00:00:00	Alış Faturası: AF-2026-016	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ea6d52a5-1246-42eb-8ab4-856a3fe1957a	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	32984.39	-154688.62	FATURA	AF-2026-063	2025-11-25 00:00:00	Alış Faturası: AF-2026-063	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
4f11105d-fc4d-4450-8f7c-c3e6922f8d40	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	17619.66	-154688.62	FATURA	AF-2026-064	2025-11-25 00:00:00	Alış Faturası: AF-2026-064	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
2c803adb-6019-44a0-aec2-520fc2a84592	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	22518.87	-154688.62	FATURA	AF-2026-062	2025-11-25 00:00:00	Alış Faturası: AF-2026-062	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
fb6880fb-62ca-4386-8055-ab024bfe2191	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	46842.28	-154688.62	FATURA	AF-2026-065	2025-11-25 00:00:00	Alış Faturası: AF-2026-065	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
27dad573-bdf7-4da9-b590-d036e2acac86	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	13453.90	-184995.88	FATURA	AF-2026-014	2025-11-27 00:00:00	Alış Faturası: AF-2026-014	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
b78c0d49-2f8a-46a2-b962-3caf42ab9d11	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	16186.27	-184995.88	FATURA	AF-2026-012	2025-11-27 00:00:00	Alış Faturası: AF-2026-012	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
cadb064a-eb59-4158-b332-8ecc8d056d3b	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	667.09	-184995.88	FATURA	AF-2026-015	2025-11-27 00:00:00	Alış Faturası: AF-2026-015	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
82c8e06d-fadd-4f09-9beb-0e451d2e2579	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	4905.00	-198989.88	FATURA	AF-2026-031	2025-12-01 00:00:00	Alış Faturası: AF-2026-031	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
098d8668-1ab5-4ab6-9efc-2a87ed0dfdb1	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	4300.00	-198989.88	FATURA	AF-2026-030	2025-12-01 00:00:00	Alış Faturası: AF-2026-030	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
5dd29969-b9db-4232-a66b-4912b3219852	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	4789.00	-198989.88	FATURA	AF-2026-032	2025-12-01 00:00:00	Alış Faturası: AF-2026-032	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e067f0bd-36dd-4bd4-b5c5-80e7e721c533	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	62133.49	-261123.37	FATURA	AF-2026-029	2025-12-03 00:00:00	Alış Faturası: AF-2026-029	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
f6177e7d-a05a-44b9-92ef-767a42f63f01	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	24177.84	-285301.21	FATURA	AF-2026-005	2025-12-04 00:00:00	Alış Faturası: AF-2026-005	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
57790d9a-3be7-4d7a-87f7-4367c66833c3	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	5859.89	-291161.10	FATURA	AF-2026-010	2025-12-05 00:00:00	Alış Faturası: AF-2026-010	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
feccbb1e-087d-46de-ba3c-a2f1258f8738	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	2871.23	-294032.33	FATURA	AF-2026-027	2025-12-18 00:00:00	Alış Faturası: AF-2026-027	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
f6d95427-5103-4e11-bab1-b5309d55d67a	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	46250.28	-340282.61	FATURA	AF-2026-026	2025-12-19 00:00:00	Alış Faturası: AF-2026-026	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
2851ac71-930e-4959-bab4-f2bdde5ea27e	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	14533.56	-354816.17	FATURA	AF-2026-022	2025-12-20 00:00:00	Alış Faturası: AF-2026-022	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
62be9a09-207a-4f19-9e74-5719e065ad82	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	60.95	-355902.06	FATURA	AF-2026-006	2025-12-22 00:00:00	Alış Faturası: AF-2026-006	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
401eb85f-6745-40f6-ae4e-133f8e80ca1e	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	149.46	-355902.06	FATURA	AF-2026-009	2025-12-22 00:00:00	Alış Faturası: AF-2026-009	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
3daf216d-95f3-4fb8-88f9-4e0b659210f0	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	503.54	-355902.06	FATURA	AF-2026-011	2025-12-22 00:00:00	Alış Faturası: AF-2026-011	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
b8736382-0f0b-40f9-9ffa-07d7597ba128	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	371.94	-355902.06	FATURA	AF-2026-007	2025-12-22 00:00:00	Alış Faturası: AF-2026-007	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
56ccb759-f6e8-403a-819d-922760e7d114	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	609.18	-356511.24	FATURA	AF-2026-021	2025-12-24 00:00:00	Alış Faturası: AF-2026-021	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
1eed5958-614e-4bb9-99b7-df954e559707	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	739.92	-358890.82	FATURA	AF-2026-004	2025-12-25 00:00:00	Alış Faturası: AF-2026-004	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
17584574-b2a0-45bd-bd5c-19d61e7787c6	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	1639.66	-358890.82	FATURA	AF-2026-024	2025-12-25 00:00:00	Alış Faturası: AF-2026-024	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
16072257-4f1f-49bf-ab62-80469d1a90fa	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	10672.75	-369563.57	FATURA	AF-2026-025	2025-12-27 00:00:00	Alış Faturası: AF-2026-025	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
2e65412a-3f92-4bd5-aa5e-6913817db03b	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	423.95	-370044.94	FATURA	AF-2026-013	2026-01-02 00:00:00	Alış Faturası: AF-2026-013	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
01529f82-d2f1-4beb-a11a-fcc378e35d16	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	57.42	-370044.94	FATURA	AF-2026-008	2026-01-02 00:00:00	Alış Faturası: AF-2026-008	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
1743cfb7-daed-4a62-8334-efdbeca0008a	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	4222.81	-374267.75	FATURA	AF-2026-023	2026-01-09 00:00:00	Alış Faturası: AF-2026-023	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e9e60c5e-321d-4965-9628-676ba47a8dea	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	756.84	-377448.93	FATURA	AF-2026-003	2026-01-20 00:00:00	Alış Faturası: AF-2026-003	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
a6b379a2-c545-4c18-8b33-12713fa21f24	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	2424.34	-377448.93	FATURA	AF-2026-002	2026-01-20 00:00:00	Alış Faturası: AF-2026-002	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ab61b315-aa87-4197-820a-acddda39a093	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	106391.00	-483839.93	FATURA	AF-2026-001	2026-01-21 00:00:00	Alış Faturası: AF-2026-001	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
2861e2de-48a5-4e82-83e4-78079a0b2d0f	073863fe-4194-4895-99c4-a9eade2aaa69	ALACAK	27843.36	-511683.29	FATURA	AF-2026-028	2026-01-24 00:00:00	Alış Faturası: AF-2026-028	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
83a45ae9-e934-424f-b432-efce55b86db1	60c3b6e3-0504-4cf2-8582-6f951185229c	ALACAK	10000.00	-10000.00	FATURA	AF-2026-073	2026-02-11 00:00:00	Alış Faturası: AF-2026-073	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
16b90afc-e823-4167-a5bd-11b174ab8802	6cb993f2-2b92-44aa-9322-23532f8a6be2	ALACAK	5651.88	-5651.88	FATURA	AF-2026-056	2026-01-29 00:00:00	Alış Faturası: AF-2026-056	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
5a22008d-737f-40de-b167-f2d1fec05576	770162db-e7ae-47bc-bebf-267607e8c24a	ALACAK	3100.00	-3100.00	FATURA	AF-2026-055	2026-02-02 00:00:00	Alış Faturası: AF-2026-055	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
01293700-76a6-4af4-9162-da4ea8ce1152	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	1618.61	-1618.61	FATURA	AF-2026-053	2026-01-19 00:00:00	Alış Faturası: AF-2026-053	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
1e244a4d-ada8-4e77-9539-ee0a5de357f6	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	19045.49	-20664.10	FATURA	AF-2026-070	2026-01-27 00:00:00	Alış Faturası: AF-2026-070	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
15b3ffa4-bbb3-401e-8cd1-d3b46478250f	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	2604.97	-24373.40	FATURA	AF-2026-051	2026-01-28 00:00:00	Alış Faturası: AF-2026-051	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
1807bc2a-7af8-4213-b374-5fb899148d5f	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	531.35	-24373.40	FATURA	AF-2026-050	2026-01-28 00:00:00	Alış Faturası: AF-2026-050	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
dcc400bb-bae7-419b-9bc8-f277933f1cbe	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	572.98	-24373.40	FATURA	AF-2026-052	2026-01-28 00:00:00	Alış Faturası: AF-2026-052	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ea3615fc-2b36-4fad-9274-3fce3044b6ad	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	12011.28	-38896.34	FATURA	AF-2026-049	2026-01-29 00:00:00	Alış Faturası: AF-2026-049	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
cf7b49f8-7400-4fd7-92f4-1b13ce14b2c6	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	2511.66	-38896.34	FATURA	AF-2026-048	2026-01-29 00:00:00	Alış Faturası: AF-2026-048	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
d7f83eab-61dc-4d0c-adf4-326e1c2304a2	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	2656.06	-41552.40	FATURA	AF-2026-054	2026-02-03 00:00:00	Alış Faturası: AF-2026-054	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
24451524-c302-46e8-8e00-30370e2518bd	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	1409.00	-42961.40	FATURA	AF-2026-060	2026-02-05 00:00:00	Alış Faturası: AF-2026-060	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
576d7408-dd98-4db7-b360-bd988760551c	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	1287.01	-44248.41	FATURA	AF-2026-071	2026-02-09 00:00:00	Alış Faturası: AF-2026-071	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
97db031d-440c-43a9-b025-4dab2047922b	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	1964.66	-46213.07	FATURA	AF-2026-072	2026-02-10 00:00:00	Alış Faturası: AF-2026-072	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
62aca601-61f9-4370-bfca-c3c4a166714f	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	619.24	-48868.81	FATURA	AF-2026-086	2026-02-12 00:00:00	Alış Faturası: AF-2026-086	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
6f87ff8a-18d8-46df-9fde-ea3f33b71b21	9d9060ca-9249-40d5-b6aa-3d81f870cecf	ALACAK	2036.50	-48868.81	FATURA	AF-2026-092	2026-02-12 00:00:00	Alış Faturası: AF-2026-092	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
de27be55-a707-46f5-8d00-00df60f416e2	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	243.58	-1292.97	FATURA	AF-2026-034	2026-01-27 00:00:00	Alış Faturası: AF-2026-034	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
5f319a35-7f42-4474-8b74-f71fc3681675	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1049.39	-1292.97	FATURA	AF-2026-033	2026-01-27 00:00:00	Alış Faturası: AF-2026-033	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
4fb6ef28-d47a-45f8-ad70-9d88348584bc	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	6432.43	-30635.86	FATURA	AF-2026-085	2026-01-28 00:00:00	Alış Faturası: AF-2026-085	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
3d4dcb9d-d1ba-422b-89af-9a9fe28e8afd	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	5039.30	-30635.86	FATURA	AF-2026-035	2026-01-28 00:00:00	Alış Faturası: AF-2026-035	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
d56471b0-7785-46f7-a79a-2348d01440d6	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	14660.94	-30635.86	FATURA	AF-2026-036	2026-01-28 00:00:00	Alış Faturası: AF-2026-036	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
f67f9e24-4c83-4c3f-a94f-92be117571db	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2914.85	-30635.86	FATURA	AF-2026-084	2026-01-28 00:00:00	Alış Faturası: AF-2026-084	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
28988271-a85b-4cde-bfbe-269a813b6118	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	295.37	-30635.86	FATURA	AF-2026-041	2026-01-28 00:00:00	Alış Faturası: AF-2026-041	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
f40b492c-ad85-493a-b4b2-a65e67201f11	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2736.62	-34221.58	FATURA	AF-2026-042	2026-01-29 00:00:00	Alış Faturası: AF-2026-042	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
49c597c7-3726-455c-8f4e-001fd1305f18	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	849.10	-34221.58	FATURA	AF-2026-037	2026-01-29 00:00:00	Alış Faturası: AF-2026-037	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ad38cbe1-8a87-4ae1-b7ce-62d76df6d054	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	747.18	-34968.76	FATURA	AF-2026-038	2026-01-30 00:00:00	Alış Faturası: AF-2026-038	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
b61b210d-f32c-4cb8-a6f1-b7f959e3371e	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1370.38	-36339.14	FATURA	AF-2026-039	2026-01-31 00:00:00	Alış Faturası: AF-2026-039	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
34071169-dbab-41bb-ab21-70d4ea14e6fb	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	296.30	-36635.44	FATURA	AF-2026-040	2026-02-02 00:00:00	Alış Faturası: AF-2026-040	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
25cdbb01-a232-4643-9cb8-b0d0cafcb10b	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	842.19	-38194.09	FATURA	AF-2026-099	2026-02-03 00:00:00	Alış Faturası: AF-2026-099	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
624d8244-db7f-4d8f-83c5-cd6b1617350e	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	716.46	-38194.09	FATURA	AF-2026-043	2026-02-03 00:00:00	Alış Faturası: AF-2026-043	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
359ef555-31a2-43fb-b84e-c906e2305725	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	3234.66	-43089.29	FATURA	AF-2026-045	2026-02-04 00:00:00	Alış Faturası: AF-2026-045	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
d798ae8c-a8a4-4812-bf4c-227497fd9d56	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	861.19	-43089.29	FATURA	AF-2026-044	2026-02-04 00:00:00	Alış Faturası: AF-2026-044	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
b1241ed4-5e46-407f-9ff3-5014b8353577	a1a13a62-36b2-4955-be0d-1aca0934af13	BORC	243.58	-43089.29	FATURA	AIF-2026-001	2026-02-04 00:00:00	Alış İade Faturası: AIF-2026-001	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
d21dfac8-6782-425e-aa9a-107a48d23efd	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	439.99	-43089.29	FATURA	AF-2026-046	2026-02-04 00:00:00	Alış Faturası: AF-2026-046	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
eaf2b1b8-9aa0-48ae-bf1f-88fdf8032c20	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	602.94	-43089.29	FATURA	AF-2026-047	2026-02-04 00:00:00	Alış Faturası: AF-2026-047	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
37a9eb28-64b6-45fd-bd50-56271f58b15c	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2472.41	-47918.10	FATURA	AF-2026-059	2026-02-05 00:00:00	Alış Faturası: AF-2026-059	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ab8b38bb-6db8-4a8b-8370-a6ec7045c0df	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	280.63	-47918.10	FATURA	AF-2026-058	2026-02-05 00:00:00	Alış Faturası: AF-2026-058	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
6c3d4df8-722c-4078-9978-2672c4844ac3	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2075.77	-47918.10	FATURA	AF-2026-057	2026-02-05 00:00:00	Alış Faturası: AF-2026-057	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
b18720f8-a925-4f08-baa9-fdc2616334b9	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	538.46	-48456.56	FATURA	AF-2026-069	2026-02-07 00:00:00	Alış Faturası: AF-2026-069	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
735be583-db17-490b-aee0-267c8b48439d	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1359.37	-55993.40	FATURA	AF-2026-067	2026-02-09 00:00:00	Alış Faturası: AF-2026-067	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e05755e4-8373-413a-8039-f9c54b35a01e	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	4654.91	-55993.40	FATURA	AF-2026-083	2026-02-09 00:00:00	Alış Faturası: AF-2026-083	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
23dd8b97-b465-48ea-9db8-738b6d1452af	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1522.56	-55993.40	FATURA	AF-2026-068	2026-02-09 00:00:00	Alış Faturası: AF-2026-068	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e8e19f83-d8aa-42b8-a095-d0a9d2296b58	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	654.34	-62682.23	FATURA	AF-2026-066	2026-02-10 00:00:00	Alış Faturası: AF-2026-066	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
9cf33989-eb12-4ca6-9bd6-4e6e1a396009	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	765.12	-62682.23	FATURA	AF-2026-077	2026-02-10 00:00:00	Alış Faturası: AF-2026-077	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
1dd5f72d-29dd-42e6-a810-c36f8db15866	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	257.24	-62682.23	FATURA	AF-2026-078	2026-02-10 00:00:00	Alış Faturası: AF-2026-078	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e1748c3e-4ac5-44f4-918d-e6f1376ba4da	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1737.22	-62682.23	FATURA	AF-2026-076	2026-02-10 00:00:00	Alış Faturası: AF-2026-076	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
129cb164-8c26-495e-9d83-6f4b1e2d4686	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	592.55	-62682.23	FATURA	AF-2026-074	2026-02-10 00:00:00	Alış Faturası: AF-2026-074	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
ed2d4f8a-5361-4af1-9aa3-9a843a77ad2a	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	416.51	-62682.23	FATURA	AF-2026-080	2026-02-10 00:00:00	Alış Faturası: AF-2026-080	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
08ac4d8d-3b7f-48b9-9c17-1da799b7b157	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2265.85	-62682.23	FATURA	AF-2026-079	2026-02-10 00:00:00	Alış Faturası: AF-2026-079	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
bb1cf8a4-ffbc-4e6c-b959-a7d9c9900fa6	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	3215.69	-65897.92	FATURA	AF-2026-075	2026-02-11 00:00:00	Alış Faturası: AF-2026-075	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
fea47bd5-1b96-471d-9c21-7c8f04c2b84b	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1058.00	-66955.92	FATURA	AF-2026-087	2026-02-12 00:00:00	Alış Faturası: AF-2026-087	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
4bda68f1-18df-4c76-9932-8dfe97e70638	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	53.08	-67469.70	FATURA	AF-2026-088	2026-02-14 00:00:00	Alış Faturası: AF-2026-088	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
3672d86f-96a4-4f02-8597-992f38ce62b3	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	460.70	-67469.70	FATURA	AF-2026-091	2026-02-14 00:00:00	Alış Faturası: AF-2026-091	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
de04a96c-69d6-4f67-8814-103991976483	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	597.20	-68985.70	FATURA	AF-2026-089	2026-02-16 00:00:00	Alış Faturası: AF-2026-089	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
f605a80a-3bb7-465e-a1a1-899be44ed04a	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	248.08	-68985.70	FATURA	AF-2026-090	2026-02-16 00:00:00	Alış Faturası: AF-2026-090	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
e082d35c-2e19-41fd-b016-c637db9dcc64	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	670.72	-68985.70	FATURA	AF-2026-095	2026-02-16 00:00:00	Alış Faturası: AF-2026-095	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
cc4067ad-c0f1-4f61-ae0a-2aadc6a571aa	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	881.45	-71260.83	FATURA	AF-2026-097	2026-02-17 00:00:00	Alış Faturası: AF-2026-097	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
337910a6-c5a0-4398-a38a-d32b033c9da6	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	1017.18	-71260.83	FATURA	AF-2026-094	2026-02-17 00:00:00	Alış Faturası: AF-2026-094	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
23da29b9-cfd3-4c7f-b2c5-dbb45ca3f53e	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	376.50	-71260.83	FATURA	AF-2026-093	2026-02-17 00:00:00	Alış Faturası: AF-2026-093	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
701476c0-c785-44b2-a29a-006a5b1932a4	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	954.56	-72215.39	FATURA	AF-2026-096	2026-02-18 00:00:00	Alış Faturası: AF-2026-096	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
3b6df177-a482-4a2c-bbdb-8dc3de4b698a	a1a13a62-36b2-4955-be0d-1aca0934af13	ALACAK	2290.42	-74505.81	FATURA	AF-2026-098	2026-02-19 00:00:00	Alış Faturası: AF-2026-098	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
801bc32b-d4cf-470e-8d90-e1ae2739855c	b90aeab6-aad0-4c13-907c-69625d2da38f	ALACAK	43560.00	-92700.00	FATURA	AF-2026-082	2026-02-12 00:00:00	Alış Faturası: AF-2026-082	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
3d65e3d2-2faa-4a3b-8067-93ff52ac50a3	b90aeab6-aad0-4c13-907c-69625d2da38f	ALACAK	49140.00	-92700.00	FATURA	AF-2026-081	2026-02-12 00:00:00	Alış Faturası: AF-2026-081	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
a6cdf145-041f-44f1-b6c2-a58fb5f546a7	ccf7592c-c2c1-4179-b1f7-7bc3cdfe4ec1	ALACAK	25560.00	-25560.00	FATURA	AF-2026-061	2026-02-07 00:00:00	Alış Faturası: AF-2026-061	2026-02-22 21:17:30.681	2026-02-22 21:17:30.681	clxyedekparca00001
8eb396a0-5c43-4d8e-bea8-011a9f0a804b	770162db-e7ae-47bc-bebf-267607e8c24a	ALACAK	26.40	-3100.00	DUZELTME	SF00001-IPTAL	2026-02-26 17:51:45.134	Fatura İptali: SF00001	2026-02-26 17:51:45.135	2026-02-26 17:51:45.135	\N
\.


--
-- Data for Name: cari_yetkililer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cari_yetkililer (id, "cariId", "adSoyad", unvan, telefon, email, dahili, varsayilan, notlar, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cariler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cariler (id, "cariKodu", "tenantId", unvan, tip, "sirketTipi", "vergiNo", "vergiDairesi", "tcKimlikNo", "isimSoyisim", telefon, email, ulke, il, ilce, adres, yetkili, bakiye, "vadeSuresi", aktif, "createdAt", "updatedAt", "satisElemaniId", "riskLimiti", "riskDurumu", "teminatTutar", sektor, "ozelKod1", "ozelKod2", "webSite", faks, "vadeGun", "paraBirimi", "bankaBilgileri") FROM stdin;
6cb993f2-2b92-44aa-9322-23532f8a6be2	C00030	clxyedekparca00001	WÜRTH SANAYİ ÜRÜNLERİ TİCARET LİMİTED ŞİRKETİ	TEDARIKCI	KURUMSAL	9260032906	YENİKAPI	\N	\N	02128666200	info@xn--wrth-0ra.com.tr	Türkiye	\N	\N	Büyükçekmece, İstanbul	CAVİT	-5651.88	7	t	2026-02-05 10:53:22.842	2026-02-05 10:59:27.985	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
b90aeab6-aad0-4c13-907c-69625d2da38f	C00016	clxyedekparca00001	SELİM KİRMİTCİ	TEDARIKCI	KURUMSAL	\N	\N	11111111111	SELİM KİRMİTCİ	05069735153		Türkiye	\N	\N	Seyhan, Adana, HAYDAROĞLU MH.	SELİM KİRMİTCİ	-92700.00	\N	t	2026-01-21 11:45:25.181	2026-02-12 09:43:22.499	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
ccf7592c-c2c1-4179-b1f7-7bc3cdfe4ec1	C00032	clxyedekparca00001	MUHİTTİN ARIKAN	TEDARIKCI	KURUMSAL	\N	\N	11332386816	MUHİTTİN ARIKAN	05079898490	MMMMM@xn--gmail-bgd.com	Türkiye	\N	\N	Seyhan, Adana	MUHİTTİN ARIKAN	-25560.00	7	t	2026-02-07 08:50:00.303	2026-02-07 08:54:34.313	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
60c3b6e3-0504-4cf2-8582-6f951185229c	C00034	clxyedekparca00001	YAĞMUR OTOMOTİV SAN. VE TİC. LTD. ŞTİ.	HER_IKISI	KURUMSAL	1030926818	BEŞOCAK	\N	\N	03224360999		Türkiye	\N	\N	Seyhan, Adana	YUNUS EMRE KIRAL	-10000.00	7	t	2026-02-11 09:48:30.17	2026-02-11 09:52:45.689	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
a1a13a62-36b2-4955-be0d-1aca0934af13	C00004	clxyedekparca00001	DİNAMİK OTOMOTİV GIDA TEKSTİL İHRACAT SANAYİ VE TİCARET LİMİTED ŞİRKETİ	TEDARIKCI	KURUMSAL	2970124900	ALİFUATCEBESOY	\N	\N			Türkiye	\N	\N	Seyhan, Adana, FEVZİPAŞA MAHALLESİ TURHAN CEMAL BERİKER BUL. NO:254-A SEYHAN	DOĞUKAN KİRİK	-74505.81	\N	t	2025-12-23 11:00:21.417	2026-02-20 12:24:39.517	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
3ffb469e-821b-46ee-a8fd-69a0c681e031	C00022	clxyedekparca00001	AUTO ER SONER EMLİK	MUSTERI	KURUMSAL	\N	\N	19372117506	SONER EMLİK	05423651313	outour.service@outlook.com	Türkiye	\N	\N	Bodrum, Muğla, Konacık Mh. Bilge Sanayi Sitesi Kanberler Cad. No: 4/19	SONER EMLİK	0.00	7	t	2026-02-02 13:29:44.506	2026-02-02 13:30:11.959	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
ced4897c-3c0f-403f-9f49-fbf7fed1717c	C00026	clxyedekparca00001	ÖZEL FİAT HASTANESİ	MUSTERI	KURUMSAL	\N	\N	13273318222	HARUN ŞAHİN	05323421374	ozelfiathastanesi@gmail.com	Türkiye	\N	\N	Seyhan, Adana, İstiklal Mah. Turhan Cemal Beriker Blv. No:115/A	HARUN ŞAHİN	0.00	7	t	2026-02-02 13:33:58.086	2026-02-02 13:33:58.086	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
652e3ef3-a73f-4d63-878b-3980cc94c35d	C00001	clxyedekparca00001	MRK OTOMOTİV SANAYİ VE TİCARET LİMİTED ŞİRKETİ	TEDARIKCI	KURUMSAL	6231176306	BEŞOCAK	\N	\N	05077219750	info@mrkotomotiv.com	Türkiye	\N	\N	Seyhan, Adana, Sarıhamzalı mah. 47019 sokak 74/C	MERT ŞEN	0.00	\N	t	2025-12-18 19:30:08.815	2026-02-06 08:22:20.825	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
43f345ed-f4a2-4239-8f86-dd659da66446	C00036	clxyedekparca00001	Test Carisi	HER_IKISI	KURUMSAL			\N	\N			Türkiye	\N	\N	Kadıköy, İstanbul		0.00	\N	t	2026-02-21 06:44:19.226	2026-02-21 06:44:19.226	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
073863fe-4194-4895-99c4-a9eade2aaa69	C00010	clxyedekparca00001	GÖKMEN MAYDA OTOMOTİV SAN. TİC. LTD. ŞTİ.	HER_IKISI	KURUMSAL	4040487458	SEYHAN	\N	\N	03224216500	aracbakimi01@gmail.com	Türkiye	\N	\N	Seyhan, Adana, FEVZİPAŞA MH. TURHAN CEMAL BERİKER BLV. NO:354/A	GÖRKEM MAYDA	-309401.27	15	t	2026-01-21 11:36:47.736	2026-02-20 12:39:29.916	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
9d9060ca-9249-40d5-b6aa-3d81f870cecf	C00007	clxyedekparca00001	ÖZÇETE OTOMOTİV TAŞ. İNŞ.SAN. VE TİC. A.Ş.	TEDARIKCI	KURUMSAL	6740061430	SEYHAN	\N	\N	03224284719		Türkiye	\N	\N	Seyhan, Adana, TURHAN CEMAL BERİKER BULVARI FEVZİPAŞA MAHALLESİ NO:456 SEYHAN ADANA	EMRE YILDIRIM	-48868.81	\N	t	2025-12-23 11:03:16.81	2026-02-17 11:18:03.761	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
770162db-e7ae-47bc-bebf-267607e8c24a	C00028	clxyedekparca00001	CAN KARDEŞLER OTO RADYATÖR	TEDARIKCI	KURUMSAL	1980430011	YÜREĞİR	\N	\N	03223216347	cankardeslerradyator@hotmail.com	Türkiye	\N	\N	Yüreğir, Adana	HARUN CAN	-3100.00	7	t	2026-02-05 09:57:38.226	2026-02-26 17:51:45.127	\N	\N	NORMAL	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: cek_senet_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cek_senet_logs (id, "cekSenetId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: cek_senetler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cek_senetler (id, "tenantId", tip, "portfoyTip", "cariId", tutar, "kalanTutar", vade, banka, sube, "hesapNo", "cekNo", "seriNo", durum, "tahsilTarihi", "tahsilKasaId", "ciroEdildi", "ciroTarihi", "ciroEdilen", aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "sonBordroId") FROM stdin;
\.


--
-- Data for Name: code_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.code_templates (id, "tenantId", module, name, prefix, "digitCount", "currentValue", "includeYear", "isActive", "createdAt", "updatedAt") FROM stdin;
fb57d37b-e3ed-43c4-a572-4960de03c766	clxyedekparca00001	DELIVERY_NOTE_SALES	Satış İrsaliyesi No	Sİ	5	1	f	t	2026-02-26 17:51:33.168	2026-02-26 17:51:33.173
cd01cf89-0f59-4a86-9e90-ad5f5eb4c627	clxyedekparca00001	INVOICE_SALES	Satış Faturası No	SF	5	2	f	t	2026-02-26 17:51:25.015	2026-02-26 18:04:51.134
\.


--
-- Data for Name: company_vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_vehicles (id, "tenantId", plaka, marka, model, yil, saseno, "motorNo", "tescilTarihi", "aracTipi", "yakitTipi", durum, "zimmetliPersonelId", "ruhsatGorselUrl", notlar, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: customer_vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_vehicles (id, "tenantId", "cariId", plaka, saseno, yil, km, "aracMarka", "aracModel", "aracMotorHacmi", "aracYakitTipi", "ruhsatNo", "tescilTarihi", "ruhsatSahibi", "motorGucu", sanziman, renk, aciklama, "ruhsatPhotoUrl", "servisDurum", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deleted_banka_havaleler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deleted_banka_havaleler (id, "originalId", "hareketTipi", "bankaHesabiId", "bankaHesabiAdi", "cariId", "cariUnvan", tutar, tarih, aciklama, "referansNo", gonderen, alici, "originalCreatedBy", "originalUpdatedBy", "originalCreatedAt", "originalUpdatedAt", "deletedBy", "deletedAt", "deleteReason") FROM stdin;
\.


--
-- Data for Name: deleted_cek_senetler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deleted_cek_senetler (id, "originalId", tip, "portfoyTip", "cariId", "cariUnvan", tutar, vade, banka, sube, "hesapNo", "cekNo", "seriNo", durum, "tahsilTarihi", "tahsilKasaId", "ciroEdildi", "ciroTarihi", "ciroEdilen", aciklama, "originalCreatedBy", "originalUpdatedBy", "originalCreatedAt", "originalUpdatedAt", "deletedBy", "deletedAt", "deleteReason") FROM stdin;
\.


--
-- Data for Name: depolar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.depolar (id, "depoAdi", adres, yetkili, telefon, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: efatura_inbox; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.efatura_inbox (id, ettn, "senderVkn", "senderTitle", "invoiceNo", "invoiceDate", "rawXml", "createdAt") FROM stdin;
\.


--
-- Data for Name: efatura_xml; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.efatura_xml (id, "faturaId", "xmlData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: esdeger_gruplar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.esdeger_gruplar (id, "grupAdi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: fatura_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fatura_kalemleri (id, "faturaId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "iskontoOrani", "iskontoTutari", raf, "purchaseOrderItemId", "createdAt") FROM stdin;
dfaf66c3-4df6-4ab7-a26a-ed80f0d19e2a	9ffaf809-528b-4b41-80fa-a5f3b51332a2	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	40	433.00	20	3464.00	17320.00	0.00	0.00	\N	\N	2026-02-06 08:21:54.629
743c072c-5aa4-4935-8518-f6487436fd12	9ffaf809-528b-4b41-80fa-a5f3b51332a2	b9ef0cdc-0b7d-4913-98c3-f08cb973b391	2	2941.40	20	1176.56	5882.80	0.00	0.00	\N	\N	2026-02-06 08:21:54.629
3e10cbec-ef0f-4fa5-8fa7-bd32cefa47e0	c8255fc3-725d-4e9b-a408-ec2c39315eab	5109cd23-2697-4d26-a5c0-5a275de3b5b5	1	1908.68	20	381.74	1908.68	0.00	0.00	\N	\N	2026-02-20 07:33:09.634
c5537033-ad09-4053-9080-3f5081b46fef	16b0978f-312e-4655-90ea-9430bc2dd832	72be9051-6b71-4c1f-a4ab-e98c697a8e88	72	96.00	20	1382.40	6912.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
5c0170c0-f9d9-4cdc-9a9c-516559af2598	16b0978f-312e-4655-90ea-9430bc2dd832	a8c2e870-8f92-4461-967d-24f56be2c0aa	24	96.00	20	460.80	2304.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
ff3e14b7-0aa9-4f7b-b471-e3a9d5613e76	16b0978f-312e-4655-90ea-9430bc2dd832	fcbb1661-949f-4493-b50f-15bc992b7224	12	163.00	20	391.20	1956.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
ba6bf6b7-5d98-45c0-a4b0-70be05da579f	16b0978f-312e-4655-90ea-9430bc2dd832	728892ca-627d-419e-bc88-a8bb8d9cdee3	24	163.00	20	782.40	3912.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
aaad7243-5c7c-4d85-a232-88bc0d7e453b	16b0978f-312e-4655-90ea-9430bc2dd832	eeaef272-ecf6-4bab-8169-22b624cc581c	24	138.00	20	662.40	3312.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
c3e95d5a-d88b-44c2-be69-a19b062e5940	16b0978f-312e-4655-90ea-9430bc2dd832	71f9be3f-fc04-4512-8613-59f4e89b7f13	12	125.00	20	300.00	1500.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
5288667f-8d0d-4cb5-9a78-ae8e9a8f6c40	16b0978f-312e-4655-90ea-9430bc2dd832	84940dc0-70a2-4067-9639-eab609728fdb	12	117.00	20	280.80	1404.00	0.00	0.00	\N	\N	2026-02-07 08:54:34.292
17305322-8908-4456-8297-795843ce4d70	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	bec4b643-730e-4c3c-94f8-4f1e099b110e	2	268.75	0	0.00	537.50	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
c7ded41e-9c99-4614-b2f4-e57a049d17d6	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	7f7af4c6-1bf5-4030-960b-3c4a7b88b5ca	2	205.67	0	0.00	411.34	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
bef63212-3c4a-471e-9dcc-176e2f32dfff	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	de33590b-e026-4207-ab4d-79f304927680	1	1719.68	0	0.00	1719.68	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
27b44af2-b73b-447a-b13a-a0fc24489585	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	fbcb824f-ec91-42de-9a26-05143159b41f	2	272.54	0	0.00	545.09	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
f7fd3246-1d43-4b27-936e-92b7043ceaf0	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	28474efe-4089-49a8-8ba7-99aef6864cdd	2	302.81	0	0.00	605.62	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
41428f8f-dd81-4917-a7b1-17a59b1d4173	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	dfc96592-f0c6-453a-a0d1-227eed8a1d57	2	191.60	0	0.00	383.21	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
3a3fb26b-ca53-445f-804a-0faf96110716	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	6dd2b8ec-3a93-4432-a5a2-228721fd1827	19	142.15	0	0.00	2700.89	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
bb0d9518-7b1a-42c8-9c05-61932e17ecac	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	4d3ff301-3464-4475-b2a0-62afe3d29089	1	156.61	0	0.00	156.61	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
17c850fe-403f-4f6d-a5d2-89ad635ad055	380e9882-8c75-4790-9ef2-44a2df4bf4be	07aee89d-3011-49bd-a74d-cac77904e10a	2	246.32	0	0.00	492.64	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
674e4901-fb82-4850-bdd0-005e84241096	380e9882-8c75-4790-9ef2-44a2df4bf4be	dc3b0380-8e3b-42e7-9631-96dae1d9ec73	1	326.21	0	0.00	326.21	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
aa9c2b8d-1fce-4369-b7a6-b517196d2482	380e9882-8c75-4790-9ef2-44a2df4bf4be	424cb934-1770-4424-adc2-71a912601fd1	7	315.08	0	0.00	2205.56	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
303a977a-8dca-402a-b8ad-6b597722a51f	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	452f5e7d-989a-48ea-b6fe-25e56a7848c3	2	718.84	0	0.00	1437.68	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
317e10e1-393d-49a2-b6e0-7eb799621c13	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	531a1c64-7f68-4770-a9e9-5bfc2c09131c	5	886.15	0	0.00	4430.75	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
e681ed74-59bb-422d-8ad0-e697585a2cdc	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	aa1595c8-d171-4c47-9610-4cefc722fa00	1	499.46	0	0.00	499.46	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
6189228f-667a-42f7-b1d0-3a2d784a085b	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	7eebd33f-9097-40ef-85ed-254911e75454	2	515.94	0	0.00	1031.88	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
1488b8b3-a881-4c38-9d41-fac718c04511	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	1a12448f-e380-45a7-bf26-f631a88d7316	5	615.95	0	0.00	3079.75	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
131ce645-a26e-4d12-bbf4-a8f1d712f654	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	14fc0179-09a4-4084-8a36-7b9bd2f86d6e	5	687.66	0	0.00	3438.30	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
8c27a9ee-b264-418e-af4f-07b2b1761d89	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	6a1cd5fa-636c-4038-bb2b-66562d867d21	5	281.66	0	0.00	1408.30	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
00675f71-909d-4398-afcf-33372b110bdc	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	15e2cb0e-b08a-47e2-aa7b-c895fc6cf5f5	2	654.97	0	0.00	1309.94	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
45230e4f-9cb2-408d-9d0a-ec0da28d159b	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	9d587026-1594-42d7-b2fb-0de51f8e8ad5	5	941.87	0	0.00	4709.35	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
0b57ea03-25ab-4c70-abc4-e82a1a61c14e	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	16b83505-3727-4df2-b3e5-24bde3b75f84	1	609.32	0	0.00	609.32	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
d864f610-333b-4a37-a032-8fd24a163600	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	7f5e65a6-5de9-4494-a7c0-4db1ea213903	1	419.26	0	0.00	419.26	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
c44f7a18-592c-4900-a152-96b1e9f779e6	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	ec17e46d-eac7-4d1f-971d-e4335c9652c2	2	436.03	0	0.00	872.06	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
5a8e7a97-641b-446a-93f1-2846b734a555	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	ba27677c-9ee3-44b5-9e1f-1fcea222f762	3	609.32	0	0.00	1827.96	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
e4decf37-7ae4-48cc-a731-4bdc4720eb57	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	83a815af-9bf4-4dbe-9ea7-600a3d1cb429	2	391.29	0	0.00	782.58	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
b99ef2b5-714d-4ae8-8367-5eaa0a769973	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	b75c0db3-0450-4179-a347-25723adb9c62	5	404.17	0	0.00	2020.85	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
2199e256-0e84-4c7a-ad9a-e9852bf6cbe1	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	a08944ca-da97-485c-b58a-9cac72245e46	2	847.71	0	0.00	1695.42	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
04631ac9-2d02-457f-8a49-0fef3b89a1e8	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	09f175a8-dfd5-45a9-88c6-77d3f670632d	2	1089.85	0	0.00	2179.70	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
733110b3-2ae4-4d09-9704-eba39bedab61	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	cd43ac8e-797c-41c8-a3eb-542a8bce02a8	6	810.28	0	0.00	4861.68	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
95ceee62-62e4-4519-8fae-2332fff519f3	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	d2521ac2-74fd-45ad-a923-faa3593ac757	2	1071.48	0	0.00	2142.96	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
af8f30c6-509b-4b6e-b1b3-4deabb96e438	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	9eed4328-9f98-4675-94fd-f6b9cf9be05f	2	1395.12	0	0.00	2790.24	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
0a161681-abb4-4d9c-ae10-d9b5c4101053	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	faca0f14-ee2f-477c-b076-2858c8f1a9e5	2	815.27	0	0.00	1630.54	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
d270de19-79a4-4d46-8850-7443309d4957	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	9084c176-a2c8-409a-84a5-eb82e224cbce	1	750.34	0	0.00	750.34	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
47591b83-9c2a-4a27-9295-e54bc73250bf	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	2ca07a16-f6f6-4747-89cb-e96c863c0519	2	373.92	0	0.00	747.84	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
944c546f-f184-48c6-aba8-f0878677d31e	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	1e1055cb-e494-4124-b9a2-eb7f5815402e	5	739.52	0	0.00	3697.60	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
739ec82d-d2ee-4ee0-beec-4f91587773a7	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	7241eb2f-9533-4078-a02f-2befd28c800d	5	533.66	0	0.00	2668.30	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
13987708-983f-4c2c-86ba-8166b6a304f8	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	ad0f7ed1-2a42-4d66-a37d-22034f4967d6	2	1113.60	0	0.00	2227.20	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
3b7521fa-1482-4605-8413-41af26ec268b	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	4359422b-40b2-44fd-bbaa-e2ecf6343220	2	1021.53	0	0.00	2043.06	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
5551e95c-fe5f-4bac-ad59-810553819237	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	40778f8c-4eef-4880-a814-935535536bc1	2	1553.65	0	0.00	3107.30	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
9d08943a-9e89-405c-be82-44438e2dfc87	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	370263a1-8551-4433-a22c-74c7fafc7888	24	75.00	0	0.00	1800.00	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
afb80559-63ab-42f5-b596-e71bb2a835ff	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	026634cf-ec05-4429-9a9e-2fe2dc6afc51	3	436.03	0	0.00	1308.09	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
4a6c2b1d-3881-4531-b04f-0b4786a83e88	efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	d8288fc9-9d1f-4a02-a8aa-0fcb4bfd5459	1	605.78	0	0.00	605.78	0.00	0.00	\N	\N	2026-02-06 08:22:20.883
e0d22fe3-0841-48c9-a60d-ed138d7cbbea	89d7bcc1-4398-4ce2-8ace-72d63eb26c30	9257524e-3e32-4c79-95dd-2dfc453de011	1	419.62	20	83.92	419.62	0.00	0.00	\N	\N	2026-02-06 10:11:40.795
3b8dcc62-f2ee-47b1-bdf8-e81211de6db9	2bdb1750-1f17-4167-8008-6cd015c67753	59b6d6ab-68ef-4226-8da6-435f543e9726	2	720.49	20	288.20	1440.98	0.00	0.00	\N	\N	2026-02-06 10:12:02.164
609d1f91-6d7c-47c5-a2f3-ce632187e984	2bdb1750-1f17-4167-8008-6cd015c67753	8ed2ff0b-0d40-41f5-b2d5-349de4a0e4a8	4	2442.65	20	1954.12	9770.60	0.00	0.00	\N	\N	2026-02-06 10:12:02.164
570552b4-d573-4e78-bbb6-e7f6b84220e3	619a484d-e247-43ea-9fde-6f49b7b329ba	961143b7-aa7e-4c6e-9639-bfc8c8d2967e	1	268.37	20	53.67	268.37	0.00	0.00	\N	\N	2026-02-06 10:12:08.669
6a76dbdb-f9db-4e98-9b09-e25967f03b98	619a484d-e247-43ea-9fde-6f49b7b329ba	ae25e511-13d9-4deb-9931-15140a6ba40d	2	143.77	20	57.51	287.54	0.00	0.00	\N	\N	2026-02-06 10:12:08.669
d21214b8-f501-45ee-b8c9-6a3cdb191307	5bf3353e-83c9-479d-af7a-7749b35fa78c	6f7f1f05-69db-4232-80b1-f568737c5902	3	255.63	20	153.38	766.89	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
7022538a-3172-42ef-ab94-14849503b5d2	5bf3353e-83c9-479d-af7a-7749b35fa78c	663b7861-631a-41e0-9ebe-4eacf8d90b72	3	368.09	20	220.85	1104.27	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
8376ea54-2b60-4546-9a40-451dfe62a1c7	5bf3353e-83c9-479d-af7a-7749b35fa78c	a906d7e8-a7f3-469d-bd72-49ff8ef6eba5	3	503.11	20	301.87	1509.33	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
e5232358-ea39-4a0d-a0b1-994b5e31b04e	5bf3353e-83c9-479d-af7a-7749b35fa78c	21c65809-7399-4669-aa7d-fa0ceb60ac32	3	235.95	20	141.57	707.85	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
af941541-a78c-43d1-ae0d-a7096cfb45e5	5bf3353e-83c9-479d-af7a-7749b35fa78c	0ef6e144-4187-4a6b-a62d-b95a400e6c2b	3	167.68	20	100.61	503.04	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
335420b2-2727-49dd-84fc-b34ca1284419	5bf3353e-83c9-479d-af7a-7749b35fa78c	94f56110-d856-4777-aae6-5af0285ab173	2	1414.24	20	565.70	2828.48	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
44f70708-d8ec-46d1-b090-69562fb9b2b3	5bf3353e-83c9-479d-af7a-7749b35fa78c	c3586788-8f31-4c9f-ac4c-85739d466ac4	2	1284.76	20	513.90	2569.52	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
bf0a8505-fff2-4d07-8985-8a8fb27d2df8	5bf3353e-83c9-479d-af7a-7749b35fa78c	8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	1	2356.66	20	471.33	2356.66	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
f5c14afe-8f8f-49c6-827f-b7cae9109b86	5bf3353e-83c9-479d-af7a-7749b35fa78c	043fd312-038f-4392-9fa8-c083c49483ac	1	1142.52	20	228.50	1142.52	0.00	0.00	\N	\N	2026-02-09 19:47:09.115
7d1942e6-d027-4279-8f3c-94828d53ad9c	22679734-95f9-4d3a-94a5-7b9cc1e605a5	759f05c7-eb2d-434d-8bbb-f194dde1c79f	1	57.39	20	11.48	57.39	0.00	0.00	\N	\N	2026-02-06 10:11:56.017
0b35110c-085d-4b1c-a37e-90ace5ecf31e	22679734-95f9-4d3a-94a5-7b9cc1e605a5	b22dc4d6-4a5e-4995-ad48-958935147ef9	1	295.90	20	59.18	295.90	0.00	0.00	\N	\N	2026-02-06 10:11:56.017
e5cce591-319c-4b37-8959-f5d521c46657	45cd8e54-fd47-4626-9da9-dd40d776889e	0491bc33-f40e-4ee4-ab5b-8944a5506721	4	565.42	20	452.34	2261.68	0.00	0.00	\N	\N	2026-02-06 10:12:15.477
8844b403-0c87-4cdf-93d5-0f76dd8d4b69	0d6cc39c-80da-49a4-9be5-1d9dc8b90aae	35b5de9f-b9d7-4211-885e-712efa2e4b8a	1	3230.98	20	646.20	3230.98	0.00	0.00	\N	\N	2026-02-06 10:12:21.28
f484651f-074d-4734-9259-f05afcec1d9a	0d6cc39c-80da-49a4-9be5-1d9dc8b90aae	a1a2a2ae-1141-468c-bc6d-edb60da5c581	1	3158.16	20	631.63	3158.16	0.00	0.00	\N	\N	2026-02-06 10:12:21.28
ae5b778d-c215-49f3-8522-4d710ef2192f	11b64864-8581-4fcc-9c99-f823acf82786	fc9df4d8-bc49-4336-9a96-ff109337eab2	1	789.11	20	157.82	789.11	0.00	0.00	\N	\N	2026-02-06 10:12:31.142
c6661e08-c0d3-409b-88ed-585c7adb506c	eaf200e2-41f6-43b1-a309-48457cf894aa	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	1	339.03	20	67.81	339.03	0.00	0.00	\N	\N	2026-02-06 10:07:58.01
06ba86ef-d244-405c-9657-6351f98dbbc8	eaf200e2-41f6-43b1-a309-48457cf894aa	e8564a36-6b84-4a98-93c8-e78ba2d096bd	1	835.14	20	167.03	835.14	0.00	0.00	\N	\N	2026-02-06 10:07:58.01
a2e157e0-2a33-4c4f-8f1a-89eabce1e30a	6d13a5e3-e41b-4a7b-ba58-50dbc969c279	c190aad6-0676-492d-934a-28d3ff6e2bd2	1	12217.45	20	2443.49	12217.45	0.00	0.00	\N	\N	2026-02-04 10:57:38.756
2680a2a8-982c-4a02-81b5-05046e620880	eabf2c9c-77e8-4398-8262-777d75beabe9	b0f25455-7deb-4e68-b004-8b54b7fdd2d0	1	98.46	20	19.69	98.46	0.00	0.00	\N	\N	2026-02-04 14:14:03.187
f4938f71-6714-4386-b9d0-cae83ed275a9	eabf2c9c-77e8-4398-8262-777d75beabe9	1569bfc9-fc44-40c4-8f38-99ebe9434284	1	61.66	20	12.33	61.66	0.00	0.00	\N	\N	2026-02-04 14:14:03.187
f6a2821d-2717-4e50-a132-c737747a3fcd	eabf2c9c-77e8-4398-8262-777d75beabe9	82954b03-1b54-4287-9f86-3ac85168279b	1	86.02	20	17.20	86.02	0.00	0.00	\N	\N	2026-02-04 14:14:03.187
e3d4a390-75d1-4ff5-a99b-80038f6d80a9	e9cda23d-6fc1-41bf-920f-27af25091651	5f0b3771-26f2-4905-bae6-85d77b9a5ec6	25	20.10	20	100.49	502.45	0.00	0.00	\N	\N	2026-02-05 05:54:01.158
c3e9f09a-5173-4435-b9f5-b1c2cd7d0424	2f097f1f-8935-42be-8eac-42a53637b491	1610b0fb-c0fe-420d-b8cb-ea32a03c80f0	2	58.16	20	23.26	116.32	0.00	0.00	\N	\N	2026-02-05 07:42:00.696
ac360192-239e-4dfc-a57c-81a3a4ac0d6a	2f097f1f-8935-42be-8eac-42a53637b491	667aab2b-caa4-4826-b3e8-533ace431f90	1	58.16	20	11.63	58.16	0.00	0.00	\N	\N	2026-02-05 07:42:00.696
cc032aff-cd51-4fd7-ad84-457477adf641	2f097f1f-8935-42be-8eac-42a53637b491	d494e5ec-be68-409d-a50d-227e1d0df98d	24	83.18	20	399.27	1996.33	0.00	0.00	\N	\N	2026-02-05 07:42:00.696
7d97dc68-ab7c-4195-b437-ae08a59f2072	4b395fbc-ae8a-4635-a830-736d38301a58	c7158d69-5a0b-4a02-a011-ae9eb32e9559	20	229.00	20	916.00	4580.00	0.00	0.00	\N	\N	2026-02-05 10:59:27.968
0254c361-95eb-4b5d-945c-f987cf26f67a	4b395fbc-ae8a-4635-a830-736d38301a58	4050e934-95b0-4db4-8958-3b2781c9843b	1	129.90	20	25.98	129.90	0.00	0.00	\N	\N	2026-02-05 10:59:27.968
186b4321-b67d-4144-b8d0-99f5ebfc5da9	81ffa19e-38e0-40f9-a4c0-e5bfb3e806bf	1d5dd49b-eb8e-4278-b301-16241931bd9f	3	133.53	20	80.12	400.59	0.00	0.00	\N	\N	2026-02-06 08:07:23.97
5e58eb15-1e86-4a69-83b0-fb7491ef9c42	81ffa19e-38e0-40f9-a4c0-e5bfb3e806bf	3a5d3c9f-ac75-401b-afdd-2348e7072ba5	1	452.63	20	90.53	452.63	0.00	0.00	\N	\N	2026-02-06 08:07:23.97
ebcc7ccc-3a45-4879-9bd7-1da0b276746f	81ffa19e-38e0-40f9-a4c0-e5bfb3e806bf	10dab7a8-1a95-40bd-b523-136380a462d5	3	389.02	20	233.41	1167.06	0.00	0.00	\N	\N	2026-02-06 08:07:23.97
97b7d781-44b5-40e9-a02b-58f86dae68e4	45b17698-5d83-4482-9e9a-f6a5419bc881	ebf7c40e-665d-4d4d-9801-1d42f8ae71cc	20	6.55	20	26.20	131.00	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
9ec1f1e2-1bdb-4e4b-994e-7bc4511bcb85	45b17698-5d83-4482-9e9a-f6a5419bc881	3513b793-6497-4dc4-b5b5-316f328b7367	20	3.18	20	12.72	63.60	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
b56d6411-a184-4fdd-a2db-65a1d857d6c0	45b17698-5d83-4482-9e9a-f6a5419bc881	1c789117-0345-4549-9116-17bcbd3e4855	20	3.91	20	15.64	78.20	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
d5616522-36c4-4336-9c68-d81e0e211a64	45b17698-5d83-4482-9e9a-f6a5419bc881	683f3239-3561-4d3a-92f4-71d51047fde4	10	7.21	20	14.42	72.10	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
bbff74c5-3d4e-4a9f-977b-ba5d8aae0650	45b17698-5d83-4482-9e9a-f6a5419bc881	afa614c1-ea7f-43d6-8f51-8e7cfe170420	20	6.97	20	27.88	139.40	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
4e6fe81a-a7f9-480f-860a-88e022c3c4d1	45b17698-5d83-4482-9e9a-f6a5419bc881	db50b129-6d23-481d-9dfb-e303b2290366	10	8.42	20	16.84	84.20	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
38dba6a6-4e89-449c-adfe-c1b0bf02a2aa	45b17698-5d83-4482-9e9a-f6a5419bc881	df8c5a21-ac8b-4fed-9c54-f91e7e4db791	10	6.22	20	12.44	62.20	0.00	0.00	\N	\N	2026-02-06 08:07:46.669
b15701b4-86ab-4890-9540-1ea7c5ae2ce1	1a9fc05c-7d97-469b-b87c-aa127e8c31e8	32232a4f-7861-457d-b28b-a8de0a0cc3da	10	61.66	20	123.32	616.60	0.00	0.00	\N	\N	2026-02-06 08:08:03.386
c7e84916-ae5c-4961-95fa-1020b1e1d783	21d8524a-4108-44d1-9a0e-7f9511118324	37eda8e1-da09-4f95-ba44-b2a97684eab4	1	50.79	20	10.16	50.79	0.00	0.00	\N	\N	2026-02-06 08:08:34.187
847f28ed-8843-4b8f-a705-b61b1832bbac	22e720c0-9936-4aa5-b7b1-b27600fadcf6	f48ff1eb-e85d-4cb5-b628-73a89dccdd7a	4	1220.81	20	976.65	4883.24	0.00	0.00	\N	\N	2026-02-06 08:10:15.753
07767232-06ec-446c-b38c-24405c5cdbaf	a460b393-2242-474c-8f15-482780dcc0bd	a7afc855-d4aa-456a-811e-a162f685e1b1	1	148.19	20	29.64	148.19	0.00	0.00	\N	\N	2026-02-04 11:01:37.1
70ab202f-fd1e-44d7-b577-91c107f65ad9	a460b393-2242-474c-8f15-482780dcc0bd	d55c6017-a666-4c0f-91c5-05801d2bd8be	1	420.52	20	84.10	420.52	0.00	0.00	\N	\N	2026-02-04 11:01:37.1
c94af01d-1dd3-4d69-9122-4156049e2591	a460b393-2242-474c-8f15-482780dcc0bd	a9a3989f-edcf-493a-88e0-4250d87bb6ba	1	138.87	20	27.77	138.87	0.00	0.00	\N	\N	2026-02-04 11:01:37.1
6e3e0d07-40a7-49ce-8c13-cd23c5063322	2a5d6c44-b75d-4f23-aa15-55d6727fbd89	4c1f9e58-ae36-4450-812e-39de8a07c684	1	1140.26	20	228.05	1140.26	0.00	0.00	\N	\N	2026-02-04 14:35:51.255
4b4764e6-6ddc-457e-8a62-138b5629c4fb	2a5d6c44-b75d-4f23-aa15-55d6727fbd89	f4462d6b-9686-447c-9310-9c9012b3d20d	1	1140.26	20	228.05	1140.26	0.00	0.00	\N	\N	2026-02-04 14:35:51.255
dc457258-f51f-4252-8a6a-4c06285ddc09	c9b8caf5-9079-49e8-9892-ccad8786df64	d7887add-f677-414d-97b4-f90faa29e648	1	597.05	20	119.41	597.05	0.00	0.00	\N	\N	2026-02-04 14:39:16.275
44186d7e-cb21-4225-b1eb-94c335136539	ef2346bf-a2c5-4df2-a856-4ce0ade012af	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	5	418.61	20	418.61	2093.05	0.00	0.00	\N	\N	2026-02-05 06:50:29.407
294be12c-6eb3-4fbd-afee-19a0f7e52311	fc9877c0-6957-42b4-bb39-260b8791ed61	46aba001-3916-4498-872b-d43e43d587b9	1	378.33	20	75.67	378.33	0.00	0.00	\N	\N	2026-02-05 07:48:14.149
b688c31a-5130-4f1e-915f-f4f2c9fb1430	fc9877c0-6957-42b4-bb39-260b8791ed61	5f0e462b-b67d-48be-b9ee-9a1bc9543482	1	99.15	20	19.83	99.15	0.00	0.00	\N	\N	2026-02-05 07:48:14.149
8f077ec5-4a86-4040-9951-a4f993269378	ce905093-f9ce-43c2-82ec-84ad6c2436ee	6f5c1edf-9168-4d3e-aa37-0910c2602c32	2	674.42	20	269.77	1348.84	0.00	0.00	\N	\N	2026-02-05 07:51:24.235
edd82e2e-2061-416f-b82f-82449f656118	6b262abc-774e-43e6-b53e-a9f9a496f087	7f69153f-992a-49d4-ba61-8c64f69f0b70	1	1729.81	20	345.96	1729.81	0.00	0.00	\N	\N	2026-02-06 05:40:38.356
60c13978-b56c-416c-9472-9bc24b991bcf	4f0dfe2f-f013-4146-9d52-f5ddfa4dd36c	befa4db7-76e1-4e25-b775-e5134a7aaad0	1	233.86	20	46.77	233.86	0.00	0.00	\N	\N	2026-02-06 05:41:20.562
206a2a5c-9f94-4f91-9b7e-e6d7dc621993	d95504cb-6345-4eef-b204-56846ca6c78f	97440ecf-a58a-4bbd-8517-95a11e62b523	20	65.00	20	260.00	1300.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
55de4dba-f678-4f3e-9bf7-1e1b17df3fbf	d95504cb-6345-4eef-b204-56846ca6c78f	87596d5a-39e5-4793-b6dd-5d7c0e98f5db	20	65.00	20	260.00	1300.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
ae3e3572-5eab-4a2d-a5f5-b3240be87352	d95504cb-6345-4eef-b204-56846ca6c78f	14c41ebb-3536-4832-bf5e-1ab8ce133dc2	20	72.45	20	289.80	1449.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
60889f63-be4d-4591-85d6-bc62c5fec1e0	d95504cb-6345-4eef-b204-56846ca6c78f	d9c8a08a-adfc-475c-b6dc-17ae1da5603e	20	66.66	20	266.64	1333.20	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
d136c446-90ce-466d-bba0-3b72e759c5c7	d95504cb-6345-4eef-b204-56846ca6c78f	7185d30e-1c11-47bc-998c-40c53c2f2e7d	20	66.66	20	266.64	1333.20	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
327e4af2-6c09-45c6-a45d-a589f5d9d438	d95504cb-6345-4eef-b204-56846ca6c78f	3b7f878f-6183-4beb-a3fc-09da7e672bc7	20	65.00	20	260.00	1300.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
04bc3dd6-516b-4099-9b18-c360a941500c	d95504cb-6345-4eef-b204-56846ca6c78f	a2fa4e5c-1d90-46ad-a154-82131f803f04	20	65.00	20	260.00	1300.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
3953a69b-5141-4c50-9a4d-fdda842e97bc	d95504cb-6345-4eef-b204-56846ca6c78f	9c2be3d1-032e-467e-9891-570608092d01	20	65.00	20	260.00	1300.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
57fcddac-c559-4607-a873-27a0ae9a3f5a	d95504cb-6345-4eef-b204-56846ca6c78f	351a0fdc-7dc0-4825-8806-c199915b09b3	20	66.66	20	266.64	1333.20	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
33bc5cd1-efd6-465f-9723-df9152265e11	d95504cb-6345-4eef-b204-56846ca6c78f	8ca367cf-098c-4aee-9070-6dbf05a3f120	50	60.46	20	604.60	3023.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
03b742df-523e-4433-b2bc-8927f46f3ab2	d95504cb-6345-4eef-b204-56846ca6c78f	ebd53187-7551-4768-b016-7ab00badd88c	50	60.46	20	604.60	3023.00	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
42f98a4d-fa30-48d6-8a8a-3611b7b58bea	d95504cb-6345-4eef-b204-56846ca6c78f	c1f1d767-fab5-4b3f-843b-3ed487eb8f95	20	107.68	20	430.72	2153.60	0.00	0.00	\N	\N	2026-02-06 08:08:18.898
6df0ba88-dd54-43fc-8374-94be6cbed8e0	da0aa815-b036-442e-8372-38a578166804	482d5349-2e54-439b-86a0-f4ad24c88db8	20	306.08	20	1224.32	6121.60	0.00	0.00	\N	\N	2026-02-06 08:11:43.11
f2e68064-0919-4349-ba57-737c3d6d48fb	da0aa815-b036-442e-8372-38a578166804	3abbdee2-7c23-4477-a9eb-6911ee062fb1	12	87.75	20	210.60	1053.00	0.00	0.00	\N	\N	2026-02-06 08:11:43.11
91b6be06-640d-4e63-9f7d-07caf8f439af	da0aa815-b036-442e-8372-38a578166804	a5f503bc-beec-469e-9869-8753c2964f2e	10	398.14	20	796.28	3981.40	0.00	0.00	\N	\N	2026-02-06 08:11:43.11
6a48f5e1-8aac-417e-8fcb-cb005406eba8	da0aa815-b036-442e-8372-38a578166804	a8f3ecfc-948a-4a20-b10e-e63d8f7bf2c5	1	3101.04	20	620.21	3101.04	0.00	0.00	\N	\N	2026-02-06 08:11:43.11
0b3739cc-dadb-494e-a3bd-76daea5001d7	da0aa815-b036-442e-8372-38a578166804	f7e8a953-3506-4d09-8b98-e70e33bc427b	1	2808.05	20	561.61	2808.05	0.00	0.00	\N	\N	2026-02-06 08:11:43.11
58118b69-0ea8-4a9d-8603-38bd8c519040	bfb6e656-eec4-4226-a59f-dcfcdb5378b5	c1601d10-deb6-49c6-a001-0a70ba4da456	1	2431.16	20	486.23	2431.16	0.00	0.00	\N	\N	2026-02-06 08:12:22.493
98c1638b-c9a5-4d37-ada1-a2bcf8cd1f96	af5a2713-c17e-447f-acc5-654ef6bb93ab	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	30	403.71	20	2422.26	12111.30	0.00	0.00	\N	\N	2026-02-06 08:13:02.389
0bf9fa5b-557d-4a72-a5aa-2af5e99f3c19	b9ef9f5a-7123-4e88-813f-d519a76ba326	73af4c35-2c21-42eb-960d-49a5ad416e4d	11	319.91	20	703.80	3519.01	0.00	0.00	\N	\N	2026-02-06 08:13:50.641
4a56899a-6b8b-4527-a8de-42dd0c7baea8	27c3b872-5701-4ee5-b358-11ae9dcbc55b	60fe51dd-3077-43b3-b46a-50dad2fe164d	1	649.70	0	0.00	649.70	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
ba932b61-42f4-4c24-8b3d-0da9b9aa47e0	ac41e6e5-ef25-49f5-80ac-0086451b9cbb	ce172f29-bc42-472b-bde6-2ce7be654416	1	622.65	20	124.53	622.65	0.00	0.00	\N	\N	2026-02-04 11:03:06.882
b844d606-2916-4c86-a560-5eff42995124	27185454-2b8f-4d7b-8df5-4aec466a46fa	de03694c-358c-4793-bac2-b876476ea2d0	5	143.53	20	143.53	717.66	0.00	0.00	\N	\N	2026-02-04 14:59:31.791
98068177-da2c-466b-a98e-69002eff1176	63e2a4ba-be8b-4002-ba0c-2c6cb6f0ee9f	fd0e24dc-66c8-45ad-933b-6a5e81fa0647	2	5004.70	20	2001.88	10009.40	0.00	0.00	\N	\N	2026-02-05 07:34:41.727
2b592fd2-f62c-4a73-8b19-2a24424e44df	b1e0a297-f604-4a60-a43b-639745db7654	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	3	737.79	20	442.68	2213.38	0.00	0.00	\N	\N	2026-02-05 07:54:43.747
e72da49e-5622-4759-b446-2e191f285063	016cbcdd-debe-418c-808a-0e0f7ec2218a	fac371ee-4670-4c55-a6af-1995c5297bab	1	330.53	20	66.11	330.53	0.00	0.00	\N	\N	2026-02-06 07:59:44.167
c754aa13-7fec-48dd-8633-fff054769930	016cbcdd-debe-418c-808a-0e0f7ec2218a	7f69153f-992a-49d4-ba61-8c64f69f0b70	1	1729.81	20	345.96	1729.81	0.00	0.00	\N	\N	2026-02-06 07:59:44.167
82eba669-c5e0-4385-b7e2-ef7f67ea3c47	f359d287-b571-4266-a6e5-bf2df8c8616e	310c997a-8da9-4668-bbc1-541d494ce14a	1	309.95	20	61.99	309.95	0.00	0.00	\N	\N	2026-02-06 08:08:50.943
5749bac7-c737-4dd6-b7d8-0e46ad3a3c51	36cf52c7-0d12-49ef-bb93-e10fa856669c	d85e30e7-0ceb-4555-a2b2-51fe3a8ea5b8	1	87.86	20	17.57	87.86	0.00	0.00	\N	\N	2026-02-06 08:14:48.459
3d498cb6-6174-41ee-9564-7ebb655ee823	36cf52c7-0d12-49ef-bb93-e10fa856669c	48ca0edf-32c8-45a1-b60a-2959c06e3dc8	1	1278.52	20	255.70	1278.52	0.00	0.00	\N	\N	2026-02-06 08:14:48.459
b03bede1-73c1-4246-b9e5-bd4af62b8547	fa3a784b-a248-4175-9110-51b0d2ac220d	588353b5-ad93-4633-a58a-4a4b8d4037d1	1	5732.44	20	1146.49	5732.44	0.00	0.00	\N	\N	2026-02-06 08:15:02.529
3902f7e4-1218-42e7-9424-30ca131ba9f6	fa3a784b-a248-4175-9110-51b0d2ac220d	cfc20890-efbf-4f9e-ac2d-fbad4c6a1e9c	1	3004.45	20	600.89	3004.45	0.00	0.00	\N	\N	2026-02-06 08:15:02.529
285d78f8-b4c5-48cb-80b6-64db4ebfb10d	fa3a784b-a248-4175-9110-51b0d2ac220d	86f45835-4387-438e-9a62-7f15a593783a	1	157.07	20	31.41	157.07	0.00	0.00	\N	\N	2026-02-06 08:15:02.529
be7b575b-09e7-4a1e-9a26-bf5c1a74c4bb	27c3b872-5701-4ee5-b358-11ae9dcbc55b	99748460-340b-44e6-9582-4cfefa7c62e5	1	516.16	0	0.00	516.16	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
c27d4cc7-54b6-4a5d-9779-05f616f99cd7	27c3b872-5701-4ee5-b358-11ae9dcbc55b	452f5e7d-989a-48ea-b6fe-25e56a7848c3	1	586.36	0	0.00	586.36	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
6ff0316a-bc52-4bbd-8438-1f33ce13e4ac	27c3b872-5701-4ee5-b358-11ae9dcbc55b	c2b759c8-dde9-4f81-bb30-5fe9ba67226f	2	504.46	0	0.00	1008.92	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
08570a7b-e274-4ffc-a0a0-e3e7cfd6708d	27c3b872-5701-4ee5-b358-11ae9dcbc55b	9d63b6f4-eaac-4d19-8d3b-4e6fbd31d3ea	2	657.33	0	0.00	1314.66	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
18020aad-ef3a-41ed-bf4c-882c88dac86e	27c3b872-5701-4ee5-b358-11ae9dcbc55b	02f5bdcb-854e-4beb-88c1-d4efd7113e95	1	445.50	0	0.00	445.50	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
6fa1eb22-eac5-43ff-8d8c-8e65761772d0	27c3b872-5701-4ee5-b358-11ae9dcbc55b	8704d476-047b-4ee4-9a54-3b94e52815a4	2	742.50	0	0.00	1485.00	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
07ab6232-7d6d-4eec-b4a6-34d20cd88dca	27c3b872-5701-4ee5-b358-11ae9dcbc55b	4c19a5a3-f64f-4d7b-b088-48a251614b45	1	660.60	0	0.00	660.60	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
b97445b0-96a4-4026-910b-83bb52031398	27c3b872-5701-4ee5-b358-11ae9dcbc55b	20433ae7-7b97-41c7-9781-62883b5f69ea	1	717.38	0	0.00	717.38	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
cb68553e-5c25-49af-ad95-51774ed8dcf3	27c3b872-5701-4ee5-b358-11ae9dcbc55b	e0b7804a-fa35-468c-be47-d8f75f71a50a	1	901.91	0	0.00	901.91	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
ca2e99c1-3557-4f4c-b996-2d9029286f5d	27c3b872-5701-4ee5-b358-11ae9dcbc55b	565de0ff-f725-44e2-96d2-81dc4c8a38b3	1	695.54	0	0.00	695.54	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
b8c5e10b-8f2d-407b-a864-f1d4ed152888	27c3b872-5701-4ee5-b358-11ae9dcbc55b	463c647a-28c0-48ec-a028-54b2d9878342	1	572.16	0	0.00	572.16	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
d04fba62-7d1f-4a5f-ae73-28b5c9cf1902	27c3b872-5701-4ee5-b358-11ae9dcbc55b	7eebd33f-9097-40ef-85ed-254911e75454	1	515.94	0	0.00	515.94	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
49130f5a-2bdc-49d6-b295-5ca79fb8864d	27c3b872-5701-4ee5-b358-11ae9dcbc55b	f0897d6b-ca66-4221-859e-d8985dcc6977	2	549.33	0	0.00	1098.66	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
e452c36d-2f5e-471f-b81c-abaafac2b9f3	27c3b872-5701-4ee5-b358-11ae9dcbc55b	ec17e46d-eac7-4d1f-971d-e4335c9652c2	1	436.03	0	0.00	436.03	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
000ea93e-e187-49ca-aab6-e29a15e98779	27c3b872-5701-4ee5-b358-11ae9dcbc55b	a4497d35-e1df-4a0d-bcf1-b9f3e2ff650b	1	457.54	0	0.00	457.54	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
671265b9-44aa-4ac6-aec2-ce1d63763476	27c3b872-5701-4ee5-b358-11ae9dcbc55b	e90df772-6e73-4b36-ba1e-2d342ea050b0	1	713.66	0	0.00	713.66	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
2afd8098-35ea-4f63-a1a7-d8ba2a7244c9	27c3b872-5701-4ee5-b358-11ae9dcbc55b	2ca07a16-f6f6-4747-89cb-e96c863c0519	3	373.92	0	0.00	1121.76	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
dc5fcff0-a7c3-4e85-9e1e-6b57c2eabc9e	27c3b872-5701-4ee5-b358-11ae9dcbc55b	374ea922-d3b1-4948-86f0-8e2579fefd45	2	712.68	0	0.00	1425.36	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
5a69267e-2774-44d0-bfce-6adc237f4a47	27c3b872-5701-4ee5-b358-11ae9dcbc55b	0b616e46-3aaf-4944-830d-4524dfe95f22	1	530.48	0	0.00	530.48	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
1d21a4c4-a8b6-4247-8cb0-47d540f41436	27c3b872-5701-4ee5-b358-11ae9dcbc55b	bcd2fb1e-6a83-4554-b0d3-9f38aad02f31	3	688.94	0	0.00	2066.82	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
014cfff0-7823-4f2e-9d7a-38a03da58030	27c3b872-5701-4ee5-b358-11ae9dcbc55b	43551ddc-ffde-4e26-bf56-bc6cc73638fc	1	784.43	0	0.00	784.43	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
fefe70de-ca38-4523-8ed8-8ee9db9ec8bb	27c3b872-5701-4ee5-b358-11ae9dcbc55b	a6ade259-1ba5-47ab-aa5e-1b8ac3dfd5d5	2	479.23	0	0.00	958.46	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
6fd45faf-dbbc-4ab4-9eb2-70d8ed97ce30	27c3b872-5701-4ee5-b358-11ae9dcbc55b	b5199231-96bc-4b1d-9b16-b55d7ecaca0e	3	517.63	0	0.00	1552.89	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
eeaa6e1a-0f27-4c5d-b40a-65b3429635c4	27c3b872-5701-4ee5-b358-11ae9dcbc55b	6d46e1b1-7905-4622-9972-5e71985d4dc4	2	357.43	0	0.00	714.86	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
15cc4a9d-980c-492c-9938-d8350a4c24f6	27c3b872-5701-4ee5-b358-11ae9dcbc55b	5c2b7fd6-c67b-4b32-a049-28be610ac80a	2	460.33	0	0.00	920.66	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
dc130536-07dc-4b0b-94be-96361b9b9511	27c3b872-5701-4ee5-b358-11ae9dcbc55b	d312299b-2d60-4c56-b2c4-77dbdd87da45	4	539.41	0	0.00	2157.64	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
6e4d3af0-e741-491c-9401-079866d5667f	27c3b872-5701-4ee5-b358-11ae9dcbc55b	70028631-1147-42b7-9cfe-3dac0bad6647	2	540.24	0	0.00	1080.48	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
4f3322f5-781f-4a37-a76f-63967f33fcc1	27c3b872-5701-4ee5-b358-11ae9dcbc55b	9befe9e4-ea7d-4ceb-8068-83bf008bd21c	2	484.14	0	0.00	968.28	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
1d6a7819-e7ed-4f85-abe2-b197a09c5761	915edccb-0e01-4434-95b3-ff9d05c8ad25	5c9e8f37-7d07-416a-88ca-ad6b25d12b7d	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
cb19845c-48a5-44b1-99a1-df0b89b18a5c	915edccb-0e01-4434-95b3-ff9d05c8ad25	6d5a4e0a-1147-4576-a28a-d1c377e34dc7	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
e411c934-618f-4c6f-a17c-341d10efa20d	915edccb-0e01-4434-95b3-ff9d05c8ad25	4659612c-11ac-452d-9d85-32bbb1b985b7	5	100.00	0	0.00	500.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
5d7679ed-8b07-4fbb-aaff-f3379b8d08e9	915edccb-0e01-4434-95b3-ff9d05c8ad25	1ea6e7c2-2ca4-41b5-a996-77ba342a6d6a	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
c29d65c3-b5b8-42bf-9c35-6ab7e6046876	915edccb-0e01-4434-95b3-ff9d05c8ad25	164aa5d6-bf71-4049-9fd9-ab832bd0facf	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
e355f48f-ccd7-4dd8-ac9c-df2bd40b551a	915edccb-0e01-4434-95b3-ff9d05c8ad25	5ae6c502-9925-47e1-95eb-be56c45a8f19	5	100.00	0	0.00	500.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
d7864072-6ccc-4f47-acaf-9c973a6ce914	915edccb-0e01-4434-95b3-ff9d05c8ad25	976f6ba3-fe0f-4ebe-bcf8-b0705c8c1590	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
495d21d2-0445-4ca1-bade-9fa8eb55757b	915edccb-0e01-4434-95b3-ff9d05c8ad25	bed8dfa8-b580-4a6a-b990-1c6c2c3a9a0e	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
a755f35c-ab08-4aea-a9e7-ade646c275a0	915edccb-0e01-4434-95b3-ff9d05c8ad25	43f0b337-b1b7-43cc-81b7-db6d18a47ff3	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
5d2441b1-b18e-4d20-b785-bad32b1f96fb	915edccb-0e01-4434-95b3-ff9d05c8ad25	7e4c1c3b-7e0f-4fb1-870c-220c05877d12	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
cbfb444c-5338-4f2d-ba29-38839d5cfc30	915edccb-0e01-4434-95b3-ff9d05c8ad25	206ea6f5-2d0d-4642-9fd9-95fa289c2b25	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
5d80a005-7ad7-4669-9c0e-4ec5cb97ffca	915edccb-0e01-4434-95b3-ff9d05c8ad25	e91ba21b-224c-47d7-a08c-75b82e9cbb45	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
06c7e5fb-be42-4c3d-98d3-1c3eeb1936d2	915edccb-0e01-4434-95b3-ff9d05c8ad25	a2c7c3ea-6d8d-466d-93cf-96916f3c5560	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
755fa48a-2fb5-4381-a98d-fed8cc0fd7c8	915edccb-0e01-4434-95b3-ff9d05c8ad25	1f881e42-9654-4e09-bc6e-bf53b7c64763	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
5ab6fb56-3074-469d-a150-3b16bd81a98f	915edccb-0e01-4434-95b3-ff9d05c8ad25	0a68e318-b77b-40e5-9d5c-4f4ac4626590	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
67994f04-430d-432d-b37c-9ec078b31415	915edccb-0e01-4434-95b3-ff9d05c8ad25	6d84094c-7ac8-4765-8110-f5b87516c4ef	5	100.00	0	0.00	500.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
d8ee253c-d667-4326-ac09-b1ff24417bcb	915edccb-0e01-4434-95b3-ff9d05c8ad25	a393ba47-ed47-4035-b941-2fefd3113dfb	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-03 14:56:19.556
0a10530b-7fd9-4c95-aa4f-c001fdc6f14b	d8fc7034-4f20-4215-a08c-4737aeac0a06	b99484b6-f666-4608-be1d-1548b70409df	5	91.00	0	0.00	455.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
67ebb838-87c6-4bc8-9419-f6628adf28a6	d8fc7034-4f20-4215-a08c-4737aeac0a06	66caa2bc-06c3-4272-b583-a997744878c6	5	97.00	0	0.00	485.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
2fac9803-5969-44e7-ad70-63f26a156338	d8fc7034-4f20-4215-a08c-4737aeac0a06	ad829ec6-1456-4485-b15e-ed14059c3ac6	5	125.00	0	0.00	625.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
0f99d17a-4291-44be-be5f-2f7bee931a4a	d8fc7034-4f20-4215-a08c-4737aeac0a06	541b0362-177a-4f13-a285-4b2d8a868f37	2	107.00	0	0.00	214.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
b193e753-2bf0-4dd3-b99b-6bcbe027c38a	d8fc7034-4f20-4215-a08c-4737aeac0a06	6aeedc81-47ba-43b3-90e2-a2eebac6f493	4	117.00	0	0.00	468.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
9047b830-23db-4f2d-9e13-3dd19c95c57e	d8fc7034-4f20-4215-a08c-4737aeac0a06	8096058b-0009-456c-afa4-f9f062027edd	2	88.00	0	0.00	176.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
e0815b4b-4828-495d-96df-2ce017cdca9e	d8fc7034-4f20-4215-a08c-4737aeac0a06	1cf92eb3-1fb9-4a59-8dfd-c68a6b0d94a5	2	113.00	0	0.00	226.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
40cdd539-2ef1-4dd3-ac3a-24d61465c178	d8fc7034-4f20-4215-a08c-4737aeac0a06	bbb14892-390c-4ac3-b359-5e10239d6b9c	2	94.00	0	0.00	188.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
8c103383-8013-4fb0-9bfe-69677d830590	d8fc7034-4f20-4215-a08c-4737aeac0a06	ad8ec09f-c49f-42d3-8af3-a9f13bdb51eb	2	107.00	0	0.00	214.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
2f9bcafb-1e9f-4419-b2d5-ae102628db85	d8fc7034-4f20-4215-a08c-4737aeac0a06	2d649c35-50a7-4f73-ac12-fadb9a6b3dd8	2	82.00	0	0.00	164.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
2de65cc4-bf87-4488-8596-7550eb8bd255	d8fc7034-4f20-4215-a08c-4737aeac0a06	23e0248b-953b-4c01-8e40-6916a9a894da	2	115.00	0	0.00	230.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
eaae7e3e-4a9b-4cc2-b822-ab72b8f640b1	d8fc7034-4f20-4215-a08c-4737aeac0a06	cc7b1ab2-3e0f-44bb-8ee5-3e80f1084847	2	103.00	0	0.00	206.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
4bf6f792-fcf0-489a-b8e3-11325281e256	d8fc7034-4f20-4215-a08c-4737aeac0a06	8ab95815-118c-4012-894b-2d4644987a0f	2	113.00	0	0.00	226.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
608ee512-b235-43a6-b0eb-b6574511fecb	d8fc7034-4f20-4215-a08c-4737aeac0a06	9b4e655d-f48c-43c8-b80a-142a0c7d8514	2	127.00	0	0.00	254.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
9d872123-bec0-4940-97ad-306ca8f7d75d	d8fc7034-4f20-4215-a08c-4737aeac0a06	0dd5cb06-0a57-44c6-86d7-8dee0371a7bb	2	97.00	0	0.00	194.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
ac13f9dd-4325-4420-bc26-a1f4f8706a78	d8fc7034-4f20-4215-a08c-4737aeac0a06	0085ac4e-751f-48ee-ae81-9cf436879483	2	112.00	0	0.00	224.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
38d8cb6e-7148-4d50-aea0-f1497594431b	d8fc7034-4f20-4215-a08c-4737aeac0a06	e582d74f-3178-4d9d-ace3-01b321afae0f	2	120.00	0	0.00	240.00	0.00	0.00	\N	\N	2026-02-04 08:00:28.747
756b0b5c-291f-44ae-9932-4f0a316e16b7	b2a3e36c-cdb9-4728-a88b-482201c1760d	a8d0e61c-87cb-4f60-9158-c3bca5cf2292	2	73.08	20	29.23	146.15	0.00	0.00	\N	\N	2026-02-04 09:10:34.26
1fcb96ee-1cd9-4ab9-ad69-7ad737e521d0	b2a3e36c-cdb9-4728-a88b-482201c1760d	d18a2a2c-afed-4073-9e04-eec16a993af0	1	90.98	20	18.20	90.98	0.00	0.00	\N	\N	2026-02-04 09:10:34.26
b73e1c08-68d2-4171-8744-7fabda6724eb	b2a3e36c-cdb9-4728-a88b-482201c1760d	af1dce21-eb06-4482-9e08-3d3b131f72f4	1	637.36	20	127.47	637.36	0.00	0.00	\N	\N	2026-02-04 09:10:34.26
a357a299-2618-4d53-bd05-aa24a30846bb	0b290904-3713-42f4-a2a9-435d4fa9536d	8a3c1cf2-36e4-48c2-8cab-0a9d7daddb12	1	129.75	20	25.95	129.75	0.00	0.00	\N	\N	2026-02-04 11:09:10.538
4bc92b4a-288b-422b-8b19-9a96166e099f	0b290904-3713-42f4-a2a9-435d4fa9536d	f2466b52-e1e7-4307-b0e6-ff537b7864c6	1	102.69	20	20.54	102.69	0.00	0.00	\N	\N	2026-02-04 11:09:10.538
cb27df79-df2d-4254-bdea-d8a9d11e98e6	27d423c2-4263-4f33-83b5-7965051d5105	46fe045a-a704-4ba8-8659-c1f1891712f9	1	202.98	20	40.60	202.98	0.00	0.00	\N	\N	2026-02-04 09:16:52.129
86e1c380-429d-427f-98d2-cf8178279cf1	62f01321-b1f1-47c8-8936-1dac055cfb71	9313625f-754f-4bab-8e48-68dac414e3bc	1	4199.42	20	839.88	4199.42	0.00	0.00	\N	\N	2026-02-04 09:49:37.832
6921fb94-d97c-46b9-9976-533a57ac6cf9	0b290904-3713-42f4-a2a9-435d4fa9536d	a0a99d75-4606-47b2-b661-9d3032cfcc4d	1	797.74	20	159.55	797.74	0.00	0.00	\N	\N	2026-02-04 11:09:10.538
a0a64d50-0655-4847-872e-a6d64be51a22	0b290904-3713-42f4-a2a9-435d4fa9536d	1c789117-0345-4549-9116-17bcbd3e4855	10	3.93	20	7.86	39.30	0.00	0.00	\N	\N	2026-02-04 11:09:10.538
5a4e0e8c-87ef-4510-86f6-3ee6fd7fb3f9	0b290904-3713-42f4-a2a9-435d4fa9536d	683f3239-3561-4d3a-92f4-71d51047fde4	10	7.25	20	14.50	72.50	0.00	0.00	\N	\N	2026-02-04 11:09:10.538
169edd0d-bd29-47a2-9faa-de1295875500	097669f6-da76-42c3-acb1-f29452d7d1ff	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	1	542.23	20	108.45	542.23	0.00	0.00	\N	\N	2026-02-04 15:06:07.076
3cfd49a9-99ed-4f85-9894-4a9318bead8d	097669f6-da76-42c3-acb1-f29452d7d1ff	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	1	2153.32	20	430.66	2153.32	0.00	0.00	\N	\N	2026-02-04 15:06:07.076
ddab4845-c24e-4381-bb4e-388523e67694	33c43352-1d68-44c9-8e7d-fcba73371a35	7587710e-9c19-4911-bf83-def195b942d9	1	211.89	20	42.38	211.89	0.00	0.00	\N	\N	2026-02-04 15:10:07.953
274ee1ec-bbac-4187-95dc-5bd07bbe8635	a0fcf5ce-e0d4-4ffc-925a-3b5599b726a1	46fe045a-a704-4ba8-8659-c1f1891712f9	1	202.98	20	40.60	202.98	0.00	0.00	\N	\N	2026-02-04 10:16:18.011
454ccc0c-8a22-47cd-96a3-5063597159c0	380e9882-8c75-4790-9ef2-44a2df4bf4be	ad6ab7a2-3909-433d-a3cb-a33710109c27	3	171.71	0	0.00	515.13	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
8e7f01c4-4b75-4dba-a7a0-5fd694cbb955	380e9882-8c75-4790-9ef2-44a2df4bf4be	745ed12f-fbbf-434e-bd92-d316b1fe242d	1	203.71	0	0.00	203.71	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
79a00355-aaca-4eed-886d-ba9a1b4e1a29	380e9882-8c75-4790-9ef2-44a2df4bf4be	2babf0cb-5485-4f83-8cff-dcd15e19dded	1	267.97	0	0.00	267.97	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
f1528d32-af83-4636-86b0-0c47e85294ed	380e9882-8c75-4790-9ef2-44a2df4bf4be	1806b674-af7b-497c-9be9-91349c3b7f55	2	197.17	0	0.00	394.34	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
f3bcc070-a625-41c1-8f69-11b78be05d2b	380e9882-8c75-4790-9ef2-44a2df4bf4be	5998e619-c3ab-4de4-87e1-0b88a26346f4	2	176.06	0	0.00	352.12	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
4b44a2ec-e19a-452b-8020-36fe9a79684b	380e9882-8c75-4790-9ef2-44a2df4bf4be	95e8bffc-b09d-4552-a8cc-c4a850b169c6	2	265.42	0	0.00	530.84	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
270101a9-6dcd-4298-b974-9833fb8c72fc	380e9882-8c75-4790-9ef2-44a2df4bf4be	b610e787-1343-4fd6-a1e9-926b4662ed1a	2	133.48	0	0.00	266.96	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
0fb57b7f-343b-4df3-a657-4724108e81c3	380e9882-8c75-4790-9ef2-44a2df4bf4be	f73b74cd-61ec-479f-8ae5-83decbf8bba8	2	234.52	0	0.00	469.04	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
bf9ce4bc-ec8b-4203-a2fa-c9fd79bd41d4	380e9882-8c75-4790-9ef2-44a2df4bf4be	4ab8ae6f-2bbf-46af-869d-dbf368246980	1	352.67	0	0.00	352.67	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
2a2de843-10dd-4372-963f-987c934b6e02	380e9882-8c75-4790-9ef2-44a2df4bf4be	6bf01664-6e5d-4e17-b264-b272781f71f1	1	288.92	0	0.00	288.92	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
1a1c0025-d837-4646-afaf-fc174fb66bce	380e9882-8c75-4790-9ef2-44a2df4bf4be	445854a0-457b-4a0f-953e-afb7b572f2f1	2	246.32	0	0.00	492.64	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
bdff9711-5be6-41bf-8943-2303ed5185a3	380e9882-8c75-4790-9ef2-44a2df4bf4be	496f6df8-7c4b-4c09-8d50-b679a34eb2ef	2	210.74	0	0.00	421.48	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
55b20fa1-a37d-4f58-a61d-23be78048a37	380e9882-8c75-4790-9ef2-44a2df4bf4be	396aecf8-022a-42e1-b84e-302aa6326b93	1	205.16	0	0.00	205.16	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
266a50b3-2252-41c3-b305-09f6b7dcc7e2	380e9882-8c75-4790-9ef2-44a2df4bf4be	22d1fc31-6a76-496a-bf01-974a785a17b2	1	326.21	0	0.00	326.21	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
96e7e1c3-d769-4bc7-98da-d67ec29a39aa	380e9882-8c75-4790-9ef2-44a2df4bf4be	10ed4136-c1e9-4597-9eb6-b25533abcc34	2	147.65	0	0.00	295.30	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
8800719a-8e2e-4166-b557-8e4a759df1c9	380e9882-8c75-4790-9ef2-44a2df4bf4be	32efc5ee-b96c-46d8-90fa-769a13500fa5	2	210.43	0	0.00	420.86	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
56c80700-9a2f-497a-a2cb-e8ee795f5687	380e9882-8c75-4790-9ef2-44a2df4bf4be	c8b6ae08-e332-4bec-90d8-a77397dbd07a	11	179.29	0	0.00	1972.19	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
41be9144-a953-4d56-aeb0-ffa170dcc00a	380e9882-8c75-4790-9ef2-44a2df4bf4be	1cb7560f-7df1-423c-80c1-dff1ce1f9e39	2	241.93	0	0.00	483.86	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
6de14847-a03f-4240-842c-5ae064bd6eaf	380e9882-8c75-4790-9ef2-44a2df4bf4be	5e34221b-333e-4b71-9ddd-a3204f5a635d	1	274.36	0	0.00	274.36	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
521083dd-2fea-43c1-b661-27772852ddc0	380e9882-8c75-4790-9ef2-44a2df4bf4be	e1b62b71-c295-4bf1-acb2-1f927dc626c3	7	265.55	0	0.00	1858.85	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
513356c1-2140-4901-b050-20eee9a828ad	380e9882-8c75-4790-9ef2-44a2df4bf4be	88403982-0e34-4bac-87b6-0142cfc0352a	1	265.15	0	0.00	265.15	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
20863e51-ceff-4a40-aaab-7e6a777c0f92	380e9882-8c75-4790-9ef2-44a2df4bf4be	1eab4997-9d0f-4d8d-b374-55fc1799700d	2	247.99	0	0.00	495.98	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
a947fa1e-1cf4-4b3e-82bb-1f2b93ff6205	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	b9b03747-7395-4d01-bde2-d1cd3f317433	10	184.61	0	0.00	1846.08	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
2a8badab-af3a-49fc-bb3b-fcac8d504b08	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	e586c5e1-309f-4ffd-b8d8-c1ae79c14f44	2	184.07	0	0.00	368.14	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
2c4fee4c-ef96-41ef-955f-e57c1bd2fe70	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	b018ee41-7b4d-4f74-a04a-02ae291c9e9f	1	252.29	0	0.00	252.29	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
c08faceb-f078-4608-81c6-c49a78c7cd21	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	a3e3cd4e-2bdd-4cef-bdcd-5c9c8addecaf	1	181.60	0	0.00	181.60	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
7eac7e65-73be-4387-8a90-92377bdbe143	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	277aff93-eb25-406b-9844-3da213e2a754	1	166.52	0	0.00	166.52	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
6b89372d-91b1-4f7d-9edf-2fd1dea0a54f	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	5bd04c4c-ecd5-4173-880f-0a085f5af79b	2	179.23	0	0.00	358.46	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
9ab6cbb3-434d-44f7-b82b-da682f0dc0be	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	2fa8e81b-f7dd-41e6-9aa1-6685e8ae6528	1	225.54	0	0.00	225.54	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
49606b2e-811a-447c-aaff-4f5d76bddcaa	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	9ce88d50-7dcf-46b2-adc4-2491bb399ac7	1	236.52	0	0.00	236.52	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
26fb8138-a94d-4090-8ac5-0df3a735cd95	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	43d1828c-9724-4bff-97ad-9e6e392e7a36	3	906.65	0	0.00	2719.94	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
a12b6974-1856-4912-9edb-cb574b334c4c	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	4059133c-7f54-4ed2-8687-bec64b211e2d	2	1719.68	0	0.00	3439.37	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
48bde053-2247-44c4-ab3f-2b343f38d9a0	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	accfe98c-346c-4900-8d9a-cf567da6c324	1	210.65	0	0.00	210.65	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
7a88afe4-8998-4ca4-9800-3f32c2dc243a	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	ada96211-ff8d-431d-b264-ce87827e2ecc	1	183.65	0	0.00	183.65	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
c0b51a69-c037-4e6e-8202-be6fb593e31e	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	fdffbeeb-e382-4569-8224-41512fb4ce71	1	205.16	0	0.00	205.16	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
850fcca6-f9fb-4ded-84ee-f2dbbab26a90	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	a5ca11e0-73b9-4650-8a39-1ef8b3a75365	9	196.90	0	0.00	1772.06	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
f12453fc-0031-47c3-b505-22ee58115c87	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	90d77bf3-2ff7-4e74-8844-f0da9f873c5a	5	627.74	0	0.00	3138.72	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
5952c819-cebc-4a0a-9835-bde595d2322d	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	c6a243ee-bc35-4d9b-a138-392678a6d2cf	4	229.32	0	0.00	917.28	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
fd202408-822e-4119-b847-5ce931f7833d	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	2b1a35b7-aac7-494c-b5a5-9bf869622673	4	1008.51	0	0.00	4034.02	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
975e990b-002a-44c5-af8b-da4f6aad3cd4	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	070e5e54-43e2-4de3-b75a-250cc4d4d45e	1	196.90	0	0.00	196.90	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
bd77b1d3-a010-4f84-a266-a0cf82d964d1	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	f601c5a7-7c41-4475-9ab6-c1d5c8743d34	2	241.93	0	0.00	483.86	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
27cc1e71-f020-4957-a522-500deed2f74a	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	7d15f66c-6269-4203-b1f2-58cb67e4697a	2	286.24	0	0.00	572.47	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
28295d08-ae15-486d-b340-19f5baeceeea	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	b9b6bddb-1026-4e9d-a9ee-07cce8e4ea9f	1	322.84	0	0.00	322.84	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
a333ce32-1b9f-4751-99ca-d459ccc77a91	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	b982a42c-77ef-499d-b642-5fd12bdad920	1	1874.20	0	0.00	1874.20	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
3faca6fd-8292-4499-a738-ae3e06ced547	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	93c1a751-625a-4007-8669-abeaf07a7e7e	1	194.68	0	0.00	194.68	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
d98d7a69-223a-4318-8245-d1a7d4d791a0	6f4daa76-ac03-4a4e-bac9-8826870466e4	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	2	123.46	20	49.38	246.92	0.00	0.00	\N	\N	2026-02-04 11:11:19.407
74ba2b12-98ce-4334-9e9d-161231bc192a	33c43352-1d68-44c9-8e7d-fcba73371a35	1e356282-dd07-4f5a-879d-0f8568734952	1	154.77	20	30.95	154.77	0.00	0.00	\N	\N	2026-02-04 15:10:07.953
50b4dfe7-083c-413d-8ee3-0dcdf5a80dce	e9e8e245-3f73-43b9-ad79-819a72d483ce	b6f21c2b-6225-4ebc-8387-557f81d0b08b	1	442.79	20	88.56	442.79	0.00	0.00	\N	\N	2026-02-05 07:36:20.512
85c1e0d7-3797-44c8-bf57-79adb950f6a0	fbccca25-73b0-4a8d-8425-109e02c35e53	e86c9805-eeda-4ceb-85c1-3d574e3b74c5	1	2583.33	20	516.67	2583.33	0.00	0.00	\N	\N	2026-02-05 10:00:29.94
dec80a55-65dd-4418-9773-f087bbb01e70	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	d805c08e-d5a7-442a-a792-5a853fd1cbc2	1	288.92	0	0.00	288.92	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
6c763434-a3fd-41fb-9f00-0635e13206d7	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	7eff05bf-54d7-4299-b363-c7605575e95d	1	1009.15	0	0.00	1009.15	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
c35a7378-9521-41a9-b626-6dcdedb3b65d	9d83a36a-2e52-4066-96ed-8f44696a3cbd	663fe1ad-2962-4e86-9b23-2117ca85246d	1	47.85	20	9.57	47.85	0.00	0.00	\N	\N	2026-02-06 08:09:31.874
052b40c7-1db7-481e-b4ea-08903eb22bd5	3c4eff49-e72e-4471-b71f-f8fbb93355f2	1e0a1f66-8fb3-48eb-a57e-e117c4c2992b	1	124.55	20	24.91	124.55	0.00	0.00	\N	\N	2026-02-06 08:09:46.328
113d1606-9bc7-4282-bcb7-82ef76f90ec3	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	f10988ad-312d-4b3d-b24f-acc6f1ddba83	1	291.61	0	0.00	291.61	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
875cf473-d452-4596-ace4-e70e218e9dbb	08cfb568-ab9a-4988-b354-dc9c70e8a9fa	ba6bb89d-d9b8-4e0e-8ac6-8e01f8b41dda	2	216.91	0	0.00	433.82	0.00	0.00	\N	\N	2026-02-10 09:28:53.592
14f88a5c-3302-46dc-82d0-fa533941a167	bd21d5ec-36bc-47fd-9ad2-a46ea4bc19e2	0ef5b767-5218-48d5-abac-cca422782576	1	507.65	20	101.53	507.65	0.00	0.00	\N	\N	2026-02-06 08:12:46.318
859c1f7d-0f16-4125-bf94-c82da01bf34f	27c3b872-5701-4ee5-b358-11ae9dcbc55b	58d053b5-66f0-45d6-9139-c7732b65abd3	2	426.61	0	0.00	853.22	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
3fefe627-7348-4817-9705-8122c4cc5198	27c3b872-5701-4ee5-b358-11ae9dcbc55b	7b92be79-44d8-4026-a39e-aa1ebd2db91a	1	588.54	0	0.00	588.54	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
05fe18f1-295c-4180-84ea-a46436aa07b6	27c3b872-5701-4ee5-b358-11ae9dcbc55b	61572691-5eb2-4e06-8a38-76843eda2bf0	2	539.40	0	0.00	1078.80	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
f58f1764-88bf-41fc-adce-d36ec92db90d	27c3b872-5701-4ee5-b358-11ae9dcbc55b	cf50e54e-d269-4112-b687-61f2c9938d9c	1	591.82	0	0.00	591.82	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
37a7a01f-3e19-44c0-aa5a-b09795c5199f	27c3b872-5701-4ee5-b358-11ae9dcbc55b	664c7d7c-0fde-496c-aa4b-f888d652e4df	2	514.58	0	0.00	1029.16	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
885508f7-d23e-40e2-b4af-a65cafb9f3d6	27c3b872-5701-4ee5-b358-11ae9dcbc55b	66bc0e2e-b98f-4f34-9eb0-2320a4dfa2ba	2	749.05	0	0.00	1498.10	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
97c60fdf-efde-4479-a88a-d6b1e3636dfc	27c3b872-5701-4ee5-b358-11ae9dcbc55b	915be74a-9751-4fdd-87c6-c51871aab214	2	526.25	0	0.00	1052.50	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
7a34125a-275d-4a53-b37f-05c650853d95	27c3b872-5701-4ee5-b358-11ae9dcbc55b	e7ac691f-7590-4c01-8e1a-fcbe0694c1ef	2	631.03	0	0.00	1262.06	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
3a1aae3d-58b5-4493-a2bd-ece9eac91a4b	27c3b872-5701-4ee5-b358-11ae9dcbc55b	d8288fc9-9d1f-4a02-a8aa-0fcb4bfd5459	2	605.78	0	0.00	1211.56	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
8b40cd6c-0904-4bb8-b573-17d7b71e6881	27c3b872-5701-4ee5-b358-11ae9dcbc55b	fb671bd2-53d9-415a-94ec-32588ec76310	1	408.08	0	0.00	408.08	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
df96ae7c-ee78-4f47-a49f-ff3000267fa9	27c3b872-5701-4ee5-b358-11ae9dcbc55b	76386069-cbab-4e35-a886-3fea8aac5bcd	4	994.93	0	0.00	3979.72	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
a9ec944b-704f-4e6e-95ba-8f3c5880c204	27c3b872-5701-4ee5-b358-11ae9dcbc55b	9fb44523-855f-495f-9f1a-e4e1f92fe912	4	621.28	0	0.00	2485.12	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
f07aabe7-3982-4d2c-8ef2-5765ded43bf1	27c3b872-5701-4ee5-b358-11ae9dcbc55b	c3469619-68a0-4016-9a4f-f2a6fe99cf88	1	819.61	0	0.00	819.61	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
2e875e3b-4c74-48d5-bfd1-b5e40f0a6854	27c3b872-5701-4ee5-b358-11ae9dcbc55b	401b76a8-979d-4242-bac3-fe5360ce23a9	1	902.15	0	0.00	902.15	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
63d2dcba-71b7-4ea1-ace2-6ff4f27b6541	27c3b872-5701-4ee5-b358-11ae9dcbc55b	2d3e9b8f-c1d7-435a-8cf6-e57c53fe92dc	2	716.00	0	0.00	1432.00	0.00	0.00	\N	\N	2026-02-06 08:15:43.94
3b79fbb4-e934-4d46-a493-2cb0434f5571	65754286-1f74-4901-940a-0f92b6fd20ad	071f8259-a497-441c-9a32-9c48c9de4cdc	1	494.95	0	0.00	494.95	0.00	0.00	\N	\N	2026-02-06 08:16:58.755
d3cd12ce-8d33-4275-8859-6aa42c922392	65754286-1f74-4901-940a-0f92b6fd20ad	2f2a2e97-db2d-4477-9600-824f068819bb	4	346.78	0	0.00	1387.12	0.00	0.00	\N	\N	2026-02-06 08:16:58.755
10b258be-82b9-4b79-8cca-d5ebb993bb02	65754286-1f74-4901-940a-0f92b6fd20ad	6667c533-7051-45f1-8f21-0d822b15e977	2	494.58	0	0.00	989.16	0.00	0.00	\N	\N	2026-02-06 08:16:58.755
3bb11d93-426d-46a3-a2c7-c87a4366c537	b50db62e-21f3-480e-8104-f3f2b627282a	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	1	701.83	20	140.37	701.83	0.00	0.00	\N	\N	2026-02-20 12:24:39.503
118219be-fe90-4889-b5b7-34b01569a5aa	380e9882-8c75-4790-9ef2-44a2df4bf4be	aa1afe41-c9c0-4715-962e-f8b6974011ab	1	334.44	0	0.00	334.44	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
84b6603c-ba8e-44e4-bd5e-1de1fbd835e9	380e9882-8c75-4790-9ef2-44a2df4bf4be	8a6f19da-64cd-4931-8424-cc1823bb15eb	1	184.86	0	0.00	184.86	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
e1c5671c-a9bc-4d4c-b085-a0db25b8f00d	380e9882-8c75-4790-9ef2-44a2df4bf4be	f185ef3d-d631-450e-91c6-79c7d7c7eccf	2	196.90	0	0.00	393.80	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
bb1a2571-9bae-4d4f-8890-db17f8641347	380e9882-8c75-4790-9ef2-44a2df4bf4be	289c316a-bf53-49ce-82bb-a264ad37c106	1	303.90	0	0.00	303.90	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
d253861a-87a3-4c53-9ea5-30b2818ad9cc	380e9882-8c75-4790-9ef2-44a2df4bf4be	7eaed4c2-8965-4a0d-8d47-983e0592709e	1	184.86	0	0.00	184.86	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
c2e7e9f9-8347-4c7d-8b4e-55aa192cd411	380e9882-8c75-4790-9ef2-44a2df4bf4be	af122dfb-db80-4211-91c5-e41e9d5923b8	1	205.32	0	0.00	205.32	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
283442eb-0285-4f93-b4be-9620a149bd39	380e9882-8c75-4790-9ef2-44a2df4bf4be	637d24a6-311a-4520-966d-77a512877c74	1	1339.31	0	0.00	1339.31	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
18330f6f-6dab-4e92-a907-f6e733501b72	380e9882-8c75-4790-9ef2-44a2df4bf4be	3f9269ca-37d1-465e-aedf-642cf50c8d84	1	144.42	0	0.00	144.42	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
edc4fed3-b4cc-4c23-bdce-7416c4cde208	380e9882-8c75-4790-9ef2-44a2df4bf4be	b59aa2ce-7049-4e9e-b735-2a52c901c1a6	1	134.06	0	0.00	134.06	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
2dc5decf-dac5-40d0-86ab-bff56c593644	380e9882-8c75-4790-9ef2-44a2df4bf4be	61b32b7c-d3ae-426a-a8c6-78a7578f3e51	1	216.54	0	0.00	216.54	0.00	0.00	\N	\N	2026-02-10 10:27:17.578
2be1b150-8a4c-4f67-97ad-b5ed64787fbb	92304431-9901-48d8-a1d1-6f03b602ce87	71421321-d7cf-4b8a-b19c-50af5898a64e	1	1399.31	0	0.00	1399.31	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
82e19c0e-fc8f-483e-9aea-a6f110ca43b6	92304431-9901-48d8-a1d1-6f03b602ce87	d2f488da-7400-41ae-98e4-1a595388e858	2	334.44	0	0.00	668.88	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
13b844b1-754a-4b5e-a302-03360e14b03b	92304431-9901-48d8-a1d1-6f03b602ce87	548559e5-7b74-4fee-8ca7-a0e9b8aeac70	2	658.55	0	0.00	1317.10	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
1bded921-85b4-495c-829f-431715dbbfe3	92304431-9901-48d8-a1d1-6f03b602ce87	2561bd07-f29f-481c-ae36-20de2c879c00	1	805.81	0	0.00	805.81	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
36f15c3e-167f-462c-b1a1-7439f7b5a32f	92304431-9901-48d8-a1d1-6f03b602ce87	131c7e23-9a7d-43da-9427-045ed25f54b3	2	310.56	0	0.00	621.12	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
1827948b-2965-426a-85d9-7c2926efc5cd	92304431-9901-48d8-a1d1-6f03b602ce87	60033cc9-3e22-45e7-baf2-4d34e749d992	2	261.35	0	0.00	522.70	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
6b9e899f-3434-48f5-8733-48e5b481deba	92304431-9901-48d8-a1d1-6f03b602ce87	8763c316-02c8-4cfa-9ba1-1e6a8d2d33b9	11	152.50	0	0.00	1677.46	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
eadce928-a83c-4917-ba91-7c269fcd2423	92304431-9901-48d8-a1d1-6f03b602ce87	3d149e26-d8a8-46d5-a4cc-fd65a694a14c	2	658.55	0	0.00	1317.10	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
e7ab5c48-5be5-4ce7-a900-a7e51b2509db	92304431-9901-48d8-a1d1-6f03b602ce87	004edaac-e8e7-4beb-b83f-5fda41e2dc76	86	43.20	0	0.00	3715.20	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
c2d19a9d-ff8b-4173-9a33-cbb61b6238da	92304431-9901-48d8-a1d1-6f03b602ce87	671a59c3-7899-4183-882d-f6e8a7df749d	82	43.20	0	0.00	3542.40	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
a0f8f9d5-ebf5-49d6-8823-943babc20096	92304431-9901-48d8-a1d1-6f03b602ce87	6315e802-afa3-40a5-aec2-b01d41769e0c	97	43.20	0	0.00	4190.40	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
e83fd1bf-d207-4d2b-88ad-3c537821c4be	92304431-9901-48d8-a1d1-6f03b602ce87	ddc3276c-d7a6-4a50-ae29-400c45433944	91	64.80	0	0.00	5896.80	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
9da6e611-5267-4492-b651-b520db5c64ba	92304431-9901-48d8-a1d1-6f03b602ce87	2414eb7d-9910-4cd4-a366-274029e0dc35	89	64.80	0	0.00	5767.20	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
291b1ded-ecb1-44fd-b783-718620f67ba4	92304431-9901-48d8-a1d1-6f03b602ce87	7161764d-bc61-4550-b713-434552082435	99	64.80	0	0.00	6415.20	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
3b1a1775-b4c3-4ff4-bd69-5c35fdd2dfd0	92304431-9901-48d8-a1d1-6f03b602ce87	8d45b3b7-a66d-4ac4-861f-086d9fb93061	104	86.40	0	0.00	8985.60	0.00	0.00	\N	\N	2026-02-10 12:25:34.78
28433695-7710-4155-9a1a-d852d9df2aba	0b7dbf09-3f54-4eca-b810-c7b703ecf261	c441f074-9714-468e-93bf-3e653eff4524	5	109.06	20	109.06	545.28	0.00	0.00	\N	\N	2026-02-11 07:09:27.398
af27224a-efd3-49c2-b089-7f9070d7fe98	08aaf1d0-0a52-4dbc-8217-92344681fb12	3f15dfee-cfd3-4307-a1df-c9cc5beb40de	6	118.74	20	142.49	712.45	0.00	0.00	\N	\N	2026-02-11 07:50:04.527
17407a2f-7c14-49e8-aa45-494cf0b83ff7	08aaf1d0-0a52-4dbc-8217-92344681fb12	e9751b2a-071e-46ac-bc6f-6bcc5c2a6e29	6	70.06	20	84.07	420.36	0.00	0.00	\N	\N	2026-02-11 07:50:04.527
441f4b1c-ad40-4de1-9e88-0f990ecc8ecc	e69ffcda-c62f-4bd4-9db1-2e7d435ee264	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	1	1268.80	20	253.76	1268.80	0.00	0.00	\N	\N	2026-02-11 07:53:47.454
5eedcc36-b95f-471a-9da8-3a98ed477bc1	c8af63c6-3706-47d1-82d1-4a4ef6bcfc34	d390a057-d84b-4a11-9031-073e3de7955a	1	448.72	20	89.74	448.72	0.00	0.00	\N	\N	2026-02-11 07:56:11.878
c3bf5d97-1c03-4b62-9aeb-567688bfef4e	4d769bfd-4865-4979-8e18-75497a8ec2d5	500f0a32-83ff-470b-b0fb-44365269b5c8	1	86.70	20	17.34	86.70	0.00	0.00	\N	\N	2026-02-11 09:26:22.462
a3bd9320-4f31-44ac-8acf-2bb50b8b0ddd	4d769bfd-4865-4979-8e18-75497a8ec2d5	c69a6141-7839-4f8f-925e-51a1ff0c0c66	1	134.22	20	26.84	134.22	0.00	0.00	\N	\N	2026-02-11 09:26:22.462
8ddab597-899e-403f-88de-d68ede8e6918	4d769bfd-4865-4979-8e18-75497a8ec2d5	3f70b0a5-3f9a-410b-98bb-9af6e97ce85b	1	99.63	20	19.93	99.63	0.00	0.00	\N	\N	2026-02-11 09:26:22.462
866576aa-b913-4f03-9b75-58b4d0b18b33	4d769bfd-4865-4979-8e18-75497a8ec2d5	db7262e7-7f97-4766-886e-9a78bf39705c	1	15550.69	20	3110.14	15550.69	0.00	0.00	\N	\N	2026-02-11 09:26:22.462
20ade112-feb5-4ffd-af9c-e052229b48f1	001bd6d3-cff2-4d1f-8128-d379d2048bb0	9fc2242b-2719-4bf3-8363-f5309001394f	1	1072.51	20	214.50	1072.51	0.00	0.00	\N	\N	2026-02-11 09:31:16.943
db938a60-0bbb-40c5-ba55-6258da91ec7d	f382114b-c735-4d75-91c0-bd37821290e5	7d8077c4-da82-47a7-a7d0-c25eba803b25	1	1637.22	20	327.44	1637.22	0.00	0.00	\N	\N	2026-02-11 09:33:09.535
dc95a4af-0578-4027-97df-d1178e606181	e15b6509-505a-456b-88a6-ebc36867fad3	897aae4d-55b6-4921-8d25-c42dd6b82be7	1	6666.67	20	1333.33	6666.67	0.00	0.00	\N	\N	2026-02-11 09:52:45.66
3f6dc3f9-08be-44d6-aefe-dd8f7a2d9df9	e15b6509-505a-456b-88a6-ebc36867fad3	7bce05e7-a94d-42ff-a4fe-084854e6e44e	1	1666.67	20	333.33	1666.67	0.00	0.00	\N	\N	2026-02-11 09:52:45.66
bf360bfd-af62-46e9-b499-2a3a912d7f7e	9c15716c-2c70-4841-8478-65ac03a55833	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	1	493.79	20	98.76	493.79	0.00	0.00	\N	\N	2026-02-12 06:03:05.795
95db8ce3-7d71-4e20-9abf-b3f61530c659	9d698ef5-769a-4575-a3fc-ba10ac117d93	acb90037-dc49-4d00-9bdb-5e201b87e61b	2	217.22	20	86.89	434.44	0.00	0.00	\N	\N	2026-02-12 07:10:33.189
5a650fd2-136d-44fa-9d56-7285f794ab3e	9d698ef5-769a-4575-a3fc-ba10ac117d93	88c2c8c2-f1bf-4721-87cd-479024478cc4	1	953.15	20	190.63	953.15	0.00	0.00	\N	\N	2026-02-12 07:10:33.189
6fdaeb4a-9a69-4e1f-86d9-94bccab9b426	9d698ef5-769a-4575-a3fc-ba10ac117d93	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	1	953.15	20	190.63	953.15	0.00	0.00	\N	\N	2026-02-12 07:10:33.189
cd846f7d-0ebd-452a-8453-e11fdf00341f	9d698ef5-769a-4575-a3fc-ba10ac117d93	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	2	169.50	20	67.80	339.00	0.00	0.00	\N	\N	2026-02-12 07:10:33.189
8ff324db-6acf-487d-9413-73c010b70392	3b4219b8-f79c-463a-9602-ddb6becf8dac	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	2	723.84	20	289.54	1447.68	0.00	0.00	\N	\N	2026-02-12 07:13:14.711
dfe4d1a9-172e-4c75-a780-675b79aae55b	1005ff31-855b-4bf5-89d3-c1a4b8c9f475	a63c9f6f-2501-4b94-8135-530556ed3322	1	637.60	20	127.52	637.60	0.00	0.00	\N	\N	2026-02-12 07:15:08.268
abd40a56-344b-4c28-be57-326a38e7784f	200624df-b0e4-4dd8-9178-98ded8ea84ed	592f367c-0b18-454a-8ef0-8e863e86c613	2	107.18	20	42.87	214.37	0.00	0.00	\N	\N	2026-02-12 07:17:13.791
83445c3e-b99f-4db5-84de-88a1d18b8d66	da6eb70c-c555-4cf3-8249-5e2f96881d9d	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	1	1888.21	20	377.64	1888.21	0.00	0.00	\N	\N	2026-02-12 07:19:36.02
92fcd81f-6be7-4504-a6d7-09e88e629f30	b0ca9c58-4ea0-4275-99ea-2fc3e5de331a	dccb985b-cbf8-45a5-90ee-3fa62d360f73	1	347.09	20	69.42	347.09	0.00	0.00	\N	\N	2026-02-12 07:20:59.584
6657955c-6573-404a-acfb-5da18fba0652	3dac9888-e5e8-460f-9a08-16922c235833	9083b4d4-f834-4e9b-b0ef-0321e63d212f	3	240.00	0	0.00	720.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
97f6d4df-d70e-4323-add9-6c4187cca2b4	3dac9888-e5e8-460f-9a08-16922c235833	63f246ed-be82-4656-98e1-c0bdc120892f	3	270.00	0	0.00	810.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
a55b7016-984c-425c-b5a1-b371797cd019	3dac9888-e5e8-460f-9a08-16922c235833	561af7d5-83cd-45e0-9679-474662b496a2	3	300.00	0	0.00	900.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
91f2fa90-47be-4e1d-ab1f-f93235b6e1df	3dac9888-e5e8-460f-9a08-16922c235833	849e0525-fd23-447d-b155-127936ad6438	3	160.00	0	0.00	480.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
49f584a3-af6a-464c-8a55-84199881fe67	3dac9888-e5e8-460f-9a08-16922c235833	849e0525-fd23-447d-b155-127936ad6438	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
5598f1f0-1103-4cab-91be-75067786713c	3dac9888-e5e8-460f-9a08-16922c235833	63f246ed-be82-4656-98e1-c0bdc120892f	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
321592e5-e8e6-4a56-bc02-0574665cfbcc	3dac9888-e5e8-460f-9a08-16922c235833	24d5d06b-429e-4181-b33b-d0ab6b037d16	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
a2b26aee-4ab9-49ff-be5e-f2800a58590b	3dac9888-e5e8-460f-9a08-16922c235833	10b1c34e-d583-4113-8a76-f41497c3e57a	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
970a18a2-b378-44de-987e-afef26b9add7	3dac9888-e5e8-460f-9a08-16922c235833	22640228-a849-47f5-8693-9c61154462bc	3	100.00	0	0.00	300.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
1c01c436-1f3d-476a-89d9-2ef71ba38865	3dac9888-e5e8-460f-9a08-16922c235833	0953ebd5-8be6-4286-8346-8e5a1f0fb9f6	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
263fb023-5429-478b-80c5-c974211b5dbd	3dac9888-e5e8-460f-9a08-16922c235833	7942ee83-c081-42d2-93e3-04408281f1c2	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
8b1ac7d1-98d0-4194-9d21-57ee81b7a3e2	3dac9888-e5e8-460f-9a08-16922c235833	4af4a50d-1f6e-4197-a2c1-6be7e4477c1f	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
b588a288-c94b-4563-b2ad-acf63475a8d2	3dac9888-e5e8-460f-9a08-16922c235833	55c9cdce-0b43-4bc2-bea0-faddf082c1d5	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
44428d6b-7eae-46a6-b0ea-3a698b32d4c9	3dac9888-e5e8-460f-9a08-16922c235833	887b796e-4337-44d7-afe9-1801ae0890ce	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
39bfa901-54e8-417a-9605-2c6f3b323699	3dac9888-e5e8-460f-9a08-16922c235833	00a889e9-e4ef-4894-919b-48a62f7e9928	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
33ac2206-d9e2-4f90-83de-0aeb332ec1a9	3dac9888-e5e8-460f-9a08-16922c235833	869293f2-ccb1-4543-8cf9-121d74af2155	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
30db7777-c5d8-4f17-9a2c-80be8f871a12	3dac9888-e5e8-460f-9a08-16922c235833	f092694f-c358-4de2-8c08-ea1dafb7ae7f	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
2061a327-9baf-40e5-8050-2462a38e66cd	3dac9888-e5e8-460f-9a08-16922c235833	a0bbc567-de8c-4640-9626-554812ce1b58	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
6129e5b3-eedd-4eac-aafa-e8ee94fb7b31	3dac9888-e5e8-460f-9a08-16922c235833	5cb3212a-54ca-4838-b3bd-d31a7cd820fa	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
0a48acb4-e567-40a3-898b-f1516e5798dd	3dac9888-e5e8-460f-9a08-16922c235833	2809fce5-420a-4f2a-a4cf-2fdc17929148	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
be38510f-c762-4a22-9f18-78e778c82203	3dac9888-e5e8-460f-9a08-16922c235833	bc961598-a494-4e6a-beda-76274178bc4a	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
e513a48e-31d2-4af0-b2fd-8ba09046f024	3dac9888-e5e8-460f-9a08-16922c235833	3e21b37d-f04d-44ee-a0f6-8e9cf8cd2ee7	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
9c49334f-1ce8-41a3-8870-2cede35c2b73	3dac9888-e5e8-460f-9a08-16922c235833	9e321ab1-0b30-41fa-8b90-22dcdc5817f9	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
78364292-efa1-4c52-9cd8-49125278af63	3dac9888-e5e8-460f-9a08-16922c235833	79ce4e58-d14f-4083-b2db-cd2c509c68be	1	100.00	0	0.00	100.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
6e91905f-3900-4bdd-a6d9-dc789c186a98	3dac9888-e5e8-460f-9a08-16922c235833	4018c936-deff-474f-a4dc-bee6bd0b1498	10	380.00	0	0.00	3800.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
af497719-d207-4bc2-81bd-b8be53eff38c	3dac9888-e5e8-460f-9a08-16922c235833	bba3f68b-a9e4-41b2-90f8-70b5972fc040	10	67.00	0	0.00	670.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
f2e83e68-3189-4bfb-ae08-e05c0fd4e14d	3dac9888-e5e8-460f-9a08-16922c235833	6a1645d3-f8e8-4533-a149-0048b61b518f	12	350.00	0	0.00	4200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
01ca5daa-578d-47fe-ac10-bffd009d2585	3dac9888-e5e8-460f-9a08-16922c235833	33078d48-4cd1-4dbb-ab82-936a0e29c9a0	3	450.00	0	0.00	1350.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
9b10d170-eb84-4eff-bc47-cac67c9b4f04	3dac9888-e5e8-460f-9a08-16922c235833	f6083173-c991-435d-90e2-254725f9a5ee	6	550.00	0	0.00	3300.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
2eb9d1cb-3fa6-4bab-8aa1-ddcbe72181aa	3dac9888-e5e8-460f-9a08-16922c235833	1eb6e181-ad33-4d20-a80f-dc0114ff545e	4	800.00	0	0.00	3200.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
d4a3451f-a417-483a-8841-82d07fbac76b	3dac9888-e5e8-460f-9a08-16922c235833	07655f8b-663f-4662-a0f9-6f347f329522	4	850.00	0	0.00	3400.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
3dc05280-a52b-40e6-9d00-9cd08e4ab7e2	3dac9888-e5e8-460f-9a08-16922c235833	e66ada10-7751-4bfe-ba2d-e68e38b3919f	4	1650.00	0	0.00	6600.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
fe354b4c-a468-476f-b593-1c48d3579478	3dac9888-e5e8-460f-9a08-16922c235833	95040091-05d0-4a7a-8849-25c207d73f35	6	1250.00	0	0.00	7500.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
bb7d3e78-cf21-4f55-aa09-7506f4e2f0a0	3dac9888-e5e8-460f-9a08-16922c235833	95bf9376-130a-4420-9122-29f8196e34ad	3	2500.00	0	0.00	7500.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
905b5c15-38e6-4c4d-a25c-62de405b408d	3dac9888-e5e8-460f-9a08-16922c235833	e1f59120-da93-4573-b1e8-918e6084bf2d	3	977.00	0	0.00	2931.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
bba853ec-e4c2-4de3-b50a-a31ad0275139	3dac9888-e5e8-460f-9a08-16922c235833	9a5fe81b-0148-4749-a3df-b4a8dcd659bf	3	688.00	0	0.00	2064.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
57ff85fb-d725-4782-b200-b3c5d25efa47	3dac9888-e5e8-460f-9a08-16922c235833	a2035b61-5aa0-4c34-840a-9e63644c48f5	3	865.00	0	0.00	2595.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
6ee76e2f-04e5-453c-b791-e51379085956	3dac9888-e5e8-460f-9a08-16922c235833	0b58332b-9077-46b7-9f25-955cf468e00f	3	1060.00	0	0.00	3180.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
15f306cf-6520-48c7-b917-5a0edb1831a1	3dac9888-e5e8-460f-9a08-16922c235833	8436cadd-59b5-4ff4-a9e8-cd488f7dda9a	4	1200.00	0	0.00	4800.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
0a1807b1-b503-4993-8484-477d4bfda737	3dac9888-e5e8-460f-9a08-16922c235833	118241c5-8dd9-4124-a763-eee8a09adb06	4	600.00	0	0.00	2400.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
34dd76d3-a7d5-4b50-8b4a-080fe6e1c0a8	3dac9888-e5e8-460f-9a08-16922c235833	e05fd2cc-ccab-445f-af0b-2cd94bd78732	4	924.00	0	0.00	3696.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
638a3c2b-07fd-47e9-b364-be445710914f	3dac9888-e5e8-460f-9a08-16922c235833	1e71ee04-477b-4cfb-ae02-6f4f31ec2e82	4	972.00	0	0.00	3888.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
61f4e545-d027-423d-8fbd-3c7a97d7ee57	3dac9888-e5e8-460f-9a08-16922c235833	66a8db4a-3009-4288-8ee6-1cfd6847fd9e	4	521.00	0	0.00	2084.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
40d9d681-6432-4b9b-a8e0-0ea419e956d1	3dac9888-e5e8-460f-9a08-16922c235833	0753a8b4-1061-4f45-a558-8bb35464972c	4	1150.00	0	0.00	4600.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
dedfd061-63cc-40c4-add4-ff9a5f476e5b	3dac9888-e5e8-460f-9a08-16922c235833	8c6132d1-caeb-4ee2-a808-691ad4a747bc	4	700.00	0	0.00	2800.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
1b734fa2-20b4-40b7-a43e-7257ade700ff	3dac9888-e5e8-460f-9a08-16922c235833	4c677e5d-af26-4257-9430-ad57e7b51b43	4	500.00	0	0.00	2000.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
0df14089-03c1-4c87-b95c-f071e0b026c8	3dac9888-e5e8-460f-9a08-16922c235833	f40fcf68-9a05-4d3e-b5bb-913eb524f08f	4	660.00	0	0.00	2640.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
27b631d5-e9d4-4149-b97b-00ab44b0d808	3dac9888-e5e8-460f-9a08-16922c235833	652c437c-e68c-4180-b1c1-79ec9971c4e0	3	1450.00	0	0.00	4350.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
665fcaef-d310-4cbe-8c93-96f7afd9435c	3dac9888-e5e8-460f-9a08-16922c235833	eee51007-4697-492e-bba6-1deb068923c3	9	1117.00	0	0.00	10053.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
f460feac-7c0a-4e72-b10e-c210236acfa8	3dac9888-e5e8-460f-9a08-16922c235833	78ed3452-79f5-4534-b490-612a9c982f1b	7	220.00	0	0.00	1540.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
03f2093e-3616-4f13-9deb-aaf556e2f942	3dac9888-e5e8-460f-9a08-16922c235833	385e5aa1-4a71-41b0-b1bf-43aef7addb7c	2	110.00	0	0.00	220.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
e92e6202-0d20-4044-9a7d-139309f916b4	3dac9888-e5e8-460f-9a08-16922c235833	1dd72164-e19d-420d-b8ce-d2199715f550	2	110.00	0	0.00	220.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
ef10dee8-9c9d-4eec-82f5-82228e9400d1	3dac9888-e5e8-460f-9a08-16922c235833	630bf4a3-0205-49f2-ac1f-90800eaeeaf3	2	160.00	0	0.00	320.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
ebc410aa-d563-468b-be3c-aadad745caa9	3dac9888-e5e8-460f-9a08-16922c235833	0c5ff615-dac6-49de-91f6-d63866d55b40	2	210.00	0	0.00	420.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
9b7fe915-5548-4f47-b4e8-3b2338aa0fe9	3dac9888-e5e8-460f-9a08-16922c235833	40936006-bcd0-46a8-814f-8dd6d91a26a4	2	120.00	0	0.00	240.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
dfc48224-feb1-49bc-82b8-6716c8407d30	3dac9888-e5e8-460f-9a08-16922c235833	07b770a9-8fe6-428f-8872-6d339201f491	3	160.00	0	0.00	480.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
19bb2c01-27f5-4577-a453-254cadd712da	3dac9888-e5e8-460f-9a08-16922c235833	105696c0-dc3d-4160-8fc3-897a55974cbc	3	170.00	0	0.00	510.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
5610c288-ffc1-4270-9fc5-175e1ae88b03	3dac9888-e5e8-460f-9a08-16922c235833	d9259aa9-32c7-4d1c-a54c-d67307896439	3	200.00	0	0.00	600.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
955ddca6-5a8a-494d-bc45-adfbf8b592c0	3dac9888-e5e8-460f-9a08-16922c235833	24d5d06b-429e-4181-b33b-d0ab6b037d16	3	210.00	0	0.00	630.00	0.00	0.00	\N	\N	2026-02-12 07:35:15.635
9e610142-e794-41a8-821a-1b68b528ac4b	8eb0cfe3-902f-4b20-a164-333f3c950a59	906977a5-923e-456e-8488-dd8959c4d5d3	20	90.00	0	0.00	1800.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
1c14e3f8-9b77-4a27-9838-1ddbb33028a4	8eb0cfe3-902f-4b20-a164-333f3c950a59	39521e5a-426b-43a5-8a84-ac2adf158311	10	80.00	0	0.00	800.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
01300317-8373-49a1-9aa6-dfeaf9074d09	8eb0cfe3-902f-4b20-a164-333f3c950a59	f33e60ce-1ef6-4bf3-aa5f-da7b88f25277	10	110.00	0	0.00	1100.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
be3f94ae-14e5-4c9a-abaa-65fd1ab07fb9	8eb0cfe3-902f-4b20-a164-333f3c950a59	5ff2e5dc-b793-4f91-832e-284bca9f7298	30	90.00	0	0.00	2700.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
fc653dad-4bcb-46fc-a465-875f23e42b84	8eb0cfe3-902f-4b20-a164-333f3c950a59	6d85bcde-78c1-4ec2-a18d-4934d7905ab5	10	90.00	0	0.00	900.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
65483fa1-dc4b-46bb-92fd-b1242a63347a	8eb0cfe3-902f-4b20-a164-333f3c950a59	df13e644-c357-4a18-9969-6862e05182eb	20	100.00	0	0.00	2000.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
f179ac30-6917-4252-8e32-dce791f275d2	8eb0cfe3-902f-4b20-a164-333f3c950a59	d96763b5-aa5e-4d3e-a98f-db60d5f59cf9	10	100.00	0	0.00	1000.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
0e1ff1a6-a744-45f7-a579-c9e39c8ab8b2	8eb0cfe3-902f-4b20-a164-333f3c950a59	5ae6c502-9925-47e1-95eb-be56c45a8f19	20	110.00	0	0.00	2200.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
7f2a5e0f-34c1-4a8b-a1d1-e2d0c17a03b9	8eb0cfe3-902f-4b20-a164-333f3c950a59	55b7d98c-d568-4bca-b809-3fbf2591810f	50	120.00	0	0.00	6000.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
c3566fcf-9287-421d-a95a-e3c5b1ced18b	8eb0cfe3-902f-4b20-a164-333f3c950a59	a607a8c0-646d-42d4-8e05-b76616642ec8	10	100.00	0	0.00	1000.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
323d9eab-6f91-4dc3-ae46-81dde065e2aa	8eb0cfe3-902f-4b20-a164-333f3c950a59	4b07b8b4-f73a-4357-9221-952f3a1361e9	50	120.00	0	0.00	6000.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
e59b09c8-7fcc-4df5-bc1a-e1dc02fb4b42	8eb0cfe3-902f-4b20-a164-333f3c950a59	5f00d96f-b470-451c-9bef-513c2885cb8e	30	140.00	0	0.00	4200.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
0ad86972-72ec-4ae0-8d04-27d55e4e4bec	8eb0cfe3-902f-4b20-a164-333f3c950a59	caf736c7-f3ca-4139-a210-195139a3de3c	20	120.00	0	0.00	2400.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
dae6654c-743c-476c-9e62-520d031b6953	8eb0cfe3-902f-4b20-a164-333f3c950a59	5d281808-dc6a-4157-9f62-67b549b54b3a	11	190.00	0	0.00	2090.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
c50fac0f-a3c8-4887-a224-2824e8f4fb2e	8eb0cfe3-902f-4b20-a164-333f3c950a59	36fe0b8b-7419-431d-87d8-6d3ba255b666	5	140.00	0	0.00	700.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
8a5015ad-a799-4816-af76-918eb4c08a0d	8eb0cfe3-902f-4b20-a164-333f3c950a59	da6c69b8-ab7d-4824-85cb-65620fba47dd	20	110.00	0	0.00	2200.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
1ff4bfc7-4dd1-471d-add3-0c5e10a045cc	8eb0cfe3-902f-4b20-a164-333f3c950a59	1cbeb981-361e-4316-a0de-3de01549c185	20	90.00	0	0.00	1800.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
a4cdb052-cb03-4592-a788-02e2cfb90c87	8eb0cfe3-902f-4b20-a164-333f3c950a59	944bdaeb-9133-493b-8c32-9e381d9f8b46	20	130.00	0	0.00	2600.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
e9d3fe83-9f18-4b19-87ac-252645ae07ea	8eb0cfe3-902f-4b20-a164-333f3c950a59	c1000f39-02eb-4c12-859e-96627aad4820	41	90.00	0	0.00	3690.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
fa3ad165-fbff-4f96-b457-0316876d1543	8eb0cfe3-902f-4b20-a164-333f3c950a59	190453cf-6a4e-4f64-864c-73de4a259112	44	90.00	0	0.00	3960.00	0.00	0.00	\N	\N	2026-02-12 09:16:53.728
86a40180-8c5f-452e-b52b-b3319ce38cdc	39234ec2-27d0-4250-87ac-7df89c8ded91	e90d37ab-ea59-4252-b2f5-7c0ec275bc22	792	55.00	0	0.00	43560.00	0.00	0.00	\N	\N	2026-02-12 09:43:22.446
bb73c292-428a-485a-84cb-e6b8c48d4cfb	9146751f-47c2-413f-a5f1-2222c2d4cacb	faf14f78-3e6c-470f-bf01-6eed7e25cc67	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
409e8908-e8a8-43f9-85d5-9e099d662ffb	9146751f-47c2-413f-a5f1-2222c2d4cacb	d1bc74ce-bcb1-4612-973a-822d5eb87e13	2	100.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
88f59566-9e33-43ff-94fb-08302863c2f7	9146751f-47c2-413f-a5f1-2222c2d4cacb	f743645f-2ae9-4864-bbcf-b2189d099fe8	5	45.00	0	0.00	225.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
6c395b01-997a-477c-af36-2cded029eae9	9146751f-47c2-413f-a5f1-2222c2d4cacb	27f7f290-5a89-4fae-9e33-115053f0a77b	2	45.00	0	0.00	90.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
bb4b3d8c-37aa-4239-b5cc-33e8eb727425	9146751f-47c2-413f-a5f1-2222c2d4cacb	4f44ad6a-0d99-4c18-8826-313f543a7300	2	45.00	0	0.00	90.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
842c8d0a-3d81-43c6-8c48-5ba621a7575d	9146751f-47c2-413f-a5f1-2222c2d4cacb	28f50698-6ffa-489b-af0d-ed3d969c47e1	5	45.00	0	0.00	225.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
f970eb5e-3c20-400c-a1c5-e7eabeff3f2d	9146751f-47c2-413f-a5f1-2222c2d4cacb	0e60dbfc-23e0-42a1-8311-2a85c0a7118c	5	400.00	0	0.00	2000.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
ea86a3f3-9c90-49e8-b68c-5413356bbccd	9146751f-47c2-413f-a5f1-2222c2d4cacb	e4167f01-ad6f-4aae-bd17-fcce5302f7e3	5	312.00	0	0.00	1560.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
3b571ce7-4436-4bbc-979b-8379e075dc52	9146751f-47c2-413f-a5f1-2222c2d4cacb	607a89ec-c12d-498c-8900-5fcbc0f9ceb6	2	45.00	0	0.00	90.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
57677e32-ff07-475f-a24c-38853aeeb272	9146751f-47c2-413f-a5f1-2222c2d4cacb	daddb524-bfd1-4c3a-bac4-7a762348f2c8	5	45.00	0	0.00	225.00	0.00	0.00	\N	\N	2026-02-12 10:09:11.081
894e2d2c-1959-48e9-96d1-329bf8d9c4a8	104846f4-439f-45a7-b879-0d8e946233f9	26c7f88f-3f2f-49ba-983b-73a06fded6c1	1	235.54	20	47.11	235.54	0.00	0.00	\N	\N	2026-02-12 10:24:48.749
56a1a1ae-7c97-454f-8a29-0db1d3762243	104846f4-439f-45a7-b879-0d8e946233f9	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	1	3239.29	20	647.86	3239.29	0.00	0.00	\N	\N	2026-02-12 10:24:48.749
20756a90-5870-4252-8b34-975e84615d80	104846f4-439f-45a7-b879-0d8e946233f9	36595002-482b-4835-9f28-ec4c96336b95	1	404.26	20	80.85	404.26	0.00	0.00	\N	\N	2026-02-12 10:24:48.749
324b2954-5731-4af5-853b-0ea8716f080e	d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	113d0d8d-5198-4415-b81c-5c812ed4e435	4	140.03	20	112.02	560.12	0.00	0.00	\N	\N	2026-02-12 11:33:04.492
0ad49841-8f8c-4c49-96fa-5bccea57bf94	d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	1d0a5188-ba70-4451-b294-96c61b46d3ab	5	9.70	20	9.70	48.48	0.00	0.00	\N	\N	2026-02-12 11:33:04.492
e234f534-ee6c-4787-a417-39699b8044d6	d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	30371764-9531-4d61-9636-4cdc385d9a6f	1	871.07	20	174.21	871.07	0.00	0.00	\N	\N	2026-02-12 11:33:04.492
09ebc691-c487-4f72-aec0-89f60f1b3612	d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	1	622.12	20	124.42	622.12	0.00	0.00	\N	\N	2026-02-12 11:33:04.492
3cb329f5-a61f-42a5-9326-4d0ffe459f79	d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	747041af-5928-4134-b6dd-68c2c6081b29	1	327.25	20	65.45	327.25	0.00	0.00	\N	\N	2026-02-12 11:33:04.492
a122ead4-1e79-4a9f-a148-06f5741a2513	0125ef28-f199-42fb-9bbb-a999b45fd429	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	1	594.99	20	119.00	594.99	0.00	0.00	\N	\N	2026-02-12 11:41:28.868
1334532f-0409-429d-b88b-827b4703ddc2	0125ef28-f199-42fb-9bbb-a999b45fd429	492e3d84-3803-4117-8382-3defc2b33e8c	1	214.71	20	42.94	214.71	0.00	0.00	\N	\N	2026-02-12 11:41:28.868
5293ec96-7f09-4a5c-9fed-e3c2a7245a55	0125ef28-f199-42fb-9bbb-a999b45fd429	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	1	909.26	20	181.85	909.26	0.00	0.00	\N	\N	2026-02-12 11:41:28.868
b0693db6-d2c6-480b-b4c5-1ab0771f3bf7	0125ef28-f199-42fb-9bbb-a999b45fd429	4f879a28-5567-48cf-9885-e8be3ef8c025	1	1986.17	20	397.23	1986.17	0.00	0.00	\N	\N	2026-02-12 11:41:28.868
83b09dde-af85-4025-8469-b678dbac3e1f	0125ef28-f199-42fb-9bbb-a999b45fd429	14a09ecf-2c5d-4579-a891-371719a24a36	1	1655.23	20	331.05	1655.23	0.00	0.00	\N	\N	2026-02-12 11:41:28.868
a8b72d45-0c14-4c49-8fae-32ff6035352d	0c10af76-3f53-41d8-a002-6fa04ee79c98	1863e171-b0ef-4479-a0b2-2f08b1142281	10	23.76	20	47.52	237.60	0.00	0.00	\N	\N	2026-02-12 14:44:07.367
07a28c60-7ee5-4eaf-9ea4-81b4e99cbc5b	0c10af76-3f53-41d8-a002-6fa04ee79c98	75c4d717-f012-4e8f-a426-7ab1b2501f24	10	7.53	20	15.06	75.31	0.00	0.00	\N	\N	2026-02-12 14:44:07.367
582be2fe-82e5-4003-8ce6-17c590e20418	0c10af76-3f53-41d8-a002-6fa04ee79c98	92870c73-cab6-467e-a7ba-792b4f279546	4	50.78	20	40.62	203.12	0.00	0.00	\N	\N	2026-02-12 14:44:07.367
afb1b693-2f4b-409f-81ea-6db5f5ee751a	5f7a6376-ed26-4fb5-9084-38ac019a0ded	dbad5926-e315-4d01-b4fe-dc558f119b97	1	881.67	20	176.33	881.67	0.00	0.00	\N	\N	2026-02-17 09:00:20.119
5f263a14-3799-4916-bcda-d96ade2a1cc3	1b051c02-2fbe-45a0-992f-eb461bcb1c22	2d5f2164-3f2c-4e6b-a488-4df2d589239c	1	44.23	20	8.85	44.23	0.00	0.00	\N	\N	2026-02-17 10:55:56.711
df776514-71bb-4f7c-9cef-aa339a8d8263	8c4d32bf-525e-4059-8da5-16c9fdb4647b	2b08a9fa-72c7-4137-9579-778a0e504eda	1	497.67	20	99.53	497.67	0.00	0.00	\N	\N	2026-02-17 10:58:43.914
b606299c-f7e9-4fea-bc46-6452a6bbf90e	b267095c-2b27-44e4-957b-8c260158549c	e2c7afd3-89b7-46fc-bed4-84ca354efcaf	1	124.15	20	24.83	124.15	0.00	0.00	\N	\N	2026-02-17 11:10:10.749
ebacee84-9fd1-4cab-8d3f-b09ec3b1aadf	b267095c-2b27-44e4-957b-8c260158549c	3b5285b0-9f9c-4e59-9b18-6cc747fbf8f2	1	82.58	20	16.52	82.58	0.00	0.00	\N	\N	2026-02-17 11:10:10.749
3d44391d-0018-4fa3-8b88-8552e5848388	80698f44-b35e-49c3-92e3-3319fa783b9a	d9260889-4f94-4e97-8273-3e158999a1c8	1	82.60	20	16.52	82.60	0.00	0.00	\N	\N	2026-02-17 11:15:29.532
eddbbe14-eb26-488f-abbd-8a679b5104dc	80698f44-b35e-49c3-92e3-3319fa783b9a	b397902b-886f-4dc4-b51f-98f786381773	1	163.07	20	32.61	163.07	0.00	0.00	\N	\N	2026-02-17 11:15:29.532
2aa9321a-0fe6-4c3a-aa8b-88ee9d34ea77	80698f44-b35e-49c3-92e3-3319fa783b9a	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	1	138.25	20	27.65	138.25	0.00	0.00	\N	\N	2026-02-17 11:15:29.532
819a4205-757e-42af-81e7-7e57f4171029	55ff7629-ebad-4a1a-bfdf-0f87b9f25fe6	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	1	1697.08	20	339.42	1697.08	0.00	0.00	\N	\N	2026-02-17 11:18:03.745
bb07e36e-1b19-419a-ab12-19d188aaa7b3	a9e3c6f7-6933-415c-bf53-7dc0dc1686a1	2e369e1b-aa70-488e-9cd2-cc684d22429c	1	313.75	20	62.75	313.75	0.00	0.00	\N	\N	2026-02-18 06:08:47.64
a37e2afb-7d92-4deb-9cce-0a46879ebe28	591e5108-cbb5-4316-90e8-4df643a26dfc	12f306ed-4fa8-4976-840b-8695956a54c6	1	847.65	20	169.53	847.65	0.00	0.00	\N	\N	2026-02-18 08:28:45.202
0fd96c51-a9bc-4fa4-8ff3-d273a7348fd6	fd77da08-fca0-4c0e-8767-d12791d152fa	bb3ce01c-2764-47cf-8309-a69549833324	1	558.93	20	111.79	558.93	0.00	0.00	\N	\N	2026-02-18 08:31:52.23
cf76ce58-c2e2-4d43-aeb7-1fe12f2de7da	ecd0f330-ba9d-4e4c-b35e-05b797ddbbb9	17a2b899-c2c0-4d14-bcf4-2002d4ba1227	1	795.47	20	159.09	795.47	0.00	0.00	\N	\N	2026-02-18 08:34:54.198
e82575f8-50c3-488e-8a1f-d2f7857dc53e	38645c60-20ef-4b54-bba9-accb7c6fedcc	25ad586b-b128-46cc-8b9e-c5990ffde784	1	734.54	20	146.91	734.54	0.00	0.00	\N	\N	2026-02-19 09:34:25.342
288373e0-489e-4e7d-9be1-ee5914230c48	88e26545-b810-4076-9e44-5b6908bef7f5	930f6256-fc6e-45e9-90b3-3ba06c0a0d2e	1	346.22	0	0.00	346.22	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
839c5b3d-057f-49c5-9b72-da432e6896de	88e26545-b810-4076-9e44-5b6908bef7f5	9f768a37-b9bb-4d12-8d8e-145f47172ef1	1	204.85	0	0.00	204.85	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
f70f9786-10db-402c-a8e8-2b75b365c6a8	88e26545-b810-4076-9e44-5b6908bef7f5	2a77dd3b-6a11-4a64-a3e7-27102fd2564e	1	1170.97	0	0.00	1170.97	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
edff6660-39ea-4428-a16a-826df10e1d15	88e26545-b810-4076-9e44-5b6908bef7f5	4c5ab026-e42b-4ef9-ace8-8c41d09f127e	1	1170.97	0	0.00	1170.97	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
26db3abc-ba27-49e3-b96f-3fbee5e2a602	88e26545-b810-4076-9e44-5b6908bef7f5	c5b27835-d336-463d-bf80-790aa4e4d28f	1	216.60	0	0.00	216.60	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
53ae709d-88ab-40b3-b2db-d4398d65ecbd	88e26545-b810-4076-9e44-5b6908bef7f5	8b7704c0-3c29-48d7-9d73-4f5c6f7b1b78	2	859.02	0	0.00	1718.04	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
fcc098cb-6a2f-4f4e-b12e-f2ead701e6b3	88e26545-b810-4076-9e44-5b6908bef7f5	bbce53f5-9703-4fa2-b89f-3f0173567ec7	2	295.41	0	0.00	590.82	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
94a3844f-7c4b-429b-9051-7f3432fc56f2	88e26545-b810-4076-9e44-5b6908bef7f5	b1ccf186-4d92-45b8-9ce3-b13fcdb1e9ec	1	251.10	0	0.00	251.10	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
cd67a8d8-6d7e-40e1-b2c1-386de39a93cf	88e26545-b810-4076-9e44-5b6908bef7f5	fc2afb32-9ac3-47b8-b512-85f10f99927d	2	177.81	0	0.00	355.62	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
d9a0eab5-d22d-4d15-8fd1-546bfbfbbfe2	88e26545-b810-4076-9e44-5b6908bef7f5	278d4952-57d9-434b-8118-b0d8cd2f5f7e	1	275.82	0	0.00	275.82	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
3b115f25-58f6-4ba7-b857-cb593d16200f	88e26545-b810-4076-9e44-5b6908bef7f5	f2f45ce5-f6f8-4bb2-b909-752881d47ea8	1	212.22	0	0.00	212.22	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
0f8a6fc4-070e-4a70-93ef-33e1259c9f53	88e26545-b810-4076-9e44-5b6908bef7f5	0ffe352f-339d-4e61-88de-7149b8afc714	1	275.85	0	0.00	275.85	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
5401059a-edbf-4ff4-95f1-46e50f978979	88e26545-b810-4076-9e44-5b6908bef7f5	37ccbf67-f1fb-4efe-adb9-bec3eb6b74a4	4	221.45	0	0.00	885.80	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
02c64c5b-5c8a-48c8-b1ad-aff43006e779	88e26545-b810-4076-9e44-5b6908bef7f5	f9422f30-de03-42d3-92de-02b2c4f6335a	1	201.58	0	0.00	201.58	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
ed69d164-6a88-481d-8037-ccee7b676dea	88e26545-b810-4076-9e44-5b6908bef7f5	42f0f7dc-8e6f-48cd-8311-579ad8b3c675	1	277.49	0	0.00	277.49	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
4b0b18cd-4cd2-44f0-9361-e8ffb6827038	88e26545-b810-4076-9e44-5b6908bef7f5	032416c7-f9e3-4fa0-b586-90e07156a768	2	1283.98	0	0.00	2567.96	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
7b28467a-62ab-4b24-b8fe-0be738d64ced	88e26545-b810-4076-9e44-5b6908bef7f5	d2cbab72-3058-429c-864c-65f4045d738d	1	212.22	0	0.00	212.22	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
6bf35901-a58a-4bad-a318-fcf488d45e8f	88e26545-b810-4076-9e44-5b6908bef7f5	3d90390a-c14a-4b54-8e81-c4178baaac92	2	262.06	0	0.00	524.12	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
c3241f9f-9352-49cc-8aa2-aaed5f2b8008	88e26545-b810-4076-9e44-5b6908bef7f5	78b769f2-e303-4922-aacb-31702ee3bfb8	1	215.81	0	0.00	215.81	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
bf05ac73-eb55-4d08-9aa9-5afb043ec654	88e26545-b810-4076-9e44-5b6908bef7f5	6f84d650-de71-4a6c-8a6f-09889437a169	2	859.02	0	0.00	1718.04	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
68c6208a-943f-48bb-8c69-2fb14be87baf	88e26545-b810-4076-9e44-5b6908bef7f5	148d7662-16f0-4d3a-891e-b1116c0bada2	1	268.75	0	0.00	268.75	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
242ce35f-676c-4fae-9d77-12a5e098fbb4	88e26545-b810-4076-9e44-5b6908bef7f5	ffde3af8-5fda-4538-a5d0-91b38ce27ab4	1	309.17	0	0.00	309.17	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
3bc894af-d69a-4e97-b10c-2a86db28ed3e	88e26545-b810-4076-9e44-5b6908bef7f5	27331b7c-8381-4f26-8ebc-8858be739a70	4	306.01	0	0.00	1224.04	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
14978d86-cf17-4f83-bc48-9a229f4cc920	88e26545-b810-4076-9e44-5b6908bef7f5	db2b093c-7561-4cde-b149-f9247462f9f4	1	270.10	0	0.00	270.10	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
c9818213-996d-4eda-ba37-b6b38c3a5f2d	88e26545-b810-4076-9e44-5b6908bef7f5	32940a5e-6297-4658-87e3-b4b65b491b39	1	309.17	0	0.00	309.17	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
ef82f9d6-43c5-4e49-91cf-42a65253ab7e	88e26545-b810-4076-9e44-5b6908bef7f5	1b77495f-b548-4987-a40c-5fc3afc5f2c0	1	175.98	0	0.00	175.98	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
1ada8818-6c1b-4632-9e26-2916e5de8f56	88e26545-b810-4076-9e44-5b6908bef7f5	b94d865a-7c16-4b48-9989-1ca01a24f52f	1	213.65	0	0.00	213.65	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
4a1de37e-7d63-46c0-b1a1-1dbb48be2662	88e26545-b810-4076-9e44-5b6908bef7f5	a9434f6d-2f41-4b2d-aada-242bc0e0c46b	2	235.39	0	0.00	470.78	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
a18993b4-d749-424c-9ed2-4ee8129b4786	88e26545-b810-4076-9e44-5b6908bef7f5	75209558-85aa-4085-982a-351ab8643d4f	3	220.14	0	0.00	660.42	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
bcd46991-aaf2-4a44-8185-e30a9d162f33	88e26545-b810-4076-9e44-5b6908bef7f5	acd2f729-40f2-46f1-9469-f733175ac48d	1	418.28	0	0.00	418.28	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
999b4412-82de-405f-91ef-9dfc3b3a4717	88e26545-b810-4076-9e44-5b6908bef7f5	476ae946-ad94-45c0-91ec-1aa5adc9436d	1	509.05	0	0.00	509.05	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
04e4e5e9-8c8f-4133-b9c2-fb57d1ca0832	88e26545-b810-4076-9e44-5b6908bef7f5	6a123faf-3a94-467f-88b8-c1151c375685	2	207.99	0	0.00	415.98	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
44ef2cdc-5454-4f23-ada0-2bf0d897045c	88e26545-b810-4076-9e44-5b6908bef7f5	db7218ee-f345-443b-b5b4-3a15394ac27e	3	1147.04	0	0.00	3441.12	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
f3fda6a6-3f57-4a1e-900a-0487ae147bc5	88e26545-b810-4076-9e44-5b6908bef7f5	b07b2ffe-19ed-4f6f-a190-837e9b23d6d7	2	220.14	0	0.00	440.28	0.00	0.00	\N	\N	2026-02-19 11:06:22.874
95115c87-ac76-4302-a7c8-b1e4f4246456	081ed4cf-7089-4ad6-86e2-7e3539339fac	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	1	1250.00	0	0.00	1250.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
034467f8-4a57-42a1-9c32-5600240d24ce	081ed4cf-7089-4ad6-86e2-7e3539339fac	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	2	230.00	0	0.00	460.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
9ea01520-bb15-457d-925d-e5018c1964f6	081ed4cf-7089-4ad6-86e2-7e3539339fac	acb90037-dc49-4d00-9bdb-5e201b87e61b	2	300.00	0	0.00	600.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
febd5bc7-4d87-41ed-8a4b-dd082bd460ba	081ed4cf-7089-4ad6-86e2-7e3539339fac	dbad5926-e315-4d01-b4fe-dc558f119b97	1	1200.00	0	0.00	1200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c5bb55c3-2b2c-4e44-81c7-c8e53c1a0c76	081ed4cf-7089-4ad6-86e2-7e3539339fac	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	1	2250.00	0	0.00	2250.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d4f5ae67-7372-4b74-b9b4-09f5494b59fe	081ed4cf-7089-4ad6-86e2-7e3539339fac	ebd53187-7551-4768-b016-7ab00badd88c	3	74.24	0	0.00	222.72	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c3917f10-8ca3-4839-9b40-50da75afb009	081ed4cf-7089-4ad6-86e2-7e3539339fac	97440ecf-a58a-4bbd-8517-95a11e62b523	3	82.25	0	0.00	246.75	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
491fe94e-bafa-43c9-9920-bc9e2dd79858	081ed4cf-7089-4ad6-86e2-7e3539339fac	3b7f878f-6183-4beb-a3fc-09da7e672bc7	3	82.25	0	0.00	246.75	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e53ac559-ecfb-48e0-974a-16b1bf89ab91	081ed4cf-7089-4ad6-86e2-7e3539339fac	9c2be3d1-032e-467e-9891-570608092d01	3	78.90	0	0.00	236.70	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c8bd5095-723c-44e7-952d-efc902fc465c	081ed4cf-7089-4ad6-86e2-7e3539339fac	bb3ce01c-2764-47cf-8309-a69549833324	1	750.00	0	0.00	750.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c1a1a5ef-f4c7-463c-aee9-81974a6c6ca4	081ed4cf-7089-4ad6-86e2-7e3539339fac	12f306ed-4fa8-4976-840b-8695956a54c6	1	1100.00	0	0.00	1100.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
8d2da00a-2836-4c21-9431-6e379bd6a800	081ed4cf-7089-4ad6-86e2-7e3539339fac	d9260889-4f94-4e97-8273-3e158999a1c8	1	99.12	0	0.00	99.12	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
ba18513d-1e0c-4778-84ae-fe639791ea3b	081ed4cf-7089-4ad6-86e2-7e3539339fac	b397902b-886f-4dc4-b51f-98f786381773	1	195.68	0	0.00	195.68	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c229657d-45f2-41b2-9f34-1da94d179b6a	081ed4cf-7089-4ad6-86e2-7e3539339fac	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	1	165.90	0	0.00	165.90	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
10f91db0-2cfe-4960-81de-57ff7a540f9e	081ed4cf-7089-4ad6-86e2-7e3539339fac	29d6bea3-86c2-480b-a77f-32743f0313fd	1	4150.00	0	0.00	4150.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
b3ddb905-a8ac-4e6c-ac01-bdc6af773a5e	081ed4cf-7089-4ad6-86e2-7e3539339fac	48ca0edf-32c8-45a1-b60a-2959c06e3dc8	1	1700.00	0	0.00	1700.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
a84406b1-d801-4ea5-a4c3-5725f579b1e6	081ed4cf-7089-4ad6-86e2-7e3539339fac	5f5d6c8a-1f76-4291-9c59-6314c4e1ed52	1	330.00	0	0.00	330.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
14ebbef2-a794-4ac1-b767-775400d4235c	081ed4cf-7089-4ad6-86e2-7e3539339fac	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	1	550.00	0	0.00	550.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
324bec91-ee8b-4742-aa36-a02f1980b035	081ed4cf-7089-4ad6-86e2-7e3539339fac	17e52e1b-1762-46e4-ada6-4594ab04b5a6	1	750.00	0	0.00	750.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6feb8dd1-0ca9-4a9f-bd4d-b029375c4ef9	081ed4cf-7089-4ad6-86e2-7e3539339fac	60fe51dd-3077-43b3-b46a-50dad2fe164d	1	1600.00	0	0.00	1600.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
b74f166f-121a-4671-ab2c-34425ebdebc9	081ed4cf-7089-4ad6-86e2-7e3539339fac	43383f55-e917-4b41-9e96-7544bcb1d2b5	1	360.00	0	0.00	360.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6f1fa43b-4ef4-4b0e-bd52-adef627b4718	081ed4cf-7089-4ad6-86e2-7e3539339fac	4a4ed874-2216-4bc9-a300-17f0d0082d97	4	575.00	0	0.00	2300.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
ffd0e745-2039-42c2-b6a5-04ab11df5775	081ed4cf-7089-4ad6-86e2-7e3539339fac	d9d4845c-dfeb-43b9-9573-4443ddae6f05	2	200.00	0	0.00	400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
022685d3-fc1c-4868-a5d0-deca3949f18f	081ed4cf-7089-4ad6-86e2-7e3539339fac	2e609756-f2dd-4834-830c-958fab782301	2	900.00	0	0.00	1800.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
4cc57f4a-4d8c-49a1-9ce4-ae0688c5c389	081ed4cf-7089-4ad6-86e2-7e3539339fac	43383f55-e917-4b41-9e96-7544bcb1d2b5	1	360.00	0	0.00	360.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d02af50c-4cfe-4834-b0a5-28328b99674e	081ed4cf-7089-4ad6-86e2-7e3539339fac	841e7ff9-ca92-47c5-b53f-de26b6fa549b	1	3750.00	0	0.00	3750.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
3081c50a-cacc-49fa-ae97-831830543489	081ed4cf-7089-4ad6-86e2-7e3539339fac	0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071	1	5500.00	0	0.00	5500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
66713a47-5532-42df-9be6-1de88fc2062f	081ed4cf-7089-4ad6-86e2-7e3539339fac	4d29ba15-d80a-42d7-9a01-fd21d68a64f5	1	200.00	0	0.00	200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
7d87d591-1693-4839-a3a9-7637968b259e	081ed4cf-7089-4ad6-86e2-7e3539339fac	3f9269ca-37d1-465e-aedf-642cf50c8d84	1	185.00	0	0.00	185.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
8c77d352-8bd4-4304-8b36-5421ca9f9d6c	081ed4cf-7089-4ad6-86e2-7e3539339fac	21a31166-c617-4d2d-9980-dc07951bd242	2	1200.00	0	0.00	2400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
929ab530-0688-4dbd-a90e-23be27b4c40c	081ed4cf-7089-4ad6-86e2-7e3539339fac	83983ed2-a2a5-4026-884b-ddba7ce30748	2	700.00	0	0.00	1400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
745a078f-1ee8-47cd-aa06-13302f4afedf	081ed4cf-7089-4ad6-86e2-7e3539339fac	cf26b850-04a7-4f79-800b-bbd290a5e5f2	2	200.00	0	0.00	400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
9bcd8591-b4cd-432c-8d4e-e350b4457bfd	081ed4cf-7089-4ad6-86e2-7e3539339fac	ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3	1	1750.00	0	0.00	1750.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
19a71b6d-d672-47aa-8b00-4876635fc805	081ed4cf-7089-4ad6-86e2-7e3539339fac	a492f201-88ee-4e8e-ae49-52e1a50dbab8	1	1400.00	0	0.00	1400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
5e287673-1873-474b-96ff-63d33872ded7	081ed4cf-7089-4ad6-86e2-7e3539339fac	cc55cb87-07fe-4476-b97c-cbd1f3fb9112	1	565.00	0	0.00	565.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
b6625f36-2ef0-455e-b622-6b5b77709583	081ed4cf-7089-4ad6-86e2-7e3539339fac	d20bccc8-8f63-47b1-bf83-65d9a78ab3d0	1	600.00	0	0.00	600.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6eec5628-e203-4d97-b990-f77207c5c461	081ed4cf-7089-4ad6-86e2-7e3539339fac	d922900b-9ef7-418c-b8c4-cb1108141338	1	950.00	0	0.00	950.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6e52a2f5-c3c6-45ab-a3da-943110df30bd	081ed4cf-7089-4ad6-86e2-7e3539339fac	6b77e199-dd06-4f0f-95fc-819df8dc0bcd	1	650.00	0	0.00	650.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
bbfe64d3-4f46-4451-a9b3-8cc77dde063b	081ed4cf-7089-4ad6-86e2-7e3539339fac	5a5119ab-cfdf-4038-b627-d384e352e12b	1	1050.00	0	0.00	1050.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
896005df-e52d-486d-ab00-26b1dec9d0b3	081ed4cf-7089-4ad6-86e2-7e3539339fac	ebd53187-7551-4768-b016-7ab00badd88c	30	68.89	0	0.00	2066.70	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
f5cb364f-fb00-4f22-9695-a3b784fffc09	081ed4cf-7089-4ad6-86e2-7e3539339fac	8ca367cf-098c-4aee-9070-6dbf05a3f120	30	68.89	0	0.00	2066.70	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
2410b822-564f-4e10-9237-ce31003bae62	081ed4cf-7089-4ad6-86e2-7e3539339fac	1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb	1	720.00	0	0.00	720.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
f6abb8af-7f5e-41e6-88d7-615def536c39	081ed4cf-7089-4ad6-86e2-7e3539339fac	4ca32989-637b-413e-8464-c70eeacf2798	1	4150.00	0	0.00	4150.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e3d05099-3017-46c1-8513-0e8c08e693e9	081ed4cf-7089-4ad6-86e2-7e3539339fac	f27495f5-9e20-4b1d-b41d-acd1964600fd	1	1200.00	0	0.00	1200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
8e01447f-837f-4165-a5c0-dd2ea2c8e61c	081ed4cf-7089-4ad6-86e2-7e3539339fac	4a0c6df2-9b97-47aa-8647-d69ac9e5b68b	1	1100.00	0	0.00	1100.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
721236b0-400f-4d1a-ac71-fb1760e1e23c	081ed4cf-7089-4ad6-86e2-7e3539339fac	15353c7e-4dee-4dc2-ab8b-da505d6ff997	1	1650.00	0	0.00	1650.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
13bf15de-d02e-481e-9608-c0405b52aed8	081ed4cf-7089-4ad6-86e2-7e3539339fac	b1eda65e-05cc-4520-a341-0bccf035b64b	1	1650.00	0	0.00	1650.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6461bdeb-b6ed-4d40-b153-24933c12da62	081ed4cf-7089-4ad6-86e2-7e3539339fac	58ea2ec6-5fa8-4a5a-81c8-de7155845cb1	2	750.00	0	0.00	1500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
0727951e-3d84-4292-8f78-e98b3ef25cab	081ed4cf-7089-4ad6-86e2-7e3539339fac	7cc41938-a92a-4b3f-b768-b7c7a49fc4bf	1	350.00	0	0.00	350.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
ae669fe0-9c14-4347-b9ce-e08e0a61fb2d	081ed4cf-7089-4ad6-86e2-7e3539339fac	a1a2a2ae-1141-468c-bc6d-edb60da5c581	1	4000.00	0	0.00	4000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
23b350ee-b192-4a1f-98ee-dfbb6a5f0e0b	081ed4cf-7089-4ad6-86e2-7e3539339fac	8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	1	3000.00	0	0.00	3000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
22b1a2f7-9341-40c8-a41f-8ab5702d3f03	081ed4cf-7089-4ad6-86e2-7e3539339fac	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	3	580.00	0	0.00	1740.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6b57b6d8-6ac0-41bb-a1be-aebeee1b9a56	081ed4cf-7089-4ad6-86e2-7e3539339fac	070c78a4-26c5-4338-bece-4877b60c2a26	2	400.00	0	0.00	800.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
5ddf3376-2bdc-4648-810c-7f80bca52d75	081ed4cf-7089-4ad6-86e2-7e3539339fac	9295b32c-9a71-46eb-8c8d-c15ac375f692	1	800.00	0	0.00	800.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
02acf0ba-e6f9-4876-afc6-230381b39635	081ed4cf-7089-4ad6-86e2-7e3539339fac	db7262e7-7f97-4766-886e-9a78bf39705c	1	20500.00	0	0.00	20500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
25f80bcc-74f3-4221-a278-eb898f57bc4b	081ed4cf-7089-4ad6-86e2-7e3539339fac	30371764-9531-4d61-9636-4cdc385d9a6f	1	1200.00	0	0.00	1200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
7061146a-616e-43c6-a4d2-e85236a117d2	081ed4cf-7089-4ad6-86e2-7e3539339fac	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	1	850.00	0	0.00	850.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
248a4e31-04fb-4dc1-9fb1-ccc3626c95f3	081ed4cf-7089-4ad6-86e2-7e3539339fac	747041af-5928-4134-b6dd-68c2c6081b29	1	450.00	0	0.00	450.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
95c9e916-2824-4786-8d34-eea8697d2340	081ed4cf-7089-4ad6-86e2-7e3539339fac	113d0d8d-5198-4415-b81c-5c812ed4e435	4	200.00	0	0.00	800.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
a57c1f0d-6566-42bd-b631-b258e9ae9536	081ed4cf-7089-4ad6-86e2-7e3539339fac	1d0a5188-ba70-4451-b294-96c61b46d3ab	5	15.00	0	0.00	75.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
67a67fed-c3f5-4257-9e05-abe0ac0274eb	081ed4cf-7089-4ad6-86e2-7e3539339fac	9313625f-754f-4bab-8e48-68dac414e3bc	1	5600.00	0	0.00	5600.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
aa83227a-dd16-4260-ac7e-48708798b7a6	081ed4cf-7089-4ad6-86e2-7e3539339fac	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	1	1200.00	0	0.00	1200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
5d2d0275-15c4-4511-b43d-0db484f85e5a	081ed4cf-7089-4ad6-86e2-7e3539339fac	14a09ecf-2c5d-4579-a891-371719a24a36	1	2180.00	0	0.00	2180.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
0a0a63e8-5370-41bc-a321-2b15016c16a5	081ed4cf-7089-4ad6-86e2-7e3539339fac	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	1	800.00	0	0.00	800.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
69c4e2e1-71c3-4c10-8b8c-9f5487470556	081ed4cf-7089-4ad6-86e2-7e3539339fac	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	1	2850.00	0	0.00	2850.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6199754f-0a44-4cbb-a116-5b14e6526d87	081ed4cf-7089-4ad6-86e2-7e3539339fac	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	1	715.00	0	0.00	715.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d2b49080-af30-4842-8087-f6a348355d8b	081ed4cf-7089-4ad6-86e2-7e3539339fac	4f879a28-5567-48cf-9885-e8be3ef8c025	1	2650.00	0	0.00	2650.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
3b6d1249-5092-43d9-971a-6115e8981754	081ed4cf-7089-4ad6-86e2-7e3539339fac	492e3d84-3803-4117-8382-3defc2b33e8c	1	300.00	0	0.00	300.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d2e8a9d0-ef62-4044-9eb7-df5aec4fb8cc	081ed4cf-7089-4ad6-86e2-7e3539339fac	c190aad6-0676-492d-934a-28d3ff6e2bd2	1	16000.00	0	0.00	16000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
0f7b5ee7-186a-4527-9168-8521a3bc68d8	081ed4cf-7089-4ad6-86e2-7e3539339fac	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	2	175.00	0	0.00	350.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
50889bc1-7fcc-4da1-a904-2bd83c62769c	081ed4cf-7089-4ad6-86e2-7e3539339fac	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	1	950.00	0	0.00	950.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
ebdf1aa0-b8a6-4f5d-bcf2-9775ac7652f0	081ed4cf-7089-4ad6-86e2-7e3539339fac	7f69153f-992a-49d4-ba61-8c64f69f0b70	1	2300.00	0	0.00	2300.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6ca695d4-cd8f-46dc-8cab-dbc04a1e5458	081ed4cf-7089-4ad6-86e2-7e3539339fac	fac371ee-4670-4c55-a6af-1995c5297bab	1	450.00	0	0.00	450.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d01b6f71-6749-496f-b39e-fe00ea9be7c0	081ed4cf-7089-4ad6-86e2-7e3539339fac	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	3	1000.00	0	0.00	3000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
528fc24b-eba5-4f61-875c-9f39b0fffbab	081ed4cf-7089-4ad6-86e2-7e3539339fac	befa4db7-76e1-4e25-b775-e5134a7aaad0	1	500.00	0	0.00	500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
87337866-1f13-49b9-b1d6-103799bf7385	081ed4cf-7089-4ad6-86e2-7e3539339fac	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	1	750.00	0	0.00	750.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
b15e0520-ac00-4bfd-9e96-8c6d9398e5c4	081ed4cf-7089-4ad6-86e2-7e3539339fac	e8564a36-6b84-4a98-93c8-e78ba2d096bd	1	1500.00	0	0.00	1500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
49da3345-200f-46bc-8efb-7001e4aca797	081ed4cf-7089-4ad6-86e2-7e3539339fac	d390a057-d84b-4a11-9031-073e3de7955a	1	590.00	0	0.00	590.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
235b5232-a3a9-4c5d-a5fa-c27dd41631cb	081ed4cf-7089-4ad6-86e2-7e3539339fac	9fc2242b-2719-4bf3-8363-f5309001394f	1	1450.00	0	0.00	1450.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
d140f21e-da64-4652-a177-ea03b65b2e7f	081ed4cf-7089-4ad6-86e2-7e3539339fac	26c7f88f-3f2f-49ba-983b-73a06fded6c1	1	320.00	0	0.00	320.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
1232354d-2246-4310-a2fc-84e48b8fe1c5	081ed4cf-7089-4ad6-86e2-7e3539339fac	36595002-482b-4835-9f28-ec4c96336b95	1	550.00	0	0.00	550.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
96e87fc5-c00e-4dd0-87cf-0b105b08632f	081ed4cf-7089-4ad6-86e2-7e3539339fac	dccb985b-cbf8-45a5-90ee-3fa62d360f73	1	450.00	0	0.00	450.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
7b74f3c3-b2de-4aeb-9f28-01cea3ad3a73	081ed4cf-7089-4ad6-86e2-7e3539339fac	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	1	4300.00	0	0.00	4300.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e9c19d8b-0573-4505-9be7-29aabe4813f7	081ed4cf-7089-4ad6-86e2-7e3539339fac	ef1b99c8-f47e-4cd5-b239-fa50abc46139	1	90.00	0	0.00	90.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
f674749f-dfaf-4b76-9d75-76925d0347c1	081ed4cf-7089-4ad6-86e2-7e3539339fac	822d5979-a68a-4d37-9d77-e99723b98af5	1	60.00	0	0.00	60.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
47918c96-40ca-4d55-9b70-5299a17dd7d9	081ed4cf-7089-4ad6-86e2-7e3539339fac	e4e92397-048d-4573-9190-b9451b01bc43	1	1900.00	0	0.00	1900.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
300a07d8-18ab-49ca-b6b6-9d2d0600d1fd	081ed4cf-7089-4ad6-86e2-7e3539339fac	5e3e1253-3eba-4592-b7e5-521aa7e8b4bd	1	1200.00	0	0.00	1200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c3c6e2b9-1972-4fbe-be6e-7db54c2e1222	081ed4cf-7089-4ad6-86e2-7e3539339fac	8af369e2-616d-4b8e-8e85-ce7580771548	1	1550.00	0	0.00	1550.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
4b372121-f81d-4d7f-b4dd-7147edd4a176	081ed4cf-7089-4ad6-86e2-7e3539339fac	35fa2343-4314-4fcb-bb8f-8ea508fe9030	1	5500.00	0	0.00	5500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
05bf6442-93d3-4dd3-a702-44f473f1db16	081ed4cf-7089-4ad6-86e2-7e3539339fac	b2447e12-55c1-488c-9af5-86502190495c	1	4350.00	0	0.00	4350.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
3e158171-31c1-487a-9dbb-a738a51890af	081ed4cf-7089-4ad6-86e2-7e3539339fac	279b1a94-66d5-4c7c-aa8d-a3222332d30a	1	7000.00	0	0.00	7000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
5527cfd4-8301-48d6-9ebe-3df36eb733ca	081ed4cf-7089-4ad6-86e2-7e3539339fac	d27eaf8b-5790-43b3-9bf3-a4610454c87a	1	820.00	0	0.00	820.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
9ffb9229-298c-4c2c-a093-1835d3451549	081ed4cf-7089-4ad6-86e2-7e3539339fac	988a9c98-3f14-4618-b4d6-b7d34ab264bd	1	1400.00	0	0.00	1400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
abf36779-dbec-4a34-ba42-4aa57bc52bf6	081ed4cf-7089-4ad6-86e2-7e3539339fac	36554292-a6c6-4759-b86b-6d12f28fe79f	1	1400.00	0	0.00	1400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6434379e-83b3-46ad-9573-90290a03dcb9	081ed4cf-7089-4ad6-86e2-7e3539339fac	4d5a2911-661a-4939-bd75-24ef80fe07ae	1	2400.00	0	0.00	2400.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e800a3ea-00fd-40c6-bb4e-d2cb215b79ee	081ed4cf-7089-4ad6-86e2-7e3539339fac	6df6ee1b-cf84-45fb-8988-d3189073c7a5	4	125.00	0	0.00	500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
50e131f4-9004-49e0-91f7-64a77191a683	081ed4cf-7089-4ad6-86e2-7e3539339fac	95524c06-81bb-4523-a9ad-7904f769d866	1	650.00	0	0.00	650.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
0561f2b5-421d-40d4-96c0-9003a31779eb	081ed4cf-7089-4ad6-86e2-7e3539339fac	fd0e24dc-66c8-45ad-933b-6a5e81fa0647	1	7000.00	0	0.00	7000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
1cb54820-8276-4690-a544-6d9e8461bc0f	081ed4cf-7089-4ad6-86e2-7e3539339fac	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	1	550.00	0	0.00	550.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
9c8b65de-ed91-4351-81cf-83e2f157f421	081ed4cf-7089-4ad6-86e2-7e3539339fac	c169b88e-7166-4701-b53f-d6defa6e9351	1	235.00	0	0.00	235.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e8d240c3-c6fd-4702-bce0-017cf7cb7e5b	081ed4cf-7089-4ad6-86e2-7e3539339fac	683958d9-6c77-4716-884a-63f720f799b1	1	130.00	0	0.00	130.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
2e3e8d41-7731-4138-950a-a0e88670551f	081ed4cf-7089-4ad6-86e2-7e3539339fac	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	1	1700.00	0	0.00	1700.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
423025e0-d975-41dc-9941-cef49a110dd9	081ed4cf-7089-4ad6-86e2-7e3539339fac	7d8077c4-da82-47a7-a7d0-c25eba803b25	1	2200.00	0	0.00	2200.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
0247dfb2-0863-48cc-b353-09a7ab2b22bd	081ed4cf-7089-4ad6-86e2-7e3539339fac	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	2	1000.00	0	0.00	2000.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
c82c1972-fa98-4679-849f-1ddf30f88d6e	081ed4cf-7089-4ad6-86e2-7e3539339fac	592f367c-0b18-454a-8ef0-8e863e86c613	2	150.00	0	0.00	300.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
6c645222-e576-4e8d-819e-696d7ef8c6bf	081ed4cf-7089-4ad6-86e2-7e3539339fac	a63c9f6f-2501-4b94-8135-530556ed3322	1	850.00	0	0.00	850.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
3d384dca-c09a-4ffe-b2ae-280985c79862	081ed4cf-7089-4ad6-86e2-7e3539339fac	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	2	350.00	0	0.00	700.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
3edd984d-ac5c-4eeb-9589-07d45b1d94fa	081ed4cf-7089-4ad6-86e2-7e3539339fac	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	1	2500.00	0	0.00	2500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
323b3bf1-80c1-4e47-93b4-b9b8b9363db2	081ed4cf-7089-4ad6-86e2-7e3539339fac	897aae4d-55b6-4921-8d25-c42dd6b82be7	1	9500.00	0	0.00	9500.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
a44f6699-08a6-44a8-818b-9089691a1f39	081ed4cf-7089-4ad6-86e2-7e3539339fac	88c2c8c2-f1bf-4721-87cd-479024478cc4	1	1250.00	0	0.00	1250.00	0.00	0.00	\N	\N	2026-02-26 08:03:31.133
e0541a10-a5f9-4f85-9d1b-80286de6053a	72fae57a-00bd-4d8d-ab4a-9a325f132724	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	1	22.00	20	4.40	22.00	0.00	0.00	\N	\N	2026-02-26 17:52:03.179
\.


--
-- Data for Name: fatura_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fatura_logs (id, "faturaId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
1b5b50c8-95c2-48d6-8054-31ea7eb16e63	081ed4cf-7089-4ad6-86e2-7e3539339fac	5c81dff5-0ee8-4395-b655-138a4d0064b8	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"49.35"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"49.35"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"47.34"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"19.824"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"39.136"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"33.18"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"66"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"320"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"360"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"750"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"40"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"37"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"350"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"113"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"210"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"144"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"800"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"348"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"4100"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"15"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":4,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"1120"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"436"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"570"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"143"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"530"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"3200"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"118"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"290"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"64"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"860"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"18"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"12"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"380"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"310"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"870"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"164"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"47"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"26"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"440"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"400"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"140"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"500"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"1900"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"92"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"450"}]}	\N	\N	2026-02-25 10:03:09.663
83126452-833a-470e-b774-c43be65656a1	081ed4cf-7089-4ad6-86e2-7e3539339fac	5c81dff5-0ee8-4395-b655-138a4d0064b8	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"49.35"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"47.34"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"19.824"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"39.136"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"33.18"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"66"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"320"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"360"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"750"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"40"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"37"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"350"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"113"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"210"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"144"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"800"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"348"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"4100"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"15"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":4,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"1120"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"436"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"570"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"143"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"530"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"3200"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"118"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"290"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"64"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"860"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"18"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"12"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"380"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"310"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"870"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"164"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"47"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"26"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"440"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"400"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"140"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"500"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"1900"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"92"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"450"}]}	\N	\N	2026-02-25 10:03:35.051
579aec69-e5d2-49c2-a92e-3116ba78d2b7	081ed4cf-7089-4ad6-86e2-7e3539339fac	5c81dff5-0ee8-4395-b655-138a4d0064b8	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"49.35"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"49.35"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"47.34"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"19.824"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"39.136"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"33.18"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"66"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"320"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"360"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"72"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"750"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"40"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"37"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"350"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"113"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"210"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"413.34"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"144"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"830"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"220"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"330"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"800"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"348"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"4100"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"15"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":4,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"1120"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"436"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"160"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"570"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"143"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"530"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"3200"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"70"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"190"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"460"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"600"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"150"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"300"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"118"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"290"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"64"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"90"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"860"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"18"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"12"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"380"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"310"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"1100"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"870"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"164"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"280"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"480"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"100"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"130"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"1400"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"110"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"47"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"26"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"340"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"440"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"400"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"170"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"140"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"500"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"1900"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"92"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"120"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"240"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"450"}]}	\N	\N	2026-02-25 10:07:11.825
09a5fdd7-ecd9-4895-862b-2d89d53787a0	081ed4cf-7089-4ad6-86e2-7e3539339fac	04efc97b-a3a4-4d7e-b504-41b9d99911ea	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"250"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"92"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"0"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"0"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"0"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"0"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"0"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"0"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"0"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"0"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"0"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"0"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"0"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"0"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"0"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"0"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":1,"birimFiyat":5600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"0"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"0"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"0"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"0"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"0"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"0"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"0"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"0"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"0"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"0"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"0"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"0"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"0"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"0"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"0"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"0"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"0"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"0"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"0"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"0"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"0"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"0"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"0"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"0"}]}	\N	\N	2026-02-25 12:07:44.319
fca29cb0-a04f-4b3b-9084-6f1a2e9cdb60	081ed4cf-7089-4ad6-86e2-7e3539339fac	5c81dff5-0ee8-4395-b655-138a4d0064b8	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"0"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"0"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"0"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"0"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"0"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"0"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"0"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"0"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"0"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"0"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"0"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"0"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"0"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"0"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"0"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"0"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":1,"birimFiyat":5600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"0"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"0"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"0"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"0"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"0"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"0"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"0"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"0"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"0"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"0"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"0"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"0"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"0"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"0"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"0"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"0"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"0"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"0"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"0"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"0"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"0"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"0"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"0"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"0"}]}	\N	\N	2026-02-25 14:46:07.506
fff97c35-8788-4337-9832-ab80e6a21e18	081ed4cf-7089-4ad6-86e2-7e3539339fac	04efc97b-a3a4-4d7e-b504-41b9d99911ea	UPDATE	{"faturaNo":"SF-2026-001","tarih":"2026-02-20T00:00:00.000Z","vade":"2026-03-07T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b","miktar":1,"birimFiyat":1250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"0"},{"stokId":"4033f9cf-dd09-47dc-ab09-ef169e2c11cc","miktar":2,"birimFiyat":230,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"460","kdvTutar":"0"},{"stokId":"acb90037-dc49-4d00-9bdb-5e201b87e61b","miktar":2,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"dbad5926-e315-4d01-b4fe-dc558f119b97","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"9d5055a7-1e21-45b0-9916-c8a60bffc3ac","miktar":1,"birimFiyat":2250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2250","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":3,"birimFiyat":74.24,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"222.71999999999997","kdvTutar":"0"},{"stokId":"97440ecf-a58a-4bbd-8517-95a11e62b523","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"3b7f878f-6183-4beb-a3fc-09da7e672bc7","miktar":3,"birimFiyat":82.25,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"246.75","kdvTutar":"0"},{"stokId":"9c2be3d1-032e-467e-9891-570608092d01","miktar":3,"birimFiyat":78.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"236.70000000000002","kdvTutar":"0"},{"stokId":"bb3ce01c-2764-47cf-8309-a69549833324","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"12f306ed-4fa8-4976-840b-8695956a54c6","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"d9260889-4f94-4e97-8273-3e158999a1c8","miktar":1,"birimFiyat":99.12,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"99.12","kdvTutar":"0"},{"stokId":"b397902b-886f-4dc4-b51f-98f786381773","miktar":1,"birimFiyat":195.68,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"195.68","kdvTutar":"0"},{"stokId":"b0befc5d-01b6-4ccf-b3df-e3aff98ac97f","miktar":1,"birimFiyat":165.9,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"165.9","kdvTutar":"0"},{"stokId":"29d6bea3-86c2-480b-a77f-32743f0313fd","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"48ca0edf-32c8-45a1-b60a-2959c06e3dc8","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"5f5d6c8a-1f76-4291-9c59-6314c4e1ed52","miktar":1,"birimFiyat":330,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"330","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"17e52e1b-1762-46e4-ada6-4594ab04b5a6","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"60fe51dd-3077-43b3-b46a-50dad2fe164d","miktar":1,"birimFiyat":1600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1600","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"4a4ed874-2216-4bc9-a300-17f0d0082d97","miktar":4,"birimFiyat":575,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"d9d4845c-dfeb-43b9-9573-4443ddae6f05","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"2e609756-f2dd-4834-830c-958fab782301","miktar":2,"birimFiyat":900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1800","kdvTutar":"0"},{"stokId":"43383f55-e917-4b41-9e96-7544bcb1d2b5","miktar":1,"birimFiyat":360,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"360","kdvTutar":"0"},{"stokId":"841e7ff9-ca92-47c5-b53f-de26b6fa549b","miktar":1,"birimFiyat":3750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3750","kdvTutar":"0"},{"stokId":"0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"4d29ba15-d80a-42d7-9a01-fd21d68a64f5","miktar":1,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"200","kdvTutar":"0"},{"stokId":"3f9269ca-37d1-465e-aedf-642cf50c8d84","miktar":1,"birimFiyat":185,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"185","kdvTutar":"0"},{"stokId":"21a31166-c617-4d2d-9980-dc07951bd242","miktar":2,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"83983ed2-a2a5-4026-884b-ddba7ce30748","miktar":2,"birimFiyat":700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cf26b850-04a7-4f79-800b-bbd290a5e5f2","miktar":2,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"0"},{"stokId":"ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3","miktar":1,"birimFiyat":1750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1750","kdvTutar":"0"},{"stokId":"a492f201-88ee-4e8e-ae49-52e1a50dbab8","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"cc55cb87-07fe-4476-b97c-cbd1f3fb9112","miktar":1,"birimFiyat":565,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"565","kdvTutar":"0"},{"stokId":"d20bccc8-8f63-47b1-bf83-65d9a78ab3d0","miktar":1,"birimFiyat":600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"600","kdvTutar":"0"},{"stokId":"d922900b-9ef7-418c-b8c4-cb1108141338","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"6b77e199-dd06-4f0f-95fc-819df8dc0bcd","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"5a5119ab-cfdf-4038-b627-d384e352e12b","miktar":1,"birimFiyat":1050,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1050","kdvTutar":"0"},{"stokId":"ebd53187-7551-4768-b016-7ab00badd88c","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"8ca367cf-098c-4aee-9070-6dbf05a3f120","miktar":30,"birimFiyat":68.89,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2066.7","kdvTutar":"0"},{"stokId":"1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb","miktar":1,"birimFiyat":720,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"720","kdvTutar":"0"},{"stokId":"4ca32989-637b-413e-8464-c70eeacf2798","miktar":1,"birimFiyat":4150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4150","kdvTutar":"0"},{"stokId":"f27495f5-9e20-4b1d-b41d-acd1964600fd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"4a0c6df2-9b97-47aa-8647-d69ac9e5b68b","miktar":1,"birimFiyat":1100,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1100","kdvTutar":"0"},{"stokId":"15353c7e-4dee-4dc2-ab8b-da505d6ff997","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"b1eda65e-05cc-4520-a341-0bccf035b64b","miktar":1,"birimFiyat":1650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1650","kdvTutar":"0"},{"stokId":"58ea2ec6-5fa8-4a5a-81c8-de7155845cb1","miktar":2,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"7cc41938-a92a-4b3f-b768-b7c7a49fc4bf","miktar":1,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"a1a2a2ae-1141-468c-bc6d-edb60da5c581","miktar":1,"birimFiyat":4000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4000","kdvTutar":"0"},{"stokId":"8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044","miktar":1,"birimFiyat":3000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"21a24ace-f795-40fb-91cc-2e4bca2a6d6a","miktar":3,"birimFiyat":580,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1740","kdvTutar":"0"},{"stokId":"070c78a4-26c5-4338-bece-4877b60c2a26","miktar":2,"birimFiyat":400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"9295b32c-9a71-46eb-8c8d-c15ac375f692","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"db7262e7-7f97-4766-886e-9a78bf39705c","miktar":1,"birimFiyat":20500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"20500","kdvTutar":"0"},{"stokId":"30371764-9531-4d61-9636-4cdc385d9a6f","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"88f6dd1f-ac78-4c16-b59c-5c95b6b8b537","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"747041af-5928-4134-b6dd-68c2c6081b29","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"113d0d8d-5198-4415-b81c-5c812ed4e435","miktar":4,"birimFiyat":200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"1d0a5188-ba70-4451-b294-96c61b46d3ab","miktar":5,"birimFiyat":15,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"75","kdvTutar":"0"},{"stokId":"9313625f-754f-4bab-8e48-68dac414e3bc","miktar":1,"birimFiyat":5600,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5600","kdvTutar":"0"},{"stokId":"a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"14a09ecf-2c5d-4579-a891-371719a24a36","miktar":1,"birimFiyat":2180,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2180","kdvTutar":"0"},{"stokId":"fd453aeb-ee50-4ba6-8839-a9c96d45e33d","miktar":1,"birimFiyat":800,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"800","kdvTutar":"0"},{"stokId":"b4237b54-7d54-4e1e-8fbf-efe2edf9171d","miktar":1,"birimFiyat":2850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2850","kdvTutar":"0"},{"stokId":"ca8c911b-e1c8-4a20-8212-5f8fc929b72a","miktar":1,"birimFiyat":715,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"715","kdvTutar":"0"},{"stokId":"4f879a28-5567-48cf-9885-e8be3ef8c025","miktar":1,"birimFiyat":2650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2650","kdvTutar":"0"},{"stokId":"492e3d84-3803-4117-8382-3defc2b33e8c","miktar":1,"birimFiyat":300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"c190aad6-0676-492d-934a-28d3ff6e2bd2","miktar":1,"birimFiyat":16000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"0"},{"stokId":"694bbe25-2ec0-4e4c-887f-c32b37f0beeb","miktar":2,"birimFiyat":175,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"350","kdvTutar":"0"},{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":950,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"950","kdvTutar":"0"},{"stokId":"7f69153f-992a-49d4-ba61-8c64f69f0b70","miktar":1,"birimFiyat":2300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2300","kdvTutar":"0"},{"stokId":"fac371ee-4670-4c55-a6af-1995c5297bab","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e","miktar":3,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"3000","kdvTutar":"0"},{"stokId":"befa4db7-76e1-4e25-b775-e5134a7aaad0","miktar":1,"birimFiyat":500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74","miktar":1,"birimFiyat":750,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"750","kdvTutar":"0"},{"stokId":"e8564a36-6b84-4a98-93c8-e78ba2d096bd","miktar":1,"birimFiyat":1500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1500","kdvTutar":"0"},{"stokId":"d390a057-d84b-4a11-9031-073e3de7955a","miktar":1,"birimFiyat":590,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"590","kdvTutar":"0"},{"stokId":"9fc2242b-2719-4bf3-8363-f5309001394f","miktar":1,"birimFiyat":1450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1450","kdvTutar":"0"},{"stokId":"26c7f88f-3f2f-49ba-983b-73a06fded6c1","miktar":1,"birimFiyat":320,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"320","kdvTutar":"0"},{"stokId":"36595002-482b-4835-9f28-ec4c96336b95","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"dccb985b-cbf8-45a5-90ee-3fa62d360f73","miktar":1,"birimFiyat":450,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"450","kdvTutar":"0"},{"stokId":"b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c","miktar":1,"birimFiyat":4300,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4300","kdvTutar":"0"},{"stokId":"ef1b99c8-f47e-4cd5-b239-fa50abc46139","miktar":1,"birimFiyat":90,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"90","kdvTutar":"0"},{"stokId":"822d5979-a68a-4d37-9d77-e99723b98af5","miktar":1,"birimFiyat":60,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"60","kdvTutar":"0"},{"stokId":"e4e92397-048d-4573-9190-b9451b01bc43","miktar":1,"birimFiyat":1900,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1900","kdvTutar":"0"},{"stokId":"5e3e1253-3eba-4592-b7e5-521aa7e8b4bd","miktar":1,"birimFiyat":1200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1200","kdvTutar":"0"},{"stokId":"8af369e2-616d-4b8e-8e85-ce7580771548","miktar":1,"birimFiyat":1550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1550","kdvTutar":"0"},{"stokId":"35fa2343-4314-4fcb-bb8f-8ea508fe9030","miktar":1,"birimFiyat":5500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5500","kdvTutar":"0"},{"stokId":"b2447e12-55c1-488c-9af5-86502190495c","miktar":1,"birimFiyat":4350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"4350","kdvTutar":"0"},{"stokId":"279b1a94-66d5-4c7c-aa8d-a3222332d30a","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"d27eaf8b-5790-43b3-9bf3-a4610454c87a","miktar":1,"birimFiyat":820,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"820","kdvTutar":"0"},{"stokId":"988a9c98-3f14-4618-b4d6-b7d34ab264bd","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"36554292-a6c6-4759-b86b-6d12f28fe79f","miktar":1,"birimFiyat":1400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1400","kdvTutar":"0"},{"stokId":"4d5a2911-661a-4939-bd75-24ef80fe07ae","miktar":1,"birimFiyat":2400,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2400","kdvTutar":"0"},{"stokId":"6df6ee1b-cf84-45fb-8988-d3189073c7a5","miktar":4,"birimFiyat":125,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"500","kdvTutar":"0"},{"stokId":"95524c06-81bb-4523-a9ad-7904f769d866","miktar":1,"birimFiyat":650,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"650","kdvTutar":"0"},{"stokId":"fd0e24dc-66c8-45ad-933b-6a5e81fa0647","miktar":1,"birimFiyat":7000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"7000","kdvTutar":"0"},{"stokId":"a0e84829-720d-4aa5-b23e-e4c1c19a6fec","miktar":1,"birimFiyat":550,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"550","kdvTutar":"0"},{"stokId":"c169b88e-7166-4701-b53f-d6defa6e9351","miktar":1,"birimFiyat":235,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"235","kdvTutar":"0"},{"stokId":"683958d9-6c77-4716-884a-63f720f799b1","miktar":1,"birimFiyat":130,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"130","kdvTutar":"0"},{"stokId":"7abfbd0e-c9e4-4501-aa75-c59be64cd0d5","miktar":1,"birimFiyat":1700,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1700","kdvTutar":"0"},{"stokId":"7d8077c4-da82-47a7-a7d0-c25eba803b25","miktar":1,"birimFiyat":2200,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2200","kdvTutar":"0"},{"stokId":"35475fbb-e1d8-4fd8-ad28-bd1e42e8d304","miktar":2,"birimFiyat":1000,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2000","kdvTutar":"0"},{"stokId":"592f367c-0b18-454a-8ef0-8e863e86c613","miktar":2,"birimFiyat":150,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"0"},{"stokId":"a63c9f6f-2501-4b94-8135-530556ed3322","miktar":1,"birimFiyat":850,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"850","kdvTutar":"0"},{"stokId":"c02c5ee2-d1be-4ae5-b7df-77d26be2c244","miktar":2,"birimFiyat":350,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"700","kdvTutar":"0"},{"stokId":"bcc20bd8-4c64-4912-aad3-fbdec97bb56d","miktar":1,"birimFiyat":2500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"2500","kdvTutar":"0"},{"stokId":"897aae4d-55b6-4921-8d25-c42dd6b82be7","miktar":1,"birimFiyat":9500,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"9500","kdvTutar":"0"},{"stokId":"88c2c8c2-f1bf-4721-87cd-479024478cc4","miktar":1,"birimFiyat":1250,"kdvOrani":0,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1250","kdvTutar":"0"}]}	\N	\N	2026-02-26 08:03:31.583
f4bdcc15-ad72-4e5b-b9a9-2a52a07d8896	72fae57a-00bd-4d8d-ab4a-9a325f132724	5c81dff5-0ee8-4395-b655-138a4d0064b8	CREATE	{"fatura":{"faturaNo":"SF00001","faturaTipi":"SATIS","cariId":"770162db-e7ae-47bc-bebf-267607e8c24a","tarih":"2026-02-26T00:00:00.000Z","vade":"2026-03-05T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":22,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"22","kdvTutar":"4.4"}]}	\N	\N	2026-02-26 17:51:33.881
f1365a22-4a4f-40f1-94ca-cdc354c4771f	72fae57a-00bd-4d8d-ab4a-9a325f132724	5c81dff5-0ee8-4395-b655-138a4d0064b8	IPTAL	{"eskiDurum":"ONAYLANDI","yeniDurum":"IPTAL","irsaliyeIptal":true}	\N	\N	2026-02-26 17:51:45.165
c82c2cc2-726f-4e19-964e-63ae429f1b8d	72fae57a-00bd-4d8d-ab4a-9a325f132724	5c81dff5-0ee8-4395-b655-138a4d0064b8	UPDATE	{"faturaNo":"SF00001","tarih":"2026-02-26T00:00:00.000Z","vade":"2026-03-05T00:00:00.000Z","iskonto":0,"aciklama":null,"satisElemaniId":null,"dovizCinsi":"TRY","dovizKuru":1,"kalemler":[{"stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":22,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"22","kdvTutar":"4.4"}]}	\N	\N	2026-02-26 17:52:03.232
e9a82423-0e36-42c9-a2fe-59fcb1f3c09c	72fae57a-00bd-4d8d-ab4a-9a325f132724	5c81dff5-0ee8-4395-b655-138a4d0064b8	DURUM_DEGISIKLIK	{"eskiDurum":"IPTAL","yeniDurum":"ACIK"}	\N	\N	2026-02-26 17:52:03.434
fb0f1d08-a15a-4182-9d1c-f41d085c2166	72fae57a-00bd-4d8d-ab4a-9a325f132724	5c81dff5-0ee8-4395-b655-138a4d0064b8	DELETE	{"fatura":{"id":"72fae57a-00bd-4d8d-ab4a-9a325f132724","faturaNo":"SF00001","faturaTipi":"SATIS","tenantId":"clxyedekparca00001","cariId":"770162db-e7ae-47bc-bebf-267607e8c24a","tarih":"2026-02-26T00:00:00.000Z","vade":"2026-03-05T00:00:00.000Z","iskonto":"0","toplamTutar":"22","kdvTutar":"4.4","genelToplam":"26.4","dovizToplam":null,"dovizCinsi":"TRY","dovizKuru":"1","aciklama":null,"durum":"ACIK","odenecekTutar":"26.4","odenenTutar":"0","siparisNo":null,"purchaseOrderId":null,"satinAlmaSiparisiId":null,"deliveryNoteId":"fd4fbcf9-310d-4b38-b2bd-479073454dd2","satinAlmaIrsaliyeId":null,"efaturaStatus":"PENDING","efaturaEttn":null,"createdBy":"5c81dff5-0ee8-4395-b655-138a4d0064b8","updatedBy":"5c81dff5-0ee8-4395-b655-138a4d0064b8","deletedAt":null,"deletedBy":null,"createdAt":"2026-02-26T17:51:33.469Z","updatedAt":"2026-02-26T17:52:03.415Z","satisElemaniId":null,"warehouseId":"eb067e72-b52b-45fd-94d6-510cd5df7eba","cari":{"id":"770162db-e7ae-47bc-bebf-267607e8c24a","cariKodu":"C00028","tenantId":"clxyedekparca00001","unvan":"CAN KARDEŞLER OTO RADYATÖR","tip":"TEDARIKCI","sirketTipi":"KURUMSAL","vergiNo":"1980430011","vergiDairesi":"YÜREĞİR","tcKimlikNo":null,"isimSoyisim":null,"telefon":"03223216347","email":"cankardeslerradyator@hotmail.com","ulke":"Türkiye","il":null,"ilce":null,"adres":"Yüreğir, Adana","yetkili":"HARUN CAN","bakiye":"-3100","vadeSuresi":7,"aktif":true,"createdAt":"2026-02-05T09:57:38.226Z","updatedAt":"2026-02-26T17:51:45.127Z","satisElemaniId":null,"riskLimiti":null,"riskDurumu":"NORMAL","teminatTutar":null,"sektor":null,"ozelKod1":null,"ozelKod2":null,"webSite":null,"faks":null,"vadeGun":null,"paraBirimi":null,"bankaBilgileri":null},"irsaliye":{"id":"fd4fbcf9-310d-4b38-b2bd-479073454dd2","irsaliyeNo":"Sİ00001","depoId":"eb067e72-b52b-45fd-94d6-510cd5df7eba","kaynakSiparis":null},"satinAlmaIrsaliye":null,"kalemler":[{"id":"e0541a10-a5f9-4f85-9d1b-80286de6053a","faturaId":"72fae57a-00bd-4d8d-ab4a-9a325f132724","stokId":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","miktar":1,"birimFiyat":"22","kdvOrani":20,"kdvTutar":"4.4","tutar":"22","iskontoOrani":"0","iskontoTutari":"0","raf":null,"purchaseOrderItemId":null,"createdAt":"2026-02-26T17:52:03.179Z","stok":{"id":"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3","stokKodu":"83414188","tenantId":"clxyedekparca00001","stokAdi":"SİLİNDİR KAPAK CONTASI CORSA D A13DTC","aciklama":null,"birim":"Adet","alisFiyati":"0","satisFiyati":"0","kdvOrani":20,"kritikStokMiktari":0,"kategori":"MOTOR GRUBU","anaKategori":"MOTOR GRUBU","altKategori":null,"marka":"CORTECO","model":null,"oem":"55209072","olcu":null,"raf":null,"barkod":null,"tedarikciKodu":null,"esdegerGrupId":null,"aracMarka":null,"aracModel":null,"aracMotorHacmi":null,"aracYakitTipi":null,"sadeceKategoriTanimi":false,"sadeceMarkaTanimi":false,"createdAt":"2026-02-20T12:18:34.924Z","updatedAt":"2026-02-20T12:18:34.924Z"}}],"createdByUser":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"},"updatedByUser":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"},"deletedByUser":null,"logs":[{"id":"e9a82423-0e36-42c9-a2fe-59fcb1f3c09c","faturaId":"72fae57a-00bd-4d8d-ab4a-9a325f132724","userId":"5c81dff5-0ee8-4395-b655-138a4d0064b8","actionType":"DURUM_DEGISIKLIK","changes":"{\\"eskiDurum\\":\\"IPTAL\\",\\"yeniDurum\\":\\"ACIK\\"}","ipAddress":null,"userAgent":null,"createdAt":"2026-02-26T17:52:03.434Z","user":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"}},{"id":"c82c2cc2-726f-4e19-964e-63ae429f1b8d","faturaId":"72fae57a-00bd-4d8d-ab4a-9a325f132724","userId":"5c81dff5-0ee8-4395-b655-138a4d0064b8","actionType":"UPDATE","changes":"{\\"faturaNo\\":\\"SF00001\\",\\"tarih\\":\\"2026-02-26T00:00:00.000Z\\",\\"vade\\":\\"2026-03-05T00:00:00.000Z\\",\\"iskonto\\":0,\\"aciklama\\":null,\\"satisElemaniId\\":null,\\"dovizCinsi\\":\\"TRY\\",\\"dovizKuru\\":1,\\"kalemler\\":[{\\"stokId\\":\\"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3\\",\\"miktar\\":1,\\"birimFiyat\\":22,\\"kdvOrani\\":20,\\"iskontoOrani\\":\\"0\\",\\"iskontoTutari\\":\\"0\\",\\"tutar\\":\\"22\\",\\"kdvTutar\\":\\"4.4\\"}]}","ipAddress":null,"userAgent":null,"createdAt":"2026-02-26T17:52:03.232Z","user":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"}},{"id":"f1365a22-4a4f-40f1-94ca-cdc354c4771f","faturaId":"72fae57a-00bd-4d8d-ab4a-9a325f132724","userId":"5c81dff5-0ee8-4395-b655-138a4d0064b8","actionType":"IPTAL","changes":"{\\"eskiDurum\\":\\"ONAYLANDI\\",\\"yeniDurum\\":\\"IPTAL\\",\\"irsaliyeIptal\\":true}","ipAddress":null,"userAgent":null,"createdAt":"2026-02-26T17:51:45.165Z","user":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"}},{"id":"f4bdcc15-ad72-4e5b-b9a9-2a52a07d8896","faturaId":"72fae57a-00bd-4d8d-ab4a-9a325f132724","userId":"5c81dff5-0ee8-4395-b655-138a4d0064b8","actionType":"CREATE","changes":"{\\"fatura\\":{\\"faturaNo\\":\\"SF00001\\",\\"faturaTipi\\":\\"SATIS\\",\\"cariId\\":\\"770162db-e7ae-47bc-bebf-267607e8c24a\\",\\"tarih\\":\\"2026-02-26T00:00:00.000Z\\",\\"vade\\":\\"2026-03-05T00:00:00.000Z\\",\\"iskonto\\":0,\\"aciklama\\":null,\\"durum\\":\\"ONAYLANDI\\",\\"dovizCinsi\\":\\"TRY\\",\\"dovizKuru\\":1},\\"kalemler\\":[{\\"stokId\\":\\"46e0cebb-5d0c-4975-bf12-ec9b901f0ae3\\",\\"miktar\\":1,\\"birimFiyat\\":22,\\"kdvOrani\\":20,\\"iskontoOrani\\":\\"0\\",\\"iskontoTutari\\":\\"0\\",\\"tutar\\":\\"22\\",\\"kdvTutar\\":\\"4.4\\"}]}","ipAddress":null,"userAgent":null,"createdAt":"2026-02-26T17:51:33.881Z","user":{"id":"5c81dff5-0ee8-4395-b655-138a4d0064b8","fullName":"Gökmen","username":"gökmen"}}]}}	\N	\N	2026-02-26 17:52:19.72
\.


--
-- Data for Name: fatura_tahsilatlar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fatura_tahsilatlar (id, "faturaId", "tahsilatId", tutar, "createdAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: faturalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faturalar (id, "faturaNo", "faturaTipi", "tenantId", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", "dovizToplam", "dovizCinsi", "dovizKuru", aciklama, durum, "odenecekTutar", "odenenTutar", "siparisNo", "purchaseOrderId", "satinAlmaSiparisiId", "deliveryNoteId", "satinAlmaIrsaliyeId", "efaturaStatus", "efaturaEttn", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "satisElemaniId", "warehouseId") FROM stdin;
27d423c2-4263-4f33-83b5-7965051d5105	AIF-2026-001	ALIS_IADE	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-04 00:00:00	2026-03-06 00:00:00	0.00	202.98	40.60	243.58	\N	TRY	1.0000	AF-2026-034 nolu faturanın iadesi	ONAYLANDI	243.58	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	2026-02-04 09:16:58.776	56fdab02-13ad-4441-b755-862f88d6e7cb	2026-02-04 09:16:52.129	2026-02-04 09:16:58.777	\N	\N
62f01321-b1f1-47c8-8936-1dac055cfb71	AF-2026-035	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-28 00:00:00	2026-03-06 00:00:00	0.00	4199.42	839.88	5039.30	\N	TRY	1.0000	\N	ONAYLANDI	5039.30	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 09:49:37.832	2026-02-04 09:49:37.832	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
6d13a5e3-e41b-4a7b-ba58-50dbc969c279	AF-2026-036	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-28 00:00:00	2026-03-06 00:00:00	0.00	12217.45	2443.49	14660.94	\N	TRY	1.0000	\N	ONAYLANDI	14660.94	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 10:57:38.756	2026-02-04 10:57:38.756	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
72fae57a-00bd-4d8d-ab4a-9a325f132724	SF00001	SATIS	clxyedekparca00001	770162db-e7ae-47bc-bebf-267607e8c24a	2026-02-26 00:00:00	2026-03-05 00:00:00	0.00	22.00	4.40	26.40	\N	TRY	1.0000	\N	ACIK	26.40	0.00	\N	\N	\N	fd4fbcf9-310d-4b38-b2bd-479073454dd2	\N	PENDING	\N	5c81dff5-0ee8-4395-b655-138a4d0064b8	5c81dff5-0ee8-4395-b655-138a4d0064b8	2026-02-26 17:52:19.708	5c81dff5-0ee8-4395-b655-138a4d0064b8	2026-02-26 17:51:33.469	2026-02-26 17:52:19.71	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
ac41e6e5-ef25-49f5-80ac-0086451b9cbb	AF-2026-038	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-30 00:00:00	2026-03-06 00:00:00	0.00	622.65	124.53	747.18	\N	TRY	1.0000	\N	ONAYLANDI	747.18	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 11:03:06.882	2026-02-04 11:03:06.882	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
6f4daa76-ac03-4a4e-bac9-8826870466e4	AF-2026-040	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-02 00:00:00	2026-03-06 00:00:00	0.00	246.92	49.38	296.30	\N	TRY	1.0000	\N	ONAYLANDI	296.30	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 11:11:19.407	2026-02-04 11:11:19.407	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
2a5d6c44-b75d-4f23-aa15-55d6727fbd89	AF-2026-042	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-29 00:00:00	2026-03-06 00:00:00	0.00	2280.52	456.10	2736.62	\N	TRY	1.0000	\N	ONAYLANDI	2736.62	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 14:35:51.255	2026-02-04 14:35:51.255	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
c9b8caf5-9079-49e8-9892-ccad8786df64	AF-2026-043	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-03 00:00:00	2026-03-06 00:00:00	0.00	597.05	119.41	716.46	\N	TRY	1.0000	\N	ONAYLANDI	716.46	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 14:39:16.275	2026-02-04 14:39:16.275	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
92304431-9901-48d8-a1d1-6f03b602ce87	AF-2026-065	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-25 00:00:00	2026-03-12 00:00:00	0.00	46842.28	0.00	46842.28	\N	TRY	1.0000	\N	ONAYLANDI	4688.59	42153.69	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-10 12:25:34.78	2026-02-17 08:37:19.5	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
5f7a6376-ed26-4fb5-9084-38ac019a0ded	AF-2026-087	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-12 00:00:00	2026-03-19 00:00:00	0.00	881.67	176.33	1058.00	\N	TRY	1.0000	\N	ONAYLANDI	1058.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 09:00:20.119	2026-02-17 09:00:20.119	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
097669f6-da76-42c3-acb1-f29452d7d1ff	AF-2026-045	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-04 00:00:00	2026-03-06 00:00:00	0.00	2695.55	539.11	3234.66	\N	TRY	1.0000	\N	ONAYLANDI	3234.66	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 15:06:07.076	2026-02-04 15:06:07.076	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
33c43352-1d68-44c9-8e7d-fcba73371a35	AF-2026-046	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-04 00:00:00	2026-03-06 00:00:00	0.00	366.66	73.33	439.99	\N	TRY	1.0000	\N	ONAYLANDI	439.99	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 15:10:07.953	2026-02-04 15:10:07.953	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
ef2346bf-a2c5-4df2-a856-4ce0ade012af	AF-2026-048	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-29 00:00:00	2026-03-07 00:00:00	0.00	2093.05	418.61	2511.66	\N	TRY	1.0000	\N	ONAYLANDI	2511.66	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 06:50:29.407	2026-02-05 06:50:29.407	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
e9e8e245-3f73-43b9-ad79-819a72d483ce	AF-2026-050	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-28 00:00:00	2026-03-07 00:00:00	0.00	442.79	88.56	531.35	\N	TRY	1.0000	\N	ONAYLANDI	531.35	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:36:20.512	2026-02-05 07:36:20.512	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
fc9877c0-6957-42b4-bb39-260b8791ed61	AF-2026-052	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-28 00:00:00	2026-03-07 00:00:00	0.00	477.48	95.50	572.98	\N	TRY	1.0000	\N	ONAYLANDI	572.98	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:48:14.149	2026-02-05 07:48:14.149	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
ce905093-f9ce-43c2-82ec-84ad6c2436ee	AF-2026-053	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-19 00:00:00	2026-03-07 00:00:00	0.00	1348.84	269.77	1618.61	\N	TRY	1.0000	\N	ONAYLANDI	1618.61	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:51:24.235	2026-02-05 07:51:24.235	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
fbccca25-73b0-4a8d-8425-109e02c35e53	AF-2026-055	ALIS	clxyedekparca00001	770162db-e7ae-47bc-bebf-267607e8c24a	2026-02-02 00:00:00	2026-03-07 00:00:00	0.00	2583.33	516.67	3100.00	\N	TRY	1.0000	\N	ONAYLANDI	3100.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 10:00:29.94	2026-02-05 10:00:29.94	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
6b262abc-774e-43e6-b53e-a9f9a496f087	AF-2026-057	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-05 00:00:00	2026-03-08 00:00:00	0.00	1729.81	345.96	2075.77	\N	TRY	1.0000	\N	ONAYLANDI	2075.77	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-06 05:40:38.356	2026-02-06 05:40:38.356	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
4f0dfe2f-f013-4146-9d52-f5ddfa4dd36c	AF-2026-058	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-05 00:00:00	2026-03-08 00:00:00	0.00	233.86	46.77	280.63	\N	TRY	1.0000	\N	ONAYLANDI	280.63	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-06 05:41:20.562	2026-02-06 05:41:20.562	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
9ffaf809-528b-4b41-80fa-a5f3b51332a2	AF-2026-028	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-24 00:00:00	2026-02-28 00:00:00	0.00	23202.80	4640.56	27843.36	\N	TRY	1.0000	\N	ONAYLANDI	27843.32	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-29 05:56:02.843	2026-02-06 08:21:54.629	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
9c15716c-2c70-4841-8478-65ac03a55833	AF-2026-074	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	493.79	98.76	592.55	\N	TRY	1.0000	\N	ONAYLANDI	592.55	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 06:03:05.795	2026-02-12 06:03:05.795	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
eaf200e2-41f6-43b1-a309-48457cf894aa	AF-2026-060	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-05 00:00:00	2026-03-08 00:00:00	0.00	1174.17	234.83	1409.00	\N	TRY	1.0000	\N	ONAYLANDI	1409.01	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-02-06 08:03:05.059	2026-02-06 10:07:58.01	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
22679734-95f9-4d3a-94a5-7b9cc1e605a5	AF-2026-013	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-02 00:00:00	2026-02-22 00:00:00	0.00	353.29	70.66	423.95	\N	TRY	1.0000	\N	ONAYLANDI	423.95	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 07:40:14.463	2026-02-06 10:11:56.017	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
1005ff31-855b-4bf5-89d3-c1a4b8c9f475	AF-2026-077	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	637.60	127.52	765.12	\N	TRY	1.0000	\N	ONAYLANDI	765.12	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:15:08.268	2026-02-12 07:15:08.268	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
0b7dbf09-3f54-4eca-b810-c7b703ecf261	AF-2026-066	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-13 00:00:00	0.00	545.28	109.06	654.34	\N	TRY	1.0000	\N	ONAYLANDI	654.34	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 07:09:27.398	2026-02-11 07:09:27.398	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
e69ffcda-c62f-4bd4-9db1-2e7d435ee264	AF-2026-068	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-09 00:00:00	2026-03-13 00:00:00	0.00	1268.80	253.76	1522.56	\N	TRY	1.0000	\N	ONAYLANDI	1522.56	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 07:53:47.454	2026-02-11 07:53:47.454	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
4d769bfd-4865-4979-8e18-75497a8ec2d5	AF-2026-070	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-27 00:00:00	2026-03-13 00:00:00	0.00	15871.24	3174.25	19045.49	\N	TRY	1.0000	\N	ONAYLANDI	19045.49	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 09:26:22.462	2026-02-11 09:26:22.462	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
f382114b-c735-4d75-91c0-bd37821290e5	AF-2026-072	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-10 00:00:00	2026-03-13 00:00:00	0.00	1637.22	327.44	1964.66	\N	TRY	1.0000	\N	ONAYLANDI	1964.66	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 09:33:09.535	2026-02-11 09:33:09.535	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b0ca9c58-4ea0-4275-99ea-2fc3e5de331a	AF-2026-080	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	347.09	69.42	416.51	\N	TRY	1.0000	\N	ONAYLANDI	416.51	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:20:59.584	2026-02-12 07:20:59.584	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
39234ec2-27d0-4250-87ac-7df89c8ded91	AF-2026-082	ALIS	clxyedekparca00001	b90aeab6-aad0-4c13-907c-69625d2da38f	2026-02-12 00:00:00	2026-03-14 00:00:00	0.00	43560.00	0.00	43560.00	\N	TRY	1.0000	\N	ONAYLANDI	43560.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 09:43:22.446	2026-02-12 09:43:22.446	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
d8f5348c-99c6-41ac-bdc8-9854fbbd2e92	AF-2026-084	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-28 00:00:00	2026-03-14 00:00:00	0.00	2429.04	485.81	2914.85	\N	TRY	1.0000	\N	ONAYLANDI	2914.85	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 11:33:04.492	2026-02-12 11:33:04.492	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
0c10af76-3f53-41d8-a002-6fa04ee79c98	AF-2026-086	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-12 00:00:00	2026-03-14 00:00:00	0.00	516.03	103.21	619.24	\N	TRY	1.0000	\N	ONAYLANDI	619.24	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 14:44:07.367	2026-02-12 14:44:07.367	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
bfb6e656-eec4-4226-a59f-dcfcdb5378b5	AF-2026-019	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-10-29 00:00:00	2026-02-22 00:00:00	0.00	2431.16	486.23	2917.39	\N	TRY	1.0000	\N	KAPALI	0.00	2917.39	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 08:41:30.834	2026-02-17 08:37:19.481	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
11b64864-8581-4fcc-9c99-f823acf82786	AF-2026-020	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-10-29 00:00:00	2026-02-22 00:00:00	0.00	789.11	157.82	946.93	\N	TRY	1.0000	\N	KAPALI	0.00	946.93	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 08:43:57.146	2026-02-17 08:37:19.484	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
81ffa19e-38e0-40f9-a4c0-e5bfb3e806bf	AF-2026-002	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-20 00:00:00	2026-02-22 00:00:00	0.00	2020.28	404.06	2424.34	\N	TRY	1.0000	\N	ONAYLANDI	2424.35	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 06:24:14.124	2026-02-06 08:07:23.97	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
45b17698-5d83-4482-9e9a-f6a5419bc881	AF-2026-003	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-20 00:00:00	2026-02-22 00:00:00	0.00	630.70	126.14	756.84	\N	TRY	1.0000	\N	ONAYLANDI	757.06	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 06:37:23.631	2026-02-06 08:07:46.669	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
1a9fc05c-7d97-469b-b87c-aa127e8c31e8	AF-2026-004	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-25 00:00:00	2026-02-22 00:00:00	0.00	616.60	123.32	739.92	\N	TRY	1.0000	\N	ONAYLANDI	739.86	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:00:30.367	2026-02-06 08:08:03.386	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
d95504cb-6345-4eef-b204-56846ca6c78f	AF-2026-005	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-04 00:00:00	2026-02-22 00:00:00	0.00	20148.20	4029.64	24177.84	\N	TRY	1.0000	\N	ONAYLANDI	24177.18	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:10:47.544	2026-02-06 08:08:18.898	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
f359d287-b571-4266-a6e5-bf2df8c8616e	AF-2026-007	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-22 00:00:00	2026-02-22 00:00:00	0.00	309.95	61.99	371.94	\N	TRY	1.0000	\N	ONAYLANDI	371.94	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:18:34.974	2026-02-06 08:08:50.943	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
9d83a36a-2e52-4066-96ed-8f44696a3cbd	AF-2026-008	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-02 00:00:00	2026-02-22 00:00:00	0.00	47.85	9.57	57.42	\N	TRY	1.0000	\N	ONAYLANDI	57.42	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:19:22.391	2026-02-06 08:09:31.874	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
3c4eff49-e72e-4471-b71f-f8fbb93355f2	AF-2026-009	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-22 00:00:00	2026-02-22 00:00:00	0.00	124.55	24.91	149.46	\N	TRY	1.0000	\N	ONAYLANDI	149.46	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:20:17.834	2026-02-06 08:09:46.328	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
22e720c0-9936-4aa5-b7b1-b27600fadcf6	AF-2026-010	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-05 00:00:00	2026-02-22 00:00:00	0.00	4883.24	976.65	5859.89	\N	TRY	1.0000	\N	ONAYLANDI	5859.90	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:23:02.662	2026-02-06 08:10:15.753	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
9146751f-47c2-413f-a5f1-2222c2d4cacb	AF-2026-031	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-01 00:00:00	2026-03-06 00:00:00	0.00	4905.00	0.00	4905.00	\N	TRY	1.0000	\N	ONAYLANDI	4590.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-02-04 07:00:31.725	2026-02-12 10:09:11.081	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
2bdb1750-1f17-4167-8008-6cd015c67753	AF-2026-014	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-27 00:00:00	2026-02-22 00:00:00	0.00	11211.58	2242.32	13453.90	\N	TRY	1.0000	\N	ONAYLANDI	13453.90	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 07:44:42.15	2026-02-06 10:12:02.164	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
619a484d-e247-43ea-9fde-6f49b7b329ba	AF-2026-015	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-27 00:00:00	2026-02-22 00:00:00	0.00	555.91	111.18	667.09	\N	TRY	1.0000	\N	ONAYLANDI	667.08	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 07:46:13.309	2026-02-06 10:12:08.669	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
5bf3353e-83c9-479d-af7a-7749b35fa78c	AF-2026-012	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-27 00:00:00	2026-02-22 00:00:00	0.00	13488.56	2697.71	16186.27	\N	TRY	1.0000	\N	ONAYLANDI	16186.28	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 07:38:33.992	2026-02-09 19:47:09.115	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
af5a2713-c17e-447f-acc5-654ef6bb93ab	AF-2026-022	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-20 00:00:00	2026-02-23 00:00:00	0.00	12111.30	2422.26	14533.56	\N	TRY	1.0000	\N	ONAYLANDI	14533.45	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 06:49:11.984	2026-02-06 08:13:02.389	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
36cf52c7-0d12-49ef-bb93-e10fa856669c	AF-2026-024	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-25 00:00:00	2026-02-23 00:00:00	0.00	1366.38	273.28	1639.66	\N	TRY	1.0000	\N	ONAYLANDI	1639.65	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 07:01:55.041	2026-02-06 08:14:48.459	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b9ef9f5a-7123-4e88-813f-d519a76ba326	AF-2026-023	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-09 00:00:00	2026-02-23 00:00:00	0.00	3519.01	703.80	4222.81	\N	TRY	1.0000	\N	ONAYLANDI	4222.80	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 06:51:30.101	2026-02-06 08:13:50.641	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
fa3a784b-a248-4175-9110-51b0d2ac220d	AF-2026-025	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-27 00:00:00	2026-02-23 00:00:00	0.00	8893.96	1778.79	10672.75	\N	TRY	1.0000	\N	ONAYLANDI	10672.75	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 07:05:39.131	2026-02-06 08:15:02.529	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
27c3b872-5701-4ee5-b358-11ae9dcbc55b	AF-2026-026	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-19 00:00:00	2026-02-23 00:00:00	0.00	46250.28	0.00	46250.28	\N	TRY	1.0000	\N	ONAYLANDI	46250.29	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 10:59:17.027	2026-02-06 08:15:43.94	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
65754286-1f74-4901-940a-0f92b6fd20ad	AF-2026-027	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-18 00:00:00	2026-02-26 00:00:00	0.00	2871.23	0.00	2871.23	\N	TRY	1.0000	\N	ONAYLANDI	2871.21	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-27 14:06:06.782	2026-02-06 08:16:58.755	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
efb502d9-e6e8-4043-8e52-bdefa5fb5c0e	AF-2026-029	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-03 00:00:00	2026-02-28 00:00:00	0.00	62133.49	0.00	62133.49	\N	TRY	1.0000	\N	ONAYLANDI	62133.49	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-29 06:23:47.347	2026-02-06 08:22:20.883	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
89d7bcc1-4398-4ce2-8ace-72d63eb26c30	AF-2026-011	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-22 00:00:00	2026-02-22 00:00:00	0.00	419.62	83.92	503.54	\N	TRY	1.0000	\N	ONAYLANDI	503.54	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 07:23:50.087	2026-02-06 10:11:40.795	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
da0aa815-b036-442e-8372-38a578166804	AF-2026-016	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-10-29 00:00:00	2026-02-22 00:00:00	0.00	17065.09	3413.02	20478.11	\N	TRY	1.0000	\N	KAPALI	0.00	20478.11	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 08:29:26.187	2026-02-17 08:37:19.467	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
915edccb-0e01-4434-95b3-ff9d05c8ad25	AF-2026-030	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-01 00:00:00	2026-03-05 00:00:00	0.00	4300.00	0.00	4300.00	\N	TRY	1.0000	\N	ONAYLANDI	4300.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-03 14:56:19.556	2026-02-03 14:56:19.556	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
d8fc7034-4f20-4215-a08c-4737aeac0a06	AF-2026-032	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-01 00:00:00	2026-03-06 00:00:00	0.00	4789.00	0.00	4789.00	\N	TRY	1.0000	\N	ONAYLANDI	4789.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 08:00:28.747	2026-02-04 08:00:28.747	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b2a3e36c-cdb9-4728-a88b-482201c1760d	AF-2026-033	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-27 00:00:00	2026-03-06 00:00:00	0.00	874.49	174.90	1049.39	\N	TRY	1.0000	\N	ONAYLANDI	1049.39	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 09:10:34.26	2026-02-04 09:10:34.26	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
08aaf1d0-0a52-4dbc-8217-92344681fb12	AF-2026-067	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-09 00:00:00	2026-03-13 00:00:00	0.00	1132.81	226.56	1359.37	\N	TRY	1.0000	\N	ONAYLANDI	1359.37	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 07:50:04.527	2026-02-11 07:50:04.527	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
c8af63c6-3706-47d1-82d1-4a4ef6bcfc34	AF-2026-069	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-07 00:00:00	2026-03-13 00:00:00	0.00	448.72	89.74	538.46	\N	TRY	1.0000	\N	ONAYLANDI	538.46	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 07:56:11.878	2026-02-11 07:56:11.878	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
001bd6d3-cff2-4d1f-8128-d379d2048bb0	AF-2026-071	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-09 00:00:00	2026-03-13 00:00:00	0.00	1072.51	214.50	1287.01	\N	TRY	1.0000	\N	ONAYLANDI	1287.01	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 09:31:16.943	2026-02-11 09:31:16.943	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
e15b6509-505a-456b-88a6-ebc36867fad3	AF-2026-073	ALIS	clxyedekparca00001	60c3b6e3-0504-4cf2-8582-6f951185229c	2026-02-11 00:00:00	2026-03-13 00:00:00	0.00	8333.33	1666.67	10000.00	\N	TRY	1.0000	\N	ONAYLANDI	10000.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-11 09:52:45.66	2026-02-11 09:52:45.66	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
9d698ef5-769a-4575-a3fc-ba10ac117d93	AF-2026-075	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-11 00:00:00	2026-03-14 00:00:00	0.00	2679.74	535.95	3215.69	\N	TRY	1.0000	\N	ONAYLANDI	3215.69	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:10:33.189	2026-02-12 07:10:33.189	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
3b4219b8-f79c-463a-9602-ddb6becf8dac	AF-2026-076	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	1447.68	289.54	1737.22	\N	TRY	1.0000	\N	ONAYLANDI	1737.22	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:13:14.711	2026-02-12 07:13:14.711	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
200624df-b0e4-4dd8-9178-98ded8ea84ed	AF-2026-078	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	214.37	42.87	257.24	\N	TRY	1.0000	\N	ONAYLANDI	257.24	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:17:13.791	2026-02-12 07:17:13.791	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
da6eb70c-c555-4cf3-8249-5e2f96881d9d	AF-2026-079	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-10 00:00:00	2026-03-14 00:00:00	0.00	1888.21	377.64	2265.85	\N	TRY	1.0000	\N	ONAYLANDI	2265.85	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 07:19:36.02	2026-02-12 07:19:36.02	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
a0fcf5ce-e0d4-4ffc-925a-3b5599b726a1	AF-2026-034	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-27 00:00:00	2026-03-06 00:00:00	0.00	202.98	40.60	243.58	\N	TRY	1.0000	\N	ONAYLANDI	243.58	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-02-04 09:15:34.396	2026-02-04 10:16:18.011	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
a460b393-2242-474c-8f15-482780dcc0bd	AF-2026-037	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-29 00:00:00	2026-03-06 00:00:00	0.00	707.58	141.52	849.10	\N	TRY	1.0000	\N	ONAYLANDI	849.10	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 11:01:37.1	2026-02-04 11:01:37.1	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
0b290904-3713-42f4-a2a9-435d4fa9536d	AF-2026-039	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-31 00:00:00	2026-03-06 00:00:00	0.00	1141.98	228.40	1370.38	\N	TRY	1.0000	\N	ONAYLANDI	1370.38	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 11:09:10.538	2026-02-04 11:09:10.538	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
eabf2c9c-77e8-4398-8262-777d75beabe9	AF-2026-041	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-28 00:00:00	2026-03-06 00:00:00	0.00	246.14	49.23	295.37	\N	TRY	1.0000	\N	ONAYLANDI	295.37	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 14:14:03.187	2026-02-04 14:14:03.187	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
27185454-2b8f-4d7b-8df5-4aec466a46fa	AF-2026-044	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-04 00:00:00	2026-03-06 00:00:00	0.00	717.66	143.53	861.19	\N	TRY	1.0000	\N	ONAYLANDI	861.19	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-04 14:59:31.791	2026-02-04 14:59:31.791	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
e9cda23d-6fc1-41bf-920f-27af25091651	AF-2026-047	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-04 00:00:00	2026-03-07 00:00:00	0.00	502.45	100.49	602.94	\N	TRY	1.0000	\N	ONAYLANDI	602.94	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 05:54:01.158	2026-02-05 05:54:01.158	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
63e2a4ba-be8b-4002-ba0c-2c6cb6f0ee9f	AF-2026-049	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-29 00:00:00	2026-03-07 00:00:00	0.00	10009.40	2001.88	12011.28	\N	TRY	1.0000	\N	ONAYLANDI	12011.28	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:34:41.727	2026-02-05 07:34:41.727	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
2f097f1f-8935-42be-8eac-42a53637b491	AF-2026-051	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-01-28 00:00:00	2026-03-07 00:00:00	0.00	2170.81	434.16	2604.97	\N	TRY	1.0000	\N	ONAYLANDI	2604.97	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:42:00.696	2026-02-05 07:42:00.696	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b1e0a297-f604-4a60-a43b-639745db7654	AF-2026-054	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-03 00:00:00	2026-03-07 00:00:00	0.00	2213.38	442.68	2656.06	\N	TRY	1.0000	\N	ONAYLANDI	2656.06	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 07:54:43.747	2026-02-05 07:54:43.747	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
4b395fbc-ae8a-4635-a830-736d38301a58	AF-2026-056	ALIS	clxyedekparca00001	6cb993f2-2b92-44aa-9322-23532f8a6be2	2026-01-29 00:00:00	2026-03-07 00:00:00	0.00	4709.90	941.98	5651.88	\N	TRY	1.0000	\N	ONAYLANDI	5651.88	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-05 10:59:27.968	2026-02-05 10:59:27.968	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
016cbcdd-debe-418c-808a-0e0f7ec2218a	AF-2026-059	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-05 00:00:00	2026-03-08 00:00:00	0.00	2060.34	412.07	2472.41	\N	TRY	1.0000	\N	ONAYLANDI	2472.41	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-06 07:59:44.167	2026-02-06 07:59:44.167	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
21d8524a-4108-44d1-9a0e-7f9511118324	AF-2026-006	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-22 00:00:00	2026-02-22 00:00:00	0.00	50.79	10.16	60.95	\N	TRY	1.0000	\N	ONAYLANDI	60.95	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-23 07:17:08.265	2026-02-06 08:08:34.187	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
bd21d5ec-36bc-47fd-9ad2-a46ea4bc19e2	AF-2026-021	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-12-24 00:00:00	2026-02-23 00:00:00	0.00	507.65	101.53	609.18	\N	TRY	1.0000	\N	ONAYLANDI	609.18	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-24 06:46:39.78	2026-02-06 08:12:46.318	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
104846f4-439f-45a7-b879-0d8e946233f9	AF-2026-083	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-09 00:00:00	2026-03-14 00:00:00	0.00	3879.09	775.82	4654.91	\N	TRY	1.0000	\N	ONAYLANDI	4654.91	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 10:24:48.749	2026-02-12 10:24:48.749	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
16b0978f-312e-4655-90ea-9430bc2dd832	AF-2026-061	ALIS	clxyedekparca00001	ccf7592c-c2c1-4179-b1f7-7bc3cdfe4ec1	2026-02-07 00:00:00	2026-03-09 00:00:00	0.00	21300.00	4260.00	25560.00	\N	TRY	1.0000	\N	ONAYLANDI	25560.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-07 08:54:34.292	2026-02-07 08:54:34.292	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
3dac9888-e5e8-460f-9a08-16922c235833	AF-2026-001	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-01-21 00:00:00	2026-02-20 00:00:00	0.00	106391.00	0.00	106391.00	\N	TRY	1.0000	\N	ONAYLANDI	97141.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-01-21 12:49:55.163	2026-02-12 07:35:15.635	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
8eb0cfe3-902f-4b20-a164-333f3c950a59	AF-2026-081	ALIS	clxyedekparca00001	b90aeab6-aad0-4c13-907c-69625d2da38f	2026-02-12 00:00:00	2026-03-14 00:00:00	0.00	49140.00	0.00	49140.00	\N	TRY	1.0000	\N	ONAYLANDI	49140.00	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 09:16:53.728	2026-02-12 09:16:53.728	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
0125ef28-f199-42fb-9bbb-a999b45fd429	AF-2026-085	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-01-28 00:00:00	2026-03-14 00:00:00	0.00	5360.36	1072.07	6432.43	\N	TRY	1.0000	\N	ONAYLANDI	6432.43	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-12 11:41:28.868	2026-02-12 11:41:28.868	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
0d6cc39c-80da-49a4-9be5-1d9dc8b90aae	AF-2026-017	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-10-29 00:00:00	2026-02-22 00:00:00	0.00	6389.14	1277.83	7666.97	\N	TRY	1.0000	\N	KAPALI	0.00	7666.97	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 08:35:11.99	2026-02-17 08:37:19.472	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
45cd8e54-fd47-4626-9da9-dd40d776889e	AF-2026-018	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-10-29 00:00:00	2026-02-22 00:00:00	0.00	2261.68	452.34	2714.02	\N	TRY	1.0000	\N	KAPALI	0.00	2714.02	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	2026-01-23 08:37:17.084	2026-02-17 08:37:19.477	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
380e9882-8c75-4790-9ef2-44a2df4bf4be	AF-2026-064	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-25 00:00:00	2026-03-12 00:00:00	0.00	17619.66	0.00	17619.66	\N	TRY	1.0000	\N	ONAYLANDI	0.00	17619.66	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-02-10 10:26:38.342	2026-02-17 09:02:59.873	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
08cfb568-ab9a-4988-b354-dc9c70e8a9fa	AF-2026-063	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-25 00:00:00	2026-03-12 00:00:00	0.00	32984.39	0.00	32984.39	\N	TRY	1.0000	\N	ONAYLANDI	0.00	32984.39	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-02-10 09:28:53.592	2026-02-17 09:03:06.746	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
1b051c02-2fbe-45a0-992f-eb461bcb1c22	AF-2026-088	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-14 00:00:00	2026-03-19 00:00:00	0.00	44.23	8.85	53.08	\N	TRY	1.0000	\N	ONAYLANDI	53.08	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 10:55:56.711	2026-02-17 10:55:56.711	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
8c4d32bf-525e-4059-8da5-16c9fdb4647b	AF-2026-089	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-16 00:00:00	2026-03-19 00:00:00	0.00	497.67	99.53	597.20	\N	TRY	1.0000	\N	ONAYLANDI	597.20	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 10:58:43.914	2026-02-17 10:58:43.914	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b267095c-2b27-44e4-957b-8c260158549c	AF-2026-090	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-16 00:00:00	2026-03-19 00:00:00	0.00	206.73	41.35	248.08	\N	TRY	1.0000	\N	ONAYLANDI	248.08	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 11:10:10.749	2026-02-17 11:10:10.749	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
80698f44-b35e-49c3-92e3-3319fa783b9a	AF-2026-091	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-14 00:00:00	2026-03-19 00:00:00	0.00	383.92	76.78	460.70	\N	TRY	1.0000	\N	ONAYLANDI	460.70	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 11:15:29.532	2026-02-17 11:15:29.532	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
55ff7629-ebad-4a1a-bfdf-0f87b9f25fe6	AF-2026-092	ALIS	clxyedekparca00001	9d9060ca-9249-40d5-b6aa-3d81f870cecf	2026-02-12 00:00:00	2026-03-19 00:00:00	0.00	1697.08	339.42	2036.50	\N	TRY	1.0000	\N	ONAYLANDI	2036.50	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-17 11:18:03.745	2026-02-17 11:18:03.745	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
a9e3c6f7-6933-415c-bf53-7dc0dc1686a1	AF-2026-093	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-17 00:00:00	2026-03-20 00:00:00	0.00	313.75	62.75	376.50	\N	TRY	1.0000	\N	ONAYLANDI	376.50	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-18 06:08:47.64	2026-02-18 06:08:47.64	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
591e5108-cbb5-4316-90e8-4df643a26dfc	AF-2026-094	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-17 00:00:00	2026-03-20 00:00:00	0.00	847.65	169.53	1017.18	\N	TRY	1.0000	\N	ONAYLANDI	1017.18	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-18 08:28:45.202	2026-02-18 08:28:45.202	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
fd77da08-fca0-4c0e-8767-d12791d152fa	AF-2026-095	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-16 00:00:00	2026-03-20 00:00:00	0.00	558.93	111.79	670.72	\N	TRY	1.0000	\N	ONAYLANDI	670.72	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-18 08:31:52.23	2026-02-18 08:31:52.23	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
ecd0f330-ba9d-4e4c-b35e-05b797ddbbb9	AF-2026-096	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-18 00:00:00	2026-03-20 00:00:00	0.00	795.47	159.09	954.56	\N	TRY	1.0000	\N	ONAYLANDI	954.56	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-18 08:34:54.198	2026-02-18 08:34:54.198	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
38645c60-20ef-4b54-bba9-accb7c6fedcc	AF-2026-097	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-17 00:00:00	2026-03-21 00:00:00	0.00	734.54	146.91	881.45	\N	TRY	1.0000	\N	ONAYLANDI	881.45	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-19 09:34:25.342	2026-02-19 09:34:25.342	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
88e26545-b810-4076-9e44-5b6908bef7f5	AF-2026-062	ALIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2025-11-25 00:00:00	2026-03-12 00:00:00	0.00	22518.87	0.00	22518.87	\N	TRY	1.0000	\N	ONAYLANDI	0.00	22518.84	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	2026-02-10 07:11:28.996	2026-02-19 11:06:22.874	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
c8255fc3-725d-4e9b-a408-ec2c39315eab	AF-2026-098	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-19 00:00:00	2026-03-22 00:00:00	0.00	1908.68	381.74	2290.42	\N	TRY	1.0000	\N	ONAYLANDI	2290.42	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-20 07:33:09.634	2026-02-20 07:33:09.634	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
b50db62e-21f3-480e-8104-f3f2b627282a	AF-2026-099	ALIS	clxyedekparca00001	a1a13a62-36b2-4955-be0d-1aca0934af13	2026-02-03 00:00:00	2026-03-22 00:00:00	0.00	701.83	140.37	842.19	\N	TRY	1.0000	\N	ONAYLANDI	842.19	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	\N	\N	\N	2026-02-20 12:24:39.503	2026-02-20 12:24:39.503	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
081ed4cf-7089-4ad6-86e2-7e3539339fac	SF-2026-001	SATIS	clxyedekparca00001	073863fe-4194-4895-99c4-a9eade2aaa69	2026-02-20 00:00:00	2026-03-07 00:00:00	0.00	202282.02	0.00	202282.02	\N	TRY	1.0000	\N	ONAYLANDI	155148.40	0.00	\N	\N	\N	\N	\N	PENDING	\N	56fdab02-13ad-4441-b755-862f88d6e7cb	04efc97b-a3a4-4d7e-b504-41b9d99911ea	\N	\N	2026-02-20 12:17:11.982	2026-02-26 08:03:31.133	\N	eb067e72-b52b-45fd-94d6-510cd5df7eba
\.


--
-- Data for Name: firma_kredi_karti_hareketler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.firma_kredi_karti_hareketler (id, "kartId", tutar, bakiye, aciklama, "cariId", "referansNo", tarih, "createdAt") FROM stdin;
\.


--
-- Data for Name: firma_kredi_karti_hatirlaticilar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.firma_kredi_karti_hatirlaticilar (id, "kartId", tip, gun, aktif, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: firma_kredi_kartlari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.firma_kredi_kartlari (id, "kasaId", "kartKodu", "kartAdi", "bankaAdi", "kartTipi", "sonDortHane", "limit", bakiye, aktif, "createdAt", "updatedAt", "hesapKesimTarihi", "sonOdemeTarihi") FROM stdin;
\.


--
-- Data for Name: hizli_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hizli_tokens (id, token, "loginHash", "generatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transactions (id, "tenantId", "partRequestId", "stokId", "warehouseId", quantity, "transactionType", "createdAt") FROM stdin;
\.


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invitations (id, email, "tenantId", "invitedBy", token, status, "expiresAt", "acceptedAt", "acceptedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_profit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_profit (id, "faturaId", "faturaKalemiId", "stokId", "tenantId", miktar, "birimFiyat", "birimMaliyet", "toplamSatisTutari", "toplamMaliyet", kar, "karOrani", "hesaplamaTarihi", "updatedAt") FROM stdin;
594db56d-4842-4e13-9c7b-aef19d7e8a21	72fae57a-00bd-4d8d-ab4a-9a325f132724	e0541a10-a5f9-4f85-9d1b-80286de6053a	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	clxyedekparca00001	1	22.00	0.0000	22.00	0.00	22.00	0.00	2026-02-26 17:52:03.277	2026-02-26 17:52:03.277
5d9ace55-2dd1-4bf5-9aa7-682be7dc0dee	72fae57a-00bd-4d8d-ab4a-9a325f132724	\N	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	clxyedekparca00001	1	0.00	0.0000	22.00	0.00	22.00	0.00	2026-02-26 17:52:03.277	2026-02-26 17:52:03.277
5659fd75-78a3-4221-a230-752a0b66b2fe	081ed4cf-7089-4ad6-86e2-7e3539339fac	95115c87-ac76-4302-a7c8-b1e4f4246456	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	clxyedekparca00001	1	1250.00	0.0000	1250.00	0.00	1250.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
6904da30-4020-4c2b-881e-6c90e3d71023	081ed4cf-7089-4ad6-86e2-7e3539339fac	034467f8-4a57-42a1-9c32-5600240d24ce	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	clxyedekparca00001	2	230.00	0.0000	460.00	0.00	460.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
fb8a16d2-0d52-4c24-bc88-81e91a6d9abe	081ed4cf-7089-4ad6-86e2-7e3539339fac	9ea01520-bb15-457d-925d-e5018c1964f6	acb90037-dc49-4d00-9bdb-5e201b87e61b	clxyedekparca00001	2	300.00	0.0000	600.00	0.00	600.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
60a8e414-ce94-4846-9df9-6a764d50d10f	081ed4cf-7089-4ad6-86e2-7e3539339fac	febd5bc7-4d87-41ed-8a4b-dd082bd460ba	dbad5926-e315-4d01-b4fe-dc558f119b97	clxyedekparca00001	1	1200.00	0.0000	1200.00	0.00	1200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
45112e4b-bcf0-4e6a-880e-541fde2c2b02	081ed4cf-7089-4ad6-86e2-7e3539339fac	c5bb55c3-2b2c-4e44-81c7-c8e53c1a0c76	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	clxyedekparca00001	1	2250.00	0.0000	2250.00	0.00	2250.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
1059355d-22c3-4c2c-bb91-c4d3d7d31e72	081ed4cf-7089-4ad6-86e2-7e3539339fac	d4f5ae67-7372-4b74-b9b4-09f5494b59fe	ebd53187-7551-4768-b016-7ab00badd88c	clxyedekparca00001	3	74.24	0.0000	222.72	0.00	222.72	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
801479b6-a717-4cc9-9796-3be2af9410ad	081ed4cf-7089-4ad6-86e2-7e3539339fac	c3917f10-8ca3-4839-9b40-50da75afb009	97440ecf-a58a-4bbd-8517-95a11e62b523	clxyedekparca00001	3	82.25	0.0000	246.75	0.00	246.75	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
df71aa5f-14d5-4699-b6bb-06fbad3b44c0	081ed4cf-7089-4ad6-86e2-7e3539339fac	491fe94e-bafa-43c9-9920-bc9e2dd79858	3b7f878f-6183-4beb-a3fc-09da7e672bc7	clxyedekparca00001	3	82.25	0.0000	246.75	0.00	246.75	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
ebb766fc-fb29-44b1-adba-e860060d0c6b	081ed4cf-7089-4ad6-86e2-7e3539339fac	e53ac559-ecfb-48e0-974a-16b1bf89ab91	9c2be3d1-032e-467e-9891-570608092d01	clxyedekparca00001	3	78.90	0.0000	236.70	0.00	236.70	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c3f06daa-ef60-4867-8cd4-5d50bdaf9819	081ed4cf-7089-4ad6-86e2-7e3539339fac	c8bd5095-723c-44e7-952d-efc902fc465c	bb3ce01c-2764-47cf-8309-a69549833324	clxyedekparca00001	1	750.00	0.0000	750.00	0.00	750.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b3b13300-5c88-475c-99bc-9ea1d7529341	081ed4cf-7089-4ad6-86e2-7e3539339fac	c1a1a5ef-f4c7-463c-aee9-81974a6c6ca4	12f306ed-4fa8-4976-840b-8695956a54c6	clxyedekparca00001	1	1100.00	0.0000	1100.00	0.00	1100.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
53f5ff6a-fbe2-4129-8b93-63db11eeadc3	081ed4cf-7089-4ad6-86e2-7e3539339fac	8d2da00a-2836-4c21-9431-6e379bd6a800	d9260889-4f94-4e97-8273-3e158999a1c8	clxyedekparca00001	1	99.12	0.0000	99.12	0.00	99.12	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
9a2397a7-a571-485b-abf2-729ea0d5ffa2	081ed4cf-7089-4ad6-86e2-7e3539339fac	ba18513d-1e0c-4778-84ae-fe639791ea3b	b397902b-886f-4dc4-b51f-98f786381773	clxyedekparca00001	1	195.68	0.0000	195.68	0.00	195.68	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
dc21d9b3-6247-4291-9f8b-239b29fc860e	081ed4cf-7089-4ad6-86e2-7e3539339fac	c229657d-45f2-41b2-9f34-1da94d179b6a	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	clxyedekparca00001	1	165.90	0.0000	165.90	0.00	165.90	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
45ef1712-1f70-43d9-b38f-0a3c72880344	081ed4cf-7089-4ad6-86e2-7e3539339fac	10f91db0-2cfe-4960-81de-57ff7a540f9e	29d6bea3-86c2-480b-a77f-32743f0313fd	clxyedekparca00001	1	4150.00	0.0000	4150.00	0.00	4150.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
d826459d-4c16-446a-a7b1-63c17de84c3b	081ed4cf-7089-4ad6-86e2-7e3539339fac	b3ddb905-a8ac-4e6c-ac01-bdc6af773a5e	48ca0edf-32c8-45a1-b60a-2959c06e3dc8	clxyedekparca00001	1	1700.00	0.0000	1700.00	0.00	1700.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b257479f-3cc0-4b37-90f9-b566078b5992	081ed4cf-7089-4ad6-86e2-7e3539339fac	a84406b1-d801-4ea5-a4c3-5725f579b1e6	5f5d6c8a-1f76-4291-9c59-6314c4e1ed52	clxyedekparca00001	1	330.00	0.0000	330.00	0.00	330.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
370050d9-a76d-4116-96d2-8a55bf600f83	081ed4cf-7089-4ad6-86e2-7e3539339fac	14ebbef2-a794-4ac1-b767-775400d4235c	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	clxyedekparca00001	1	550.00	0.0000	550.00	0.00	550.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
ff04a8e0-f297-4529-ae8b-6cbb128ffc75	081ed4cf-7089-4ad6-86e2-7e3539339fac	324bec91-ee8b-4742-aa36-a02f1980b035	17e52e1b-1762-46e4-ada6-4594ab04b5a6	clxyedekparca00001	1	750.00	0.0000	750.00	0.00	750.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
a99ade1a-a8f6-4c06-9194-340070cca26e	081ed4cf-7089-4ad6-86e2-7e3539339fac	6feb8dd1-0ca9-4a9f-bd4d-b029375c4ef9	60fe51dd-3077-43b3-b46a-50dad2fe164d	clxyedekparca00001	1	1600.00	0.0000	1600.00	0.00	1600.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
1b83ba35-d55e-443f-836e-e60e4c8193cd	081ed4cf-7089-4ad6-86e2-7e3539339fac	b74f166f-121a-4671-ab2c-34425ebdebc9	43383f55-e917-4b41-9e96-7544bcb1d2b5	clxyedekparca00001	1	360.00	0.0000	360.00	0.00	360.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
4a6fa97c-ae94-43ae-9a41-35caf0289605	081ed4cf-7089-4ad6-86e2-7e3539339fac	6f1fa43b-4ef4-4b0e-bd52-adef627b4718	4a4ed874-2216-4bc9-a300-17f0d0082d97	clxyedekparca00001	4	575.00	0.0000	2300.00	0.00	2300.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
688337b0-f62b-4181-b141-f53b90851094	081ed4cf-7089-4ad6-86e2-7e3539339fac	ffd0e745-2039-42c2-b6a5-04ab11df5775	d9d4845c-dfeb-43b9-9573-4443ddae6f05	clxyedekparca00001	2	200.00	0.0000	400.00	0.00	400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
d713c96b-e5d3-412f-a384-b9ddcc74168c	081ed4cf-7089-4ad6-86e2-7e3539339fac	022685d3-fc1c-4868-a5d0-deca3949f18f	2e609756-f2dd-4834-830c-958fab782301	clxyedekparca00001	2	900.00	0.0000	1800.00	0.00	1800.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
05f07c1f-6792-49c6-b663-e3abf9038c07	081ed4cf-7089-4ad6-86e2-7e3539339fac	4cc57f4a-4d8c-49a1-9ce4-ae0688c5c389	43383f55-e917-4b41-9e96-7544bcb1d2b5	clxyedekparca00001	1	360.00	0.0000	360.00	0.00	360.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
583a4da6-370b-4eae-b769-2e88065a24fb	081ed4cf-7089-4ad6-86e2-7e3539339fac	d02af50c-4cfe-4834-b0a5-28328b99674e	841e7ff9-ca92-47c5-b53f-de26b6fa549b	clxyedekparca00001	1	3750.00	0.0000	3750.00	0.00	3750.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
e89a501e-9b95-471b-9883-35bf58e01350	081ed4cf-7089-4ad6-86e2-7e3539339fac	3081c50a-cacc-49fa-ae97-831830543489	0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071	clxyedekparca00001	1	5500.00	0.0000	5500.00	0.00	5500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
2542b604-c8a1-4f2e-9478-76e292d1b3a5	081ed4cf-7089-4ad6-86e2-7e3539339fac	66713a47-5532-42df-9be6-1de88fc2062f	4d29ba15-d80a-42d7-9a01-fd21d68a64f5	clxyedekparca00001	1	200.00	0.0000	200.00	0.00	200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
bfbd382a-3391-4586-ad22-1886c6ad4c6b	081ed4cf-7089-4ad6-86e2-7e3539339fac	7d87d591-1693-4839-a3a9-7637968b259e	3f9269ca-37d1-465e-aedf-642cf50c8d84	clxyedekparca00001	1	185.00	0.0000	185.00	0.00	185.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
e3032bae-1409-4858-8e2d-5567fbff2b7d	081ed4cf-7089-4ad6-86e2-7e3539339fac	8c77d352-8bd4-4304-8b36-5421ca9f9d6c	21a31166-c617-4d2d-9980-dc07951bd242	clxyedekparca00001	2	1200.00	0.0000	2400.00	0.00	2400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
329e573b-878d-4864-96a6-59b049f51781	081ed4cf-7089-4ad6-86e2-7e3539339fac	929ab530-0688-4dbd-a90e-23be27b4c40c	83983ed2-a2a5-4026-884b-ddba7ce30748	clxyedekparca00001	2	700.00	0.0000	1400.00	0.00	1400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
a3ef8c16-df7f-47c8-9a93-8fa4541b2ac9	081ed4cf-7089-4ad6-86e2-7e3539339fac	745a078f-1ee8-47cd-aa06-13302f4afedf	cf26b850-04a7-4f79-800b-bbd290a5e5f2	clxyedekparca00001	2	200.00	0.0000	400.00	0.00	400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
0082d8a8-a3a9-4a0d-81d7-73663b601a8f	081ed4cf-7089-4ad6-86e2-7e3539339fac	9bcd8591-b4cd-432c-8d4e-e350b4457bfd	ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3	clxyedekparca00001	1	1750.00	0.0000	1750.00	0.00	1750.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
fae1f402-a18c-47b2-ab4e-06480c1dcc6d	081ed4cf-7089-4ad6-86e2-7e3539339fac	19a71b6d-d672-47aa-8b00-4876635fc805	a492f201-88ee-4e8e-ae49-52e1a50dbab8	clxyedekparca00001	1	1400.00	0.0000	1400.00	0.00	1400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
3ea73aad-308e-468f-8625-9eb7c5c87eed	081ed4cf-7089-4ad6-86e2-7e3539339fac	5e287673-1873-474b-96ff-63d33872ded7	cc55cb87-07fe-4476-b97c-cbd1f3fb9112	clxyedekparca00001	1	565.00	0.0000	565.00	0.00	565.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
d3029952-e5ea-472f-a5c9-8142275c2715	081ed4cf-7089-4ad6-86e2-7e3539339fac	b6625f36-2ef0-455e-b622-6b5b77709583	d20bccc8-8f63-47b1-bf83-65d9a78ab3d0	clxyedekparca00001	1	600.00	0.0000	600.00	0.00	600.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8c840a18-d7c5-465c-9530-c418e31ec51a	081ed4cf-7089-4ad6-86e2-7e3539339fac	6eec5628-e203-4d97-b990-f77207c5c461	d922900b-9ef7-418c-b8c4-cb1108141338	clxyedekparca00001	1	950.00	0.0000	950.00	0.00	950.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
23bf5481-98f9-4663-9039-45a59e07136f	081ed4cf-7089-4ad6-86e2-7e3539339fac	6e52a2f5-c3c6-45ab-a3da-943110df30bd	6b77e199-dd06-4f0f-95fc-819df8dc0bcd	clxyedekparca00001	1	650.00	0.0000	650.00	0.00	650.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
9dab72bf-fcda-4d65-8c7e-edcaa1e56757	081ed4cf-7089-4ad6-86e2-7e3539339fac	bbfe64d3-4f46-4451-a9b3-8cc77dde063b	5a5119ab-cfdf-4038-b627-d384e352e12b	clxyedekparca00001	1	1050.00	0.0000	1050.00	0.00	1050.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
e6e0da18-4917-4539-a968-b3214236521b	081ed4cf-7089-4ad6-86e2-7e3539339fac	896005df-e52d-486d-ab00-26b1dec9d0b3	ebd53187-7551-4768-b016-7ab00badd88c	clxyedekparca00001	30	68.89	0.0000	2066.70	0.00	2066.70	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
5809988c-eb12-4891-8099-7e0cf99f347f	081ed4cf-7089-4ad6-86e2-7e3539339fac	f5cb364f-fb00-4f22-9695-a3b784fffc09	8ca367cf-098c-4aee-9070-6dbf05a3f120	clxyedekparca00001	30	68.89	0.0000	2066.70	0.00	2066.70	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
37218ae8-bb8b-4430-87d3-a2d89cab470b	081ed4cf-7089-4ad6-86e2-7e3539339fac	2410b822-564f-4e10-9237-ce31003bae62	1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb	clxyedekparca00001	1	720.00	0.0000	720.00	0.00	720.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
19745a1d-9142-4964-a668-f9451460ca5b	081ed4cf-7089-4ad6-86e2-7e3539339fac	f6abb8af-7f5e-41e6-88d7-615def536c39	4ca32989-637b-413e-8464-c70eeacf2798	clxyedekparca00001	1	4150.00	0.0000	4150.00	0.00	4150.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
17c13698-5685-4340-b560-8bbd7ea78874	081ed4cf-7089-4ad6-86e2-7e3539339fac	e3d05099-3017-46c1-8513-0e8c08e693e9	f27495f5-9e20-4b1d-b41d-acd1964600fd	clxyedekparca00001	1	1200.00	0.0000	1200.00	0.00	1200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b1340cfb-2fb2-44f7-83b9-0fef64444752	081ed4cf-7089-4ad6-86e2-7e3539339fac	8e01447f-837f-4165-a5c0-dd2ea2c8e61c	4a0c6df2-9b97-47aa-8647-d69ac9e5b68b	clxyedekparca00001	1	1100.00	0.0000	1100.00	0.00	1100.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
a935795a-6cc5-468e-b387-371b0a37c316	081ed4cf-7089-4ad6-86e2-7e3539339fac	721236b0-400f-4d1a-ac71-fb1760e1e23c	15353c7e-4dee-4dc2-ab8b-da505d6ff997	clxyedekparca00001	1	1650.00	0.0000	1650.00	0.00	1650.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8c5e038d-15a3-4190-af77-5375aa0fc5cb	081ed4cf-7089-4ad6-86e2-7e3539339fac	13bf15de-d02e-481e-9608-c0405b52aed8	b1eda65e-05cc-4520-a341-0bccf035b64b	clxyedekparca00001	1	1650.00	0.0000	1650.00	0.00	1650.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8247147f-0132-4c54-bee4-3a59cf4ad442	081ed4cf-7089-4ad6-86e2-7e3539339fac	6461bdeb-b6ed-4d40-b153-24933c12da62	58ea2ec6-5fa8-4a5a-81c8-de7155845cb1	clxyedekparca00001	2	750.00	0.0000	1500.00	0.00	1500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
4eebb61b-84ee-4c72-a0d3-45dba549c72e	081ed4cf-7089-4ad6-86e2-7e3539339fac	0727951e-3d84-4292-8f78-e98b3ef25cab	7cc41938-a92a-4b3f-b768-b7c7a49fc4bf	clxyedekparca00001	1	350.00	0.0000	350.00	0.00	350.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b9cdb696-9cad-44b2-82d5-9d43b88fa61f	081ed4cf-7089-4ad6-86e2-7e3539339fac	ae669fe0-9c14-4347-b9ce-e08e0a61fb2d	a1a2a2ae-1141-468c-bc6d-edb60da5c581	clxyedekparca00001	1	4000.00	0.0000	4000.00	0.00	4000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
7c986c8e-d417-4850-b0d9-f75d9c37463d	081ed4cf-7089-4ad6-86e2-7e3539339fac	23b350ee-b192-4a1f-98ee-dfbb6a5f0e0b	8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	clxyedekparca00001	1	3000.00	0.0000	3000.00	0.00	3000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
dc8f82bb-398f-439f-b5a0-8071a61e0909	081ed4cf-7089-4ad6-86e2-7e3539339fac	22b1a2f7-9341-40c8-a41f-8ab5702d3f03	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	clxyedekparca00001	3	580.00	0.0000	1740.00	0.00	1740.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8e9b0bf8-0b2a-4b35-bb7f-42cf9d7e92f4	081ed4cf-7089-4ad6-86e2-7e3539339fac	6b57b6d8-6ac0-41bb-a1be-aebeee1b9a56	070c78a4-26c5-4338-bece-4877b60c2a26	clxyedekparca00001	2	400.00	0.0000	800.00	0.00	800.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
d99553f4-04e3-4eb0-9e61-9af7ac0613e3	081ed4cf-7089-4ad6-86e2-7e3539339fac	5ddf3376-2bdc-4648-810c-7f80bca52d75	9295b32c-9a71-46eb-8c8d-c15ac375f692	clxyedekparca00001	1	800.00	0.0000	800.00	0.00	800.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
7928f7c9-6641-4093-87f1-b3ffd2a95521	081ed4cf-7089-4ad6-86e2-7e3539339fac	02acf0ba-e6f9-4876-afc6-230381b39635	db7262e7-7f97-4766-886e-9a78bf39705c	clxyedekparca00001	1	20500.00	0.0000	20500.00	0.00	20500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
cbe1b9f9-abc0-4f73-b584-194202488a12	081ed4cf-7089-4ad6-86e2-7e3539339fac	25f80bcc-74f3-4221-a278-eb898f57bc4b	30371764-9531-4d61-9636-4cdc385d9a6f	clxyedekparca00001	1	1200.00	0.0000	1200.00	0.00	1200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
755a9442-d661-4f9e-ad16-cc0571c3808e	081ed4cf-7089-4ad6-86e2-7e3539339fac	7061146a-616e-43c6-a4d2-e85236a117d2	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	clxyedekparca00001	1	850.00	0.0000	850.00	0.00	850.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8ee2befe-e55f-4e7c-b359-b722e2212c37	081ed4cf-7089-4ad6-86e2-7e3539339fac	248a4e31-04fb-4dc1-9fb1-ccc3626c95f3	747041af-5928-4134-b6dd-68c2c6081b29	clxyedekparca00001	1	450.00	0.0000	450.00	0.00	450.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
ed454e1c-1c8e-47bc-9d7e-b8b0cb4700cb	081ed4cf-7089-4ad6-86e2-7e3539339fac	95c9e916-2824-4786-8d34-eea8697d2340	113d0d8d-5198-4415-b81c-5c812ed4e435	clxyedekparca00001	4	200.00	0.0000	800.00	0.00	800.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
abc1c23d-8de3-4272-b7bf-b9217b35e794	081ed4cf-7089-4ad6-86e2-7e3539339fac	a57c1f0d-6566-42bd-b631-b258e9ae9536	1d0a5188-ba70-4451-b294-96c61b46d3ab	clxyedekparca00001	5	15.00	0.0000	75.00	0.00	75.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
981e5091-dc1a-4798-b061-701954235618	081ed4cf-7089-4ad6-86e2-7e3539339fac	67a67fed-c3f5-4257-9e05-abe0ac0274eb	9313625f-754f-4bab-8e48-68dac414e3bc	clxyedekparca00001	1	5600.00	0.0000	5600.00	0.00	5600.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
6df5fcb7-b9c1-4833-a46b-b38574220cf0	081ed4cf-7089-4ad6-86e2-7e3539339fac	aa83227a-dd16-4260-ac7e-48708798b7a6	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	clxyedekparca00001	1	1200.00	0.0000	1200.00	0.00	1200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
010a3e67-9bcb-40ff-8f41-3a76b5f50618	081ed4cf-7089-4ad6-86e2-7e3539339fac	5d2d0275-15c4-4511-b43d-0db484f85e5a	14a09ecf-2c5d-4579-a891-371719a24a36	clxyedekparca00001	1	2180.00	0.0000	2180.00	0.00	2180.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
ac52567a-c7a4-4c2a-b9c0-afe44a8b24dc	081ed4cf-7089-4ad6-86e2-7e3539339fac	0a0a63e8-5370-41bc-a321-2b15016c16a5	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	clxyedekparca00001	1	800.00	0.0000	800.00	0.00	800.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
1f648cad-e0ca-4d72-bfc9-25abf7a697b0	081ed4cf-7089-4ad6-86e2-7e3539339fac	69c4e2e1-71c3-4c10-8b8c-9f5487470556	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	clxyedekparca00001	1	2850.00	0.0000	2850.00	0.00	2850.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
ef88e707-d0cc-459f-90c1-58cc024b28ff	081ed4cf-7089-4ad6-86e2-7e3539339fac	6199754f-0a44-4cbb-a116-5b14e6526d87	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	clxyedekparca00001	1	715.00	0.0000	715.00	0.00	715.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b00292c7-e45d-4a3f-ac03-6860a4255b9e	081ed4cf-7089-4ad6-86e2-7e3539339fac	d2b49080-af30-4842-8087-f6a348355d8b	4f879a28-5567-48cf-9885-e8be3ef8c025	clxyedekparca00001	1	2650.00	0.0000	2650.00	0.00	2650.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
f2631aee-9bc3-4261-a488-90a7b0f71358	081ed4cf-7089-4ad6-86e2-7e3539339fac	3b6d1249-5092-43d9-971a-6115e8981754	492e3d84-3803-4117-8382-3defc2b33e8c	clxyedekparca00001	1	300.00	0.0000	300.00	0.00	300.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
2aa65bd0-c2ed-439b-accb-a36b69639052	081ed4cf-7089-4ad6-86e2-7e3539339fac	d2e8a9d0-ef62-4044-9eb7-df5aec4fb8cc	c190aad6-0676-492d-934a-28d3ff6e2bd2	clxyedekparca00001	1	16000.00	0.0000	16000.00	0.00	16000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
d6df393e-0248-4c2e-b0b6-ec49a02a12ba	081ed4cf-7089-4ad6-86e2-7e3539339fac	0f7b5ee7-186a-4527-9168-8521a3bc68d8	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	clxyedekparca00001	2	175.00	0.0000	350.00	0.00	350.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
02ec4d79-ddac-40ca-88dc-3e34087b2636	081ed4cf-7089-4ad6-86e2-7e3539339fac	50889bc1-7fcc-4da1-a904-2bd83c62769c	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	clxyedekparca00001	1	950.00	0.0000	950.00	0.00	950.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
1e98c40a-693a-4f08-b554-261abb7ced8b	081ed4cf-7089-4ad6-86e2-7e3539339fac	ebdf1aa0-b8a6-4f5d-bcf2-9775ac7652f0	7f69153f-992a-49d4-ba61-8c64f69f0b70	clxyedekparca00001	1	2300.00	1729.8100	2300.00	1729.81	570.19	32.96	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b578aa2b-426f-41ea-88a0-b0b464832e79	081ed4cf-7089-4ad6-86e2-7e3539339fac	6ca695d4-cd8f-46dc-8cab-dbc04a1e5458	fac371ee-4670-4c55-a6af-1995c5297bab	clxyedekparca00001	1	450.00	0.0000	450.00	0.00	450.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
194fade6-0dd3-4e8a-86cb-5737f07adff2	081ed4cf-7089-4ad6-86e2-7e3539339fac	d01b6f71-6749-496f-b39e-fe00ea9be7c0	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	clxyedekparca00001	3	1000.00	0.0000	3000.00	0.00	3000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
72c20cdb-eb76-410c-94e4-838ca950c8c8	081ed4cf-7089-4ad6-86e2-7e3539339fac	528fc24b-eba5-4f61-875c-9f39b0fffbab	befa4db7-76e1-4e25-b775-e5134a7aaad0	clxyedekparca00001	1	500.00	0.0000	500.00	0.00	500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
179728de-14b4-451c-9119-6bbc9a55aa3e	081ed4cf-7089-4ad6-86e2-7e3539339fac	87337866-1f13-49b9-b1d6-103799bf7385	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	clxyedekparca00001	1	750.00	0.0000	750.00	0.00	750.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
1eb1e62b-f39d-47bd-93a4-dbf1d4c4a27d	081ed4cf-7089-4ad6-86e2-7e3539339fac	b15e0520-ac00-4bfd-9e96-8c6d9398e5c4	e8564a36-6b84-4a98-93c8-e78ba2d096bd	clxyedekparca00001	1	1500.00	0.0000	1500.00	0.00	1500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
000c4b9b-bbe5-421b-a7be-567fc88faf2b	081ed4cf-7089-4ad6-86e2-7e3539339fac	49da3345-200f-46bc-8efb-7001e4aca797	d390a057-d84b-4a11-9031-073e3de7955a	clxyedekparca00001	1	590.00	0.0000	590.00	0.00	590.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c4ee2ae8-5e5b-4671-87e9-5362abd57f94	081ed4cf-7089-4ad6-86e2-7e3539339fac	235b5232-a3a9-4c5d-a5fa-c27dd41631cb	9fc2242b-2719-4bf3-8363-f5309001394f	clxyedekparca00001	1	1450.00	0.0000	1450.00	0.00	1450.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
65a77a95-f93e-4662-99a6-f358ed64b56c	081ed4cf-7089-4ad6-86e2-7e3539339fac	d140f21e-da64-4652-a177-ea03b65b2e7f	26c7f88f-3f2f-49ba-983b-73a06fded6c1	clxyedekparca00001	1	320.00	0.0000	320.00	0.00	320.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
72456fb3-82b0-4b10-9709-b253fd2c32ed	081ed4cf-7089-4ad6-86e2-7e3539339fac	1232354d-2246-4310-a2fc-84e48b8fe1c5	36595002-482b-4835-9f28-ec4c96336b95	clxyedekparca00001	1	550.00	0.0000	550.00	0.00	550.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c6c3f13a-1347-4fda-a6a3-7c4ec2ff62e1	081ed4cf-7089-4ad6-86e2-7e3539339fac	96e87fc5-c00e-4dd0-87cf-0b105b08632f	dccb985b-cbf8-45a5-90ee-3fa62d360f73	clxyedekparca00001	1	450.00	0.0000	450.00	0.00	450.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
5f98c3ab-1d8a-4e07-9853-80325eb4bed0	081ed4cf-7089-4ad6-86e2-7e3539339fac	7b74f3c3-b2de-4aeb-9f28-01cea3ad3a73	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	clxyedekparca00001	1	4300.00	0.0000	4300.00	0.00	4300.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
24fe0e46-34bf-493f-8888-48ef4d7eb681	081ed4cf-7089-4ad6-86e2-7e3539339fac	e9c19d8b-0573-4505-9be7-29aabe4813f7	ef1b99c8-f47e-4cd5-b239-fa50abc46139	clxyedekparca00001	1	90.00	0.0000	90.00	0.00	90.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
37f70970-08b9-4262-a6c9-5cb648be5a39	081ed4cf-7089-4ad6-86e2-7e3539339fac	f674749f-dfaf-4b76-9d75-76925d0347c1	822d5979-a68a-4d37-9d77-e99723b98af5	clxyedekparca00001	1	60.00	0.0000	60.00	0.00	60.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
bc63df9e-4e62-47a6-9847-ffa1ca6bf65d	081ed4cf-7089-4ad6-86e2-7e3539339fac	47918c96-40ca-4d55-9b70-5299a17dd7d9	e4e92397-048d-4573-9190-b9451b01bc43	clxyedekparca00001	1	1900.00	0.0000	1900.00	0.00	1900.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
f5556a8a-57d7-45a0-a328-9674a9a97af3	081ed4cf-7089-4ad6-86e2-7e3539339fac	300a07d8-18ab-49ca-b6b6-9d2d0600d1fd	5e3e1253-3eba-4592-b7e5-521aa7e8b4bd	clxyedekparca00001	1	1200.00	0.0000	1200.00	0.00	1200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c5beeef4-3af0-404e-a392-2a19fcdc1232	081ed4cf-7089-4ad6-86e2-7e3539339fac	c3c6e2b9-1972-4fbe-be6e-7db54c2e1222	8af369e2-616d-4b8e-8e85-ce7580771548	clxyedekparca00001	1	1550.00	0.0000	1550.00	0.00	1550.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
633d59b9-558b-4dbc-bde0-83aac864eae6	081ed4cf-7089-4ad6-86e2-7e3539339fac	4b372121-f81d-4d7f-b4dd-7147edd4a176	35fa2343-4314-4fcb-bb8f-8ea508fe9030	clxyedekparca00001	1	5500.00	0.0000	5500.00	0.00	5500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
6e0964bc-e9a7-4ebd-ba23-e53364d875be	081ed4cf-7089-4ad6-86e2-7e3539339fac	05bf6442-93d3-4dd3-a702-44f473f1db16	b2447e12-55c1-488c-9af5-86502190495c	clxyedekparca00001	1	4350.00	0.0000	4350.00	0.00	4350.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
62b75f32-26b1-4927-8d73-b597b7377324	081ed4cf-7089-4ad6-86e2-7e3539339fac	3e158171-31c1-487a-9dbb-a738a51890af	279b1a94-66d5-4c7c-aa8d-a3222332d30a	clxyedekparca00001	1	7000.00	0.0000	7000.00	0.00	7000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c913a8be-365d-4680-bca6-0496fa878e2d	081ed4cf-7089-4ad6-86e2-7e3539339fac	5527cfd4-8301-48d6-9ebe-3df36eb733ca	d27eaf8b-5790-43b3-9bf3-a4610454c87a	clxyedekparca00001	1	820.00	0.0000	820.00	0.00	820.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
4874b535-3b45-4405-b12e-2ccc2e33f3da	081ed4cf-7089-4ad6-86e2-7e3539339fac	9ffb9229-298c-4c2c-a093-1835d3451549	988a9c98-3f14-4618-b4d6-b7d34ab264bd	clxyedekparca00001	1	1400.00	0.0000	1400.00	0.00	1400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c357dbd8-05d9-4a8d-b657-8d038e8d3470	081ed4cf-7089-4ad6-86e2-7e3539339fac	abf36779-dbec-4a34-ba42-4aa57bc52bf6	36554292-a6c6-4759-b86b-6d12f28fe79f	clxyedekparca00001	1	1400.00	0.0000	1400.00	0.00	1400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
575aa7bb-1f39-4c6b-b1f7-6b730e51c9ca	081ed4cf-7089-4ad6-86e2-7e3539339fac	6434379e-83b3-46ad-9573-90290a03dcb9	4d5a2911-661a-4939-bd75-24ef80fe07ae	clxyedekparca00001	1	2400.00	0.0000	2400.00	0.00	2400.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
68ef2d24-b736-466a-99c8-7d6b69b415ac	081ed4cf-7089-4ad6-86e2-7e3539339fac	e800a3ea-00fd-40c6-bb4e-d2cb215b79ee	6df6ee1b-cf84-45fb-8988-d3189073c7a5	clxyedekparca00001	4	125.00	0.0000	500.00	0.00	500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
9a978fd8-f4f9-4f66-bdd9-f13fe553e32f	081ed4cf-7089-4ad6-86e2-7e3539339fac	50e131f4-9004-49e0-91f7-64a77191a683	95524c06-81bb-4523-a9ad-7904f769d866	clxyedekparca00001	1	650.00	0.0000	650.00	0.00	650.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
3c3e6512-4544-4e42-bde6-38611bca5cbb	081ed4cf-7089-4ad6-86e2-7e3539339fac	0561f2b5-421d-40d4-96c0-9003a31779eb	fd0e24dc-66c8-45ad-933b-6a5e81fa0647	clxyedekparca00001	1	7000.00	0.0000	7000.00	0.00	7000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
529d54c6-76ac-4856-a5ad-396352d87ca1	081ed4cf-7089-4ad6-86e2-7e3539339fac	1cb54820-8276-4690-a544-6d9e8461bc0f	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	clxyedekparca00001	1	550.00	0.0000	550.00	0.00	550.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
e3e3345f-7e94-483a-9d5b-40e32de03cc5	081ed4cf-7089-4ad6-86e2-7e3539339fac	9c8b65de-ed91-4351-81cf-83e2f157f421	c169b88e-7166-4701-b53f-d6defa6e9351	clxyedekparca00001	1	235.00	0.0000	235.00	0.00	235.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
c5be92a3-ce17-4531-8804-fb08fd587168	081ed4cf-7089-4ad6-86e2-7e3539339fac	e8d240c3-c6fd-4702-bce0-017cf7cb7e5b	683958d9-6c77-4716-884a-63f720f799b1	clxyedekparca00001	1	130.00	0.0000	130.00	0.00	130.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
089dc2b3-738a-4bd1-9311-98452df7031e	081ed4cf-7089-4ad6-86e2-7e3539339fac	2e3e8d41-7731-4138-950a-a0e88670551f	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	clxyedekparca00001	1	1700.00	0.0000	1700.00	0.00	1700.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
43ce55ae-8833-4605-8942-26e9e402977c	081ed4cf-7089-4ad6-86e2-7e3539339fac	423025e0-d975-41dc-9941-cef49a110dd9	7d8077c4-da82-47a7-a7d0-c25eba803b25	clxyedekparca00001	1	2200.00	0.0000	2200.00	0.00	2200.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
2a333062-1cd7-4c3b-91ea-cab730b71f16	081ed4cf-7089-4ad6-86e2-7e3539339fac	0247dfb2-0863-48cc-b353-09a7ab2b22bd	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	clxyedekparca00001	2	1000.00	0.0000	2000.00	0.00	2000.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
e10bc26b-d70c-4a28-a1d6-18850c174524	081ed4cf-7089-4ad6-86e2-7e3539339fac	c82c1972-fa98-4679-849f-1ddf30f88d6e	592f367c-0b18-454a-8ef0-8e863e86c613	clxyedekparca00001	2	150.00	0.0000	300.00	0.00	300.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
510c986c-ab34-4d1b-9480-4ca21d33730b	081ed4cf-7089-4ad6-86e2-7e3539339fac	6c645222-e576-4e8d-819e-696d7ef8c6bf	a63c9f6f-2501-4b94-8135-530556ed3322	clxyedekparca00001	1	850.00	0.0000	850.00	0.00	850.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
b89c1b5d-1ebc-49e6-8f2f-329bf02aefee	081ed4cf-7089-4ad6-86e2-7e3539339fac	3d384dca-c09a-4ffe-b2ae-280985c79862	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	clxyedekparca00001	2	350.00	0.0000	700.00	0.00	700.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
39fc6f81-3159-4ea2-ae30-95f67ca4f7e7	081ed4cf-7089-4ad6-86e2-7e3539339fac	3edd984d-ac5c-4eeb-9589-07d45b1d94fa	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	clxyedekparca00001	1	2500.00	0.0000	2500.00	0.00	2500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
f6756c7c-296a-4ed7-bc1b-eb6cbcf6fdb0	081ed4cf-7089-4ad6-86e2-7e3539339fac	323b3bf1-80c1-4e47-93b4-b9b8b9363db2	897aae4d-55b6-4921-8d25-c42dd6b82be7	clxyedekparca00001	1	9500.00	0.0000	9500.00	0.00	9500.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
8564007a-7cc8-4206-90ea-ad5ca73ab1c0	081ed4cf-7089-4ad6-86e2-7e3539339fac	a44f6699-08a6-44a8-818b-9089691a1f39	88c2c8c2-f1bf-4721-87cd-479024478cc4	clxyedekparca00001	1	1250.00	0.0000	1250.00	0.00	1250.00	0.00	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
96622b03-7276-4b77-907b-a6a07c6480b4	081ed4cf-7089-4ad6-86e2-7e3539339fac	\N	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	clxyedekparca00001	206	0.00	0.0000	202282.02	1729.81	200552.21	11593.89	2026-02-26 08:03:32.179	2026-02-26 08:03:32.179
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries (id, "tenantId", "referenceType", "referenceId", "serviceInvoiceId", "entryDate", description, "createdAt") FROM stdin;
\.


--
-- Data for Name: journal_entry_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entry_lines (id, "journalEntryId", "accountCode", "accountName", debit, credit, description) FROM stdin;
\.


--
-- Data for Name: kasa_hareketler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kasa_hareketler (id, "kasaId", "hareketTipi", tutar, "komisyonTutari", "bsmvTutari", "netTutar", bakiye, "belgeTipi", "belgeNo", "cariId", aciklama, tarih, "transferEdildi", "transferTarihi", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: kasalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kasalar (id, "kasaKodu", "tenantId", "kasaAdi", "kasaTipi", bakiye, aktif, "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, "warehouseId", layer, corridor, side, section, level, code, barcode, name, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: maas_odeme_detaylari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maas_odeme_detaylari (id, "tenantId", "odemeId", "odemeTipi", tutar, "kasaId", "bankaHesapId", "referansNo", aciklama, "createdAt") FROM stdin;
\.


--
-- Data for Name: maas_odemeler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maas_odemeler (id, "tenantId", "planId", "personelId", tutar, tarih, aciklama, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: maas_planlari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maas_planlari (id, "tenantId", "personelId", yil, ay, maas, prim, toplam, durum, "odenenTutar", "kalanTutar", aktif, aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: masraf_kategoriler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.masraf_kategoriler (id, "kategoriAdi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: masraflar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.masraflar (id, "tenantId", "kategoriId", aciklama, tutar, tarih, "odemeTipi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: module_licenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.module_licenses (id, "subscriptionId", "moduleId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modules (id, name, slug, description, price, currency, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: part_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.part_requests (id, "tenantId", "workOrderId", "requestedBy", description, "stokId", "requestedQty", "suppliedQty", status, version, "suppliedBy", "suppliedAt", "usedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "subscriptionId", amount, currency, status, "iyzicoPaymentId", "iyzicoToken", "conversationId", "invoiceNumber", "invoiceUrl", "paidAt", "failedAt", "refundedAt", "errorCode", "errorMessage", "paymentMethod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, module, action, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: personel_odemeler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personel_odemeler (id, "personelId", tip, tutar, tarih, donem, aciklama, "kasaId", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: personeller; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personeller (id, "personelKodu", "tenantId", "tcKimlikNo", ad, soyad, "dogumTarihi", cinsiyet, "medeniDurum", telefon, email, adres, il, ilce, pozisyon, departman, "iseBaslamaTarihi", "istenCikisTarihi", aktif, maas, "maasGunu", "sgkNo", "ibanNo", bakiye, aciklama, "createdBy", "updatedBy", "createdAt", "updatedAt", prim) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plans (id, name, slug, description, price, currency, "billingPeriod", "trialDays", "baseUserLimit", features, limits, "isActive", "isPopular", "isBasePlan", "createdAt", "updatedAt") FROM stdin;
clxtrialplan00001	Deneme Paketi	trial	Deneme erişimi	0.00	TRY	MONTHLY	0	10	\N	\N	t	f	t	2026-02-22 19:55:05.846	2026-02-22 19:55:05.846
\.


--
-- Data for Name: postal_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.postal_codes (id, city, district, neighborhood, "postalCode", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: price_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_cards (id, stok_id, type, price, currency, effective_from, effective_to, note, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_barcodes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_barcodes (id, "productId", barcode, symbology, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_location_stocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_location_stocks (id, "warehouseId", "locationId", "productId", "qtyOnHand", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, ordered_quantity, received_quantity, unit_price, status, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, "orderNumber", "tenantId", supplier_id, order_date, expected_delivery_date, status, total_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: raflar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.raflar (id, "depoId", "rafKodu", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, "roleId", "permissionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, "isSystemRole", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_irsaliyeleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_irsaliyeleri (id, "irsaliyeNo", "irsaliyeTarihi", "tenantId", "cariId", "depoId", "kaynakTip", "kaynakId", durum, "toplamTutar", "kdvTutar", "genelToplam", iskonto, aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_irsaliyesi_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_irsaliyesi_kalemleri (id, "irsaliyeId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_irsaliyesi_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_irsaliyesi_logs (id, "irsaliyeId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparis_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_siparis_kalemleri (id, "satınAlmaSiparisId", "stokId", miktar, "sevkEdilenMiktar", "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparis_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_siparis_logs (id, "satınAlmaSiparisId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparisleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satin_alma_siparisleri (id, "siparisNo", "tenantId", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "faturaNo", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "deliveryNoteId") FROM stdin;
\.


--
-- Data for Name: satis_elemanlari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satis_elemanlari (id, "adSoyad", telefon, email, aktif, "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: satis_irsaliyeleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satis_irsaliyeleri (id, "irsaliyeNo", "irsaliyeTarihi", "tenantId", "cariId", "depoId", "kaynakTip", "kaynakId", durum, "toplamTutar", "kdvTutar", "genelToplam", iskonto, aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
fd4fbcf9-310d-4b38-b2bd-479073454dd2	Sİ00001	2026-02-26 00:00:00	clxyedekparca00001	770162db-e7ae-47bc-bebf-267607e8c24a	eb067e72-b52b-45fd-94d6-510cd5df7eba	FATURA_OTOMATIK	\N	FATURALANMADI	22.00	4.40	26.40	0.00	\N	5c81dff5-0ee8-4395-b655-138a4d0064b8	\N	\N	\N	2026-02-26 17:51:33.182	2026-02-26 17:51:45.151
\.


--
-- Data for Name: satis_irsaliyesi_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satis_irsaliyesi_kalemleri (id, "irsaliyeId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "faturalananMiktar", "createdAt") FROM stdin;
17766ca4-1b80-4fcd-89d7-54904c3c812d	fd4fbcf9-310d-4b38-b2bd-479073454dd2	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	1	22.00	20	4.40	22.00	0	2026-02-26 17:51:33.182
\.


--
-- Data for Name: satis_irsaliyesi_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.satis_irsaliyesi_logs (id, "irsaliyeId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: sayim_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sayim_kalemleri (id, "sayimId", "stokId", "locationId", "sistemMiktari", "sayilanMiktar", "farkMiktari", "createdAt") FROM stdin;
\.


--
-- Data for Name: sayimlar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sayimlar (id, "sayimNo", "tenantId", "sayimTipi", tarih, durum, aciklama, "createdBy", "updatedBy", "onaylayanId", "onayTarihi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: service_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_invoices (id, "tenantId", "invoiceNo", "workOrderId", "cariId", "issueDate", "dueDate", subtotal, "taxAmount", "grandTotal", "dovizCinsi", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, "userId", token, "refreshToken", "ipAddress", "userAgent", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: siparis_hazirliklar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparis_hazirliklar (id, "siparisId", "siparisKalemiId", "locationId", miktar, hazirlayan, "createdAt") FROM stdin;
\.


--
-- Data for Name: siparis_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparis_kalemleri (id, "siparisId", "stokId", miktar, "sevkEdilenMiktar", "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
\.


--
-- Data for Name: siparis_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparis_logs (id, "siparisId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: siparisler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparisler (id, "siparisNo", "tenantId", "siparisTipi", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "faturaNo", "deliveryNoteId", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: stock_cost_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_cost_history (id, stok_id, cost, method, computed_at, marka, "anaKategori", "altKategori", note) FROM stdin;
cd66e2d8-1d2c-49c0-ab0e-2f44e600eb7a	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:54.966	CORTECO	MOTOR GRUBU	\N	\N
cf4a8b8f-2931-4d0b-afc8-95f10eeecfba	5109cd23-2697-4d26-a5c0-5a275de3b5b5	1908.6800	WEIGHTED_AVERAGE	2026-02-26 06:01:55.072	NRF	MOTOR GRUBU	\N	\N
bb269161-9818-42ca-a222-416c4803b07b	25ad586b-b128-46cc-8b9e-c5990ffde784	734.5400	WEIGHTED_AVERAGE	2026-02-26 06:01:55.167	FORMPART	ALT TAKIM	\N	\N
b5745dc4-f564-4f6d-a4d0-8188cc083ebe	17a2b899-c2c0-4d14-bcf4-2002d4ba1227	795.4700	WEIGHTED_AVERAGE	2026-02-26 06:01:55.297	SNR	ALT TAKIM	\N	\N
a4dc5028-2feb-4571-84e8-485c61b2001e	bb3ce01c-2764-47cf-8309-a69549833324	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.371	UCPA	MOTOR GRUBU	\N	\N
2f73e4c9-78e9-4da3-9a0f-488aa9f6308a	12f306ed-4fa8-4976-840b-8695956a54c6	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.477	VİCTOR REİNZ	MOTOR GRUBU	\N	\N
2928e907-4b90-49e0-a175-7d21d62c516c	2e369e1b-aa70-488e-9cd2-cc684d22429c	313.7500	WEIGHTED_AVERAGE	2026-02-26 06:01:55.58	KRAW	ELEKTRİK GRUBU	\N	\N
00d1e729-7728-445c-9945-29e6e0b2f427	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.651	SKF	MOTOR GRUBU	\N	\N
d4ff2dc5-1609-4094-9cd9-e562ae02f315	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.724	SİON	FİLTRE	HAVA FİLTRESİ	\N
ff4b100c-7988-4af9-b5a7-f9c2e8fd5100	b397902b-886f-4dc4-b51f-98f786381773	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.848	KRAFTVOLL	FİLTRE	POLEN FİLTRESİ	\N
1f1df1fc-51dc-4566-99ee-7bfe1d55f616	d9260889-4f94-4e97-8273-3e158999a1c8	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:55.962	KRAFTVOLL	FİLTRE	YAĞ FİLTRESİ	\N
3375658a-e026-4044-a96c-e17a3a252f7f	3b5285b0-9f9c-4e59-9b18-6cc747fbf8f2	82.5800	WEIGHTED_AVERAGE	2026-02-26 06:01:56.089	SARDES	FİLTRE	HAVA FİLTRESİ	\N
1ff8726c-7292-469d-ad09-168abde06c9a	e2c7afd3-89b7-46fc-bed4-84ca354efcaf	124.1500	WEIGHTED_AVERAGE	2026-02-26 06:01:56.175	FİLTRON	FİLTRE	YAĞ FİLTRESİ	\N
b4fb80c8-f148-45f4-a999-73fd6e964ee4	2b08a9fa-72c7-4137-9579-778a0e504eda	497.6700	WEIGHTED_AVERAGE	2026-02-26 06:01:56.29	ROCKSWELL	ELEKTRİK GRUBU	\N	\N
7c434839-dd06-4904-88b0-3951b92a1bb2	2d5f2164-3f2c-4e6b-a488-4df2d589239c	44.2300	WEIGHTED_AVERAGE	2026-02-26 06:01:56.41	SPK	MOTOR GRUBU	\N	\N
a17c4e2b-bced-42d0-8df9-9caf14939d37	dbad5926-e315-4d01-b4fe-dc558f119b97	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:56.492	LPR	MOTOR GRUBU	\N	\N
97a2f037-ba37-482f-8383-05b51f70c73e	3de93528-abd0-4183-b5e1-5287d08121fa	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:56.627	KRAFTVOLL	ELEKTRİK GRUBU	\N	Geçerli satın alma hareketi bulunamadı.
f3fb5779-cdcf-4035-a4e0-3d551d78dd8c	e87903d9-b116-4c34-af7c-ebbb99fd0666	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:56.713	BOSCH	MOTOR GRUBU	\N	Geçerli satın alma hareketi bulunamadı.
5dcef554-3f7c-434a-b5b9-04b6ccd04dce	6df6ee1b-cf84-45fb-8988-d3189073c7a5	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:56.787	BOSCH	ELEKTRİK GRUBU	\N	\N
fed667d3-244f-4b90-9fef-18106b70c2c7	3f4e84d5-294a-404f-a7fb-be0773c6a494	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:56.853	STN	FİLTRE	POLEN FİLTRESİ	Geçerli satın alma hareketi bulunamadı.
b5c92932-468c-4a56-87bf-dd707a6245ec	92870c73-cab6-467e-a7ba-792b4f279546	50.7800	WEIGHTED_AVERAGE	2026-02-26 06:01:56.944	HELLA	ELEKTRİK GRUBU	\N	\N
853906a5-ccee-49c1-93d0-4011a1befb59	75c4d717-f012-4e8f-a426-7ab1b2501f24	7.5305	WEIGHTED_AVERAGE	2026-02-26 06:01:57.032	BOSCH	ELEKTRİK GRUBU	\N	\N
07635b66-a8e8-4fe0-a648-89922518f730	1863e171-b0ef-4479-a0b2-2f08b1142281	23.7600	WEIGHTED_AVERAGE	2026-02-26 06:01:57.104	BOSCH	ELEKTRİK GRUBU	\N	\N
f43c80a8-ba97-423f-9861-64468fb11f48	14a09ecf-2c5d-4579-a891-371719a24a36	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.181	SUPSAN	MOTOR GRUBU	\N	\N
24164092-14d3-4359-8b75-e1af5fbffb9f	4f879a28-5567-48cf-9885-e8be3ef8c025	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.245	OPAR	MOTOR GRUBU	\N	\N
d0d5f38e-e45f-4acf-a5bc-85b4082f06ae	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.321	OTO CONTA	MOTOR GRUBU	\N	\N
f345b56f-98fe-4659-a425-b689c27d2a7f	492e3d84-3803-4117-8382-3defc2b33e8c	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.397	KRAFTVOLL	MOTOR GRUBU	\N	\N
fff4d34d-ae6c-495e-b227-6d7c0b60fbf3	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.477	GSP	MOTOR GRUBU	\N	\N
c1c22438-f00f-4dbd-943b-5a84dd78f3f8	747041af-5928-4134-b6dd-68c2c6081b29	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.553	ŞAHİN	MOTOR GRUBU	\N	\N
b163481e-6808-4328-9f2a-d11185f3f771	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.625	NE	MOTOR GRUBU	\N	\N
386210ce-e297-4734-a712-83022ece6107	30371764-9531-4d61-9636-4cdc385d9a6f	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.693	NE	MOTOR GRUBU	\N	\N
821d6079-c36b-413d-83d1-4e4ac41534e7	1d0a5188-ba70-4451-b294-96c61b46d3ab	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.768	MTJ	\N	\N	\N
b50e309d-9397-4566-a9e3-783879bb35cc	113d0d8d-5198-4415-b81c-5c812ed4e435	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.863	BETTO	MOTOR GRUBU	\N	\N
3e1d8685-00d6-4fc9-b2ab-bcc24cf54186	36595002-482b-4835-9f28-ec4c96336b95	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.929	VERNET	MOTOR GRUBU	\N	\N
942e0a73-cb81-464a-ac2e-d3d02493ebaf	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:57.992	ROYAL	MOTOR GRUBU	\N	\N
3a732c06-b5c6-423d-91e0-c7fc7145f5c1	26c7f88f-3f2f-49ba-983b-73a06fded6c1	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.059	KAYA	MOTOR GRUBU	\N	\N
acbce468-6cb9-4f1f-9159-b94936ae5a40	daddb524-bfd1-4c3a-bac4-7a762348f2c8	45.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.164	STN	FİLTRE	POLEN FİLTRESİ	\N
de7d3ebb-9853-486f-9180-8a2b49c64c25	607a89ec-c12d-498c-8900-5fcbc0f9ceb6	45.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.266	STN	FİLTRE	HAVA FİLTRESİ	\N
cf634173-bd04-459e-bb41-1f3fadcbb7d6	dccb985b-cbf8-45a5-90ee-3fa62d360f73	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.347	BRUCKE	MOTOR GRUBU	\N	\N
d799dc6f-5b59-4d96-aaa0-7c31d29d53e7	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.427	TOPRAN	MOTOR GRUBU	\N	\N
46418c28-8aac-4a3b-bdb4-a5bfc2207fd2	592f367c-0b18-454a-8ef0-8e863e86c613	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.549	KRAFTVOLL	FREN GRUBU	\N	\N
90ac8a7f-e58a-4c80-9be6-f61a1c77c3ce	a63c9f6f-2501-4b94-8135-530556ed3322	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.646	LPR	MOTOR GRUBU	\N	\N
2e2aea26-f6a5-48ec-ba1d-250335afa7b8	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.748	SNR	ALT TAKIM	\N	\N
2cdf6bdc-f672-44d1-b395-d2aca088c991	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:58.923	KRAFTVOLL	ALT TAKIM	\N	\N
a365e8a6-3541-45e2-a67c-167b44abe714	88c2c8c2-f1bf-4721-87cd-479024478cc4	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.01	KRAFTVOLL	ALT TAKIM	\N	\N
fc3cceee-432e-4087-906b-46a5c1a96f8f	acb90037-dc49-4d00-9bdb-5e201b87e61b	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.089	KRAFTVOLL	ALT TAKIM	\N	\N
b9130594-4215-4ae8-b700-967cd76be7fd	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.172	RIW	ALT TAKIM	\N	\N
c539070d-91d8-4bc2-8f82-ccbf75642e58	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.288	KRAFTVOLL	ALT TAKIM	\N	\N
ea85f54f-29b8-41a4-acbe-e344029fc3f5	7bce05e7-a94d-42ff-a4fe-084854e6e44e	1666.6700	WEIGHTED_AVERAGE	2026-02-26 06:01:59.359	OPAR	ŞANZIMAN GRUBU	\N	\N
3974816a-5c30-4bed-82f9-cf8d82ad669b	897aae4d-55b6-4921-8d25-c42dd6b82be7	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.466	LUK	ŞANZIMAN GRUBU	\N	\N
54656619-5026-4624-abeb-020358c1a8af	7d8077c4-da82-47a7-a7d0-c25eba803b25	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.629	EUROREPAR	ŞANZIMAN GRUBU	\N	\N
c888431a-1d03-415d-91a7-52468b11b079	9fc2242b-2719-4bf3-8363-f5309001394f	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.699	GATES	KAYIŞ GRUBU	\N	\N
1091bff2-a30e-44af-b8b5-357ec67dbf2a	db7262e7-7f97-4766-886e-9a78bf39705c	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:01:59.772	GUATURBO	MOTOR GRUBU	\N	\N
9e1b9363-bcba-443b-9f3b-106ffa887ba9	3f70b0a5-3f9a-410b-98bb-9af6e97ce85b	99.6300	WEIGHTED_AVERAGE	2026-02-26 06:01:59.883	EUROREPAR	FİLTRE	YAĞ FİLTRESİ	\N
1f9f1a4d-8dcd-4c02-a4f2-8233206b7bf8	c69a6141-7839-4f8f-925e-51a1ff0c0c66	134.2200	WEIGHTED_AVERAGE	2026-02-26 06:01:59.957	SARDES	FİLTRE	POLEN FİLTRESİ	\N
a60722d2-86e3-46bb-8db1-97a30a52be63	500f0a32-83ff-470b-b0fb-44365269b5c8	86.7000	WEIGHTED_AVERAGE	2026-02-26 06:02:00.057	SARDES	FİLTRE	HAVA FİLTRESİ	\N
91500388-8abc-4529-bec6-14a7384b6548	d390a057-d84b-4a11-9031-073e3de7955a	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:00.16	BRUCKE	ALT TAKIM	\N	\N
3de89692-9957-4156-b7d1-5f6b250dbc74	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:00.258	SWAG	MOTOR GRUBU	\N	\N
57475e4c-d598-49f9-a593-917229210b33	e9751b2a-071e-46ac-bc6f-6bcc5c2a6e29	70.0600	WEIGHTED_AVERAGE	2026-02-26 06:02:00.357	VALEO	FİLTRE	YAĞ FİLTRESİ	\N
1ba6c5af-8935-4481-be82-1a73d5dbe4f9	3f15dfee-cfd3-4307-a1df-c9cc5beb40de	118.7408	WEIGHTED_AVERAGE	2026-02-26 06:02:00.667	SARDES	FİLTRE	HAVA FİLTRESİ	\N
1933a469-979f-43f0-868f-bb4f9c074a2b	c441f074-9714-468e-93bf-3e653eff4524	109.0580	WEIGHTED_AVERAGE	2026-02-26 06:02:00.755	MARTIGUES	SİLECEK GRUBU	\N	\N
5671f16e-bc17-4a10-a46f-320c75d75b3c	61b32b7c-d3ae-426a-a8c6-78a7578f3e51	216.5400	WEIGHTED_AVERAGE	2026-02-26 06:02:00.84	TEKNOROT	ALT TAKIM	\N	\N
7337abf7-34d1-41cd-b8ac-c613a55aaaae	b59aa2ce-7049-4e9e-b735-2a52c901c1a6	134.0600	WEIGHTED_AVERAGE	2026-02-26 06:02:00.918	TEKNOROT	ALT TAKIM	\N	\N
a7c97ee9-a27c-4bdd-893c-8cb1fec41735	e8564a36-6b84-4a98-93c8-e78ba2d096bd	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.027	PSA	FİLTRE	POLEN FİLTRESİ	\N
ce95f529-c310-465a-8675-327784d38895	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.167	EUROREPAR	FİLTRE	HAVA FİLTRESİ	\N
fdefdfa6-9bdc-4427-a5d3-8ce3cc809efc	fac371ee-4670-4c55-a6af-1995c5297bab	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.263	GSP	ALT TAKIM	\N	\N
0347212d-6e37-4d91-a610-3c8e7c9770ae	befa4db7-76e1-4e25-b775-e5134a7aaad0	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.335	PSA	FİLTRE	YAĞ FİLTRESİ	\N
f146ba41-0b03-4e4e-b2e8-0b0d95b56437	7f69153f-992a-49d4-ba61-8c64f69f0b70	1729.8100	WEIGHTED_AVERAGE	2026-02-26 06:02:01.405	EUROREPAR	ŞANZIMAN GRUBU	\N	\N
170c5bad-55a4-4a44-8bef-6f08eb88aa25	4050e934-95b0-4db4-8958-3b2781c9843b	129.9000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.516	WÜRTH	SIVI GRUBU	\N	\N
170de16f-cb7d-4481-a480-e5b3246157bd	c7158d69-5a0b-4a02-a011-ae9eb32e9559	229.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.596	WÜRTH	SIVI GRUBU	\N	\N
2c2c7162-6902-480e-a652-b4f88226dbda	e86c9805-eeda-4ceb-85c1-3d574e3b74c5	2583.3300	WEIGHTED_AVERAGE	2026-02-26 06:02:01.678	WİSCO	MOTOR GRUBU	\N	\N
c18c5f33-dd8d-4f3c-8d95-e3f3830e9bf5	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:01.765	EUROREPAR	\N	\N	\N
7631e61d-ab36-4e62-9353-1d30ddbe50a6	5f0e462b-b67d-48be-b9ee-9a1bc9543482	99.1500	WEIGHTED_AVERAGE	2026-02-26 06:02:01.859	PSA	\N	\N	\N
3cecf7df-de71-4564-80f1-9218f2be05d2	46aba001-3916-4498-872b-d43e43d587b9	378.3300	WEIGHTED_AVERAGE	2026-02-26 06:02:01.942	CORTECO	MOTOR GRUBU	\N	\N
72f0f7f9-0c80-4935-af45-2d136099691d	d494e5ec-be68-409d-a50d-227e1d0df98d	83.1802	WEIGHTED_AVERAGE	2026-02-26 06:02:02.034	FROW	SIVI GRUBU	\N	\N
52e0c4f6-4d3c-4154-bf6b-281dc3e3b181	667aab2b-caa4-4826-b3e8-533ace431f90	58.1600	WEIGHTED_AVERAGE	2026-02-26 06:02:02.166	KAYAPLASTİK	\N	\N	\N
6a4d0974-079b-4c84-bba8-e85d8b486eeb	1610b0fb-c0fe-420d-b8cb-ea32a03c80f0	58.1600	WEIGHTED_AVERAGE	2026-02-26 06:02:02.248	KAYAPLASTİK	\N	\N	\N
3ab63335-5385-41f1-bee0-827029987bbd	b6f21c2b-6225-4ebc-8387-557f81d0b08b	442.7900	WEIGHTED_AVERAGE	2026-02-26 06:02:02.327	SARDES	FİLTRE	YAKIT FİLTRESİ	\N
5dfc0327-06f3-4946-8a1d-4f8f5ace10df	5f0b3771-26f2-4905-bae6-85d77b9a5ec6	20.0990	WEIGHTED_AVERAGE	2026-02-26 06:02:02.435	ÜSTÜN	ELEKTRİK GRUBU	\N	\N
cb220b01-3eff-4e27-9482-672b78c1da85	1e356282-dd07-4f5a-879d-0f8568734952	154.7700	WEIGHTED_AVERAGE	2026-02-26 06:02:02.508	KRAFTVOLL	FİLTRE	HAVA FİLTRESİ	\N
bd4b82f6-12eb-45b5-9f0b-b7ad7e53f925	7587710e-9c19-4911-bf83-def195b942d9	211.8900	WEIGHTED_AVERAGE	2026-02-26 06:02:02.578	BOSCH	FİLTRE	YAĞ FİLTRESİ	\N
71fb4387-b2ab-4b1e-834c-77660fd5c0d1	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:02.672	KALE	MOTOR GRUBU	\N	\N
929f76cf-c531-4032-a1c6-5badd33e91de	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:02.757	HELLUX	MOTOR GRUBU	\N	\N
ba769b9f-c079-4b73-888a-a1884d038edd	de03694c-358c-4793-bac2-b876476ea2d0	143.5310	WEIGHTED_AVERAGE	2026-02-26 06:02:02.82	KRAFTVOLL	FİLTRE	POLEN FİLTRESİ	\N
026f0303-4a0f-4861-bae5-a9b1dc8e69be	d7887add-f677-414d-97b4-f90faa29e648	597.0500	WEIGHTED_AVERAGE	2026-02-26 06:02:02.886	TAİWAN	\N	\N	\N
231d1045-930b-4ae7-88f8-b9675246d82d	f4462d6b-9686-447c-9310-9c9012b3d20d	1140.2600	WEIGHTED_AVERAGE	2026-02-26 06:02:02.962	GSP	ALT TAKIM	\N	\N
fcd00847-1e70-4abe-aa5f-e2c3a1be8d0e	4c1f9e58-ae36-4450-812e-39de8a07c684	1140.2600	WEIGHTED_AVERAGE	2026-02-26 06:02:03.033	GSP	ALT TAKIM	\N	\N
83560695-c495-4000-97cd-580d1a97f9b5	82954b03-1b54-4287-9f86-3ac85168279b	86.0200	WEIGHTED_AVERAGE	2026-02-26 06:02:03.109	SİON	FİLTRE	HAVA FİLTRESİ	\N
86336e61-c9a2-4c7a-878b-ed6d6c61b0ca	1569bfc9-fc44-40c4-8f38-99ebe9434284	61.6600	WEIGHTED_AVERAGE	2026-02-26 06:02:03.176	KRAFTVOLL	FİLTRE	YAĞ FİLTRESİ	\N
0a4b3e31-f670-4694-b014-ec5003906f62	b0f25455-7deb-4e68-b004-8b54b7fdd2d0	98.4600	WEIGHTED_AVERAGE	2026-02-26 06:02:03.241	KRAFTVOLL	FİLTRE	YAĞ FİLTRESİ	\N
474b657e-e120-403c-a02e-f0a4558f5ca0	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:03.314	KRAFTVOLL	ALT TAKIM	\N	\N
7caa5885-e357-4542-8627-e23a15ecd7b7	a0a99d75-4606-47b2-b661-9d3032cfcc4d	797.7400	WEIGHTED_AVERAGE	2026-02-26 06:02:03.386	OTO CONTA	MOTOR GRUBU	\N	\N
ed59ccc2-c149-4cd1-be9f-9a9c7eface18	f2466b52-e1e7-4307-b0e6-ff537b7864c6	102.6900	WEIGHTED_AVERAGE	2026-02-26 06:02:03.454	BMS	KAYIŞ GRUBU	\N	\N
3a5818aa-a43b-483d-bb05-123496612408	8a3c1cf2-36e4-48c2-8cab-0a9d7daddb12	129.7500	WEIGHTED_AVERAGE	2026-02-26 06:02:03.538	ABA	KAYIŞ GRUBU	\N	\N
7faa13ca-41e8-49c3-b253-c01800a3a84b	ce172f29-bc42-472b-bde6-2ce7be654416	622.6500	WEIGHTED_AVERAGE	2026-02-26 06:02:03.629	ZENON	SİLECEK GRUBU	\N	\N
72834388-ffe8-444b-92ea-a57432a70c01	a9a3989f-edcf-493a-88e0-4250d87bb6ba	138.8700	WEIGHTED_AVERAGE	2026-02-26 06:02:03.72	SİON	FİLTRE	HAVA FİLTRESİ	\N
879a38b8-8775-4a1a-979c-3b34317f28b3	a7afc855-d4aa-456a-811e-a162f685e1b1	148.1900	WEIGHTED_AVERAGE	2026-02-26 06:02:03.807	KRAFTVOLL	FİLTRE	POLEN FİLTRESİ	\N
f006c18a-326e-43ee-a2a0-ccb8755c75b0	d55c6017-a666-4c0f-91c5-05801d2bd8be	420.5200	WEIGHTED_AVERAGE	2026-02-26 06:02:03.884	MANN	FİLTRE	YAĞ FİLTRESİ	\N
e49bfa23-db8a-4889-9795-5d8ae8f696f0	c190aad6-0676-492d-934a-28d3ff6e2bd2	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:03.962	SUPSAN	MOTOR GRUBU	\N	\N
79650454-5c9f-4a71-b5d1-3814c6bc346d	9313625f-754f-4bab-8e48-68dac414e3bc	0.0000	WEIGHTED_AVERAGE	2026-02-26 06:02:04.034	YENMAK	MOTOR GRUBU	\N	\N
\.


--
-- Data for Name: stock_moves; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_moves (id, "productId", "fromWarehouseId", "fromLocationId", "toWarehouseId", "toLocationId", qty, "moveType", "refType", "refId", note, "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: stok_esdegers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stok_esdegers (id, "stok1Id", "stok2Id", "createdAt") FROM stdin;
\.


--
-- Data for Name: stok_hareketleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stok_hareketleri (id, "stokId", "hareketTipi", miktar, "birimFiyat", aciklama, "createdAt", "warehouseId", "tenantId", "faturaKalemiId") FROM stdin;
ae6334bb-1a98-4965-8ea0-4be715e61ccc	7f69153f-992a-49d4-ba61-8c64f69f0b70	SATIS	1	2300.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.934	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ebdf1aa0-b8a6-4f5d-bcf2-9775ac7652f0
deb454ce-d6fe-4b4e-bc94-119b0b71f7bd	fac371ee-4670-4c55-a6af-1995c5297bab	SATIS	1	450.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.936	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6ca695d4-cd8f-46dc-8cab-dbc04a1e5458
21396681-ff84-4404-99d2-fd8b74549cf5	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	SATIS	3	1000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.939	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d01b6f71-6749-496f-b39e-fe00ea9be7c0
03962296-cb07-40a7-8ce7-c76839456c61	befa4db7-76e1-4e25-b775-e5134a7aaad0	SATIS	1	500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.942	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	528fc24b-eba5-4f61-875c-9f39b0fffbab
9a128390-4cbb-46f9-9232-e3765dcfa6c5	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	SATIS	1	750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.945	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	87337866-1f13-49b9-b1d6-103799bf7385
123e7a37-b03e-43de-a56b-4ce901819917	e8564a36-6b84-4a98-93c8-e78ba2d096bd	SATIS	1	1500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.948	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b15e0520-ac00-4bfd-9e96-8c6d9398e5c4
5d12749e-ac44-4c2c-be08-a4f01ca6794f	d390a057-d84b-4a11-9031-073e3de7955a	SATIS	1	590.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.951	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	49da3345-200f-46bc-8efb-7001e4aca797
68e98435-eb88-4046-9df1-5585bea4817e	9fc2242b-2719-4bf3-8363-f5309001394f	SATIS	1	1450.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.954	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	235b5232-a3a9-4c5d-a5fa-c27dd41631cb
c70f6055-47de-4701-99da-8caf1e40af61	26c7f88f-3f2f-49ba-983b-73a06fded6c1	SATIS	1	320.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.957	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d140f21e-da64-4652-a177-ea03b65b2e7f
ba477cdb-a786-49d3-93e9-db5c5247112f	36595002-482b-4835-9f28-ec4c96336b95	SATIS	1	550.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.964	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1232354d-2246-4310-a2fc-84e48b8fe1c5
31d144a2-d29f-434b-b087-e76fec94c1ee	dccb985b-cbf8-45a5-90ee-3fa62d360f73	SATIS	1	450.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.968	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	96e87fc5-c00e-4dd0-87cf-0b105b08632f
66c09fa9-87aa-4127-b041-b1ccfa3fe6ec	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	SATIS	1	4300.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.971	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7b74f3c3-b2de-4aeb-9f28-01cea3ad3a73
b82acec2-a0e0-46c0-87e9-9d6a966eb2ad	ef1b99c8-f47e-4cd5-b239-fa50abc46139	SATIS	1	90.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.975	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e9c19d8b-0573-4505-9be7-29aabe4813f7
66dfae6c-ed46-4424-8e77-43106689f221	822d5979-a68a-4d37-9d77-e99723b98af5	SATIS	1	60.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.979	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f674749f-dfaf-4b76-9d75-76925d0347c1
a8784215-5b96-400f-8c61-4d5d8844bd9f	e4e92397-048d-4573-9190-b9451b01bc43	SATIS	1	1900.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.982	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	47918c96-40ca-4d55-9b70-5299a17dd7d9
6ddb93e6-e913-4bd9-b809-982a6c01baef	5e3e1253-3eba-4592-b7e5-521aa7e8b4bd	SATIS	1	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.985	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	300a07d8-18ab-49ca-b6b6-9d2d0600d1fd
69486aeb-4f43-4818-8f48-9579ea6afaa8	8af369e2-616d-4b8e-8e85-ce7580771548	SATIS	1	1550.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.989	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3c6e2b9-1972-4fbe-be6e-7db54c2e1222
3f65890e-bb07-4ea8-853a-132d6246e0e1	35fa2343-4314-4fcb-bb8f-8ea508fe9030	SATIS	1	5500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.992	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4b372121-f81d-4d7f-b4dd-7147edd4a176
c2e5f306-ca16-468c-88b1-0a35e8a27005	b2447e12-55c1-488c-9af5-86502190495c	SATIS	1	4350.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.995	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	05bf6442-93d3-4dd3-a702-44f473f1db16
b0401156-5abb-4b6c-a63a-a0800fd257fc	279b1a94-66d5-4c7c-aa8d-a3222332d30a	SATIS	1	7000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.998	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3e158171-31c1-487a-9dbb-a738a51890af
a1718e8f-4aa2-476b-bc54-2731d6d76122	d27eaf8b-5790-43b3-9bf3-a4610454c87a	SATIS	1	820.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.002	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5527cfd4-8301-48d6-9ebe-3df36eb733ca
d2d53e7c-a30b-4105-b1b3-17e2a7cc7a37	988a9c98-3f14-4618-b4d6-b7d34ab264bd	SATIS	1	1400.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.007	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9ffb9229-298c-4c2c-a093-1835d3451549
c5babe9d-a066-427a-bc36-c492ce5835c1	71421321-d7cf-4b8a-b19c-50af5898a64e	GIRIS	1	1399.31	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.932	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2be1b150-8a4c-4f67-97ad-b5ed64787fbb
cda6ff94-3c05-4363-a516-65240554b269	d2f488da-7400-41ae-98e4-1a595388e858	GIRIS	2	334.44	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.951	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	82e19c0e-fc8f-483e-9aea-a6f110ca43b6
2e5ab6bc-e8bd-4f81-ada0-712df2e3079d	548559e5-7b74-4fee-8ca7-a0e9b8aeac70	GIRIS	2	658.55	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.965	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	13b844b1-754a-4b5e-a302-03360e14b03b
0dcd5981-7b9d-45cc-95b9-c74823656a20	2561bd07-f29f-481c-ae36-20de2c879c00	GIRIS	1	805.81	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.972	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1bded921-85b4-495c-829f-431715dbbfe3
5389cd91-8243-431c-b67b-ce1b5218752b	131c7e23-9a7d-43da-9427-045ed25f54b3	GIRIS	2	310.56	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.98	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	36f15c3e-167f-462c-b1a1-7439f7b5a32f
b6724764-721b-4c25-8a4d-4d7f1aef47bb	60033cc9-3e22-45e7-baf2-4d34e749d992	GIRIS	2	261.35	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.986	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1827948b-2965-426a-85d9-7c2926efc5cd
dc1f99f1-5f2a-41bd-bb4a-4a083b46e746	8763c316-02c8-4cfa-9ba1-1e6a8d2d33b9	GIRIS	11	152.50	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.991	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6b9e899f-3434-48f5-8733-48e5b481deba
3140ee70-0707-41ec-b610-7aeaa885db4a	3d149e26-d8a8-46d5-a4cc-fd65a694a14c	GIRIS	2	658.55	Alış Faturası: AF-2026-065	2026-02-27 10:12:25.997	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	eadce928-a83c-4917-ba91-7c269fcd2423
425cf66f-68d1-448d-82df-cf82e981e336	004edaac-e8e7-4beb-b83f-5fda41e2dc76	GIRIS	86	43.20	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.002	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e7ab5c48-5be5-4ce7-a900-a7e51b2509db
a397f614-5703-459f-a185-74466dd70967	671a59c3-7899-4183-882d-f6e8a7df749d	GIRIS	82	43.20	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.006	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c2d19a9d-ff8b-4173-9a33-cbb61b6238da
eef538e6-0bbc-4acb-ab41-d44aa95ac7fc	6315e802-afa3-40a5-aec2-b01d41769e0c	GIRIS	97	43.20	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.011	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a0f8f9d5-ebf5-49d6-8823-943babc20096
a400b42b-5f8c-49ba-84a8-97ac430ea6d8	ddc3276c-d7a6-4a50-ae29-400c45433944	GIRIS	91	64.80	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.016	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e83fd1bf-d207-4d2b-88ad-3c537821c4be
16db3b57-9cdc-46f6-ace5-01aa1b128f69	2414eb7d-9910-4cd4-a366-274029e0dc35	GIRIS	89	64.80	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.021	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9da6e611-5267-4492-b651-b520db5c64ba
bf1f285c-4a65-4ab4-804c-5aed2da0fbbf	7161764d-bc61-4550-b713-434552082435	GIRIS	99	64.80	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.028	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	291b1ded-ecb1-44fd-b783-718620f67ba4
51207846-a356-4862-b68a-4fb1ab8c4f63	8d45b3b7-a66d-4ac4-861f-086d9fb93061	GIRIS	104	86.40	Alış Faturası: AF-2026-065	2026-02-27 10:12:26.031	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b1a1775-b4c3-4ff4-bd69-5c35fdd2dfd0
ac3b1cbe-432d-477d-9314-e4bcff3d2fd2	930f6256-fc6e-45e9-90b3-3ba06c0a0d2e	GIRIS	1	346.22	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.036	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	288373e0-489e-4e7d-9be1-ee5914230c48
0fc83ba1-dd6b-460c-ae0a-7c6bb192e56b	9f768a37-b9bb-4d12-8d8e-145f47172ef1	GIRIS	1	204.85	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.041	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	839c5b3d-057f-49c5-9b72-da432e6896de
0f4a8a81-b97a-4dc3-8d7a-3b667a30ef57	2a77dd3b-6a11-4a64-a3e7-27102fd2564e	GIRIS	1	1170.97	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.045	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f70f9786-10db-402c-a8e8-2b75b365c6a8
2366bc11-309c-4052-856c-c1e7403b16ab	4c5ab026-e42b-4ef9-ace8-8c41d09f127e	GIRIS	1	1170.97	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.049	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	edff6660-39ea-4428-a16a-826df10e1d15
190cb759-f585-41a0-b552-35c08628c1ad	36554292-a6c6-4759-b86b-6d12f28fe79f	SATIS	1	1400.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.011	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	abf36779-dbec-4a34-ba42-4aa57bc52bf6
64807441-9419-49b0-bef5-b33af7296a4f	4d5a2911-661a-4939-bd75-24ef80fe07ae	SATIS	1	2400.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.015	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6434379e-83b3-46ad-9573-90290a03dcb9
3679b596-4bf0-46c9-befb-acf2eab73250	6df6ee1b-cf84-45fb-8988-d3189073c7a5	SATIS	4	125.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.018	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e800a3ea-00fd-40c6-bb4e-d2cb215b79ee
f2f2f6ea-e4fc-4c68-a894-f3959cb33e8b	95524c06-81bb-4523-a9ad-7904f769d866	SATIS	1	650.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.022	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	50e131f4-9004-49e0-91f7-64a77191a683
88227230-3689-498e-9789-33e66e1e1494	fd0e24dc-66c8-45ad-933b-6a5e81fa0647	SATIS	1	7000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.025	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0561f2b5-421d-40d4-96c0-9003a31779eb
0843acbf-b9d9-4fd0-b5d3-f77264cc8d58	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	SATIS	1	550.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.028	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1cb54820-8276-4690-a544-6d9e8461bc0f
c757c812-53ee-45ed-8ce9-2d891a67618f	c169b88e-7166-4701-b53f-d6defa6e9351	SATIS	1	235.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.031	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9c8b65de-ed91-4351-81cf-83e2f157f421
43f2998d-a5ad-40f1-a301-2585497197bd	683958d9-6c77-4716-884a-63f720f799b1	SATIS	1	130.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.034	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e8d240c3-c6fd-4702-bce0-017cf7cb7e5b
abf60be5-4a53-47e3-9b2c-8580ab5f149c	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	SATIS	1	1700.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.036	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2e3e8d41-7731-4138-950a-a0e88670551f
42ef980a-6ddc-4498-a7f2-d998d4a7fcb2	7d8077c4-da82-47a7-a7d0-c25eba803b25	SATIS	1	2200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.039	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	423025e0-d975-41dc-9941-cef49a110dd9
4031d809-5d24-4594-a492-875ab9552b21	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	SATIS	2	1000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.042	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0247dfb2-0863-48cc-b353-09a7ab2b22bd
99e9342f-1ba8-4856-b575-fa967fd62144	592f367c-0b18-454a-8ef0-8e863e86c613	SATIS	2	150.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.045	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c82c1972-fa98-4679-849f-1ddf30f88d6e
bcf7c1b7-35d1-45a4-ab11-65cd6452b194	c5b27835-d336-463d-bf80-790aa4e4d28f	GIRIS	1	216.60	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.052	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	26db3abc-ba27-49e3-b96f-3fbee5e2a602
9b36ca84-d5d4-469a-8cb9-905a403ec70a	8b7704c0-3c29-48d7-9d73-4f5c6f7b1b78	GIRIS	2	859.02	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.056	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	53ae709d-88ab-40b3-b2db-d4398d65ecbd
21d08049-8101-4f1b-9153-2f37ad8c1321	bbce53f5-9703-4fa2-b89f-3f0173567ec7	GIRIS	2	295.41	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.062	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fcc098cb-6a2f-4f4e-b12e-f2ead701e6b3
85a082cc-8832-4d53-8d06-6815cafab6ef	b1ccf186-4d92-45b8-9ce3-b13fcdb1e9ec	GIRIS	1	251.10	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.067	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	94a3844f-7c4b-429b-9051-7f3432fc56f2
78aee5b4-a699-4bf1-a1ca-dca7e0433e65	fc2afb32-9ac3-47b8-b512-85f10f99927d	GIRIS	2	177.81	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.075	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cd67a8d8-6d7e-40e1-b2c1-386de39a93cf
a2cee477-2a41-4e8c-b2d5-559f06e6b889	278d4952-57d9-434b-8118-b0d8cd2f5f7e	GIRIS	1	275.82	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.081	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d9a0eab5-d22d-4d15-8fd1-546bfbfbbfe2
8ffbd1da-149e-4877-b24e-9da340b274f8	f2f45ce5-f6f8-4bb2-b909-752881d47ea8	GIRIS	1	212.22	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.086	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b115f25-58f6-4ba7-b857-cb593d16200f
ece75730-6cd2-4fe8-a100-43fb872175f1	0ffe352f-339d-4e61-88de-7149b8afc714	GIRIS	1	275.85	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.095	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0f8a6fc4-070e-4a70-93ef-33e1259c9f53
b2870cc8-3eb5-4fb3-83b9-305562f3122c	37ccbf67-f1fb-4efe-adb9-bec3eb6b74a4	GIRIS	4	221.45	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.101	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5401059a-edbf-4ff4-95f1-46e50f978979
8844bced-d2f7-4563-bbfe-f4afa2a8b282	f9422f30-de03-42d3-92de-02b2c4f6335a	GIRIS	1	201.58	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.108	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	02c64c5b-5c8a-48c8-b1ad-aff43006e779
554d6b3d-185a-4ded-93e4-8d36039ef5b3	42f0f7dc-8e6f-48cd-8311-579ad8b3c675	GIRIS	1	277.49	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.113	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ed69d164-6a88-481d-8037-ccee7b676dea
bcfde93c-0726-4038-aaf3-c07bbb011977	032416c7-f9e3-4fa0-b586-90e07156a768	GIRIS	2	1283.98	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.119	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4b0b18cd-4cd2-44f0-9361-e8ffb6827038
7ef36760-0058-4e41-93d7-070c8d91bd0e	d2cbab72-3058-429c-864c-65f4045d738d	GIRIS	1	212.22	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.123	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7b28467a-62ab-4b24-b8fe-0be738d64ced
41446f90-c117-4be8-90a2-efdd1bc12cd2	3d90390a-c14a-4b54-8e81-c4178baaac92	GIRIS	2	262.06	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.127	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6bf35901-a58a-4bad-a318-fcf488d45e8f
028d6091-03de-4ef6-91b5-37ff9418b39f	78b769f2-e303-4922-aacb-31702ee3bfb8	GIRIS	1	215.81	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.134	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3241f9f-9352-49cc-8aa2-aaed5f2b8008
beff016b-156d-4aeb-93d7-c59fabea7340	6f84d650-de71-4a6c-8a6f-09889437a169	GIRIS	2	859.02	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.155	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bf05ac73-eb55-4d08-9aa9-5afb043ec654
f52a5aed-c862-438a-a9db-fa3028bfbacc	148d7662-16f0-4d3a-891e-b1116c0bada2	GIRIS	1	268.75	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.172	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	68c6208a-943f-48bb-8c69-2fb14be87baf
b478fafe-edf1-4429-8c28-9e02be78d6eb	ffde3af8-5fda-4538-a5d0-91b38ce27ab4	GIRIS	1	309.17	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.187	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	242ce35f-676c-4fae-9d77-12a5e098fbb4
8d6b0f7f-9980-4dc2-b7cb-0f9862dda9b0	27331b7c-8381-4f26-8ebc-8858be739a70	GIRIS	4	306.01	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.215	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3bc894af-d69a-4e97-b10c-2a86db28ed3e
bcec0deb-8822-41b6-9d0a-d7e4dc8d06cb	db2b093c-7561-4cde-b149-f9247462f9f4	GIRIS	1	270.10	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.223	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	14978d86-cf17-4f83-bc48-9a229f4cc920
36cee0a5-b334-4ad1-9283-5402fdf3e7bf	32940a5e-6297-4658-87e3-b4b65b491b39	GIRIS	1	309.17	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.229	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c9818213-996d-4eda-ba37-b6b38c3a5f2d
2e37b697-03e5-4847-84e4-9579f4e4fce9	1b77495f-b548-4987-a40c-5fc3afc5f2c0	GIRIS	1	175.98	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.232	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ef82f9d6-43c5-4e49-91cf-42a65253ab7e
d9b5deb3-361b-422b-831a-e70f49a0e227	b94d865a-7c16-4b48-9989-1ca01a24f52f	GIRIS	1	213.65	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.236	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1ada8818-6c1b-4632-9e26-2916e5de8f56
be51ecff-20fa-47f2-b900-15ff8718d301	a9434f6d-2f41-4b2d-aada-242bc0e0c46b	GIRIS	2	235.39	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.242	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4a1de37e-7d63-46c0-b1a1-1dbb48be2662
a854a6a6-e97d-4664-84c3-030e9fb5d578	75209558-85aa-4085-982a-351ab8643d4f	GIRIS	3	220.14	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.245	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a18993b4-d749-424c-9ed2-4ee8129b4786
9526fee7-96c6-4f53-a5f4-6f4e4afe8307	acd2f729-40f2-46f1-9469-f733175ac48d	GIRIS	1	418.28	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.249	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bcd46991-aaf2-4a44-8185-e30a9d162f33
06324a42-f5dd-4fcf-aeeb-003c1ec08c26	476ae946-ad94-45c0-91ec-1aa5adc9436d	GIRIS	1	509.05	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.252	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	999b4412-82de-405f-91ef-9dfc3b3a4717
b14d830b-3e2a-49c8-ba65-c67584833db3	6a123faf-3a94-467f-88b8-c1151c375685	GIRIS	2	207.99	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.256	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	04e4e5e9-8c8f-4133-b9c2-fb57d1ca0832
b1e72597-062b-4cd1-8104-cca5a8c04959	db7218ee-f345-443b-b5b4-3a15394ac27e	GIRIS	3	1147.04	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.261	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	44ef2cdc-5454-4f23-ada0-2bf0d897045c
3241ec3a-2411-4d03-b5af-0c10561ba7c8	b07b2ffe-19ed-4f6f-a190-837e9b23d6d7	GIRIS	2	220.14	Alış Faturası: AF-2026-062	2026-02-27 10:12:26.264	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f3fda6a6-3f57-4a1e-900a-0487ae147bc5
c0048062-dfbb-4693-a2b8-924f754c5a2f	bec4b643-730e-4c3c-94f8-4f1e099b110e	GIRIS	2	268.75	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.267	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	17305322-8908-4456-8297-795843ce4d70
3df2ff0e-3e23-4b02-a584-db63ee565dac	7f7af4c6-1bf5-4030-960b-3c4a7b88b5ca	GIRIS	2	205.67	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.27	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c7ded41e-9c99-4614-b2f4-e57a049d17d6
80ae3558-3cbc-4319-b15e-ff3a23feb02d	de33590b-e026-4207-ab4d-79f304927680	GIRIS	1	1719.68	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.275	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bef63212-3c4a-471e-9dcc-176e2f32dfff
ef104d8a-df4b-4e51-b6a6-a35603b01930	fbcb824f-ec91-42de-9a26-05143159b41f	GIRIS	2	272.54	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.281	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	27b44af2-b73b-447a-b13a-a0fc24489585
dd5db185-495e-4822-bf6b-caabcb203a00	28474efe-4089-49a8-8ba7-99aef6864cdd	GIRIS	2	302.81	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.287	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f7fd3246-1d43-4b27-936e-92b7043ceaf0
def7e995-c6b7-4061-99ab-85b6590c07ae	dfc96592-f0c6-453a-a0d1-227eed8a1d57	GIRIS	2	191.60	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.291	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	41428f8f-dd81-4917-a7b1-17a59b1d4173
339c096f-80df-4150-8837-42fbf103212c	6dd2b8ec-3a93-4432-a5a2-228721fd1827	GIRIS	19	142.15	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.296	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3a3fb26b-ca53-445f-804a-0faf96110716
77b1b403-4af6-4a58-b6db-e4d14d2e89f2	4d3ff301-3464-4475-b2a0-62afe3d29089	GIRIS	1	156.61	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.299	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb0d9518-7b1a-42c8-9c05-61932e17ecac
eb2acf68-8a36-416d-8fcb-c145a5a6af51	b9b03747-7395-4d01-bde2-d1cd3f317433	GIRIS	10	184.61	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.303	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a947fa1e-1cf4-4b3e-82bb-1f2b93ff6205
c8407020-f0d3-4bf2-8aa0-f7aef357e338	e586c5e1-309f-4ffd-b8d8-c1ae79c14f44	GIRIS	2	184.07	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.308	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2a8badab-af3a-49fc-bb3b-fcac8d504b08
e56ad2eb-fe88-482b-8f8f-096e0b08e590	b018ee41-7b4d-4f74-a04a-02ae291c9e9f	GIRIS	1	252.29	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.312	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2c4fee4c-ef96-41ef-955f-e57c1bd2fe70
156d05af-f052-4ddf-90d2-e8be013199a6	a3e3cd4e-2bdd-4cef-bdcd-5c9c8addecaf	GIRIS	1	181.60	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.315	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c08faceb-f078-4608-81c6-c49a78c7cd21
1ca9c962-3c6d-4dd1-b381-b9bc026e3f2f	277aff93-eb25-406b-9844-3da213e2a754	GIRIS	1	166.52	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.319	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7eac7e65-73be-4387-8a90-92377bdbe143
66eca309-fbab-454d-84d4-fdbc602d9e1a	5bd04c4c-ecd5-4173-880f-0a085f5af79b	GIRIS	2	179.23	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.323	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6b89372d-91b1-4f7d-9edf-2fd1dea0a54f
eaae5c16-594d-4b1d-bb83-c33712c34954	2fa8e81b-f7dd-41e6-9aa1-6685e8ae6528	GIRIS	1	225.54	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.332	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9ab6cbb3-434d-44f7-b82b-da682f0dc0be
48e9f7e9-9042-4144-b2f9-ab793136eb14	9ce88d50-7dcf-46b2-adc4-2491bb399ac7	GIRIS	1	236.52	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.336	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	49606b2e-811a-447c-aaff-4f5d76bddcaa
f4cb0bd1-af25-4fbf-ad53-f29740f21b5a	43d1828c-9724-4bff-97ad-9e6e392e7a36	GIRIS	3	906.65	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.342	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	26fb8138-a94d-4090-8ac5-0df3a735cd95
6b1c2cec-0c35-4226-a5a6-8922616b853a	4059133c-7f54-4ed2-8687-bec64b211e2d	GIRIS	2	1719.68	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.349	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a12b6974-1856-4912-9edb-cb574b334c4c
a6146f6c-327b-4912-9c93-6e77ce40b494	accfe98c-346c-4900-8d9a-cf567da6c324	GIRIS	1	210.65	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.354	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	48bde053-2247-44c4-ab3f-2b343f38d9a0
1a54a213-d96d-4163-b3bb-bb4236355227	ada96211-ff8d-431d-b264-ce87827e2ecc	GIRIS	1	183.65	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.363	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7a88afe4-8998-4ca4-9800-3f32c2dc243a
82e1ce63-6f6d-430c-9e87-aff2326d2ad2	fdffbeeb-e382-4569-8224-41512fb4ce71	GIRIS	1	205.16	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.368	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c0b51a69-c037-4e6e-8202-be6fb593e31e
4c3e04d5-c115-4965-921d-e81e4ffdcf1b	a5ca11e0-73b9-4650-8a39-1ef8b3a75365	GIRIS	9	196.90	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.376	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	850fcca6-f9fb-4ded-84ee-f2dbbab26a90
f7509afc-c357-4ad7-a6e4-4931de04cee2	90d77bf3-2ff7-4e74-8844-f0da9f873c5a	GIRIS	5	627.74	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.381	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f12453fc-0031-47c3-b505-22ee58115c87
c5b96582-5d43-4b48-857e-710fd1b4ad5e	c6a243ee-bc35-4d9b-a138-392678a6d2cf	GIRIS	4	229.32	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.385	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5952c819-cebc-4a0a-9835-bde595d2322d
171330f4-47dc-44e8-bcaf-960af094302c	2b1a35b7-aac7-494c-b5a5-9bf869622673	GIRIS	4	1008.51	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.389	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fd202408-822e-4119-b847-5ce931f7833d
1d24010b-ec2b-4b56-9fa5-3b64bb646240	070e5e54-43e2-4de3-b75a-250cc4d4d45e	GIRIS	1	196.90	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.393	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	975e990b-002a-44c5-af8b-da4f6aad3cd4
65833bb0-79e5-48d2-84f4-e67a30629399	f601c5a7-7c41-4475-9ab6-c1d5c8743d34	GIRIS	2	241.93	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.396	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bd77b1d3-a010-4f84-a266-a0cf82d964d1
808dfc4a-8d95-4a7f-a3f6-8d4ebdf9ef27	7d15f66c-6269-4203-b1f2-58cb67e4697a	GIRIS	2	286.24	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.4	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	27cc1e71-f020-4957-a522-500deed2f74a
02e68694-88ea-4690-8199-a3eeeb0e46db	b9b6bddb-1026-4e9d-a9ee-07cce8e4ea9f	GIRIS	1	322.84	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.402	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	28295d08-ae15-486d-b340-19f5baeceeea
5963d839-b4a2-40de-845b-3d5ca2295089	b982a42c-77ef-499d-b642-5fd12bdad920	GIRIS	1	1874.20	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.406	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a333ce32-1b9f-4751-99ca-d459ccc77a91
ba7b6ba7-527e-4145-b432-2635ddec7316	93c1a751-625a-4007-8669-abeaf07a7e7e	GIRIS	1	194.68	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.411	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3faca6fd-8292-4499-a738-ae3e06ced547
470bf948-0f60-4399-a3ec-40738db2276d	d805c08e-d5a7-442a-a792-5a853fd1cbc2	GIRIS	1	288.92	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.415	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dec80a55-65dd-4418-9773-f087bbb01e70
0ffdfddf-687e-4197-90cf-d4703ce2f444	7eff05bf-54d7-4299-b363-c7605575e95d	GIRIS	1	1009.15	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.419	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6c763434-a3fd-41fb-9f00-0635e13206d7
90cc0fa9-e181-4d0f-85b1-02e849238843	f10988ad-312d-4b3d-b24f-acc6f1ddba83	GIRIS	1	291.61	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.424	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	113d1606-9bc7-4282-bcb7-82ef76f90ec3
495f7edc-ff06-4662-ab51-0adac1120f59	ba6bb89d-d9b8-4e0e-8ac6-8e01f8b41dda	GIRIS	2	216.91	Alış Faturası: AF-2026-063	2026-02-27 10:12:26.428	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	875cf473-d452-4596-ace4-e70e218e9dbb
5bd9ce78-7267-433c-a0f1-c85f542036d1	07aee89d-3011-49bd-a74d-cac77904e10a	GIRIS	2	246.32	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.432	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	17c850fe-403f-4f6d-a5d2-89ad635ad055
3ce80b3e-07ba-42db-aad0-052fa98a2c63	dc3b0380-8e3b-42e7-9631-96dae1d9ec73	GIRIS	1	326.21	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.435	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	674e4901-fb82-4850-bdd0-005e84241096
8d77ba5c-38c5-44d3-8476-473c40a0754b	424cb934-1770-4424-adc2-71a912601fd1	GIRIS	7	315.08	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.439	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	aa9c2b8d-1fce-4369-b7a6-b517196d2482
868618cf-5c41-46bf-8373-ebb83cc9d6a4	ad6ab7a2-3909-433d-a3cb-a33710109c27	GIRIS	3	171.71	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.443	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	454ccc0c-8a22-47cd-96a3-5063597159c0
a2406561-bf3c-44c2-82e4-c019192ab6aa	745ed12f-fbbf-434e-bd92-d316b1fe242d	GIRIS	1	203.71	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.446	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8e7f01c4-4b75-4dba-a7a0-5fd694cbb955
4877f8b0-3bdc-4a97-9095-87caf3545fb8	2babf0cb-5485-4f83-8cff-dcd15e19dded	GIRIS	1	267.97	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.451	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	79a00355-aaca-4eed-886d-ba9a1b4e1a29
3780393a-3789-4b15-8cc5-5268013574a5	1806b674-af7b-497c-9be9-91349c3b7f55	GIRIS	2	197.17	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.455	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f1528d32-af83-4636-86b0-0c47e85294ed
5b270ee4-a7bf-4a71-83ea-9036d4ccf947	5998e619-c3ab-4de4-87e1-0b88a26346f4	GIRIS	2	176.06	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.459	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f3bcc070-a625-41c1-8f69-11b78be05d2b
c17240f1-7924-46c7-a0b3-f014d8bdc6a9	95e8bffc-b09d-4552-a8cc-c4a850b169c6	GIRIS	2	265.42	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.463	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4b44a2ec-e19a-452b-8020-36fe9a79684b
73affd0e-2e5f-47f0-902a-ba3e2b6309d6	b610e787-1343-4fd6-a1e9-926b4662ed1a	GIRIS	2	133.48	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.466	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	270101a9-6dcd-4298-b974-9833fb8c72fc
1832da73-fc83-4ea5-ba5b-354f3e74baf7	f73b74cd-61ec-479f-8ae5-83decbf8bba8	GIRIS	2	234.52	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.47	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0fb57b7f-343b-4df3-a657-4724108e81c3
b84465ec-a25e-45a6-b08f-e264df70b326	4ab8ae6f-2bbf-46af-869d-dbf368246980	GIRIS	1	352.67	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.474	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bf9ce4bc-ec8b-4203-a2fa-c9fd79bd41d4
129a09e8-bee1-43d6-b717-d856d2c9dfda	6bf01664-6e5d-4e17-b264-b272781f71f1	GIRIS	1	288.92	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.479	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2a2de843-10dd-4372-963f-987c934b6e02
e3d9a2af-6642-44dc-90e0-5b73965885db	445854a0-457b-4a0f-953e-afb7b572f2f1	GIRIS	2	246.32	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.485	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1a1c0025-d837-4646-afaf-fc174fb66bce
93cf12e8-7c4f-4467-ac65-1190e526bcfe	496f6df8-7c4b-4c09-8d50-b679a34eb2ef	GIRIS	2	210.74	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.491	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bdff9711-5be6-41bf-8943-2303ed5185a3
0ea522c3-1129-43bb-a2f7-6088a4dd8f2a	396aecf8-022a-42e1-b84e-302aa6326b93	GIRIS	1	205.16	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.498	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	55b20fa1-a37d-4f58-a61d-23be78048a37
57069f3d-9a9e-4f4f-81bf-2c3e93aa03b2	22d1fc31-6a76-496a-bf01-974a785a17b2	GIRIS	1	326.21	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.505	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	266a50b3-2252-41c3-b305-09f6b7dcc7e2
79319e35-b80f-4591-bd80-e258e5aa7032	10ed4136-c1e9-4597-9eb6-b25533abcc34	GIRIS	2	147.65	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.511	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	96e7e1c3-d769-4bc7-98da-d67ec29a39aa
f8470730-3040-4dd5-8b92-c9692ed7f0e0	32efc5ee-b96c-46d8-90fa-769a13500fa5	GIRIS	2	210.43	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.517	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8800719a-8e2e-4166-b557-8e4a759df1c9
0348325e-77ba-4568-a7da-dfa335f61106	c8b6ae08-e332-4bec-90d8-a77397dbd07a	GIRIS	11	179.29	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.529	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	56c80700-9a2f-497a-a2cb-e8ee795f5687
ce2a451d-2f4d-47a4-ad77-8c261ebb0250	1cb7560f-7df1-423c-80c1-dff1ce1f9e39	GIRIS	2	241.93	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.533	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	41be9144-a953-4d56-aeb0-ffa170dcc00a
fe0f862d-95d4-4648-8c54-25aec0e63253	5e34221b-333e-4b71-9ddd-a3204f5a635d	GIRIS	1	274.36	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.541	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6de14847-a03f-4240-842c-5ae064bd6eaf
f5337fb2-cd3b-4964-808f-52f3cc8629ec	e1b62b71-c295-4bf1-acb2-1f927dc626c3	GIRIS	7	265.55	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.548	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	521083dd-2fea-43c1-b661-27772852ddc0
6e2855ce-3351-4e11-bb90-6db3c10f3057	88403982-0e34-4bac-87b6-0142cfc0352a	GIRIS	1	265.15	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.553	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	513356c1-2140-4901-b050-20eee9a828ad
53802bf1-bddf-432b-8492-c73002b7771c	1eab4997-9d0f-4d8d-b374-55fc1799700d	GIRIS	2	247.99	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.557	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	20863e51-ceff-4a40-aaab-7e6a777c0f92
ccf89885-f023-4980-9060-f061b9b32779	aa1afe41-c9c0-4715-962e-f8b6974011ab	GIRIS	1	334.44	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.563	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	118219be-fe90-4889-b5b7-34b01569a5aa
ce281198-bfa9-476a-96b7-1d2bfd1216af	8a6f19da-64cd-4931-8424-cc1823bb15eb	GIRIS	1	184.86	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.567	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	84b6603c-ba8e-44e4-bd5e-1de1fbd835e9
c1ba5602-7b0f-4ee2-a8e0-73fcbe63c89a	f185ef3d-d631-450e-91c6-79c7d7c7eccf	GIRIS	2	196.90	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.57	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e1c5671c-a9bc-4d4c-b085-a0db25b8f00d
8d78cf40-ea91-4b32-99b9-7d8c866268fc	289c316a-bf53-49ce-82bb-a264ad37c106	GIRIS	1	303.90	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.579	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb1a2571-9bae-4d4f-8890-db17f8641347
2241ce65-05c1-4549-be8a-38f8553c41b1	7eaed4c2-8965-4a0d-8d47-983e0592709e	GIRIS	1	184.86	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.585	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d253861a-87a3-4c53-9ea5-30b2818ad9cc
220f4941-8b71-4d3b-84a1-21aff62bfba8	af122dfb-db80-4211-91c5-e41e9d5923b8	GIRIS	1	205.32	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.59	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c2e7e9f9-8347-4c7d-8b4e-55aa192cd411
f884cfe7-e3c5-4223-864b-a54aaf4af1de	637d24a6-311a-4520-966d-77a512877c74	GIRIS	1	1339.31	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.595	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	283442eb-0285-4f93-b4be-9620a149bd39
e6808534-2fa5-4dab-a84f-5e8485d1ab91	3f9269ca-37d1-465e-aedf-642cf50c8d84	GIRIS	1	144.42	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.599	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	18330f6f-6dab-4e92-a907-f6e733501b72
140fd56a-4ccf-41e8-b9c9-763faf707204	b59aa2ce-7049-4e9e-b735-2a52c901c1a6	GIRIS	1	134.06	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.603	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	edc4fed3-b4cc-4c23-bdce-7416c4cde208
e0d8a3a9-52ed-4d9a-bbf5-8bcd7a5dc7b8	61b32b7c-d3ae-426a-a8c6-78a7578f3e51	GIRIS	1	216.54	Alış Faturası: AF-2026-064	2026-02-27 10:12:26.616	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2dc5decf-dac5-40d0-86ab-bff56c593644
d3fb9f03-b77d-423b-9084-30ba2ca1413a	961143b7-aa7e-4c6e-9639-bfc8c8d2967e	GIRIS	1	268.37	Alış Faturası: AF-2026-015	2026-02-27 10:12:26.62	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	570552b4-d573-4e78-bbb6-e7f6b84220e3
6ce2003c-5ae0-4517-a128-ec95335b5108	ae25e511-13d9-4deb-9931-15140a6ba40d	GIRIS	2	143.77	Alış Faturası: AF-2026-015	2026-02-27 10:12:26.626	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6a76dbdb-f9db-4e98-9b09-e25967f03b98
a796a45b-cb66-44f8-bab7-2875c7814019	6f7f1f05-69db-4232-80b1-f568737c5902	GIRIS	3	255.63	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.631	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d21214b8-f501-45ee-b8c9-6a3cdb191307
c0a34f0a-69d1-46a1-81e9-c74ee86d07af	663b7861-631a-41e0-9ebe-4eacf8d90b72	GIRIS	3	368.09	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.635	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7022538a-3172-42ef-ab94-14849503b5d2
5547b0ec-dd89-4801-b323-1840e68e1ea1	a906d7e8-a7f3-469d-bd72-49ff8ef6eba5	GIRIS	3	503.11	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.64	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8376ea54-2b60-4546-9a40-451dfe62a1c7
b082b875-500b-43a9-b463-217729779b31	21c65809-7399-4669-aa7d-fa0ceb60ac32	GIRIS	3	235.95	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.648	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e5232358-ea39-4a0d-a0b1-994b5e31b04e
5e76fb22-94bd-4c7c-849a-7cf023c66e37	0ef6e144-4187-4a6b-a62d-b95a400e6c2b	GIRIS	3	167.68	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.652	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	af941541-a78c-43d1-ae0d-a7096cfb45e5
0005ce35-c759-41fe-80fa-4c7b22d9cdfa	94f56110-d856-4777-aae6-5af0285ab173	GIRIS	2	1414.24	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.657	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	335420b2-2727-49dd-84fc-b34ca1284419
81eb0235-b372-4534-8ee6-57986e7116f9	c3586788-8f31-4c9f-ac4c-85739d466ac4	GIRIS	2	1284.76	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.663	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	44f70708-d8ec-46d1-b090-69562fb9b2b3
4c76b93d-8e63-4d98-a6d8-988018ef0995	8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	GIRIS	1	2356.66	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.667	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bf0a8505-fff2-4d07-8985-8a8fb27d2df8
98b5b0ef-197c-4255-8a6b-c3bd7cf1581c	043fd312-038f-4392-9fa8-c083c49483ac	GIRIS	1	1142.52	Alış Faturası: AF-2026-012	2026-02-27 10:12:26.67	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f5c14afe-8f8f-49c6-827f-b7cae9109b86
0c2f6ce5-e61b-463f-9bca-92152d228729	59b6d6ab-68ef-4226-8da6-435f543e9726	GIRIS	2	720.49	Alış Faturası: AF-2026-014	2026-02-27 10:12:26.674	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b8dcc62-f2ee-47b1-bdf8-e81211de6db9
727fc10b-5de3-49dd-a4f8-8fb3bd4d1413	8ed2ff0b-0d40-41f5-b2d5-349de4a0e4a8	GIRIS	4	2442.65	Alış Faturası: AF-2026-014	2026-02-27 10:12:26.68	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	609d1f91-6d7c-47c5-a2f3-ce632187e984
5f7bc23a-ed94-4982-aa88-ab9424c68954	faf14f78-3e6c-470f-bf01-6eed7e25cc67	GIRIS	2	100.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.686	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb73c292-428a-485a-84cb-e6b8c48d4cfb
8401f14c-4d8c-4c7d-9734-dd384bbe89ec	d1bc74ce-bcb1-4612-973a-822d5eb87e13	GIRIS	2	100.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.69	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	409e8908-e8a8-43f9-85d5-9e099d662ffb
374e6552-672b-415a-8e21-8c73701a5b81	f743645f-2ae9-4864-bbcf-b2189d099fe8	GIRIS	5	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.694	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	88f59566-9e33-43ff-94fb-08302863c2f7
f2c5601f-1b2e-485e-8782-8557605bc191	27f7f290-5a89-4fae-9e33-115053f0a77b	GIRIS	2	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.697	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6c395b01-997a-477c-af36-2cded029eae9
7761870e-b0d9-43e9-8294-ed0ed12fe0b1	4f44ad6a-0d99-4c18-8826-313f543a7300	GIRIS	2	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.701	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb4b3d8c-37aa-4239-b5cc-33e8eb727425
1c2fc1c1-b697-4480-8c16-27108a9d4e07	28f50698-6ffa-489b-af0d-ed3d969c47e1	GIRIS	5	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.704	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	842c8d0a-3d81-43c6-8c48-5ba621a7575d
2454aec2-3226-4a70-adf5-837b885a370e	0e60dbfc-23e0-42a1-8311-2a85c0a7118c	GIRIS	5	400.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.709	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f970eb5e-3c20-400c-a1c5-e7eabeff3f2d
71d44e91-ab1a-4c36-9c58-ff4969421be6	e4167f01-ad6f-4aae-bd17-fcce5302f7e3	GIRIS	5	312.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.716	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ea86a3f3-9c90-49e8-b68c-5413356bbccd
aad75aec-f02b-4b54-b56a-afb2b643fd10	607a89ec-c12d-498c-8900-5fcbc0f9ceb6	GIRIS	2	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.721	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b571ce7-4436-4bbc-979b-8379e075dc52
ed4f0378-2278-49b1-8bab-682f0b2621b9	daddb524-bfd1-4c3a-bac4-7a762348f2c8	GIRIS	5	45.00	Alış Faturası: AF-2026-031	2026-02-27 10:12:26.729	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	57677e32-ff07-475f-a24c-38853aeeb272
ac445e76-e923-41ce-aebe-85515faf8129	b99484b6-f666-4608-be1d-1548b70409df	GIRIS	5	91.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.732	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0a10530b-7fd9-4c95-aa4f-c001fdc6f14b
b504bd2d-c04a-4018-9810-3a38322eade7	66caa2bc-06c3-4272-b583-a997744878c6	GIRIS	5	97.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.736	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	67ebb838-87c6-4bc8-9419-f6628adf28a6
d9adf900-deec-4a3f-88a7-161ef66d76a7	ad829ec6-1456-4485-b15e-ed14059c3ac6	GIRIS	5	125.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.741	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2fac9803-5969-44e7-ad70-63f26a156338
487cbe87-87fe-4273-ba42-d8cc4f8fc6bc	541b0362-177a-4f13-a285-4b2d8a868f37	GIRIS	2	107.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.749	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0f99d17a-4291-44be-be5f-2f7bee931a4a
0e68ee77-6227-4448-b744-efe7f5925442	6aeedc81-47ba-43b3-90e2-a2eebac6f493	GIRIS	4	117.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.753	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b193e753-2bf0-4dd3-b99b-6bcbe027c38a
0b3f1a03-030a-4d4a-93e0-9811e1fedddb	8096058b-0009-456c-afa4-f9f062027edd	GIRIS	2	88.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.757	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9047b830-23db-4f2d-9e13-3dd19c95c57e
ea8eaf8f-6853-4ab6-a7d0-dc219f0596d4	1cf92eb3-1fb9-4a59-8dfd-c68a6b0d94a5	GIRIS	2	113.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.761	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e0815b4b-4828-495d-96df-2ce017cdca9e
694f3653-d337-4087-8e75-4816fb03dce7	bbb14892-390c-4ac3-b359-5e10239d6b9c	GIRIS	2	94.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.768	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	40cdd539-2ef1-4dd3-ac3a-24d61465c178
c4c85828-27cf-48a2-b68d-79762711483e	ad8ec09f-c49f-42d3-8af3-a9f13bdb51eb	GIRIS	2	107.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.774	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8c103383-8013-4fb0-9bfe-69677d830590
6620db5f-0329-464a-a4dc-fd1fb17544ea	2d649c35-50a7-4f73-ac12-fadb9a6b3dd8	GIRIS	2	82.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.796	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2f9bcafb-1e9f-4419-b2d5-ae102628db85
cded0091-d9b9-4de2-bddd-c52f9f36a815	23e0248b-953b-4c01-8e40-6916a9a894da	GIRIS	2	115.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.799	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2de65cc4-bf87-4488-8596-7550eb8bd255
da3ea687-28f5-48a7-9116-220723caa346	cc7b1ab2-3e0f-44bb-8ee5-3e80f1084847	GIRIS	2	103.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.803	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	eaae7e3e-4a9b-4cc2-b822-ab72b8f640b1
0a36f85c-c331-4774-91f3-acd533d7c47b	8ab95815-118c-4012-894b-2d4644987a0f	GIRIS	2	113.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.808	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4bf6f792-fcf0-489a-b8e3-11325281e256
b1e90574-9a35-4a52-8d01-8087a37682fe	9b4e655d-f48c-43c8-b80a-142a0c7d8514	GIRIS	2	127.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.813	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	608ee512-b235-43a6-b0eb-b6574511fecb
6fa02e4d-c6ff-48f9-8433-87dac4f95aed	0dd5cb06-0a57-44c6-86d7-8dee0371a7bb	GIRIS	2	97.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.817	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9d872123-bec0-4940-97ad-306ca8f7d75d
30da7ef2-062b-405f-9d0a-f3f975b4d505	0085ac4e-751f-48ee-ae81-9cf436879483	GIRIS	2	112.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.821	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ac13f9dd-4325-4420-bc26-a1f4f8706a78
86d338a4-afd0-4b0b-b5a6-bbc411e49199	e582d74f-3178-4d9d-ace3-01b321afae0f	GIRIS	2	120.00	Alış Faturası: AF-2026-032	2026-02-27 10:12:26.827	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	38d8cb6e-7148-4d50-aea0-f1497594431b
64bb951e-d71a-4683-b16f-d832fb11f3bd	5c9e8f37-7d07-416a-88ca-ad6b25d12b7d	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.832	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1d6a7819-e7ed-4f85-abe2-b197a09c5761
2d70d8cf-e835-41d5-a37e-d37e4843ee70	6d5a4e0a-1147-4576-a28a-d1c377e34dc7	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.835	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cb19845c-48a5-44b1-99a1-df0b89b18a5c
30e36f9d-6dab-4948-aed9-3e7851fa301d	4659612c-11ac-452d-9d85-32bbb1b985b7	GIRIS	5	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.845	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e411c934-618f-4c6f-a17c-341d10efa20d
59267137-8248-4290-958f-8d002a509697	1ea6e7c2-2ca4-41b5-a996-77ba342a6d6a	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.851	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5d7679ed-8b07-4fbb-aaff-f3379b8d08e9
fe5a2a93-f726-4f92-86ab-9d6e0abd157d	164aa5d6-bf71-4049-9fd9-ab832bd0facf	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.855	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c29d65c3-b5b8-42bf-9c35-6ab7e6046876
14714e52-b5d8-43ad-97b4-95125e19dd42	5ae6c502-9925-47e1-95eb-be56c45a8f19	GIRIS	5	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.859	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e355f48f-ccd7-4dd8-ac9c-df2bd40b551a
2d2aa7ed-d54e-4042-9efc-821b0452c998	976f6ba3-fe0f-4ebe-bcf8-b0705c8c1590	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.863	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d7864072-6ccc-4f47-acaf-9c973a6ce914
724b81de-5dc8-41a9-a74b-3f2f9cd9e948	bed8dfa8-b580-4a6a-b990-1c6c2c3a9a0e	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.867	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	495d21d2-0445-4ca1-bade-9fa8eb55757b
fb3ee6b2-bc83-4f18-ab2c-f24dd1fdc1e9	43f0b337-b1b7-43cc-81b7-db6d18a47ff3	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.873	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a755f35c-ab08-4aea-a9e7-ade646c275a0
4d4c3a2f-6a0e-4e56-a292-dbda8608fca8	7e4c1c3b-7e0f-4fb1-870c-220c05877d12	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.88	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5d2441b1-b18e-4d20-b785-bad32b1f96fb
a2e15bf1-96d3-421e-8769-3a097bb7f982	206ea6f5-2d0d-4642-9fd9-95fa289c2b25	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.887	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cbfb444c-5338-4f2d-ba29-38839d5cfc30
87521570-778f-4c91-99c2-2e1d482fa0ea	e91ba21b-224c-47d7-a08c-75b82e9cbb45	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.892	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5d80a005-7ad7-4669-9c0e-4ec5cb97ffca
8e8b91b8-3f93-4abc-8c17-3395b6c64028	a2c7c3ea-6d8d-466d-93cf-96916f3c5560	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.897	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	06c7e5fb-be42-4c3d-98d3-1c3eeb1936d2
36509925-ffaa-436c-bec7-f472e3692d74	1f881e42-9654-4e09-bc6e-bf53b7c64763	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.902	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	755fa48a-2fb5-4381-a98d-fed8cc0fd7c8
10c00aa4-0a88-412a-87c7-f64e749d728e	0a68e318-b77b-40e5-9d5c-4f4ac4626590	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.907	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5ab6fb56-3074-469d-a150-3b16bd81a98f
2e84a226-d168-43e6-bdcf-3aae3248a568	6d84094c-7ac8-4765-8110-f5b87516c4ef	GIRIS	5	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.912	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	67994f04-430d-432d-b37c-9ec078b31415
928aad2b-e288-4228-a813-92f0f1fead45	a393ba47-ed47-4035-b941-2fefd3113dfb	GIRIS	2	100.00	Alış Faturası: AF-2026-030	2026-02-27 10:12:26.915	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d8ee253c-d667-4326-ac09-b1ff24417bcb
abce0fc7-ff89-496e-87f6-15f897a1d016	452f5e7d-989a-48ea-b6fe-25e56a7848c3	GIRIS	2	718.84	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.92	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	303a977a-8dca-402a-b8ad-6b597722a51f
4c64085c-4f4d-45fb-866c-26fc6ace0680	531a1c64-7f68-4770-a9e9-5bfc2c09131c	GIRIS	5	886.15	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.924	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	317e10e1-393d-49a2-b6e0-7eb799621c13
d21c27a5-5eed-4669-9755-400721d1dd4b	aa1595c8-d171-4c47-9610-4cefc722fa00	GIRIS	1	499.46	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.927	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e681ed74-59bb-422d-8ad0-e697585a2cdc
f676eeeb-907a-48ad-be18-d78cefb915e6	7eebd33f-9097-40ef-85ed-254911e75454	GIRIS	2	515.94	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.931	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6189228f-667a-42f7-b1d0-3a2d784a085b
e2275517-a14e-4a39-94be-34a5495f2ba9	1a12448f-e380-45a7-bf26-f631a88d7316	GIRIS	5	615.95	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.934	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1488b8b3-a881-4c38-9d41-fac718c04511
92fa23ee-a88b-483d-9cce-6b6125be5997	14fc0179-09a4-4084-8a36-7b9bd2f86d6e	GIRIS	5	687.66	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.937	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	131ce645-a26e-4d12-bbf4-a8f1d712f654
c4add5c0-c141-4f87-a4af-9c9a2b3e6842	6a1cd5fa-636c-4038-bb2b-66562d867d21	GIRIS	5	281.66	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.941	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8c27a9ee-b264-418e-af4f-07b2b1761d89
7ba5ca49-f2e4-42c4-b99d-ebf58d3a4c28	15e2cb0e-b08a-47e2-aa7b-c895fc6cf5f5	GIRIS	2	654.97	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.944	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	00675f71-909d-4398-afcf-33372b110bdc
587994c4-53b3-47b0-b3ec-22c02e85ef13	9d587026-1594-42d7-b2fb-0de51f8e8ad5	GIRIS	5	941.87	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.947	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	45230e4f-9cb2-408d-9d0a-ec0da28d159b
f120ed95-fee2-4480-924b-9f9aaba5975f	16b83505-3727-4df2-b3e5-24bde3b75f84	GIRIS	1	609.32	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.95	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0b57ea03-25ab-4c70-abc4-e82a1a61c14e
969ea6f2-00f4-47ae-a91a-e2369008909a	7f5e65a6-5de9-4494-a7c0-4db1ea213903	GIRIS	1	419.26	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.954	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d864f610-333b-4a37-a032-8fd24a163600
534a1d20-ad8c-453b-a75c-e262fb7b175a	ec17e46d-eac7-4d1f-971d-e4335c9652c2	GIRIS	2	436.03	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.957	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c44f7a18-592c-4900-a152-96b1e9f779e6
0374653b-b339-44ed-89d9-c8e3e89872e1	ba27677c-9ee3-44b5-9e1f-1fcea222f762	GIRIS	3	609.32	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.96	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5a8e7a97-641b-446a-93f1-2846b734a555
9dd900ba-5196-43e0-9d7e-22c904113c47	83a815af-9bf4-4dbe-9ea7-600a3d1cb429	GIRIS	2	391.29	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.963	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e4decf37-7ae4-48cc-a731-4bdc4720eb57
a62f135c-f2b5-4348-8c9f-e3e2bd058deb	b75c0db3-0450-4179-a347-25723adb9c62	GIRIS	5	404.17	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.966	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b99ef2b5-714d-4ae8-8367-5eaa0a769973
58598461-e9fc-4eb7-abb3-9bba505cda07	a08944ca-da97-485c-b58a-9cac72245e46	GIRIS	2	847.71	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.969	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2199e256-0e84-4c7a-ad9a-e9852bf6cbe1
808e9c4f-c749-4016-a847-57ae16eb4d2c	09f175a8-dfd5-45a9-88c6-77d3f670632d	GIRIS	2	1089.85	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.971	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	04631ac9-2d02-457f-8a49-0fef3b89a1e8
ef29ae2d-85fd-4a4b-a31d-4a0f11887dd8	cd43ac8e-797c-41c8-a3eb-542a8bce02a8	GIRIS	6	810.28	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.974	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	733110b3-2ae4-4d09-9704-eba39bedab61
f485453b-d8cb-46e8-8a72-4a9099bb7ba9	d2521ac2-74fd-45ad-a923-faa3593ac757	GIRIS	2	1071.48	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.977	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	95ceee62-62e4-4519-8fae-2332fff519f3
c9d7614b-882a-4c06-b68a-fa3afd015281	9eed4328-9f98-4675-94fd-f6b9cf9be05f	GIRIS	2	1395.12	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.982	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	af8f30c6-509b-4b6e-b1b3-4deabb96e438
6b209840-9ea5-47e7-9f4f-e94ca06be299	faca0f14-ee2f-477c-b076-2858c8f1a9e5	GIRIS	2	815.27	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.986	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0a161681-abb4-4d9c-ae10-d9b5c4101053
0aa82a4c-a860-4c0a-a85b-1c541d3073dd	9084c176-a2c8-409a-84a5-eb82e224cbce	GIRIS	1	750.34	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.989	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d270de19-79a4-4d46-8850-7443309d4957
01bc2c42-48fb-4231-85e7-4b279a579a2c	2ca07a16-f6f6-4747-89cb-e96c863c0519	GIRIS	2	373.92	Alış Faturası: AF-2026-029	2026-02-27 10:12:26.993	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	47591b83-9c2a-4a27-9295-e54bc73250bf
7f59b0ce-a5fc-4b73-83a1-0e9d3abad4a5	1e1055cb-e494-4124-b9a2-eb7f5815402e	GIRIS	5	739.52	Alış Faturası: AF-2026-029	2026-02-27 10:12:27	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	944c546f-f184-48c6-aba8-f0878677d31e
c2c6cd4e-9649-4144-bf75-7676cd580ee8	7241eb2f-9533-4078-a02f-2befd28c800d	GIRIS	5	533.66	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.004	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	739ec82d-d2ee-4ee0-beec-4f91587773a7
9d4a6e88-9ca7-4df9-bf5e-11fdbd7e20d1	ad0f7ed1-2a42-4d66-a37d-22034f4967d6	GIRIS	2	1113.60	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.009	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	13987708-983f-4c2c-86ba-8166b6a304f8
694e109b-e5d2-4de1-906f-29d607e08544	4359422b-40b2-44fd-bbaa-e2ecf6343220	GIRIS	2	1021.53	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.014	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b7521fa-1482-4605-8413-41af26ec268b
2aef4ef7-92de-40af-857c-858ce7a2faa2	40778f8c-4eef-4880-a814-935535536bc1	GIRIS	2	1553.65	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.017	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5551e95c-fe5f-4bac-ad59-810553819237
82554003-ccee-4993-b93a-55ad67966642	370263a1-8551-4433-a22c-74c7fafc7888	GIRIS	24	75.00	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.02	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9d08943a-9e89-405c-be82-44438e2dfc87
5193c9ad-9d2b-492c-8c70-c8ffba8679e0	026634cf-ec05-4429-9a9e-2fe2dc6afc51	GIRIS	3	436.03	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.024	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	afb80559-63ab-42f5-b596-e71bb2a835ff
64e581e4-d12d-4176-aba4-908ea8100607	d8288fc9-9d1f-4a02-a8aa-0fcb4bfd5459	GIRIS	1	605.78	Alış Faturası: AF-2026-029	2026-02-27 10:12:27.029	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4a6c2b1d-3881-4531-b04f-0b4786a83e88
af051cb3-8242-4023-8179-015739d8ed6f	97440ecf-a58a-4bbd-8517-95a11e62b523	GIRIS	20	65.00	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.034	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	206a2a5c-9f94-4f91-9b7e-e6d7dc621993
d5a8536d-8ed5-4de9-96e3-7d0b73f1f39a	87596d5a-39e5-4793-b6dd-5d7c0e98f5db	GIRIS	20	65.00	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.04	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	55de4dba-f678-4f3e-9bf7-1e1b17df3fbf
84b3149c-613f-4b4c-afcc-fe1ae3db78ed	14c41ebb-3536-4832-bf5e-1ab8ce133dc2	GIRIS	20	72.45	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.046	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ae3e3572-5eab-4a2d-a5f5-b3240be87352
10da62e2-6bb8-45b1-8bfb-cc9fc41e46df	d9c8a08a-adfc-475c-b6dc-17ae1da5603e	GIRIS	20	66.66	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.049	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	60889f63-be4d-4591-85d6-bc62c5fec1e0
628125cc-fc1c-4ef1-9012-fb190980ea7d	7185d30e-1c11-47bc-998c-40c53c2f2e7d	GIRIS	20	66.66	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.052	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d136c446-90ce-466d-bba0-3b72e759c5c7
7e4494d2-fa7c-4368-b243-52d2990e6d6a	3b7f878f-6183-4beb-a3fc-09da7e672bc7	GIRIS	20	65.00	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.057	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	327e4af2-6c09-45c6-a45d-a589f5d9d438
b3804b95-376c-4046-8ead-301a5e8ede1b	a2fa4e5c-1d90-46ad-a154-82131f803f04	GIRIS	20	65.00	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.062	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	04bc3dd6-516b-4099-9b18-c360a941500c
9334a24a-548a-4522-bf56-2dd94934d1fb	9c2be3d1-032e-467e-9891-570608092d01	GIRIS	20	65.00	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.066	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3953a69b-5141-4c50-9a4d-fdda842e97bc
236c617d-6946-443b-ae95-9178f054f18d	351a0fdc-7dc0-4825-8806-c199915b09b3	GIRIS	20	66.66	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.069	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	57fcddac-c559-4607-a873-27a0ae9a3f5a
96b8b1e7-2d89-42db-b400-00858a028634	8ca367cf-098c-4aee-9070-6dbf05a3f120	GIRIS	50	60.46	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.075	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	33bc5cd1-efd6-465f-9723-df9152265e11
748b3627-e7f3-45aa-91dd-80b2cab0df92	ebd53187-7551-4768-b016-7ab00badd88c	GIRIS	50	60.46	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.079	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	03b742df-523e-4433-b2bc-8927f46f3ab2
2a4eb585-98da-437f-a928-784bafe1589d	c1f1d767-fab5-4b3f-843b-3ed487eb8f95	GIRIS	20	107.68	Alış Faturası: AF-2026-005	2026-02-27 10:12:27.082	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	42f98a4d-fa30-48d6-8a8a-3611b7b58bea
d81aa22b-4797-40d5-b605-a374e5ab8b55	f48ff1eb-e85d-4cb5-b628-73a89dccdd7a	GIRIS	4	1220.81	Alış Faturası: AF-2026-010	2026-02-27 10:12:27.091	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	847f28ed-8843-4b8f-a705-b61b1832bbac
c49b4c90-9422-4197-b258-7f6d6aa0660d	071f8259-a497-441c-9a32-9c48c9de4cdc	GIRIS	1	494.95	Alış Faturası: AF-2026-027	2026-02-27 10:12:27.096	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b79fbb4-e934-4d46-a493-2cb0434f5571
4dd7f6d3-78a7-4c8f-a0b0-fc5d1b4901ff	2f2a2e97-db2d-4477-9600-824f068819bb	GIRIS	4	346.78	Alış Faturası: AF-2026-027	2026-02-27 10:12:27.1	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d3cd12ce-8d33-4275-8859-6aa42c922392
18c5be82-ff51-472b-8378-4a06ed042916	6667c533-7051-45f1-8f21-0d822b15e977	GIRIS	2	494.58	Alış Faturası: AF-2026-027	2026-02-27 10:12:27.105	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	10b258be-82b9-4b79-8cca-d5ebb993bb02
6d13a0c9-fc6c-4c3d-80a0-354f50db9305	60fe51dd-3077-43b3-b46a-50dad2fe164d	GIRIS	1	649.70	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.11	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4a56899a-6b8b-4527-a8de-42dd0c7baea8
0fd635b2-a39c-4014-ad1f-1f8329064d1f	99748460-340b-44e6-9582-4cfefa7c62e5	GIRIS	1	516.16	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.115	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	be7b575b-09e7-4a1e-9a26-bf5c1a74c4bb
842e56f9-e3bd-4164-8733-30941447ece4	452f5e7d-989a-48ea-b6fe-25e56a7848c3	GIRIS	1	586.36	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.119	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c27d4cc7-54b6-4a5d-9779-05f616f99cd7
44ca79a0-e2a5-49ce-96a9-9e8f66a933e9	c2b759c8-dde9-4f81-bb30-5fe9ba67226f	GIRIS	2	504.46	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.123	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6ff0316a-bc52-4bbd-8438-1f33ce13e4ac
69f716e0-2a84-4a16-8e81-9404eac08394	9d63b6f4-eaac-4d19-8d3b-4e6fbd31d3ea	GIRIS	2	657.33	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.126	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	08570a7b-e274-4ffc-a0a0-e3e7cfd6708d
633d491c-d70e-46c0-a8da-84463afb4393	02f5bdcb-854e-4beb-88c1-d4efd7113e95	GIRIS	1	445.50	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.13	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	18020aad-ef3a-41ed-bf4c-882c88dac86e
cf9f7560-03cb-4e0b-a9b8-f1a610870778	8704d476-047b-4ee4-9a54-3b94e52815a4	GIRIS	2	742.50	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.133	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6fa1eb22-eac5-43ff-8d8c-8e65761772d0
77a6812c-7b72-4176-9158-2266429113bb	4c19a5a3-f64f-4d7b-b088-48a251614b45	GIRIS	1	660.60	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.137	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	07ab6232-7d6d-4eec-b4a6-34d20cd88dca
c8f40293-7780-496d-b7d9-51658f605ba8	20433ae7-7b97-41c7-9781-62883b5f69ea	GIRIS	1	717.38	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.143	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b97445b0-96a4-4026-910b-83bb52031398
182c34bb-ff75-4cd1-a2ea-8bac382d656b	e0b7804a-fa35-468c-be47-d8f75f71a50a	GIRIS	1	901.91	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.147	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cb68553e-5c25-49af-ad95-51774ed8dcf3
333ada67-972f-4720-ab40-baec638c996b	565de0ff-f725-44e2-96d2-81dc4c8a38b3	GIRIS	1	695.54	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.151	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ca2e99c1-3557-4f4c-b996-2d9029286f5d
def86173-9d62-44d3-a59c-fdd3fd741f3d	463c647a-28c0-48ec-a028-54b2d9878342	GIRIS	1	572.16	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.156	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b8c5e10b-8f2d-407b-a864-f1d4ed152888
d064db21-c79b-4707-b416-2144a853b94c	7eebd33f-9097-40ef-85ed-254911e75454	GIRIS	1	515.94	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.159	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d04fba62-7d1f-4a5f-ae73-28b5c9cf1902
bf8573ea-e089-4592-8878-b0dc43d535b0	f0897d6b-ca66-4221-859e-d8985dcc6977	GIRIS	2	549.33	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.163	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	49130f5a-2bdc-49d6-b295-5ca79fb8864d
2df052fe-bcae-48b6-b332-4193099a8408	ec17e46d-eac7-4d1f-971d-e4335c9652c2	GIRIS	1	436.03	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.166	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e452c36d-2f5e-471f-b81c-abaafac2b9f3
3c70b813-7377-4455-b52c-d59925d11d23	a4497d35-e1df-4a0d-bcf1-b9f3e2ff650b	GIRIS	1	457.54	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.17	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	000ea93e-e187-49ca-aab6-e29a15e98779
b0d4b03f-32a7-4d8b-9378-445eb57d44c5	e90df772-6e73-4b36-ba1e-2d342ea050b0	GIRIS	1	713.66	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.174	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	671265b9-44aa-4ac6-aec2-ce1d63763476
c2fc1334-f534-45d4-9fd7-1774bc097408	2ca07a16-f6f6-4747-89cb-e96c863c0519	GIRIS	3	373.92	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.196	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2afd8098-35ea-4f63-a1a7-d8ba2a7244c9
fc069bd5-1a68-47ee-a8de-7287bac0ce1d	374ea922-d3b1-4948-86f0-8e2579fefd45	GIRIS	2	712.68	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.2	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dc5fcff0-a7c3-4e85-9e1e-6b57c2eabc9e
ad61aa42-a470-4bae-a632-064d35f340e0	0b616e46-3aaf-4944-830d-4524dfe95f22	GIRIS	1	530.48	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.205	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5a69267e-2774-44d0-bfce-6adc237f4a47
9b2e2288-42ff-4542-be4e-bbec0aff1c08	bcd2fb1e-6a83-4554-b0d3-9f38aad02f31	GIRIS	3	688.94	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.211	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1d21a4c4-a8b6-4247-8cb0-47d540f41436
8c555276-39dd-4a07-abd4-ae631c4c7a0e	43551ddc-ffde-4e26-bf56-bc6cc73638fc	GIRIS	1	784.43	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.218	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	014cfff0-7823-4f2e-9d7a-38a03da58030
8d09ec0c-4301-4cdc-9d0f-0507753e2ef4	a6ade259-1ba5-47ab-aa5e-1b8ac3dfd5d5	GIRIS	2	479.23	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.223	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fefe70de-ca38-4523-8ed8-8ee9db9ec8bb
c468ddf1-4a25-4c29-91d7-ff591e8f1fce	b5199231-96bc-4b1d-9b16-b55d7ecaca0e	GIRIS	3	517.63	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.231	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6fd45faf-dbbc-4ab4-9eb2-70d8ed97ce30
65fdf328-32bb-4d0b-95a3-6ca0df94fda4	6d46e1b1-7905-4622-9972-5e71985d4dc4	GIRIS	2	357.43	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.235	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	eeaa6e1a-0f27-4c5d-b40a-65b3429635c4
4c6b4539-b227-49ce-ba14-c6bbf8d0c186	5c2b7fd6-c67b-4b32-a049-28be610ac80a	GIRIS	2	460.33	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.243	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	15cc4a9d-980c-492c-9938-d8350a4c24f6
ccd78700-e091-4857-8ce5-2e047c79c202	d312299b-2d60-4c56-b2c4-77dbdd87da45	GIRIS	4	539.41	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.247	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dc130536-07dc-4b0b-94be-96361b9b9511
79f3b209-23c3-4227-9fc8-7bf00871556d	70028631-1147-42b7-9cfe-3dac0bad6647	GIRIS	2	540.24	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.251	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6e4d3af0-e741-491c-9401-079866d5667f
25e37b94-a9fc-4024-8697-54786977ed7c	9befe9e4-ea7d-4ceb-8068-83bf008bd21c	GIRIS	2	484.14	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.261	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4f3322f5-781f-4a37-a76f-63967f33fcc1
80474e8d-b825-420b-8ac4-a8e0a3dd1f40	58d053b5-66f0-45d6-9139-c7732b65abd3	GIRIS	2	426.61	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.265	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	859c1f7d-0f16-4125-bf94-c82da01bf34f
9b90b5ac-ea91-4d70-b5dd-5c6f696ae49a	7b92be79-44d8-4026-a39e-aa1ebd2db91a	GIRIS	1	588.54	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.269	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3fefe627-7348-4817-9705-8122c4cc5198
0e82b764-30ce-49b5-aacd-454c04a45b8a	61572691-5eb2-4e06-8a38-76843eda2bf0	GIRIS	2	539.40	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.272	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	05fe18f1-295c-4180-84ea-a46436aa07b6
85f123c4-f5f4-45ce-85bc-6e37f50d86b0	cf50e54e-d269-4112-b687-61f2c9938d9c	GIRIS	1	591.82	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.275	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f58f1764-88bf-41fc-adce-d36ec92db90d
c673fc1c-ac98-4684-9755-eda243234680	664c7d7c-0fde-496c-aa4b-f888d652e4df	GIRIS	2	514.58	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.278	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	37a7a01f-3e19-44c0-aa5a-b09795c5199f
57e8c6d4-93e2-483c-9487-7c3b9cdcdb60	66bc0e2e-b98f-4f34-9eb0-2320a4dfa2ba	GIRIS	2	749.05	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.281	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	885508f7-d23e-40e2-b4af-a65cafb9f3d6
dbacda62-9809-4b90-99e1-06bda64bb240	915be74a-9751-4fdd-87c6-c51871aab214	GIRIS	2	526.25	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.285	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	97c60fdf-efde-4479-a88a-d6b1e3636dfc
76d5f3a3-0b13-4754-a134-ef00ad9f9e2d	e7ac691f-7590-4c01-8e1a-fcbe0694c1ef	GIRIS	2	631.03	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.291	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7a34125a-275d-4a53-b37f-05c650853d95
6853fecb-4d36-44fb-9841-d131a58ea63c	d8288fc9-9d1f-4a02-a8aa-0fcb4bfd5459	GIRIS	2	605.78	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.296	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3a1aae3d-58b5-4493-a2bd-ece9eac91a4b
2348e451-2b06-486d-854a-f44f8bb58106	fb671bd2-53d9-415a-94ec-32588ec76310	GIRIS	1	408.08	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.3	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8b40cd6c-0904-4bb8-b573-17d7b71e6881
8491ffb4-d9ee-4bad-9855-77acf84b6b51	76386069-cbab-4e35-a886-3fea8aac5bcd	GIRIS	4	994.93	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.304	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	df96ae7c-ee78-4f47-a49f-ff3000267fa9
b7be2fff-e534-4ca5-9de7-aff66ce29c93	9fb44523-855f-495f-9f1a-e4e1f92fe912	GIRIS	4	621.28	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.307	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a9ec944b-704f-4e6e-95ba-8f3c5880c204
11554865-21a8-4593-8722-82f21665f413	c3469619-68a0-4016-9a4f-f2a6fe99cf88	GIRIS	1	819.61	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.311	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f07aabe7-3982-4d2c-8ef2-5765ded43bf1
b572a8fd-aa8f-489c-8dfe-7a7c94207db9	401b76a8-979d-4242-bac3-fe5360ce23a9	GIRIS	1	902.15	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.315	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2e875e3b-4c74-48d5-bfd1-b5e40f0a6854
7d28bd96-98f3-4811-84e5-34cecdad9314	2d3e9b8f-c1d7-435a-8cf6-e57c53fe92dc	GIRIS	2	716.00	Alış Faturası: AF-2026-026	2026-02-27 10:12:27.318	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	63d2dcba-71b7-4ea1-ace2-6ff4f27b6541
0a7e2213-b4b1-41a5-b3b3-3c990f35dee7	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	GIRIS	30	403.71	Alış Faturası: AF-2026-022	2026-02-27 10:12:27.322	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	98c1638b-c9a5-4d37-ada1-a2bcf8cd1f96
ead85ef2-481e-45a0-a84c-38c3bbf858d9	310c997a-8da9-4668-bbc1-541d494ce14a	GIRIS	1	309.95	Alış Faturası: AF-2026-007	2026-02-27 10:12:27.326	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	82eba669-c5e0-4385-b7e2-ef7f67ea3c47
72a21ec2-a544-4cee-80a9-1f219b1b2e40	37eda8e1-da09-4f95-ba44-b2a97684eab4	GIRIS	1	50.79	Alış Faturası: AF-2026-006	2026-02-27 10:12:27.331	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c7e84916-ae5c-4961-95fa-1020b1e1d783
cd5bf20c-c69a-4690-bb64-cd103f2f4555	9257524e-3e32-4c79-95dd-2dfc453de011	GIRIS	1	419.62	Alış Faturası: AF-2026-011	2026-02-27 10:12:27.335	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e0d22fe3-0841-48c9-a60d-ed138d7cbbea
e249243c-a026-47a4-a12c-f0890cc99077	1e0a1f66-8fb3-48eb-a57e-e117c4c2992b	GIRIS	1	124.55	Alış Faturası: AF-2026-009	2026-02-27 10:12:27.339	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	052b40c7-1db7-481e-b4ea-08903eb22bd5
1597e7c5-607b-4783-9ca1-42cb70f53e60	0ef5b767-5218-48d5-abac-cca422782576	GIRIS	1	507.65	Alış Faturası: AF-2026-021	2026-02-27 10:12:27.345	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	14f88a5c-3302-46dc-82d0-fa533941a167
60752f31-412c-42bf-9d62-7dd80dae466c	d85e30e7-0ceb-4555-a2b2-51fe3a8ea5b8	GIRIS	1	87.86	Alış Faturası: AF-2026-024	2026-02-27 10:12:27.348	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5749bac7-c737-4dd6-b7d8-0e46ad3a3c51
add4f62f-42c8-4b8a-b238-96c49a313505	48ca0edf-32c8-45a1-b60a-2959c06e3dc8	GIRIS	1	1278.52	Alış Faturası: AF-2026-024	2026-02-27 10:12:27.352	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3d498cb6-6174-41ee-9564-7ebb655ee823
76c2a3b9-a411-4b87-b0c0-446566b1d11b	32232a4f-7861-457d-b28b-a8de0a0cc3da	GIRIS	10	61.66	Alış Faturası: AF-2026-004	2026-02-27 10:12:27.356	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b15701b4-86ab-4890-9540-1ea7c5ae2ce1
0556b47c-cf33-4296-b3ea-9de91cfa88db	588353b5-ad93-4633-a58a-4a4b8d4037d1	GIRIS	1	5732.44	Alış Faturası: AF-2026-025	2026-02-27 10:12:27.36	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b03bede1-73c1-4246-b9e5-bd4af62b8547
98fd5d22-714c-4ca5-bff8-3307c02105b0	cfc20890-efbf-4f9e-ac2d-fbad4c6a1e9c	GIRIS	1	3004.45	Alış Faturası: AF-2026-025	2026-02-27 10:12:27.367	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3902f7e4-1218-42e7-9424-30ca131ba9f6
ccf62bfa-57a1-4584-9d3a-3c3e397613a3	86f45835-4387-438e-9a62-7f15a593783a	GIRIS	1	157.07	Alış Faturası: AF-2026-025	2026-02-27 10:12:27.375	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	285d78f8-b4c5-48cb-80b6-64db4ebfb10d
636f595e-2c54-47d8-b49a-3234017744f4	759f05c7-eb2d-434d-8bbb-f194dde1c79f	GIRIS	1	57.39	Alış Faturası: AF-2026-013	2026-02-27 10:12:27.381	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7d1942e6-d027-4279-8f3c-94828d53ad9c
76517f59-f449-47a4-9617-ad1ced268e56	b22dc4d6-4a5e-4995-ad48-958935147ef9	GIRIS	1	295.90	Alış Faturası: AF-2026-013	2026-02-27 10:12:27.385	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0b35110c-085d-4b1c-a37e-90ace5ecf31e
0b1d7a4c-c81f-4c3d-8aad-c7b2537db9e6	663fe1ad-2962-4e86-9b23-2117ca85246d	GIRIS	1	47.85	Alış Faturası: AF-2026-008	2026-02-27 10:12:27.392	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c35a7378-9521-41a9-b626-6dcdedb3b65d
073f1bdd-ce5c-4239-85e1-c860bc28f790	73af4c35-2c21-42eb-960d-49a5ad416e4d	GIRIS	11	319.91	Alış Faturası: AF-2026-023	2026-02-27 10:12:27.396	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0bf9fa5b-557d-4a72-a5aa-2af5e99f3c19
5698898d-ab1f-497d-a5dc-2824457868b4	6f5c1edf-9168-4d3e-aa37-0910c2602c32	GIRIS	2	674.42	Alış Faturası: AF-2026-053	2026-02-27 10:12:27.401	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8f077ec5-4a86-4040-9951-a4f993269378
8ea6d419-0990-4800-9c2c-99e02d9add7f	1d5dd49b-eb8e-4278-b301-16241931bd9f	GIRIS	3	133.53	Alış Faturası: AF-2026-002	2026-02-27 10:12:27.405	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	186b4321-b67d-4144-b8d0-99f5ebfc5da9
905be059-4f31-4f2b-ba81-2fd8fd5b24f5	3a5d3c9f-ac75-401b-afdd-2348e7072ba5	GIRIS	1	452.63	Alış Faturası: AF-2026-002	2026-02-27 10:12:27.409	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5e58eb15-1e86-4a69-83b0-fb7491ef9c42
9ecf0def-a8aa-41c2-998f-ca5d7510eb9a	10dab7a8-1a95-40bd-b523-136380a462d5	GIRIS	3	389.02	Alış Faturası: AF-2026-002	2026-02-27 10:12:27.413	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ebcc7ccc-3a45-4879-9bd7-1da0b276746f
cf3b2abd-6634-4c2b-b5af-affe5b8ec3cc	ebf7c40e-665d-4d4d-9801-1d42f8ae71cc	GIRIS	20	6.55	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.418	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	97b7d781-44b5-40e9-a02b-58f86dae68e4
04ad4697-5afb-4bfe-8bc0-3c619ae26de1	3513b793-6497-4dc4-b5b5-316f328b7367	GIRIS	20	3.18	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.425	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9ec1f1e2-1bdb-4e4b-994e-7bc4511bcb85
facf1130-2850-45c8-86ee-05627fb40fb9	1c789117-0345-4549-9116-17bcbd3e4855	GIRIS	20	3.91	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.431	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b56d6411-a184-4fdd-a2db-65a1d857d6c0
cc516a6e-fc0b-4bfc-bfd8-57399d5ed810	683f3239-3561-4d3a-92f4-71d51047fde4	GIRIS	10	7.21	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.436	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d5616522-36c4-4336-9c68-d81e0e211a64
020b4cb1-e919-48d1-82b8-b807338c2d29	afa614c1-ea7f-43d6-8f51-8e7cfe170420	GIRIS	20	6.97	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.445	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bbff74c5-3d4e-4a9f-977b-ba5d8aae0650
70e26865-331c-4f87-a9a2-20398422914d	db50b129-6d23-481d-9dfb-e303b2290366	GIRIS	10	8.42	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.452	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4e6fe81a-a7f9-480f-860a-88e022c3c4d1
442c494f-f18d-4560-afe5-aeb6800db7de	df8c5a21-ac8b-4fed-9c54-f91e7e4db791	GIRIS	10	6.22	Alış Faturası: AF-2026-003	2026-02-27 10:12:27.46	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	38dba6a6-4e89-449c-adfe-c1b0bf02a2aa
1e490525-0b17-497c-957e-e682452a4e7c	9083b4d4-f834-4e9b-b0ef-0321e63d212f	GIRIS	3	240.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.466	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6657955c-6573-404a-acfb-5da18fba0652
af627c0c-819f-44a7-9cbf-f9fc3c822102	63f246ed-be82-4656-98e1-c0bdc120892f	GIRIS	3	270.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.471	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	97f6d4df-d70e-4323-add9-6c4187cca2b4
cd7349a9-a1ea-4b7e-8273-646373603c85	561af7d5-83cd-45e0-9679-474662b496a2	GIRIS	3	300.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.476	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a55b7016-984c-425c-b5a1-b371797cd019
631f22af-0eec-407a-8515-b5fba96d2827	849e0525-fd23-447d-b155-127936ad6438	GIRIS	3	160.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.482	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	91f2fa90-47be-4e1d-ab1f-f93235b6e1df
06587802-5082-4053-80ad-a5dd3315bfcf	849e0525-fd23-447d-b155-127936ad6438	GIRIS	2	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.487	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	49f584a3-af6a-464c-8a55-84199881fe67
e7c6be3e-1946-40e3-831b-48001de6d368	63f246ed-be82-4656-98e1-c0bdc120892f	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.505	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5598f1f0-1103-4cab-91be-75067786713c
b9e93a5e-8d7c-4303-a732-3c37e0ee232d	24d5d06b-429e-4181-b33b-d0ab6b037d16	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.511	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	321592e5-e8e6-4a56-bc02-0574665cfbcc
d5e2ac9b-b02c-4444-8301-c495a554f5cb	10b1c34e-d583-4113-8a76-f41497c3e57a	GIRIS	2	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.518	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a2b26aee-4ab9-49ff-be5e-f2800a58590b
8ccf0e8c-0dbf-4e3d-9efa-9e354759356c	22640228-a849-47f5-8693-9c61154462bc	GIRIS	3	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.522	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	970a18a2-b378-44de-987e-afef26b9add7
8d3ad4eb-5ece-481b-b10c-14cfb25e4ffa	0953ebd5-8be6-4286-8346-8e5a1f0fb9f6	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.526	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1c01c436-1f3d-476a-89d9-2ef71ba38865
094bc280-f975-4b23-9e75-fcfbb02b7876	7942ee83-c081-42d2-93e3-04408281f1c2	GIRIS	2	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.533	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	263fb023-5429-478b-80c5-c974211b5dbd
1f92d188-4b3f-448a-a845-28d44e2084b5	4af4a50d-1f6e-4197-a2c1-6be7e4477c1f	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.539	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8b1ac7d1-98d0-4194-9d21-57ee81b7a3e2
64e4fcae-db7f-486a-97f1-4e0181f156b3	55c9cdce-0b43-4bc2-bea0-faddf082c1d5	GIRIS	2	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.546	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b588a288-c94b-4563-b2ad-acf63475a8d2
6587d9f5-b5c2-42b9-b1b2-9028d8536178	887b796e-4337-44d7-afe9-1801ae0890ce	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.55	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	44428d6b-7eae-46a6-b0ea-3a698b32d4c9
996496fd-7087-4d6d-8c71-387ff4ec65c7	00a889e9-e4ef-4894-919b-48a62f7e9928	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.556	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	39bfa901-54e8-417a-9605-2c6f3b323699
5a4e0018-b5bc-4db4-bed0-da23cddbd8f7	869293f2-ccb1-4543-8cf9-121d74af2155	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.561	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	33ac2206-d9e2-4f90-83de-0aeb332ec1a9
f75610b0-d788-4a1d-b99b-04ec5e27b869	f092694f-c358-4de2-8c08-ea1dafb7ae7f	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.565	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	30db7777-c5d8-4f17-9a2c-80be8f871a12
2373460c-86b3-430c-ac8d-72e9bf8aafed	a0bbc567-de8c-4640-9626-554812ce1b58	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.571	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2061a327-9baf-40e5-8050-2462a38e66cd
66076e92-95e4-4296-bdce-25d3a827c798	5cb3212a-54ca-4838-b3bd-d31a7cd820fa	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.584	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6129e5b3-eedd-4eac-aafa-e8ee94fb7b31
311d5a1d-b2bd-4c4e-bfa6-41cb92ef20ad	2809fce5-420a-4f2a-a4cf-2fdc17929148	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.592	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0a48acb4-e567-40a3-898b-f1516e5798dd
6060374e-f18f-43d9-a972-40da13676491	bc961598-a494-4e6a-beda-76274178bc4a	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.614	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	be38510f-c762-4a22-9f18-78e778c82203
5758995c-5161-44a1-898b-ac0878137516	3e21b37d-f04d-44ee-a0f6-8e9cf8cd2ee7	GIRIS	2	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.638	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e513a48e-31d2-4af0-b2fd-8ba09046f024
2ec1dba7-7923-4d18-a7df-f1e9c46fb021	9e321ab1-0b30-41fa-8b90-22dcdc5817f9	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.645	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9c49334f-1ce8-41a3-8870-2cede35c2b73
25203f19-e79f-4c5f-ad0b-8068beb9de00	79ce4e58-d14f-4083-b2db-cd2c509c68be	GIRIS	1	100.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.649	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	78364292-efa1-4c52-9cd8-49125278af63
f7602ecf-fda8-40e8-9192-fed58d1db55b	4018c936-deff-474f-a4dc-bee6bd0b1498	GIRIS	10	380.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.658	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6e91905f-3900-4bdd-a6d9-dc789c186a98
4b0dc7d2-75f0-4cc9-8d2e-8d1c134aa801	bba3f68b-a9e4-41b2-90f8-70b5972fc040	GIRIS	10	67.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.668	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	af497719-d207-4bc2-81bd-b8be53eff38c
5d0b8452-03ea-434b-be5f-f9f7a2b8f529	6a1645d3-f8e8-4533-a149-0048b61b518f	GIRIS	12	350.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.674	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f2e83e68-3189-4bfb-ae08-e05c0fd4e14d
53e39591-799e-4825-999e-049a0f66c883	33078d48-4cd1-4dbb-ab82-936a0e29c9a0	GIRIS	3	450.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.684	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	01ca5daa-578d-47fe-ac10-bffd009d2585
fc16a604-cdc3-4c5e-9a92-f40ae5f234fa	f6083173-c991-435d-90e2-254725f9a5ee	GIRIS	6	550.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.69	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9b10d170-eb84-4eff-bc47-cac67c9b4f04
8222ed7d-c73a-4f23-8124-5ffd4cfa9a72	1eb6e181-ad33-4d20-a80f-dc0114ff545e	GIRIS	4	800.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.701	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2eb9d1cb-3fa6-4bab-8aa1-ddcbe72181aa
744e6ef6-2f89-4470-bf82-e92b6b46304f	07655f8b-663f-4662-a0f9-6f347f329522	GIRIS	4	850.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.71	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d4a3451f-a417-483a-8841-82d07fbac76b
94dc820b-3656-4a34-a940-3b0ec7fc23e8	e66ada10-7751-4bfe-ba2d-e68e38b3919f	GIRIS	4	1650.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.715	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3dc05280-a52b-40e6-9d00-9cd08e4ab7e2
19c22397-1f0c-43dc-b9b5-dc8b22278345	95040091-05d0-4a7a-8849-25c207d73f35	GIRIS	6	1250.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.721	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fe354b4c-a468-476f-b593-1c48d3579478
ac406147-dd87-4e75-84d9-762744012306	95bf9376-130a-4420-9122-29f8196e34ad	GIRIS	3	2500.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.727	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb7d3e78-cf21-4f55-aa09-7506f4e2f0a0
16786391-9d4a-49b1-9ad3-9775418f139f	e1f59120-da93-4573-b1e8-918e6084bf2d	GIRIS	3	977.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.731	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	905b5c15-38e6-4c4d-a25c-62de405b408d
29bb7fb3-f5a3-4daa-80d8-a82f0489397f	9a5fe81b-0148-4749-a3df-b4a8dcd659bf	GIRIS	3	688.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.735	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bba853ec-e4c2-4de3-b50a-a31ad0275139
04d404c6-2112-4109-875b-09f2798c70aa	a2035b61-5aa0-4c34-840a-9e63644c48f5	GIRIS	3	865.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.741	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	57ff85fb-d725-4782-b200-b3c5d25efa47
81a87bb3-b215-4edc-92d4-7d8b19378c78	0b58332b-9077-46b7-9f25-955cf468e00f	GIRIS	3	1060.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.745	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6ee76e2f-04e5-453c-b791-e51379085956
444f4557-323a-4d37-be3c-b29e6c030ce9	8436cadd-59b5-4ff4-a9e8-cd488f7dda9a	GIRIS	4	1200.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.75	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	15f306cf-6520-48c7-b917-5a0edb1831a1
5d785d3c-6896-47d5-9932-32e2d8795172	118241c5-8dd9-4124-a763-eee8a09adb06	GIRIS	4	600.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.754	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0a1807b1-b503-4993-8484-477d4bfda737
69c699a4-881a-4cbc-a7ff-4dd9756170fc	e05fd2cc-ccab-445f-af0b-2cd94bd78732	GIRIS	4	924.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.758	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	34dd76d3-a7d5-4b50-8b4a-080fe6e1c0a8
dd65c4d1-a9ee-4ec1-9375-d8cc627f1b70	1e71ee04-477b-4cfb-ae02-6f4f31ec2e82	GIRIS	4	972.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.761	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	638a3c2b-07fd-47e9-b364-be445710914f
ab2a3b7b-8d9c-40ad-a779-f4f48dee34ac	66a8db4a-3009-4288-8ee6-1cfd6847fd9e	GIRIS	4	521.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.767	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	61f4e545-d027-423d-8fbd-3c7a97d7ee57
97a6711b-59af-40ee-92d1-d76520b99266	0753a8b4-1061-4f45-a558-8bb35464972c	GIRIS	4	1150.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.772	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	40d9d681-6432-4b9b-a8e0-0ea419e956d1
6d15aaa8-674f-4349-a5d7-8182d156f523	8c6132d1-caeb-4ee2-a808-691ad4a747bc	GIRIS	4	700.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.784	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dedfd061-63cc-40c4-add4-ff9a5f476e5b
fa81d8a6-907d-497b-9fca-ee266bd79eab	4c677e5d-af26-4257-9430-ad57e7b51b43	GIRIS	4	500.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.79	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1b734fa2-20b4-40b7-a43e-7257ade700ff
44b02c90-917c-49b6-bb23-0928f45e3d28	f40fcf68-9a05-4d3e-b5bb-913eb524f08f	GIRIS	4	660.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.797	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0df14089-03c1-4c87-b95c-f071e0b026c8
7649e8e6-5c08-4d80-8def-9d947e53d43e	652c437c-e68c-4180-b1c1-79ec9971c4e0	GIRIS	3	1450.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.804	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	27b631d5-e9d4-4149-b97b-00ab44b0d808
97fe74fd-8e9b-4cde-bf03-df1db5f3064d	eee51007-4697-492e-bba6-1deb068923c3	GIRIS	9	1117.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.814	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	665fcaef-d310-4cbe-8c93-96f7afd9435c
71732fd6-fa1a-43f8-8a56-606e0dced0ed	78ed3452-79f5-4534-b490-612a9c982f1b	GIRIS	7	220.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.823	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f460feac-7c0a-4e72-b10e-c210236acfa8
0ff3cd39-b05d-4802-b22e-30c2c72056c3	385e5aa1-4a71-41b0-b1bf-43aef7addb7c	GIRIS	2	110.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.829	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	03f2093e-3616-4f13-9deb-aaf556e2f942
3630e360-a161-4b54-8121-dcc9b960eb45	1dd72164-e19d-420d-b8ce-d2199715f550	GIRIS	2	110.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.839	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e92e6202-0d20-4044-9a7d-139309f916b4
2d236a63-0eac-4a6f-8028-a292c90abdba	630bf4a3-0205-49f2-ac1f-90800eaeeaf3	GIRIS	2	160.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.853	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ef10dee8-9c9d-4eec-82f5-82228e9400d1
a6b4d135-f0bd-4ec5-8e51-255f4e27ea92	0c5ff615-dac6-49de-91f6-d63866d55b40	GIRIS	2	210.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.86	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ebc410aa-d563-468b-be3c-aadad745caa9
1eecd076-e4b6-4799-9a67-3b2cb15a655a	40936006-bcd0-46a8-814f-8dd6d91a26a4	GIRIS	2	120.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.869	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9b7fe915-5548-4f47-b4e8-3b2338aa0fe9
eff251e8-2354-4d6e-bb0a-c1f238e80056	07b770a9-8fe6-428f-8872-6d339201f491	GIRIS	3	160.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.878	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dfc48224-feb1-49bc-82b8-6716c8407d30
5f33711a-ec61-475d-8b99-a6932d3ec576	105696c0-dc3d-4160-8fc3-897a55974cbc	GIRIS	3	170.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.885	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	19bb2c01-27f5-4577-a453-254cadd712da
87004d94-d01e-4bc9-a3a9-3b1312a17b6a	d9259aa9-32c7-4d1c-a54c-d67307896439	GIRIS	3	200.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.89	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5610c288-ffc1-4270-9fc5-175e1ae88b03
977b972d-edad-4352-ad63-41a2013b7339	24d5d06b-429e-4181-b33b-d0ab6b037d16	GIRIS	3	210.00	Alış Faturası: AF-2026-001	2026-02-27 10:12:27.893	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	955ddca6-5a8a-494d-bc45-adfbf8b592c0
d554ac90-eb8a-4e2a-8110-becb369454ac	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	GIRIS	40	433.00	Alış Faturası: AF-2026-028	2026-02-27 10:12:27.896	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dfaf66c3-4df6-4ab7-a26a-ed80f0d19e2a
4b741445-f7dd-4082-83d4-565d2e077b6c	b9ef0cdc-0b7d-4913-98c3-f08cb973b391	GIRIS	2	2941.40	Alış Faturası: AF-2026-028	2026-02-27 10:12:27.902	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	743c072c-5aa4-4935-8518-f6487436fd12
955f82de-9f50-43e0-a6f9-da1dafaf4a0a	500f0a32-83ff-470b-b0fb-44365269b5c8	GIRIS	1	86.70	Alış Faturası: AF-2026-070	2026-02-27 10:12:27.908	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3bf5d97-1c03-4b62-9aeb-567688bfef4e
38e6e6b5-bb39-4f77-b00a-0135b12e299e	c69a6141-7839-4f8f-925e-51a1ff0c0c66	GIRIS	1	134.22	Alış Faturası: AF-2026-070	2026-02-27 10:12:27.913	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a3bd9320-4f31-44ac-8acf-2bb50b8b0ddd
5643c10d-f007-434b-9142-3f1abccd023f	3f70b0a5-3f9a-410b-98bb-9af6e97ce85b	GIRIS	1	99.63	Alış Faturası: AF-2026-070	2026-02-27 10:12:27.921	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8ddab597-899e-403f-88de-d68ede8e6918
2c9df5c0-63b0-491e-ada9-c17a05eca6de	db7262e7-7f97-4766-886e-9a78bf39705c	GIRIS	1	15550.69	Alış Faturası: AF-2026-070	2026-02-27 10:12:27.925	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	866576aa-b913-4f03-9b75-58b4d0b18b33
558c0802-93cb-4b4b-8f77-91ad583b949f	a8d0e61c-87cb-4f60-9158-c3bca5cf2292	GIRIS	2	73.08	Alış Faturası: AF-2026-033	2026-02-27 10:12:27.929	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	756b0b5c-291f-44ae-9932-4f0a316e16b7
bcce5f79-76cb-4f0a-925f-a50e21be20c5	d18a2a2c-afed-4073-9e04-eec16a993af0	GIRIS	1	90.98	Alış Faturası: AF-2026-033	2026-02-27 10:12:27.932	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1fcb96ee-1cd9-4ab9-ad69-7ad737e521d0
d725cba3-3573-47cd-a45c-4444786b51ea	af1dce21-eb06-4482-9e08-3d3b131f72f4	GIRIS	1	637.36	Alış Faturası: AF-2026-033	2026-02-27 10:12:27.936	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b73e1c08-68d2-4171-8744-7fabda6724eb
c5ce7237-8a87-4956-a039-79ca038b075d	46fe045a-a704-4ba8-8659-c1f1891712f9	GIRIS	1	202.98	Alış Faturası: AF-2026-034	2026-02-27 10:12:27.945	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	274ee1ec-bbac-4187-95dc-5bd07bbe8635
eaa3c34a-f460-4cf5-a90d-2a4fbd1abcfc	b0f25455-7deb-4e68-b004-8b54b7fdd2d0	GIRIS	1	98.46	Alış Faturası: AF-2026-041	2026-02-27 10:12:27.95	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2680a2a8-982c-4a02-81b5-05046e620880
e3f77cb6-f5d7-4cd1-b7c1-8ddd8387726e	1569bfc9-fc44-40c4-8f38-99ebe9434284	GIRIS	1	61.66	Alış Faturası: AF-2026-041	2026-02-27 10:12:27.955	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f4938f71-6714-4386-b9d0-cae83ed275a9
099491d0-035d-4b7a-8697-0b823544b6e4	82954b03-1b54-4287-9f86-3ac85168279b	GIRIS	1	86.02	Alış Faturası: AF-2026-041	2026-02-27 10:12:27.963	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f6a2821d-2717-4e50-a132-c737747a3fcd
e66d2f56-50ec-4105-83c5-488f78063e6c	9313625f-754f-4bab-8e48-68dac414e3bc	GIRIS	1	4199.42	Alış Faturası: AF-2026-035	2026-02-27 10:12:27.97	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	86e1c380-429d-427f-98d2-cf8178279cf1
1ca842ec-160b-4c2d-a024-8cdf5043e895	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	GIRIS	1	594.99	Alış Faturası: AF-2026-085	2026-02-27 10:12:27.975	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a122ead4-1e79-4a9f-a148-06f5741a2513
c3a06429-f84c-4ec9-a8e0-1ee881742df1	492e3d84-3803-4117-8382-3defc2b33e8c	GIRIS	1	214.71	Alış Faturası: AF-2026-085	2026-02-27 10:12:27.981	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1334532f-0409-429d-b88b-827b4703ddc2
25e24be6-fb3b-4cf7-91a7-356f27394332	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	GIRIS	1	909.26	Alış Faturası: AF-2026-085	2026-02-27 10:12:27.989	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5293ec96-7f09-4a5c-9fed-e3c2a7245a55
928c60af-474b-4de7-9460-55a8c294fbdb	4f879a28-5567-48cf-9885-e8be3ef8c025	GIRIS	1	1986.17	Alış Faturası: AF-2026-085	2026-02-27 10:12:27.995	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b0693db6-d2c6-480b-b4c5-1ab0771f3bf7
4e0e31b3-2d2b-4cbf-bc3f-08538e0f1fea	14a09ecf-2c5d-4579-a891-371719a24a36	GIRIS	1	1655.23	Alış Faturası: AF-2026-085	2026-02-27 10:12:28.008	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	83b09dde-af85-4025-8469-b678dbac3e1f
27f3a473-8b90-4502-bee4-ad1b6cea2cc9	113d0d8d-5198-4415-b81c-5c812ed4e435	GIRIS	4	140.03	Alış Faturası: AF-2026-084	2026-02-27 10:12:28.018	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	324b2954-5731-4af5-853b-0ea8716f080e
e5860196-bd10-4778-bd7d-656e220a6448	1d0a5188-ba70-4451-b294-96c61b46d3ab	GIRIS	5	9.70	Alış Faturası: AF-2026-084	2026-02-27 10:12:28.025	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0ad49841-8f8c-4c49-96fa-5bccea57bf94
df3aef31-c138-4ba4-8003-6f822d1c8032	30371764-9531-4d61-9636-4cdc385d9a6f	GIRIS	1	871.07	Alış Faturası: AF-2026-084	2026-02-27 10:12:28.031	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e234f534-ee6c-4787-a417-39699b8044d6
a3e665c3-93f4-4724-ab20-2f69f4cc8083	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	GIRIS	1	622.12	Alış Faturası: AF-2026-084	2026-02-27 10:12:28.036	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	09ebc691-c487-4f72-aec0-89f60f1b3612
46e9fcba-8ba6-402b-9f8f-08d00b5ca9a4	747041af-5928-4134-b6dd-68c2c6081b29	GIRIS	1	327.25	Alış Faturası: AF-2026-084	2026-02-27 10:12:28.043	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3cb329f5-a61f-42a5-9326-4d0ffe459f79
361869fe-a296-4024-b361-da5e450faa4a	c190aad6-0676-492d-934a-28d3ff6e2bd2	GIRIS	1	12217.45	Alış Faturası: AF-2026-036	2026-02-27 10:12:28.049	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a2e157e0-2a33-4c4f-8f1a-89eabce1e30a
cd712151-e4fa-47e2-ac19-c5b866ec6fd2	46aba001-3916-4498-872b-d43e43d587b9	GIRIS	1	378.33	Alış Faturası: AF-2026-052	2026-02-27 10:12:28.052	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	294be12c-6eb3-4fbd-afee-19a0f7e52311
884751f9-b88e-423a-9753-7396e0d1dbf7	5f0e462b-b67d-48be-b9ee-9a1bc9543482	GIRIS	1	99.15	Alış Faturası: AF-2026-052	2026-02-27 10:12:28.055	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b688c31a-5130-4f1e-915f-f4f2c9fb1430
8e8cefe5-f8c6-4bdd-971b-c1bba5991dd0	b6f21c2b-6225-4ebc-8387-557f81d0b08b	GIRIS	1	442.79	Alış Faturası: AF-2026-050	2026-02-27 10:12:28.06	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	50b4dfe7-083c-413d-8ee3-0dcdf5a80dce
05caf757-42d4-47d9-848c-077733dc440d	1610b0fb-c0fe-420d-b8cb-ea32a03c80f0	GIRIS	2	58.16	Alış Faturası: AF-2026-051	2026-02-27 10:12:28.064	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3e9f09a-5173-4435-b9f5-b1c2cd7d0424
1a4953f2-e07a-492d-a8f6-e2f6004b74ca	667aab2b-caa4-4826-b3e8-533ace431f90	GIRIS	1	58.16	Alış Faturası: AF-2026-051	2026-02-27 10:12:28.071	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ac360192-239e-4dfc-a57c-81a3a4ac0d6a
17be0dad-f286-4682-87c3-e36d639cf438	d494e5ec-be68-409d-a50d-227e1d0df98d	GIRIS	24	83.18	Alış Faturası: AF-2026-051	2026-02-27 10:12:28.077	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cc032aff-cd51-4fd7-ad84-457477adf641
78ab62a4-40f4-46ba-9eb0-6e21f4565fb2	a7afc855-d4aa-456a-811e-a162f685e1b1	GIRIS	1	148.19	Alış Faturası: AF-2026-037	2026-02-27 10:12:28.082	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	07767232-06ec-446c-b38c-24405c5cdbaf
c9bd73dc-1373-405f-889c-78b3a6157fdc	d55c6017-a666-4c0f-91c5-05801d2bd8be	GIRIS	1	420.52	Alış Faturası: AF-2026-037	2026-02-27 10:12:28.089	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	70ab202f-fd1e-44d7-b577-91c107f65ad9
da193d6c-9475-480d-94e2-25bd92c17c79	a9a3989f-edcf-493a-88e0-4250d87bb6ba	GIRIS	1	138.87	Alış Faturası: AF-2026-037	2026-02-27 10:12:28.093	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c94af01d-1dd3-4d69-9122-4156049e2591
c059b482-2b06-4662-a58f-f7d5f7400a9a	fd0e24dc-66c8-45ad-933b-6a5e81fa0647	GIRIS	2	5004.70	Alış Faturası: AF-2026-049	2026-02-27 10:12:28.097	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	98068177-da2c-466b-a98e-69002eff1176
5ae6fd8f-40e1-48f3-b013-253a054d0b30	4c1f9e58-ae36-4450-812e-39de8a07c684	GIRIS	1	1140.26	Alış Faturası: AF-2026-042	2026-02-27 10:12:28.102	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6e3e0d07-40a7-49ce-8c13-cd23c5063322
34a9a605-2b79-43ac-86a9-49870e3b8da8	f4462d6b-9686-447c-9310-9c9012b3d20d	GIRIS	1	1140.26	Alış Faturası: AF-2026-042	2026-02-27 10:12:28.106	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4b4764e6-6ddc-457e-8a62-138b5629c4fb
087309f0-c481-44e1-97b3-227bff59262c	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	GIRIS	5	418.61	Alış Faturası: AF-2026-048	2026-02-27 10:12:28.121	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	44186d7e-cb21-4225-b1eb-94c335136539
3956eb7b-d0ad-4b1c-90e3-65134d0ec708	c7158d69-5a0b-4a02-a011-ae9eb32e9559	GIRIS	20	229.00	Alış Faturası: AF-2026-056	2026-02-27 10:12:28.135	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7d97dc68-ab7c-4195-b437-ae08a59f2072
5cfc6a65-b9dd-47b5-a100-edad16ce1e67	4050e934-95b0-4db4-8958-3b2781c9843b	GIRIS	1	129.90	Alış Faturası: AF-2026-056	2026-02-27 10:12:28.139	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0254c361-95eb-4b5d-945c-f987cf26f67a
a10f6f1e-5a98-4e6a-8c8b-c7aca12dc6b6	ce172f29-bc42-472b-bde6-2ce7be654416	GIRIS	1	622.65	Alış Faturası: AF-2026-038	2026-02-27 10:12:28.145	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ba932b61-42f4-4c24-8b3d-0da9b9aa47e0
dd8857d7-de15-49ad-8b2a-9208e7e32bbe	8a3c1cf2-36e4-48c2-8cab-0a9d7daddb12	GIRIS	1	129.75	Alış Faturası: AF-2026-039	2026-02-27 10:12:28.152	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a357a299-2618-4d53-bd05-aa24a30846bb
7a1870c8-f054-4425-b5fa-279057768bed	f2466b52-e1e7-4307-b0e6-ff537b7864c6	GIRIS	1	102.69	Alış Faturası: AF-2026-039	2026-02-27 10:12:28.157	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4bc92b4a-288b-422b-8b19-9a96166e099f
f3a67499-364c-4c01-b702-ba11b2527d1a	a0a99d75-4606-47b2-b661-9d3032cfcc4d	GIRIS	1	797.74	Alış Faturası: AF-2026-039	2026-02-27 10:12:28.161	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6921fb94-d97c-46b9-9976-533a57ac6cf9
8fc39b49-ec04-4601-9fe6-a8bd95607005	1c789117-0345-4549-9116-17bcbd3e4855	GIRIS	10	3.93	Alış Faturası: AF-2026-039	2026-02-27 10:12:28.165	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a0a64d50-0655-4847-872e-a6d64be51a22
da939645-5423-4fed-873e-9f2a7a880f31	683f3239-3561-4d3a-92f4-71d51047fde4	GIRIS	10	7.25	Alış Faturası: AF-2026-039	2026-02-27 10:12:28.169	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5a4e0e8c-87ef-4510-86f6-3ee6fd7fb3f9
c586e3eb-55a0-4f86-b339-d89cef227b06	e86c9805-eeda-4ceb-85c1-3d574e3b74c5	GIRIS	1	2583.33	Alış Faturası: AF-2026-055	2026-02-27 10:12:28.174	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	85c1e0d7-3797-44c8-bf57-79adb950f6a0
56fbf3f2-0479-424c-aaf6-e0a46074a3c8	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	GIRIS	2	123.46	Alış Faturası: AF-2026-040	2026-02-27 10:12:28.179	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d98d7a69-223a-4318-8245-d1a7d4d791a0
3288f81b-95ef-475e-bacd-9f3fd16838e3	a63c9f6f-2501-4b94-8135-530556ed3322	SATIS	1	850.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.048	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6c645222-e576-4e8d-819e-696d7ef8c6bf
7cfb54b3-d540-4307-8e8e-238d3d3339a1	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	SATIS	2	350.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.05	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3d384dca-c09a-4ffe-b2ae-280985c79862
a09d68f0-896e-4950-a03d-7ab24b3a2ffd	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	SATIS	1	2500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.053	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3edd984d-ac5c-4eeb-9589-07d45b1d94fa
02823279-d878-4d43-bfe8-4dddc5851cbc	897aae4d-55b6-4921-8d25-c42dd6b82be7	SATIS	1	9500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.055	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	323b3bf1-80c1-4e47-93b4-b9b8b9363db2
b89a983d-5814-452f-ad85-2af51a17e4eb	88c2c8c2-f1bf-4721-87cd-479024478cc4	SATIS	1	1250.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:29.058	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a44f6699-08a6-44a8-818b-9089691a1f39
093d2954-33ea-411f-b56c-2684b69a8292	d7887add-f677-414d-97b4-f90faa29e648	GIRIS	1	597.05	Alış Faturası: AF-2026-043	2026-02-27 10:12:28.184	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dc457258-f51f-4252-8a6a-4c06285ddc09
c4a4d3e9-d7dc-4522-8154-7eb4d54b39df	6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	GIRIS	3	737.79	Alış Faturası: AF-2026-054	2026-02-27 10:12:28.233	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2b592fd2-f62c-4a73-8b19-2a24424e44df
1ebe43fd-e498-4ab1-a7af-55b5e6ce9a8f	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	GIRIS	1	701.83	Alış Faturası: AF-2026-099	2026-02-27 10:12:28.236	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3bb11d93-426d-46a3-a2c7-c87a4366c537
3b63b72a-176c-44b9-ad38-d8d8fc2ce00a	7587710e-9c19-4911-bf83-def195b942d9	GIRIS	1	211.89	Alış Faturası: AF-2026-046	2026-02-27 10:12:28.242	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ddab4845-c24e-4381-bb4e-388523e67694
22021134-781b-4ef2-8f58-5f6b4c62e4ca	1e356282-dd07-4f5a-879d-0f8568734952	GIRIS	1	154.77	Alış Faturası: AF-2026-046	2026-02-27 10:12:28.247	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	74ba2b12-98ce-4334-9e9d-161231bc192a
50d41afb-29f0-4d51-a42f-8137d5a95903	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	GIRIS	1	542.23	Alış Faturası: AF-2026-045	2026-02-27 10:12:28.251	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	169edd0d-bd29-47a2-9faa-de1295875500
a17abd62-8536-438d-b340-065f3d186f71	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	GIRIS	1	2153.32	Alış Faturası: AF-2026-045	2026-02-27 10:12:28.255	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3cfd49a9-99ed-4f85-9894-4a9318bead8d
f62ae0af-f5fe-4ece-a6d4-0d2e590e2fd5	5f0b3771-26f2-4905-bae6-85d77b9a5ec6	GIRIS	25	20.10	Alış Faturası: AF-2026-047	2026-02-27 10:12:28.259	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e3d4a390-75d1-4ff5-a99b-80038f6d80a9
57716c10-6b3f-4cc0-aa31-57a0195ba57c	de03694c-358c-4793-bac2-b876476ea2d0	GIRIS	5	143.53	Alış Faturası: AF-2026-044	2026-02-27 10:12:28.262	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b844d606-2916-4c86-a560-5eff42995124
9e1425ae-94cd-4317-93ac-052065e86e32	19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	GIRIS	1	339.03	Alış Faturası: AF-2026-060	2026-02-27 10:12:28.265	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c6661e08-c0d3-409b-88ed-585c7adb506c
d612834b-ed40-4bbe-b27c-0381a73c5202	e8564a36-6b84-4a98-93c8-e78ba2d096bd	GIRIS	1	835.14	Alış Faturası: AF-2026-060	2026-02-27 10:12:28.27	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	06ba86ef-d244-405c-9657-6351f98dbbc8
d3053e72-cbab-4c9a-8aba-9adaddae436c	befa4db7-76e1-4e25-b775-e5134a7aaad0	GIRIS	1	233.86	Alış Faturası: AF-2026-058	2026-02-27 10:12:28.273	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	60c13978-b56c-416c-9472-9bc24b991bcf
89e2672d-ba49-4348-9b44-5925ca81a2b8	7f69153f-992a-49d4-ba61-8c64f69f0b70	GIRIS	1	1729.81	Alış Faturası: AF-2026-057	2026-02-27 10:12:28.278	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	edd82e2e-2061-416f-b82f-82449f656118
c0d7d841-2509-423f-8eda-bf8acb41bf70	fac371ee-4670-4c55-a6af-1995c5297bab	GIRIS	1	330.53	Alış Faturası: AF-2026-059	2026-02-27 10:12:28.281	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e72da49e-5622-4759-b446-2e191f285063
ece34c15-dd1e-4045-9265-0323d225b4f2	7f69153f-992a-49d4-ba61-8c64f69f0b70	GIRIS	1	1729.81	Alış Faturası: AF-2026-059	2026-02-27 10:12:28.285	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c754aa13-7fec-48dd-8633-fff054769930
cb037f04-ba5c-4397-a84a-edef3851badf	d390a057-d84b-4a11-9031-073e3de7955a	GIRIS	1	448.72	Alış Faturası: AF-2026-069	2026-02-27 10:12:28.293	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5eedcc36-b95f-471a-9da8-3a98ed477bc1
a75daa12-a4d6-4109-9c54-359b08e7f880	72be9051-6b71-4c1f-a4ab-e98c697a8e88	GIRIS	72	96.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.297	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c5537033-ad09-4053-9080-3f5081b46fef
4c48f63d-7965-4bfb-aca8-17e0c6f0073e	a8c2e870-8f92-4461-967d-24f56be2c0aa	GIRIS	24	96.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.301	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5c0170c0-f9d9-4cdc-9a9c-516559af2598
fa1cde12-236c-46ca-8da6-4af2a56ed3d6	fcbb1661-949f-4493-b50f-15bc992b7224	GIRIS	12	163.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.304	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ff3e14b7-0aa9-4f7b-b471-e3a9d5613e76
243ced58-2f69-4ab8-bf15-2842b5b9a772	728892ca-627d-419e-bc88-a8bb8d9cdee3	GIRIS	24	163.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.312	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ba6bf6b7-5d98-45c0-a4b0-70be05da579f
42425532-87ee-402e-9b48-d2f8c9687469	eeaef272-ecf6-4bab-8169-22b624cc581c	GIRIS	24	138.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.316	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	aaad7243-5c7c-4d85-a232-88bc0d7e453b
90db3aa9-9dfc-4f5c-8da6-8b0db74cbf60	71f9be3f-fc04-4512-8613-59f4e89b7f13	GIRIS	12	125.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.32	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3e95d5a-d88b-44c2-be69-a19b062e5940
cd31c589-d858-4f6a-9c00-82afe3ec746e	84940dc0-70a2-4067-9639-eab609728fdb	GIRIS	12	117.00	Alış Faturası: AF-2026-061	2026-02-27 10:12:28.326	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5288667f-8d0d-4cb5-9a78-ae8e9a8f6c40
10db1658-b6e7-4410-acd7-e6cc1c8fa2a8	7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	GIRIS	1	1268.80	Alış Faturası: AF-2026-068	2026-02-27 10:12:28.334	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	441f4b1c-ad40-4de1-9e88-0f990ecc8ecc
98bdf16f-a911-42d4-87dc-5faf879764e5	3f15dfee-cfd3-4307-a1df-c9cc5beb40de	GIRIS	6	118.74	Alış Faturası: AF-2026-067	2026-02-27 10:12:28.34	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	af27224a-efd3-49c2-b089-7f9070d7fe98
3af3c8d4-496e-4a5e-8da2-e63a7239fa30	e9751b2a-071e-46ac-bc6f-6bcc5c2a6e29	GIRIS	6	70.06	Alış Faturası: AF-2026-067	2026-02-27 10:12:28.346	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	17407a2f-7c14-49e8-aa45-494cf0b83ff7
176b2a12-7afa-4add-8a0c-d73a928734ec	26c7f88f-3f2f-49ba-983b-73a06fded6c1	GIRIS	1	235.54	Alış Faturası: AF-2026-083	2026-02-27 10:12:28.357	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	894e2d2c-1959-48e9-96d1-329bf8d9c4a8
2c3573b2-ae95-4de4-b1b0-da3bf8076a54	b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	GIRIS	1	3239.29	Alış Faturası: AF-2026-083	2026-02-27 10:12:28.363	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	56a1a1ae-7c97-454f-8a29-0db1d3762243
7b35a491-04b0-4e99-9a78-31d5def1d447	36595002-482b-4835-9f28-ec4c96336b95	GIRIS	1	404.26	Alış Faturası: AF-2026-083	2026-02-27 10:12:28.382	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	20756a90-5870-4252-8b34-975e84615d80
0dc53580-3c3b-4c74-8441-b9db2d03c53b	9fc2242b-2719-4bf3-8363-f5309001394f	GIRIS	1	1072.51	Alış Faturası: AF-2026-071	2026-02-27 10:12:28.389	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	20ade112-feb5-4ffd-af9c-e052229b48f1
e48bdee1-aa5e-429f-843e-5c52ba2ccebe	bcc20bd8-4c64-4912-aad3-fbdec97bb56d	GIRIS	1	1888.21	Alış Faturası: AF-2026-079	2026-02-27 10:12:28.393	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	83445c3e-b99f-4db5-84de-88a1d18b8d66
ac68e0e7-e102-437a-8b47-0b5e107d0205	592f367c-0b18-454a-8ef0-8e863e86c613	GIRIS	2	107.18	Alış Faturası: AF-2026-078	2026-02-27 10:12:28.399	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	abd40a56-344b-4c28-be57-326a38e7784f
536e192e-3b25-4640-b1a9-9e7ebe23cff8	35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	GIRIS	2	723.84	Alış Faturası: AF-2026-076	2026-02-27 10:12:28.408	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8ff324db-6acf-487d-9413-73c010b70392
9a954c58-1100-4f8a-97fe-4d3ddc1e68c0	dccb985b-cbf8-45a5-90ee-3fa62d360f73	GIRIS	1	347.09	Alış Faturası: AF-2026-080	2026-02-27 10:12:28.412	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	92fcd81f-6be7-4504-a6d7-09e88e629f30
99d74fce-2816-482f-b3ac-0f27ea15dffc	c02c5ee2-d1be-4ae5-b7df-77d26be2c244	GIRIS	1	493.79	Alış Faturası: AF-2026-074	2026-02-27 10:12:28.417	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bf360bfd-af62-46e9-b499-2a3a912d7f7e
06ccd188-27f0-4e85-8e16-c155350ff85e	a63c9f6f-2501-4b94-8135-530556ed3322	GIRIS	1	637.60	Alış Faturası: AF-2026-077	2026-02-27 10:12:28.423	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dfe4d1a9-172e-4c75-a780-675b79aae55b
4459de37-bff3-4293-b798-c6f529b64226	c441f074-9714-468e-93bf-3e653eff4524	GIRIS	5	109.06	Alış Faturası: AF-2026-066	2026-02-27 10:12:28.427	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	28433695-7710-4155-9a1a-d852d9df2aba
c56d04c6-c245-457d-8128-19c6a42b0aba	7d8077c4-da82-47a7-a7d0-c25eba803b25	GIRIS	1	1637.22	Alış Faturası: AF-2026-072	2026-02-27 10:12:28.43	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	db938a60-0bbb-40c5-ba55-6258da91ec7d
8b286c83-a3d6-471d-b6c2-6c74436f509f	897aae4d-55b6-4921-8d25-c42dd6b82be7	GIRIS	1	6666.67	Alış Faturası: AF-2026-073	2026-02-27 10:12:28.436	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dc95a4af-0578-4027-97df-d1178e606181
8ba7c3e3-037f-4957-bd4a-278a89ac5b47	7bce05e7-a94d-42ff-a4fe-084854e6e44e	GIRIS	1	1666.67	Alış Faturası: AF-2026-073	2026-02-27 10:12:28.442	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3f6dc3f9-08be-44d6-aefe-dd8f7a2d9df9
f2b836d8-5d0d-44a5-85fa-fa452385e3f0	acb90037-dc49-4d00-9bdb-5e201b87e61b	GIRIS	2	217.22	Alış Faturası: AF-2026-075	2026-02-27 10:12:28.446	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	95db8ce3-7d71-4e20-9abf-b3f61530c659
6d42363a-233a-4ea0-88f7-276a22f7cc43	88c2c8c2-f1bf-4721-87cd-479024478cc4	GIRIS	1	953.15	Alış Faturası: AF-2026-075	2026-02-27 10:12:28.451	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5a650fd2-136d-44fa-9d56-7285f794ab3e
6b937af6-eb45-4d25-8766-2f96835725b9	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	GIRIS	1	953.15	Alış Faturası: AF-2026-075	2026-02-27 10:12:28.454	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6fdaeb4a-9a69-4e1f-86d9-94bccab9b426
7ee41973-f1e9-4bc5-86a3-7802f5c7708f	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	GIRIS	2	169.50	Alış Faturası: AF-2026-075	2026-02-27 10:12:28.458	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cd846f7d-0ebd-452a-8453-e11fdf00341f
522d72ea-1acd-48ba-bd60-a67b68016e85	906977a5-923e-456e-8488-dd8959c4d5d3	GIRIS	20	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.462	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9e610142-e794-41a8-821a-1b68b528ac4b
8f4cfe3c-bc6a-495c-9139-e53cd6e60515	39521e5a-426b-43a5-8a84-ac2adf158311	GIRIS	10	80.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.465	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1c14e3f8-9b77-4a27-9838-1ddbb33028a4
ebf4f359-d594-48a1-9da3-2ff1588d836f	f33e60ce-1ef6-4bf3-aa5f-da7b88f25277	GIRIS	10	110.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.468	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	01300317-8373-49a1-9aa6-dfeaf9074d09
a2dfcb96-a703-4cf2-a7dd-0d692d523fbf	5ff2e5dc-b793-4f91-832e-284bca9f7298	GIRIS	30	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.47	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	be3f94ae-14e5-4c9a-abaa-65fd1ab07fb9
75c6e76b-3b91-4415-83ef-49732e5785e6	6d85bcde-78c1-4ec2-a18d-4934d7905ab5	GIRIS	10	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.474	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fc653dad-4bcb-46fc-a465-875f23e42b84
75e0f7fd-5c9d-4062-91ea-07b903453e9f	df13e644-c357-4a18-9969-6862e05182eb	GIRIS	20	100.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.478	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	65483fa1-dc4b-46bb-92fd-b1242a63347a
3e09b867-940a-443a-bc0c-9c3050663fe4	d96763b5-aa5e-4d3e-a98f-db60d5f59cf9	GIRIS	10	100.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.481	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f179ac30-6917-4252-8e32-dce791f275d2
f7ff055c-e40e-4543-b90f-c6bffce03b5b	5ae6c502-9925-47e1-95eb-be56c45a8f19	GIRIS	20	110.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.484	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0e1ff1a6-a744-45f7-a579-c9e39c8ab8b2
bfd44dd2-7da7-4ce1-aaae-49296a57fa7d	55b7d98c-d568-4bca-b809-3fbf2591810f	GIRIS	50	120.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.489	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7f2a5e0f-34c1-4a8b-a1d1-e2d0c17a03b9
4fc7bb36-6bc6-4c5c-b68a-1fad74d606cc	a607a8c0-646d-42d4-8e05-b76616642ec8	GIRIS	10	100.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.492	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3566fcf-9287-421d-a95a-e3c5b1ced18b
f1b55ff3-1cc1-4554-bb65-88a64e2de224	4b07b8b4-f73a-4357-9221-952f3a1361e9	GIRIS	50	120.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.495	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	323d9eab-6f91-4dc3-ae46-81dde065e2aa
aa4235db-26cb-4371-9379-e20c7ec523f7	5f00d96f-b470-451c-9bef-513c2885cb8e	GIRIS	30	140.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.499	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e59b09c8-7fcc-4df5-bc1a-e1dc02fb4b42
6d53cda4-12d5-4024-9778-77f903798c40	caf736c7-f3ca-4139-a210-195139a3de3c	GIRIS	20	120.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.502	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0ad86972-72ec-4ae0-8d04-27d55e4e4bec
225598ae-0f71-4416-bf02-7111e4b2bb1d	5d281808-dc6a-4157-9f62-67b549b54b3a	GIRIS	11	190.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.507	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	dae6654c-743c-476c-9e62-520d031b6953
54966724-32dc-461d-867e-fd0e789d075a	36fe0b8b-7419-431d-87d8-6d3ba255b666	GIRIS	5	140.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.511	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c50fac0f-a3c8-4887-a224-2824e8f4fb2e
5f5bb9e9-f785-4d9f-8fd9-1bcfbc94b4c5	da6c69b8-ab7d-4824-85cb-65620fba47dd	GIRIS	20	110.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.514	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8a5015ad-a799-4816-af76-918eb4c08a0d
e0ed25eb-8dcb-4a63-af5f-f50d7c847ba7	1cbeb981-361e-4316-a0de-3de01549c185	GIRIS	20	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.518	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	1ff4bfc7-4dd1-471d-add3-0c5e10a045cc
a739e512-a901-43b1-a2af-1e127adc0e77	944bdaeb-9133-493b-8c32-9e381d9f8b46	GIRIS	20	130.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.521	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a4cdb052-cb03-4592-a788-02e2cfb90c87
c89c269d-528f-4bc5-92ca-075a74ad7e3b	c1000f39-02eb-4c12-859e-96627aad4820	GIRIS	41	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.523	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e9d3fe83-9f18-4b19-87ac-252645ae07ea
7937e6d8-6443-4580-8f4f-f6e58b68a624	190453cf-6a4e-4f64-864c-73de4a259112	GIRIS	44	90.00	Alış Faturası: AF-2026-081	2026-02-27 10:12:28.527	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	fa3ad165-fbff-4f96-b457-0316876d1543
e7dc0073-b848-4e1d-98fa-10d8a0636499	1863e171-b0ef-4479-a0b2-2f08b1142281	GIRIS	10	23.76	Alış Faturası: AF-2026-086	2026-02-27 10:12:28.529	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a8b72d45-0c14-4c49-8fae-32ff6035352d
191aea82-42c0-4b24-822d-7dbff31a75f7	75c4d717-f012-4e8f-a426-7ab1b2501f24	GIRIS	10	7.53	Alış Faturası: AF-2026-086	2026-02-27 10:12:28.532	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	07a28c60-7ee5-4eaf-9ea4-81b4e99cbc5b
eeb92bf3-97e7-4ed2-81eb-bbc6d32db8d7	92870c73-cab6-467e-a7ba-792b4f279546	GIRIS	4	50.78	Alış Faturası: AF-2026-086	2026-02-27 10:12:28.536	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	582be2fe-82e5-4003-8ce6-17c590e20418
089063c9-3b56-4d7f-99c0-0a256b72eaea	e90d37ab-ea59-4252-b2f5-7c0ec275bc22	GIRIS	792	55.00	Alış Faturası: AF-2026-082	2026-02-27 10:12:28.539	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	86a40180-8c5f-452e-b52b-b3319ce38cdc
737a0acc-089d-4f9b-92b5-12bdf68322b1	dbad5926-e315-4d01-b4fe-dc558f119b97	GIRIS	1	881.67	Alış Faturası: AF-2026-087	2026-02-27 10:12:28.543	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	afb1b693-2f4b-409f-81ea-6db5f5ee751a
b8e04c6f-77d4-4088-83e6-b23579257291	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	GIRIS	1	1697.08	Alış Faturası: AF-2026-092	2026-02-27 10:12:28.546	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	819a4205-757e-42af-81e7-7e57f4171029
58f70bcd-544d-44ee-b346-0d6a396235ff	d9260889-4f94-4e97-8273-3e158999a1c8	GIRIS	1	82.60	Alış Faturası: AF-2026-091	2026-02-27 10:12:28.549	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3d44391d-0018-4fa3-8b88-8552e5848388
9274fbed-3bb2-4799-bd78-76a267476ee5	b397902b-886f-4dc4-b51f-98f786381773	GIRIS	1	163.07	Alış Faturası: AF-2026-091	2026-02-27 10:12:28.555	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	eddbbe14-eb26-488f-abbd-8a679b5104dc
61e8f0b4-cb50-4e5a-8440-c39388bd5e43	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	GIRIS	1	138.25	Alış Faturası: AF-2026-091	2026-02-27 10:12:28.558	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2aa9321a-0fe6-4c3a-aa8b-88ee9d34ea77
1713b330-0cb0-49d0-8462-ae3ac9ada17c	2d5f2164-3f2c-4e6b-a488-4df2d589239c	GIRIS	1	44.23	Alış Faturası: AF-2026-088	2026-02-27 10:12:28.562	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5f263a14-3799-4916-bcda-d96ade2a1cc3
fefcb460-c91e-46f9-b1a3-d652840e6d34	bb3ce01c-2764-47cf-8309-a69549833324	GIRIS	1	558.93	Alış Faturası: AF-2026-095	2026-02-27 10:12:28.565	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0fd96c51-a9bc-4fa4-8ff3-d273a7348fd6
c1b885e7-417d-4bb4-ad2a-c901b17c0def	2b08a9fa-72c7-4137-9579-778a0e504eda	GIRIS	1	497.67	Alış Faturası: AF-2026-089	2026-02-27 10:12:28.568	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	df776514-71bb-4f7c-9cef-aa339a8d8263
c6daf1e8-aab4-4432-a868-e618eeec0537	e2c7afd3-89b7-46fc-bed4-84ca354efcaf	GIRIS	1	124.15	Alış Faturası: AF-2026-090	2026-02-27 10:12:28.571	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b606299c-f7e9-4fea-bc46-6452a6bbf90e
e6111dc5-ecc4-4683-ab8d-3c52166cf277	3b5285b0-9f9c-4e59-9b18-6cc747fbf8f2	GIRIS	1	82.58	Alış Faturası: AF-2026-090	2026-02-27 10:12:28.573	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ebacee84-9fd1-4cab-8d3f-b09ec3b1aadf
340f3128-2669-4608-b9a3-a8e4958ace24	2e369e1b-aa70-488e-9cd2-cc684d22429c	GIRIS	1	313.75	Alış Faturası: AF-2026-093	2026-02-27 10:12:28.577	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bb07e36e-1b19-419a-ab12-19d188aaa7b3
f427ad03-9515-47d6-9e40-dbe6051007a9	12f306ed-4fa8-4976-840b-8695956a54c6	GIRIS	1	847.65	Alış Faturası: AF-2026-094	2026-02-27 10:12:28.58	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a37e2afb-7d92-4deb-9cce-0a46879ebe28
e137a2fd-95b0-40fe-8dbc-a3027846c287	25ad586b-b128-46cc-8b9e-c5990ffde784	GIRIS	1	734.54	Alış Faturası: AF-2026-097	2026-02-27 10:12:28.584	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e82575f8-50c3-488e-8a1f-d2f7857dc53e
efb1e0ef-4fbe-45e4-bb1c-b633af104790	17a2b899-c2c0-4d14-bcf4-2002d4ba1227	GIRIS	1	795.47	Alış Faturası: AF-2026-096	2026-02-27 10:12:28.587	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	cf76ce58-c2e2-4d43-aeb7-1fe12f2de7da
9b986226-8129-4de2-9223-c66893139095	5109cd23-2697-4d26-a5c0-5a275de3b5b5	GIRIS	1	1908.68	Alış Faturası: AF-2026-098	2026-02-27 10:12:28.594	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3e10cbec-ef0f-4fa5-8fa7-bd32cefa47e0
fe1bb2c3-e4c4-4df3-9a9e-6d9c3b112444	87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	SATIS	1	1250.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.598	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	95115c87-ac76-4302-a7c8-b1e4f4246456
27a7e785-b211-4b48-8da0-87e5374ba371	4033f9cf-dd09-47dc-ab09-ef169e2c11cc	SATIS	2	230.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.604	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	034467f8-4a57-42a1-9c32-5600240d24ce
9a05330d-9cd3-4488-8152-2531ba7c0bc9	acb90037-dc49-4d00-9bdb-5e201b87e61b	SATIS	2	300.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.612	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9ea01520-bb15-457d-925d-e5018c1964f6
24b372b9-7b2b-4417-b273-5a5acc0b640c	dbad5926-e315-4d01-b4fe-dc558f119b97	SATIS	1	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.617	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	febd5bc7-4d87-41ed-8a4b-dd082bd460ba
df71c686-5bd2-464e-8406-e058071bd14e	9d5055a7-1e21-45b0-9916-c8a60bffc3ac	SATIS	1	2250.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.621	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c5bb55c3-2b2c-4e44-81c7-c8e53c1a0c76
12cf05d3-42eb-47c0-881d-9a8d485762df	ebd53187-7551-4768-b016-7ab00badd88c	SATIS	3	74.24	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.624	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d4f5ae67-7372-4b74-b9b4-09f5494b59fe
27334b99-f301-430b-9985-5bdd2da89047	97440ecf-a58a-4bbd-8517-95a11e62b523	SATIS	3	82.25	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.628	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c3917f10-8ca3-4839-9b40-50da75afb009
b5da96ad-8de4-4fd3-87ec-2b65680176c0	3b7f878f-6183-4beb-a3fc-09da7e672bc7	SATIS	3	82.25	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.632	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	491fe94e-bafa-43c9-9920-bc9e2dd79858
883d6672-d501-463d-9052-1a8ece58525d	9c2be3d1-032e-467e-9891-570608092d01	SATIS	3	78.90	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.635	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e53ac559-ecfb-48e0-974a-16b1bf89ab91
51ed87af-2d89-4777-90ef-d93e191934b7	bb3ce01c-2764-47cf-8309-a69549833324	SATIS	1	750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.637	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c8bd5095-723c-44e7-952d-efc902fc465c
b876e7eb-7df1-42bb-a421-3907c6d21870	12f306ed-4fa8-4976-840b-8695956a54c6	SATIS	1	1100.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.641	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c1a1a5ef-f4c7-463c-aee9-81974a6c6ca4
651437cc-bd37-4d83-83c6-cdf3974a84da	d9260889-4f94-4e97-8273-3e158999a1c8	SATIS	1	99.12	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.645	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8d2da00a-2836-4c21-9431-6e379bd6a800
73d18213-aaa2-47be-9f3d-d9f308a5d820	b397902b-886f-4dc4-b51f-98f786381773	SATIS	1	195.68	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.648	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ba18513d-1e0c-4778-84ae-fe639791ea3b
57790a3a-6a44-4624-ace3-cfb31c788198	b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	SATIS	1	165.90	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.657	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	c229657d-45f2-41b2-9f34-1da94d179b6a
c274caf4-2e6d-4dad-a896-e327f105c770	29d6bea3-86c2-480b-a77f-32743f0313fd	SATIS	1	4150.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.671	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	10f91db0-2cfe-4960-81de-57ff7a540f9e
f0bc80b0-a6cd-43e0-8032-bec97ef32514	48ca0edf-32c8-45a1-b60a-2959c06e3dc8	SATIS	1	1700.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.678	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b3ddb905-a8ac-4e6c-ac01-bdc6af773a5e
0584cb7a-45d6-477b-8eec-e380b33c6e94	5f5d6c8a-1f76-4291-9c59-6314c4e1ed52	SATIS	1	330.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.686	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a84406b1-d801-4ea5-a4c3-5725f579b1e6
076a661f-6f4c-4cd6-ae9b-62c568297df1	a0e84829-720d-4aa5-b23e-e4c1c19a6fec	SATIS	1	550.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.697	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	14ebbef2-a794-4ac1-b767-775400d4235c
e128d4a8-4019-4484-9c5d-920d8129a1f7	17e52e1b-1762-46e4-ada6-4594ab04b5a6	SATIS	1	750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.702	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	324bec91-ee8b-4742-aa36-a02f1980b035
3ce72eaa-6b10-44ed-9994-7790ef2e6b35	60fe51dd-3077-43b3-b46a-50dad2fe164d	SATIS	1	1600.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.711	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6feb8dd1-0ca9-4a9f-bd4d-b029375c4ef9
d116ebd6-8a02-4641-a4ea-5749b2ef55c3	43383f55-e917-4b41-9e96-7544bcb1d2b5	SATIS	1	360.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.718	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b74f166f-121a-4671-ab2c-34425ebdebc9
4e0a63d7-858c-4ebb-b6b0-aed06d25cc8b	4a4ed874-2216-4bc9-a300-17f0d0082d97	SATIS	4	575.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.727	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6f1fa43b-4ef4-4b0e-bd52-adef627b4718
2b5c405f-5a88-43b2-a900-348a180e7b52	d9d4845c-dfeb-43b9-9573-4443ddae6f05	SATIS	2	200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.732	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ffd0e745-2039-42c2-b6a5-04ab11df5775
60260893-66f0-4276-bd82-0389f08a0546	2e609756-f2dd-4834-830c-958fab782301	SATIS	2	900.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.736	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	022685d3-fc1c-4868-a5d0-deca3949f18f
3c8086b7-58c3-4bf8-ae07-f7e895f40ac0	43383f55-e917-4b41-9e96-7544bcb1d2b5	SATIS	1	360.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.741	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	4cc57f4a-4d8c-49a1-9ce4-ae0688c5c389
22c1bdbe-5ba0-4861-b5bf-eac134d29e3a	841e7ff9-ca92-47c5-b53f-de26b6fa549b	SATIS	1	3750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.746	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d02af50c-4cfe-4834-b0a5-28328b99674e
f6518dfc-5157-466b-95a1-c4005cc82a3a	0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071	SATIS	1	5500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.75	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3081c50a-cacc-49fa-ae97-831830543489
a5d17246-c5f2-48ab-bce0-e50b35219452	4d29ba15-d80a-42d7-9a01-fd21d68a64f5	SATIS	1	200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.755	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	66713a47-5532-42df-9be6-1de88fc2062f
4c75bd88-baf3-4802-bcff-94ae29c51d65	3f9269ca-37d1-465e-aedf-642cf50c8d84	SATIS	1	185.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.759	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7d87d591-1693-4839-a3a9-7637968b259e
14972a34-57bd-40c6-8edf-bb07057176d8	21a31166-c617-4d2d-9980-dc07951bd242	SATIS	2	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.766	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8c77d352-8bd4-4304-8b36-5421ca9f9d6c
eff775bc-159c-4935-95d8-4f5ab19342ae	83983ed2-a2a5-4026-884b-ddba7ce30748	SATIS	2	700.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.771	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	929ab530-0688-4dbd-a90e-23be27b4c40c
9989ced0-4269-429e-87a2-e5612a03ea27	cf26b850-04a7-4f79-800b-bbd290a5e5f2	SATIS	2	200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.777	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	745a078f-1ee8-47cd-aa06-13302f4afedf
cb28500c-ae41-4b3b-907f-ddf11cdb7ad4	ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3	SATIS	1	1750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.781	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	9bcd8591-b4cd-432c-8d4e-e350b4457bfd
a70a4863-4188-408f-b9e5-3d64ce65139a	a492f201-88ee-4e8e-ae49-52e1a50dbab8	SATIS	1	1400.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.785	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	19a71b6d-d672-47aa-8b00-4876635fc805
cccfcb2e-4d67-465b-957c-5f399a80d8ad	cc55cb87-07fe-4476-b97c-cbd1f3fb9112	SATIS	1	565.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.79	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5e287673-1873-474b-96ff-63d33872ded7
f290e56c-8f30-40d9-9589-032d55308f8c	d20bccc8-8f63-47b1-bf83-65d9a78ab3d0	SATIS	1	600.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.794	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	b6625f36-2ef0-455e-b622-6b5b77709583
1b7b24be-4987-4bd7-a9bc-39822bb3b2e4	d922900b-9ef7-418c-b8c4-cb1108141338	SATIS	1	950.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.798	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6eec5628-e203-4d97-b990-f77207c5c461
eb828735-a0c8-449a-88e6-1122f2b58269	6b77e199-dd06-4f0f-95fc-819df8dc0bcd	SATIS	1	650.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.803	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6e52a2f5-c3c6-45ab-a3da-943110df30bd
d206a00d-993a-4747-8162-2355a7f360e1	5a5119ab-cfdf-4038-b627-d384e352e12b	SATIS	1	1050.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.809	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	bbfe64d3-4f46-4451-a9b3-8cc77dde063b
bd338e73-7107-43bd-bdfa-291414430efd	ebd53187-7551-4768-b016-7ab00badd88c	SATIS	30	68.89	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.814	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	896005df-e52d-486d-ab00-26b1dec9d0b3
d019b55c-026d-47b8-b091-7d82d2c38017	8ca367cf-098c-4aee-9070-6dbf05a3f120	SATIS	30	68.89	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.818	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f5cb364f-fb00-4f22-9695-a3b784fffc09
ca2ae27e-d093-4725-819a-b1ddaf3d09e0	1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb	SATIS	1	720.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.826	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	2410b822-564f-4e10-9237-ce31003bae62
9fe566ab-53ed-4ebc-b913-2dbd8a0e6c5c	4ca32989-637b-413e-8464-c70eeacf2798	SATIS	1	4150.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.831	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	f6abb8af-7f5e-41e6-88d7-615def536c39
ac1beccb-39e8-4611-bc91-5ebe6b5de8e6	f27495f5-9e20-4b1d-b41d-acd1964600fd	SATIS	1	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.835	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	e3d05099-3017-46c1-8513-0e8c08e693e9
c3a7b766-d084-4508-9b07-6ad180f23b49	4a0c6df2-9b97-47aa-8647-d69ac9e5b68b	SATIS	1	1100.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.839	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	8e01447f-837f-4165-a5c0-dd2ea2c8e61c
5a6a75d7-26d6-4fb3-bd62-8acad72d860f	15353c7e-4dee-4dc2-ab8b-da505d6ff997	SATIS	1	1650.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.844	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	721236b0-400f-4d1a-ac71-fb1760e1e23c
6ef319e2-5a95-48ed-aafd-ddcacac123b0	b1eda65e-05cc-4520-a341-0bccf035b64b	SATIS	1	1650.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.849	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	13bf15de-d02e-481e-9608-c0405b52aed8
848fba2b-7643-4fa5-8d89-00d0e1d33497	58ea2ec6-5fa8-4a5a-81c8-de7155845cb1	SATIS	2	750.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.852	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6461bdeb-b6ed-4d40-b153-24933c12da62
99f080ec-6b49-4a78-ad0a-b5c365219e4c	7cc41938-a92a-4b3f-b768-b7c7a49fc4bf	SATIS	1	350.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.855	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0727951e-3d84-4292-8f78-e98b3ef25cab
a52a74c5-056c-41c8-ab63-7d6a134df69e	a1a2a2ae-1141-468c-bc6d-edb60da5c581	SATIS	1	4000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.859	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	ae669fe0-9c14-4347-b9ce-e08e0a61fb2d
debead44-5266-40ce-acdc-138eede7874f	8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	SATIS	1	3000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.861	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	23b350ee-b192-4a1f-98ee-dfbb6a5f0e0b
58c6887f-71c8-4c8e-b0b7-1d0bac4586fb	21a24ace-f795-40fb-91cc-2e4bca2a6d6a	SATIS	3	580.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.865	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	22b1a2f7-9341-40c8-a41f-8ab5702d3f03
4a37d9ad-7efa-4897-b4f1-1661dfe09e2c	070c78a4-26c5-4338-bece-4877b60c2a26	SATIS	2	400.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.868	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6b57b6d8-6ac0-41bb-a1be-aebeee1b9a56
35e71708-4014-4484-8b5c-f6fac0bcf588	9295b32c-9a71-46eb-8c8d-c15ac375f692	SATIS	1	800.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.872	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5ddf3376-2bdc-4648-810c-7f80bca52d75
6d4872a5-2a9f-4a9f-9c55-355e56674fc1	db7262e7-7f97-4766-886e-9a78bf39705c	SATIS	1	20500.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.876	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	02acf0ba-e6f9-4876-afc6-230381b39635
25dd7e73-a7ff-4399-9f24-59c820510626	30371764-9531-4d61-9636-4cdc385d9a6f	SATIS	1	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.881	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	25f80bcc-74f3-4221-a278-eb898f57bc4b
a252dd2f-aa2b-4adf-85a2-27449cd4fc32	88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	SATIS	1	850.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.884	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	7061146a-616e-43c6-a4d2-e85236a117d2
81460733-3540-47c3-a387-d44dfbf0ce72	747041af-5928-4134-b6dd-68c2c6081b29	SATIS	1	450.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.888	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	248a4e31-04fb-4dc1-9fb1-ccc3626c95f3
5192d290-627a-465e-908c-5c04aaead24d	113d0d8d-5198-4415-b81c-5c812ed4e435	SATIS	4	200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.893	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	95c9e916-2824-4786-8d34-eea8697d2340
812fc1b9-8c9f-4a34-8f4c-100c4ab2dba6	1d0a5188-ba70-4451-b294-96c61b46d3ab	SATIS	5	15.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.897	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	a57c1f0d-6566-42bd-b631-b258e9ae9536
bb88f665-0708-450b-8cde-25031e49a3d4	9313625f-754f-4bab-8e48-68dac414e3bc	SATIS	1	5600.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.9	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	67a67fed-c3f5-4257-9e05-abe0ac0274eb
27643bbd-ee58-498a-91f2-4addda4f6088	a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	SATIS	1	1200.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.904	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	aa83227a-dd16-4260-ac7e-48708798b7a6
e22b045d-4672-436d-b5cb-12cbc1256d5a	14a09ecf-2c5d-4579-a891-371719a24a36	SATIS	1	2180.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.908	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	5d2d0275-15c4-4511-b43d-0db484f85e5a
a84509ee-48db-4c94-9170-72ad7a71700d	fd453aeb-ee50-4ba6-8839-a9c96d45e33d	SATIS	1	800.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.911	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0a0a63e8-5370-41bc-a321-2b15016c16a5
3481d495-d417-42bf-8c4b-14d1130a4abb	b4237b54-7d54-4e1e-8fbf-efe2edf9171d	SATIS	1	2850.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.914	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	69c4e2e1-71c3-4c10-8b8c-9f5487470556
ac3231e2-aaaf-4908-b46d-370a453226ec	ca8c911b-e1c8-4a20-8212-5f8fc929b72a	SATIS	1	715.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.917	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	6199754f-0a44-4cbb-a116-5b14e6526d87
43e93f93-f1e8-4ffb-ab65-1065c9bffdbe	4f879a28-5567-48cf-9885-e8be3ef8c025	SATIS	1	2650.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.92	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d2b49080-af30-4842-8087-f6a348355d8b
76902ad3-9823-4457-a037-83ffbecfae8d	492e3d84-3803-4117-8382-3defc2b33e8c	SATIS	1	300.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.922	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	3b6d1249-5092-43d9-971a-6115e8981754
615c8bd5-b439-402f-a56b-c08ae7557ea7	c190aad6-0676-492d-934a-28d3ff6e2bd2	SATIS	1	16000.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.925	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	d2e8a9d0-ef62-4044-9eb7-df5aec4fb8cc
de4ad135-386e-4ead-9dab-0b82289dd0ba	694bbe25-2ec0-4e4c-887f-c32b37f0beeb	SATIS	2	175.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.928	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	0f7b5ee7-186a-4527-9168-8521a3bc68d8
8e381c4d-8b39-4b18-a5f6-459a547718d1	46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	SATIS	1	950.00	Satış Faturası: SF-2026-001	2026-02-27 10:12:28.931	eb067e72-b52b-45fd-94d6-510cd5df7eba	clxyedekparca00001	50889bc1-7fcc-4da1-a904-2bd83c62769c
\.


--
-- Data for Name: stoklar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stoklar (id, "stokKodu", "tenantId", "stokAdi", aciklama, birim, "alisFiyati", "satisFiyati", "kdvOrani", "kritikStokMiktari", kategori, "anaKategori", "altKategori", marka, model, oem, olcu, raf, barkod, "tedarikciKodu", "esdegerGrupId", "aracMarka", "aracModel", "aracMotorHacmi", "aracYakitTipi", "createdAt", "updatedAt", "sadeceKategoriTanimi", "sadeceMarkaTanimi") FROM stdin;
0ac4e8a7-83da-4628-bfbc-cef76d002e93	MRK-IMP-000001	clxyedekparca00001	[Marka Tanımı] ABA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ABA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
ca076ffc-4eb5-4abc-813e-6a1e644157ff	MRK-IMP-000002	clxyedekparca00001	[Marka Tanımı] AKD	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	AKD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
067703cf-02c1-4bf2-90a4-25804134d5be	MRK-IMP-000003	clxyedekparca00001	[Marka Tanımı] AYD	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	AYD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d1027d02-da05-4fd6-805f-45159a6f88b8	MRK-IMP-000004	clxyedekparca00001	[Marka Tanımı] AYSAN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	AYSAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
7ed6d62d-3334-40e3-859b-776d61299992	MRK-IMP-000005	clxyedekparca00001	[Marka Tanımı] BANDO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
37bfff00-fdb2-4775-940f-2a4071e02be6	MRK-IMP-000006	clxyedekparca00001	[Marka Tanımı] BENZOİL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BENZOİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
009f467f-42ab-40d1-a380-a9ab4c4a7a80	MRK-IMP-000007	clxyedekparca00001	[Marka Tanımı] BETTO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BETTO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
759aee01-5fac-4ed8-a00b-b22cc4e8a81f	MRK-IMP-000008	clxyedekparca00001	[Marka Tanımı] BİTAPART	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d03e5342-be1f-449b-8c9e-e393da9bc941	MRK-IMP-000009	clxyedekparca00001	[Marka Tanımı] BLUEPRİNT	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BLUEPRİNT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
2c278081-c372-4ce0-bc93-673d69db8dc1	MRK-IMP-000010	clxyedekparca00001	[Marka Tanımı] BMS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BMS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
3940916d-d572-419f-b3d6-d1635ba21f12	MRK-IMP-000011	clxyedekparca00001	[Marka Tanımı] BOSCH	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BOSCH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
6dcb13be-ce21-4f93-a007-c1a1059128fb	MRK-IMP-000012	clxyedekparca00001	[Marka Tanımı] BRAXİS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BRAXİS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c0442cbe-be99-4877-b315-290a280883f8	MRK-IMP-000013	clxyedekparca00001	[Marka Tanımı] BRN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BRN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d2832484-1d67-481b-92c4-70f89afda99c	MRK-IMP-000014	clxyedekparca00001	[Marka Tanımı] BRUCKE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	BRUCKE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
928b1aa5-62cd-40aa-862a-74f47e8dbf4b	MRK-IMP-000015	clxyedekparca00001	[Marka Tanımı] CAPS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	CAPS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
5e1f01fe-3128-4ff1-b353-4c8ffacbbc50	MRK-IMP-000016	clxyedekparca00001	[Marka Tanımı] CARE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	CARE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
705d282a-1ac9-4285-93b2-60a851fdeb37	MRK-IMP-000017	clxyedekparca00001	[Marka Tanımı] CASTLE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
ad59bb45-d848-4511-9a9e-f69cf0cc113c	MRK-IMP-000018	clxyedekparca00001	[Marka Tanımı] CHAMPION	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	CHAMPION	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
79e61b34-7add-4619-a9c6-0a7f1edec85a	MRK-IMP-000019	clxyedekparca00001	[Marka Tanımı] CORTECO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	CORTECO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
0993a56d-ae37-478a-b176-bb5cb08da177	MRK-IMP-000020	clxyedekparca00001	[Marka Tanımı] DARK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	DARK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
9deb76c6-733d-40e9-9046-2ee026a6d84c	MRK-IMP-000021	clxyedekparca00001	[Marka Tanımı] DAYCO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	DAYCO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
657d75cb-34f2-4ada-a40b-940bd731fddc	MRK-IMP-000022	clxyedekparca00001	[Marka Tanımı] DENSO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	DENSO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
0836c976-7d22-4f14-ac8b-8d2037c0d3ae	MRK-IMP-000023	clxyedekparca00001	[Marka Tanımı] DOLZ	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	DOLZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
a38db5f0-bfc2-4736-a4dc-84c6614d5fab	MRK-IMP-000024	clxyedekparca00001	[Marka Tanımı] ELF	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
47c4c0c6-0ece-44c1-b5e8-71d5a46d8b53	MRK-IMP-000025	clxyedekparca00001	[Marka Tanımı] ERAYNA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ERAYNA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
0cb20604-7163-496b-9362-d672c7a0385c	MRK-IMP-000026	clxyedekparca00001	[Marka Tanımı] EUROBREAK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	EUROBREAK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
1b89c063-0e2c-46b5-878d-634f2674d2a5	MRK-IMP-000027	clxyedekparca00001	[Marka Tanımı] EUROREPAR	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	EUROREPAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
63b95c6e-1d36-403a-9e8c-5b30be2f7f6d	MRK-IMP-000028	clxyedekparca00001	[Marka Tanımı] FHS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	FHS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c892608a-74c6-40c9-8ab5-bee9971fab56	MRK-IMP-000029	clxyedekparca00001	[Marka Tanımı] FİLTRON	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	FİLTRON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
abbe7a85-905a-4a7d-a95b-08707e4421d4	MRK-IMP-000030	clxyedekparca00001	[Marka Tanımı] FKK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	FKK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
30616e58-ef1a-47a3-b7ed-29d07f311ecb	MRK-IMP-000031	clxyedekparca00001	[Marka Tanımı] FORMPART	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	FORMPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
1a193d5a-bd28-400b-bcfd-39add36f5882	MRK-IMP-000032	clxyedekparca00001	[Marka Tanımı] FROW	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	FROW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d7b61b00-9287-478c-b231-08c5ae606e95	MRK-IMP-000033	clxyedekparca00001	[Marka Tanımı] GATES	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GATES	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
575fd242-7003-40bc-a94e-7d28a52258a7	MRK-IMP-000034	clxyedekparca00001	[Marka Tanımı] GENERAL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GENERAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
7dd2a466-7a5b-456c-ab40-7f7e68d1ffed	MRK-IMP-000035	clxyedekparca00001	[Marka Tanımı] GM	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
f75efa21-0e18-41c9-a2ad-743ca8f2598e	MRK-IMP-000036	clxyedekparca00001	[Marka Tanımı] GRAP	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GRAP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
b914fa45-5eec-4f1a-8140-856168974ee1	MRK-IMP-000037	clxyedekparca00001	[Marka Tanımı] GSP	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GSP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
e271584a-e044-407a-b650-5857f0e7e011	MRK-IMP-000038	clxyedekparca00001	[Marka Tanımı] GUATURBO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	GUATURBO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c7c8b422-1803-41a6-93ac-6b52e8924482	MRK-IMP-000039	clxyedekparca00001	[Marka Tanımı] HELLA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	HELLA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
30e7139b-f6d5-408a-8142-7204ff489d3d	MRK-IMP-000040	clxyedekparca00001	[Marka Tanımı] HELLUX	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	HELLUX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
7423665c-f2f6-47ba-b821-fa1d421d3ee5	MRK-IMP-000041	clxyedekparca00001	[Marka Tanımı] HERTH	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	HERTH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
27383ffe-34ea-498d-bc19-564ccd2e4c85	MRK-IMP-000042	clxyedekparca00001	[Marka Tanımı] HİLEKS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	HİLEKS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
5817b21f-6f3f-43ff-8d75-72f3cac2c3b2	MRK-IMP-000043	clxyedekparca00001	[Marka Tanımı] INA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	INA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c564a85b-87e0-4981-97f2-8e49360fa808	MRK-IMP-000044	clxyedekparca00001	[Marka Tanımı] KALE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KALE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
f80926eb-49d4-4bbc-b572-04db0142c5ed	MRK-IMP-000045	clxyedekparca00001	[Marka Tanımı] KALE BALATA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KALE BALATA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
dce4473a-c0b0-4568-a7fb-f7de3f129e00	MRK-IMP-000046	clxyedekparca00001	[Marka Tanımı] KAYA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KAYA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
7a720ffc-b58e-4623-a9ba-c94fc5f08f51	MRK-IMP-000047	clxyedekparca00001	[Marka Tanımı] KAYAPLASTİK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KAYAPLASTİK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
fdefc2b0-ae5d-44e7-b46f-862f3b244f4a	MRK-IMP-000048	clxyedekparca00001	[Marka Tanımı] KITATECH	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KITATECH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
09e4d53a-92df-43ca-885a-76af0888a57d	MRK-IMP-000049	clxyedekparca00001	[Marka Tanımı] KRAFTVOLL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
ba3a133b-37b5-4cf3-82b7-12f3b8fd174c	MRK-IMP-000050	clxyedekparca00001	[Marka Tanımı] KRAW	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	KRAW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
714d5338-a01a-43af-b519-88676f2d8603	MRK-IMP-000051	clxyedekparca00001	[Marka Tanımı] LPR	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	LPR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
8dfa1590-c701-4335-91ce-e6cdd01d4bfe	MRK-IMP-000052	clxyedekparca00001	[Marka Tanımı] LUK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	LUK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
e7b65193-64d6-4319-89a4-e027027fd984	MRK-IMP-000053	clxyedekparca00001	[Marka Tanımı] LUKOİL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	LUKOİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
bb125b2d-5fa2-47cd-841a-fbf4b7933f5e	MRK-IMP-000054	clxyedekparca00001	[Marka Tanımı] LUVİ	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	LUVİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
8fa68e96-3d2d-4a52-a0db-e6e502fb7333	MRK-IMP-000055	clxyedekparca00001	[Marka Tanımı] MAHLE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MAHLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d3c5740e-f452-4bab-a9c7-fa06231ec8fe	MRK-IMP-000056	clxyedekparca00001	[Marka Tanımı] MANN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MANN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
69879c78-2b78-40fe-b3ee-0c41dc190f2a	MRK-IMP-000057	clxyedekparca00001	[Marka Tanımı] MARS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MARS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
38ced276-a9a4-45e8-9923-b1b843631606	MRK-IMP-000058	clxyedekparca00001	[Marka Tanımı] MARTIGUES	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
3398e7ed-9e8c-4182-9346-720d352c31d3	MRK-IMP-000059	clxyedekparca00001	[Marka Tanımı] MAXTEL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MAXTEL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
4bab0e01-5b2f-4f72-814e-19d20e9a033e	MRK-IMP-000060	clxyedekparca00001	[Marka Tanımı] METRIX	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	METRIX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
9874838a-9c7d-4a03-b9d6-9ddcbbdd9552	MRK-IMP-000061	clxyedekparca00001	[Marka Tanımı] MOBİL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
301d4645-9ec1-4a0a-8591-202ffbf850dc	MRK-IMP-000062	clxyedekparca00001	[Marka Tanımı] MOTUL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MOTUL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
aee41c5f-d4bc-4f02-a778-d9e05121ea36	MRK-IMP-000063	clxyedekparca00001	[Marka Tanımı] MTJ	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	MTJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
4c27c3e9-edce-41de-b17a-8c7224a320be	MRK-IMP-000064	clxyedekparca00001	[Marka Tanımı] NE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	NE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
627f509c-d688-40d2-ba9f-3e3f1fae7e1d	MRK-IMP-000065	clxyedekparca00001	[Marka Tanımı] NEOLUX	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	NEOLUX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
f3496cca-766f-4fb3-ac5f-f7d4cf927daf	MRK-IMP-000066	clxyedekparca00001	[Marka Tanımı] NGK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	NGK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
3eb21722-ceeb-4eb6-8006-b130027b70e4	MRK-IMP-000067	clxyedekparca00001	[Marka Tanımı] NRF	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	NRF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
680420a7-9414-44e3-bdfe-df400a0ca18b	MRK-IMP-000068	clxyedekparca00001	[Marka Tanımı] OCAL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	OCAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d5aed5f1-aa76-4992-85aa-78b7fdacfc0b	MRK-IMP-000069	clxyedekparca00001	[Marka Tanımı] OPAR	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	OPAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
e786895f-020b-46eb-a26f-26cd22f1de69	MRK-IMP-000070	clxyedekparca00001	[Marka Tanımı] OTO CONTA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	OTO CONTA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
78634d9d-d78d-4fe4-bcf7-c096ca450836	MRK-IMP-000071	clxyedekparca00001	[Marka Tanımı] PHOTON	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	PHOTON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c09f230e-8c62-4fb5-b1a0-d5896d230773	MRK-IMP-000072	clxyedekparca00001	[Marka Tanımı] PİERBURG	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	PİERBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
d094413b-1926-47f5-a7e8-0f630130de6e	MRK-IMP-000073	clxyedekparca00001	[Marka Tanımı] PSA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
036be7fa-1635-4ea5-bc3a-fef2dba07cdc	MRK-IMP-000074	clxyedekparca00001	[Marka Tanımı] PURFLUX	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	PURFLUX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
64304876-1414-4071-9fff-dd15f2020b7a	MRK-IMP-000075	clxyedekparca00001	[Marka Tanımı] RAPRO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	RAPRO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
10052a58-ea05-4dfc-b6b7-d8679a4384c2	MRK-IMP-000076	clxyedekparca00001	[Marka Tanımı] RECOVER	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
23cee731-ab40-4eac-a4b8-b4e33e92c0bc	MRK-IMP-000077	clxyedekparca00001	[Marka Tanımı] RIW	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	RIW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
21285030-d029-4057-b878-1b959732cf0a	MRK-IMP-000078	clxyedekparca00001	[Marka Tanımı] ROADHOUSE	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ROADHOUSE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
01929ee6-44ea-47e9-b2d7-432015a28cad	MRK-IMP-000079	clxyedekparca00001	[Marka Tanımı] ROADMAX	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ROADMAX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
ee60a89d-27e3-4540-a974-340536313fbf	MRK-IMP-000080	clxyedekparca00001	[Marka Tanımı] ROCKSWELL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ROCKSWELL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
63c863a3-014e-4131-b9fc-6a8793802678	MRK-IMP-000081	clxyedekparca00001	[Marka Tanımı] ROOT	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ROOT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
b556ba96-82c2-4818-a7b8-9897389aa308	MRK-IMP-000082	clxyedekparca00001	[Marka Tanımı] ROYAL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ROYAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
6680116f-adca-4a53-8a64-45b07fee723d	MRK-IMP-000083	clxyedekparca00001	[Marka Tanımı] SACHS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SACHS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
1fb555f8-5317-47fd-a8a9-9ef6d26f8ea9	MRK-IMP-000084	clxyedekparca00001	[Marka Tanımı] SAGEMFRANS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SAGEMFRANS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
23812c02-ee48-435c-bf27-627ac32a4e44	MRK-IMP-000085	clxyedekparca00001	[Marka Tanımı] ŞAHİN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ŞAHİN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
09279c04-8905-4cce-900f-dfadda90e868	MRK-IMP-000086	clxyedekparca00001	[Marka Tanımı] SARDES	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SARDES	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
1d724fde-642b-4d68-b473-a65c10913ceb	MRK-IMP-000087	clxyedekparca00001	[Marka Tanımı] SHELL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SHELL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
e5c466c3-043a-4dc9-a570-842644d8dc90	MRK-IMP-000088	clxyedekparca00001	[Marka Tanımı] SİON	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SİON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
8ced00c4-f02b-4f08-b4fc-ecdf0bb1e4b9	MRK-IMP-000089	clxyedekparca00001	[Marka Tanımı] SKF	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SKF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
c6d4ddfb-c6c0-47df-af82-ad92b16d000c	MRK-IMP-000090	clxyedekparca00001	[Marka Tanımı] SNR	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SNR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
a4dd956c-d3b2-4e86-9b5c-52430064ecd8	MRK-IMP-000091	clxyedekparca00001	[Marka Tanımı] SPK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SPK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
714fb3f3-1ddb-4fac-8bea-b306ac440c9b	MRK-IMP-000092	clxyedekparca00001	[Marka Tanımı] STN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
275bdc88-6aea-48dd-8c46-642ca834d30c	MRK-IMP-000093	clxyedekparca00001	[Marka Tanımı] SUPSAN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SUPSAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
28053163-1205-4635-bac7-e7567c80bcf6	MRK-IMP-000094	clxyedekparca00001	[Marka Tanımı] SWAG	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	SWAG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
f74262cd-4e30-4ee1-b499-615eb58cf733	MRK-IMP-000095	clxyedekparca00001	[Marka Tanımı] TAİWAN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TAİWAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
0bfb85f7-191e-4f02-8583-0886f1de32d0	MRK-IMP-000096	clxyedekparca00001	[Marka Tanımı] TEKNOROT	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
1a4ef514-a430-4b03-aff4-bb88cd317a67	MRK-IMP-000097	clxyedekparca00001	[Marka Tanımı] TEXACO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TEXACO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
62bad8ce-f2e4-45ff-8e91-1bf440501ceb	MRK-IMP-000098	clxyedekparca00001	[Marka Tanımı] TOPRAN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TOPRAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
efcd5cd2-50cf-477b-974e-b3748414658b	MRK-IMP-000099	clxyedekparca00001	[Marka Tanımı] TOTAL	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TOTAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
926eb6f6-f01c-4cb4-b70a-bd50d3a2c35c	MRK-IMP-000100	clxyedekparca00001	[Marka Tanımı] TRW	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	TRW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
78d85e03-5b6c-41e7-b56d-80ad81874de9	MRK-IMP-000101	clxyedekparca00001	[Marka Tanımı] UCPA	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	UCPA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
f4448dbf-620f-4844-be61-9508607ceeac	MRK-IMP-000102	clxyedekparca00001	[Marka Tanımı] UFİ	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	UFİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
fa409cfa-86f4-40b7-ab71-ee1fab75d7c9	MRK-IMP-000103	clxyedekparca00001	[Marka Tanımı] ÜSTÜN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ÜSTÜN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
eca852bd-e009-4c37-a67d-b7d10bfd24a1	MRK-IMP-000104	clxyedekparca00001	[Marka Tanımı] VALEO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	VALEO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
fe72eb1c-5629-4538-a32c-861e1f4019d6	MRK-IMP-000105	clxyedekparca00001	[Marka Tanımı] VERNET	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	VERNET	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
3516fea2-e331-44c2-b998-779cae03afcb	MRK-IMP-000106	clxyedekparca00001	[Marka Tanımı] VİCTOR REİNZ	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	VİCTOR REİNZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
af5d5508-6b1b-486b-9a63-0bcfb8280302	MRK-IMP-000107	clxyedekparca00001	[Marka Tanımı] WAGENBURG	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	WAGENBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
5076da89-d308-406d-8afe-02081d83accd	MRK-IMP-000108	clxyedekparca00001	[Marka Tanımı] WALBURG	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	WALBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
60e41dfd-94a5-4c29-9062-f4aef5f2f665	MRK-IMP-000109	clxyedekparca00001	[Marka Tanımı] WİSCO	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	WİSCO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
610c5908-6072-4ba4-9703-071c506ac340	MRK-IMP-000110	clxyedekparca00001	[Marka Tanımı] WOSS	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	WOSS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
13060f3d-535a-446c-9443-76ed204610c4	MRK-IMP-000111	clxyedekparca00001	[Marka Tanımı] WÜRTH	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	WÜRTH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
51ef6e62-6bb4-43bc-96e0-1df24ed142ae	MRK-IMP-000112	clxyedekparca00001	[Marka Tanımı] YENMAK	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	YENMAK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
6f59d07d-635c-4e9e-b07a-e846e942840b	MRK-IMP-000113	clxyedekparca00001	[Marka Tanımı] YTT	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	YTT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
9e27f974-b32a-4e43-81d1-f1bac1534036	MRK-IMP-000114	clxyedekparca00001	[Marka Tanımı] ZEGEN	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ZEGEN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
2d0edbb6-0584-48c9-8484-345960cfc78e	MRK-IMP-000115	clxyedekparca00001	[Marka Tanımı] ZENON	Import: marka tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	\N	\N	ZENON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:06:34.089	2026-02-22 20:06:34.089	f	t
250b3c97-ef59-49ef-b0d8-96cc99876786	KAT-IMP-000001	clxyedekparca00001	[Ana Kategori Tanımı] ALT TAKIM	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
8355b104-f29a-4d6a-88fb-956c1dc52878	KAT-IMP-000002	clxyedekparca00001	[Ana Kategori Tanımı] ELEKTRİK GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	ELEKTRİK GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
e0adf1db-25ee-4b93-8c3b-ef0dfa4e8a21	KAT-IMP-000003	clxyedekparca00001	[Kategori Tanımı] FİLTRE - HAVA FİLTRESİ	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FİLTRE	HAVA FİLTRESİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
7776ae61-a033-40e0-8ad4-7fa95010e6ab	KAT-IMP-000004	clxyedekparca00001	[Kategori Tanımı] FİLTRE - POLEN FİLTRESİ	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FİLTRE	POLEN FİLTRESİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
70a78b12-cb35-42f5-9430-3819c0edb903	KAT-IMP-000005	clxyedekparca00001	[Kategori Tanımı] FİLTRE - YAĞ FİLTRESİ	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FİLTRE	YAĞ FİLTRESİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
82f0efd5-9b17-471b-8744-47b87af27a16	KAT-IMP-000006	clxyedekparca00001	[Kategori Tanımı] FİLTRE - YAKIT FİLTRESİ	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FİLTRE	YAKIT FİLTRESİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
5587bf9b-8b0f-4ddc-9d09-eb0433fe5c4c	KAT-IMP-000007	clxyedekparca00001	[Ana Kategori Tanımı] FİLTRE	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FİLTRE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
4de39149-c94b-4a1d-8426-8c0465fb47ba	KAT-IMP-000008	clxyedekparca00001	[Ana Kategori Tanımı] FREN GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
f222303a-4307-4b9b-8db6-5e9d4d367c4c	KAT-IMP-000009	clxyedekparca00001	[Ana Kategori Tanımı] KAYIŞ GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	KAYIŞ GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
0ec9ecbb-52e7-4dc3-aa7a-ed3c7e43a2bf	KAT-IMP-000010	clxyedekparca00001	[Ana Kategori Tanımı] MOTOR GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	MOTOR GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
e824f37e-f612-437e-8fb6-8a04abc16e51	KAT-IMP-000011	clxyedekparca00001	[Ana Kategori Tanımı] ŞANZIMAN GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	ŞANZIMAN GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
74aba7ab-fbef-4c4a-9e35-eaf11307f4b6	KAT-IMP-000012	clxyedekparca00001	[Ana Kategori Tanımı] SİLECEK GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	SİLECEK GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
be44f94d-37b4-425e-a3bf-410ad00bff21	KAT-IMP-000013	clxyedekparca00001	[Ana Kategori Tanımı] SIVI GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	SIVI GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
8ce41ca3-b950-46e2-980e-03ae924a7ac9	KAT-IMP-000014	clxyedekparca00001	[Ana Kategori Tanımı] YAĞ GRUBU	Import: kategori tanımı. Gerçek stok kaydı değildir.	Adet	0.00	0.00	20	0	\N	YAĞ GRUBU	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-22 20:08:58.163	2026-02-22 20:08:58.163	t	f
f9422f30-de03-42d3-92de-02b2c4f6335a	TKN-CI-555K	clxyedekparca00001	ROTIL KITI ALT CITROEN C3 (FC) 1.4 HDI 2002-2009	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3640.56	\N	B1-04-33	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.328	2026-02-19 11:28:59.445	f	f
1dd72164-e19d-420d-b8ce-d2199715f550	4PK860	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:06:59.955	2026-01-21 10:06:59.955	f	f
c5b27835-d336-463d-bf80-790aa4e4d28f	TKN-F-810	clxyedekparca00001	Z-ROT ON FIAT FIAT DUCATO 2006- / CITROEN JUMPER 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1357572080	\N	B1-02-03	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.213	2026-02-13 06:55:27.159	f	f
5bd04c4c-ecd5-4173-880f-0a085f5af79b	TKN-F-206	clxyedekparca00001	ROT BASI ON FIAT 131 1974-2001	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5962772	\N	B1-02-06	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.522	2026-02-13 06:57:54.952	f	f
b9b03747-7395-4d01-bde2-d1cd3f317433	TKN-F-204	clxyedekparca00001	ROTIL ON FIAT 131 1974-2001	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	4331439	\N	B1-02-07	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.49	2026-02-13 06:58:30.709	f	f
a3e3cd4e-2bdd-4cef-bdcd-5c9c8addecaf	TKN-F-406	clxyedekparca00001	ROT MILI ON HIDROLIK DIREKSIYON IC FIAT BRAVO - BR	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	9941625	\N	B1-02-09	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.508	2026-02-13 07:00:38.311	f	f
277aff93-eb25-406b-9844-3da213e2a754	TKN-F-650T	clxyedekparca00001	Z-ROT ON FIAT BRAVO II 2007-2014 / FIAT STILO 2001	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	50700464	\N	B1-02-11	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.513	2026-02-13 07:06:32.638	f	f
b018ee41-7b4d-4f74-a04a-02ae291c9e9f	TKN-F-653	clxyedekparca00001	ROT MILI ON FIAT BRAVO II 2007-2014 / FIAT STILO 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	9949217	\N	B1-02-12	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.5	2026-02-13 07:07:09.609	f	f
b07b2ffe-19ed-4f6f-a190-837e9b23d6d7	TKN-DC-301	clxyedekparca00001	ROT BASI ON SAG DACIA DOKKER 2012- / DACIA LODGY 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	485200410R	\N	B1-02-20	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.483	2026-02-13 07:12:19.401	f	f
75209558-85aa-4085-982a-351ab8643d4f	TKN-DC-302	clxyedekparca00001	ROT BASI ON SOL DACIA DOKKER 2012- / DACIA LODGY 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	485202867R	\N	B1-02-21	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.454	2026-02-13 07:12:54.237	f	f
acd2f729-40f2-46f1-9469-f733175ac48d	TKN-DC-346	clxyedekparca00001	DENGE KOLU ARKA ORTA DACIA DUSTER 4X4 2010-2018	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	8200839124	\N	B1-02-23	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.463	2026-02-13 07:14:14.577	f	f
476ae946-ad94-45c0-91ec-1aa5adc9436d	TKN-DC-347	clxyedekparca00001	DENGE KOLU ARKA ALT DACIA DUSTER 4X4 2010-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	8200839119	\N	B1-02-24	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.468	2026-02-13 07:14:43.835	f	f
6f84d650-de71-4a6c-8a6f-09889437a169	TKN-P-657	clxyedekparca00001	SALINCAK ON SAG ALT ROTILSIZ DOKUM CITROEN BERLING	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3521.G8	\N	A1-04-09	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.395	2026-02-18 13:07:39.353	f	f
8b7704c0-3c29-48d7-9d73-4f5c6f7b1b78	TKN-P-658	clxyedekparca00001	SALINCAK ON SOL ROTILSIZ DOKUM CITROEN BERLINGO 20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3520.K8	\N	A1-04-10	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.221	2026-02-18 13:08:40.561	f	f
032416c7-f9e3-4fa0-b586-90e07156a768	TKN-P-659	clxyedekparca00001	SALINCAK ON SAG ALT ROTILSIZ DOKUM CITROEN C4 2009	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3521.R3	\N	A1-04-11	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.352	2026-02-18 13:09:15.963	f	f
2a77dd3b-6a11-4a64-a3e7-27102fd2564e	TKN-CI-637	clxyedekparca00001	DENGE KOLU SOL ARKA ALT CITROEN C5 III (RD) 1.6 HD	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5175.CE	\N	B1-04-02	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.195	2026-02-19 08:23:23.254	f	f
4c5ab026-e42b-4ef9-ace8-8c41d09f127e	TKN-CI-636	clxyedekparca00001	DENGE KOLU SAG ARKA ALT CITROEN C5 III (RD) 1.6 HD	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5175.CE	\N	B1-04-01	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.204	2026-02-19 08:24:19.465	f	f
37ccbf67-f1fb-4efe-adb9-bec3eb6b74a4	TKN-P-661	clxyedekparca00001	ROT BASI ON SAG CITROEN C4 2009- / CITROEN BERLING	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.75	\N	B1-04-08	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.309	2026-02-19 10:23:17.568	f	f
a9434f6d-2f41-4b2d-aada-242bc0e0c46b	TKN-P-1033	clxyedekparca00001	ROT MILI SOL-SAG ON CITROEN C3 (FC) 1.6 16V - 1.6	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.E6	\N	B1-04-09	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.447	2026-02-19 10:24:51.789	f	f
fc2afb32-9ac3-47b8-b512-85f10f99927d	TKN-P-1053	clxyedekparca00001	ROT MILI SOL-SAG ON CITROEN BERLINGO 2018-/ PEUGEO	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1648836780	\N	B1-04-10	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.26	2026-02-19 10:25:32.415	f	f
0ffe352f-339d-4e61-88de-7149b8afc714	TKN-F-811	clxyedekparca00001	ROT BASI ON SAG FIAT DUCATO 2006- / CITROEN JUMPER	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.70	\N	B1-04-15	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.297	2026-02-19 10:29:50.331	f	f
278d4952-57d9-434b-8118-b0d8cd2f5f7e	TKN-F-812	clxyedekparca00001	ROT BASI ON SOL FIAT DUCATO 2006- / CITROEN JUMPER	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.69	\N	B1-04-16	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.286	2026-02-19 10:30:12.248	f	f
b94d865a-7c16-4b48-9989-1ca01a24f52f	TKN-F-836	clxyedekparca00001	Z-ROT ON CITROEN JUMPY 2007-2016 / FIAT SCUDO 2007	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5087.56	\N	B1-04-17	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.438	2026-02-19 11:02:13.648	f	f
27331b7c-8381-4f26-8ebc-8858be739a70	TKN-F-814K	clxyedekparca00001	ROTIL KITI ON ALT FIAT DUCATO 2006- / CITROEN JUMP	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3640.67	\N	B1-04-18	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.411	2026-02-19 11:04:16.074	f	f
148d7662-16f0-4d3a-891e-b1116c0bada2	TKN-F-780	clxyedekparca00001	Z-ROT ON CITROEN JUMPER 1994-2002 / FIAT DUCATO 19	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1300716080	\N	B1-04-20	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.401	2026-02-19 11:17:55.02	f	f
f2f45ce5-f6f8-4bb2-b909-752881d47ea8	TKN-CI-551	clxyedekparca00001	ROTBASI SAG CITROEN C3 (FC) 1.4 HDI 2002-2009	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.56	\N	B1-04-21	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.292	2026-02-19 11:18:36.974	f	f
d2cbab72-3058-429c-864c-65f4045d738d	TKN-CI-552	clxyedekparca00001	ROTBASI SOL CITROEN C3 (FC) 1.4 HDI 2002-2009	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.55	\N	B1-04-22	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.36	2026-02-19 11:19:20.7	f	f
1b77495f-b548-4987-a40c-5fc3afc5f2c0	TKN-CI-553	clxyedekparca00001	ROTMILI SOL-SAG CITROEN C3 (FC) 1.4 HDI 2002-2009	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.E1	\N	B1-04-23	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.434	2026-02-19 11:22:39.345	f	f
db2b093c-7561-4cde-b149-f9247462f9f4	TKN-CI-560	clxyedekparca00001	Z-ROT ON CITROEN C3 2009-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5087.45	\N	B1-04-26	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.422	2026-02-19 11:24:12.296	f	f
32940a5e-6297-4658-87e3-b4b65b491b39	TKN-CI-611	clxyedekparca00001	ROT BASI SAG CITROEN C5 III (RD) 1.6 HDI 2008-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.81	\N	B1-04-28	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.428	2026-02-19 11:25:42.205	f	f
ffde3af8-5fda-4538-a5d0-91b38ce27ab4	TKN-CI-612	clxyedekparca00001	ROT BASI SOL CITROEN C5 III (RD) 1.6 HDI 2008-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.80	\N	B1-04-29	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.406	2026-02-19 11:26:05.509	f	f
3d90390a-c14a-4b54-8e81-c4178baaac92	TKN-CI-673	clxyedekparca00001	ROT MILI SOL-SAG CITROEN C3 III - DS3 2016-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1623140880	\N	B1-04-31	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.369	2026-02-19 11:27:33.677	f	f
930f6256-fc6e-45e9-90b3-3ba06c0a0d2e	TKN-CI-365K	clxyedekparca00001	ROTIL KITI SOL-SAG CITROEN C4 PICASSO II 1.6 HDI 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	980343480	\N	B1-04-32	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.116	2026-02-19 11:28:20.116	f	f
42f0f7dc-8e6f-48cd-8311-579ad8b3c675	TKN-CI-621	clxyedekparca00001	ROTBASI SOL-SAG CITROEN DS5 2011-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.94	\N	B1-04-34	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.341	2026-02-19 11:29:39.141	f	f
9f768a37-b9bb-4d12-8d8e-145f47172ef1	TKN-CI-613	clxyedekparca00001	ROTMILI CITROEN C5 III (RD) 1.6 HDI 2008-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.F3	\N	B1-04-35	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.183	2026-02-19 11:30:10.704	f	f
070e5e54-43e2-4de3-b75a-250cc4d4d45e	TKN-O-105K	clxyedekparca00001	ROTIL KITI ON ALT OPEL ASCONA 1981-1988 / OPEL AST	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.603	2025-12-18 19:11:35.603	f	f
7d15f66c-6269-4203-b1f2-58cb67e4697a	TKN-O-563	clxyedekparca00001	ROTMILI SOL-SAG OPEL INSIGNIA B (Z18) 2017-	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.625	2025-12-18 19:11:35.625	f	f
b9b6bddb-1026-4e9d-a9ee-07cce8e4ea9f	TKN-O-532	clxyedekparca00001	ROT BASI SOL OPEL ASTRA J GTC 1.4i T  2009-2016	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.631	2025-12-18 19:11:35.631	f	f
385e5aa1-4a71-41b0-b1bf-43aef7addb7c	4PK855	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:06:42.753	2026-01-21 10:06:42.753	f	f
93c1a751-625a-4007-8669-abeaf07a7e7e	TKN-O-141	clxyedekparca00001	ROT BASI ON OPEL COMBO 1993-2000 / OPEL CORSA 1993	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.658	2025-12-18 19:11:35.658	f	f
7f7af4c6-1bf5-4030-960b-3c4a7b88b5ca	TKN-O-153	clxyedekparca00001	ROT MILI ON OPEL CORSA 2000-2006 / OPEL COMBO 2000	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.701	2025-12-18 19:11:35.701	f	f
fbcb824f-ec91-42de-9a26-05143159b41f	TKN-O-514	clxyedekparca00001	Z-ROT ARKA OPEL INSIGNIA 2008-2017 / CHEVROLET MAL	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.709	2025-12-18 19:11:35.709	f	f
28474efe-4089-49a8-8ba7-99aef6864cdd	TKN-O-160	clxyedekparca00001	ROT MILI ON OPEL MERIVA 2003-2010	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.715	2025-12-18 19:11:35.715	f	f
dfc96592-f0c6-453a-a0d1-227eed8a1d57	TKN-O-143	clxyedekparca00001	ROT MILI ON HIDROLIK DIREKSIYON OPEL COMBO 1993-20	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.718	2025-12-18 19:11:35.718	f	f
4d3ff301-3464-4475-b2a0-62afe3d29089	TKN-O-111	clxyedekparca00001	ROT BASI ON OPEL CORSA 1999-2000 / OPEL CORSA 1982	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.725	2025-12-18 19:11:35.725	f	f
dc3b0380-8e3b-42e7-9631-96dae1d9ec73	TKN-O-521	clxyedekparca00001	ROT BASI SAG OPEL ASTRA K 2015-	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.732	2025-12-18 19:11:35.732	f	f
ad6ab7a2-3909-433d-a3cb-a33710109c27	TKN-O-451	clxyedekparca00001	ROT BASI ON OPEL ASTRA G - ZAFIRA A 1998-2004	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.739	2025-12-18 19:11:35.739	f	f
745ed12f-fbbf-434e-bd92-d316b1fe242d	TKN-O-474	clxyedekparca00001	DENGE KOLU BURCU ARKA OPEL VECTRA C 2002-2008	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.743	2025-12-18 19:11:35.743	f	f
5998e619-c3ab-4de4-87e1-0b88a26346f4	TKN-O-183	clxyedekparca00001	ROT MILI ON ALFA ROMEO MITO 2008-2016 / OPEL CORSA	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.762	2025-12-18 19:11:35.762	f	f
95e8bffc-b09d-4552-a8cc-c4a850b169c6	TKN-O-151	clxyedekparca00001	ROT MILI ON OPEL CORSA 2000-2006	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.765	2025-12-18 19:11:35.765	f	f
b610e787-1343-4fd6-a1e9-926b4662ed1a	TKN-O-409	clxyedekparca00001	Z-ROT ON PLASTIK OPEL ASTRA 1991-1998 / OPEL CALIB	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.77	2025-12-18 19:11:35.77	f	f
f73b74cd-61ec-479f-8ae5-83decbf8bba8	TKN-O-513	clxyedekparca00001	ROT MILI ON IC OPEL INSIGNIA 2008-2017	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.774	2025-12-18 19:11:35.774	f	f
f10988ad-312d-4b3d-b24f-acc6f1ddba83	TKN-CH-336	clxyedekparca00001	ROTMILI SOL-SAG OPEL INSIGNIA 2.0 CDTI (19'' JANT)	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	13332653	\N	B1-02-02	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.68	2026-02-13 06:54:41.315	f	f
a5ca11e0-73b9-4650-8a39-1ef8b3a75365	TKN-F-485K	clxyedekparca00001	ROTIL KITI ON SOL-SAG FIAT LINEA 2007-2016 / FIORI	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3520.87	\N	B1-02-04	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.581	2026-02-13 06:56:18.356	f	f
2fa8e81b-f7dd-41e6-9aa1-6685e8ae6528	TKN-F-366	clxyedekparca00001	Z-ROT ON FIAT 500 2007-2016 / FIAT PANDA 2012- / F	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1580517	\N	B1-02-08	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.529	2026-02-13 06:59:44.955	f	f
9ce88d50-7dcf-46b2-adc4-2491bb399ac7	TKN-F-513	clxyedekparca00001	ROT MILI ON MANUEL DIREKSIYON FIAT ALBEA 1996-2013	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	7081851	\N	B1-02-10	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.535	2026-02-13 07:05:42.449	f	f
c6a243ee-bc35-4d9b-a138-392678a6d2cf	TKN-F-672	clxyedekparca00001	ROT BASI ON SOL FIAT DOBLO 2010-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	77365223	\N	B1-02-13	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.593	2026-02-13 07:08:10.606	f	f
fdffbeeb-e382-4569-8224-41512fb4ce71	TKN-F-502	clxyedekparca00001	ROT BASI ON SOL FIAT ALBEA - PALIO - SIENA - STRAD	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	46456189	\N	B1-02-15	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.574	2026-02-13 07:09:12.362	f	f
90d77bf3-2ff7-4e74-8844-f0da9f873c5a	TKN-F-203	clxyedekparca00001	ROTILLI KOL M.131 / DKS / SLX	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	4331252	\N	B1-02-16	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.588	2026-02-13 07:09:50.825	f	f
ada96211-ff8d-431d-b264-ce87827e2ecc	TKN-F-813	clxyedekparca00001	ROT MILI ON HIDROLIK DIREKSIYON FIAT DUCATO 2006-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1341021080	\N	B1-02-17	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.569	2026-02-13 07:10:12.794	f	f
b982a42c-77ef-499d-b642-5fd12bdad920	TKN-O-528	clxyedekparca00001	SALINCAK ON SAG ROTILLI SAC OPEL ASTRA 2015-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	39021473	\N	A1-03-19	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.651	2026-02-16 10:20:08.619	f	f
7eff05bf-54d7-4299-b363-c7605575e95d	TKN-O-465	clxyedekparca00001	SALINCAK ON SAG ALT ROTILLI SAC OPEL ASTRA 2004-20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	24454478	\N	A1-03-20	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.674	2026-02-16 10:20:37.354	f	f
de33590b-e026-4207-ab4d-79f304927680	TKN-O-476	clxyedekparca00001	SALINCAK ON SAG ALT ROTILLI SAC OPEL VECTRA C 2002	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	51748652	\N	A1-03-21	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.704	2026-02-16 10:21:34.137	f	f
43d1828c-9724-4bff-97ad-9e6e392e7a36	TKN-F-678	clxyedekparca00001	SALINCAK ON SAG ALT ROTILLI SAC FIAT DOBLO 2010- /	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	51810664	\N	A1-03-23	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.544	2026-02-16 10:22:38.678	f	f
2b1a35b7-aac7-494c-b5a5-9bf869622673	TKN-F-626	clxyedekparca00001	SALINCAK ON SOL ALT ROTILLI SAC FIAT ALBEA 1996-20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	46777742	\N	A1-03-24	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.598	2026-02-16 10:23:04.98	f	f
6dd2b8ec-3a93-4432-a5a2-228721fd1827	TKN-O-411	clxyedekparca00001	Z-ROT ON OPEL CORSA 1993-2010 / VECTRA B 1996-2002	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	90496116	\N	B1-03-03	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.721	2026-02-16 10:34:00.809	f	f
d805c08e-d5a7-442a-a792-5a853fd1cbc2	TKN-O-527	clxyedekparca00001	Z-ROT SOL ON OPEL ASTRA K 2015-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	39001003	\N	B1-03-05	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.663	2026-02-16 10:35:23.575	f	f
1806b674-af7b-497c-9be9-91349c3b7f55	TKN-O-460	clxyedekparca00001	Z-ROT ON OPEL VECTRA C 2002-2008	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	13116332	\N	B1-03-06	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.758	2026-02-17 06:32:58.094	f	f
07aee89d-3011-49bd-a74d-cac77904e10a	TKN-O-566	clxyedekparca00001	Z-ROT SAG ON OPEL INSIGNIA B (Z18) 1.6 CDTI 2017-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	84077103	\N	B1-03-07	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.729	2026-02-17 06:36:04.502	f	f
ba6bb89d-d9b8-4e0e-8ac6-8e01f8b41dda	TKN-O-442	clxyedekparca00001	ROT MILI ON OPEL VECTRA B 1996-2002 / SAAB 9_5 199	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1603198	\N	B1-03-09	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.69	2026-02-17 07:09:21.75	f	f
424cb934-1770-4424-adc2-71a912601fd1	TKN-O-453	clxyedekparca00001	ROTMILI SOL-SAG OPEL ASTRA G 1.6 16v 1998-2005	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1603003	\N	B1-03-11	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.736	2026-02-17 07:13:54.898	f	f
2babf0cb-5485-4f83-8cff-dcd15e19dded	TKN-O-536	clxyedekparca00001	Z-ROT ON SAG OPEL ASTRA GTC 2011-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	13285628	\N	B1-03-12	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.747	2026-02-17 07:25:05.125	f	f
f601c5a7-7c41-4475-9ab6-c1d5c8743d34	TKN-O-435A	clxyedekparca00001	Z-ROT SAG ON OPEL MOKKA 2012-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	15779960	\N	B1-03-13	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.609	2026-02-17 07:26:28.49	f	f
496f6df8-7c4b-4c09-8d50-b679a34eb2ef	TKN-O-473	clxyedekparca00001	ROT MILI ON IC OPEL VECTRA C 2002-2008 / SIGNUM 20	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.795	2025-12-18 19:11:35.795	f	f
396aecf8-022a-42e1-b84e-302aa6326b93	TKN-O-441	clxyedekparca00001	ROT BASI ON OPEL VECTRA B 1996-2002 / SAAB 9_5 199	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.8	2025-12-18 19:11:35.8	f	f
22d1fc31-6a76-496a-bf01-974a785a17b2	TKN-O-522	clxyedekparca00001	ROT BASI ON SOL OPEL ASTRA 2015- / CHEVROLET CRUZE	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.804	2025-12-18 19:11:35.804	f	f
10ed4136-c1e9-4597-9eb6-b25533abcc34	TKN-O-410	clxyedekparca00001	Z-ROT ON OPEL ASTRA 1991-1998 / OPEL VECTRA 1988-1	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.809	2025-12-18 19:11:35.809	f	f
32efc5ee-b96c-46d8-90fa-769a13500fa5	TKN-O-147	clxyedekparca00001	ROT MILI ON MANUEL DIREKSIYON OPEL COMBO 1993-2000	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.813	2025-12-18 19:11:35.813	f	f
5e34221b-333e-4b71-9ddd-a3204f5a635d	TKN-O-431	clxyedekparca00001	ROT BASI SOL-SAG OPEL MOKKA 2012-	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.823	2025-12-18 19:11:35.823	f	f
88403982-0e34-4bac-87b6-0142cfc0352a	TKN-O-1011	clxyedekparca00001	ROT BASI SOL-SAG OPEL CROSSLAND X 2017- / C3 AIRCR	\N	Adet	0.00	0.00	20	0	\N	ALT TAKIM	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.83	2025-12-18 19:11:35.83	f	f
2561bd07-f29f-481c-ae36-20de2c879c00	TKN-R-679	clxyedekparca00001	SALINCAK ON SOL ALT ROTILLI SAC RENAULT FLUENCE 20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	545014055R	-	A1-02-14	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.887	2026-02-13 06:24:07.442	f	f
452f5e7d-989a-48ea-b6fe-25e56a7848c3	CB20764	clxyedekparca00001	BERLINGO	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.388	2026-01-21 10:53:48.73	f	f
2414eb7d-9910-4cd4-a366-274029e0dc35	DRK-6311	clxyedekparca00001	POLEN FILTRESI AVEO CRUZE ASTRA K INSIGNIA 2015- (	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	13356914	-	C1-01-03	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.918	2026-02-12 09:56:40.824	f	f
671a59c3-7899-4183-882d-f6e8a7df749d	DRK-7308	clxyedekparca00001	POLEN FILTRESI PARTNER TEPEE-BERLINGO III-C4 PICAS	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	6447.XF	-	C1-01-08	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.907	2026-02-12 09:59:47.361	f	f
6315e802-afa3-40a5-aec2-b01d41769e0c	DRK-7309	clxyedekparca00001	POLEN FILTRESI (OTOMATIK SOGUTMA) BERLINGO-C4-PICA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	6447.XG	-	C1-01-06	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.911	2026-02-12 09:58:54.755	f	f
ddc3276c-d7a6-4a50-ae29-400c45433944	DRK-6310	clxyedekparca00001	POLEN FILTRESI OPEL ASTRA G 98-04 ASTRA H 04-> ZAF	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	13175553	-	C1-01-04	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.915	2026-02-12 09:58:04.42	f	f
7161764d-bc61-4550-b713-434552082435	DRK-7307	clxyedekparca00001	POLEN FILTRESI C2-C3-C4-DS4-P307-P308-P407-P1007-R	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	6447.KL	-	C1-01-05	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.922	2026-02-12 09:58:34.018	f	f
8d45b3b7-a66d-4ac4-861f-086d9fb93061	DRK-7313	clxyedekparca00001	PEUGEOT 301 C ELYSEE POLEN ÇİFTLİ KARBONLU	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	9678792080	-	C1-01-07	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.925	2026-02-12 09:59:22.746	f	f
131c7e23-9a7d-43da-9427-045ed25f54b3	TKN-R-920	clxyedekparca00001	Z-ROT ON RENAULT MEGANE IV 2016- / RENAULT TALISMA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	546187005R	-	B1-02-18	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.89	2026-02-13 07:10:45.067	f	f
c8b6ae08-e332-4bec-90d8-a77397dbd07a	TKN-O-450	clxyedekparca00001	Z-ROT ON SOL-SAG OPEL ASTRA G - H 1998-2009 / ZAFI	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	350611	\N	B1-03-01	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.816	2026-02-16 10:25:28.182	f	f
8763c316-02c8-4cfa-9ba1-1e6a8d2d33b9	TKN-N-420	clxyedekparca00001	Z-ROT ON RENAULT CAPTUR 2013- / RENAULT CLIO 2005-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	551100748R	-	B1-02-25	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.896	2026-02-13 07:15:20.884	f	f
60033cc9-3e22-45e7-baf2-4d34e749d992	TKN-R-771	clxyedekparca00001	ROT BASI ON SAG RENAULT CAPTUR 2013- / RENAULT CLI	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	485208355R	-	B1-02-19	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.893	2026-02-13 07:11:25.133	f	f
3d149e26-d8a8-46d5-a4cc-fd65a694a14c	TKN-R-427	clxyedekparca00001	SALINCAK ON SAG ALT ROTILLI SAC RENAULT CLIO 2005-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	8200346942	-	A1-02-16	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.9	2026-02-13 06:50:49.57	f	f
548559e5-7b74-4fee-8ca7-a0e9b8aeac70	TKN-R-428	clxyedekparca00001	SALINCAK ON SOL ALT ROTILLI SAC RENAULT CLIO 2005-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	8200346941	\N	A1-02-15	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.884	2026-02-13 06:50:08.509	f	f
e1b62b71-c295-4bf1-acb2-1f927dc626c3	TKN-O-483	clxyedekparca00001	ROT MILI ON SOL-SAG OPEL ASTRA J 2009-2016	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	13286687	\N	B1-03-02	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.827	2026-02-16 10:33:13.486	f	f
6bf01664-6e5d-4e17-b264-b272781f71f1	TKN-O-526	clxyedekparca00001	Z-ROT SAG ON OPEL ASTRA K 2015-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	39001004	\N	B1-03-04	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.784	2026-02-16 10:34:58.959	f	f
aa1595c8-d171-4c47-9610-4cefc722fa00	EDB1065	clxyedekparca00001	Astra; Corsa; Vectra A; Tigra; Combo	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.587	2026-01-21 10:53:48.73	f	f
445854a0-457b-4a0f-953e-afb7b572f2f1	TKN-O-567	clxyedekparca00001	Z-ROT ON SOL OPEL INSIGNIA 2016-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	84077102	\N	B1-03-08	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.791	2026-02-17 06:38:50.016	f	f
637d24a6-311a-4520-966d-77a512877c74	TKN-P-699	clxyedekparca00001	SALINCAK ON SOL ALT ROTILLI SAC PEUGEOT 3008 2016-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	9816865580	\N	A1-04-12	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.871	2026-02-19 08:19:59.799	f	f
71421321-d7cf-4b8a-b19c-50af5898a64e	TKN-P-698	clxyedekparca00001	SALINCAK ON SAG ALT ROTILLI SAC PEUGEOT 3008 2016-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	9816865480	\N	A1-04-13	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.878	2026-02-19 08:21:45.254	f	f
f185ef3d-d631-450e-91c6-79c7d7c7eccf	TKN-P-856	clxyedekparca00001	Z-ROT SOL-SAG ON PEUGEOT 508 1.6 E-HDI 2010-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5087.76	\N	B1-04-03	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.852	2026-02-19 09:58:26.264	f	f
aa1afe41-c9c0-4715-962e-f8b6974011ab	TKN-P-674	clxyedekparca00001	ROT BASI ON SAG PEUGEOT 308 II 2013- / 3008 - 5008	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1610817880	\N	B1-04-04	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.837	2026-02-19 09:59:07.162	f	f
d2f488da-7400-41ae-98e4-1a595388e858	TKN-P-675	clxyedekparca00001	ROT BASI ON SOL PEUGEOT 308 II 2013- / 3008 - 5008	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1610817780	\N	B1-04-05	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.881	2026-02-19 09:59:39.457	f	f
289c316a-bf53-49ce-82bb-a264ad37c106	TKN-P-671K	clxyedekparca00001	ROTIL KITI SOL-SAG ON PEUGEOT 308 II 1.6 HDI 2014-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	9672192480	\N	B1-04-07	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.855	2026-02-19 10:20:44.228	f	f
1eab4997-9d0f-4d8d-b374-55fc1799700d	TKN-P-853	clxyedekparca00001	ROTMILI SOL-SAG PEUGEOT 508 1.6 HDI 2010-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.G3	\N	B1-04-11	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.833	2026-02-19 10:25:57.08	f	f
8a6f19da-64cd-4931-8424-cc1823bb15eb	TKN-CI-302	clxyedekparca00001	ROTBASI SOL PEUGEOT 307 (3A/C) 1.4 HDI 2000-2007	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.14	\N	B1-04-13	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.849	2026-02-19 10:27:04.536	f	f
3f9269ca-37d1-465e-aedf-642cf50c8d84	TKN-P-656	clxyedekparca00001	Z-ROT SOL-SAG ON PEUGEOT 3008 09-16/ 307 00-08/ 50	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5087.50	\N	B1-04-14	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.874	2026-02-19 10:29:18.606	f	f
af122dfb-db80-4211-91c5-e41e9d5923b8	TKN-CI-403	clxyedekparca00001	ROT MILI SOL-SAG PEUGEOT 301 1.2 VTI 2012-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1608652180	\N	B1-04-27	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.867	2026-02-19 11:24:53.253	f	f
004edaac-e8e7-4beb-b83f-5fda41e2dc76	DRK-6305	clxyedekparca00001	POLEN FILTRESI OPEL ASTRA J 09-> INSIGNIA 08-> CHE	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	DARK	\N	95527473	-	C1-01-02	\N	\N	\N	-	-	-	-	2025-12-18 19:11:35.903	2026-02-12 09:56:14.597	f	f
27f7f290-5a89-4fae-9e33-115053f0a77b	STN77364561	clxyedekparca00001	POLEN FİLTRESİ NEMO-BİPPER-DOBLO	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	77364561	\N	C1-01-13	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:51:42.434	2026-02-12 10:02:37.966	f	f
6a1645d3-f8e8-4533-a149-0048b61b518f	STN034	clxyedekparca00001	ŞANZIMAN YAĞI CVTF TEXACO	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	TEXACO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:22:42.535	2026-01-21 13:01:14.793	f	f
07655f8b-663f-4662-a0f9-6f347f329522	STN031	clxyedekparca00001	MOTOR YAĞI 5W30 MOTUL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOTUL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:17:42.782	2026-01-21 13:01:39.814	f	f
e1f59120-da93-4573-b1e8-918e6084bf2d	STN027	clxyedekparca00001	MOTOR YAĞI 5W30 ELF SPORTİ	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:15:54.352	2026-01-21 13:01:55.391	f	f
66a8db4a-3009-4288-8ee6-1cfd6847fd9e	STN019	clxyedekparca00001	MOTOR YAĞI 10W40 MOBİL YARI SENTETİK	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:09:55.058	2026-01-21 13:02:33.783	f	f
4c677e5d-af26-4257-9430-ad57e7b51b43	STN016	clxyedekparca00001	MOTOR YAĞI 10W40 LUKOİL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	LUKOİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:06:20.713	2026-01-21 13:02:46.468	f	f
76dac66a-f971-4aa2-ad37-65b794cdd660	0986486614	clxyedekparca00001	DEBRİYAJ BİLYASI LACETTİ	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	BOSCH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 07:54:15.475	2026-01-26 07:54:15.475	f	f
eeaef272-ecf6-4bab-8169-22b624cc581c	STN010	clxyedekparca00001	MOTOR TEMİZLEME SPREYİ	\N	Adet	165.00	350.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	STN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 05:36:33.432	2026-01-22 05:36:33.51	f	f
25741dc0-35a0-4b26-abd8-52cd49a1d16d	06040043	clxyedekparca00001	POLEN FİLTRESİ ASTRA H	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	95528292	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 13:14:31.739	2026-01-26 13:14:31.739	f	f
0953ebd5-8be6-4286-8346-8e5a1f0fb9f6	6PK1100	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:03:47.609	2026-01-22 14:03:47.645	f	f
071f8259-a497-441c-9a32-9c48c9de4cdc	CR3800	clxyedekparca00001	ÖN FREN BALATASI 207-307	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	CARE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-27 13:37:04.294	2026-01-27 13:37:04.294	f	f
7942ee83-c081-42d2-93e3-04408281f1c2	6PK1490	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:04:09.282	2026-01-22 14:04:09.319	f	f
fd0e24dc-66c8-45ad-933b-6a5e81fa0647	1611273080	clxyedekparca00001	DEBRİYAJ SETİ PEUGEOT-CİTROEN 1.6 HDİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	-	-	A1-01-04	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.594	2026-01-31 08:32:32.823	f	f
f092694f-c358-4de2-8c08-ea1dafb7ae7f	5PK868	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:06:51.795	2026-01-22 14:06:51.858	f	f
164aa5d6-bf71-4049-9fd9-ab832bd0facf	BHGN15	clxyedekparca00001	ECOSPORT HAVA FİLTRESİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	GN159603AA	\N	B1-01-05	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:32:50.454	2026-02-03 10:32:50.454	f	f
5cb3212a-54ca-4838-b3bd-d31a7cd820fa	5PK1236	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:08:15.313	2026-01-22 14:08:15.351	f	f
e90d37ab-ea59-4252-b2f5-7c0ec275bc22	STN004	clxyedekparca00001	BALATA SPREYİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.282	2025-12-24 13:15:39.86	f	f
87bd5ade-1fac-4346-9dfa-110448be6e96	STN003	clxyedekparca00001	DAYSON SİLİKON YAPIŞTIRICI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.277	2025-12-24 13:15:39.866	f	f
cfa5f56b-2ae0-4935-8004-b2298ca2d9fb	STN002	clxyedekparca00001	SOMA FİX YAPIŞTIRICI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.272	2025-12-24 13:15:39.871	f	f
72201265-e2ac-4c11-8aaa-c4daf8641a27	STN001	clxyedekparca00001	CAM SİLECEK SUYU	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.232	2025-12-24 13:15:39.876	f	f
40778f8c-4eef-4880-a814-935535536bc1	WBD1214	clxyedekparca00001	FREN DISKI ON HAVALI 5 BJN 17-18 JANT 303,8X28X71X	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.799	2026-01-21 10:53:48.73	f	f
bed8dfa8-b580-4a6a-b990-1c6c2c3a9a0e	STN1K0129620D	clxyedekparca00001	HAVA FİLTRESİ GOLF V	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1K0129620D	\N	B1-01-01	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:38:17.531	2026-02-03 10:38:17.531	f	f
1ea6e7c2-2ca4-41b5-a996-77ba342a6d6a	BH8V21	clxyedekparca00001	HAVA FİLTRESİ FİESTA-COURİER	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	8V219601AA	\N	B1-01-07	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:04:38.884	2026-02-03 11:04:38.884	f	f
a2c7c3ea-6d8d-466d-93cf-96916f3c5560	STN51775324	clxyedekparca00001	HAVA FİLTRESİ DOBLO 1.3	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	51775324	\N	B1-01-10	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:09:01.121	2026-02-03 11:09:01.121	f	f
0a68e318-b77b-40e5-9d5c-4f4ac4626590	STN5Q0129620E	clxyedekparca00001	HAVA FİLTRESİ ARTEON-GOLF-PASSAT	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	5Q0129620E	\N	B1-01-12	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:22:37.452	2026-02-03 11:22:37.452	f	f
e4167f01-ad6f-4aae-bd17-fcce5302f7e3	2445200	clxyedekparca00001	YAKIT FİLTRESİ AURİS-AVENSİS	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	UFİ	\N	2339026140	\N	B1-01-18	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:27:56.128	2026-02-04 06:57:14.174	f	f
ad829ec6-1456-4485-b15e-ed14059c3ac6	TGA0470	clxyedekparca00001	YAĞ FİLTRESİ 1.4 D4D	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	90915YZZJ3	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:16:56.97	2026-02-04 07:16:56.97	f	f
6aeedc81-47ba-43b3-90e2-a2eebac6f493	TGA0458	clxyedekparca00001	YAĞ FİLTRESİ PARTNER-BERLİNGO-DUCATO	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	1109.AL	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:20:09.238	2026-02-04 07:20:09.238	f	f
1cf92eb3-1fb9-4a59-8dfd-c68a6b0d94a5	TGA0277	clxyedekparca00001	YAĞ FİLTRESİ GOLF-POLO-LEON-CORDOBA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	030115561AN	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:22:46.602	2026-02-04 07:22:46.602	f	f
ad8ec09f-c49f-42d3-8af3-a9f13bdb51eb	TGC4990	clxyedekparca00001	YAĞ FİLTRESİ VOLKSWAGEN-SEAT 1.6-2.0	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	03L115466	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:25:12.86	2026-02-04 07:25:12.86	f	f
23e0248b-953b-4c01-8e40-6916a9a894da	TGC5010	clxyedekparca00001	YAĞ FİLTRESİ OCTAVİA - CRAFTER 1.6-2.0	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	03N115562	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:28:12.873	2026-02-04 07:28:12.873	f	f
8ab95815-118c-4012-894b-2d4644987a0f	TGC4963	clxyedekparca00001	 YAĞ FİLTRESİ HYUNDAİ-KİA 1.5-1.6 CRDİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	263202A500	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:30:58.251	2026-02-04 07:30:58.251	f	f
9b4e655d-f48c-43c8-b80a-142a0c7d8514	TGA0186	clxyedekparca00001	YAĞ FİLTRESİ RENAULT 1.2	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	8200257642	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:32:13.613	2026-02-04 07:32:13.613	f	f
0085ac4e-751f-48ee-ae81-9cf436879483	TGA0208	clxyedekparca00001	YAĞ FİLTRESİ RENAULT-NİSSAN 1.5	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	7702217250	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:47:12.665	2026-02-04 07:47:12.665	f	f
a8d0e61c-87cb-4f60-9158-c3bca5cf2292	6226	clxyedekparca00001	ÖN FREN HORTUMU LADA	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	FHS	\N	21083506060	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 09:04:24.364	2026-02-04 09:04:24.364	f	f
f7e8a953-3506-4d09-8b98-e70e33bc427b	VKMC03259	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.6 HDİ-TDCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SKF	\N	1684891680	\N	A1-02-02	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:15:04.112	2026-02-12 10:11:01.421	f	f
482d5349-2e54-439b-86a0-f4ad24c88db8	25193473	clxyedekparca00001	BUJİ A16XER-B16XER	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	GM	\N	25193473	\N	A1-03-05	\N	\N	\N	\N	\N	\N	\N	2026-01-23 07:51:38.679	2026-02-16 08:01:04.253	f	f
043fd312-038f-4392-9fa8-c083c49483ac	Y11759	clxyedekparca00001	RADYATÖR HORTUMU ASTRA J	\N	Adet	0.00	0.00	20	0	\N	\N	\N	YTT	\N	13345556	-	A1-02-11	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.362	2026-02-13 06:20:13.546	f	f
a8c2e870-8f92-4461-967d-24f56be2c0aa	STN005	clxyedekparca00001	BENZİN ENJEKTÖR TEMİZLEYİCİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.286	2025-12-24 13:15:39.848	f	f
c3586788-8f31-4c9f-ac4c-85739d466ac4	14030033	clxyedekparca00001	PORYA ÖN ASTRA J	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	13502829	-	A1-02-06	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.226	2026-02-12 10:12:33.306	f	f
822d5979-a68a-4d37-9d77-e99723b98af5	B26650	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 650 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.428	2025-12-24 13:15:40.296	f	f
97440ecf-a58a-4bbd-8517-95a11e62b523	B1016400	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 400 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.433	2025-12-24 13:15:40.307	f	f
87596d5a-39e5-4793-b6dd-5d7c0e98f5db	B1018450	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 450 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.449	2025-12-24 13:15:40.316	f	f
14c41ebb-3536-4832-bf5e-1ab8ce133dc2	B1019480	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 480 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.453	2025-12-24 13:15:40.325	f	f
d9c8a08a-adfc-475c-b6dc-17ae1da5603e	B1020500	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 500 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.462	2025-12-24 13:15:40.346	f	f
7185d30e-1c11-47bc-998c-40c53c2f2e7d	B1021530	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 530 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.466	2025-12-24 13:15:40.362	f	f
3b7f878f-6183-4beb-a3fc-09da7e672bc7	B1022550	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 550 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.471	2025-12-24 13:15:40.372	f	f
a2fa4e5c-1d90-46ad-a154-82131f803f04	B1024600	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 600 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.475	2025-12-24 13:15:40.378	f	f
9c2be3d1-032e-467e-9891-570608092d01	B1026650	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 650 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.479	2025-12-24 13:15:40.388	f	f
351a0fdc-7dc0-4825-8806-c199915b09b3	B1028700	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 700 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.483	2025-12-24 13:15:40.394	f	f
c1f1d767-fab5-4b3f-843b-3ed487eb8f95	S2416B3	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 600+400 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.487	2025-12-24 13:15:40.403	f	f
8ca367cf-098c-4aee-9070-6dbf05a3f120	H26650	clxyedekparca00001	SİLECEK LASTİĞİ UNIVERSAL TİP 650 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.491	2025-12-24 13:15:40.408	f	f
ebd53187-7551-4768-b016-7ab00badd88c	H14350	clxyedekparca00001	SİLECEK LASTİĞİ UNIVERSAL TİP 350 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.497	2025-12-24 13:15:40.414	f	f
07baa3f5-c0ed-438a-a7d2-225cf33b5ae3	1608747480	clxyedekparca00001	TRİGER SETİ EURO5 DV6C TÜM MODELLER (141 DİŞ)	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	PSA	\N	1608747480	-	A1-03-02	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.121	2026-02-16 07:59:02.258	f	f
c169b88e-7166-4701-b53f-d6defa6e9351	OE667/6	clxyedekparca00001	YAĞ FİLTRESİ 1.5 BLUEHDİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	FİLTRON	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.526	2025-12-24 13:15:40.433	f	f
8af369e2-616d-4b8e-8e85-ce7580771548	7.07152.17.0	clxyedekparca00001	DEVİRDAİM FOCUS-FİESTA 1.6 TDCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PİERBURG	\N	MEYS6G8591A1D	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.506	2026-02-12 09:29:50.055	f	f
f0107a50-44dd-4c91-8daa-e9fe7bf85f74	EGR0019	clxyedekparca00001	EGR VALFİ Z12XEP-Z14XEP	\N	Adet	0.00	0.00	20	0	\N	\N	\N	SUPSAN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.58	2025-12-24 13:15:40.524	f	f
37eda8e1-da09-4f95-ba44-b2a97684eab4	0020.7013.L6	clxyedekparca00001	TAMPON ALT DEFLEKTÖRÜ 207	\N	Adet	0.00	0.00	20	0	\N	\N	\N	LUVİ	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.612	2025-12-24 13:15:40.558	f	f
95524c06-81bb-4523-a9ad-7904f769d866	1523RM	clxyedekparca00001	TRİGER KAYIŞI BERLİNGO-PARTNER 1.9	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ROADMAX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.625	2025-12-24 13:15:40.582	f	f
59b6d6ab-68ef-4226-8da6-435f543e9726	280142486	clxyedekparca00001	YAKIT BUHARLAŞMA VALFİ ASTRA J A14NET	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BOSCH	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.251	2025-12-24 13:31:01.379	f	f
71f9be3f-fc04-4512-8613-59f4e89b7f13	STN007	clxyedekparca00001	SIVI GRES	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.299	2025-12-24 13:15:39.834	f	f
72be9051-6b71-4c1f-a4ab-e98c697a8e88	STN006	clxyedekparca00001	DİZEL ENJEKTÖR TEMİZLEYİCİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	STN	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-23 11:45:25.291	2025-12-24 13:15:39.84	f	f
a906d7e8-a7f3-469d-bd72-49ff8ef6eba5	351070	clxyedekparca00001	GENLEŞME KABI SENSÖRLÜ ASTRA J	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KALE	\N	13370133	-	A1-02-07	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.191	2026-02-12 10:12:53.194	f	f
279b1a94-66d5-4c7c-aa8d-a3222332d30a	1103.S7	clxyedekparca00001	YAĞ SOĞUTUCU KOMPLE 1.6 HDİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PSA	\N	1103.S7	-	A1-03-01	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.554	2026-02-16 07:58:00.305	f	f
0ef6e144-4187-4a6b-a62d-b95a400e6c2b	10030432	clxyedekparca00001	GAZ ALMA HORTUMU ASTRA J	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	13251447	-	A1-02-10	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.182	2026-02-13 06:21:28.681	f	f
21c65809-7399-4669-aa7d-fa0ceb60ac32	1313	clxyedekparca00001	KAPI GERGİ DEMİRİ ÖN ASTRA J	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KITATECH	\N	13270665	-	A1-02-08	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.221	2026-02-13 06:21:39.221	f	f
663b7861-631a-41e0-9ebe-4eacf8d90b72	343755	clxyedekparca00001	GENLEŞME KABI ASTRA H	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KALE	\N	93179469	-	A1-02-09	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.202	2026-02-13 06:21:17.436	f	f
21a24ace-f795-40fb-91cc-2e4bca2a6d6a	9863013680	clxyedekparca00001	BUJİ 1.2 TÜM MODELLER	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PSA	\N	9863013680	-	A1-03-04	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.141	2026-02-16 08:00:17.463	f	f
ef74afcb-e578-42cb-a362-c50024d1e60d	3781583001	clxyedekparca00001	YAKIT BUHARLAŞMA VALFİ ASTRA J A14NET	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	FROW	\N	55576071	-	A1-03-11	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.106	2026-02-16 09:32:31.105	f	f
8ed2ff0b-0d40-41f5-b2d5-349de4a0e4a8	13598775	clxyedekparca00001	LASTİK BASINÇ SENSÖRÜ ASTRA J	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	GM	\N	13598775	-	A1-03-13	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.246	2026-02-16 09:34:35.228	f	f
6f7f1f05-69db-4232-80b1-f568737c5902	OP103149	clxyedekparca00001	SU SEVİYE SENSÖRÜ ASTRA H	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	AKD	\N	93179551	-	A1-03-17	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.378	2026-02-16 09:39:42.947	f	f
b911ea64-f085-43d4-a9a0-3a1ccda42ab3	1684891880	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.6 HDİ-TDCİ DW6C	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	EUROREPAR	\N	1684448180	-	A1-04-03	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.112	2026-02-18 12:31:27.887	f	f
83e8d133-928a-4a21-a5dd-325aad8f9ef6	121107	clxyedekparca00001	ARKA KAPI ÇITASI SAĞ PASSAT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ROOT	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.452	2025-12-24 13:28:27.726	f	f
8c6edd44-0fa5-4c84-a3a8-8b3eb2f1f044	1654516080	clxyedekparca00001	TRİGER SETİ 1.2 TÜM MODELLER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PSA	\N	1654516080	-	A1-04-05	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.232	2026-02-18 13:04:21.583	f	f
961143b7-aa7e-4c6e-9639-bfc8c8d2967e	5060196	clxyedekparca00001	MAP SENSÖRÜ CORSA D-E ASTRA H-J Z13DTH-DTJ A13DTC-DTE 	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.242	2025-12-24 13:31:20.798	f	f
0ef5b767-5218-48d5-abac-cca422782576	2571586001	clxyedekparca00001	MOTOR KULAĞI ALT 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	FROW	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.152	2025-12-24 13:32:40.947	f	f
d72f961f-a6d6-4866-9286-b169934d922e	242225580	clxyedekparca00001	BUJİ A14XER-A16XER	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BOSCH	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.137	2025-12-24 13:32:59.312	f	f
e5f60e2a-dda7-44b1-b31e-8fcab9a7ed7a	3561405003	clxyedekparca00001	TERMOSTAT ASTRA G	\N	Adet	0.00	0.00	20	0	\N	\N	\N	FROW	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.129	2025-12-24 13:33:12.719	f	f
23ff791d-1908-497c-9eca-3e7187c6c0ba	6031101001	clxyedekparca00001	ÖN FREN DİSK JETTA III-IV GOLF V-VI-VII (5 BİJON 289 MM)	\N	Adet	0.00	0.00	20	0	\N	\N	\N	FROW	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.125	2025-12-24 13:33:22.917	f	f
35fa2343-4314-4fcb-bb8f-8ea508fe9030	530057830	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.6 HDİ DV6C-DV6FC-DV6FE (141 DİŞ)	\N	Adet	0.00	0.00	20	0	\N	\N	\N	INA	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.117	2025-12-24 13:33:49.499	f	f
ef1b99c8-f47e-4cd5-b239-fa50abc46139	B1015380	clxyedekparca00001	SİLECEK LASTİĞİ MUZ TİP 380 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.423	2025-12-24 13:15:40.291	f	f
4bffe917-b450-40c1-ae96-8934eb943d6a	6040420	clxyedekparca00001	POLEN FİLTRESİ CROSSLAND X	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.503	2026-01-21 12:02:57.247	f	f
fcf6987e-372f-4fa1-8de9-274e77c3ef58	6040061	clxyedekparca00001	POLEN FİLTRESİ CLİO IV-LOGAN	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.543	2026-01-21 12:03:44.058	f	f
5e3e1253-3eba-4592-b7e5-521aa7e8b4bd	941117	clxyedekparca00001	TRİGER KAYIŞI FOCUS II - FİESTA V-VI 1.6 TDCİ	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	DAYCO	\N	3M5Q6K288	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.42	2026-02-12 09:28:55.181	f	f
e66ada10-7751-4bfe-ba2d-e68e38b3919f	STN030	clxyedekparca00001	MOTOR YAĞI 5W30 MOBİL ESP	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:17:22.409	2026-01-21 13:01:43.638	f	f
0b58332b-9077-46b7-9f25-955cf468e00f	STN024	clxyedekparca00001	MOTOR YAĞI 0W20 TOTAL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	TOTAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:14:27.253	2026-01-21 13:02:08.19	f	f
e05fd2cc-ccab-445f-af0b-2cd94bd78732	STN021	clxyedekparca00001	MOTOR YAĞI 5W30 SHELL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	SHELL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:11:20.572	2026-01-21 13:02:22.588	f	f
652c437c-e68c-4180-b1c1-79ec9971c4e0	STN014	clxyedekparca00001	MOTOR YAĞI 5W30 ELF FULLTECH LLX	\N	Adet	1450.00	1750.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 11:09:47.659	2026-01-21 13:02:59.486	f	f
4af4a50d-1f6e-4197-a2c1-6be7e4477c1f	6PK965	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:04:30.523	2026-01-22 14:04:30.561	f	f
35b5de9f-b9d7-4211-885e-712efa2e4b8a	1648212080	clxyedekparca00001	TRİGER SETİ A16XER	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	EUROREPAR	\N	95516740	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:31:53.013	2026-01-23 08:31:53.013	f	f
988a9c98-3f14-4618-b4d6-b7d34ab264bd	15010051	clxyedekparca00001	ÖN AMÖRTİSÖR SAĞ FOCUS II	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	4M5118B038	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.51	2026-02-12 09:27:48.567	f	f
36554292-a6c6-4759-b86b-6d12f28fe79f	15010052	clxyedekparca00001	ÖN AMÖRTİSÖR SOL FOCUS II	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	4M5118K001	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.514	2026-02-12 09:27:05.107	f	f
d27eaf8b-5790-43b3-9bf3-a4610454c87a	344665	clxyedekparca00001	YAĞ SOĞUTUCU KANGOO 1.9 DCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KALE	\N	8200068115	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.499	2026-02-12 09:28:09.549	f	f
fe565e37-58ec-457e-82ba-9da56b415810	1987302803	clxyedekparca00001	FAR AMPULÜ H4	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	\N	\N	C1-02-13	\N	\N	\N	\N	\N	\N	\N	2025-12-25 07:45:34.31	2026-02-19 13:06:53.183	f	f
c4670a27-ce24-4d9c-bb1a-9bc28fce7485	1987302806	clxyedekparca00001	FAR AMPULÜ H11	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	\N	\N	C1-02-13	\N	\N	\N	\N	\N	\N	\N	2025-12-25 07:45:15.991	2026-02-19 13:07:06.558	f	f
82fcf0a6-4e8f-4f4a-afae-667a1f0bd796	1987302811	clxyedekparca00001	AMPUL TEK DUY	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	\N	\N	C1-02-15	\N	\N	\N	\N	\N	\N	\N	2025-12-25 07:44:50.743	2026-02-19 13:07:50.271	f	f
32232a4f-7861-457d-b28b-a8de0a0cc3da	PH6607	clxyedekparca00001	FAR AMPULÜ H7	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-13	\N	\N	\N	\N	\N	\N	\N	2025-12-25 07:26:23.162	2026-02-19 13:08:09.798	f	f
b73e300d-8cec-4a0a-8320-8823d2b69564	N566	clxyedekparca00001	AMPUL ÇİFT DUY	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	NEOLUX	\N	\N	\N	C1-02-14	\N	\N	\N	\N	\N	\N	\N	2025-12-25 07:44:26.178	2026-02-19 13:08:22.364	f	f
9257524e-3e32-4c79-95dd-2dfc453de011	10010263	clxyedekparca00001	MOTOR TAKOZU ÖN ASTRA H	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.567	2025-12-24 13:23:26.193	f	f
1e0a1f66-8fb3-48eb-a57e-e117c4c2992b	13040218	clxyedekparca00001	Z ROT ÖN CADDY III - GOLF IV-V	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.563	2025-12-24 13:23:39.404	f	f
310c997a-8da9-4668-bbc1-541d494ce14a	4050338	clxyedekparca00001	SİNYAL KUMANDA KOLU 207	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.554	2025-12-24 13:23:48.713	f	f
aea2fae2-2e3e-4793-a8ed-5307cbd5d89c	5060012	clxyedekparca00001	HAVA DEBİMETRESİ PEUGEOT-FORD 1.4 HDİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.547	2025-12-24 13:23:55.893	f	f
74d8bbe7-e879-46df-873f-f65de064bb9b	171166	clxyedekparca00001	SİLECEK KUMANDA KOLU SANDERO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	SAGEMFRANS	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.54	2025-12-24 13:24:16.194	f	f
ddcab7ac-5363-464d-a965-64ae73f0a0cf	5090282	clxyedekparca00001	KRANK DEVİR SENSÖRÜ AVEO-KALOS-LACETTİ 1.4	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.536	2025-12-24 13:24:26.294	f	f
e37fb855-34d5-419f-986f-e31e50d34721	5060191	clxyedekparca00001	MAP SENSÖRÜ AVEO-KALOS-LACETTİ 1.4	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.531	2025-12-24 13:24:33.883	f	f
4d5a2911-661a-4939-bd75-24ef80fe07ae	5020101	clxyedekparca00001	ATEŞLEME BOBİNİ A16XER	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.519	2025-12-24 13:24:42.082	f	f
b2447e12-55c1-488c-9af5-86502190495c	382400	clxyedekparca00001	KLİMA RADYATÖRÜ KANGOO 1.9 DCİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KALE	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.494	2025-12-24 13:25:19.476	f	f
3632feca-2e3c-4103-9789-79ac550504e0	93904	clxyedekparca00001	ÖN FREN BALATASI JETTA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	GRAP	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.487	2025-12-24 13:25:27.857	f	f
33139374-88e3-4053-a8b9-b183e372273c	7010437	clxyedekparca00001	ÖN FREN BALATASI JETTA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.471	2025-12-24 13:26:11.285	f	f
dc22b8b9-e886-474a-846e-56c35269bac7	21030554	clxyedekparca00001	ÇAMURLUK SİNYALİ SAĞ-SOL PASSAT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.465	2025-12-24 13:26:19.845	f	f
f5da4276-152e-4706-88a1-ce07737a45a3	121106	clxyedekparca00001	ARKA KAPI ÇITASI SOL PASSAT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ROOT	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.46	2025-12-24 13:26:28.345	f	f
a831f8d0-5ce9-425c-b19e-5be00d6be343	121101	clxyedekparca00001	ÖN KAPI ÇITASI SOL PASSAT 	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ROOT	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.446	2025-12-24 13:29:20.045	f	f
e748580c-fd48-4381-9341-a99b71697a7d	121103	clxyedekparca00001	ÖN KAPI ÇITASI SAĞ PASSAT 	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ROOT	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.442	2025-12-24 13:29:42.728	f	f
f48ff1eb-e85d-4cb5-b628-73a89dccdd7a	1043899	clxyedekparca00001	MOTOR YAĞI 5W30 DPF PARTİKÜL OEM LEVEL 5 LT.	\N	Adet	0.00	0.00	20	0	\N	\N	\N	CHAMPION	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.429	2025-12-24 13:30:04.199	f	f
7c713b16-3614-46b7-87d8-809366a65102	17043004	clxyedekparca00001	KOKU BOMBASI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.283	2025-12-24 13:30:20.898	f	f
e4e92397-048d-4573-9190-b9451b01bc43	10030868	clxyedekparca00001	TURBO HORTUMU 1.5 DCİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.261	2025-12-24 13:30:32.164	f	f
29d6bea3-86c2-480b-a77f-32743f0313fd	1682291780	clxyedekparca00001	DEBRİYAJ SETİ 1.6 HDİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	EUROREPAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-25 13:37:15.001	2025-12-25 13:37:15.001	f	f
48ca0edf-32c8-45a1-b60a-2959c06e3dc8	Y5188	clxyedekparca00001	MOTOR KULAĞI SAĞ 1.6 HDİ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	YTT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-25 13:37:49.649	2025-12-25 13:37:49.649	f	f
d85e30e7-0ceb-4555-a2b2-51fe3a8ea5b8	BPE241023	clxyedekparca00001	YAĞ ÇUBUĞU 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-25 13:39:14.463	2025-12-25 13:39:14.463	f	f
490f2b4e-e728-4603-892a-9446d1423df4	GDB3452	clxyedekparca00001	ÖN FREN BALATASI KİA SORENTO	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	TRW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-25 12:16:07.304	2026-01-21 10:53:48.73	f	f
99748460-340b-44e6-9582-4cfefa7c62e5	AYSAN-4408	clxyedekparca00001	FREN BALATASI ÖN GOLF VIII (2019>) / OCTAVIA IV (2	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	AYSAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.574	2026-01-21 10:53:48.73	f	f
c2b759c8-dde9-4f81-bb30-5fe9ba67226f	CB20961	clxyedekparca00001	A4 II,III, A4 AVANT, A4 CABRIO, A6 II	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.65	2026-01-21 10:53:48.73	f	f
bbb14892-390c-4ac3-b359-5e10239d6b9c	TGA0201	clxyedekparca00001	YAĞ FİLTRESİ HONDA 1.5	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	04154PR3E00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:23:49.873	2026-02-04 07:23:49.873	f	f
1eb6e181-ad33-4d20-a80f-dc0114ff545e	STN032	clxyedekparca00001	MOTOR YAĞI 5W30 TEXACO DPFs	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	TEXACO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:18:29.058	2026-01-21 13:01:35.311	f	f
118241c5-8dd9-4124-a763-eee8a09adb06	STN022	clxyedekparca00001	MOTOR YAĞI 5W30 LUKOİL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	LUKOİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:12:44.117	2026-01-21 13:02:17.539	f	f
1e71ee04-477b-4cfb-ae02-6f4f31ec2e82	STN020	clxyedekparca00001	MOTOR YAĞI 5W30 MOBİL SUPER 3000	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:10:36.184	2026-01-21 13:02:28.715	f	f
f40fcf68-9a05-4d3e-b5bb-913eb524f08f	STN015	clxyedekparca00001	MOTOR YAĞI 10W40 SHELL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	SHELL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 11:59:18.832	2026-01-21 13:02:51.038	f	f
fcbb1661-949f-4493-b50f-15bc992b7224	STN011	clxyedekparca00001	PARTİKÜL FİLTRE TEMİZLEME	\N	Adet	195.00	400.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	STN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 05:37:17.682	2026-01-22 05:37:17.724	f	f
2d649c35-50a7-4f73-ac12-fadb9a6b3dd8	TGC4070	clxyedekparca00001	YAĞ FİLTRESİ AUDİ-VOLKSWAGEN-SEAT	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	041115562	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:26:30.877	2026-02-04 07:26:30.877	f	f
887b796e-4337-44d7-afe9-1801ae0890ce	6PK1720	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:05:47.939	2026-01-22 14:05:47.992	f	f
a0bbc567-de8c-4640-9626-554812ce1b58	5PK1175	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:07:15.168	2026-01-22 14:07:15.207	f	f
9e321ab1-0b30-41fa-8b90-22dcdc5817f9	3PK0750	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:08:41.778	2026-01-22 14:08:41.865	f	f
a1a2a2ae-1141-468c-bc6d-edb60da5c581	YS0095	clxyedekparca00001	YAĞ SOĞUTUCU A16XER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SUPSAN	\N	25199751	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:32:36.328	2026-01-23 08:33:10.302	f	f
9295b32c-9a71-46eb-8c8d-c15ac375f692	62932716	clxyedekparca00001	ALT MOTOR KULAĞI 301	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SWAG	\N	1806.A6	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 07:54:56.671	2026-01-26 12:18:36.21	f	f
2f2a2e97-db2d-4477-9600-824f068819bb	RCR 73529	clxyedekparca00001	ARKA FREN BALATASI 307-308	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-27 13:38:51.545	2026-01-27 13:38:51.545	f	f
9eed4328-9f98-4675-94fd-f6b9cf9be05f	RCR 5669	clxyedekparca00001	FREN DİSKİ ÖN ASTRA J (2009>...) ZAFIRA C (2011>..	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	RECOVER	\N	13502052	-	A1-01-05	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.752	2026-01-31 08:33:32.436	f	f
206ea6f5-2d0d-4642-9fd9-95fa289c2b25	B859	clxyedekparca00001	HAVA FİLTRESİ MEGANE III - FLUENCE III	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	8200820859	\N	B1-01-06	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:33:53.365	2026-02-03 10:33:53.365	f	f
e91ba21b-224c-47d7-a08c-75b82e9cbb45	STN51974227	clxyedekparca00001	HAVA FİLTRESİ DOBLO 1.3	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	51974227	\N	B1-01-08	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:05:29.064	2026-02-03 11:05:29.064	f	f
7e4c1c3b-7e0f-4fb1-870c-220c05877d12	STN8200023480	clxyedekparca00001	HAVA FİLTRESİ CLİO-KANGO-LOGAN-SANDERO	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	8200023480	\N	B1-01-13	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:23:40.988	2026-02-03 11:23:40.988	f	f
6d5a4e0a-1147-4576-a28a-d1c377e34dc7	STN03C129620B	clxyedekparca00001	HAVA FİLTRESİ AUDİ A3	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	03C129620B	\N	B1-01-02	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:39:22.005	2026-02-03 11:31:18.213	f	f
0e60dbfc-23e0-42a1-8311-2a85c0a7118c	TGA0840	clxyedekparca00001	YAKIT FİLTRESİ 1.6HDİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	GENERAL	\N	1906.E6	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:56:29.223	2026-02-04 06:56:29.223	f	f
e582d74f-3178-4d9d-ace3-01b321afae0f	OX1308D	clxyedekparca00001	YAĞ FİLTRESİ EURO VI	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	MAHLE	\N	152092567R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:12:05.086	2026-02-04 07:12:05.086	f	f
5f5d6c8a-1f76-4291-9c59-6314c4e1ed52	2851202001	clxyedekparca00001	ROT BAŞI SOL 208	\N	Adet	0.00	0.00	20	0	\N	\N	\N	FROW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:56:59.318	2025-12-26 07:56:59.318	f	f
541b0362-177a-4f13-a285-4b2d8a868f37	TGC4118	clxyedekparca00001	YAĞ FİLTRESİ 1.4 D4D	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	04152YZZA8	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:18:20.662	2026-02-04 07:18:20.662	f	f
8096058b-0009-456c-afa4-f9f062027edd	TGC4982	clxyedekparca00001	YAĞ FİLTRESİ AURİS-AVENSİS	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	0415240060	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:21:29.405	2026-02-04 07:21:29.405	f	f
cc7b1ab2-3e0f-44bb-8ee5-3e80f1084847	TGC4110	clxyedekparca00001	YAĞ FİLTRESİ ACCENT - GETZ - CEED 1.5	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	263202A001	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:29:40.924	2026-02-04 07:29:40.924	f	f
0dd5cb06-0a57-44c6-86d7-8dee0371a7bb	TGA0307	clxyedekparca00001	YAĞ FİLTRESİ COROLLA 98-02	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	1616399880	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:45:25.38	2026-02-04 07:45:25.38	f	f
af1dce21-eb06-4482-9e08-3d3b131f72f4	40345001	clxyedekparca00001	MOTOR TAKIM CONTASI LADA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	OTO CONTA	\N	29004706	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 09:05:19.792	2026-02-04 09:05:19.792	f	f
d18a2a2c-afed-4073-9e04-eec16a993af0	06020063	clxyedekparca00001	YAĞ FİLTRESİ LADA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	KRAFTVOLL	\N	7700538153	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 09:06:08.482	2026-02-04 09:06:08.482	f	f
46fe045a-a704-4ba8-8659-c1f1891712f9	09080050	clxyedekparca00001	DİKİZ AYNA CAMI SAĞ SONNECT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	9T1617K740BB	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 09:13:35.502	2026-02-04 09:13:35.502	f	f
9313625f-754f-4bab-8e48-68dac414e3bc	31-04289-041	clxyedekparca00001	MOTOR PİSTON+SEGMAN A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	YENMAK	\N	55197996	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 09:48:46.226	2026-02-04 09:48:46.226	f	f
c190aad6-0676-492d-934a-28d3ff6e2bd2	H0000463	clxyedekparca00001	SİLİNDİR KAPAĞI A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SUPSAN	\N	71724174	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 10:50:45.577	2026-02-04 10:50:45.577	f	f
d55c6017-a666-4c0f-91c5-05801d2bd8be	HU6015ZKIT	clxyedekparca00001	YAĞ FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	MANN	\N	11428570590	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 10:59:23.599	2026-02-04 10:59:23.599	f	f
a7afc855-d4aa-456a-811e-a162f685e1b1	06040430	clxyedekparca00001	POLEN FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	64116823725	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:00:09.465	2026-02-04 11:00:09.465	f	f
a9a3989f-edcf-493a-88e0-4250d87bb6ba	SH1704	clxyedekparca00001	HAVA FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SİON	\N	13717619267	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:00:44.528	2026-02-04 11:00:44.528	f	f
ce172f29-bc42-472b-bde6-2ce7be654416	FI6000	clxyedekparca00001	SİLECEK MOTORU TEMPRA	\N	Adet	0.00	0.00	20	0	SİLECEK GRUBU	SİLECEK GRUBU	\N	ZENON	\N	64342101	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:02:43.31	2026-02-04 11:02:43.31	f	f
8a3c1cf2-36e4-48c2-8cab-0a9d7daddb12	5PK963	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	ABA	\N	5PK963	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:04:05.302	2026-02-04 11:04:05.302	f	f
f2466b52-e1e7-4307-b0e6-ff537b7864c6	001	clxyedekparca00001	ALTERNATÖR GERGİ RULMANI TEMPRA	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BMS	\N	532022910	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:04:56.386	2026-02-04 11:04:56.386	f	f
a0a99d75-4606-47b2-b661-9d3032cfcc4d	40304002	clxyedekparca00001	MOTOR TAKIM CONTA TEMPRA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	OTO CONTA	\N	5888318	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:05:47.204	2026-02-04 11:05:47.204	f	f
c1601d10-deb6-49c6-a001-0a70ba4da456	724369001	clxyedekparca00001	TERMOSTAT 1.5 HDİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	TOPRAN	\N	9812113780	\N	A1-02-03	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:40:08.165	2026-02-12 10:11:28.472	f	f
3abbdee2-7c23-4477-a9eb-6911ee062fb1	05030004	clxyedekparca00001	ISITMA BUJİSİ A13DTC-A13DTE	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	KRAFTVOLL	\N	55564219	\N	A1-03-10	\N	\N	\N	\N	\N	\N	\N	2026-01-23 07:53:22.102	2026-02-16 09:32:04.469	f	f
faf14f78-3e6c-470f-bf01-6eed7e25cc67	STN165467674R	clxyedekparca00001	HAVA FİLTRESİ RENAULT-DACİA 1.5	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	165467674R	\N	C1-02-02	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:46:47.951	2026-02-19 13:02:04.786	f	f
1a352200-2694-4fb7-8b01-701dbf55f921	12109446	clxyedekparca00001	SİLECEK LASTİĞİ ARKA 280 MM	\N	Adet	0.00	0.00	20	0	SİLECEK GRUBU	SİLECEK GRUBU	\N	MAXTEL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:12:23.877	2026-01-21 12:00:56.526	f	f
17e52e1b-1762-46e4-ada6-4594ab04b5a6	97-08524	clxyedekparca00001	ÖN ALT TABLA SOL FİESTA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	AYD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 10:16:08.29	2025-12-26 10:16:08.29	f	f
43383f55-e917-4b41-9e96-7544bcb1d2b5	SM3548	clxyedekparca00001	YAKIT FİLTRESİ 1.5 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	\N	SİON	\N	9820226380	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 12:56:18.281	2025-12-26 12:56:18.281	f	f
349a6aae-a6f2-4789-8e3b-a64c99c25a02	09080049	clxyedekparca00001	DİKİZ AYNA CAMI SOL CONNECT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	9T1617K741BB	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:14:02.672	2026-02-04 09:14:01.003	f	f
8436cadd-59b5-4ff4-a9e8-cd488f7dda9a	STN023	clxyedekparca00001	MOTOR YAĞI 5W30 MOBİL SUPER 2000	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:13:43.878	2026-01-21 13:02:13.026	f	f
890144cd-82a6-4535-91a5-f0171ee37c20	511166	clxyedekparca00001	STOP LAMBASI SOL RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:31:03.8	2025-12-29 07:31:03.8	f	f
9b6f5c8b-171b-41e1-ab25-bf762161e05c	SC555	clxyedekparca00001	POLEN FİLTRESİ 206	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	SARDES	\N	6447.AZ	\N	A1-01-03	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:28:03.247	2026-01-31 08:29:48.884	f	f
4a4ed874-2216-4bc9-a300-17f0d0082d97	97098	clxyedekparca00001	BUJİ HYUNDAİ-KİA 1.4	\N	Adet	0.00	0.00	20	0	\N	\N	\N	NGK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:32:03.389	2025-12-29 07:32:03.389	f	f
ac760694-94b3-41b0-901c-4c2c66cdd8e6	9816808580	clxyedekparca00001	ARKA TAMPON BAĞLANTI BRAKETİ SOL İÇ RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:33:08.343	2025-12-29 07:33:08.343	f	f
cfc20890-efbf-4f9e-ac2d-fbad4c6a1e9c	9816808780	clxyedekparca00001	ARKA TAMPON BAĞLANTI AYAĞI RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:33:55.181	2025-12-29 07:33:55.181	f	f
588353b5-ad93-4633-a58a-4a4b8d4037d1	9816804280	clxyedekparca00001	ARKA TAMPON SOL RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:34:26.46	2025-12-29 07:34:26.46	f	f
86f45835-4387-438e-9a62-7f15a593783a	6325.G3	clxyedekparca00001	ÇAMURLUK SİNYALİ RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:35:00.177	2025-12-29 07:35:00.177	f	f
d6713413-184e-498d-ac98-0f7ce9773a13	9817924480	clxyedekparca00001	YAKIT DEPO DIŞ KAPAĞI COMBO-RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:35:46.336	2025-12-29 07:35:46.336	f	f
799fb7cb-e6f7-4325-8eff-994e70793414	1508.H7	clxyedekparca00001	YAKIT DEPO İÇ KAPAĞI COMBO-RİFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 07:36:19.441	2025-12-29 07:36:19.441	f	f
d9d4845c-dfeb-43b9-9573-4443ddae6f05	13040195	clxyedekparca00001	Z ROT ASTRA H	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-29 13:56:01.834	2025-12-29 13:56:01.834	f	f
2e609756-f2dd-4834-830c-958fab782301	15010153	clxyedekparca00001	ARKA AMÖRTİSÖR NEMO-DOBLO	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 06:20:02.446	2025-12-30 06:20:02.446	f	f
cc55cb87-07fe-4476-b97c-cbd1f3fb9112	07010081	clxyedekparca00001	ÖN FREN BALATASI COROLLA 2003-2007	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	0446502061	\N	---	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:04:27.28	2026-02-03 05:32:01.421	f	f
c7b27ccb-60b8-45d1-a4bd-a6985dd010a8	A262	clxyedekparca00001	DEVİRDAİM KOMPLE GOLF VII	\N	Adet	0.00	0.00	20	0	\N	\N	\N	DOLZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 13:50:25.383	2025-12-30 13:50:25.383	f	f
addab545-6b58-4776-be0c-9a6f558d4642	1987946588	clxyedekparca00001	TRİGER SETİ GOLF VII	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BOSCH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 13:50:50.247	2025-12-30 13:50:50.247	f	f
c30a5567-c001-421d-ae90-feb392367dd7	BPE309684	clxyedekparca00001	TAMPON KÖŞE BAKALİT TAKIM RİFTER	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 13:53:03.875	2025-12-30 13:53:03.875	f	f
67f42db7-5363-4a94-8da0-3bc9f5976897	BPE351010	clxyedekparca00001	STOP LAMBASI SOL RİFTER	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-30 13:53:36.961	2025-12-30 13:53:36.961	f	f
7b4bf170-1f06-424b-8b2f-9e0a05f3432d	93231	clxyedekparca00001	BUJİ 1.0-1.2-1.4 TSİ	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	NGK	\N	04C905612C	\N	A1-03-09	\N	\N	\N	\N	\N	\N	\N	2025-12-30 13:51:44.008	2026-02-16 09:30:23.719	f	f
166607ec-bd9c-47af-8930-fd4fde841508	1638159680	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.5 HDİ-1.5 TDCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PSA	\N	1638159680	\N	A1-04-02	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:14:34.526	2026-02-18 12:28:24.041	f	f
b22dc4d6-4a5e-4995-ad48-958935147ef9	TH6294.82J	clxyedekparca00001	TERMOSTAT ACCENT-ELANTRA 2000-2006 1.4-1.6	\N	Adet	0.00	0.00	20	0	\N	\N	\N	VERNET	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-02 14:43:11.191	2026-01-02 14:43:11.191	f	f
759f05c7-eb2d-434d-8bbb-f194dde1c79f	411	clxyedekparca00001	RADYATÖR KAPAĞI HYUNDAİ-KİO TÜM MODELLER	\N	Adet	0.00	0.00	20	0	\N	\N	\N	CAPS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-02 14:43:53.119	2026-01-02 14:43:53.119	f	f
fa35c37c-68bc-4ae3-aff7-cf60740f8a7b	131180	clxyedekparca00001	TERMOSTAT YUVASI ACCENT-ELANTRA 1.4-1.6	\N	Adet	0.00	0.00	20	0	\N	\N	\N	SAGEMFRANS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-02 14:44:33.474	2026-01-02 14:44:33.474	f	f
2b71604c-4133-4a12-b75c-b21cc132a9fb	9846882380	clxyedekparca00001	DEVİRDAİM 1.2 TÜM MODELLER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PSA	\N	9846882380	\N	A1-04-06	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:17:00.131	2026-02-18 13:05:54.471	f	f
663fe1ad-2962-4e86-9b23-2117ca85246d	EP103	clxyedekparca00001	BENZİN FİLTRESİ LADA SAMARA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	\N	PURFLUX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-02 14:45:25.939	2026-01-02 14:45:25.939	f	f
190453cf-6a4e-4f64-864c-73de4a259112	STN6447.XF	clxyedekparca00001	POLEN FİLTRESİ 1.5 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	6447.XF	\N	C1-02-11	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:50:57.604	2026-02-19 13:06:03.258	f	f
f5bbb7ba-2916-4f0a-b236-aaee3855b0b2	R-1202	clxyedekparca00001	ARKA FREN KAMPANASI SYMBOL II	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	OCAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-02 14:50:33.873	2026-01-02 14:50:33.873	f	f
0fa3ca27-eae5-49b2-a6fc-f28ffc5cf071	605228	clxyedekparca00001	SAĞ STOP LEDLİ CADDY	\N	Adet	0.00	0.00	20	0	\N	\N	\N	WAGENBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 08:12:44.844	2026-01-06 08:12:44.844	f	f
cd5ab9b4-7a9c-4141-9a42-3da04e2405dc	P367R	clxyedekparca00001	DAVLUMBAZ ÖN SAĞ 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	HİLEKS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:25:19.036	2026-01-06 14:25:19.036	f	f
d20d1dff-3238-498d-bea6-54a8b9f09b9d	BPE288011	clxyedekparca00001	ÖN TAMPON ALT KARLIK 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:25:42.045	2026-01-06 14:25:42.045	f	f
601b6b15-5025-48a8-b3dc-7f59466dde78	BPE309138	clxyedekparca00001	ÖN TAMPON ÇEKİ DEMİR KAPAĞI 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:26:07.143	2026-01-06 14:26:07.143	f	f
36e364b8-6fe4-4d8d-a63c-14098430477b	BPE309033	clxyedekparca00001	ARKA TAMPON ÇEKİ DEMİR KAPAĞI 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BİTAPART	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:26:26.076	2026-01-06 14:26:26.076	f	f
444c897c-4ff0-4abf-83a3-e8e9baef3431	5421.06	clxyedekparca00001	JANT GÖBEĞİ 307	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:26:54.546	2026-01-06 14:26:54.546	f	f
4d29ba15-d80a-42d7-9a01-fd21d68a64f5	TKN-P-655	clxyedekparca00001	ROTİL SAĞ-SOL PEUGEOT-CİTROEN	\N	Adet	0.00	0.00	20	0	\N	\N	\N	TEKNOROT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:17:58.54	2026-01-07 09:17:58.54	f	f
21a31166-c617-4d2d-9980-dc07951bd242	15010067	clxyedekparca00001	ÖN AMÖRTİSÖR SAĞ-SOL DACİA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:18:34.426	2026-01-07 09:18:34.426	f	f
cf26b850-04a7-4f79-800b-bbd290a5e5f2	1231	clxyedekparca00001	ÖN AMÖRTİSÖR TAKOZU SAĞ-SOL DACİA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	FKK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:19:42.556	2026-01-07 09:19:42.556	f	f
83983ed2-a2a5-4026-884b-ddba7ce30748	15010066	clxyedekparca00001	ARKA AMÖRTİSÖR SAĞ-SOL DACİA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-07 09:18:50.98	2026-01-07 09:20:01.296	f	f
ea86f4e2-83dd-4571-9a0d-fb8701dcf4a3	07040080	clxyedekparca00001	ÖN FREN DİSKİ COROLLA 2003-2007	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:03:36.674	2026-01-10 10:03:36.674	f	f
a492f201-88ee-4e8e-ae49-52e1a50dbab8	07040162	clxyedekparca00001	ARKA FREN DİSKİ COROLLA 2003-2007	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:03:59.61	2026-01-10 10:03:59.61	f	f
d20bccc8-8f63-47b1-bf83-65d9a78ab3d0	90208 A	clxyedekparca00001	ARKA FREN BALATASI COROLLA 2003-2007	\N	Adet	0.00	0.00	20	0	\N	\N	\N	SKF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:05:22.145	2026-01-10 10:05:22.145	f	f
5b1857ab-1fbb-452e-8080-a956a4af46ca	RS11280S108	clxyedekparca00001	SİLECEK LASTİĞİ ARKA MONDEO-KUGA 280 MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MARTIGUES	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:07:36.869	2026-01-10 10:07:36.869	f	f
afbf48c3-f9f3-4f3a-9206-d9c0d4afc46d	AE0201	clxyedekparca00001	ÖN FREN DİSKİ ASTRA J 1.6 BENZİN	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	BRAXİS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:15:25.908	2026-01-10 10:15:25.908	f	f
7cc41938-a92a-4b3f-b768-b7c7a49fc4bf	06030022	clxyedekparca00001	YAKIT FİLTRESİ BİPPER 1.4 HDİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 06:46:16.419	2026-01-21 12:01:59.536	f	f
d922900b-9ef7-418c-b8c4-cb1108141338	J1140540	clxyedekparca00001	V KAYIŞ GERGİ+KÜTÜK İ20	\N	Adet	0.00	0.00	20	0	\N	\N	\N	HERTH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-12 06:40:37.179	2026-01-12 06:40:37.179	f	f
da6c69b8-ab7d-4824-85cb-65620fba47dd	STN1109.AY	clxyedekparca00001	YAĞ FİLTRESİ 1.6 HDİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	\N	STN	\N	1109.AY	\N	C1-02-05	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:07:23.724	2026-02-19 13:03:37.44	f	f
a181504d-05d8-4c3e-96d5-2647e22adc7c	826511R050	clxyedekparca00001	DIŞ KAPI KOLU ÖN-ARKA SOL-SAĞ	\N	Adet	0.00	0.00	20	0	\N	\N	\N	TAİWAN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-12 08:34:01.71	2026-01-12 08:34:01.71	f	f
d96763b5-aa5e-4d3e-a98f-db60d5f59cf9	STN9813908880	clxyedekparca00001	HAVA FİLTRESİ 1.5 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	\N	STN	\N	9813908880	\N	C1-02-10	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:51:20.3	2026-02-19 13:05:40.424	f	f
bf349ab9-27ce-42e5-89ac-f85a6fb5155f	C-3020M	clxyedekparca00001	DIŞ DİKİZ AYNASI SOL KOMPLE CONNECT	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ERAYNA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-14 06:19:35.893	2026-01-14 06:19:35.893	f	f
6b77e199-dd06-4f0f-95fc-819df8dc0bcd	6PK2220HD	clxyedekparca00001	V KAYIŞI CAPTİVA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	DAYCO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-14 10:25:51.955	2026-01-14 10:25:51.955	f	f
5a5119ab-cfdf-4038-b627-d384e352e12b	OP115116	clxyedekparca00001	V KAYIŞ GERGİ+KÜTÜK CAPTİVA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	AKD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-14 10:26:23.038	2026-01-14 10:26:23.038	f	f
df13e644-c357-4a18-9969-6862e05182eb	BHTV	clxyedekparca00001	HAVA FİLTRESİ 2008	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	1444.TV	\N	A1-01-15	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:57:39.194	2026-02-03 05:51:10.473	f	f
1a6a8fde-c5c1-4dd0-b0f0-6c7337f092eb	25300226	clxyedekparca00001	ALTERNATÖR KASNAĞI CAPTİVA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	ABA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-14 12:59:00.398	2026-01-14 12:59:00.398	f	f
1d5dd49b-eb8e-4278-b301-16241931bd9f	5607980	clxyedekparca00001	KÜLBÜTOR KAPAK CONTASI A16XER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	AKD	\N	55354237	\N	A1-03-18	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:59:22.804	2026-02-16 09:40:28.977	f	f
6f5c1edf-9168-4d3e-aa37-0910c2602c32	5031.77	clxyedekparca00001	AMORTİSÖR TAKOZU TAKIM 307	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-19 09:14:11.628	2026-01-19 09:14:11.628	f	f
f27495f5-9e20-4b1d-b41d-acd1964600fd	13050553	clxyedekparca00001	SALINCAK SAĞ GETZ	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-20 07:37:35.805	2026-01-20 07:37:35.805	f	f
4a0c6df2-9b97-47aa-8647-d69ac9e5b68b	13050552	clxyedekparca00001	SALINCAK SOL GETZ	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-20 07:37:54.324	2026-01-20 07:37:54.324	f	f
15353c7e-4dee-4dc2-ab8b-da505d6ff997	15010049	clxyedekparca00001	ÖN AMÖRTİSÖR SAĞ GETZ	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-20 07:38:27.996	2026-01-20 07:38:27.996	f	f
b1eda65e-05cc-4520-a341-0bccf035b64b	15010050	clxyedekparca00001	ÖN AMÖRTİSÖR SOL GETZ	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-20 07:38:53.347	2026-01-20 07:38:53.347	f	f
58ea2ec6-5fa8-4a5a-81c8-de7155845cb1	15010048	clxyedekparca00001	ARKA AMÖRTİSÖR SAĞ-SOL GETZ	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-20 07:39:33.838	2026-01-20 07:39:33.838	f	f
55b7d98c-d568-4bca-b809-3fbf2591810f	BH719	clxyedekparca00001	HAVA FİLTRESİ ASTRA J DİZEL	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	13272719	\N	A1-01-08	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:56:46.379	2026-02-03 05:38:48.97	f	f
df8c5a21-ac8b-4fed-9c54-f91e7e4db791	PH5793	clxyedekparca00001	AMPUL TEK DUY	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PHOTON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:55:34.524	2026-01-21 09:55:34.524	f	f
db50b129-6d23-481d-9dfb-e303b2290366	PH5727	clxyedekparca00001	AMPUL ÇİFT DUY	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PHOTON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:56:01.254	2026-01-21 09:56:01.254	f	f
3a5d3c9f-ac75-401b-afdd-2348e7072ba5	367730	clxyedekparca00001	DEVİRDAİM ASTRA H	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KALE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:59:00.339	2026-01-21 09:59:00.339	f	f
5ae6c502-9925-47e1-95eb-be56c45a8f19	BH717	clxyedekparca00001	HAVA FİLTRESİ ASTRA BENZİN	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	13272717	\N	A1-01-09	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:59:39.742	2026-02-03 05:39:10.087	f	f
d9259aa9-32c7-4d1c-a54c-d67307896439	6PK1090	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:08:44.905	2026-01-21 10:22:59.128	f	f
73af4c35-2c21-42eb-960d-49a5ad416e4d	1671102001	clxyedekparca00001	ÖN FREN BALATASI 207-307-ELYSEE	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	FROW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:17:36.786	2026-01-21 10:53:48.73	f	f
a607a8c0-646d-42d4-8e05-b76616642ec8	WA-6002	clxyedekparca00001	HAVA FİLTRESİ ASTRA H BENZİN	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	WOSS	\N	93192885	\N	A1-01-10	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:02:06.281	2026-02-03 05:39:45.125	f	f
f33e60ce-1ef6-4bf3-aa5f-da7b88f25277	STN9674725580	clxyedekparca00001	HAVA FİLTRESİ 2008	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	9674725580	\N	A1-01-11	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:02:51.772	2026-02-03 05:40:15.58	f	f
39521e5a-426b-43a5-8a84-ac2adf158311	STN1444.TK	clxyedekparca00001	HAVA FİLTRESİ 407	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1444.TK	\N	A1-01-13	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:04:03.384	2026-02-03 05:50:16.443	f	f
906977a5-923e-456e-8488-dd8959c4d5d3	BHVZ	clxyedekparca00001	HAVA FİLTRESİ 206-307	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	1444.VZ	\N	A1-01-14	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:04:34.087	2026-02-03 05:50:48.152	f	f
5ff2e5dc-b793-4f91-832e-284bca9f7298	STN1444.TJ	clxyedekparca00001	HAVA FİLTRESİ 206-207	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1444.TJ	\N	A1-01-16	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:00:13.969	2026-02-03 05:54:13.44	f	f
caf736c7-f3ca-4139-a210-195139a3de3c	STN9801366680	clxyedekparca00001	YAKIT FİLTRESİ 1.6 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	STN	\N	9801366680	\N	B1-01-15	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:06:01.081	2026-02-03 11:25:36.746	f	f
36fe0b8b-7419-431d-87d8-6d3ba255b666	STN1674213480	clxyedekparca00001	YAKIT FİLTRESİ 2.0 HDİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	STN	\N	1674213480	\N	B1-01-16	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:09:43.421	2026-02-03 11:26:02.849	f	f
5d281808-dc6a-4157-9f62-67b549b54b3a	STN13263262	clxyedekparca00001	YAKIT FİLTRESİ ASTRA J	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	STN	\N	13263262	\N	B1-01-17	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:09:04.711	2026-02-03 11:28:25.497	f	f
5f0e462b-b67d-48be-b9ee-9a1bc9543482	1609267180	clxyedekparca00001	ARKA KOLTUK ALT KLİPS 301	\N	Adet	0.00	0.00	20	0	\N	\N	\N	PSA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:47:38.334	2026-02-05 07:47:38.334	f	f
7475545a-93f5-4298-b3c1-6a8120c2c757	3182 998 603	clxyedekparca00001	DEBRİYAJ BİLYASI FOCUS 1.6	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	SACHS	\N	XS417A564EA	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-17 09:25:30.282	2026-02-12 09:26:21.197	f	f
944bdaeb-9133-493b-8c32-9e381d9f8b46	STN1109.A9	clxyedekparca00001	YAĞ FİLTRESİ ASTRA H-CORSA ATOM	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	STN	\N	1109.A9	\N	C1-02-04	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:08:42.296	2026-02-19 13:03:17.405	f	f
4b07b8b4-f73a-4357-9221-952f3a1361e9	STN1624797780	clxyedekparca00001	YAĞ FİLTRESİ 1.5 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	STN	\N	1624797780	\N	A1-04-04	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:53:31.072	2026-02-18 13:05:27.503	f	f
1cbeb981-361e-4316-a0de-3de01549c185	STN9192425	clxyedekparca00001	YAĞ FİLTRESİ ASTRA G-H BENZİN	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	\N	STN	\N	95526685	\N	C1-02-12	\N	\N	\N	\N	\N	\N	\N	2026-01-20 13:05:15.746	2026-02-19 13:06:22.559	f	f
683f3239-3561-4d3a-92f4-71d51047fde4	PH5717	clxyedekparca00001	AMPUL TEK DUY SARI	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-15	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:56:27.97	2026-02-19 13:08:44.701	f	f
ebf7c40e-665d-4d4d-9801-1d42f8ae71cc	PH5701	clxyedekparca00001	AMPUL PARK TEK DUY	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-16	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:54:27.249	2026-02-19 13:08:54.761	f	f
afa614c1-ea7f-43d6-8f51-8e7cfe170420	PH5724	clxyedekparca00001	AMPUL STOP DİPSİZ	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-16	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:54:05.072	2026-02-19 13:09:06.581	f	f
3513b793-6497-4dc4-b5b5-316f328b7367	PH5715	clxyedekparca00001	AMPUL KÜÇÜK DİPSİZ	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-16	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:53:38.464	2026-02-19 13:09:22.528	f	f
630bf4a3-0205-49f2-ac1f-90800eaeeaf3	5PK1210	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:07:20.658	2026-01-21 10:07:20.658	f	f
0c5ff615-dac6-49de-91f6-d63866d55b40	5PK1545	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:07:40.464	2026-01-21 10:07:40.464	f	f
40936006-bcd0-46a8-814f-8dd6d91a26a4	5PK875	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:07:56.667	2026-01-21 10:07:56.667	f	f
07b770a9-8fe6-428f-8872-6d339201f491	6PK1020	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:08:10.391	2026-01-21 10:08:10.391	f	f
105696c0-dc3d-4160-8fc3-897a55974cbc	6PK1050	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:08:30.143	2026-01-21 10:08:30.143	f	f
24d5d06b-429e-4181-b33b-d0ab6b037d16	6PK1320	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:09:00.183	2026-01-21 10:09:00.183	f	f
9083b4d4-f834-4e9b-b0ef-0321e63d212f	6PK1450	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:09:15.598	2026-01-21 10:09:15.598	f	f
63f246ed-be82-4656-98e1-c0bdc120892f	6PK1555	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:09:29.53	2026-01-21 10:09:29.53	f	f
561af7d5-83cd-45e0-9679-474662b496a2	6PK1895	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	\N	\N	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:09:45.707	2026-01-21 10:09:45.707	f	f
531a1c64-7f68-4770-a9e9-5bfc2c09131c	CB24765	clxyedekparca00001	BERLINGO PANELVAN/VAN, PLATFORM ŞASİ	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.571	2026-01-21 10:53:48.73	f	f
026634cf-ec05-4429-9a9e-2fe2dc6afc51	METRIX93347C	clxyedekparca00001	RENAULT KANGOO / NISSAN KUBISTAR /Van ÖN BALATA 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.809	2026-01-21 10:53:48.73	f	f
370263a1-8551-4433-a22c-74c7fafc7888	RH1001	clxyedekparca00001	FREN HİDROLİK YAĞI DOT-4 500 ML	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	ROADHOUSE	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.804	2026-01-21 10:53:48.73	f	f
4359422b-40b2-44fd-bbaa-e2ecf6343220	WBD1194	clxyedekparca00001	FREN DISKI ARKA DUZ 5 BJN 267,9X12X60X45,1 OPEL AS	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.795	2026-01-21 10:53:48.73	f	f
ad0f7ed1-2a42-4d66-a37d-22034f4967d6	WBD1178	clxyedekparca00001	FREN DISKI ON HAVALI 5 BJN 279,8X25X70X42 OPEL AST	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.791	2026-01-21 10:53:48.73	f	f
7241eb2f-9533-4078-a02f-2befd28c800d	RCR 74014	clxyedekparca00001	DİSK BALATA ARKA ASTRA J/ASTRA J GTC-ZAFIRA C-VOLT	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.786	2026-01-21 10:53:48.73	f	f
1e1055cb-e494-4124-b9a2-eb7f5815402e	RCR 74008	clxyedekparca00001	DİSK BALATA ÖN ALTI DÜZ OLAN TİP ASTRA J 16"JANT 0	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.78	2026-01-21 10:53:48.73	f	f
d8288fc9-9d1f-4a02-a8aa-0fcb4bfd5459	RCR 74406	clxyedekparca00001	DİSK BALATA ÖN HYBRID ARAÇLAR İÇİN RIFTER-BERLİNGO	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.813	2026-01-21 10:53:48.73	f	f
9084c176-a2c8-409a-84a5-eb82e224cbce	RCR 73665	clxyedekparca00001	DİSK BALATA ÖN ASTRA G 98>09/CALIBRA A 90>97/VECTR	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.768	2026-01-21 10:53:48.73	f	f
faca0f14-ee2f-477c-b076-2858c8f1a9e5	RCR 5770	clxyedekparca00001	FREN DİSKİ ARKA RIFTER (2018>...) 308 II (2013>...	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.761	2026-01-21 10:53:48.73	f	f
849e0525-fd23-447d-b155-127936ad6438	6PK975	clxyedekparca00001	V KAYIŞI	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:10:06.735	2026-01-21 12:04:34.32	f	f
6667c533-7051-45f1-8f21-0d822b15e977	RCR 73983	clxyedekparca00001	ÖN FREN BALATASI CAPTUR-CLİO-KANGOO	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-27 13:39:33.436	2026-01-27 13:39:33.436	f	f
2809fce5-420a-4f2a-a4cf-2fdc17929148	4PK1165	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:07:36.436	2026-01-22 14:07:36.489	f	f
f6083173-c991-435d-90e2-254725f9a5ee	17014006	clxyedekparca00001	ŞANZIMAN YAĞI 75W80	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:20:21.047	2026-01-21 13:01:30.238	f	f
95040091-05d0-4a7a-8849-25c207d73f35	STN029	clxyedekparca00001	MOTOR YAĞI 5W30 TOTAL HTC	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	TOTAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:16:57.479	2026-01-21 13:01:48.098	f	f
95bf9376-130a-4420-9122-29f8196e34ad	STN028	clxyedekparca00001	MOTOR YAĞI 0W16 ELF R-TECH	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:16:30.419	2026-01-21 13:01:51.733	f	f
a2035b61-5aa0-4c34-840a-9e63644c48f5	STN025	clxyedekparca00001	MOTOR YAĞI 5W30 ELF SXR	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:15:00.869	2026-01-21 13:02:03.813	f	f
8c6132d1-caeb-4ee2-a808-691ad4a747bc	STN017	clxyedekparca00001	MOTOR YAĞI 5W30 TEXACO ENERGY	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	TEXACO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:07:26.087	2026-01-21 13:02:42.441	f	f
eee51007-4697-492e-bba6-1deb068923c3	STN013	clxyedekparca00001	MOTOR YAĞI 5W30 ELF FULLTECH FE	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:51:28.852	2026-01-21 13:03:04.348	f	f
78ed3452-79f5-4534-b490-612a9c982f1b	STN012	clxyedekparca00001	ANTİFRİZ 3LT. KIRMIZI	\N	Adet	0.00	0.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	BENZOİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 10:46:27.25	2026-01-21 13:03:09.534	f	f
728892ca-627d-419e-bc88-a8bb8d9cdee3	STN008	clxyedekparca00001	MOTOR YAĞ KATKISI	\N	Adet	195.00	400.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	STN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 05:34:43.126	2026-01-22 05:34:43.225	f	f
3e21b37d-f04d-44ee-a0f6-8e9cf8cd2ee7	3PK753	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:09:02.502	2026-01-22 14:09:02.541	f	f
10b1c34e-d583-4113-8a76-f41497c3e57a	6PK1185	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 12:10:14.552	2026-01-22 12:10:14.627	f	f
00a889e9-e4ef-4894-919b-48a62f7e9928	6PK2115	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:06:09.644	2026-01-22 14:06:09.679	f	f
56a81647-df43-4241-b6cd-1b20e75433d9	23.129.02	clxyedekparca00001	YAĞ FİLTRESİ ASTRA H Z14XEP-Z16XEP	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	UFİ	\N	95509857	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 13:15:54.722	2026-01-26 13:15:54.722	f	f
6d85bcde-78c1-4ec2-a18d-4934d7905ab5	STN1444.VK	clxyedekparca00001	HAVA FİLTRESİ 307-308	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1444.VK	\N	A1-01-12	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:58:46.115	2026-02-03 05:49:40.583	f	f
4659612c-11ac-452d-9d85-32bbb1b985b7	STN1444.VQ	clxyedekparca00001	HAVA FİLTRESİ PARTNER	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1444.VQ	\N	A1-01-17	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:35:40.592	2026-02-03 10:35:40.592	f	f
43f0b337-b1b7-43cc-81b7-db6d18a47ff3	WA-9005	clxyedekparca00001	HAVA FİLTRESİ LEON-OCTAVİA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	WOSS	\N	5Q0129620B	\N	B1-01-03	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:40:43.427	2026-02-03 10:40:43.427	f	f
a393ba47-ed47-4035-b941-2fefd3113dfb	STN178010R030	clxyedekparca00001	HAVA FİLTRESİ COROLLA 1.4 D-4D	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	178010R030	\N	A1-01-06	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:42:04.734	2026-02-03 10:42:04.734	f	f
1f881e42-9654-4e09-bc6e-bf53b7c64763	STN51897086E	clxyedekparca00001	HAVA FİLTRESİ FİORİNO-BİPPER	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	51897086	\N	B1-01-09	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:07:16.54	2026-02-03 11:07:16.54	f	f
1d0a5188-ba70-4451-b294-96c61b46d3ab	1273	clxyedekparca00001	BLOK SU TAPASI 25MM	\N	Adet	0.00	0.00	20	0	\N	\N	\N	MTJ	\N	14328901	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:27:19.463	2026-02-12 11:27:19.463	f	f
a5f503bc-beec-469e-9869-8753c2964f2e	1654509380	clxyedekparca00001	BUJİ 1.2 PSA	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PSA	\N	1654509380	\N	A1-03-06	\N	\N	\N	\N	\N	\N	\N	2026-01-23 07:57:44.57	2026-02-16 08:02:35.238	f	f
bba3f68b-a9e4-41b2-90f8-70b5972fc040	K16PR-U11	clxyedekparca00001	BUJİ TOYOTA-HONDA-HYUNDAİ	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	DENSO	\N	9807956148	\N	A1-03-08	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:26:26.059	2026-02-16 09:28:37.111	f	f
d2521ac2-74fd-45ad-a923-faa3593ac757	RCR 5476	clxyedekparca00001	FREN DİSKİ ÖN ASTRA J 09> / AVEO T300 11> CRUZE J3	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.746	2026-01-21 10:53:48.73	f	f
cd43ac8e-797c-41c8-a3eb-542a8bce02a8	RCR 5385	clxyedekparca00001	FREN DİSKİ ÖN PUNTO EVO 09> / CORSA D 06> CORSA E 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.737	2026-01-21 10:53:48.73	f	f
a08944ca-da97-485c-b58a-9cac72245e46	RCR 5122	clxyedekparca00001	FREN DİSKİ ÖN 206 98> 207 06> 208 12> 301 12> 307 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.725	2026-01-21 10:53:48.73	f	f
b75c0db3-0450-4179-a347-25723adb9c62	METRIX93663A	clxyedekparca00001	PEUGEOT 2008 ARKA BALATA 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.718	2026-01-21 10:53:48.73	f	f
83a815af-9bf4-4dbe-9ea7-600a3d1cb429	METRIX93433B	clxyedekparca00001	VW GOLF III -CORRADO -GOLF III -PASSAT / CITROEN C	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.708	2026-01-21 10:53:48.73	f	f
ba27677c-9ee3-44b5-9e1f-1fcea222f762	METRIX93408A	clxyedekparca00001	OPEL ASTRA-J/CHEVROLET CRUZE /AVEO ÖN BALATA (META	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.701	2026-01-21 10:53:48.73	f	f
2ca07a16-f6f6-4747-89cb-e96c863c0519	RCR 73826/1	clxyedekparca00001	DİSK BALATA ÖN FİŞLİ KÜÇÜK TİP 257mm DİSK İÇİN  BI	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.775	2026-01-21 10:53:48.73	f	f
7f5e65a6-5de9-4494-a7c0-4db1ea213903	METRIX93360C	clxyedekparca00001	OPEL MERIVA -ZAFIRA-ASTRA ARKA BALATA 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.685	2026-01-21 10:53:48.73	f	f
16b83505-3727-4df2-b3e5-24bde3b75f84	METRIX93352A	clxyedekparca00001	OPEL ASTRA G / CHEVROLET CORSA ÖN BALATA (METAL İN	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.663	2026-01-21 10:53:48.73	f	f
9d587026-1594-42d7-b2fb-0de51f8e8ad5	KLB-2582717315	clxyedekparca00001	DİSK BALATA ARKA 290 mm DİSK İÇİN 3008 09>15/308 1	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	KALE BALATA	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.645	2026-01-21 10:53:48.73	f	f
15e2cb0e-b08a-47e2-aa7b-c895fc6cf5f5	KLB-2413716505	clxyedekparca00001	DİSK BALATA ARKA ÜSTTEN YAYLI FOCUS II 04>12/C-MAX	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	KALE BALATA	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.636	2026-01-21 10:53:48.73	f	f
6a1cd5fa-636c-4038-bb2b-66562d867d21	EDB2619	clxyedekparca00001	P.2008 II (U_)    1.2 PureTech 130, 1.5 BlueHDI 10	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.629	2026-01-21 10:53:48.73	f	f
14fc0179-09a4-4084-8a36-7b9bd2f86d6e	EDB2060	clxyedekparca00001	Rıfter    1.2 PureTech 110, 1.5 BlueHDI 75,100,130	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.62	2026-01-21 10:53:48.73	f	f
1a12448f-e380-45a7-bf26-f631a88d7316	EDB1715	clxyedekparca00001	P.5008     1.6 16V,1.6 HDI (09/2009-); Partner Tep	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.61	2026-01-21 10:53:48.73	f	f
ec17e46d-eac7-4d1f-971d-e4335c9652c2	METRIX93373A	clxyedekparca00001	FIAT DOBLO - ALBEA /FIAT PALIO ÖN BALATA 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	METRIX	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.693	2026-01-21 10:53:48.73	f	f
7eebd33f-9097-40ef-85ed-254911e75454	EDB1489	clxyedekparca00001	P.207   1.6 16V,1.6 16V Turbo,1.6HDi (02/2006-); 3	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	-	-	-	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.598	2026-01-21 10:53:48.73	f	f
9d63b6f4-eaac-4d19-8d3b-4e6fbd31d3ea	CB22397	clxyedekparca00001	EGEA 1.3D MULTI JET, 1.4, 1.6D MULTI JET, TİPO	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.663	2026-01-21 10:53:48.73	f	f
02f5bdcb-854e-4beb-88c1-d4efd7113e95	CB22449	clxyedekparca00001	EGEA SEDAN, FASTBACK, ESTATE 1.3D, 1.4, 1.6D	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.671	2026-01-21 10:53:48.73	f	f
8704d476-047b-4ee4-9a54-3b94e52815a4	CB22476	clxyedekparca00001	EGEA HATCHBACK, SEDAN, SW	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.68	2026-01-21 10:53:48.73	f	f
4c19a5a3-f64f-4d7b-b088-48a251614b45	CB22525	clxyedekparca00001	DACIA LOGAN MCV II, SANDERO II Büyük Tip (Düz sacl	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.707	2026-01-21 10:53:48.73	f	f
20433ae7-7b97-41c7-9781-62883b5f69ea	CB23131	clxyedekparca00001	A2, A3, A3 CABRIO, A3 SB	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.726	2026-01-21 10:53:48.73	f	f
e0b7804a-fa35-468c-be47-d8f75f71a50a	CB23587	clxyedekparca00001	A1, A3 II, TT II	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.731	2026-01-21 10:53:48.73	f	f
565de0ff-f725-44e2-96d2-81dc4c8a38b3	CB23914	clxyedekparca00001	A3, TT, TT ROADSTER	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.751	2026-01-21 10:53:48.73	f	f
7b92be79-44d8-4026-a39e-aa1ebd2db91a	CB23973	clxyedekparca00001	DOKKER, DOKKER EXPRESS, DUSTER PANELVAN/VAN,  LODG	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.848	2026-01-21 10:53:48.73	f	f
61572691-5eb2-4e06-8a38-76843eda2bf0	CB23982-1	clxyedekparca00001	DOBLO CARGO, 500, 500C, FİORİNO COMBİ VAN, GRANDE 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.854	2026-01-21 10:53:48.73	f	f
cf50e54e-d269-4112-b687-61f2c9938d9c	CB24563	clxyedekparca00001	A1, A1 SB, A3, A3 CABRIO, A3 SB	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.87	2026-01-21 10:53:48.73	f	f
664c7d7c-0fde-496c-aa4b-f888d652e4df	CB24820	clxyedekparca00001	FLUENCE, GRAND SCENIC III, MEGANE CC, MEGANE III, 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.878	2026-01-21 10:53:48.73	f	f
66bc0e2e-b98f-4f34-9eb0-2320a4dfa2ba	CB24914	clxyedekparca00001	DOKKER, DOKKER EXPRESS, DUSTER, DUSTER PANEL VAN, 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.896	2026-01-21 10:53:48.73	f	f
463c647a-28c0-48ec-a028-54b2d9878342	CB25728	clxyedekparca00001	LOGAN II, SANDERO II	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	CASTLE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:07.985	2026-01-21 10:53:48.73	f	f
f0897d6b-ca66-4221-859e-d8985dcc6977	EDB1509	clxyedekparca00001	Delta III (844)     1.4 16V, 1.6D Multijet (09/200	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	EUROBREAK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.027	2026-01-21 10:53:48.73	f	f
5e44fef2-2fc0-4cb3-b2c7-9d4784f479a0	RCR 73329	clxyedekparca00001	DİSK BALATA ÖN R12-TOROS 69>00/1300 83>04	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.043	2026-01-21 10:53:48.73	f	f
a4497d35-e1df-4a0d-bcf1-b9f3e2ff650b	RCR 73503	clxyedekparca00001	DİSK BALATA ÖN CLIO 90>05/MEGANE I 96>03/R19 88>95	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.048	2026-01-21 10:53:48.73	f	f
e90df772-6e73-4b36-ba1e-2d342ea050b0	RCR 73782	clxyedekparca00001	DİSK BALATA ÖN FİŞLİ BORA 98>05/CADDY 04>10/GOLF 9	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.052	2026-01-21 10:53:48.73	f	f
374ea922-d3b1-4948-86f0-8e2579fefd45	RCR 73904	clxyedekparca00001	DİSK BALATA ÖN CADDY 04>10/BEETLE 11>/GOLF 97>13/J	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.062	2026-01-21 10:53:48.73	f	f
0b616e46-3aaf-4944-830d-4524dfe95f22	RCR 73905	clxyedekparca00001	DİSK BALATA ARKA CADDY 04>10/BEETLE 11>/GOLF 97>13	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.066	2026-01-21 10:53:48.73	f	f
bcd2fb1e-6a83-4554-b0d3-9f38aad02f31	RCR 73964/1	clxyedekparca00001	DİSK BALATA ÖN CAPTUR 13>/FLUENCE 10>/MEGANE III 0	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.071	2026-01-21 10:53:48.73	f	f
43551ddc-ffde-4e26-bf56-bc6cc73638fc	RCR 74135	clxyedekparca00001	DİSK BALATA ARKA BEETLE-JETTA 11>/CADDY-ALTEA 04>1	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.077	2026-01-21 10:53:48.73	f	f
a6ade259-1ba5-47ab-aa5e-1b8ac3dfd5d5	RCR 74140	clxyedekparca00001	DİSK BALATA ÖN CLIO IV 12>/SYMBOL II-III 08>/LOGAN	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.082	2026-01-21 10:53:48.73	f	f
b5199231-96bc-4b1d-9b16-b55d7ecaca0e	RCR 74234	clxyedekparca00001	DİSK BALATA ÖN  EGEA 15>	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.087	2026-01-21 10:53:48.73	f	f
09f175a8-dfd5-45a9-88c6-77d3f670632d	RCR 5251	clxyedekparca00001	FREN DİSKİ ÖN 207 06> 307 00> 308 07> 1007 05> 200	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	RECOVER	\N	4246.W2	-	A1-01-07	\N	\N	\N	-	-	-	-	2025-12-18 20:58:27.732	2026-02-03 05:37:20.295	f	f
6d46e1b1-7905-4622-9972-5e71985d4dc4	RCR 74246	clxyedekparca00001	DİSK BALATA ARKA EGEA 15>	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.093	2026-01-21 10:53:48.73	f	f
5c2b7fd6-c67b-4b32-a049-28be610ac80a	RCR 74253	clxyedekparca00001	DİSK BALATA ÖN 155mm BÜYÜK TİP CLIO IV 12>/TWINGO 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.097	2026-01-21 10:53:48.73	f	f
d312299b-2d60-4c56-b2c4-77dbdd87da45	RCR 74280	clxyedekparca00001	DİSK BALATA ÖN UZUNLUK 129mm MEGANE IV 15>	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.102	2026-01-21 10:53:48.73	f	f
70028631-1147-42b7-9cfe-3dac0bad6647	RCR 74282	clxyedekparca00001	DİSK BALATA ÖN (kalınlık 17,90mm) KADJAR 15>/MEGAN	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.107	2026-01-21 10:53:48.73	f	f
9befe9e4-ea7d-4ceb-8068-83bf008bd21c	RCR 74287	clxyedekparca00001	DİSK BALATA ARKA ELEKTRİKLİ EL FRENLİ ARAÇLAR İÇİN	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.113	2026-01-21 10:53:48.73	f	f
58d053b5-66f0-45d6-9139-c7732b65abd3	RCR 74363	clxyedekparca00001	DİSK BALATA ÖN CLİO V 19>/1,0 SCE BENZİNLİ CLİO V 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.117	2026-01-21 10:53:48.73	f	f
915be74a-9751-4fdd-87c6-c51871aab214	RCR 74372	clxyedekparca00001	DİSK BALATA ARKA 268 mm Disk için 308 II 16>/5008 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.121	2026-01-21 10:53:48.73	f	f
e7ac691f-7590-4c01-8e1a-fcbe0694c1ef	RCR 74397	clxyedekparca00001	DİSK BALATA ÖN EGEA 21>/500E 21/EGEA CROS 21>	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.125	2026-01-21 10:53:48.73	f	f
60fe51dd-3077-43b3-b46a-50dad2fe164d	RCR 74423	clxyedekparca00001	FREN BALATASI ÖN CADDY V 21>/GOLF VIII 19>/LEON 19	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.135	2026-01-21 10:53:48.73	f	f
fb671bd2-53d9-415a-94ec-32588ec76310	RCR 74440	clxyedekparca00001	DİSK BALATA ARKA 272mm disk için 	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.144	2026-01-21 10:53:48.73	f	f
76386069-cbab-4e35-a886-3fea8aac5bcd	WDB582	clxyedekparca00001	FREN BALATA ON FISLI GOLF VII (5G1) 1.2 TSI 2012-/	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.149	2026-01-21 10:53:48.73	f	f
9fb44523-855f-495f-9f1a-e4e1f92fe912	WDB583	clxyedekparca00001	FREN BALATA ARKA GOLF VII 1.2 TSI 2012-/ TIGUAN 1.	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.161	2026-01-21 10:53:48.73	f	f
c3469619-68a0-4016-9a4f-f2a6fe99cf88	WDB631	clxyedekparca00001	FREN BALATA ON FISLI VW GOLF VII 2012-/ POLO 2017-	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	WALBURG	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.165	2026-01-21 10:53:48.73	f	f
401b76a8-979d-4242-bac3-fe5360ce23a9	ZEG1897-00	clxyedekparca00001	FREN BALATA ARKA 300mm DISK VW GOLF VIII - CADDY V	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	ZEGEN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.172	2026-01-21 10:53:48.73	f	f
2d3e9b8f-c1d7-435a-8cf6-e57c53fe92dc	RCR 74121/1	clxyedekparca00001	DİSK BALATA ÖN  305mm DİSK İÇİN ÇİFT FİŞLİ DOBLO 1	\N	Adet	0.00	0.00	20	0	\N	FREN GRUBU	\N	RECOVER	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-26 07:40:08.177	2026-01-21 10:53:48.73	f	f
4b6ec818-23bc-4d63-ab7a-59cbe531312b	ADH24290	clxyedekparca00001	ÖN FREN BALATASI ACCORD-CİVİC	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	BLUEPRİNT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:08:46.869	2026-01-21 10:53:48.73	f	f
6dcd0b96-2303-4e90-979d-fd1e771723ce	AB0107	clxyedekparca00001	ÖN FREN BALATASI ASTRA J	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	BRAXİS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:15:52.107	2026-01-21 10:53:48.73	f	f
d1c78ed4-848a-4e4e-826e-00d4b0e45edd	AB0100	clxyedekparca00001	ARKA FREN BALATASI ASTRA J	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	BRAXİS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-10 10:16:16.37	2026-01-21 10:53:48.73	f	f
0491bc33-f40e-4ee4-ab5b-8944a5506721	55564219	clxyedekparca00001	ISITMA BUJİSİ A13DTC-A13DTE	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	GM	\N	55564219	\N	A1-03-10	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:35:53.286	2026-02-16 09:31:53.299	f	f
33078d48-4cd1-4dbb-ab82-936a0e29c9a0	STN033	clxyedekparca00001	ŞANZIMAN YAĞI CVTF MOTUL	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOTUL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:22:15.633	2026-01-21 13:01:25.6	f	f
9a5fe81b-0148-4749-a3df-b4a8dcd659bf	STN026	clxyedekparca00001	MOTOR YAĞI 10W40 ELF MOLİGRAF	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	ELF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:15:27.548	2026-01-21 13:01:59.349	f	f
0753a8b4-1061-4f45-a558-8bb35464972c	STN018	clxyedekparca00001	MOTOR YAĞI 0W20 MOBİL SUPER 3000	\N	Adet	0.00	0.00	20	0	YAĞ GRUBU	YAĞ GRUBU	\N	MOBİL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:08:30.771	2026-01-21 13:02:37.991	f	f
84940dc0-70a2-4067-9639-eab609728fdb	STN009	clxyedekparca00001	PAS SÖKÜCÜ	\N	Adet	140.00	300.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	STN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 05:35:50.111	2026-01-22 05:35:50.183	f	f
869293f2-ccb1-4543-8cf9-121d74af2155	6PK1345	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:06:28.173	2026-01-22 14:06:28.215	f	f
22640228-a849-47f5-8693-9c61154462bc	6PK1190	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:03:25.579	2026-01-22 14:03:25.653	f	f
5c9e8f37-7d07-416a-88ca-ad6b25d12b7d	BH340	clxyedekparca00001	HAVA FİLTRESİ PUNTO-BRAVO	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	BRN	\N	51775340	\N	B1-01-04	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:31:15.38	2026-02-03 10:31:15.38	f	f
55c9cdce-0b43-4bc2-bea0-faddf082c1d5	6PK1059	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:04:58.876	2026-01-22 14:05:27.587	f	f
bc961598-a494-4e6a-beda-76274178bc4a	4PK1150	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:07:55.525	2026-01-22 14:07:55.563	f	f
6d84094c-7ac8-4765-8110-f5b87516c4ef	STN1444.VJ	clxyedekparca00001	HAVA FİLTRESİ PARTNER	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1444.VJ	\N	A1-01-18	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:36:39.105	2026-02-03 10:36:39.105	f	f
79ce4e58-d14f-4083-b2db-cd2c509c68be	4PK923	clxyedekparca00001	V KAYIŞI	\N	Adet	100.00	300.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	BANDO	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-22 14:09:27.029	2026-01-22 14:09:27.068	f	f
070c78a4-26c5-4338-bece-4877b60c2a26	14020084	clxyedekparca00001	ARKA TEKER BİLYASI RENAULT-DACİA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 07:53:34.081	2026-01-26 07:53:34.081	f	f
008d1d75-886a-48b5-a45b-8aca7d991932	06010007	clxyedekparca00001	HAVA FİLTRESİ ASTRA H	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	KRAFTVOLL	\N	93192885	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-26 13:14:03.072	2026-01-26 13:14:03.072	f	f
d1bc74ce-bcb1-4612-973a-822d5eb87e13	STN1780121050	clxyedekparca00001	HAVA FİLTRESİ AURİS-COROLLA 1.6	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	1780121050	\N	A1-01-06	\N	\N	\N	\N	\N	\N	\N	2026-02-03 10:42:57.124	2026-02-03 10:42:57.124	f	f
976f6ba3-fe0f-4ebe-bcf8-b0705c8c1590	STN165468296R	clxyedekparca00001	HAVA FİLTRESİ MEGANE IV	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	165468296R	\N	B1-01-11	\N	\N	\N	\N	\N	\N	\N	2026-02-03 11:20:41.882	2026-02-03 11:20:41.882	f	f
5f00d96f-b470-451c-9bef-513c2885cb8e	STN9820226380	clxyedekparca00001	YAKIT FİLTRESİ 1.5 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	STN	\N	9820226380	\N	B1-01-14	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:51:43.881	2026-02-03 11:25:13.71	f	f
b99484b6-f666-4608-be1d-1548b70409df	TGC4975	clxyedekparca00001	YAĞ FİLTRESİ ASTRA J - İNSİGNİA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	95526687	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:01:32.271	2026-02-04 07:01:32.271	f	f
66caa2bc-06c3-4272-b583-a997744878c6	TGC4085	clxyedekparca00001	YAĞ FİLTRESİ MİNİ COOPER - FOCUS - ELYSEE	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	GENERAL	\N	1109.AY	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 07:14:13.683	2026-02-04 07:14:13.683	f	f
a8f3ecfc-948a-4a20-b10e-e63d8f7bf2c5	VKMC03319	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.5 HDİ-TDCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SKF	\N	1638159680	\N	A1-02-01	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:13:03.373	2026-02-12 10:10:36.593	f	f
b9ef0cdc-0b7d-4913-98c3-f08cb973b391	9812133880	clxyedekparca00001	VAKUM POMPASI 1.2 PSA	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	PSA	\N	9812133880	\N	A1-03-03	\N	\N	\N	\N	\N	\N	\N	2026-01-29 05:54:42.874	2026-02-16 07:59:48.061	f	f
4018c936-deff-474f-a4dc-bee6bd0b1498	0242135529	clxyedekparca00001	BUJİ 1.33-1.6 TOYOTA	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	9091901253	\N	A1-03-07	\N	\N	\N	\N	\N	\N	\N	2026-01-21 12:27:47.448	2026-02-16 08:03:31.026	f	f
694bbe25-2ec0-4e4c-887f-c32b37f0beeb	13020152	clxyedekparca00001	ROTBAŞI SAĞ-SOL BERLİNGO	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	3817.10	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:10:43.903	2026-02-04 11:10:43.903	f	f
b0f25455-7deb-4e68-b004-8b54b7fdd2d0	06020021	clxyedekparca00001	YAĞ FİLTRESİ CLİO (KÜÇÜK)	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	KRAFTVOLL	\N	7700768913	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 11:18:43.941	2026-02-04 11:18:43.941	f	f
1569bfc9-fc44-40c4-8f38-99ebe9434284	06040003	clxyedekparca00001	POLEN FİLTRESİ CLİO II	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	KRAFTVOLL	\N	7700424098	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:12:10.982	2026-02-04 14:12:10.982	f	f
82954b03-1b54-4287-9f86-3ac85168279b	SH1511	clxyedekparca00001	HAVA FİLTRESİ CLİO II	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SİON	\N	7701042841	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:12:40.536	2026-02-04 14:12:50.629	f	f
4c1f9e58-ae36-4450-812e-39de8a07c684	32336121	clxyedekparca00001	ÖN AMÖRTİSÖR SAĞ GAZLI COROLLA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	GSP	\N	4851009R60	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:34:21.875	2026-02-04 14:34:21.875	f	f
f4462d6b-9686-447c-9310-9c9012b3d20d	32336122	clxyedekparca00001	ÖN AMÖRTİSÖR SOL GAZLI COROLLA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	GSP	\N	4851080457	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:35:03.316	2026-02-04 14:35:03.316	f	f
d7887add-f677-414d-97b4-f90faa29e648	TY01AA-105AL	clxyedekparca00001	ÖN ÇAMURLUK DAVLUMBAZI SOL AURİS	\N	Adet	0.00	0.00	20	0	\N	\N	\N	TAİWAN	\N	5837602220	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:38:48.644	2026-02-04 14:38:48.644	f	f
ca8c911b-e1c8-4a20-8212-5f8fc929b72a	HTR.251012	clxyedekparca00001	TERMOSTAT CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	HELLUX	\N	55206391	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 15:03:47.132	2026-02-04 15:03:47.132	f	f
b4237b54-7d54-4e1e-8fbf-efe2edf9171d	355780	clxyedekparca00001	YAĞ SOĞUTUCU KOMPLE CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KALE	\N	55213469	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 15:05:27.69	2026-02-04 15:05:27.69	f	f
7587710e-9c19-4911-bf83-def195b942d9	F026407183	clxyedekparca00001	YAĞ FİLTRESİ GOLF V-VI	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	BOSCH	\N	03C115561D	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 15:08:34.712	2026-02-04 15:08:34.712	f	f
1e356282-dd07-4f5a-879d-0f8568734952	06010015	clxyedekparca00001	HAVA FİLTRESİ GOLF-PASSAT-CADY	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	KRAFTVOLL	\N	1F0129620	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-04 15:09:13.78	2026-02-04 15:09:13.78	f	f
b6f21c2b-6225-4ebc-8387-557f81d0b08b	SF6158	clxyedekparca00001	YAKIT FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAKIT FİLTRESİ	SARDES	\N	1332851590	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:35:54.573	2026-02-05 07:35:54.573	f	f
1610b0fb-c0fe-420d-b8cb-ea32a03c80f0	KR480	clxyedekparca00001	KOLTUK AYAR KOLU SAĞ MEGANE IV	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KAYAPLASTİK	\N	874016692R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:38:27.597	2026-02-05 07:38:27.597	f	f
667aab2b-caa4-4826-b3e8-533ace431f90	KR479	clxyedekparca00001	KOLTUK AYAR KOLU SOL MEGANE IV	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KAYAPLASTİK	\N	874519982R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:39:33.66	2026-02-05 07:39:33.66	f	f
d494e5ec-be68-409d-a50d-227e1d0df98d	9503600007	clxyedekparca00001	RADYATÖR TEMİZLEYİCİ	\N	Adet	0.00	0.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	FROW	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:40:07.25	2026-02-05 07:40:07.25	f	f
e86c9805-eeda-4ceb-85c1-3d574e3b74c5	BRZ1608	clxyedekparca00001	SU RADYATÖRÜ ELANTRA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	WİSCO	\N	25310AA000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 10:00:02.914	2026-02-05 10:00:02.914	f	f
c7158d69-5a0b-4a02-a011-ae9eb32e9559	089032302810	clxyedekparca00001	SIVI CONTA SİYAH 70ML	\N	Adet	0.00	0.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	WÜRTH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 10:54:53.351	2026-02-05 10:54:53.351	f	f
4050e934-95b0-4db4-8958-3b2781c9843b	0893139216028	clxyedekparca00001	ARAÇ KOKUSU KAVUN	\N	Adet	0.00	0.00	20	0	SIVI GRUBU	SIVI GRUBU	\N	WÜRTH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 10:55:30.375	2026-02-05 10:55:30.375	f	f
6ca64f2d-c84b-43a9-a5bd-9ae996a7a91e	1682303080	clxyedekparca00001	DEBRİYAJ SETİ RULMANLI COROLLA	\N	Adet	0.00	0.00	20	0	\N	\N	\N	EUROREPAR	\N	04130YZZAJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:53:46.657	2026-02-06 05:44:06.413	f	f
fac371ee-4670-4c55-a6af-1995c5297bab	GK3525	clxyedekparca00001	ARKA TEKER RULMANI NİSSAN-RENAULT-CİTROEN	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	GSP	\N	3748.77	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-06 07:59:02.548	2026-02-06 07:59:02.548	f	f
19ea1cc4-ae86-4d1d-87c0-d1c2a2760d74	1638028080	clxyedekparca00001	HAVA FİLTRESİ 1.2 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	EUROREPAR	\N	9805552080	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-06 08:02:01.679	2026-02-06 08:02:01.679	f	f
c441f074-9714-468e-93bf-3e653eff4524	S2725B21	clxyedekparca00001	ÖN SİLECEK LASTİĞİ ASTRA J-K	\N	Adet	0.00	0.00	20	0	SİLECEK GRUBU	SİLECEK GRUBU	\N	MARTIGUES	\N	95508195	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 07:07:36.974	2026-02-11 07:07:36.974	f	f
7abfbd0e-c9e4-4501-aa75-c59be64cd0d5	60109469	clxyedekparca00001	YAĞ SOĞUTUCU KANGOO-CLİO 1.5 DCİ K9K	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SWAG	\N	8200068115	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 07:53:00.48	2026-02-11 07:53:00.48	f	f
d390a057-d84b-4a11-9031-073e3de7955a	71745047	clxyedekparca00001	ÖN TEKER RULMANI DOBLO	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	BRUCKE	\N	71745047	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 07:55:36.758	2026-02-11 07:55:36.758	f	f
500f0a32-83ff-470b-b0fb-44365269b5c8	SA2019	clxyedekparca00001	HAVA FİLTRESİ ACCENT	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SARDES	\N	2811322301	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:19:44.332	2026-02-11 09:19:44.332	f	f
c69a6141-7839-4f8f-925e-51a1ff0c0c66	SC584	clxyedekparca00001	POLEN FİLTRESİ ACCENT	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	SARDES	\N	9761725000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:20:29.303	2026-02-11 09:20:29.303	f	f
3f70b0a5-3f9a-410b-98bb-9af6e97ce85b	1682274380	clxyedekparca00001	YAĞ FİLTRESİ ACCENT	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	EUROREPAR	\N	15208KA010	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:21:12.144	2026-02-11 09:21:12.144	f	f
db7262e7-7f97-4766-886e-9a78bf39705c	40491	clxyedekparca00001	TURBO  QASHQAİ - MEGANE III 1.5 DCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	GUATURBO	\N	144117462R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:24:36.069	2026-02-11 09:24:36.069	f	f
e8564a36-6b84-4a98-93c8-e78ba2d096bd	9815106780	clxyedekparca00001	POLEN FİLTRESİ CROSSLAND	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	PSA	\N	9815106780	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-06 08:02:24.9	2026-02-12 09:30:37.574	f	f
befa4db7-76e1-4e25-b775-e5134a7aaad0	1109.AL	clxyedekparca00001	YAĞ FİLTRESİ 1.2 PSA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	PSA	\N	1109.AL	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-06 05:39:41.656	2026-02-12 09:30:46.284	f	f
b59aa2ce-7049-4e9e-b735-2a52c901c1a6	TKN-CI-210	clxyedekparca00001	Z-ROT SOL-SAĞ ÖN PEUGEOT PARTNER 1.9 D 1996	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	5087.34	\N	B1-04-24	\N	\N	\N	\N	\N	\N	\N	2026-02-10 10:24:55.599	2026-02-19 11:23:13.71	f	f
de03694c-358c-4793-bac2-b876476ea2d0	06040061	clxyedekparca00001	POLEN FİLTRESİ CLİO IV KARBONLU	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	272773151R	\N	C1-01-01	\N	\N	\N	\N	\N	\N	\N	2026-02-04 14:58:07.321	2026-02-12 09:55:33.689	f	f
10dab7a8-1a95-40bd-b523-136380a462d5	10010266	clxyedekparca00001	MOTOR KULAĞI SAĞ ASTRA H	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KRAFTVOLL	\N	13125637	\N	A1-02-05	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:58:33.309	2026-02-12 10:12:04.88	f	f
46aba001-3916-4498-872b-d43e43d587b9	82037092	clxyedekparca00001	ARKA KRANK KEÇESİ ASTRA J B16DTH	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	CORTECO	\N	55571582	\N	A1-03-16	\N	\N	\N	\N	\N	\N	\N	2026-02-05 07:46:59.676	2026-02-16 09:38:52.791	f	f
7f69153f-992a-49d4-ba61-8c64f69f0b70	1682298280	clxyedekparca00001	DEBRİYAJ SETİ RULMANLI 1.4-1.6 8V-16V	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	EUROREPAR	\N	1682298280	\N	A1-04-08	\N	\N	\N	\N	\N	\N	\N	2026-02-06 05:14:36.729	2026-02-18 13:07:00.083	f	f
61b32b7c-d3ae-426a-a8c6-78a7578f3e51	TKN-CI-214	clxyedekparca00001	ROT MİLİ SOL-SAĞ PEUGEOT PARTNER 1.9 1996	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.C0	\N	B1-04-25	\N	\N	\N	\N	\N	\N	\N	2026-02-10 10:26:14.954	2026-02-19 11:23:42.68	f	f
5f0b3771-26f2-4905-bae6-85d77b9a5ec6	RL150	clxyedekparca00001	MİNİ ŞEFFAF RÖLE 12V 5P 40A	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	ÜSTÜN	\N	\N	\N	C1-02-03	\N	\N	\N	\N	\N	\N	\N	2026-02-05 05:52:43.897	2026-02-19 13:02:35.847	f	f
e9751b2a-071e-46ac-bc6f-6bcc5c2a6e29	586519	clxyedekparca00001	YAĞ FİLTRESİ CORSA D	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	VALEO	\N	9192425	\N	C1-02-06	\N	\N	\N	\N	\N	\N	\N	2026-02-11 07:48:54.819	2026-02-19 13:04:18.485	f	f
3f15dfee-cfd3-4307-a1df-c9cc5beb40de	SA516/2	clxyedekparca00001	HAVA FİLTRESİ CORSA D	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SARDES	\N	93188723	\N	C1-02-08	\N	\N	\N	\N	\N	\N	\N	2026-02-11 07:47:47.224	2026-02-19 13:04:53.945	f	f
9fc2242b-2719-4bf3-8363-f5309001394f	K015578XS	clxyedekparca00001	TRİGER SETİ (123 DİŞ) RENAULT - NİSSAN	\N	Adet	0.00	0.00	20	0	KAYIŞ GRUBU	KAYIŞ GRUBU	\N	GATES	\N	7701477028	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:30:28.456	2026-02-11 09:30:28.456	f	f
7d8077c4-da82-47a7-a7d0-c25eba803b25	1682292780	clxyedekparca00001	DEBRİYAJ SETİ RULMANLI ASX 1.6	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	EUROREPAR	\N	1607587980	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:32:44.009	2026-02-11 09:32:44.009	f	f
897aae4d-55b6-4921-8d25-c42dd6b82be7	622323609	clxyedekparca00001	DEBRİYAJ SETİ RULMANSIZ CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	LUK	\N	95518821	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:50:46.844	2026-02-11 09:50:46.844	f	f
c02c5ee2-d1be-4ae5-b7df-77d26be2c244	14020078	clxyedekparca00001	ARKA TEKER RULMANI 208-301-ELYSEE	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	3748.A1	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 06:02:37.05	2026-02-12 06:02:37.05	f	f
4033f9cf-dd09-47dc-ab09-ef169e2c11cc	HY4066	clxyedekparca00001	Z ROT ÖN SAĞ-SOL İ20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	RIW	\N	54830C8000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 06:04:42.896	2026-02-12 06:04:42.896	f	f
acb90037-dc49-4d00-9bdb-5e201b87e61b	10011690	clxyedekparca00001	ÖN AMÖRTİSÖR TAKOZU RULMANLI ACCENT BLUE - PİCANTO	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	5461107000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 06:08:24.023	2026-02-12 06:08:24.023	f	f
88c2c8c2-f1bf-4721-87cd-479024478cc4	13050566	clxyedekparca00001	ALT TABLA SOL İ20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	54500C8000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:07:47.609	2026-02-12 07:07:47.609	f	f
87b7ac7e-0fdb-41e9-a8a1-0d620aa3ba7b	13050567	clxyedekparca00001	ALT TABLA SAĞ İ20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	KRAFTVOLL	\N	54501C8000	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:08:32.952	2026-02-12 07:08:32.952	f	f
35475fbb-e1d8-4fd8-ad28-bd1e42e8d304	XGB44001S01	clxyedekparca00001	ÖN TEKER RULMANI PEUGEOT-CİTROEN	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	SNR	\N	3350.86	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:12:42.669	2026-02-12 07:12:42.669	f	f
a63c9f6f-2501-4b94-8135-530556ed3322	WP0449	clxyedekparca00001	DEVİRDAİM DUSTER-LOGAN-SANDERO	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	LPR	\N	1741084A11	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:14:40.111	2026-02-12 07:14:40.111	f	f
592f367c-0b18-454a-8ef0-8e863e86c613	07080029	clxyedekparca00001	ÖN FREN HORTUMU SAĞ-SOL 301	\N	Adet	0.00	0.00	20	0	FREN GRUBU	FREN GRUBU	\N	KRAFTVOLL	\N	9678175780	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:16:25.71	2026-02-12 07:16:25.71	f	f
bcc20bd8-4c64-4912-aad3-fbdec97bb56d	208318001	clxyedekparca00001	TERMOSTAT GÖVDESİ ASTRA H-J	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	TOPRAN	\N	25192230	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:18:47.941	2026-02-12 07:18:47.941	f	f
dccb985b-cbf8-45a5-90ee-3fa62d360f73	8200110038G	clxyedekparca00001	DEVİRDAİM BORUSU MEGANE II 1.5 DCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	BRUCKE	\N	8200110038	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 07:20:30.562	2026-02-12 07:20:30.562	f	f
4ca32989-637b-413e-8464-c70eeacf2798	3000 951 024	clxyedekparca00001	DEBRİYAJ SETİ (RULMANSIZ) FOCUS 1.6	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	SACHS	\N	3M517540A1K	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-17 09:26:19.667	2026-02-12 09:25:53.627	f	f
683958d9-6c77-4716-884a-63f720f799b1	6040432	clxyedekparca00001	POLEN FİLTRESİ FOCUS-KUGA-MONDEO 2.0 ECOBLUE	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	JX6A18D483	-	-	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.438	2026-02-12 09:28:35.044	f	f
28f50698-6ffa-489b-af0d-ed3d969c47e1	STN87139YZZ33	clxyedekparca00001	POLEN FİLTRESİ COROLLA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	87139YZZ33	\N	C1-01-10	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:54:01.184	2026-02-12 10:00:13.379	f	f
f743645f-2ae9-4864-bbcf-b2189d099fe8	STN95527473	clxyedekparca00001	POLEN FİLTRESİ ASTRA J - İNSİGNİA	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	95527473	\N	C1-01-11	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:48:23.529	2026-02-12 10:00:35.808	f	f
4f44ad6a-0d99-4c18-8826-313f543a7300	STN272774812R	clxyedekparca00001	POLEN FİLTRESİ KADJAR - QASHQAİ	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	272774812R	\N	C1-01-12	\N	\N	\N	\N	\N	\N	\N	2026-02-04 06:52:59.679	2026-02-12 10:01:15.136	f	f
607a89ec-c12d-498c-8900-5fcbc0f9ceb6	STN8V5118D543AA	clxyedekparca00001	POLEN FİLTRESİ FİESTA VI	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	STN	\N	8V5118D543	\N	C1-01-14	\N	\N	\N	\N	\N	\N	\N	2026-02-12 10:07:07.184	2026-02-12 10:07:07.184	f	f
daddb524-bfd1-4c3a-bac4-7a762348f2c8	STN9678792080	clxyedekparca00001	POLEN FİLTRESİ 301-ELYSEE	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	9678792080	\N	C1-01-09	\N	\N	\N	\N	\N	\N	\N	2026-02-12 10:07:47.055	2026-02-12 10:07:47.055	f	f
a0e84829-720d-4aa5-b23e-e4c1c19a6fec	2105.35	clxyedekparca00001	ŞANZIMAN KILAVUZU PEUGEOT-CİTROEN	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	PSA	\N	2105.35	-	A1-01-04	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.342	2026-02-12 10:09:41.481	f	f
fc9df4d8-bc49-4336-9a96-ff109337eab2	08010200	clxyedekparca00001	DEVİRDAİM A14NET-A14XER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KRAFTVOLL	\N	25193406	\N	A1-02-04	\N	\N	\N	\N	\N	\N	\N	2026-01-23 08:43:06.502	2026-02-12 10:11:47.928	f	f
26c7f88f-3f2f-49ba-983b-73a06fded6c1	442	clxyedekparca00001	GENLEŞME KABI CLİO III	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KAYA	\N	7701477290	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 10:19:31.976	2026-02-12 10:19:31.976	f	f
b9c851b3-a4ac-48fa-9b0a-41bbe8eb448c	T382000	clxyedekparca00001	TAKIM CONTA CLİO-MEGANE-KANGOO 1.5 K9K	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	ROYAL	\N	7701473371	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 10:21:03.241	2026-02-12 10:21:03.241	f	f
36595002-482b-4835-9f28-ec4c96336b95	TH7125.83J	clxyedekparca00001	TERMOSTAT RENAULT-DACİA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	VERNET	\N	110605536R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 10:22:54.42	2026-02-12 10:22:54.42	f	f
113d0d8d-5198-4415-b81c-5c812ed4e435	B20338	clxyedekparca00001	YAĞLAMA MEMESİ NEMO-BİPPER	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	BETTO	\N	1165.28	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:26:29.052	2026-02-12 11:26:29.052	f	f
747041af-5928-4134-b6dd-68c2c6081b29	KB4044L	clxyedekparca00001	PİSTON KOL BURCU CORSA A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	ŞAHİN	\N	55204564	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:30:28.478	2026-02-12 11:30:28.478	f	f
a74ed47b-1bae-43b5-8ed5-a5d80fb8b10d	42427503	clxyedekparca00001	ÜST TAKIM CONTA CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	OTO CONTA	\N	93195356	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:37:07.064	2026-02-12 11:37:07.064	f	f
30371764-9531-4d61-9636-4cdc385d9a6f	180035000700	clxyedekparca00001	ANA YATAK CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	NE	\N	71732989	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:29:08.888	2026-02-12 11:37:12.877	f	f
88f6dd1f-ac78-4c16-b59c-5c95b6b8b537	181035001000	clxyedekparca00001	KOL YATAK CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	NE	\N	71732996	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:29:42.411	2026-02-12 11:37:17.911	f	f
fd453aeb-ee50-4ba6-8839-a9c96d45e33d	WP900442	clxyedekparca00001	DEVİRDAİM CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	GSP	\N	93193591	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:35:19.156	2026-02-12 11:37:39.319	f	f
4f879a28-5567-48cf-9885-e8be3ef8c025	55177460EY	clxyedekparca00001	EKSANTRİK ZİNCİR SETİ CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	OPAR	\N	93191273	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:39:00.96	2026-02-12 11:39:00.96	f	f
14a09ecf-2c5d-4579-a891-371719a24a36	TV-40500-40501	clxyedekparca00001	SUBAP TAKIM (EMME/EGSOZ) CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SUPSAN	\N	55219966	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:39:54.905	2026-02-12 11:39:54.905	f	f
92870c73-cab6-467e-a7ba-792b4f279546	8EH188704171	clxyedekparca00001	BUJİ KARBÜRATÖRLÜ	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	HELLA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-12 14:42:34.217	2026-02-12 14:42:34.217	f	f
1863e171-b0ef-4479-a0b2-2f08b1142281	1987302801	clxyedekparca00001	H1 AMPUL	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	\N	\N	C1-02-13	\N	\N	\N	\N	\N	\N	\N	2026-02-12 14:41:20.437	2026-02-19 13:07:20.227	f	f
94f56110-d856-4777-aae6-5af0285ab173	10034580	clxyedekparca00001	TURBO ÇIKIŞ HORTUMU İNSİGNİA-ASTRA J B16DTH	\N	Adet	0.00	0.00	20	0	\N	\N	\N	KRAFTVOLL	\N	13419441	-	A1-02-12	\N	\N	\N	-	-	-	-	2025-12-24 13:15:40.16	2026-02-13 06:19:44.637	f	f
492e3d84-3803-4117-8382-3defc2b33e8c	12010146	clxyedekparca00001	YAĞ POMPA CONTASI 1.3 MJET	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	KRAFTVOLL	\N	55186663	\N	A1-02-07	\N	\N	\N	\N	\N	\N	\N	2026-02-12 11:36:14.941	2026-02-13 06:22:04.509	f	f
75c4d717-f012-4e8f-a426-7ab1b2501f24	1987302814	clxyedekparca00001	AMPUL ÇİFT DUY	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	\N	\N	C1-02-14	\N	\N	\N	\N	\N	\N	\N	2026-02-12 14:41:44.842	2026-02-19 13:07:39.752	f	f
db7218ee-f345-443b-b5b4-3a15394ac27e	TKN-DC-348	clxyedekparca00001	SALINCAK SAG ON ALT ROTILLI BURCLU SAC DACIA DUSTE	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	545040280R	\N	A1-02-13	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.477	2026-02-13 06:23:00.449	f	f
4ab8ae6f-2bbf-46af-869d-dbf368246980	TKN-CH-333	clxyedekparca00001	ROTMILI SOL-SAG OPEL INSIGNIA 2.0 CDTI 2008-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	13332651	\N	B1-02-01	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.778	2026-02-13 06:54:09.249	f	f
e586c5e1-309f-4ffd-b8d8-c1ae79c14f44	TKN-F-615K	clxyedekparca00001	ROTIL KITI ON FIAT ALBEA 1996-2013 / FIAT DOBLO 20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	46779293	\N	B1-02-05	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.494	2026-02-13 06:57:16.353	f	f
accfe98c-346c-4900-8d9a-cf567da6c324	TKN-F-451	clxyedekparca00001	ROT BASI ON FIAT PUNTO 1994-2009 / FIAT BARCHETTA	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	7752285	\N	B1-02-14	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.562	2026-02-13 07:08:41.614	f	f
6a123faf-3a94-467f-88b8-c1151c375685	TKN-DC-353	clxyedekparca00001	ROT MILI SOL-SAG ON DACIA DUSTER (HM_) DCI 2017-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	485213285R	\N	B1-02-22	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.472	2026-02-13 07:13:30.526	f	f
6df6ee1b-cf84-45fb-8988-d3189073c7a5	0242225580	clxyedekparca00001	BUJİ A16XER	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	BOSCH	\N	25193473	\N	A1-03-07	\N	\N	\N	\N	\N	\N	\N	2026-02-16 09:31:14.413	2026-02-16 09:31:14.413	f	f
e87903d9-b116-4c34-af7c-ebbb99fd0666	0280142486	clxyedekparca00001	YAKIT BUHARLAŞMA VALFİ ASTRA J - CORSA D	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	BOSCH	\N	55566514	\N	A1-03-12	\N	\N	\N	\N	\N	\N	\N	2026-02-16 09:34:10.87	2026-02-16 09:34:10.87	f	f
3de93528-abd0-4183-b5e1-5287d08121fa	05060196	clxyedekparca00001	MAP SENSÖRÜ ASTRA J - CORSA D	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	KRAFTVOLL	\N	55568175	\N	A1-03-14	\N	\N	\N	\N	\N	\N	\N	2026-02-16 09:35:34.286	2026-02-16 09:35:34.286	f	f
ae25e511-13d9-4deb-9931-15140a6ba40d	R66138	clxyedekparca00001	GENLEŞME KABI KAPAĞI ASTRA J	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	RAPRO	\N	13502353	-	A1-03-15	\N	\N	\N	-	-	-	-	2025-12-24 11:43:55.396	2026-02-16 09:36:03.805	f	f
4059133c-7f54-4ed2-8687-bec64b211e2d	TKN-O-477	clxyedekparca00001	SALINCAK ON SOL ALT ROTILLI SAC FIAT CROMA 2005-20	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	51748653	\N	A1-03-22	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.556	2026-02-16 10:22:05.273	f	f
bec4b643-730e-4c3c-94f8-4f1e099b110e	TKN-O-443	clxyedekparca00001	ROTMILI SOL-SAG OPEL VECTRA B 1.6i 1995-2003	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1603199	\N	B1-03-10	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.697	2026-02-17 07:10:23.581	f	f
1cb7560f-7df1-423c-80c1-dff1ce1f9e39	TKN-O-436A	clxyedekparca00001	Z-ROT ON SOL OPEL MOKKA 2012- / CHEVROLET TRAX 201	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	15779961	\N	B1-03-14	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.819	2026-02-17 07:27:05.157	f	f
dbad5926-e315-4d01-b4fe-dc558f119b97	WP0787	clxyedekparca00001	DEVİRDAİM POMPASI JUKE - QASHQAİ	\N	Adet	1058.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	LPR	\N	210107852R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 08:54:05.14	2026-02-17 08:54:05.26	f	f
2d5f2164-3f2c-4e6b-a488-4df2d589239c	262	clxyedekparca00001	GENLEŞME KABI KAPAĞI FİESTA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SPK	\N	3M5H8100AD	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 10:54:20.172	2026-02-17 10:54:20.172	f	f
2b08a9fa-72c7-4137-9579-778a0e504eda	A092	clxyedekparca00001	CAM AÇMA DÜĞMESİ DÖRTLÜ SOL ÖN FOCUS	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	ROCKSWELL	\N	3M5T14A132AG	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 10:58:13.398	2026-02-17 10:58:13.398	f	f
e2c7afd3-89b7-46fc-bed4-84ca354efcaf	OP575	clxyedekparca00001	YAĞ FİLTRESİ CİVİC	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	FİLTRON	\N	15400-RBA-F01	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:09:04.539	2026-02-17 11:09:04.539	f	f
3b5285b0-9f9c-4e59-9b18-6cc747fbf8f2	SC778	clxyedekparca00001	HAVA FİLTRESİ CİVİC	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SARDES	\N	80291TF0E01	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:09:38.989	2026-02-17 11:09:38.989	f	f
d9260889-4f94-4e97-8273-3e158999a1c8	06020001	clxyedekparca00001	YAĞ FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	YAĞ FİLTRESİ	KRAFTVOLL	\N	11428507683	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:12:53.14	2026-02-17 11:12:53.14	f	f
b397902b-886f-4dc4-b51f-98f786381773	06040102	clxyedekparca00001	POLEN FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	KRAFTVOLL	\N	64119237555	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:13:24.665	2026-02-17 11:13:24.665	f	f
b0befc5d-01b6-4ccf-b3df-e3aff98ac97f	SH1148	clxyedekparca00001	HAVA FİLTRESİ BMW	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	HAVA FİLTRESİ	SİON	\N	13718511668	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:13:54.624	2026-02-17 11:13:54.624	f	f
9d5055a7-1e21-45b0-9916-c8a60bffc3ac	VKMA06140	clxyedekparca00001	TRİGER SETİ RENAULT-DACİA	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	SKF	\N	130C19462R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 11:17:41.631	2026-02-17 11:17:41.631	f	f
2e369e1b-aa70-488e-9cd2-cc684d22429c	AN-728C	clxyedekparca00001	CAM AÇMA DÜĞMESİ SOL ÖN LOGAN-SANDERO	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	KRAW	\N	254117873R	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 06:07:16.054	2026-02-18 06:07:16.054	f	f
12f306ed-4fa8-4976-840b-8695956a54c6	61-53275-00	clxyedekparca00001	SİLİNDİR KAPAK CONTASI YARİS	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	VİCTOR REİNZ	\N	1111597403	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 08:27:06.73	2026-02-18 08:27:06.73	f	f
bb3ce01c-2764-47cf-8309-a69549833324	31P3002	clxyedekparca00001	HAVA FİLTRE HORTUMU CLİO III	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	UCPA	\N	8200446868	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 08:31:27.098	2026-02-18 08:31:27.098	f	f
17a2b899-c2c0-4d14-bcf4-2002d4ba1227	FC12271S03	clxyedekparca00001	ARKA TEKER RULMANI RENAULT	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	SNR	\N	7701205596	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-18 08:34:15.768	2026-02-18 08:34:15.768	f	f
841e7ff9-ca92-47c5-b53f-de26b6fa549b	1684891780	clxyedekparca00001	TRİGER SETİ+DEVİRDAİM 1.6HDİ-1.6TDCİ	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	PSA	\N	1684891780	\N	A1-04-01	\N	\N	\N	\N	\N	\N	\N	2026-01-06 14:23:32.63	2026-02-18 12:25:09.911	f	f
7bce05e7-a94d-42ff-a4fe-084854e6e44e	588539	clxyedekparca00001	DEBRİYAJ BİLYASI CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	ŞANZIMAN GRUBU	ŞANZIMAN GRUBU	\N	OPAR	\N	24422061	\N	A1-04-07	\N	\N	\N	\N	\N	\N	\N	2026-02-11 09:51:31.765	2026-02-18 13:06:11.122	f	f
25ad586b-b128-46cc-8b9e-c5990ffde784	13498004/K	clxyedekparca00001	ARKA TEKER PORYASI C5	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	FORMPART	\N	3748.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-19 09:32:35.897	2026-02-19 09:32:35.897	f	f
b1ccf186-4d92-45b8-9ce3-b13fcdb1e9ec	TKN-P-271	clxyedekparca00001	ROT BASI ON SAG CITROEN C-ELYSEE 2012- / C3 PICASS	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	1608652380	\N	B1-04-06	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.255	2026-02-19 10:00:16.929	f	f
7eaed4c2-8965-4a0d-8d47-983e0592709e	TKN-CI-301	clxyedekparca00001	ROTBASI SAG PEUGEOT 307 (3A/C) 1.4 HDI 2000-2007	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.16	\N	B1-04-12	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.863	2026-02-19 10:26:37.073	f	f
78b769f2-e303-4922-aacb-31702ee3bfb8	TKN-F-831	clxyedekparca00001	ROT BASI ON CITROEN JUMPY 2007-2016 / FIAT SCUDO 2	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3817.73	\N	B1-04-19	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.389	2026-02-19 11:17:15.699	f	f
bbce53f5-9703-4fa2-b89f-3f0173567ec7	TKN-CI-653	clxyedekparca00001	ROTMILI SOL-SAG CITROEN DS5 1.6 E-HDI 2011-	\N	Adet	0.00	0.00	20	0	ALT TAKIM	ALT TAKIM	\N	TEKNOROT	\N	3812.F7	\N	B1-04-30	\N	\N	\N	\N	\N	\N	\N	2025-12-18 19:11:35.251	2026-02-19 11:26:45.102	f	f
3f4e84d5-294a-404f-a7fb-be0773c6a494	STN13345949	clxyedekparca00001	POLEN FİLTRESİ CORSA D-E	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	13345949	\N	C1-02-07	\N	\N	\N	\N	\N	\N	\N	2026-02-16 07:53:30.31	2026-02-19 13:04:32.365	f	f
c1000f39-02eb-4c12-859e-96627aad4820	STN6447.RG	clxyedekparca00001	POLEN FİLTRESİ 407	\N	Adet	0.00	0.00	20	0	FİLTRE	FİLTRE	POLEN FİLTRESİ	STN	\N	6447.RG	\N	C1-02-09	\N	\N	\N	\N	\N	\N	\N	2026-01-20 12:50:24.393	2026-02-19 13:05:12.92	f	f
1c789117-0345-4549-9116-17bcbd3e4855	PH5715A	clxyedekparca00001	AMPUL KÜÇÜK DİPSİZ SARI	\N	Adet	0.00	0.00	20	0	ELEKTRİK GRUBU	ELEKTRİK GRUBU	\N	PHOTON	\N	\N	\N	C1-02-16	\N	\N	\N	\N	\N	\N	\N	2026-01-21 09:53:15.676	2026-02-19 13:09:29.742	f	f
5109cd23-2697-4d26-a5c0-5a275de3b5b5	53442A	clxyedekparca00001	SU RADYATÖRÜ ASTRA H	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	NRF	\N	13145211	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 06:17:03.565	2026-02-20 06:17:03.565	f	f
46e0cebb-5d0c-4975-bf12-ec9b901f0ae3	83414188	clxyedekparca00001	SİLİNDİR KAPAK CONTASI CORSA D A13DTC	\N	Adet	0.00	0.00	20	0	MOTOR GRUBU	MOTOR GRUBU	\N	CORTECO	\N	55209072	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-20 12:18:34.924	2026-02-20 12:18:34.924	f	f
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "tenantId", "planId", status, "startDate", "endDate", "trialEndsAt", "canceledAt", "nextBillingDate", "lastBillingDate", "autoRenew", "iyzicoSubscriptionRef", "additionalUsers", "createdAt", "updatedAt") FROM stdin;
clxsubyedekparca01	clxyedekparca00001	clxtrialplan00001	ACTIVE	2026-02-22 19:55:05.846	2027-02-22 19:55:05.846	\N	\N	\N	\N	t	\N	0	2026-02-22 19:55:05.846	2026-02-22 19:55:05.846
\.


--
-- Data for Name: system_parameters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_parameters (id, "tenantId", key, value, description, category, "createdAt", "updatedAt") FROM stdin;
40294acc-5630-4804-ade4-d1e5cfd6dfd0	clxyedekparca00001	ALLOW_NEGATIVE_CASH_BALANCE	true	Kasa işlemlerinde bakiye kontrolü yapılır. Açık olduğunda, kasa bakiyesi eksiye düşebilir. Kapalı olduğunda, mevcut bakiyeden fazla çıkış yapılamaz.	KASA	2026-02-25 06:43:40.387	2026-02-25 06:43:40.387
\.


--
-- Data for Name: tahsilatlar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tahsilatlar (id, "tenantId", "cariId", "faturaId", "serviceInvoiceId", tip, tutar, tarih, "odemeTipi", "kasaId", "bankaHesapId", "firmaKrediKartiId", aciklama, "createdBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "satisElemaniId") FROM stdin;
\.


--
-- Data for Name: teklif_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teklif_kalemleri (id, "teklifId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "iskontoOran", "iskontoTutar", "createdAt") FROM stdin;
\.


--
-- Data for Name: teklif_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teklif_logs (id, "teklifId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: teklifler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teklifler (id, "teklifNo", "tenantId", "teklifTipi", "cariId", tarih, "gecerlilikTarihi", iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "siparisId", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tenant_purge_audits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_purge_audits (id, "tenantId", "adminId", "adminEmail", "ipAddress", "deletedFiles", errors, "createdAt") FROM stdin;
\.


--
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_settings (id, "tenantId", "companyName", "taxNumber", address, "logoUrl", features, limits, timezone, locale, currency, "createdAt", "updatedAt", city, "companyType", country, district, email, "firstName", "lastName", "mersisNo", neighborhood, phone, "postalCode", "taxOffice", "tcNo", website) FROM stdin;
cmlxzood70001lb0iiofnnv28	clxyedekparca00001	STNOTO YEDEK PARÇA	1111111111			\N	\N	Europe/Istanbul	tr-TR	TRY	2026-02-22 16:56:00.858	2026-02-25 06:44:03.344	Adana	COMPANY	Türkiye	Seyhan										
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, uuid, name, subdomain, domain, status, "cancelledAt", "purgedAt", "createdAt", "updatedAt", "tenantType") FROM stdin;
clxyedekparca00001	1ddfd9a3-5fe5-427f-8704-7f73f63a8aeb	Yedek Parça	yedekparca	\N	ACTIVE	\N	\N	2026-02-22 19:47:09.586	2026-02-22 19:47:09.586	CORPORATE
\.


--
-- Data for Name: urun_raflar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.urun_raflar (id, "stokId", "rafId", miktar, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_licenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_licenses (id, "userId", "licenseType", "moduleId", "assignedBy", "assignedAt", "revokedAt", "revokedBy", "createdAt", "updatedAt") FROM stdin;
42e3ead2-66c0-4b43-80ee-ea5f64a6bd06	56fdab02-13ad-4441-b755-862f88d6e7cb	BASE_PLAN	\N	\N	2026-02-22 19:55:05.846	\N	\N	2026-02-22 19:55:05.846	2026-02-22 19:55:05.846
0ec261ca-a2e8-4f72-a856-8bec4a967a38	5c81dff5-0ee8-4395-b655-138a4d0064b8	BASE_PLAN	\N	\N	2026-02-22 19:55:05.846	\N	\N	2026-02-22 19:55:05.846	2026-02-22 19:55:05.846
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, uuid, email, username, password, "firstName", "lastName", "fullName", phone, "avatarUrl", role, department, status, "isActive", "refreshToken", "tokenVersion", "tenantId", "emailVerified", "lastLoginAt", "createdAt", "updatedAt", "roleId") FROM stdin;
56fdab02-13ad-4441-b755-862f88d6e7cb	d69944b9-a0c7-496b-a1e2-cabd3092d842	fatihotoyd@gmail.com	Fatih	$2b$10$N3JlK1UGGjceKbI4Xlcteuv6GiNYDsnIDw3Ul0blnqKDeTy4zbXAe	\N	\N	Sistem Yöneticisi	\N	\N	TENANT_ADMIN	\N	ACTIVE	t	\N	0	clxyedekparca00001	f	\N	2025-10-30 20:58:08.091	2026-02-22 19:55:05.846	\N
04efc97b-a3a4-4d7e-b504-41b9d99911ea	4c5b29ab-9150-4663-b2db-bb3276aa8eab	fatih@stnoto.com	fatih	$2b$10$g8KOK7cDn2yQ40BeBAd6vOgNnutRHI71cHj7YloZzutOKWVNcXBOa	Fatih	Admin	Fatih Super Admin	\N	\N	SUPER_ADMIN	\N	ACTIVE	t	$2b$10$WLuP.Hlye6gye9lYIGcRmurLoq9FCuEwNYBXsub3Fzi2EbjWNFC7m	0	clxyedekparca00001	f	2026-02-27 10:54:44.533	2026-02-25 06:53:21.462	2026-02-27 10:54:44.534	\N
5c81dff5-0ee8-4395-b655-138a4d0064b8	ebcf9628-398f-4488-9fea-6c8b0e31e7b4	gokmen@stnoto.com	gökmen	$2b$10$mLtCWNI3xmsTlooTMWx6JOSE0o8xfiHAxns6q7kNJT6Bq1nPSMaJe	\N	\N	Gökmen	\N	\N	SUPER_ADMIN	\N	ACTIVE	t	$2b$10$wegPeZbZw7idCUqQyArquuBaG51Eldlh.8duWv6ouX6Vbm4J3ifpa	0	clxyedekparca00001	f	2026-02-27 10:13:09.546	2025-12-23 06:05:07.001	2026-02-27 10:13:09.547	\N
\.


--
-- Data for Name: vehicle_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicle_expenses (id, "tenantId", "vehicleId", "masrafTipi", tarih, tutar, aciklama, "belgeNo", kilometre, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_critical_stocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse_critical_stocks (id, "warehouseId", "productId", "criticalQty", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse_transfer_items (id, "transferId", "stokId", miktar, "fromLocationId", "toLocationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse_transfer_logs (id, "transferId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouse_transfers (id, "transferNo", "tenantId", tarih, "fromWarehouseId", "toWarehouseId", durum, "driverName", "vehiclePlate", aciklama, "hazirlayanUserId", "onaylayanUserId", "teslimAlanUserId", "sevkTarihi", "teslimTarihi", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouses (id, code, "tenantId", name, active, address, phone, manager, "createdAt", "updatedAt", "isDefault") FROM stdin;
eb067e72-b52b-45fd-94d6-510cd5df7eba	01	clxyedekparca00001	Merkez	t			\N	2026-02-22 17:09:24.524	2026-02-22 17:09:24.524	t
\.


--
-- Data for Name: work_order_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_activities (id, "workOrderId", action, "userId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: work_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_items (id, "workOrderId", type, description, "stokId", quantity, "unitPrice", "taxRate", "taxAmount", "totalPrice", version, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_orders (id, "workOrderNo", "tenantId", status, "partWorkflowStatus", "vehicleWorkflowStatus", "customerVehicleId", "cariId", "technicianId", description, "diagnosisNotes", "supplyResponseNotes", "estimatedCompletionDate", "actualCompletionDate", "totalLaborCost", "totalPartsCost", "taxAmount", "grandTotal", version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.efatura_inbox_id_seq', 1, false);


--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hizli_tokens_id_seq', 1, false);


--
-- Name: araclar araclar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.araclar
    ADD CONSTRAINT araclar_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT avans_mahsuplasmalar_pkey PRIMARY KEY (id);


--
-- Name: avanslar avanslar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT avanslar_pkey PRIMARY KEY (id);


--
-- Name: banka_havale_logs banka_havale_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT banka_havale_logs_pkey PRIMARY KEY (id);


--
-- Name: banka_havaleler banka_havaleler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT banka_havaleler_pkey PRIMARY KEY (id);


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT banka_hesap_hareketler_pkey PRIMARY KEY (id);


--
-- Name: banka_hesaplari banka_hesaplari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_hesaplari
    ADD CONSTRAINT banka_hesaplari_pkey PRIMARY KEY (id);


--
-- Name: banka_kredi_planlari banka_kredi_planlari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_kredi_planlari
    ADD CONSTRAINT banka_kredi_planlari_pkey PRIMARY KEY (id);


--
-- Name: banka_krediler banka_krediler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_krediler
    ADD CONSTRAINT banka_krediler_pkey PRIMARY KEY (id);


--
-- Name: bankalar bankalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bankalar
    ADD CONSTRAINT bankalar_pkey PRIMARY KEY (id);


--
-- Name: basit_siparisler basit_siparisler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT basit_siparisler_pkey PRIMARY KEY (id);


--
-- Name: bordrolar bordrolar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT bordrolar_pkey PRIMARY KEY (id);


--
-- Name: cari_adresler cari_adresler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_adresler
    ADD CONSTRAINT cari_adresler_pkey PRIMARY KEY (id);


--
-- Name: cari_bankalar cari_bankalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_bankalar
    ADD CONSTRAINT cari_bankalar_pkey PRIMARY KEY (id);


--
-- Name: cari_hareketler cari_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT cari_hareketler_pkey PRIMARY KEY (id);


--
-- Name: cari_yetkililer cari_yetkililer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_yetkililer
    ADD CONSTRAINT cari_yetkililer_pkey PRIMARY KEY (id);


--
-- Name: cariler cariler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT cariler_pkey PRIMARY KEY (id);


--
-- Name: cek_senet_logs cek_senet_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT cek_senet_logs_pkey PRIMARY KEY (id);


--
-- Name: cek_senetler cek_senetler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT cek_senetler_pkey PRIMARY KEY (id);


--
-- Name: code_templates code_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT code_templates_pkey PRIMARY KEY (id);


--
-- Name: company_vehicles company_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT company_vehicles_pkey PRIMARY KEY (id);


--
-- Name: customer_vehicles customer_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT customer_vehicles_pkey PRIMARY KEY (id);


--
-- Name: deleted_banka_havaleler deleted_banka_havaleler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_banka_havaleler
    ADD CONSTRAINT deleted_banka_havaleler_pkey PRIMARY KEY (id);


--
-- Name: deleted_cek_senetler deleted_cek_senetler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_cek_senetler
    ADD CONSTRAINT deleted_cek_senetler_pkey PRIMARY KEY (id);


--
-- Name: depolar depolar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depolar
    ADD CONSTRAINT depolar_pkey PRIMARY KEY (id);


--
-- Name: efatura_inbox efatura_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.efatura_inbox
    ADD CONSTRAINT efatura_inbox_pkey PRIMARY KEY (id);


--
-- Name: efatura_xml efatura_xml_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.efatura_xml
    ADD CONSTRAINT efatura_xml_pkey PRIMARY KEY (id);


--
-- Name: esdeger_gruplar esdeger_gruplar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esdeger_gruplar
    ADD CONSTRAINT esdeger_gruplar_pkey PRIMARY KEY (id);


--
-- Name: fatura_kalemleri fatura_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT fatura_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: fatura_logs fatura_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT fatura_logs_pkey PRIMARY KEY (id);


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT fatura_tahsilatlar_pkey PRIMARY KEY (id);


--
-- Name: faturalar faturalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT faturalar_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT firma_kredi_karti_hareketler_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_karti_hatirlaticilar firma_kredi_karti_hatirlaticilar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_karti_hatirlaticilar
    ADD CONSTRAINT firma_kredi_karti_hatirlaticilar_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_kartlari firma_kredi_kartlari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_kartlari
    ADD CONSTRAINT firma_kredi_kartlari_pkey PRIMARY KEY (id);


--
-- Name: hizli_tokens hizli_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hizli_tokens
    ADD CONSTRAINT hizli_tokens_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invoice_profit invoice_profit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- Name: kasa_hareketler kasa_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT kasa_hareketler_pkey PRIMARY KEY (id);


--
-- Name: kasalar kasalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT kasalar_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT maas_odeme_detaylari_pkey PRIMARY KEY (id);


--
-- Name: maas_odemeler maas_odemeler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT maas_odemeler_pkey PRIMARY KEY (id);


--
-- Name: maas_planlari maas_planlari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT maas_planlari_pkey PRIMARY KEY (id);


--
-- Name: masraf_kategoriler masraf_kategoriler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.masraf_kategoriler
    ADD CONSTRAINT masraf_kategoriler_pkey PRIMARY KEY (id);


--
-- Name: masraflar masraflar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT masraflar_pkey PRIMARY KEY (id);


--
-- Name: module_licenses module_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT module_licenses_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: part_requests part_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT part_requests_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personel_odemeler personel_odemeler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT personel_odemeler_pkey PRIMARY KEY (id);


--
-- Name: personeller personeller_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT personeller_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: postal_codes postal_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postal_codes
    ADD CONSTRAINT postal_codes_pkey PRIMARY KEY (id);


--
-- Name: price_cards price_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_pkey PRIMARY KEY (id);


--
-- Name: product_barcodes product_barcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT product_barcodes_pkey PRIMARY KEY (id);


--
-- Name: product_location_stocks product_location_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT product_location_stocks_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: raflar raflar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raflar
    ADD CONSTRAINT raflar_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT satin_alma_irsaliyeleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT satin_alma_irsaliyesi_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT satin_alma_irsaliyesi_logs_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT satin_alma_siparis_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT satin_alma_siparis_logs_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT satin_alma_siparisleri_pkey PRIMARY KEY (id);


--
-- Name: satis_elemanlari satis_elemanlari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_elemanlari
    ADD CONSTRAINT satis_elemanlari_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT satis_irsaliyeleri_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT satis_irsaliyesi_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT satis_irsaliyesi_logs_pkey PRIMARY KEY (id);


--
-- Name: sayim_kalemleri sayim_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT sayim_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: sayimlar sayimlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT sayimlar_pkey PRIMARY KEY (id);


--
-- Name: service_invoices service_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT service_invoices_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: siparis_hazirliklar siparis_hazirliklar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT siparis_hazirliklar_pkey PRIMARY KEY (id);


--
-- Name: siparis_kalemleri siparis_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT siparis_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: siparis_logs siparis_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT siparis_logs_pkey PRIMARY KEY (id);


--
-- Name: siparisler siparisler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT siparisler_pkey PRIMARY KEY (id);


--
-- Name: stock_cost_history stock_cost_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_pkey PRIMARY KEY (id);


--
-- Name: stock_moves stock_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_pkey PRIMARY KEY (id);


--
-- Name: stok_esdegers stok_esdegers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT stok_esdegers_pkey PRIMARY KEY (id);


--
-- Name: stok_hareketleri stok_hareketleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT stok_hareketleri_pkey PRIMARY KEY (id);


--
-- Name: stoklar stoklar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT stoklar_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: system_parameters system_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT system_parameters_pkey PRIMARY KEY (id);


--
-- Name: tahsilatlar tahsilatlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT tahsilatlar_pkey PRIMARY KEY (id);


--
-- Name: teklif_kalemleri teklif_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT teklif_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: teklif_logs teklif_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT teklif_logs_pkey PRIMARY KEY (id);


--
-- Name: teklifler teklifler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT teklifler_pkey PRIMARY KEY (id);


--
-- Name: tenant_purge_audits tenant_purge_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT tenant_purge_audits_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: urun_raflar urun_raflar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT urun_raflar_pkey PRIMARY KEY (id);


--
-- Name: user_licenses user_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT user_licenses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_expenses vehicle_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT vehicle_expenses_pkey PRIMARY KEY (id);


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT warehouse_critical_stocks_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_items warehouse_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT warehouse_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT warehouse_transfer_logs_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfers warehouse_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: work_order_activities work_order_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT work_order_activities_pkey PRIMARY KEY (id);


--
-- Name: work_order_items work_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: araclar_marka_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX araclar_marka_idx ON public.araclar USING btree (marka);


--
-- Name: araclar_marka_model_motorHacmi_yakitTipi_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "araclar_marka_model_motorHacmi_yakitTipi_key" ON public.araclar USING btree (marka, model, "motorHacmi", "yakitTipi");


--
-- Name: araclar_model_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX araclar_model_idx ON public.araclar USING btree (model);


--
-- Name: araclar_yakitTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "araclar_yakitTipi_idx" ON public.araclar USING btree ("yakitTipi");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_tenantId_idx" ON public.audit_logs USING btree ("tenantId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: avans_mahsuplasmalar_avansId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avans_mahsuplasmalar_avansId_idx" ON public.avans_mahsuplasmalar USING btree ("avansId");


--
-- Name: avans_mahsuplasmalar_planId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avans_mahsuplasmalar_planId_idx" ON public.avans_mahsuplasmalar USING btree ("planId");


--
-- Name: avans_mahsuplasmalar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avans_mahsuplasmalar_tenantId_idx" ON public.avans_mahsuplasmalar USING btree ("tenantId");


--
-- Name: avanslar_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX avanslar_durum_idx ON public.avanslar USING btree (durum);


--
-- Name: avanslar_kasaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avanslar_kasaId_idx" ON public.avanslar USING btree ("kasaId");


--
-- Name: avanslar_personelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avanslar_personelId_idx" ON public.avanslar USING btree ("personelId");


--
-- Name: avanslar_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX avanslar_tarih_idx ON public.avanslar USING btree (tarih);


--
-- Name: avanslar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "avanslar_tenantId_idx" ON public.avanslar USING btree ("tenantId");


--
-- Name: banka_havale_logs_bankaHavaleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havale_logs_bankaHavaleId_idx" ON public.banka_havale_logs USING btree ("bankaHavaleId");


--
-- Name: banka_havale_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havale_logs_userId_idx" ON public.banka_havale_logs USING btree ("userId");


--
-- Name: banka_havaleler_bankaHesabiId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havaleler_bankaHesabiId_idx" ON public.banka_havaleler USING btree ("bankaHesabiId");


--
-- Name: banka_havaleler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havaleler_cariId_idx" ON public.banka_havaleler USING btree ("cariId");


--
-- Name: banka_havaleler_hareketTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havaleler_hareketTipi_idx" ON public.banka_havaleler USING btree ("hareketTipi");


--
-- Name: banka_havaleler_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX banka_havaleler_tarih_idx ON public.banka_havaleler USING btree (tarih);


--
-- Name: banka_havaleler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havaleler_tenantId_idx" ON public.banka_havaleler USING btree ("tenantId");


--
-- Name: banka_havaleler_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_havaleler_tenantId_tarih_idx" ON public.banka_havaleler USING btree ("tenantId", tarih);


--
-- Name: banka_hesap_hareketler_hareketTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_hesap_hareketler_hareketTipi_idx" ON public.banka_hesap_hareketler USING btree ("hareketTipi");


--
-- Name: banka_hesap_hareketler_hesapId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_hesap_hareketler_hesapId_tarih_idx" ON public.banka_hesap_hareketler USING btree ("hesapId", tarih);


--
-- Name: banka_hesaplari_bankaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_hesaplari_bankaId_idx" ON public.banka_hesaplari USING btree ("bankaId");


--
-- Name: banka_hesaplari_hesapKodu_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "banka_hesaplari_hesapKodu_key" ON public.banka_hesaplari USING btree ("hesapKodu");


--
-- Name: banka_hesaplari_hesapTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_hesaplari_hesapTipi_idx" ON public.banka_hesaplari USING btree ("hesapTipi");


--
-- Name: banka_kredi_planlari_krediId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_kredi_planlari_krediId_idx" ON public.banka_kredi_planlari USING btree ("krediId");


--
-- Name: banka_krediler_bankaHesapId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "banka_krediler_bankaHesapId_idx" ON public.banka_krediler USING btree ("bankaHesapId");


--
-- Name: bankalar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bankalar_tenantId_idx" ON public.bankalar USING btree ("tenantId");


--
-- Name: basit_siparisler_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_createdAt_idx" ON public.basit_siparisler USING btree ("createdAt");


--
-- Name: basit_siparisler_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX basit_siparisler_durum_idx ON public.basit_siparisler USING btree (durum);


--
-- Name: basit_siparisler_firmaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_firmaId_idx" ON public.basit_siparisler USING btree ("firmaId");


--
-- Name: basit_siparisler_tenantId_firmaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_tenantId_firmaId_idx" ON public.basit_siparisler USING btree ("tenantId", "firmaId");


--
-- Name: basit_siparisler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_tenantId_idx" ON public.basit_siparisler USING btree ("tenantId");


--
-- Name: basit_siparisler_tenantId_urunId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_tenantId_urunId_idx" ON public.basit_siparisler USING btree ("tenantId", "urunId");


--
-- Name: basit_siparisler_urunId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "basit_siparisler_urunId_idx" ON public.basit_siparisler USING btree ("urunId");


--
-- Name: cari_adresler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cari_adresler_cariId_idx" ON public.cari_adresler USING btree ("cariId");


--
-- Name: cari_bankalar_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cari_bankalar_cariId_idx" ON public.cari_bankalar USING btree ("cariId");


--
-- Name: cari_hareketler_cariId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cari_hareketler_cariId_tarih_idx" ON public.cari_hareketler USING btree ("cariId", tarih);


--
-- Name: cari_hareketler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cari_hareketler_tenantId_idx" ON public.cari_hareketler USING btree ("tenantId");


--
-- Name: cari_yetkililer_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cari_yetkililer_cariId_idx" ON public.cari_yetkililer USING btree ("cariId");


--
-- Name: cariler_cariKodu_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cariler_cariKodu_tenantId_key" ON public.cariler USING btree ("cariKodu", "tenantId");


--
-- Name: cariler_tenantId_cariKodu_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cariler_tenantId_cariKodu_idx" ON public.cariler USING btree ("tenantId", "cariKodu");


--
-- Name: cariler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cariler_tenantId_idx" ON public.cariler USING btree ("tenantId");


--
-- Name: cek_senet_logs_cekSenetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senet_logs_cekSenetId_idx" ON public.cek_senet_logs USING btree ("cekSenetId");


--
-- Name: cek_senet_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senet_logs_userId_idx" ON public.cek_senet_logs USING btree ("userId");


--
-- Name: cek_senetler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senetler_cariId_idx" ON public.cek_senetler USING btree ("cariId");


--
-- Name: cek_senetler_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cek_senetler_durum_idx ON public.cek_senetler USING btree (durum);


--
-- Name: cek_senetler_portfoyTip_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senetler_portfoyTip_idx" ON public.cek_senetler USING btree ("portfoyTip");


--
-- Name: cek_senetler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senetler_tenantId_idx" ON public.cek_senetler USING btree ("tenantId");


--
-- Name: cek_senetler_tenantId_vade_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cek_senetler_tenantId_vade_idx" ON public.cek_senetler USING btree ("tenantId", vade);


--
-- Name: cek_senetler_tip_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cek_senetler_tip_idx ON public.cek_senetler USING btree (tip);


--
-- Name: cek_senetler_vade_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cek_senetler_vade_idx ON public.cek_senetler USING btree (vade);


--
-- Name: code_templates_module_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "code_templates_module_tenantId_key" ON public.code_templates USING btree (module, "tenantId");


--
-- Name: company_vehicles_plaka_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "company_vehicles_plaka_tenantId_key" ON public.company_vehicles USING btree (plaka, "tenantId");


--
-- Name: company_vehicles_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_vehicles_tenantId_idx" ON public.company_vehicles USING btree ("tenantId");


--
-- Name: company_vehicles_zimmetliPersonelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_vehicles_zimmetliPersonelId_idx" ON public.company_vehicles USING btree ("zimmetliPersonelId");


--
-- Name: customer_vehicles_plaka_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_vehicles_plaka_tenantId_key" ON public.customer_vehicles USING btree (plaka, "tenantId");


--
-- Name: customer_vehicles_saseno_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customer_vehicles_saseno_tenantId_key" ON public.customer_vehicles USING btree (saseno, "tenantId");


--
-- Name: customer_vehicles_servisDurum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "customer_vehicles_servisDurum_idx" ON public.customer_vehicles USING btree ("servisDurum");


--
-- Name: customer_vehicles_tenantId_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "customer_vehicles_tenantId_cariId_idx" ON public.customer_vehicles USING btree ("tenantId", "cariId");


--
-- Name: customer_vehicles_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "customer_vehicles_tenantId_idx" ON public.customer_vehicles USING btree ("tenantId");


--
-- Name: deleted_banka_havaleler_bankaHesabiId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_banka_havaleler_bankaHesabiId_idx" ON public.deleted_banka_havaleler USING btree ("bankaHesabiId");


--
-- Name: deleted_banka_havaleler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_banka_havaleler_cariId_idx" ON public.deleted_banka_havaleler USING btree ("cariId");


--
-- Name: deleted_banka_havaleler_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_banka_havaleler_deletedAt_idx" ON public.deleted_banka_havaleler USING btree ("deletedAt");


--
-- Name: deleted_banka_havaleler_originalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_banka_havaleler_originalId_idx" ON public.deleted_banka_havaleler USING btree ("originalId");


--
-- Name: deleted_cek_senetler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_cek_senetler_cariId_idx" ON public.deleted_cek_senetler USING btree ("cariId");


--
-- Name: deleted_cek_senetler_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_cek_senetler_deletedAt_idx" ON public.deleted_cek_senetler USING btree ("deletedAt");


--
-- Name: deleted_cek_senetler_originalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deleted_cek_senetler_originalId_idx" ON public.deleted_cek_senetler USING btree ("originalId");


--
-- Name: depolar_depoAdi_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "depolar_depoAdi_key" ON public.depolar USING btree ("depoAdi");


--
-- Name: efatura_inbox_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "efatura_inbox_createdAt_idx" ON public.efatura_inbox USING btree ("createdAt");


--
-- Name: efatura_inbox_ettn_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX efatura_inbox_ettn_key ON public.efatura_inbox USING btree (ettn);


--
-- Name: efatura_inbox_senderVkn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "efatura_inbox_senderVkn_idx" ON public.efatura_inbox USING btree ("senderVkn");


--
-- Name: efatura_xml_faturaId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "efatura_xml_faturaId_key" ON public.efatura_xml USING btree ("faturaId");


--
-- Name: fatura_logs_faturaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fatura_logs_faturaId_idx" ON public.fatura_logs USING btree ("faturaId");


--
-- Name: fatura_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fatura_logs_userId_idx" ON public.fatura_logs USING btree ("userId");


--
-- Name: fatura_tahsilatlar_faturaId_tahsilatId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "fatura_tahsilatlar_faturaId_tahsilatId_key" ON public.fatura_tahsilatlar USING btree ("faturaId", "tahsilatId");


--
-- Name: fatura_tahsilatlar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fatura_tahsilatlar_tenantId_idx" ON public.fatura_tahsilatlar USING btree ("tenantId");


--
-- Name: faturalar_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_cariId_idx" ON public.faturalar USING btree ("cariId");


--
-- Name: faturalar_deliveryNoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_deliveryNoteId_idx" ON public.faturalar USING btree ("deliveryNoteId");


--
-- Name: faturalar_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faturalar_durum_idx ON public.faturalar USING btree (durum);


--
-- Name: faturalar_efaturaEttn_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "faturalar_efaturaEttn_key" ON public.faturalar USING btree ("efaturaEttn");


--
-- Name: faturalar_faturaNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "faturalar_faturaNo_tenantId_key" ON public.faturalar USING btree ("faturaNo", "tenantId");


--
-- Name: faturalar_purchaseOrderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "faturalar_purchaseOrderId_key" ON public.faturalar USING btree ("purchaseOrderId");


--
-- Name: faturalar_satinAlmaIrsaliyeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "faturalar_satinAlmaIrsaliyeId_key" ON public.faturalar USING btree ("satinAlmaIrsaliyeId");


--
-- Name: faturalar_satinAlmaSiparisiId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "faturalar_satinAlmaSiparisiId_key" ON public.faturalar USING btree ("satinAlmaSiparisiId");


--
-- Name: faturalar_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_tenantId_durum_idx" ON public.faturalar USING btree ("tenantId", durum);


--
-- Name: faturalar_tenantId_faturaTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_tenantId_faturaTipi_idx" ON public.faturalar USING btree ("tenantId", "faturaTipi");


--
-- Name: faturalar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_tenantId_idx" ON public.faturalar USING btree ("tenantId");


--
-- Name: faturalar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_tenantId_tarih_idx" ON public.faturalar USING btree ("tenantId", tarih);


--
-- Name: faturalar_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "faturalar_warehouseId_idx" ON public.faturalar USING btree ("warehouseId");


--
-- Name: firma_kredi_karti_hareketler_kartId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "firma_kredi_karti_hareketler_kartId_tarih_idx" ON public.firma_kredi_karti_hareketler USING btree ("kartId", tarih);


--
-- Name: firma_kredi_karti_hatirlaticilar_gun_aktif_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX firma_kredi_karti_hatirlaticilar_gun_aktif_idx ON public.firma_kredi_karti_hatirlaticilar USING btree (gun, aktif);


--
-- Name: firma_kredi_karti_hatirlaticilar_kartId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "firma_kredi_karti_hatirlaticilar_kartId_idx" ON public.firma_kredi_karti_hatirlaticilar USING btree ("kartId");


--
-- Name: firma_kredi_karti_hatirlaticilar_kartId_tip_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "firma_kredi_karti_hatirlaticilar_kartId_tip_key" ON public.firma_kredi_karti_hatirlaticilar USING btree ("kartId", tip);


--
-- Name: firma_kredi_kartlari_kartKodu_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "firma_kredi_kartlari_kartKodu_key" ON public.firma_kredi_kartlari USING btree ("kartKodu");


--
-- Name: firma_kredi_kartlari_kasaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "firma_kredi_kartlari_kasaId_idx" ON public.firma_kredi_kartlari USING btree ("kasaId");


--
-- Name: hizli_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "hizli_tokens_expiresAt_idx" ON public.hizli_tokens USING btree ("expiresAt");


--
-- Name: hizli_tokens_loginHash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "hizli_tokens_loginHash_idx" ON public.hizli_tokens USING btree ("loginHash");


--
-- Name: inventory_transactions_partRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transactions_partRequestId_idx" ON public.inventory_transactions USING btree ("partRequestId");


--
-- Name: inventory_transactions_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transactions_stokId_idx" ON public.inventory_transactions USING btree ("stokId");


--
-- Name: inventory_transactions_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transactions_tenantId_createdAt_idx" ON public.inventory_transactions USING btree ("tenantId", "createdAt");


--
-- Name: inventory_transactions_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_transactions_tenantId_idx" ON public.inventory_transactions USING btree ("tenantId");


--
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_email_idx ON public.invitations USING btree (email);


--
-- Name: invitations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_status_idx ON public.invitations USING btree (status);


--
-- Name: invitations_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invitations_tenantId_idx" ON public.invitations USING btree ("tenantId");


--
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_token_idx ON public.invitations USING btree (token);


--
-- Name: invitations_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invitations_token_key ON public.invitations USING btree (token);


--
-- Name: invoice_profit_faturaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoice_profit_faturaId_idx" ON public.invoice_profit USING btree ("faturaId");


--
-- Name: invoice_profit_faturaKalemiId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoice_profit_faturaKalemiId_idx" ON public.invoice_profit USING btree ("faturaKalemiId");


--
-- Name: invoice_profit_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoice_profit_stokId_idx" ON public.invoice_profit USING btree ("stokId");


--
-- Name: invoice_profit_tenantId_faturaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoice_profit_tenantId_faturaId_idx" ON public.invoice_profit USING btree ("tenantId", "faturaId");


--
-- Name: journal_entries_entryDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entries_entryDate_idx" ON public.journal_entries USING btree ("entryDate");


--
-- Name: journal_entries_serviceInvoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "journal_entries_serviceInvoiceId_key" ON public.journal_entries USING btree ("serviceInvoiceId");


--
-- Name: journal_entries_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entries_tenantId_idx" ON public.journal_entries USING btree ("tenantId");


--
-- Name: journal_entries_tenantId_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entries_tenantId_referenceType_referenceId_idx" ON public.journal_entries USING btree ("tenantId", "referenceType", "referenceId");


--
-- Name: journal_entry_lines_journalEntryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entry_lines_journalEntryId_idx" ON public.journal_entry_lines USING btree ("journalEntryId");


--
-- Name: kasa_hareketler_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasa_hareketler_cariId_idx" ON public.kasa_hareketler USING btree ("cariId");


--
-- Name: kasa_hareketler_kasaId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasa_hareketler_kasaId_tarih_idx" ON public.kasa_hareketler USING btree ("kasaId", tarih);


--
-- Name: kasa_hareketler_transferEdildi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasa_hareketler_transferEdildi_idx" ON public.kasa_hareketler USING btree ("transferEdildi");


--
-- Name: kasalar_aktif_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX kasalar_aktif_idx ON public.kasalar USING btree (aktif);


--
-- Name: kasalar_kasaKodu_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "kasalar_kasaKodu_tenantId_key" ON public.kasalar USING btree ("kasaKodu", "tenantId");


--
-- Name: kasalar_kasaTipi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasalar_kasaTipi_idx" ON public.kasalar USING btree ("kasaTipi");


--
-- Name: kasalar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasalar_tenantId_idx" ON public.kasalar USING btree ("tenantId");


--
-- Name: kasalar_tenantId_kasaKodu_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "kasalar_tenantId_kasaKodu_idx" ON public.kasalar USING btree ("tenantId", "kasaKodu");


--
-- Name: locations_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX locations_barcode_idx ON public.locations USING btree (barcode);


--
-- Name: locations_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX locations_barcode_key ON public.locations USING btree (barcode);


--
-- Name: locations_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX locations_code_idx ON public.locations USING btree (code);


--
-- Name: locations_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX locations_code_key ON public.locations USING btree (code);


--
-- Name: locations_warehouseId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON public.locations USING btree ("warehouseId", code);


--
-- Name: locations_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "locations_warehouseId_idx" ON public.locations USING btree ("warehouseId");


--
-- Name: maas_odeme_detaylari_bankaHesapId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odeme_detaylari_bankaHesapId_idx" ON public.maas_odeme_detaylari USING btree ("bankaHesapId");


--
-- Name: maas_odeme_detaylari_kasaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odeme_detaylari_kasaId_idx" ON public.maas_odeme_detaylari USING btree ("kasaId");


--
-- Name: maas_odeme_detaylari_odemeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odeme_detaylari_odemeId_idx" ON public.maas_odeme_detaylari USING btree ("odemeId");


--
-- Name: maas_odeme_detaylari_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odeme_detaylari_tenantId_idx" ON public.maas_odeme_detaylari USING btree ("tenantId");


--
-- Name: maas_odemeler_personelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odemeler_personelId_idx" ON public.maas_odemeler USING btree ("personelId");


--
-- Name: maas_odemeler_planId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odemeler_planId_idx" ON public.maas_odemeler USING btree ("planId");


--
-- Name: maas_odemeler_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maas_odemeler_tarih_idx ON public.maas_odemeler USING btree (tarih);


--
-- Name: maas_odemeler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_odemeler_tenantId_idx" ON public.maas_odemeler USING btree ("tenantId");


--
-- Name: maas_planlari_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maas_planlari_durum_idx ON public.maas_planlari USING btree (durum);


--
-- Name: maas_planlari_personelId_yil_ay_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "maas_planlari_personelId_yil_ay_key" ON public.maas_planlari USING btree ("personelId", yil, ay);


--
-- Name: maas_planlari_personelId_yil_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_planlari_personelId_yil_idx" ON public.maas_planlari USING btree ("personelId", yil);


--
-- Name: maas_planlari_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maas_planlari_tenantId_idx" ON public.maas_planlari USING btree ("tenantId");


--
-- Name: maas_planlari_yil_ay_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maas_planlari_yil_ay_idx ON public.maas_planlari USING btree (yil, ay);


--
-- Name: masraf_kategoriler_kategoriAdi_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "masraf_kategoriler_kategoriAdi_key" ON public.masraf_kategoriler USING btree ("kategoriAdi");


--
-- Name: masraflar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "masraflar_tenantId_idx" ON public.masraflar USING btree ("tenantId");


--
-- Name: masraflar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "masraflar_tenantId_tarih_idx" ON public.masraflar USING btree ("tenantId", tarih);


--
-- Name: module_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "module_licenses_moduleId_idx" ON public.module_licenses USING btree ("moduleId");


--
-- Name: module_licenses_subscriptionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "module_licenses_subscriptionId_idx" ON public.module_licenses USING btree ("subscriptionId");


--
-- Name: modules_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "modules_isActive_idx" ON public.modules USING btree ("isActive");


--
-- Name: modules_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX modules_slug_idx ON public.modules USING btree (slug);


--
-- Name: modules_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX modules_slug_key ON public.modules USING btree (slug);


--
-- Name: part_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX part_requests_status_idx ON public.part_requests USING btree (status);


--
-- Name: part_requests_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "part_requests_tenantId_idx" ON public.part_requests USING btree ("tenantId");


--
-- Name: part_requests_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "part_requests_tenantId_workOrderId_idx" ON public.part_requests USING btree ("tenantId", "workOrderId");


--
-- Name: part_requests_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "part_requests_workOrderId_idx" ON public.part_requests USING btree ("workOrderId");


--
-- Name: payments_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_conversationId_idx" ON public.payments USING btree ("conversationId");


--
-- Name: payments_conversationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_conversationId_key" ON public.payments USING btree ("conversationId");


--
-- Name: payments_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_createdAt_idx" ON public.payments USING btree ("createdAt");


--
-- Name: payments_iyzicoPaymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_iyzicoPaymentId_idx" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoPaymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_iyzicoPaymentId_key" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_iyzicoToken_key" ON public.payments USING btree ("iyzicoToken");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_subscriptionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_subscriptionId_idx" ON public.payments USING btree ("subscriptionId");


--
-- Name: permissions_module_action_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_module_action_key ON public.permissions USING btree (module, action);


--
-- Name: personel_odemeler_personelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "personel_odemeler_personelId_idx" ON public.personel_odemeler USING btree ("personelId");


--
-- Name: personel_odemeler_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personel_odemeler_tarih_idx ON public.personel_odemeler USING btree (tarih);


--
-- Name: personel_odemeler_tip_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personel_odemeler_tip_idx ON public.personel_odemeler USING btree (tip);


--
-- Name: personeller_aktif_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personeller_aktif_idx ON public.personeller USING btree (aktif);


--
-- Name: personeller_departman_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personeller_departman_idx ON public.personeller USING btree (departman);


--
-- Name: personeller_personelKodu_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "personeller_personelKodu_tenantId_key" ON public.personeller USING btree ("personelKodu", "tenantId");


--
-- Name: personeller_tcKimlikNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "personeller_tcKimlikNo_tenantId_key" ON public.personeller USING btree ("tcKimlikNo", "tenantId");


--
-- Name: personeller_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "personeller_tenantId_idx" ON public.personeller USING btree ("tenantId");


--
-- Name: personeller_tenantId_personelKodu_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "personeller_tenantId_personelKodu_idx" ON public.personeller USING btree ("tenantId", "personelKodu");


--
-- Name: plans_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "plans_isActive_idx" ON public.plans USING btree ("isActive");


--
-- Name: plans_isBasePlan_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "plans_isBasePlan_idx" ON public.plans USING btree ("isBasePlan");


--
-- Name: plans_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX plans_slug_idx ON public.plans USING btree (slug);


--
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- Name: postal_codes_city_district_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_city_district_idx ON public.postal_codes USING btree (city, district);


--
-- Name: postal_codes_city_district_neighborhood_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_city_district_neighborhood_idx ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_district_neighborhood_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX postal_codes_city_district_neighborhood_key ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_city_idx ON public.postal_codes USING btree (city);


--
-- Name: postal_codes_district_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_district_idx ON public.postal_codes USING btree (district);


--
-- Name: postal_codes_neighborhood_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX postal_codes_neighborhood_idx ON public.postal_codes USING btree (neighborhood);


--
-- Name: postal_codes_postalCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "postal_codes_postalCode_idx" ON public.postal_codes USING btree ("postalCode");


--
-- Name: price_cards_stok_id_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_cards_stok_id_type_created_at_idx ON public.price_cards USING btree (stok_id, type, created_at);


--
-- Name: product_barcodes_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_barcodes_barcode_idx ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_barcodes_barcode_key ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_barcodes_productId_idx" ON public.product_barcodes USING btree ("productId");


--
-- Name: product_location_stocks_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_location_stocks_locationId_idx" ON public.product_location_stocks USING btree ("locationId");


--
-- Name: product_location_stocks_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_location_stocks_productId_idx" ON public.product_location_stocks USING btree ("productId");


--
-- Name: product_location_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_location_stocks_warehouseId_idx" ON public.product_location_stocks USING btree ("warehouseId");


--
-- Name: product_location_stocks_warehouseId_locationId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_location_stocks_warehouseId_locationId_productId_key" ON public.product_location_stocks USING btree ("warehouseId", "locationId", "productId");


--
-- Name: purchase_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_product_id_idx ON public.purchase_order_items USING btree (product_id);


--
-- Name: purchase_order_items_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_purchase_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: purchase_orders_orderNumber_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "purchase_orders_orderNumber_tenantId_key" ON public.purchase_orders USING btree ("orderNumber", "tenantId");


--
-- Name: purchase_orders_order_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_order_date_idx ON public.purchase_orders USING btree (order_date);


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_supplier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_supplier_id_idx ON public.purchase_orders USING btree (supplier_id);


--
-- Name: purchase_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_orders_tenantId_idx" ON public.purchase_orders USING btree ("tenantId");


--
-- Name: purchase_orders_tenantId_orderNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_orders_tenantId_orderNumber_idx" ON public.purchase_orders USING btree ("tenantId", "orderNumber");


--
-- Name: raflar_depoId_rafKodu_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "raflar_depoId_rafKodu_key" ON public.raflar USING btree ("depoId", "rafKodu");


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "roles_tenantId_idx" ON public.roles USING btree ("tenantId");


--
-- Name: roles_tenantId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "roles_tenantId_name_key" ON public.roles USING btree ("tenantId", name);


--
-- Name: satin_alma_irsaliyeleri_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_cariId_idx" ON public.satin_alma_irsaliyeleri USING btree ("cariId");


--
-- Name: satin_alma_irsaliyeleri_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX satin_alma_irsaliyeleri_durum_idx ON public.satin_alma_irsaliyeleri USING btree (durum);


--
-- Name: satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key" ON public.satin_alma_irsaliyeleri USING btree ("irsaliyeNo", "tenantId");


--
-- Name: satin_alma_irsaliyeleri_kaynakId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_kaynakId_idx" ON public.satin_alma_irsaliyeleri USING btree ("kaynakId");


--
-- Name: satin_alma_irsaliyeleri_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_durum_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", durum);


--
-- Name: satin_alma_irsaliyeleri_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId");


--
-- Name: satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", "irsaliyeNo");


--
-- Name: satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", "irsaliyeTarihi");


--
-- Name: satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx" ON public.satin_alma_irsaliyesi_kalemleri USING btree ("irsaliyeId");


--
-- Name: satin_alma_irsaliyesi_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyesi_kalemleri_stokId_idx" ON public.satin_alma_irsaliyesi_kalemleri USING btree ("stokId");


--
-- Name: satin_alma_irsaliyesi_logs_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyesi_logs_irsaliyeId_idx" ON public.satin_alma_irsaliyesi_logs USING btree ("irsaliyeId");


--
-- Name: satin_alma_irsaliyesi_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_irsaliyesi_logs_userId_idx" ON public.satin_alma_irsaliyesi_logs USING btree ("userId");


--
-- Name: satin_alma_siparis_kalemleri_satınAlmaSiparisId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparis_kalemleri_satınAlmaSiparisId_idx" ON public.satin_alma_siparis_kalemleri USING btree ("satınAlmaSiparisId");


--
-- Name: satin_alma_siparis_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparis_kalemleri_stokId_idx" ON public.satin_alma_siparis_kalemleri USING btree ("stokId");


--
-- Name: satin_alma_siparis_logs_satınAlmaSiparisId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparis_logs_satınAlmaSiparisId_idx" ON public.satin_alma_siparis_logs USING btree ("satınAlmaSiparisId");


--
-- Name: satin_alma_siparis_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparis_logs_userId_idx" ON public.satin_alma_siparis_logs USING btree ("userId");


--
-- Name: satin_alma_siparisleri_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparisleri_cariId_idx" ON public.satin_alma_siparisleri USING btree ("cariId");


--
-- Name: satin_alma_siparisleri_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparisleri_createdAt_idx" ON public.satin_alma_siparisleri USING btree ("createdAt");


--
-- Name: satin_alma_siparisleri_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "satin_alma_siparisleri_deliveryNoteId_key" ON public.satin_alma_siparisleri USING btree ("deliveryNoteId");


--
-- Name: satin_alma_siparisleri_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX satin_alma_siparisleri_durum_idx ON public.satin_alma_siparisleri USING btree (durum);


--
-- Name: satin_alma_siparisleri_siparisNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "satin_alma_siparisleri_siparisNo_tenantId_key" ON public.satin_alma_siparisleri USING btree ("siparisNo", "tenantId");


--
-- Name: satin_alma_siparisleri_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparisleri_tenantId_idx" ON public.satin_alma_siparisleri USING btree ("tenantId");


--
-- Name: satin_alma_siparisleri_tenantId_siparisNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satin_alma_siparisleri_tenantId_siparisNo_idx" ON public.satin_alma_siparisleri USING btree ("tenantId", "siparisNo");


--
-- Name: satis_elemanlari_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_elemanlari_tenantId_idx" ON public.satis_elemanlari USING btree ("tenantId");


--
-- Name: satis_irsaliyeleri_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_cariId_idx" ON public.satis_irsaliyeleri USING btree ("cariId");


--
-- Name: satis_irsaliyeleri_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX satis_irsaliyeleri_durum_idx ON public.satis_irsaliyeleri USING btree (durum);


--
-- Name: satis_irsaliyeleri_irsaliyeNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "satis_irsaliyeleri_irsaliyeNo_tenantId_key" ON public.satis_irsaliyeleri USING btree ("irsaliyeNo", "tenantId");


--
-- Name: satis_irsaliyeleri_kaynakId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_kaynakId_idx" ON public.satis_irsaliyeleri USING btree ("kaynakId");


--
-- Name: satis_irsaliyeleri_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_tenantId_durum_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", durum);


--
-- Name: satis_irsaliyeleri_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_tenantId_idx" ON public.satis_irsaliyeleri USING btree ("tenantId");


--
-- Name: satis_irsaliyeleri_tenantId_irsaliyeNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeNo_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", "irsaliyeNo");


--
-- Name: satis_irsaliyeleri_tenantId_irsaliyeTarihi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", "irsaliyeTarihi");


--
-- Name: satis_irsaliyesi_kalemleri_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyesi_kalemleri_irsaliyeId_idx" ON public.satis_irsaliyesi_kalemleri USING btree ("irsaliyeId");


--
-- Name: satis_irsaliyesi_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyesi_kalemleri_stokId_idx" ON public.satis_irsaliyesi_kalemleri USING btree ("stokId");


--
-- Name: satis_irsaliyesi_logs_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyesi_logs_irsaliyeId_idx" ON public.satis_irsaliyesi_logs USING btree ("irsaliyeId");


--
-- Name: satis_irsaliyesi_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "satis_irsaliyesi_logs_userId_idx" ON public.satis_irsaliyesi_logs USING btree ("userId");


--
-- Name: sayim_kalemleri_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sayim_kalemleri_locationId_idx" ON public.sayim_kalemleri USING btree ("locationId");


--
-- Name: sayim_kalemleri_sayimId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sayim_kalemleri_sayimId_idx" ON public.sayim_kalemleri USING btree ("sayimId");


--
-- Name: sayim_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sayim_kalemleri_stokId_idx" ON public.sayim_kalemleri USING btree ("stokId");


--
-- Name: sayimlar_sayimNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "sayimlar_sayimNo_tenantId_key" ON public.sayimlar USING btree ("sayimNo", "tenantId");


--
-- Name: sayimlar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sayimlar_tenantId_idx" ON public.sayimlar USING btree ("tenantId");


--
-- Name: sayimlar_tenantId_sayimNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sayimlar_tenantId_sayimNo_idx" ON public.sayimlar USING btree ("tenantId", "sayimNo");


--
-- Name: service_invoices_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_invoices_cariId_idx" ON public.service_invoices USING btree ("cariId");


--
-- Name: service_invoices_invoiceNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "service_invoices_invoiceNo_tenantId_key" ON public.service_invoices USING btree ("invoiceNo", "tenantId");


--
-- Name: service_invoices_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_invoices_tenantId_idx" ON public.service_invoices USING btree ("tenantId");


--
-- Name: service_invoices_tenantId_issueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_invoices_tenantId_issueDate_idx" ON public.service_invoices USING btree ("tenantId", "issueDate");


--
-- Name: service_invoices_workOrderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "service_invoices_workOrderId_key" ON public.service_invoices USING btree ("workOrderId");


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_refreshToken_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_refreshToken_idx" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_refreshToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "sessions_refreshToken_key" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: siparis_hazirliklar_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparis_hazirliklar_locationId_idx" ON public.siparis_hazirliklar USING btree ("locationId");


--
-- Name: siparis_hazirliklar_siparisId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparis_hazirliklar_siparisId_idx" ON public.siparis_hazirliklar USING btree ("siparisId");


--
-- Name: siparis_hazirliklar_siparisKalemiId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparis_hazirliklar_siparisKalemiId_idx" ON public.siparis_hazirliklar USING btree ("siparisKalemiId");


--
-- Name: siparis_logs_siparisId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparis_logs_siparisId_idx" ON public.siparis_logs USING btree ("siparisId");


--
-- Name: siparis_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparis_logs_userId_idx" ON public.siparis_logs USING btree ("userId");


--
-- Name: siparisler_deliveryNoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparisler_deliveryNoteId_idx" ON public.siparisler USING btree ("deliveryNoteId");


--
-- Name: siparisler_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "siparisler_deliveryNoteId_key" ON public.siparisler USING btree ("deliveryNoteId");


--
-- Name: siparisler_siparisNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "siparisler_siparisNo_tenantId_key" ON public.siparisler USING btree ("siparisNo", "tenantId");


--
-- Name: siparisler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparisler_tenantId_idx" ON public.siparisler USING btree ("tenantId");


--
-- Name: siparisler_tenantId_siparisNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "siparisler_tenantId_siparisNo_idx" ON public.siparisler USING btree ("tenantId", "siparisNo");


--
-- Name: stock_cost_history_stok_id_computed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_cost_history_stok_id_computed_at_idx ON public.stock_cost_history USING btree (stok_id, computed_at);


--
-- Name: stock_moves_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_createdAt_idx" ON public.stock_moves USING btree ("createdAt");


--
-- Name: stock_moves_fromWarehouseId_fromLocationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_fromWarehouseId_fromLocationId_idx" ON public.stock_moves USING btree ("fromWarehouseId", "fromLocationId");


--
-- Name: stock_moves_moveType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_moveType_idx" ON public.stock_moves USING btree ("moveType");


--
-- Name: stock_moves_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_productId_idx" ON public.stock_moves USING btree ("productId");


--
-- Name: stock_moves_refType_refId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_refType_refId_idx" ON public.stock_moves USING btree ("refType", "refId");


--
-- Name: stock_moves_toWarehouseId_toLocationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stock_moves_toWarehouseId_toLocationId_idx" ON public.stock_moves USING btree ("toWarehouseId", "toLocationId");


--
-- Name: stok_esdegers_stok1Id_stok2Id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "stok_esdegers_stok1Id_stok2Id_key" ON public.stok_esdegers USING btree ("stok1Id", "stok2Id");


--
-- Name: stok_hareketleri_faturaKalemiId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stok_hareketleri_faturaKalemiId_idx" ON public.stok_hareketleri USING btree ("faturaKalemiId");


--
-- Name: stok_hareketleri_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stok_hareketleri_tenantId_idx" ON public.stok_hareketleri USING btree ("tenantId");


--
-- Name: stoklar_barkod_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "stoklar_barkod_tenantId_key" ON public.stoklar USING btree (barkod, "tenantId");


--
-- Name: stoklar_stokKodu_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "stoklar_stokKodu_tenantId_key" ON public.stoklar USING btree ("stokKodu", "tenantId");


--
-- Name: stoklar_tenantId_barkod_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stoklar_tenantId_barkod_idx" ON public.stoklar USING btree ("tenantId", barkod);


--
-- Name: stoklar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stoklar_tenantId_idx" ON public.stoklar USING btree ("tenantId");


--
-- Name: stoklar_tenantId_stokKodu_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "stoklar_tenantId_stokKodu_idx" ON public.stoklar USING btree ("tenantId", "stokKodu");


--
-- Name: subscriptions_endDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_endDate_idx" ON public.subscriptions USING btree ("endDate");


--
-- Name: subscriptions_iyzicoSubscriptionRef_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_iyzicoSubscriptionRef_key" ON public.subscriptions USING btree ("iyzicoSubscriptionRef");


--
-- Name: subscriptions_nextBillingDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_nextBillingDate_idx" ON public.subscriptions USING btree ("nextBillingDate");


--
-- Name: subscriptions_planId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_planId_idx" ON public.subscriptions USING btree ("planId");


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_tenantId_idx" ON public.subscriptions USING btree ("tenantId");


--
-- Name: subscriptions_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON public.subscriptions USING btree ("tenantId");


--
-- Name: system_parameters_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX system_parameters_category_idx ON public.system_parameters USING btree (category);


--
-- Name: system_parameters_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "system_parameters_tenantId_idx" ON public.system_parameters USING btree ("tenantId");


--
-- Name: system_parameters_tenantId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "system_parameters_tenantId_key_key" ON public.system_parameters USING btree ("tenantId", key);


--
-- Name: tahsilatlar_tenantId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tahsilatlar_tenantId_deletedAt_idx" ON public.tahsilatlar USING btree ("tenantId", "deletedAt");


--
-- Name: tahsilatlar_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tahsilatlar_tenantId_idx" ON public.tahsilatlar USING btree ("tenantId");


--
-- Name: tahsilatlar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tahsilatlar_tenantId_tarih_idx" ON public.tahsilatlar USING btree ("tenantId", tarih);


--
-- Name: teklif_logs_teklifId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teklif_logs_teklifId_idx" ON public.teklif_logs USING btree ("teklifId");


--
-- Name: teklif_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teklif_logs_userId_idx" ON public.teklif_logs USING btree ("userId");


--
-- Name: teklifler_teklifNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "teklifler_teklifNo_tenantId_key" ON public.teklifler USING btree ("teklifNo", "tenantId");


--
-- Name: teklifler_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teklifler_tenantId_idx" ON public.teklifler USING btree ("tenantId");


--
-- Name: teklifler_tenantId_teklifNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "teklifler_tenantId_teklifNo_idx" ON public.teklifler USING btree ("tenantId", "teklifNo");


--
-- Name: tenant_purge_audits_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tenant_purge_audits_adminId_idx" ON public.tenant_purge_audits USING btree ("adminId");


--
-- Name: tenant_purge_audits_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tenant_purge_audits_createdAt_idx" ON public.tenant_purge_audits USING btree ("createdAt");


--
-- Name: tenant_purge_audits_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tenant_purge_audits_tenantId_idx" ON public.tenant_purge_audits USING btree ("tenantId");


--
-- Name: tenant_settings_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tenant_settings_tenantId_key" ON public.tenant_settings USING btree ("tenantId");


--
-- Name: tenants_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tenants_createdAt_idx" ON public.tenants USING btree ("createdAt");


--
-- Name: tenants_domain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_domain_idx ON public.tenants USING btree (domain);


--
-- Name: tenants_domain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenants_domain_key ON public.tenants USING btree (domain);


--
-- Name: tenants_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_status_idx ON public.tenants USING btree (status);


--
-- Name: tenants_subdomain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_subdomain_idx ON public.tenants USING btree (subdomain);


--
-- Name: tenants_subdomain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenants_subdomain_key ON public.tenants USING btree (subdomain);


--
-- Name: tenants_uuid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tenants_uuid_key ON public.tenants USING btree (uuid);


--
-- Name: urun_raflar_stokId_rafId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "urun_raflar_stokId_rafId_key" ON public.urun_raflar USING btree ("stokId", "rafId");


--
-- Name: user_licenses_licenseType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_licenses_licenseType_idx" ON public.user_licenses USING btree ("licenseType");


--
-- Name: user_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_licenses_moduleId_idx" ON public.user_licenses USING btree ("moduleId");


--
-- Name: user_licenses_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_licenses_userId_idx" ON public.user_licenses USING btree ("userId");


--
-- Name: user_licenses_userId_licenseType_moduleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_licenses_userId_licenseType_moduleId_key" ON public.user_licenses USING btree ("userId", "licenseType", "moduleId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_email_tenantId_key" ON public.users USING btree (email, "tenantId");


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_tenantId_idx" ON public.users USING btree ("tenantId");


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_uuid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_uuid_key ON public.users USING btree (uuid);


--
-- Name: vehicle_expenses_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicle_expenses_tarih_idx ON public.vehicle_expenses USING btree (tarih);


--
-- Name: vehicle_expenses_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "vehicle_expenses_tenantId_idx" ON public.vehicle_expenses USING btree ("tenantId");


--
-- Name: vehicle_expenses_vehicleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "vehicle_expenses_vehicleId_idx" ON public.vehicle_expenses USING btree ("vehicleId");


--
-- Name: warehouse_critical_stocks_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_critical_stocks_productId_idx" ON public.warehouse_critical_stocks USING btree ("productId");


--
-- Name: warehouse_critical_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_critical_stocks_warehouseId_idx" ON public.warehouse_critical_stocks USING btree ("warehouseId");


--
-- Name: warehouse_critical_stocks_warehouseId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "warehouse_critical_stocks_warehouseId_productId_key" ON public.warehouse_critical_stocks USING btree ("warehouseId", "productId");


--
-- Name: warehouse_transfer_items_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfer_items_stokId_idx" ON public.warehouse_transfer_items USING btree ("stokId");


--
-- Name: warehouse_transfer_items_transferId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfer_items_transferId_idx" ON public.warehouse_transfer_items USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_transferId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfer_logs_transferId_idx" ON public.warehouse_transfer_logs USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfer_logs_userId_idx" ON public.warehouse_transfer_logs USING btree ("userId");


--
-- Name: warehouse_transfers_fromWarehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfers_fromWarehouseId_idx" ON public.warehouse_transfers USING btree ("fromWarehouseId");


--
-- Name: warehouse_transfers_tarih_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX warehouse_transfers_tarih_idx ON public.warehouse_transfers USING btree (tarih);


--
-- Name: warehouse_transfers_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfers_tenantId_durum_idx" ON public.warehouse_transfers USING btree ("tenantId", durum);


--
-- Name: warehouse_transfers_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfers_tenantId_idx" ON public.warehouse_transfers USING btree ("tenantId");


--
-- Name: warehouse_transfers_toWarehouseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouse_transfers_toWarehouseId_idx" ON public.warehouse_transfers USING btree ("toWarehouseId");


--
-- Name: warehouse_transfers_transferNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "warehouse_transfers_transferNo_tenantId_key" ON public.warehouse_transfers USING btree ("transferNo", "tenantId");


--
-- Name: warehouses_code_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "warehouses_code_tenantId_key" ON public.warehouses USING btree (code, "tenantId");


--
-- Name: warehouses_tenantId_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouses_tenantId_code_idx" ON public.warehouses USING btree ("tenantId", code);


--
-- Name: warehouses_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "warehouses_tenantId_idx" ON public.warehouses USING btree ("tenantId");


--
-- Name: work_order_activities_workOrderId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_order_activities_workOrderId_createdAt_idx" ON public.work_order_activities USING btree ("workOrderId", "createdAt");


--
-- Name: work_order_activities_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_order_activities_workOrderId_idx" ON public.work_order_activities USING btree ("workOrderId");


--
-- Name: work_order_items_stokId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_order_items_stokId_idx" ON public.work_order_items USING btree ("stokId");


--
-- Name: work_order_items_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_order_items_workOrderId_idx" ON public.work_order_items USING btree ("workOrderId");


--
-- Name: work_orders_cariId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_orders_cariId_idx" ON public.work_orders USING btree ("cariId");


--
-- Name: work_orders_technicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_orders_technicianId_idx" ON public.work_orders USING btree ("technicianId");


--
-- Name: work_orders_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_orders_tenantId_createdAt_idx" ON public.work_orders USING btree ("tenantId", "createdAt");


--
-- Name: work_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_orders_tenantId_idx" ON public.work_orders USING btree ("tenantId");


--
-- Name: work_orders_tenantId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "work_orders_tenantId_status_idx" ON public.work_orders USING btree ("tenantId", status);


--
-- Name: work_orders_workOrderNo_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "work_orders_workOrderNo_tenantId_key" ON public.work_orders USING btree ("workOrderNo", "tenantId");


--
-- Name: audit_logs audit_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_avansId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_avansId_fkey" FOREIGN KEY ("avansId") REFERENCES public.avanslar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.maas_planlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avanslar avanslar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avanslar avanslar_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avanslar avanslar_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avanslar avanslar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havale_logs banka_havale_logs_bankaHavaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT "banka_havale_logs_bankaHavaleId_fkey" FOREIGN KEY ("bankaHavaleId") REFERENCES public.banka_havaleler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havale_logs banka_havale_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT "banka_havale_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_bankaHesabiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: banka_havaleler banka_havaleler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havaleler banka_havaleler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT "banka_hesap_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_hesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT "banka_hesap_hareketler_hesapId_fkey" FOREIGN KEY ("hesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_hesaplari banka_hesaplari_bankaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_hesaplari
    ADD CONSTRAINT "banka_hesaplari_bankaId_fkey" FOREIGN KEY ("bankaId") REFERENCES public.bankalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_kredi_planlari banka_kredi_planlari_krediId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_kredi_planlari
    ADD CONSTRAINT "banka_kredi_planlari_krediId_fkey" FOREIGN KEY ("krediId") REFERENCES public.banka_krediler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_krediler banka_krediler_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banka_krediler
    ADD CONSTRAINT "banka_krediler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bankalar bankalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bankalar
    ADD CONSTRAINT "bankalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: basit_siparisler basit_siparisler_firmaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: basit_siparisler basit_siparisler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: basit_siparisler basit_siparisler_urunId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bordrolar bordrolar_bankaHesabiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_adresler cari_adresler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_adresler
    ADD CONSTRAINT "cari_adresler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_bankalar cari_bankalar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_bankalar
    ADD CONSTRAINT "cari_bankalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_hareketler cari_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_hareketler cari_hareketler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT "cari_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_yetkililer cari_yetkililer_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cari_yetkililer
    ADD CONSTRAINT "cari_yetkililer_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cariler cariler_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT "cariler_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cariler cariler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT "cariler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senet_logs cek_senet_logs_cekSenetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT "cek_senet_logs_cekSenetId_fkey" FOREIGN KEY ("cekSenetId") REFERENCES public.cek_senetler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senet_logs cek_senet_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT "cek_senet_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cek_senetler cek_senetler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_sonBordroId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_sonBordroId_fkey" FOREIGN KEY ("sonBordroId") REFERENCES public.bordrolar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_tahsilKasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_tahsilKasaId_fkey" FOREIGN KEY ("tahsilKasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senetler cek_senetler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: code_templates code_templates_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT "code_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_vehicles company_vehicles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT "company_vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_vehicles company_vehicles_zimmetliPersonelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_vehicles
    ADD CONSTRAINT "company_vehicles_zimmetliPersonelId_fkey" FOREIGN KEY ("zimmetliPersonelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_vehicles customer_vehicles_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT "customer_vehicles_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_vehicles customer_vehicles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_vehicles
    ADD CONSTRAINT "customer_vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deleted_banka_havaleler deleted_banka_havaleler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_banka_havaleler
    ADD CONSTRAINT "deleted_banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deleted_cek_senetler deleted_cek_senetler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_cek_senetler
    ADD CONSTRAINT "deleted_cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: efatura_xml efatura_xml_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.efatura_xml
    ADD CONSTRAINT "efatura_xml_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_kalemleri fatura_kalemleri_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_kalemleri fatura_kalemleri_purchaseOrderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES public.purchase_order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fatura_kalemleri fatura_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fatura_logs fatura_logs_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT "fatura_logs_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_logs fatura_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT "fatura_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_tahsilatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey" FOREIGN KEY ("tahsilatId") REFERENCES public.tahsilatlar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faturalar faturalar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: faturalar faturalar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satinAlmaIrsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satinAlmaIrsaliyeId_fkey" FOREIGN KEY ("satinAlmaIrsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satinAlmaSiparisiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satinAlmaSiparisiId_fkey" FOREIGN KEY ("satinAlmaSiparisiId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faturalar faturalar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT "firma_kredi_karti_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_kartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT "firma_kredi_karti_hareketler_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firma_kredi_karti_hatirlaticilar firma_kredi_karti_hatirlaticilar_kartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_karti_hatirlaticilar
    ADD CONSTRAINT "firma_kredi_karti_hatirlaticilar_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firma_kredi_kartlari firma_kredi_kartlari_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firma_kredi_kartlari
    ADD CONSTRAINT "firma_kredi_kartlari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_partRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_partRequestId_fkey" FOREIGN KEY ("partRequestId") REFERENCES public.part_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invitations invitations_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_faturaKalemiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_faturaKalemiId_fkey" FOREIGN KEY ("faturaKalemiId") REFERENCES public.fatura_kalemleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_profit invoice_profit_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_serviceInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_serviceInvoiceId_fkey" FOREIGN KEY ("serviceInvoiceId") REFERENCES public.service_invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: journal_entry_lines journal_entry_lines_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT "journal_entry_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public.journal_entries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kasa_hareketler kasa_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasa_hareketler kasa_hareketler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasa_hareketler kasa_hareketler_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kasalar kasalar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasalar kasalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kasalar kasalar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: locations locations_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_odemeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_odemeId_fkey" FOREIGN KEY ("odemeId") REFERENCES public.maas_odemeler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odemeler maas_odemeler_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.maas_planlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_planlari maas_planlari_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT "maas_planlari_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_planlari maas_planlari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT "maas_planlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: masraflar masraflar_kategoriId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT "masraflar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES public.masraf_kategoriler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: masraflar masraflar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT "masraflar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_licenses module_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_licenses module_licenses_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_requests part_requests_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: part_requests part_requests_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: part_requests part_requests_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_requests part_requests_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_requests
    ADD CONSTRAINT "part_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personel_odemeler personel_odemeler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personel_odemeler personel_odemeler_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personel_odemeler personel_odemeler_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personeller personeller_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personeller personeller_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personeller personeller_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_cards price_cards_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_cards price_cards_stok_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_stok_id_fkey FOREIGN KEY (stok_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_cards price_cards_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_barcodes product_barcodes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT "product_barcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: raflar raflar_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raflar
    ADD CONSTRAINT "raflar_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.depolar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_kaynakId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT "satin_alma_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT "satin_alma_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_satınAlmaSiparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT "satin_alma_siparis_kalemleri_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT "satin_alma_siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_satınAlmaSiparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT "satin_alma_siparis_logs_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT "satin_alma_siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_elemanlari satis_elemanlari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_elemanlari
    ADD CONSTRAINT "satis_elemanlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_kaynakId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT "satis_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT "satis_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT "satis_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT "satis_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayim_kalemleri sayim_kalemleri_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayim_kalemleri sayim_kalemleri_sayimId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_sayimId_fkey" FOREIGN KEY ("sayimId") REFERENCES public.sayimlar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sayim_kalemleri sayim_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sayimlar sayimlar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayimlar sayimlar_onaylayanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_onaylayanId_fkey" FOREIGN KEY ("onaylayanId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayimlar sayimlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sayimlar sayimlar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_invoices service_invoices_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_invoices service_invoices_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_invoices service_invoices_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_invoices service_invoices_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_invoices
    ADD CONSTRAINT "service_invoices_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_hazirlayan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT siparis_hazirliklar_hazirlayan_fkey FOREIGN KEY (hazirlayan) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_siparisKalemiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_siparisKalemiId_fkey" FOREIGN KEY ("siparisKalemiId") REFERENCES public.siparis_kalemleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_kalemleri siparis_kalemleri_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT "siparis_kalemleri_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_kalemleri siparis_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT "siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparis_logs siparis_logs_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT "siparis_logs_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_logs siparis_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT "siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparisler siparisler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparisler siparisler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_cost_history stock_cost_history_stok_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_stok_id_fkey FOREIGN KEY (stok_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_moves stock_moves_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stok_esdegers stok_esdegers_stok1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT "stok_esdegers_stok1Id_fkey" FOREIGN KEY ("stok1Id") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_esdegers stok_esdegers_stok2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT "stok_esdegers_stok2Id_fkey" FOREIGN KEY ("stok2Id") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_faturaKalemiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_faturaKalemiId_fkey" FOREIGN KEY ("faturaKalemiId") REFERENCES public.fatura_kalemleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stok_hareketleri stok_hareketleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stoklar stoklar_esdegerGrupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT "stoklar_esdegerGrupId_fkey" FOREIGN KEY ("esdegerGrupId") REFERENCES public.esdeger_gruplar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stoklar stoklar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT "stoklar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: system_parameters system_parameters_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT "system_parameters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tahsilatlar tahsilatlar_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tahsilatlar tahsilatlar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_firmaKrediKartiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_firmaKrediKartiId_fkey" FOREIGN KEY ("firmaKrediKartiId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_serviceInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_serviceInvoiceId_fkey" FOREIGN KEY ("serviceInvoiceId") REFERENCES public.service_invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_kalemleri teklif_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT "teklif_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teklif_kalemleri teklif_kalemleri_teklifId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT "teklif_kalemleri_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES public.teklifler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_logs teklif_logs_teklifId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT "teklif_logs_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES public.teklifler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_logs teklif_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT "teklif_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teklifler teklifler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklifler teklifler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tenant_purge_audits tenant_purge_audits_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT "tenant_purge_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_settings tenant_settings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: urun_raflar urun_raflar_rafId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT "urun_raflar_rafId_fkey" FOREIGN KEY ("rafId") REFERENCES public.raflar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: urun_raflar urun_raflar_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT "urun_raflar_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_licenses user_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_licenses user_licenses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicle_expenses vehicle_expenses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT "vehicle_expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vehicle_expenses vehicle_expenses_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_expenses
    ADD CONSTRAINT "vehicle_expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public.company_vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_hazirlayanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_hazirlayanUserId_fkey" FOREIGN KEY ("hazirlayanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_onaylayanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_onaylayanUserId_fkey" FOREIGN KEY ("onaylayanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfers warehouse_transfers_teslimAlanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_teslimAlanUserId_fkey" FOREIGN KEY ("teslimAlanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouses warehouses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_order_activities work_order_activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT "work_order_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_order_activities work_order_activities_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_activities
    ADD CONSTRAINT "work_order_activities_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_order_items work_order_items_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT "work_order_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_order_items work_order_items_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT "work_order_items_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_orders work_orders_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_customerVehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES public.customer_vehicles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_orders work_orders_technicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: work_orders work_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OVZaN5aMizjVO6fPodafYlYo3RGn0euN2vAHvCgP2O8Gutb8GBCIpcgotYQHdTS

