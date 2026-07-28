// ==========================================
// ​config.js
// ==========================================

// مفاتيح الربط المحفوظة والمضمنة مع Supabase
const SUPABASE_URL = 'https://vfysgxgjahaojrtdagbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aRu1BBu5Pb29tq-fNYSZIA_PeSrrpoC';

// مفاتيح الربط الدائمة مع Agora للمكالمات الصوتية والمرئية
const AGORA_APP_ID = '77a195757c054acaaf8da43c269b2260';
const AGORA_PERMANENT_TOKEN = '00677a195757c054acaaf8da43c269b2260IABQLMitxwtMDMd4/d5F8xLlrQ9ut+mIk0aa9jUYpm13A0UxBjEAAAAAIgBa0EoDD21kagQAAQCPHi99AgCPHi99AwCPHi99BACPHi99';

// المتغيرات العامة التي ستشاركها جميع ملفات التطبيق الأخرى
let supabaseClient = null;
let currentUser = null;
let currentAuthMode = 'login';
let currentLang = 'ar';
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;
let activeChannel = 'official-golden-chat-id';
let realtimeChannel = null;


// ==========================================
// ​languages.js
// ==========================================

// محرك اللغات المصغر للواجهة (كامل بدون أي اختصار)
const uiDict = {
    ar: { loginTab: "تسجيل الدخول", signupTab: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", phone: "رقم الهاتف (إجباري مع رمز الدولة +)", btnLogin: "دخول", btnSignup: "إنشاء حساب", offline: "انقطع الاتصال بالإنترنت...", online: "متصل", msgPlaceholder: "اكتب رسالة...", settings: "الإعدادات", langSelect: "لغة التطبيق", myGroups: "مجموعاتي النشطة", logout: "تسجيل الخروج", leave: "مغادرة وحذف", videoLong: "الفيديو يتجاوز 3 دقائق ومرفوض", dir: "rtl" },
    en: { loginTab: "Log In", signupTab: "Sign Up", email: "Email Address", pass: "Password", phone: "Phone Number (Required with +)", btnLogin: "Log In", btnSignup: "Sign Up", offline: "No Internet Connection...", online: "Online", msgPlaceholder: "Type a message...", settings: "Settings", langSelect: "App Language", myGroups: "My Active Groups", logout: "Log Out", leave: "Leave & Delete", videoLong: "Video exceeds 3 minutes", dir: "ltr" },
    fr: { loginTab: "Connexion", signupTab: "S'inscrire", email: "Adresse e-mail", pass: "Mot de passe", phone: "Numéro de téléphone (Obligatoire +)", btnLogin: "Connexion", btnSignup: "S'inscrire", offline: "Connexion interrompue...", online: "En ligne", msgPlaceholder: "Écrire un message...", settings: "Paramètres", langSelect: "Langue de l'application", myGroups: "Mes groupes actifs", logout: "Déconnexion", leave: "Quitter et supprimer", videoLong: "La vidéo dépasse 3 minutes", dir: "ltr" },
    es: { loginTab: "Iniciar sesión", signupTab: "Registrarse", email: "Correo electrónico", pass: "Contraseña", phone: "Número de teléfono (Requerido con +)", btnLogin: "Entrar", btnSignup: "Registrarse", offline: "Sin conexión...", online: "En línea", msgPlaceholder: "Escribe un mensaje...", settings: "Ajustes", langSelect: "Idioma de la aplicación", myGroups: "Mis grupos activos", logout: "Cerrar sesión", leave: "Salir y eliminar", videoLong: "El video supera los 3 minutos", dir: "ltr" },
    de: { loginTab: "Anmelden", signupTab: "Registrieren", email: "E-Mail-Adresse", pass: "Passwort", phone: "Telefonnummer (Erforderlich mit +)", btnLogin: "Anmelden", btnSignup: "Registrieren", offline: "Keine Internetverbindung...", online: "Online", msgPlaceholder: "Nachricht schreiben...", settings: "Einstellungen", langSelect: "App-Sprache", myGroups: "Meine aktiven Gruppen", logout: "Abmelden", leave: "Verlassen & Löschen", videoLong: "Video überschreitet 3 Minuten", dir: "ltr" },
    it: { loginTab: "Accedi", signupTab: "Registrati", email: "Indirizzo e-mail", pass: "Password", phone: "Numero di telefono (Obbligatorio con +)", btnLogin: "Accedi", btnSignup: "Registrati", offline: "Connessione assente...", online: "Online", msgPlaceholder: "Scrivi un messaggio...", settings: "Impostazioni", langSelect: "Lingua app", myGroups: "I miei gruppi attivi", logout: "Esci", leave: "Lascia ed elimina", videoLong: "Il video supera i 3 minuti", dir: "ltr" },
    pt: { loginTab: "Entrar", signupTab: "Cadastrar", email: "E-mail", pass: "Senha", phone: "Número de telefone (Obrigatório com +)", btnLogin: "Entrar", btnSignup: "Cadastrar", offline: "Sem conexão...", online: "Online", msgPlaceholder: "Digite uma mensagem...", settings: "Configurações", langSelect: "Idioma do aplicativo", myGroups: "Meus grupos ativos", logout: "Sair", leave: "Sair e excluir", videoLong: "O vídeo excede 3 minutos", dir: "ltr" },
    ru: { loginTab: "Вход", signupTab: "Регистрация", email: "Эл. почта", pass: "Пароль", phone: "Номер телефона (Обязательно с +)", btnLogin: "Войти", btnSignup: "Регистрация", offline: "Нет интернета...", online: "В сети", msgPlaceholder: "Введите сообщение...", settings: "Настройки", langSelect: "Язык приложения", myGroups: "Мои группы", logout: "Выйти", leave: "Покинуть и удалить", videoLong: "Видео превышает 3 минуты", dir: "ltr" },
    zh: { loginTab: "登录", signupTab: "注册", email: "电子邮箱", pass: "密码", phone: "手机号 (须带 +)", btnLogin: "登录", btnSignup: "注册", offline: "无网络连接...", online: "在线", msgPlaceholder: "输入消息...", settings: "设置", langSelect: "应用语言", myGroups: "我的群组", logout: "登出", leave: "离开并删除", videoLong: "视频超过3分钟", dir: "ltr" },
    ja: { loginTab: "ログイン", signupTab: "登録", email: "メールアドレス", pass: "パスワード", phone: "電話番号 (+付き)", btnLogin: "ログイン", btnSignup: "登録", offline: "接続なし...", online: "オンライン", msgPlaceholder: "メッセージを入力...", settings: "設定", langSelect: "アプリ言語", myGroups: "参加グループ", logout: "ログアウト", leave: "退出して削除", videoLong: "動画が3分を超えています", dir: "ltr" },
    ko: { loginTab: "로그인", signupTab: "회원가입", email: "이메일", pass: "비밀번호", phone: "전화번호 (+ 포함 필수)", btnLogin: "로그인", 정Signup: "회원가입", offline: "연결 끊김...", online: "온라인", msgPlaceholder: "메시지 입력...", settings: "설정", langSelect: "앱 언어", myGroups: "내 활성 그룹", logout: "로그아웃", leave: "나가기 및 삭제", videoLong: "영상이 3분을 초과함", dir: "ltr" },
    hi: { loginTab: "लॉग इन", signupTab: "सााइन अप", email: "ईमेल पता", pass: "पासवर्ड", phone: "फ़ोन नंबर (+ के साथ आवश्यक)", btnLogin: "लॉग इन", btnSignup: "सााइन अप", offline: "इंटरनेट नहीं है...", online: "ऑनलाइन", msgPlaceholder: "संदेश लिखें...", settings: "सेटिंग्स", langSelect: "ऐप भाषा", myGroups: "मेरे सक्रिय समूह", logout: "लॉग आउट", leave: "छोड़ें और हटाएं", videoLong: "वीडियो 3 मिनट से अधिक है", dir: "ltr" },
    ur: { loginTab: "لاگ ان", signupTab: "سائن اپ", email: "ای میل پتہ", pass: "پاس ورڈ", phone: "فون نمبر (+ کے ساتھ ضروری)", btnLogin: "لاگ ان", btnSignup: "سائن اپ", offline: "انٹرنیٹ نہیں ہے...", online: "آن لائن", msgPlaceholder: "پیغام لکھیں...", settings: "ترتیبات", langSelect: "پہچان کی زبان", myGroups: "میرے گروپس", logout: "لاگ آؤٹ", leave: "چھوڑیں اور حذف کریں", videoLong: "ویڈیو 3 منٹ سے زیادہ ہے", dir: "rtl" },
    tr: { loginTab: "Giriş Yap", signupTab: "Kayıt Ol", email: "E-posta Adresi", pass: "Şifre", phone: "Telefon Numarası (+ ile zorunlu)", btnLogin: "Giriş", btnSignup: "Kayıt Ol", offline: "Bağlantı yok...", online: "Çevrimiçi", msgPlaceholder: "Bir mesaj yazın...", settings: "Ayarlar", langSelect: "Uygulama Dili", myGroups: "Aktif Gruplarım", logout: "Çıkış Yap", leave: "Ayrıl ve Sil", videoLong: "Video 3 dakikayı aşıyor", dir: "ltr" },
    id: { loginTab: "Masuk", signupTab: "Daftar", email: "Alamat Email", pass: "Kata Sandi", phone: "Nomor Telepon (Wajib dengan +)", btnLogin: "Masuk", btnSignup: "Daftar", offline: "Tidak ada internet...", online: "Online", msgPlaceholder: "Ketik pesan...", settings: "Pengaturan", langSelect: "Bahasa Aplikasi", myGroups: "Grup Aktif Saya", logout: "Keluar", leave: "Keluar & Hapus", videoLong: "Video melebihi 3 menit", dir: "ltr" },
    nl: { loginTab: "Inloggen", signupTab: "Aanmelden", email: "E-mailadres", pass: "Wachtwoord", phone: "Telefoonnummer (Verplicht met +)", btnLogin: "Inloggen", btnSignup: "Aanmelden", offline: "Geen internetverbinding...", online: "Online", msgPlaceholder: "Typ een bericht...", settings: "Instellingen", langSelect: "App-taal", myGroups: "Mijn actieve groepen", logout: "Uitloggen", leave: "Verlaten & verwijderen", videoLong: "Video is langer dan 3 minuten", dir: "ltr" },
    pl: { loginTab: "Zaloguj", signupTab: "Zarejestruj", email: "Adres e-mail", pass: "Hasło", phone: "Numer telefonu (Wymagany z +)", btnLogin: "Zaloguj", btnSignup: "Zarejestruj", offline: "Brak połączenia...", online: "Online", msgPlaceholder: "Wpisz wiadomość...", settings: "Ustawienia", langSelect: "Język aplikacji", myGroups: "Moje aktywne grupy", logout: "Wyloguj", leave: "Opuść i usuń", videoLong: "Wideo przekracza 3 minuty", dir: "ltr" },
    sv: { loginTab: "Logga in", signupTab: "Registrera", email: "E-postadress", pass: "Lösenord", phone: "Telefonnummer (Krävs med +)", btnLogin: "Logga in", btnSignup: "Registrera", offline: "Ingen internetanslutning...", online: "Online", msgPlaceholder: "Skriv ett meddelande...", settings: "Inställningar", langSelect: "App-språk", myGroups: "Mina aktiva grupper", logout: "Logga ut", leave: "Lämna & radera", videoLong: "Videon överstiger 3 minuter", dir: "ltr" },
    fa: { loginTab: "ورود", signupTab: "ثبت‌نام", email: "ایمیل", pass: "رمز عبور", phone: "شماره تلفن (الزامی با +)", btnLogin: "ورود", btnSignup: "ثبت‌نام", offline: "قطع ارتباط با اینترنت...", online: "آنلاین", msgPlaceholder: "پیامی بنویسید...", settings: "تنظیمات", langSelect: "زبان برنامه", myGroups: "گروه‌های فعال من", logout: "خروج", leave: "ترك و حذف", videoLong: "ویدیو بیش از ۳ دقیقه است", dir: "rtl" },
    bn: { loginTab: "লগইন", signupTab: "সাইন আপ", email: "ইমেইল ঠিকানা", pass: "পাসওয়ার্ড", phone: "ফোন নম্বর (+ সহ আবশ্যক)", btnLogin: "লগইন", btnSignup: "সাইন আপ", offline: "ইন্টারনেট সংযোগ বিচ্ছিন্ন...", online: "অনলাইন", msgPlaceholder: "একটি বার্তা লিখুন...", settings: "সেটিংস", langSelect: "অ্যাপের ভাষা", myGroups: "আমার সক্রিয় গ্রুপ", logout: "লগআউট", leave: "ত্যাগ করুন এবং মুছুন", videoLong: "ভিডিওটি ৩ মিনিটের বেশি", dir: "ltr" }
};

// توليد قائمة اللغات الممتدة
const extendedLanguages = [
    { code: 'ar', name: 'العربية (Arabic)' }, { code: 'en', name: 'English (UK/US)' }, { code: 'fr', name: 'Français (French)' },
    { code: 'es', name: 'Español (Spanish)' }, { code: 'de', name: 'Deutsch (German)' }, { code: 'it', name: 'Italiano (Italian)' },
    { code: 'pt', name: 'Português (Portuguese)' }, { code: 'ru', name: 'Русский (Russian)' }, { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ja', name: '日本語 (Japanese)' }, { code: 'ko', name: '한국어 (Korean)' }, { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ur', name: 'اردو (Urdu)' }, { code: 'tr', name: 'Türkçe (Turkish)' }, { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'nl', name: 'Nederlands (Dutch)' }, { code: 'pl', name: 'Polski (Polish)' }, { code: 'sv', name: 'Svenska (Swedish)' },
    { code: 'fa', name: 'فارسی (Persian)' }, { code: 'bn', name: 'বাংলা (Bengali)' }
];

// تهيئة قائمة اللغات في الإعدادات
function initLanguagesDropdown() {
    const select = document.getElementById('global-lang-select');
    if(select) {
        select.innerHTML = '';
        extendedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.innerText = lang.name;
            select.appendChild(option);
        });
    }
}

// اختيار اللغة والمتابعة للتسجيل
function setLanguageAndProceed(langCode) {
    applyLanguage(langCode);
    if(typeof showView === 'function') showView('auth-view');
    if(typeof switchAuthTab === 'function') switchAuthTab('login');
    if(typeof initSupabaseSafe === 'function') initSupabaseSafe();
}

// تغيير اللغة من الإعدادات
function changeGlobalLanguage(langCode) {
    applyLanguage(langCode);
    if(typeof closeSettings === 'function') closeSettings();
}

// تطبيق اللغة على واجهة المستخدم
function applyLanguage(langCode) {
    currentLang = uiDict[langCode] ? langCode : 'en'; 
    const d = uiDict[currentLang];
    
    const htmlRoot = document.getElementById('html-root');
    if(htmlRoot) {
        htmlRoot.setAttribute('dir', d.dir);
        htmlRoot.setAttribute('lang', currentLang);
    }
    
    const langSelect = document.getElementById('global-lang-select');
    if(langSelect) langSelect.value = currentLang;
    
    // تحديث النصوص في الواجهة
    const elementsToUpdate = {
        'tab-login-btn': d.loginTab,
        'tab-signup-btn': d.signupTab,
        'lbl-email': d.email,
        'lbl-pass': d.pass,
        'lbl-phone': d.phone,
        'offline-text': d.offline,
        'user-status': d.online,
        'settings-title': d.settings,
        'lbl-lang-select': d.langSelect,
        'lbl-my-groups': d.myGroups,
        'btn-logout': d.logout
    };

    for (const [id, text] of Object.entries(elementsToUpdate)) {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    }

    const msgInput = document.getElementById('msg-input');
    if(msgInput) msgInput.placeholder = d.msgPlaceholder;

    // تحديث زر الإرسال بناءً على وضع المصادقة الحالي
    if(typeof switchAuthTab === 'function') switchAuthTab(currentAuthMode);
}

// ==========================================
// ​​auth.js
// ==========================================

// تبديل تبويبات المصادقة (تسجيل الدخول / إنشاء حساب)
function switchAuthTab(mode) {
    currentAuthMode = mode;
    const d = uiDict[currentLang];
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const submitBtn = document.getElementById('btn-submit-auth');
    
    if (mode === 'login') {
        document.getElementById('tab-login-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-signup-btn').className = "tab-inactive text-lg pb-2 transition-all";
        if(phoneWrapper) phoneWrapper.style.display = "none";
        if(submitBtn) submitBtn.innerText = d.btnLogin;
    } else {
        document.getElementById('tab-signup-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-login-btn').className = "tab-inactive text-lg pb-2 transition-all";
        if(phoneWrapper) phoneWrapper.style.display = "block";
        if(submitBtn) submitBtn.innerText = d.btnSignup;
    }
    validateForm();
}

// التحقق من صحة المدخلات في النموذج
function validateForm() {
    const emailEl = document.getElementById('email-input');
    const passEl = document.getElementById('password-input');
    const phoneEl = document.getElementById('phone-input');
    const btn = document.getElementById('btn-submit-auth');

    if(!emailEl || !passEl || !btn) return;

    const email = emailEl.value.trim();
    const pass = passEl.value.trim();
    const phone = phoneEl ? phoneEl.value.trim() : '';

    let isValid = email.length > 5 && pass.length >= 6;
    if (currentAuthMode === 'signup') {
        isValid = isValid && phone.length >= 8 && phone.startsWith('+'); // هاتف إجباري مع +
    }

    if (isValid) {
        btn.disabled = false;
        btn.className = "w-full bg-gold-500 text-dark-900 p-3.5 rounded-xl font-bold transition hover:bg-gold-400 shadow-md cursor-pointer";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-gray-600 text-gray-400 p-3.5 rounded-xl font-bold transition shadow-md cursor-not-allowed";
    }
}

// ربط مستمعي الأحداث لحقول الإدخال
document.addEventListener('DOMContentLoaded', () => {
    ['email-input', 'password-input', 'phone-input'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', validateForm);
    });
});

// تهيئة Supabase بأمان تام
function initSupabaseSafe() {
    if (supabaseClient) return;
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            checkSession();
        } else {
            setTimeout(initSupabaseSafe, 500);
        }
    } catch (err) { console.error("Supabase Init Error:", err); }
}

// معالجة إرسال نموذج المصادقة
async function handleAuthSubmit() {
    if (!supabaseClient) return;
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const phone = document.getElementById('phone-input') ? document.getElementById('phone-input').value.trim() : '';
    const btn = document.getElementById('btn-submit-auth');
    
    if(btn) {
        btn.innerText = "...";
        btn.disabled = true;
    }

    try {
        if (currentAuthMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = data.user;
        } else {
            const { data, error } = await supabaseClient.auth.signUp({
                email, password, options: { data: { phone_number: phone } }
            });
            if (error) throw error;
            currentUser = data.user;
            
            if (currentUser) {
                await supabaseClient.from('profiles').upsert({
                    id: currentUser.id, email: email, phone_number: phone, updated_at: new Date()
                });
            }
        }
        if(typeof playAudioTone === 'function') playAudioTone('login');
        if(typeof startApp === 'function') startApp();
    } catch (err) {
        alert("Auth Error: " + err.message);
    } finally {
        switchAuthTab(currentAuthMode); 
    }
}

// التحقق من الجلسة النشطة مسبقاً
async function checkSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
            currentUser = data.session.user;
            if(typeof startApp === 'function') startApp();
        }
    } catch (e) {}
}

// تسجيل الخروج
async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        if(typeof closeSettings === 'function') closeSettings();
        if(typeof showView === 'function') showView('auth-view');
        
        const emailInput = document.getElementById('email-input');
        const passInput = document.getElementById('password-input');
        if(emailInput) emailInput.value = '';
        if(passInput) passInput.value = '';
        validateForm();
    }
}

// ==========================================
// ​​chat.js
// ==========================================

// إدارة التنقل بين واجهات التطبيق
function showView(viewId) {
    const views = ['language-view', 'auth-view', 'main-chat-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === viewId) {
                el.classList.remove('hidden-view');
            } else {
                el.classList.add('hidden-view');
            }
        }
    });
}

// بدء التطبيق والدخول للدردشة بعد تسجيل الدخول بنجاح
function startApp() {
    showView('main-chat-view');
    loadMessages();
    subscribeToMessages();
}

// جلب الرسائل السابقة من قاعدة بيانات Supabase
async function loadMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;
    chatContainer.innerHTML = ''; // تفريغ الدردشة

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('channel_id', activeChannel)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) throw error;
        
        data.forEach(msg => renderMessage(msg));
        scrollToBottom();
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

// الاشتراك في التحديثات الفورية (الاستماع للرسائل الجديدة)
function subscribeToMessages() {
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
    }
    
    realtimeChannel = supabaseClient.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` },
        (payload) => {
            renderMessage(payload.new);
            scrollToBottom();
            
            // تشغيل صوت التنبيه إذا كانت الرسالة من شخص آخر
            if(payload.new.user_id !== currentUser.id) {
                playAudioTone('receive');
            }
        }
      )
      .subscribe();
}

// بناء وعرض الرسالة في واجهة المحادثة
function renderMessage(msg) {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;

    const isMine = msg.user_id === currentUser?.id;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col max-w-[80%] mb-4 ${isMine ? 'self-end items-end' : 'self-start items-start'}`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `p-3 rounded-2xl break-words ${isMine ? 'bg-gold-500 text-dark-900 rounded-br-none shadow-md' : 'glass-panel text-white rounded-bl-none shadow-md'}`;
    
    // إدراج النص إن وُجد
    if (msg.content && msg.content.trim() !== '') {
        const textSpan = document.createElement('span');
        textSpan.innerText = msg.content;
        bubbleDiv.appendChild(textSpan);
    }

    // إدراج المرفقات (صورة، فيديو، صوت) إن وُجدت
    if (msg.media_url) {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = msg.content ? "mt-2" : ""; // إضافة مسافة إذا كان هناك نص مع المرفق
        
        if (msg.media_type === 'image') {
            mediaWrapper.innerHTML = `<img src="${msg.media_url}" class="max-w-full h-auto rounded-lg cursor-pointer" onclick="window.open('${msg.media_url}')" loading="lazy" />`;
        } else if (msg.media_type === 'video') {
            mediaWrapper.innerHTML = `<video src="${msg.media_url}" controls class="max-w-full rounded-lg h-48 bg-black"></video>`;
        } else if (msg.media_type === 'audio') {
            mediaWrapper.innerHTML = `<audio src="${msg.media_url}" controls class="max-w-full mt-1"></audio>`;
        }
        bubbleDiv.appendChild(mediaWrapper);
    }

    // وقت إرسال الرسالة
    const timeSpan = document.createElement('span');
    timeSpan.className = `text-[10px] mt-1 px-1 ${isMine ? 'text-gray-400' : 'text-gray-500'}`;
    timeSpan.innerText = formatTime(msg.created_at);

    msgDiv.appendChild(bubbleDiv);
    msgDiv.appendChild(timeSpan);
    chatContainer.appendChild(msgDiv);
}

// إرسال رسالة نصية
async function sendMessage() {
    const input = document.getElementById('msg-input');
    if(!input || !input.value.trim()) return;

    const content = input.value.trim();
    input.value = '';

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                channel_id: activeChannel,
                user_id: currentUser.id,
                content: content,
                media_url: null,
                media_type: null
            }]);

        if (error) throw error;
        playAudioTone('send');
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

// التعامل مع اختيار ورفع الملفات
async function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // فحص مدة الفيديو (الحد الأقصى 3 دقائق)
    if (type === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 180) { // 180 ثانية = 3 دقائق
                alert(uiDict[currentLang].videoLong);
                return;
            }
            await uploadMediaToSupabase(file, type);
        }
        video.src = URL.createObjectURL(file);
        return; 
    }

    await uploadMediaToSupabase(file, type);
}

// الرفع الفعلي للملف إلى Supabase Storage
async function uploadMediaToSupabase(file, type) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${currentUser.id}/${fileName}`;

    try {
        const input = document.getElementById('msg-input');
        const originalPlaceholder = input ? input.placeholder : '';
        if(input) input.placeholder = "جاري الرفع...";

        const { error: uploadError } = await supabaseClient.storage
            .from('chat-media')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        // الحصول على الرابط العام للملف
        const { data } = supabaseClient.storage.from('chat-media').getPublicUrl(filePath);
        
        // إدراج الرسالة في قاعدة البيانات مع رابط المرفق
        const { error: msgError } = await supabaseClient
            .from('messages')
            .insert([{
                channel_id: activeChannel,
                user_id: currentUser.id,
                content: '',
                media_url: data.publicUrl,
                media_type: type
            }]);

        if (msgError) throw msgError;
        playAudioTone('send');
        if(input) input.placeholder = originalPlaceholder;

    } catch (err) {
        console.error("Upload Error:", err);
        alert("حدث خطأ أثناء رفع الملف.");
    }
}

// التمرير التلقائي لأسفل المحادثة
function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if(chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// تنسيق الوقت للعرض (صيغة 12 ساعة)
function formatTime(dateString) {
    const d = new Date(dateString);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

// توليد نغمات تنبيه بسيطة للرسائل بدون الحاجة لملفات صوتية خارجية
function playAudioTone(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if(!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'send') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
        } else if (type === 'receive') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(700, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
        } else if (type === 'login') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        }

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch(e) { 
        // تجاهل الخطأ إذا كان المتصفح يمنع تشغيل الصوت تلقائياً
    }
}

// ربط الضغط على زر Enter بإرسال الرسالة
document.addEventListener('DOMContentLoaded', () => {
    const msgInput = document.getElementById('msg-input');
    if(msgInput) {
        msgInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

​// ==========================================
// ​​calls.js
// ==========================================

// بدء الانضمام إلى المكالمة الصوتية أو المرئية
async function joinCall(withVideo = false) {
    try {
        // إظهار واجهة الاتصال (حاوية الفيديو إن وجدت)
        const callContainer = document.getElementById('call-container');
        if (callContainer) callContainer.classList.remove('hidden-view');

        // إنشاء عميل Agora
        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        // الاستماع لدخول وبث المستخدمين الآخرين
        agoraClient.on("user-published", handleUserPublished);
        agoraClient.on("user-unpublished", handleUserUnpublished);

        // الانضمام إلى القناة (نستخدم activeChannel من config.js كاسم القناة)
        await agoraClient.join(AGORA_APP_ID, activeChannel, AGORA_PERMANENT_TOKEN, currentUser.id);

        // إنشاء المسار الصوتي المحلي
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        // إذا طلب المستخدم مكالمة فيديو، نقوم بإنشاء وعرض مسار الفيديو
        if (withVideo) {
            localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = `video-${currentUser.id}`;
            localPlayerContainer.className = "w-full h-48 bg-black rounded-lg overflow-hidden relative shadow-lg";
            
            const videoStreamsDiv = document.getElementById("video-streams");
            if (videoStreamsDiv) {
                videoStreamsDiv.appendChild(localPlayerContainer);
                localVideoTrack.play(localPlayerContainer);
            }
            
            // بث الصوت والفيديو معاً
            await agoraClient.publish([localAudioTrack, localVideoTrack]);
        } else {
            // بث الصوت فقط
            await agoraClient.publish([localAudioTrack]);
        }

    } catch (error) {
        console.error("خطأ في الانضمام للمكالمة:", error);
        alert("فشل الاتصال. يرجى التأكد من صلاحيات المايكروفون/الكاميرا.");
    }
}

// التعامل مع المستخدمين الآخرين عند تشغيلهم للصوت أو الفيديو
async function handleUserPublished(user, mediaType) {
    await agoraClient.subscribe(user, mediaType);
    
    // تشغيل فيديو الطرف الآخر
    if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        let remotePlayerContainer = document.getElementById(`video-${user.uid}`);
        
        if (!remotePlayerContainer) {
            remotePlayerContainer = document.createElement("div");
            remotePlayerContainer.id = `video-${user.uid}`;
            remotePlayerContainer.className = "w-full h-48 bg-black rounded-lg overflow-hidden relative shadow-lg mt-2";
            
            const videoStreamsDiv = document.getElementById("video-streams");
            if (videoStreamsDiv) videoStreamsDiv.appendChild(remotePlayerContainer);
        }
        remoteVideoTrack.play(remotePlayerContainer);
    }

    // تشغيل صوت الطرف الآخر
    if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
    }
}

// التعامل مع المستخدمين عند إيقافهم للبث أو مغادرتهم
function handleUserUnpublished(user, mediaType) {
    if (mediaType === "video") {
        const remotePlayerContainer = document.getElementById(`video-${user.uid}`);
        if (remotePlayerContainer) {
            remotePlayerContainer.remove();
        }
    }
}

// كتم / إلغاء كتم الصوت
async function toggleAudio() {
    if (!localAudioTrack) return;
    const isMuted = !localAudioTrack.enabled;
    await localAudioTrack.setEnabled(isMuted); // يعكس الحالة
    
    const micBtn = document.getElementById('btn-toggle-mic');
    if (micBtn) {
        micBtn.classList.toggle('text-red-500', !isMuted);
    }
}

// تشغيل / إيقاف الكاميرا محلياً
async function toggleVideo() {
    if (!localVideoTrack) return;
    const isVideoEnabled = !localVideoTrack.enabled;
    await localVideoTrack.setEnabled(isVideoEnabled);
    
    const camBtn = document.getElementById('btn-toggle-cam');
    if (camBtn) {
        camBtn.classList.toggle('text-red-500', !isVideoEnabled);
    }
}

// مغادرة وإغلاق المكالمة بالكامل
async function leaveCall() {
    // إيقاف وإغلاق المسارات المحلية
    if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        localAudioTrack = null;
    }
    if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        localVideoTrack = null;
    }

    // إفراغ حاوية الفيديو
    const videoStreamsDiv = document.getElementById("video-streams");
    if (videoStreamsDiv) videoStreamsDiv.innerHTML = "";

    // مغادرة القناة وإيقاف العميل
    if (agoraClient) {
        await agoraClient.leave();
        agoraClient = null;
    }

    // إخفاء واجهة المكالمة
    const callContainer = document.getElementById('call-container');
    if (callContainer) callContainer.classList.add('hidden-view');
}

// ==========================================
// ​​main.js
// ==========================================

// main.js - المنسق الرئيسي للتطبيق

document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة اللغات وواجهة المستخدم
    if (typeof renderLanguageOptions === 'function') renderLanguageOptions();
    if (typeof updateUI === 'function') updateUI();

    // 2. تهيئة قاعدة البيانات (Supabase)
    if (typeof initSupabaseSafe === 'function') initSupabaseSafe();

    // 3. ربط أحداث شاشة اختيار اللغة
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            if (typeof showView === 'function') showView('auth-view');
        });
    }

    // 4. ربط أحداث تبويبات وأزرار المصادقة
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const btnSubmitAuth = document.getElementById('btn-submit-auth');

    if (tabLogin) tabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => switchAuthTab('signup'));
    if (btnSubmitAuth) btnSubmitAuth.addEventListener('click', handleAuthSubmit);

    // 5. ربط أحداث واجهة الدردشة (إرسال، رفع ملفات، تسجيل خروج)
    const btnSend = document.getElementById('btn-send');
    if (btnSend) btnSend.addEventListener('click', sendMessage);

    const uploadImg = document.getElementById('upload-img');
    const uploadVid = document.getElementById('upload-vid');
    const uploadAud = document.getElementById('upload-aud');

    if (uploadImg) uploadImg.addEventListener('change', (e) => handleFileUpload(e, 'image'));
    if (uploadVid) uploadVid.addEventListener('change', (e) => handleFileUpload(e, 'video'));
    if (uploadAud) uploadAud.addEventListener('change', (e) => handleFileUpload(e, 'audio'));

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);

    // 6. ربط أحداث المكالمات (Agora)
    const btnCallAudio = document.getElementById('btn-call-audio');
    const btnCallVideo = document.getElementById('btn-call-video');
    const btnEndCall = document.getElementById('btn-end-call');
    const btnToggleMic = document.getElementById('btn-toggle-mic');
    const btnToggleCam = document.getElementById('btn-toggle-cam');

    if (btnCallAudio) btnCallAudio.addEventListener('click', () => joinCall(false));
    if (btnCallVideo) btnCallVideo.addEventListener('click', () => joinCall(true));
    if (btnEndCall) btnEndCall.addEventListener('click', leaveCall);
    if (btnToggleMic) btnToggleMic.addEventListener('click', toggleAudio);
    if (btnToggleCam) btnToggleCam.addEventListener('click', toggleVideo);

    // 7. مراقبة حالة الاتصال بالإنترنت
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // التحقق الأولي من حالة الشبكة عند تحميل التطبيق
    updateNetworkStatus();
});

// تحديث واجهة المستخدم بناءً على حالة الاتصال بالإنترنت
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const body = document.body;
    
    if (isOnline) {
        body.classList.remove('grayscale', 'opacity-90');
        console.log("App is Online");
    } else {
        body.classList.add('grayscale', 'opacity-90');
        // عرض تنبيه من قاموس اللغات إن وجد، أو نص افتراضي
        const d = typeof uiDict !== 'undefined' ? uiDict[currentLang] : null;
        alert(d ? (d.offlineMsg || "No internet connection") : "No internet connection. Please check your network.");
    }
}

// إعدادات القائمة الجانبية (Settings)
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.toggle('translate-x-full');
    }
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel && !panel.classList.contains('translate-x-full')) {
        panel.classList.add('translate-x-full');
    }
         }
