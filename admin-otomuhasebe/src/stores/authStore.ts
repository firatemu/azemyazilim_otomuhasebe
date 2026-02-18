import { create } from 'zustand';
import api from '@/lib/axios';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
  permissions: string[];
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    domain?: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshTokenValue: string | null;
  user: User | null;
  tenantId: string | null; // SaaS multi-tenant için tenant ID
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// Initialize from localStorage
const getInitialState = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshTokenValue = localStorage.getItem('refreshToken');
  const userStr = localStorage.getItem('user');
  const tenantId = localStorage.getItem('tenantId');

  const user = userStr ? JSON.parse(userStr) : null;

  return {
    accessToken,
    refreshTokenValue,
    user,
    tenantId: tenantId || user?.tenantId || user?.tenant?.id || null,
    isAuthenticated: !!accessToken,
  };
};

export const useAuthStore = create<AuthState>((set: any, get: any) => ({
  ...getInitialState(),

  login: async (username: string, password: string) => {
    // Bu değişkenler catch bloğunda da erişilebilir olmalı
    let userExists = false;
    let existingUser = null;
    let checkEndpointRequiresAuth = false;

    try {
      // ==========================================
      // ADIM 1: ÖNCE KULLANICI ADI KONTROLÜ (Şifre göndermeden)
      // ==========================================
      console.log('[AUTH STEP 1] 🔍 Checking if user exists (before password check):', username);

      try {
        // Kullanıcıyı email veya username ile ara
        // Not: Bu endpoint auth gerektirebilir veya mevcut olmayabilir
        const checkResponse = await api.get('/users', {
          params: { search: username },
          _skipAuthRedirect: true,
        } as any);

        const users = Array.isArray(checkResponse.data)
          ? checkResponse.data
          : (checkResponse.data?.data || []);

        // Email veya username ile eşleşen kullanıcıyı bul
        existingUser = users.find((u: any) =>
          u.email?.toLowerCase() === username.toLowerCase() ||
          u.username?.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
          userExists = true;
          console.log('[AUTH STEP 1] ✅ User found:', existingUser.email || existingUser.username);
        } else {
          console.log('[AUTH STEP 1] ❌ User not found in search results:', username);
        }
      } catch (checkError: any) {
        // Eğer /users endpoint'i auth gerektiriyorsa veya mevcut değilse, bu kontrolü atla
        // ve direkt login endpoint'ine git (backend hata mesajına göre karar verilecek)
        const checkStatusCode = checkError?.response?.status;
        console.warn('[AUTH STEP 1] ⚠️ Could not check user existence:', checkStatusCode);

        // 401, 403 veya 404 hatası alırsak, endpoint auth gerektiriyor veya mevcut değil demektir
        // Bu durumda direkt login endpoint'ine git
        if (checkStatusCode === 401 || checkStatusCode === 403 || checkStatusCode === 404) {
          checkEndpointRequiresAuth = true;
          console.log('[AUTH STEP 1] ℹ️ User check endpoint not available or requires auth, will check via login endpoint');
        } else {
          // Diğer hatalar için kullanıcı kontrolünü atla
          console.warn('[AUTH STEP 1] ⚠️ User check failed, proceeding to login endpoint...');
        }
      }

      // SADECE kullanıcı kontrolü başarılı olduysa ve kullanıcı bulunamadıysa USER_NOT_FOUND fırlat
      // Eğer endpoint mevcut değilse (404) veya auth gerektiriyorsa, login endpoint'ine git
      if (userExists === false && existingUser === null && !checkEndpointRequiresAuth) {
        console.log('[AUTH STEP 1] ❌ User does not exist (verified by user check), throwing USER_NOT_FOUND');
        throw new Error('USER_NOT_FOUND');
      }

      if (checkEndpointRequiresAuth) {
        console.log('[AUTH STEP 1] ℹ️ Skipping user existence check, will use login endpoint response');
      }

      // ==========================================
      // ADIM 2: ŞİFRE KONTROLÜ (Kullanıcı varsa veya kontrol yapılamadıysa)
      // ==========================================
      console.log('[AUTH STEP 2] 🔐 Attempting login with password...');

      let response;
      try {
        response = await api.post('/auth/login', { username, password });
      } catch (loginError: any) {
        // Login hatası - backend'in hata mesajına göre karar ver
        const loginErrorMessage = loginError.response?.data?.message || loginError.message || '';
        const loginErrorCode = loginError.response?.data?.code || loginError.response?.data?.errorCode || '';
        const loginStatusCode = loginError.response?.status;

        // Detaylı log - Backend'in tam olarak ne döndürdüğünü görmek için
        console.error('[AUTH STEP 2] ❌ Login failed - FULL ERROR:', loginError);
        console.error('[AUTH STEP 2] ❌ Login failed - Response:', loginError.response);
        console.error('[AUTH STEP 2] ❌ Login failed - Response Data:', loginError.response?.data);
        console.log('[AUTH STEP 2] ❌ Login failed:', {
          status: loginStatusCode,
          message: loginErrorMessage,
          code: loginErrorCode,
          fullMessage: loginError.message,
          responseData: loginError.response?.data,
          checkEndpointRequiresAuth,
          userExists,
          existingUser: existingUser ? (existingUser.email || existingUser.username) : null,
        });

        // Eğer kullanıcı kontrolü yapılamadıysa (auth gerektiriyorsa), login endpoint'inden gelen hata mesajına göre karar ver
        const lowerLoginErrorMessage = loginErrorMessage.toLowerCase();

        if (checkEndpointRequiresAuth) {
          // ÖNEMLİ: Kullanıcı kontrolü yapılamadıysa, backend'in mesajını dikkatli analiz et
          // Backend genellikle güvenlik nedeniyle kullanıcı yoksa da "Email veya şifre hatalı" der

          // Önce açıkça kullanıcı bulunamadı mesajlarını kontrol et
          const isUserNotFound =
            loginStatusCode === 404 ||
            lowerLoginErrorMessage.includes('kullanıcı bulunamadı') ||
            lowerLoginErrorMessage.includes('user not found') ||
            lowerLoginErrorMessage.includes('username not found') ||
            lowerLoginErrorMessage.includes('email not found') ||
            (lowerLoginErrorMessage.includes('kullanıcı adı') && lowerLoginErrorMessage.includes('bulunamadı')) ||
            loginErrorCode === 'USER_NOT_FOUND' ||
            loginErrorCode === 'USERNAME_NOT_FOUND' ||
            loginErrorCode === 'EMAIL_NOT_FOUND';

          if (isUserNotFound) {
            console.log('[AUTH STEP 2] ❌ User not found (from login endpoint), throwing USER_NOT_FOUND');
            throw new Error('USER_NOT_FOUND');
          }

          // Backend'in mesajı genel bir "Email veya şifre hatalı" mesajıysa
          // Bu genellikle kullanıcı yok anlamına gelir (güvenlik nedeniyle backend spesifik mesaj vermiyor)
          // Ancak kullanıcı kontrolü yapılamadığı için kesin olarak bilemeyiz
          // Bu durumda, önce USER_NOT_FOUND denememiz gerekiyor
          const isGenericError =
            loginStatusCode === 401 &&
            (lowerLoginErrorMessage.includes('email') || lowerLoginErrorMessage.includes('şifre') || lowerLoginErrorMessage.includes('password')) &&
            (lowerLoginErrorMessage.includes('hatalı') || lowerLoginErrorMessage.includes('yanlış') || lowerLoginErrorMessage.includes('incorrect') || lowerLoginErrorMessage.includes('wrong') || lowerLoginErrorMessage.includes('invalid')) &&
            !lowerLoginErrorMessage.includes('user not found') &&
            !lowerLoginErrorMessage.includes('kullanıcı bulunamadı');

          if (isGenericError) {
            // Genel hata mesajı → Kullanıcı kontrolü yapılamadığı için kullanıcı yok olarak varsay
            console.log('[AUTH STEP 2] ❌ Generic error message (Email veya şifre hatalı), user check failed, assuming USER_NOT_FOUND');
            throw new Error('USER_NOT_FOUND');
          }
        }

        // Şifre yanlış kontrolü
        // ÖNEMLİ: Kullanıcı kontrolü başarılı olduysa ve kullanıcı varsa, 401 = şifre yanlış
        const isPasswordError =
          // Açıkça şifre hatası mesajı (ama kullanıcı kontrolü başarılı olduysa)
          (userExists === true && existingUser !== null && loginStatusCode === 401) ||
          // Açıkça sadece şifre hatası mesajı (kullanıcı ile ilgili bir şey yok)
          (lowerLoginErrorMessage.includes('şifre') &&
            (lowerLoginErrorMessage.includes('yanlış') || lowerLoginErrorMessage.includes('hatalı') || lowerLoginErrorMessage.includes('incorrect')) &&
            !lowerLoginErrorMessage.includes('email') &&
            !lowerLoginErrorMessage.includes('kullanıcı')) ||
          (lowerLoginErrorMessage.includes('password') &&
            (lowerLoginErrorMessage.includes('incorrect') || lowerLoginErrorMessage.includes('wrong') || lowerLoginErrorMessage.includes('invalid')) &&
            !lowerLoginErrorMessage.includes('user') &&
            !lowerLoginErrorMessage.includes('email')) ||
          lowerLoginErrorMessage.includes('invalid password') ||
          lowerLoginErrorMessage.includes('wrong password') ||
          lowerLoginErrorMessage.includes('incorrect password') ||
          loginErrorCode === 'WRONG_PASSWORD' ||
          loginErrorCode === 'INVALID_PASSWORD';

        if (isPasswordError) {
          console.log('[AUTH STEP 2] ❌ Wrong password, throwing WRONG_PASSWORD');
          throw new Error('WRONG_PASSWORD');
        }

        // Eğer kullanıcı kontrolü yapılamadıysa ve mesaj belirsizse, kullanıcı yok olarak varsay
        if (checkEndpointRequiresAuth && loginStatusCode === 401) {
          console.log('[AUTH STEP 2] ❌ 401 error, user check failed, assuming USER_NOT_FOUND');
          throw new Error('USER_NOT_FOUND');
        }

        // Diğer hatalar için orijinal hatayı fırlat
        throw loginError;
      }
      const { accessToken, refreshToken: refreshTokenValue, user } = response.data;

      if (!accessToken || !refreshTokenValue) {
        throw new Error('Token alınamadı');
      }

      // Tenant ID'yi farklı kaynaklardan al (esnek yapı)
      // Backend'in gönderdiği format'a göre otomatik olarak algılanır
      let tenantId =
        user?.tenantId ||           // Format 1: user.tenantId
        user?.tenant?.id ||         // Format 2: user.tenant.id
        response.data?.tenantId ||  // Format 3: response.data.tenantId
        response.data?.tenant?.id || // Format 4: response.data.tenant.id
        null;

      // Debug: Development modunda tenant ID'yi logla
      console.log('[AUTH DEBUG] Login response:', {
        hasUser: !!user,
        userEmail: user?.email,
        userUsername: user?.username,
        username: username,
        userTenantId: user?.tenantId,
        userTenantObject: user?.tenant,
        responseTenantId: response.data?.tenantId,
        extractedTenantId: tenantId,
        fullUserObject: user,
        fullResponse: response.data,
      });

      // Admin kullanıcıları için tenant ID kontrolü yapma (önceden kontrol et)
      const ADMIN_EMAILS_CHECK = ['info@azemyazilim.com'];
      const userEmailForCheck = user?.email || user?.username || username || '';
      const isAdminUserForTenant = ADMIN_EMAILS_CHECK.some(email =>
        email.toLowerCase() === userEmailForCheck.toLowerCase()
      );

      // Eğer tenant ID hala yoksa, backend'den kullanıcı bilgilerini çek
      // Admin kullanıcısı için bu kontrolü atla
      if (!tenantId && user?.id && !isAdminUserForTenant) {
        console.warn('[AUTH WARNING] Tenant ID not found in login response. Trying to fetch from backend...');
        try {
          // Token'ı geçici olarak header'a ekle
          const tempApi = axios.create({
            baseURL: (await import('@/config/constants')).getApiBaseUrl(),
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // Kullanıcı bilgilerini çek
          const userResponse = await tempApi.get(`/users/${user.id}`);
          const userData = userResponse.data?.data || userResponse.data;

          tenantId =
            userData?.tenantId ||
            userData?.tenant?.id ||
            null;

          if (tenantId) {
            console.log('[AUTH DEBUG] Tenant ID fetched from backend:', tenantId);
          } else {
            console.error('[AUTH ERROR] Tenant ID still not found after fetching user data!');
            console.error('[AUTH ERROR] User data:', userData);
          }
        } catch (fetchError: any) {
          // 404 hatası normal olabilir (endpoint yoksa), sessizce devam et
          if (fetchError.response?.status !== 404) {
            console.error('[AUTH ERROR] Failed to fetch tenant ID from backend:', fetchError);
            console.error('[AUTH ERROR] This may cause SaaS multi-tenant issues!');
          }
        }
      } else if (isAdminUserForTenant && !tenantId) {
        console.log('[AUTH DEBUG] Admin user - skipping tenant ID fetch');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshTokenValue);
      localStorage.setItem('user', JSON.stringify(user));

      // ==========================================
      // ADMIN KONTROLÜ - admin.otomuhasebe.com SADECE ADMIN İÇİN
      // ==========================================
      // Admin kullanıcıları için subscription kontrolü yapma
      // Bu email adresine sahip kullanıcılar paket/abonelik kontrolünden muaf
      // admin.otomuhasebe.com SADECE admin kullanıcıları için erişilebilir
      const ADMIN_EMAILS = [
        'info@azemyazilim.com',
        // İleride başka admin email'leri eklenebilir
      ];

      // Email kontrolü - user objesi ve username'den kontrol et
      const userEmail = user?.email || user?.username || username || '';
      const isAdminUser = ADMIN_EMAILS.some(email => {
        const emailMatch = email.toLowerCase() === userEmail.toLowerCase();
        const usernameMatch = email.toLowerCase() === (username || '').toLowerCase();
        return emailMatch || usernameMatch;
      });

      // Eğer admin kullanıcısı DEĞİLSE, admin.otomuhasebe.com'a giriş yapamaz
      if (!isAdminUser) {
        console.log('[AUTH] ❌ Non-admin user attempting to access admin.otomuhasebe.com');
        console.log('[AUTH] ❌ User email:', userEmail);
        console.log('[AUTH] ❌ This panel is only accessible to admin users');

        // Token'ları temizle
        set({
          accessToken: null,
          refreshTokenValue: null,
          user: null,
          tenantId: null,
          isAuthenticated: false,
        });

        // Özel hata fırlat
        throw new Error('ADMIN_ONLY_ACCESS');
      }

      // Tenant ID'yi localStorage'a kaydet (varsa)
      // Admin kullanıcısı için CRITICAL ERROR mesajları gösterme
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
        console.log('[AUTH DEBUG] Tenant ID saved to localStorage:', tenantId);
      } else if (!isAdminUser && !isAdminUserForTenant) {
        // Sadece admin olmayan kullanıcılar için CRITICAL ERROR göster
        console.error('[AUTH CRITICAL ERROR] Tenant ID not found! SaaS multi-tenant will NOT work!');
        console.error('[AUTH CRITICAL ERROR] User will not be able to add/edit data!');
        console.error('[AUTH CRITICAL ERROR] Response structure:', response.data);
        console.error('[AUTH CRITICAL ERROR] Please check backend response format!');
      } else {
        // Admin kullanıcısı için sadece debug mesajı
        console.log('[AUTH DEBUG] Admin user - Tenant ID not required');
      }

      // Debug: Admin kontrolü için log
      console.log('[AUTH DEBUG] Admin check:', {
        userEmail: userEmail,
        username: username,
        userObject: user,
        isAdminUser: isAdminUser,
        adminEmails: ADMIN_EMAILS,
      });

      // Admin kullanıcısıysa subscription kontrolünü atla ve direkt giriş yap
      if (isAdminUser) {
        console.log('[AUTH DEBUG] ✅ Admin user detected, skipping subscription checks:', userEmail);

        // Tenant ID yoksa bile admin kullanıcısı giriş yapabilir
        // Ancak tenant ID varsa kaydet
        if (tenantId) {
          localStorage.setItem('tenantId', tenantId);
        }

        set({
          accessToken,
          refreshTokenValue,
          user,
          tenantId: tenantId || null,
          isAuthenticated: true,
        });

        // Admin kullanıcısı için direkt başarılı dön
        return;
      } else {
        console.log('[AUTH DEBUG] ❌ Not an admin user, proceeding with subscription checks');
      }

      // Subscription durumunu kontrol et
      // Kullanıcının onaylanmış bir paketi (ücretli veya demo) var mı kontrol et
      let hasApprovedSubscription = false;
      let subscriptionStatus = null;
      let subscriptionType = null;

      // Subscription bilgisini user objesinden veya response'dan al
      const subscription =
        user?.subscription ||
        user?.activeSubscription ||
        response.data?.subscription ||
        response.data?.activeSubscription ||
        null;

      // Subscription durumunu kontrol et
      if (subscription) {
        subscriptionStatus = subscription.status || subscription.subscriptionStatus;
        subscriptionType = subscription.planType || subscription.type || subscription.plan?.type;

        // Onaylanmış subscription kontrolü
        // Status: 'ACTIVE', 'APPROVED', 'CONFIRMED' gibi değerler onaylanmış sayılır
        // Plan type: 'PAID', 'TRIAL', 'DEMO' olabilir (hepsi onaylanmış olabilir)
        const isApprovedStatus =
          subscriptionStatus === 'ACTIVE' ||
          subscriptionStatus === 'APPROVED' ||
          subscriptionStatus === 'CONFIRMED' ||
          subscription.isApproved === true ||
          subscription.approved === true;

        // Onaylanmış subscription varsa (ücretli veya demo fark etmez)
        hasApprovedSubscription = isApprovedStatus;
      }

      // Eğer subscription bilgisi yoksa, backend'den çekmeyi dene
      let hasAnySubscription = false;
      if (!subscription && user?.id) {
        try {
          const tempApi = axios.create({
            baseURL: (await import('@/config/constants')).getApiBaseUrl(),
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // Subscription bilgilerini çek
          const subscriptionResponse = await tempApi.get(`/users/${user.id}/subscriptions`);
          const subscriptions = Array.isArray(subscriptionResponse.data)
            ? subscriptionResponse.data
            : (subscriptionResponse.data?.data || []);

          // Herhangi bir subscription var mı kontrol et
          hasAnySubscription = subscriptions.length > 0;

          // Aktif ve onaylanmış subscription var mı kontrol et
          // Ücretli paketlerde otomatik onaylı olur, demo paketlerde admin onayı gerekir
          const approvedSubscription = subscriptions.find((sub: any) => {
            const status = sub.status || sub.subscriptionStatus;
            const planType = sub.planType || sub.type || sub.plan?.type;
            const isApproved = sub.isApproved === true || sub.approved === true;

            // Ücretli paketlerde status ACTIVE ise onaylanmış sayılır
            if (planType === 'PAID' && status === 'ACTIVE') {
              return true;
            }

            // Demo/Trial paketlerde isApproved true olmalı
            if ((planType === 'TRIAL' || planType === 'DEMO') && isApproved) {
              return true;
            }

            // Genel olarak ACTIVE, APPROVED, CONFIRMED status'ları onaylanmış sayılır
            return (
              status === 'ACTIVE' ||
              status === 'APPROVED' ||
              status === 'CONFIRMED' ||
              isApproved
            );
          });

          if (approvedSubscription) {
            hasApprovedSubscription = true;
            subscriptionStatus = approvedSubscription.status || approvedSubscription.subscriptionStatus;
            subscriptionType = approvedSubscription.planType || approvedSubscription.type;
          } else if (subscriptions.length > 0) {
            // Subscription var ama onaylanmamış
            hasAnySubscription = true;
            subscriptionStatus = subscriptions[0].status || subscriptions[0].subscriptionStatus;
            subscriptionType = subscriptions[0].planType || subscriptions[0].type;
          }
        } catch (subError: any) {
          // Subscription endpoint'i yoksa veya hata varsa sessizce devam et
          // Bu durumda tenant ID kontrolüne göre karar verilecek
          console.warn('[AUTH WARNING] Could not fetch subscription info:', subError);
        }
      } else if (subscription) {
        // Subscription var (user objesinden geldi)
        hasAnySubscription = true;
      }

      // ==========================================
      // ADIM 3: ABONELİK KONTROLÜ (Kullanıcı var, şifre doğru)
      // ==========================================
      console.log('[AUTH STEP 3] 📦 Checking subscription status...');
      console.log('[AUTH STEP 3] Subscription details:', {
        hasAnySubscription,
        hasApprovedSubscription,
        subscriptionStatus,
        subscriptionType,
        tenantId,
      });

      // Senaryo 1: Hiç subscription yoksa → Paket sayfasına yönlendir
      if (!hasAnySubscription && !subscription) {
        console.warn('[AUTH STEP 3] ❌ User has no subscription at all.');
        console.warn('[AUTH STEP 3] User needs to sign up and purchase a plan.');

        // Token'ları kaydet ama tenant ID olmadan
        set({
          accessToken,
          refreshTokenValue,
          user,
          tenantId: null,
          isAuthenticated: true,
        });
        // Subscription yok hatası fırlat - Login sayfasında yakalanacak
        throw new Error('NO_SUBSCRIPTION');
      }

      // Senaryo 2: Demo başvurusu var ama onay bekliyor (subscription var ama onaylanmamış ve tenant ID yok)
      // → "Demo Hesabınız Hazırlanıyor" mesajı göster
      if (!tenantId && !hasApprovedSubscription && hasAnySubscription) {
        console.warn('[AUTH STEP 3] ⏳ Demo account pending approval.');
        console.warn('[AUTH STEP 3] User has subscription but it is not approved yet.');
        console.warn('[AUTH STEP 3] Subscription status:', subscriptionStatus);
        console.warn('[AUTH STEP 3] Subscription type:', subscriptionType);

        // Token'ları kaydet ama tenant ID olmadan
        set({
          accessToken,
          refreshTokenValue,
          user,
          tenantId: null,
          isAuthenticated: true,
        });
        // Demo hesap hatası fırlat - Login sayfasında yakalanacak
        throw new Error('DEMO_ACCOUNT_PENDING');
      }

      // Senaryo 3: Onaylanmış subscription var ama tenant ID yok → Bu bir hata olabilir, demo hesap olarak işaretle
      if (!tenantId && hasApprovedSubscription) {
        console.error('[AUTH STEP 3] ⚠️ User has approved subscription but no tenant ID!');
        console.error('[AUTH STEP 3] This should not happen. Admin intervention may be required.');
        // Bu durumda da demo hesap olarak işaretle, admin müdahale etsin
        set({
          accessToken,
          refreshTokenValue,
          user,
          tenantId: null,
          isAuthenticated: true,
        });
        throw new Error('DEMO_ACCOUNT_PENDING');
      }

      // Senaryo 4: Her şey tamam → Giriş başarılı (tenant ID var ve onaylanmış subscription var)
      console.log('[AUTH STEP 3] ✅ User has approved subscription and tenant ID. Login successful!');

      set({
        accessToken,
        refreshTokenValue,
        user,
        tenantId,
        isAuthenticated: true,
      });
    } catch (error: any) {
      // Eğer hata zaten özel bir hata koduysa (USER_NOT_FOUND, WRONG_PASSWORD, NO_SUBSCRIPTION, DEMO_ACCOUNT_PENDING)
      // direkt fırlat (bu hatalar yukarıdaki adımlarda fırlatılmış olabilir)
      if (error.message === 'USER_NOT_FOUND' ||
        error.message === 'WRONG_PASSWORD' ||
        error.message === 'NO_SUBSCRIPTION' ||
        error.message === 'DEMO_ACCOUNT_PENDING') {
        throw error;
      }

      console.error('[AUTH ERROR] Login error in store:', error);
      console.error('[AUTH ERROR] Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        code: error.response?.data?.code,
        errorCode: error.response?.data?.errorCode,
        data: error.response?.data,
        userExists,
        existingUser: existingUser ? (existingUser.email || existingUser.username) : null,
      });

      // Backend'den gelen hata mesajına göre özel hata kodları fırlat
      const errorMessage = error.response?.data?.message || error.message || '';
      const errorCode = error.response?.data?.code || error.response?.data?.errorCode || '';
      const statusCode = error.response?.status;
      const lowerErrorMessage = errorMessage.toLowerCase();

      // Kullanıcı adı bulunamadı kontrolü (öncelikli)
      // 404 veya açıkça "user not found" mesajı varsa
      if (
        statusCode === 404 ||
        lowerErrorMessage.includes('kullanıcı bulunamadı') ||
        lowerErrorMessage.includes('user not found') ||
        lowerErrorMessage.includes('username not found') ||
        lowerErrorMessage.includes('email not found') ||
        (lowerErrorMessage.includes('kullanıcı adı') && lowerErrorMessage.includes('bulunamadı')) ||
        errorCode === 'USER_NOT_FOUND' ||
        errorCode === 'USERNAME_NOT_FOUND' ||
        errorCode === 'EMAIL_NOT_FOUND'
      ) {
        console.log('[AUTH ERROR] ❌ User not found, throwing USER_NOT_FOUND');
        throw new Error('USER_NOT_FOUND');
      }

      // 401 hatası ama mesaj belirsiz → kullanıcı kontrolü yapılamadıysa USER_NOT_FOUND varsay
      if (statusCode === 401) {
        // Eğer kullanıcı kontrolü yapılamadıysa (auth gerektiriyorsa), backend'in mesajına göre karar ver
        if (checkEndpointRequiresAuth) {
          // Backend'in mesajında "kullanıcı" veya "user" kelimesi varsa ve olumsuz bir ifade içeriyorsa → USER_NOT_FOUND
          const hasUserRelatedNegativeMessage =
            (lowerErrorMessage.includes('user') || lowerErrorMessage.includes('kullanıcı')) &&
            (lowerErrorMessage.includes('not found') ||
              lowerErrorMessage.includes('bulunamadı') ||
              lowerErrorMessage.includes('invalid') ||
              lowerErrorMessage.includes('hatalı') ||
              lowerErrorMessage.includes('incorrect') ||
              lowerErrorMessage.includes('wrong') ||
              lowerErrorMessage.includes('does not exist') ||
              lowerErrorMessage.includes('mevcut değil'));

          if (hasUserRelatedNegativeMessage) {
            console.log('[AUTH ERROR] ❌ 401 error with user-related negative message, throwing USER_NOT_FOUND');
            throw new Error('USER_NOT_FOUND');
          }

          // Backend'in mesajı genel bir "Email veya şifre hatalı" mesajıysa
          // Bu genellikle kullanıcı yok anlamına gelir (güvenlik nedeniyle backend spesifik mesaj vermiyor)
          const isGenericError =
            (lowerErrorMessage.includes('email') || lowerErrorMessage.includes('şifre') || lowerErrorMessage.includes('password')) &&
            (lowerErrorMessage.includes('hatalı') || lowerErrorMessage.includes('yanlış') || lowerErrorMessage.includes('incorrect') || lowerErrorMessage.includes('wrong') || lowerErrorMessage.includes('invalid')) &&
            !lowerErrorMessage.includes('user not found') &&
            !lowerErrorMessage.includes('kullanıcı bulunamadı');

          if (isGenericError) {
            console.log('[AUTH ERROR] ❌ Generic error message (Email veya şifre hatalı), user check failed, assuming USER_NOT_FOUND');
            throw new Error('USER_NOT_FOUND');
          }

          // Mesaj belirsizse, kullanıcı yok olarak varsay
          console.log('[AUTH ERROR] ❌ 401 error without clear message, user check failed, assuming USER_NOT_FOUND');
          throw new Error('USER_NOT_FOUND');
        }
      }

      // Şifre yanlış kontrolü
      // ÖNEMLİ: Kullanıcı kontrolü başarılı olduysa ve kullanıcı varsa, 401 = şifre yanlış
      const isPasswordError =
        // Kullanıcı kontrolü başarılı olduysa ve kullanıcı varsa, 401 = şifre yanlış
        (userExists === true && existingUser !== null && statusCode === 401) ||
        // Açıkça sadece şifre hatası mesajı (kullanıcı ile ilgili bir şey yok)
        (lowerErrorMessage.includes('şifre') &&
          (lowerErrorMessage.includes('yanlış') || lowerErrorMessage.includes('hatalı') || lowerErrorMessage.includes('incorrect')) &&
          !lowerErrorMessage.includes('email') &&
          !lowerErrorMessage.includes('kullanıcı')) ||
        (lowerErrorMessage.includes('password') &&
          (lowerErrorMessage.includes('incorrect') || lowerErrorMessage.includes('wrong') || lowerErrorMessage.includes('invalid')) &&
          !lowerErrorMessage.includes('user') &&
          !lowerErrorMessage.includes('email')) ||
        lowerErrorMessage.includes('invalid password') ||
        lowerErrorMessage.includes('wrong password') ||
        lowerErrorMessage.includes('incorrect password') ||
        errorCode === 'WRONG_PASSWORD' ||
        errorCode === 'INVALID_PASSWORD';

      if (isPasswordError) {
        console.log('[AUTH ERROR] ❌ Wrong password, throwing WRONG_PASSWORD');
        throw new Error('WRONG_PASSWORD');
      }

      // Diğer hatalar için orijinal hatayı fırlat
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    set({
      accessToken: null,
      refreshTokenValue: null,
      user: null,
      tenantId: null,
      isAuthenticated: false,
    });
  },

  refreshToken: async () => {
    const refreshTokenValue = get().refreshTokenValue;
    if (!refreshTokenValue) return false;

    try {
      // Use axios directly without interceptor to avoid loop
      // API URL sabit yapılandırmadan alınır
      const { getApiBaseUrl } = await import('@/config/constants');
      const apiBaseUrl = getApiBaseUrl();

      const response = await axios.post(
        `${apiBaseUrl}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshTokenValue}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (!accessToken) {
        throw new Error('Token alınamadı');
      }

      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        set({ refreshTokenValue: newRefreshToken });
      }

      // Refresh token response'unda tenant bilgisi varsa güncelle
      // Backend refresh token response'unda tenant bilgisi gönderebilir
      const tenantId =
        response.data?.tenantId ||
        response.data?.user?.tenantId ||
        response.data?.user?.tenant?.id ||
        get().tenantId; // Mevcut tenant ID'yi koru

      if (tenantId && tenantId !== get().tenantId) {
        localStorage.setItem('tenantId', tenantId);
        set({ tenantId });

        // Debug: Development modunda tenant ID güncellemesini logla
        if ((import.meta as any).env?.DEV) {
          console.log('[AUTH DEBUG] Tenant ID updated from refresh token:', tenantId);
        }
      }

      set({ accessToken });
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      get().logout();
      return false;
    }
  },
}));

