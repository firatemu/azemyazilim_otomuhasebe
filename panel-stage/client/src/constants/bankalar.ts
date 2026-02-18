export const TURKISH_BANKS_WITH_LOGOS: Record<string, string> = {
    'Ziraat Bankası': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ziraat_Bankas%C4%B1_logo.svg&width=500',
    'Türkiye İş Bankası': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/T%C3%BCrkiye_%C4%B0%C5%9F_Bankas%C4%B1_logo.svg&width=500',
    'Garanti BBVA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Garanti_BBVA_2019.svg&width=500',
    'Akbank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Akbank_logo.svg&width=500',
    'Yapı Kredi': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Yap%C4%B1_kredi_logo.png&width=500',
    'Halkbank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Halkbank_logo.svg&width=500',
    'VakıfBank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vak%C4%B1fbank-logo.svg&width=500',
    'QNB Finansbank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Qnb-finansbank.png&width=500',
    'DenizBank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/DenizBank_logo.svg&width=500',
    'TEB (Türk Ekonomi Bankası)': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/TEB_LOGO.png&width=500',
    'Kuveyt Türk': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Kuveyt_T%C3%BCrk_Logo.svg&width=500',
    'ING Bank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/ING_logo.png&width=500',
    'Enpara': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Enpara.com_Logo.svg&width=500',
    'Papara': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Papara_Logo.png&width=500',
    'Türkiye Finans': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/T%C3%BCrkiye_Finans_logo.svg&width=500',
    'Albaraka Türk': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Al_Baraka_Banking_Group_Logo.svg&width=500',
    'HSBC': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/HSBC_logo_%282018%29.svg&width=500',
    'Odeabank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Odeabank_logo.png&width=500',
    'Burgan Bank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Burgan_Bank_logo.svg&width=500',
    'Anadolubank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Anadolubank_Logo.png&width=500',
    'Şekerbank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/%C5%9Eekerbank_logo.svg&width=500',
    'Fibabanka': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Fibabanka_logo.svg&width=500',
    'Alternatif Bank': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Alternatif_Bank_logo.png&width=500',
    'ICBC Turkey': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/ICBC_Turkey_logo.png&width=500',
    'Emlak Katılım': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Emlak_Kat%C4%B1l%C4%B1m_logo.svg&width=500',
    'Ziraat Katılım': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ziraat_Kat%C4%B1l%C4%B1m_Bankas%C4%B1_Logo.svg&width=500',
    'Vakıf Katılım': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Vak%C4%B1f_Kat%C4%B1l%C4%B1m_Logo.svg&width=500',
    'Hayat Finans': 'https://www.hayatfinans.com.tr/Assets/img/logo.svg'
};

export const TURKISH_BANKS = Object.keys(TURKISH_BANKS_WITH_LOGOS);

export const getBankLogo = (bankaAd: string, logoFromDb?: string | null): string | null => {
    if (logoFromDb) return logoFromDb;
    return TURKISH_BANKS_WITH_LOGOS[bankaAd] || null;
};
