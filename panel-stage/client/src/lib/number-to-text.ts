export function numberToTurkishText(amount: number | string): string {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount === 0) return 'Sıfır Türk Lirası';

    const birler = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
    const onlar = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
    const binler = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];

    const convertGroup = (n: number): string => {
        let str = '';

        // Yüzler basamağı
        if (n >= 100) {
            if (n >= 200 && Math.floor(n / 100) > 1) {
                str += birler[Math.floor(n / 100)] + ' ';
            }
            str += 'Yüz ';
            n %= 100;
        }

        // Onlar basamağı
        if (n >= 10) {
            str += onlar[Math.floor(n / 10)] + ' ';
            n %= 10;
        }

        // Birler basamağı
        if (n > 0) {
            str += birler[n] + ' ';
        }

        return str.trim();
    };

    const [liraPart, kurusPart] = numericAmount.toFixed(2).split('.');

    let liraText = '';
    let lira = parseInt(liraPart);
    let groupIndex = 0;

    if (lira === 0) {
        liraText = 'Sıfır';
    } else {
        while (lira > 0) {
            const group = lira % 1000;
            if (group > 0) {
                let groupText = convertGroup(group);

                // "Bir Bin" durumu için özel kontrol
                if (groupIndex === 1 && group === 1) {
                    groupText = '';
                }

                liraText = (groupText + ' ' + binler[groupIndex] + ' ' + liraText).trim();
            }
            lira = Math.floor(lira / 1000);
            groupIndex++;
        }
    }

    let result = `Yalnız ${liraText} Türk Lirası`;

    const kurus = parseInt(kurusPart);
    if (kurus > 0) {
        result += ` ${convertGroup(kurus)} Kuruş`;
    }

    return result;
}
