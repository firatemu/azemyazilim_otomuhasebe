import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as xml2js from 'xml2js';

@Injectable()
export class TcmbService {
    private readonly logger = new Logger(TcmbService.name);
    private cache: { timestamp: number; rates: Record<string, number> } | null = null;
    private readonly CACHE_TTL = 3600 * 1000; // 1 hour

    async getCurrentRate(currencyCode: string): Promise<number> {
        if (currencyCode === 'TRY') return 1.0;

        const now = Date.now();
        if (this.cache && (now - this.cache.timestamp < this.CACHE_TTL)) {
            this.logger.debug(`Returning cached rate for ${currencyCode}`);
            return this.cache.rates[currencyCode] || 0;
        }

        try {
            this.logger.log('Fetching exchange rates from TCMB...');
            const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml');
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(response.data);

            const rates: Record<string, number> = {};

            if (result.Tarih_Date && result.Tarih_Date.Currency) {
                for (const curr of result.Tarih_Date.Currency) {
                    const code = curr.$.CurrencyCode;
                    // TCMB uses ForexBuying for buying rate
                    const rate = parseFloat(curr.ForexBuying[0]);
                    if (code && !isNaN(rate)) {
                        rates[code] = rate;
                    }
                }
            }

            this.cache = { timestamp: now, rates };
            this.logger.log(`Rates updated. Cached ${Object.keys(rates).length} currencies.`);

            return rates[currencyCode] || 0;
        } catch (error) {
            this.logger.error(`Failed to fetch rates: ${error.message}`);
            // Return 0 or maybe throw error? 0 indicates failure to get rate.
            return 0;
        }
    }
}
