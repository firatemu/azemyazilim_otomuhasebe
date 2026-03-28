export interface CariYetkili {
    adSoyad: string;
    unvan: string;
    telefon: string;
    email: string;
    dahili: string;
    varsayilan: boolean;
    notlar: string;
}

export interface CariAdres {
    baslik: string;
    tip: 'FATURA' | 'SEVK' | 'DIGER';
    adres: string;
    il: string;
    ilce: string;
    postaKodu: string;
    varsayilan: boolean;
}

export interface CariBanka {
    bankaAdi: string;
    subeAdi: string;
    subeKodu: string;
    hesapNo: string;
    iban: string;
    paraBirimi: string;
    aciklama: string;
}

export interface CariFormData {
    // Genel
    cariKodu: string;
    unvan: string;
    tip: string; // 'MUSTERI' | 'TEDARIKCI' | 'HER_IKISI'
    sirketTipi: string; // 'KURUMSAL' | 'SAHIS'
    vergiNo: string;
    vergiDairesi: string;
    tcKimlikNo: string;
    isimSoyisim: string;
    aktif: boolean;
    satisElemaniId?: string;

    // İletişim (Ana)
    yetkili: string;
    telefon: string;
    email: string;
    webSite: string;
    faks: string;

    // Adres (Ana)
    ulke: string;
    il: string;
    ilce: string;
    adres: string;

    // Risk & Finans
    riskLimiti: number;
    riskDurumu: 'NORMAL' | 'RISKLI' | 'BLOKELI' | 'TAKIPTE';
    riskDurdurma: boolean;
    teminatTutar: number;
    vadeSuresi: string;
    vadeGun: number;
    paraBirimi: string;
    fiyatGrubu: string;
    bankaBilgileri: string;

    // Gruplama
    sektor: string;
    ozelKod1: string;
    ozelKod2: string;

    // E-Dönüşüm Bilgileri
    efaturaPostaKutusu?: string;
    efaturaGondericiBirim?: string;

    // İlişkiler
    yetkililer: CariYetkili[];
    ekAdresler: CariAdres[];
    tedarikciBankalar: CariBanka[];
}

export const initialCariFormData: CariFormData = {
    cariKodu: '',
    unvan: '',
    tip: 'MUSTERI',
    sirketTipi: 'KURUMSAL',
    vergiNo: '',
    vergiDairesi: '',
    tcKimlikNo: '',
    isimSoyisim: '',
    aktif: true,
    satisElemaniId: '',

    yetkili: '',
    telefon: '',
    email: '',
    webSite: '',
    faks: '',

    ulke: 'Türkiye',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    adres: '',

    riskLimiti: 0,
    riskDurumu: 'NORMAL',
    riskDurdurma: false,
    teminatTutar: 0,
    vadeSuresi: '',
    vadeGun: 30,
    paraBirimi: 'TRY',
    fiyatGrubu: '',
    bankaBilgileri: '',

    sektor: '',
    ozelKod1: '',
    ozelKod2: '',

    efaturaPostaKutusu: '',
    efaturaGondericiBirim: '',

    yetkililer: [],
    ekAdresler: [],
    tedarikciBankalar: [],
};
