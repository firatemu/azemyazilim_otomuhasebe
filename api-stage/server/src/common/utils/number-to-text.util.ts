/**
 * Sayıları Türkçe metne çeviren yardımcı fonksiyon (Para birimi desteği ile)
 */
export function sayiyiYaziyaCevir(sayi: number): string {
    const birler = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
    const onlar = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
    const binler = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];

    let sonuc = '';
    let sayiStr = Math.floor(sayi).toString();

    // Basamakları üçerli gruplara ayır
    const gruplar: string[] = [];
    while (sayiStr.length > 0) {
        gruplar.push(sayiStr.slice(-3));
        sayiStr = sayiStr.slice(0, -3);
    }

    for (let i = 0; i < gruplar.length; i++) {
        let grupSonuc = '';
        const grup = gruplar[i].padStart(3, '0');

        // Yüzler basamağı
        if (grup[0] !== '0') {
            if (grup[0] !== '1') {
                grupSonuc += birler[parseInt(grup[0])];
            }
            grupSonuc += 'Yüz';
        }

        // Onlar basamağı
        grupSonuc += onlar[parseInt(grup[1])];

        // Birler basamağı
        if (i === 1 && grup === '001') {
            // "Bir Bin" yerine sadece "Bin" densin
            grupSonuc += '';
        } else {
            grupSonuc += (grupSonuc ? ' ' : '') + birler[parseInt(grup[2])];
        }

        if (grupSonuc !== '') {
            sonuc = grupSonuc + ' ' + binler[i] + ' ' + sonuc;
        }
    }

    if (sonuc === '') sonuc = 'Sıfır';

    // Kuruş hesabı
    const kurus = Math.round((sayi - Math.floor(sayi)) * 100);
    let kurusSonuc = '';
    if (kurus > 0) {
        const kurusStr = kurus.toString().padStart(2, '0');
        kurusSonuc = (onlar[parseInt(kurusStr[0])] ? onlar[parseInt(kurusStr[0])] + ' ' : '') + birler[parseInt(kurusStr[1])] + ' Kuruş';
    }

    return sonuc.trim().replace(/\s+/g, ' ') + ' TL ' + kurusSonuc.trim();
}
