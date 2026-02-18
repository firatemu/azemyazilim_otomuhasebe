import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
const { soap } = require('strong-soap');

@Injectable()
export class HizliService {
  private readonly logger = new Logger(HizliService.name);
  private readonly soapUrl = process.env.HIZLI_SOAP_URL || 'https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl';
  private cachedToken: string | null = null;
  private cachedHashedUsername: string | null = null;
  private cachedHashedPassword: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private encryptionStatus: 'success' | 'failed' | 'not_attempted' = 'not_attempted';
  private loginStatus: 'success' | 'failed' | 'not_attempted' = 'not_attempted';

  /**
   * SOAP client oluşturur ve Authorization header ekler
   */
  private async createSoapClient(token?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.soapUrl, {}, (err, client) => {
        if (err) {
          this.logger.error('SOAP client oluşturulamadı:', err);
          reject(err);
          return;
        }

        // Authorization header ekle
        if (token || this.cachedToken) {
          const authToken = token || this.cachedToken;
          client.addHttpHeader('Authorization', `Bearer ${authToken}`);
        }

        resolve(client);
      });
    });
  }

  /**
   * JWT token'ı decode eder ve expiry bilgisini çıkarır
   */
  private decodeJWT(token: string): { exp?: number; iat?: number;[key: string]: any } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1];
      // Base64 URL decode
      const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      this.logger.warn('JWT decode hatası:', error);
      return null;
    }
  }

  /**
   * Token'ı cache'ler ve expiry bilgisini kaydeder
   */
  private setToken(token: string): void {
    this.cachedToken = token;
    const decoded = this.decodeJWT(token);
    if (decoded && decoded.exp) {
      // exp Unix timestamp (seconds), Date nesnesine çevir (milliseconds)
      this.tokenExpiresAt = new Date(decoded.exp * 1000);
      this.logger.log(`Token expiry kaydedildi: ${this.tokenExpiresAt.toISOString()}`);
    } else {
      this.tokenExpiresAt = null;
      this.logger.warn('Token expiry bilgisi decode edilemedi');
    }
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol eder
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken) {
      return false;
    }
    if (!this.tokenExpiresAt) {
      // Expiry bilgisi yoksa token varsa geçerli kabul et
      return true;
    }
    // 5 dakika buffer ekle (token son 5 dakikada expire olacaksa yenile)
    const bufferTime = 5 * 60 * 1000; // 5 dakika
    return this.tokenExpiresAt.getTime() > Date.now() + bufferTime;
  }

  /**
   * Token durumunu kontrol eder
   */
  async getTokenStatus() {
    const hasToken = !!this.cachedToken;
    const isValid = this.isTokenValid();

    let daysUntilExpiry: number | null = null;
    if (this.tokenExpiresAt) {
      const diffMs = this.tokenExpiresAt.getTime() - Date.now();
      daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return {
      hasToken: hasToken,
      isValid: isValid,
      token: this.cachedToken ? this.cachedToken.substring(0, 50) + '...' : null,
      tokenLength: this.cachedToken ? this.cachedToken.length : 0,
      message: hasToken ? (isValid ? 'Token mevcut ve geçerli' : 'Token mevcut ancak süresi dolmuş') : 'Token bulunamadı',
      status: hasToken ? (isValid ? 'active' : 'expired') : 'not_configured',
      hashedUsername: this.cachedHashedUsername ? this.cachedHashedUsername.substring(0, 20) + '...' : null,
      hashedPassword: this.cachedHashedPassword ? this.cachedHashedPassword.substring(0, 20) + '...' : null,
      hashedUsernameLength: this.cachedHashedUsername ? this.cachedHashedUsername.length : 0,
      hashedPasswordLength: this.cachedHashedPassword ? this.cachedHashedPassword.length : 0,
      encryptionStatus: this.encryptionStatus === 'success' ? 'Başarılı' : this.encryptionStatus === 'failed' ? 'Başarısız' : 'Denenmedi',
      loginStatus: this.loginStatus === 'success' ? 'Başarılı' : this.loginStatus === 'failed' ? 'Başarısız' : 'Denenmedi',
      expiresAt: this.tokenExpiresAt ? this.tokenExpiresAt.toISOString() : null,
      daysUntilExpiry: daysUntilExpiry,
    };
  }

  /**
   * UtilEncrypt - Kullanıcı adı ve şifreyi hash'ler (REST API kullanır)
   * NOT: Bu metod tek kullanımlık araç olarak tasarlanmıştır
   */
  async utilEncrypt(username: string, password: string, secretKey: string) {
    try {
      const apiBase = process.env.HIZLI_API_BASE || 'https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi';
      const url = `${apiBase}/UtilEncrypt`;

      this.logger.log('🔍 UtilEncrypt REST API çağrılıyor (Username: ' + username + ', SecretKey uzunluğu: ' + secretKey.length + ')');

      const response = await axios.post(url, {
        secretKey: secretKey,
        username: username,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log('🔍 UtilEncrypt response: ' + JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      this.logger.error('UtilEncrypt REST API hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Login - Hash'lenmiş kullanıcı bilgileri ile token alır (REST API kullanır)
   */
  async login(usernameHash: string, passwordHash: string, apiKey: string) {
    try {
      const apiBase = process.env.HIZLI_API_BASE || 'https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi';
      const url = `${apiBase}/Login`;

      this.logger.log('🔍 Login REST API çağrılıyor (Username hash uzunluğu: ' + (usernameHash?.length || 0) + ')');

      const response = await axios.post(url, {
        apiKey: apiKey,
        username: usernameHash,
        password: passwordHash,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Debug: Response formatını log'la
      this.logger.log('🔍 Login response type: ' + typeof response.data);
      this.logger.log('🔍 Login response isArray: ' + Array.isArray(response.data));
      this.logger.log('🔍 Login response: ' + JSON.stringify(response.data, null, 2));

      // Response bir array dönüyor: [{ Token: "...", IsSucceeded: true, ... }]
      if (Array.isArray(response.data) && response.data.length > 0) {
        const loginOutput = response.data[0];

        // IsSucceeded kontrolü
        if (loginOutput.IsSucceeded === false) {
          const message = loginOutput.Message || 'Login başarısız';
          this.logger.error('Login başarısız:', message);
          throw new Error(`Login hatası: ${message}`);
        }

        // Token'ı cache'le (büyük harf: Token)
        if (loginOutput.Token) {
          this.setToken(loginOutput.Token);
          this.logger.log('Token başarıyla alındı ve cache\'lendi');
        } else {
          this.logger.error('Login response\'da Token field\'ı bulunamadı');
          throw new Error('Login başarılı ancak Token alınamadı');
        }
      } else if (response.data && typeof response.data === 'object') {
        // Fallback: Eğer array değilse direkt object olarak dene
        if (response.data.Token) {
          this.setToken(response.data.Token);
          this.logger.log('Token başarıyla alındı ve cache\'lendi (direct object)');
        } else if (response.data.token) {
          // Küçük harf fallback
          this.setToken(response.data.token);
          this.logger.log('Token başarıyla alındı ve cache\'lendi (lowercase fallback)');
        } else {
          this.logger.error('Login response\'da Token field\'ı bulunamadı (object format)');
          throw new Error('Login response formatı beklenmedik - Token bulunamadı');
        }
      } else {
        this.logger.error('Login response formatı beklenmedik:', typeof response.data);
        throw new Error('Login response formatı beklenmedik');
      }

      return response.data;
    } catch (error: any) {
      this.logger.error('Login REST API hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Otomatik login - .env dosyasındaki bilgileri kullanarak token alır
   */
  async autoLogin() {
    try {
      const username = process.env.HIZLI_USERNAME;
      const password = process.env.HIZLI_PASSWORD;
      const secretKey = process.env.HIZLI_SECRET_KEY;
      const apiKey = process.env.HIZLI_API_KEY;

      if (!username || !password || !secretKey || !apiKey) {
        throw new Error('Hızlı Teknoloji environment variables eksik. Lütfen .env dosyasını kontrol edin.');
      }

      this.logger.log('Otomatik login başlatılıyor...');

      // 1. UtilEncrypt ile hash'le (REST API)
      const encryptResult: any = await this.utilEncrypt(username, password, secretKey);

      // Debug: Response formatını log'la
      this.logger.log('🔍 UtilEncrypt raw response: ' + JSON.stringify(encryptResult, null, 2));

      // REST API response formatı: { username: '...', password: '...' }
      let usernameHash: string | undefined;
      let passwordHash: string | undefined;

      if (encryptResult && typeof encryptResult === 'object') {
        // REST API direkt olarak username ve password döner
        usernameHash = encryptResult.username;
        passwordHash = encryptResult.password;
      }

      // Hash değerleri bulunamadıysa hata ver
      if (!usernameHash || !passwordHash) {
        this.encryptionStatus = 'failed';
        this.logger.error('UtilEncrypt response formatı beklenmedik. Response:', JSON.stringify(encryptResult, null, 2));
        throw new Error(`UtilEncrypt hatası: Hash değerleri alınamadı. Response: ${JSON.stringify(encryptResult)}`);
      }

      this.logger.log('UtilEncrypt başarılı, login yapılıyor...');

      // 2. Login ile token al (REST API)
      const loginResult: any = await this.login(usernameHash, passwordHash, apiKey);

      // Hash bilgilerini cache'le
      this.cachedHashedUsername = usernameHash;
      this.cachedHashedPassword = passwordHash;
      this.encryptionStatus = 'success';

      // Login metodu içinde token cache'lendi, kontrol et
      if (this.cachedToken) {
        this.loginStatus = 'success';
        return {
          success: true,
          message: 'Token başarıyla alındı',
          token: this.cachedToken.substring(0, 50) + '...', // İlk 50 karakter göster
          tokenLength: this.cachedToken.length,
          hashedUsername: usernameHash.substring(0, 20) + '...', // İlk 20 karakter göster
          hashedPassword: passwordHash.substring(0, 20) + '...', // İlk 20 karakter göster
          hashedUsernameLength: usernameHash.length,
          hashedPasswordLength: passwordHash.length,
          encryptionStatus: 'Başarılı',
          loginStatus: 'Başarılı',
        };
      } else {
        this.loginStatus = 'failed';
        // Array formatından mesaj al
        let errorMessage = 'Login başarısız - token alınamadı';
        if (Array.isArray(loginResult) && loginResult.length > 0) {
          errorMessage = loginResult[0].Message || errorMessage;
        } else if (loginResult?.Message) {
          errorMessage = loginResult.Message;
        } else if (loginResult?.message) {
          errorMessage = loginResult.message;
        }

        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error: any) {
      this.logger.error('Otomatik login hatası:', error);
      throw error;
    }
  }

  /**
   * Token geçerliliğini kontrol eder ve gerekirse yeniler
   */
  async checkAndRefreshToken() {
    const status = await this.getTokenStatus();

    if (!status.isValid) {
      this.logger.log('Token geçersiz, yeni token alınıyor...');
      try {
        const loginResult = await this.autoLogin();
        const newStatus = await this.getTokenStatus();
        return {
          refreshed: true,
          previousStatus: status,
          newStatus: newStatus,
          loginResult: loginResult,
        };
      } catch (error: any) {
        this.logger.error('Token yenileme hatası:', error);
        return {
          refreshed: false,
          status: status,
          error: error.message,
        };
      }
    }

    return {
      refreshed: false,
      status: status,
      message: 'Token geçerli, yenileme gerekmiyor',
    };
  }

  /**
   * GetDocumentList - Belge listesini getirir (incoming documents için kullanılır)
   * C# projesinde GetIncomingDocuments yok, bunun yerine GetDocumentList kullanılıyor
   */
  async getIncoming(
    appType: number = 1,
    dateType: string = 'CreatedDate',
    startDate?: Date,
    endDate?: Date,
    isNew: boolean = false,
    isExport: boolean = false,
    isDraft: boolean | null = false,
    takenFromEntegrator: string = 'ALL',
    branchCodes: number[] | null = null
  ) {
    try {
      // Token yoksa veya geçersizse otomatik login dene
      if (!this.cachedToken || !this.isTokenValid()) {
        this.logger.log('Token yok veya geçersiz, otomatik login deneniyor...');
        try {
          await this.autoLogin();
          if (!this.cachedToken || !this.isTokenValid()) {
            return {
              success: false,
              documents: [],
              message: 'Token alınamadı veya geçersiz. Lütfen tekrar giriş yapınız.',
              total: 0,
              isSucceeded: false,
            };
          }
        } catch (error) {
          this.logger.error('Otomatik login başarısız:', error);
          return {
            success: false,
            documents: [],
            message: 'Token bulunamadı ve otomatik login başarısız. Önce login yapmalısınız.',
            total: 0,
            isSucceeded: false,
          };
        }
      }

      const client = await this.createSoapClient();

      // Tarih parametrelerini ayarla
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Son 30 gün
      const end = endDate || new Date();

      // Tarihleri UTC'ye çevir ve saat bilgisini sıfırla (sadece tarih kısmı)
      // C# DateTime formatına uygun olması için
      const normalizeDate = (date: Date): Date => {
        const normalized = new Date(date);
        normalized.setUTCHours(0, 0, 0, 0);
        return normalized;
      };

      const normalizedStart = normalizeDate(start);
      const normalizedEnd = normalizeDate(end);
      // End date için saat 23:59:59 yap (günün sonuna kadar)
      normalizedEnd.setUTCHours(23, 59, 59, 999);

      // SOAP için tarih formatı: ISO 8601 string veya Date nesnesi
      // strong-soap genellikle Date nesnesini otomatik olarak SOAP DateTime formatına çevirir
      // Ancak güvenli olması için ISO 8601 string formatına çevirelim
      const formatDateForSoap = (date: Date): string => {
        // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      this.logger.log(`🔍 GetDocumentList çağrılıyor: StartDate=${formatDateForSoap(start)}, EndDate=${formatDateForSoap(end)}`);

      return new Promise((resolve, reject) => {
        // SOAP için tarih formatı: C# DateTime formatına uygun olmalı
        // strong-soap Date nesnesini otomatik olarak SOAP DateTime formatına çevirir
        // Ancak tarih formatını kontrol etmek için logluyoruz
        this.logger.log(`🔍 GetDocumentList parametreleri: AppType=${appType}, DateType=${dateType}, StartDate=${start.toISOString()}, EndDate=${end.toISOString()}`);

        client.GetDocumentList(
          {
            AppType: appType,
            DateType: dateType,
            StartDate: normalizedStart, // Normalize edilmiş Date nesnesi
            EndDate: normalizedEnd, // Normalize edilmiş Date nesnesi (günün sonuna kadar)
            IsNew: isNew,
            IsExport: isExport,
            IsDraft: isDraft,
            TakenFromEntegrator: takenFromEntegrator,
            BranchCodes: branchCodes,
          },
          (err: any, result: any) => {
            if (err) {
              this.logger.error('GetDocumentList hatası:', JSON.stringify(err, null, 2));
              reject(err);
              return;
            }

            // SOAP response'unu detaylı logla - tüm yapıyı görmek için
            // Circular reference'ları handle etmek için replacer kullan
            const safeStringify = (obj: any, space?: number): string => {
              const seen = new WeakSet();
              return JSON.stringify(obj, (key, val) => {
                if (val != null && typeof val === 'object') {
                  if (seen.has(val)) {
                    return '[Circular]';
                  }
                  seen.add(val);
                }
                return val;
              }, space);
            };

            this.logger.log('🔍 GetDocumentList RAW SOAP response (FULL):', safeStringify(result, 2));

            // SOAP response formatı: result.GetDocumentListResult veya result
            // strong-soap bazen nested yapılar oluşturabilir
            const soapResult = result?.GetDocumentListResult || result;
            this.logger.log('🔍 GetDocumentList soapResult (PARSED):', safeStringify(soapResult, 2));

            // Tüm olası yolları kontrol et
            // 1. Direkt soapResult.documents
            // 2. soapResult.Documents
            // 3. soapResult.GetDocumentListResult.documents (nested)
            // 4. result.documents (orijinal result'tan)
            let documents: any = null;

            // Önce nested yapıları kontrol et
            if (soapResult?.GetDocumentListResult?.documents) {
              documents = soapResult.GetDocumentListResult.documents;
              this.logger.log('🔍 Documents found in: soapResult.GetDocumentListResult.documents');
            } else if (soapResult?.GetDocumentListResult?.Documents) {
              documents = soapResult.GetDocumentListResult.Documents;
              this.logger.log('🔍 Documents found in: soapResult.GetDocumentListResult.Documents');
            } else if (soapResult?.documents) {
              documents = soapResult.documents;
              this.logger.log('🔍 Documents found in: soapResult.documents');
            } else if (soapResult?.Documents) {
              documents = soapResult.Documents;
              this.logger.log('🔍 Documents found in: soapResult.Documents');
            } else if (result?.documents) {
              documents = result.documents;
              this.logger.log('🔍 Documents found in: result.documents');
            } else if (result?.Documents) {
              documents = result.Documents;
              this.logger.log('🔍 Documents found in: result.Documents');
            } else {
              // Tüm keys'leri logla
              this.logger.warn('🔍 Documents field bulunamadı. soapResult keys:', Object.keys(soapResult || {}));
              this.logger.warn('🔍 result keys:', Object.keys(result || {}));
              if (soapResult?.GetDocumentListResult) {
                this.logger.warn('🔍 GetDocumentListResult keys:', Object.keys(soapResult.GetDocumentListResult || {}));
              }
            }

            // documents field'ı var mı kontrol et (null olsa bile)
            const hasDocumentsField = documents !== undefined;

            this.logger.log(`🔍 GetDocumentList documents field kontrolü: hasField=${hasDocumentsField}, value=${documents === null ? 'null' : documents === undefined ? 'undefined' : 'exists'}, type=${typeof documents}, isArray=${Array.isArray(documents)}`);

            // strong-soap bazen tek document'i array yerine object olarak döndürebilir
            // veya documents field'ı farklı bir yapıda olabilir
            let finalDocuments: any[] = [];

            if (documents === null || documents === undefined) {
              this.logger.warn('🔍 GetDocumentList: documents field null veya undefined.');
              finalDocuments = [];
            } else if (Array.isArray(documents)) {
              // Normal array durumu
              finalDocuments = documents;
              this.logger.log(`🔍 GetDocumentList: ${documents.length} belge bulundu (array)!`);
            } else if (typeof documents === 'object') {
              // Object durumu - strong-soap bazen tek item'ı object olarak döndürebilir
              // Veya documents bir object içinde array olabilir
              this.logger.log('🔍 GetDocumentList: documents bir object, detaylı inceleme yapılıyor...');
              this.logger.log('🔍 documents object keys:', Object.keys(documents));
              this.logger.log('🔍 documents object sample:', safeStringify(documents).substring(0, 500));

              // Eğer object'in içinde array varsa (örn: documents.item veya documents.Document)
              if (Array.isArray(documents.item)) {
                finalDocuments = documents.item;
                this.logger.log(`🔍 GetDocumentList: ${documents.item.length} belge bulundu (documents.item array)!`);
              } else if (Array.isArray(documents.Document)) {
                finalDocuments = documents.Document;
                this.logger.log(`🔍 GetDocumentList: ${documents.Document.length} belge bulundu (documents.Document array)!`);
              } else if (Array.isArray(documents.document)) {
                finalDocuments = documents.document;
                this.logger.log(`🔍 GetDocumentList: ${documents.document.length} belge bulundu (documents.document array)!`);
              } else if (documents.UUID || documents.DocumentId) {
                // Tek bir document object'i - array'e çevir
                finalDocuments = [documents];
                this.logger.log('🔍 GetDocumentList: 1 belge bulundu (tek object, array\'e çevrildi)!');
              } else {
                // Object ama document değil, boş array döndür
                this.logger.warn('🔍 GetDocumentList: documents object ama document yapısı değil:', safeStringify(documents).substring(0, 500));
                finalDocuments = [];
              }
            } else {
              this.logger.warn('🔍 GetDocumentList: documents beklenmeyen tip:', typeof documents);
              finalDocuments = [];
            }

            documents = finalDocuments;

            const isSucceeded = soapResult?.IsSucceeded !== undefined ? soapResult.IsSucceeded : true;
            const message = soapResult?.Message || soapResult?.message || 'Başarılı';

            this.logger.log(`🔍 GetDocumentList SONUÇ: ${documents.length} belge bulundu, IsSucceeded: ${isSucceeded}, Message: ${message}`);

            resolve({
              success: isSucceeded,
              documents: documents,
              total: documents.length, // Array uzunluğunu kullan
              isSucceeded: isSucceeded,
              message: message,
            });
          }
        );
      });
    } catch (error) {
      this.logger.error('GetDocumentList exception:', error);
      throw error;
    }
  }

  /**
   * GetDocumentContent - Belge içeriğini getirir (XML veya HTML formatında)
   * SOAP GetDocumentFile metodunu kullanır
   * @param uuid - Belge UUID
   * @param type - Belge tipi: 'XML' veya 'HTML' (varsayılan: 'XML')
   */
  async getDocumentContent(uuid: string, type: string = 'XML') {
    try {
      if (!this.cachedToken || !this.isTokenValid()) {
        this.logger.log('Token yok veya geçersiz, otomatik login deneniyor...');
        await this.autoLogin();
        if (!this.cachedToken || !this.isTokenValid()) {
          throw new Error('Token bulunamadı veya geçersiz. Lütfen tekrar giriş yapınız.');
        }
      }

      const client = await this.createSoapClient();

      this.logger.log(`🔍 GetDocumentFile çağrılıyor: UUID=${uuid}`);

      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:580', message: 'GetDocumentFile SOAP call', data: { uuid, hasToken: !!this.cachedToken }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion

      return new Promise((resolve, reject) => {
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:586', message: 'GetDocumentFile params', data: { uuid, paramFormat: 'UUID/Type' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
        // #endregion
        // GetDocumentFile parametreleri: AppType (1 = Gelen e-Fatura), Uuid, Tur (opsiyonel: 'XML', 'HTML' veya 'PDF')
        const params: any = {
          AppType: 1, // 1 = Gelen e-Fatura (incoming)
          Uuid: uuid, // WSDL'de Uuid (büyük U) olarak tanımlı
          Tur: type || 'XML', // Type değil, Tur! WSDL'de Tur olarak tanımlı. 'XML', 'HTML' veya 'PDF' olabilir
        };

        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:595', message: 'GetDocumentFile params before call', data: { params, uuid }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
        // #endregion

        client.GetDocumentFile(
          params,
          (err: any, result: any) => {
            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:592', message: 'GetDocumentFile SOAP response', data: { hasError: !!err, hasResult: !!result, resultType: typeof result }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion

            if (err) {
              this.logger.error('GetDocumentFile hatası:', JSON.stringify(err, null, 2));
              // #region agent log
              fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:597', message: 'GetDocumentFile error', data: { error: err?.message || JSON.stringify(err) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
              // #endregion
              reject(err);
              return;
            }

            this.logger.log('🔍 GetDocumentFile RAW SOAP response:', JSON.stringify(result, null, 2));

            // SOAP response formatı: result.GetDocumentFileResult veya result
            const soapResult = result?.GetDocumentFileResult || result;

            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:605', message: 'GetDocumentFile soapResult keys', data: { soapResultKeys: Object.keys(soapResult || {}), hasGetDocumentFileResult: !!result?.GetDocumentFileResult }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion

            // DocumentContent field'ını bul
            // Log'lardan görüldüğü üzere: soapResultKeys: ["IsSucceeded","Message","DocumentFile"]
            let documentContent: string | null = null;

            // Önce DocumentFile field'ını kontrol et (log'larda görüldü)
            if (soapResult?.DocumentFile) {
              // DocumentFile bir object olabilir, içinde Content field'ı olabilir
              if (typeof soapResult.DocumentFile === 'string') {
                documentContent = soapResult.DocumentFile;
              } else if (soapResult.DocumentFile?.Content) {
                documentContent = soapResult.DocumentFile.Content;
              } else if (soapResult.DocumentFile?.content) {
                documentContent = soapResult.DocumentFile.content;
              } else if (soapResult.DocumentFile?.DocumentContent) {
                documentContent = soapResult.DocumentFile.DocumentContent;
              }
            } else if (soapResult?.documentFile) {
              if (typeof soapResult.documentFile === 'string') {
                documentContent = soapResult.documentFile;
              } else if (soapResult.documentFile?.Content) {
                documentContent = soapResult.documentFile.Content;
              }
            } else if (soapResult?.DocumentContent) {
              documentContent = soapResult.DocumentContent;
            } else if (soapResult?.documentContent) {
              documentContent = soapResult.documentContent;
            } else if (soapResult?.Content) {
              documentContent = soapResult.Content;
            } else if (soapResult?.content) {
              documentContent = soapResult.content;
            } else if (soapResult?.FileContent) {
              documentContent = soapResult.FileContent;
            } else if (soapResult?.fileContent) {
              documentContent = soapResult.fileContent;
            } else if (typeof soapResult === 'string') {
              documentContent = soapResult;
            }

            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:625', message: 'GetDocumentFile content search result', data: { foundContent: !!documentContent, soapResultType: typeof soapResult }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion

            const isSucceeded = soapResult?.IsSucceeded !== undefined ? soapResult.IsSucceeded : true;
            const message = soapResult?.Message || soapResult?.message || 'Başarılı';

            if (!isSucceeded) {
              this.logger.error('GetDocumentFile başarısız:', message);
              // #region agent log
              fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:625', message: 'GetDocumentFile failed', data: { message, isSucceeded }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
              // #endregion
              reject(new Error(message));
              return;
            }

            if (!documentContent) {
              this.logger.warn('GetDocumentFile: DocumentContent field bulunamadı. Response keys:', Object.keys(soapResult || {}));
              // #region agent log
              fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:633', message: 'GetDocumentFile content not found', data: { soapResultKeys: Object.keys(soapResult || {}) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
              // #endregion
              reject(new Error('Belge içeriği bulunamadı'));
              return;
            }

            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:639', message: 'GetDocumentFile success', data: { contentLength: documentContent.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion

            this.logger.log(`🔍 GetDocumentFile başarılı: Content uzunluğu=${documentContent.length}`);

            resolve({
              success: true,
              content: documentContent,
              uuid: uuid,
              message: message,
            });
          }
        );
      });
    } catch (error) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'hizli.service.ts:653', message: 'GetDocumentFile exception', data: { errorMessage: error instanceof Error ? error.message : String(error) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
      this.logger.error('GetDocumentFile exception:', error);
      throw error;
    }
  }

  /**
   * URN config bilgilerini döner
   */
  async getUrnConfig() {
    return {
      gb: {
        urn: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
        default: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
      },
      pk: {
        urn: process.env.HIZLI_PK_URN || 'not set',
        default: process.env.HIZLI_PK_URN || 'not set',
      },
      env: {
        HIZLI_GB_URN: process.env.HIZLI_GB_URN || 'not set',
        HIZLI_PK_URN: process.env.HIZLI_PK_URN || 'not set',
        HIZLI_SOAP_URL: process.env.HIZLI_SOAP_URL || this.soapUrl,
      },
    };
  }

  /**
   * GetGibUserList - Mükellef listesini getirir (alıcı URN bilgisi için)
   * REST API kullanır: GET /HizliApi/RestApi/GetGibUserList?AppType=1&Type=PK&Identifier=1234567801
   */
  async getGibUserList(appType: number, type: string, identifier: string) {
    try {
      if (!this.cachedToken) {
        throw new Error('Token bulunamadı. Önce login yapmalısınız.');
      }

      const apiBase = process.env.HIZLI_API_BASE || 'https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi';
      const url = `${apiBase}/GetGibUserList`;

      this.logger.log(`🔍 GetGibUserList REST API çağrılıyor (AppType: ${appType}, Type: ${type}, Identifier: ${identifier})...`);

      const response = await axios.get(url, {
        params: {
          AppType: appType,
          Type: type, // "PK" veya "GB"
          Identifier: identifier, // VKN/TCKN
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.cachedToken}`,
        },
      });

      this.logger.log('✅ GetGibUserList response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      this.logger.error('❌ GetGibUserList REST API hatası:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * SendInvoiceModel - E-fatura gönderir (REST API kullanır)
   */
  async sendInvoiceModel(inputInvoices: any[]) {
    try {
      if (!this.cachedToken) {
        throw new Error('Token bulunamadı. Önce login yapmalısınız.');
      }

      const apiBase = process.env.HIZLI_API_BASE || 'https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi';
      const url = `${apiBase}/SendInvoiceModel`;

      this.logger.log('🔍 SendInvoiceModel REST API çağrılıyor (Invoice sayısı: ' + inputInvoices.length + ')');

      const response = await axios.post(url, inputInvoices, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.cachedToken}`,
        },
      });

      this.logger.log('🔍 SendInvoiceModel response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      this.logger.error('SendInvoiceModel REST API hatası:', error.response?.data || error.message);
      throw error;
    }
  }
}


