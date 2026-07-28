const SUPABASE_URL = 'https://vfysgxgjahaojrtdagbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aRu1BBu5Pb29tq-fNYSZIA_PeSrrpoC';

const AGORA_APP_ID = '77a195757c054acaaf8da43c269b2260';
const AGORA_PERMANENT_TOKEN = '00677a195757c054acaaf8da43c269b2260IABQLMitxwtMDMd4/d5F8xLlrQ9ut+mIk0aa9jUYpm13A0UxBjEAAAAAIgBa0EoDD21kagQAAQCPHi99AgCPHi99AwCPHi99BACPHi99';

let supabaseClient = null;
let currentUser = null;
let currentAuthMode = 'login';
let currentLang = 'ar';
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;
let activeChannel = 'official-golden-chat-id';
let realtimeChannel = null;

const uiDict = {
    ar: { loginTab: "تسجيل الدخول", signupTab: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", phone: "رقم الهاتف (إجباري مع رمز الدولة +)", btnLogin: "دخول", btnSignup: "إنشاء حساب", offline: "انقطع الاتصال بالإنترنت...", online: "متصل", msgPlaceholder: "اكتب رسالة...", settings: "الإعدادات", langSelect: "لغة التطبيق", myGroups: "مجموعاتي النشطة", logout: "تسجيل الخروج", leave: "مغادرة وحذف", videoLong: "الفيديو يتجاوز 3 دقائق ومرفوض", dir: "rtl" },
    en: { loginTab: "Log In", signupTab: "Sign Up", email: "Email Address", pass: "Password", phone: "Phone Number (Required with +)", btnLogin: "Log In", btnSignup: "Sign Up", offline: "No Internet Connection...", online: "Online", msgPlaceholder: "Type a message...", settings: "Settings", langSelect: "App Language", myGroups: "My Active Groups", logout: "Log Out", leave: "Leave & Delete", videoLong: "Video exceeds 3 minutes", dir: "ltr" },
    fr: { loginTab: "Connexion", signupTab: "S'inscrire", email: "Adresse e-mail", pass: "Mot de passe", phone: "Numéro de téléphone (Obligatoire +)", btnLogin: "Connexion", btnSignup: "S'inscrire", offline: "Connexion interrompue...", online: "En ligne", msgPlaceholder: "Écrire un message...", settings: "Paramètres", langSelect: "Langue de l'application", myGroups: "Mes groupes actifs", logout: "Déconnexion", leave: "Quitter et supprimer", videoLong: "La vidéo dépasse 3 minutes", dir: "ltr" }
};

const extendedLanguages = [
    { code: 'ar', name: 'العربية (Arabic)' }, { code: 'en', name: 'English (UK/US)' }, { code: 'fr', name: 'Français (French)' }
];

function initLanguagesDropdown() {
    const select = document.getElementById('global-lang-select');
    select.innerHTML = '';
    extendedLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.innerText = lang.name;
        select.appendChild(option);
    });
}

function showView(viewId) {
    ['lang-view', 'auth-view', 'app-view', 'settings-view'].forEach(id => {
        document.getElementById(id).classList.add('hidden-view');
    });
    document.getElementById(viewId).classList.remove('hidden-view');
}

function setLanguageAndProceed(langCode) {
    applyLanguage(langCode);
    showView('auth-view');
    switchAuthTab('login');
    initSupabaseSafe();
}

function changeGlobalLanguage(langCode) {
    applyLanguage(langCode);
    closeSettings();
}

function applyLanguage(langCode) {
    currentLang = uiDict[langCode] ? langCode : 'en'; 
    const d = uiDict[currentLang];
    
    const htmlRoot = document.getElementById('html-root');
    htmlRoot.setAttribute('dir', d.dir);
    htmlRoot.setAttribute('lang', currentLang);
    document.getElementById('global-lang-select').value = currentLang;
    
    document.getElementById('tab-login-btn').innerText = d.loginTab;
    document.getElementById('tab-signup-btn').innerText = d.signupTab;
    document.getElementById('lbl-email').innerText = d.email;
    document.getElementById('lbl-pass').innerText = d.pass;
    document.getElementById('lbl-phone').innerText = d.phone;
    document.getElementById('offline-text').innerText = d.offline;
    document.getElementById('user-status').innerText = d.online;
    document.getElementById('msg-input').placeholder = d.msgPlaceholder;
    document.getElementById('settings-title').innerText = d.settings;
    document.getElementById('lbl-lang-select').innerText = d.langSelect;
    document.getElementById('lbl-my-groups').innerText = d.myGroups;
    document.getElementById('btn-logout').innerText = d.logout;

    switchAuthTab(currentAuthMode); 
}

function switchAuthTab(mode) {
    currentAuthMode = mode;
    const d = uiDict[currentLang];
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const submitBtn = document.getElementById('btn-submit-auth');
    
    if (mode === 'login') {
        document.getElementById('tab-login-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-signup-btn').className = "tab-inactive text-lg pb-2 transition-all";
        phoneWrapper.style.display = "none";
        submitBtn.innerText = d.btnLogin;
    } else {
        document.getElementById('tab-signup-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-login-btn').className = "tab-inactive text-lg pb-2 transition-all";
        phoneWrapper.style.display = "block";
        submitBtn.innerText = d.btnSignup;
    }
    validateForm();
}

function validateForm() {
    const email = document.getElementById('email-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    const btn = document.getElementById('btn-submit-auth');

    let isValid = email.length > 5 && pass.length >= 6;
    if (currentAuthMode === 'signup') {
        isValid = isValid && phone.length >= 8 && phone.startsWith('+'); 
    }

    if (isValid) {
        btn.disabled = false;
        btn.className = "w-full bg-gold-500 text-dark-900 p-3.5 rounded-xl font-bold transition hover:bg-gold-400 shadow-md cursor-pointer";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-gray-600 text-gray-400 p-3.5 rounded-xl font-bold transition shadow-md cursor-not-allowed";
    }
}

document.getElementById('email-input').addEventListener('input', validateForm);
document.getElementById('password-input').addEventListener('input', validateForm);
document.getElementById('phone-input').addEventListener('input', validateForm);

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

async function handleAuthSubmit() {
    if (!supabaseClient) return;
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    const btn = document.getElementById('btn-submit-auth');
    
    btn.innerText = "...";
    btn.disabled = true;

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
        playAudioTone('login');
        startApp();
    } catch (err) {
        alert("Auth Error: " + err.message);
    } finally {
        switchAuthTab(currentAuthMode); 
    }
}

async function checkSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
            currentUser = data.session.user;
            startApp();
        }
    } catch (e) {}
}

async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        closeSettings();
        showView('auth-view');
        document.getElementById('email-input').value = '';
        document.getElementById('password-input').value = '';
        validateForm();
    }
}

function startApp() {
    showView('app-view');
    renderChannels();
    setupRealtime();
}

async function renderChannels() {
    const list = document.getElementById('channels-list');
    list.innerHTML = `
        <div onclick="selectChannel('official-golden-chat-id', 'القناة الرسمية')" class="flex-shrink-0 bg-gold-600/20 border border-gold-500 px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg">
            <span class="text-gold-400">📌</span>
            <span class="font-bold text-gold-400 text-sm">القناة الرسمية</span>
        </div>
    `;
    
    if (supabaseClient && currentUser) {
        try {
            await supabaseClient.from('channel_members').upsert({
                channel_id: 'official-golden-chat-id', user_id: currentUser.id
            });
        } catch (e) {}
    }
}

function selectChannel(id, name) {
    activeChannel = id;
    document.getElementById('welcome-msg').innerText = `مرحباً بك في ${name}`;
    document.getElementById('chat-box').innerHTML = ''; 
}

function showSettings() {
    showView('settings-view');
}
function closeSettings() { showView('app-view'); }

async function leaveGroup(groupId) {
    if(confirm(uiDict[currentLang].leave + " ?")) {
        if(supabaseClient && currentUser) {
            try {
                await supabaseClient.from('channel_members').delete().match({ channel_id: groupId, user_id: currentUser.id });
                alert("تمت المغادرة بنجاح.");
            } catch(e) {}
        }
    }
}

function setupRealtime() {
    if (!supabaseClient) return;
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
    }
    realtimeChannel = supabaseClient.channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            if(payload.new.channel_id === activeChannel) {
                appendMessage(payload.new.text, payload.new.user_id === currentUser?.id);
                playAudioTone('msg');
            }
        }).subscribe();
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, true); 
    input.value = '';

    if (supabaseClient && currentUser) {
        supabaseClient.from('messages').insert({
            text: text, user_id: currentUser.id, channel_id: activeChannel
        }).then();
    }
}

function appendMessage(text, isMine) {
    const box = document.getElementById('chat-box');
    const align = isMine ? 'justify-end' : 'justify-start';
    const bg = isMine ? 'bg-gold-500 text-dark-900 font-medium' : 'bg-dark-800 border border-gray-700 text-white';
    const radius = isMine ? 'rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl' : 'rounded-tr-2xl rounded-br-2xl rounded-tl-2xl';

    box.innerHTML += `<div class="flex w-full ${align} mb-3"><div class="max-w-[80%] p-3 ${bg} ${radius} shadow-md text-sm break-words">${text}</div></div>`;
    box.scrollTop = box.scrollHeight;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        videoEl.onloadedmetadata = function() {
            window.URL.revokeObjectURL(videoEl.src);
            if (videoEl.duration > 180) { 
                alert(uiDict[currentLang].videoLong);
                return;
            }
            processMedia(file);
        };
        videoEl.src = URL.createObjectURL(file);
    } else {
        processMedia(file);
    }
}

async function processMedia(file) {
    appendMessage(`📁 جاري ضغط ورفع الملف: ${file.name}...`, true);
    setTimeout(() => {
        if(supabaseClient) {
            console.log("Auto-Purge Triggered");
        }
    }, 10800000); 
}

async function startAgoraCall(type) {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
        document.getElementById('call-controls').classList.remove('hidden-view');
        if (window.AgoraRTC) {
            agoraClient = window.AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await agoraClient.join(AGORA_APP_ID, "goldenChat", AGORA_PERMANENT_TOKEN, null);
            
            localAudioTrack = await window.AgoraRTC.createMicrophoneAudioTrack();
            if (type === 'video') {
                localVideoTrack = await window.AgoraRTC.createCameraVideoTrack();
                await agoraClient.publish([localAudioTrack, localVideoTrack]);
            } else {
                await agoraClient.publish([localAudioTrack]);
            }
            alert("تم بدء المكالمة والاتصال بالغرفة بنجاح.");
        }
    } catch (err) {
        console.warn(err);
        alert("يرجى إعطاء صلاحيات الميكروفون/الكاميرا من إعدادات المتصفح للسماح بإجراء المكالمات.");
    }
}

async function toggleMic() {
    if (localAudioTrack) {
        const muted = localAudioTrack.muted;
        await localAudioTrack.setMuted(!muted);
        document.getElementById('btn-mic').classList.toggle('bg-red-600', !muted);
    }
}
async function toggleCam() {
    if (localVideoTrack) {
        const muted = localVideoTrack.muted;
        await localVideoTrack.setMuted(!muted);
        document.getElementById('btn-cam').classList.toggle('bg-red-600', !muted);
    }
}
async function endAgoraCall() {
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (localVideoTrack) { localVideoTrack.close(); localVideoTrack = null; }
    if (agoraClient) await agoraClient.leave();
    document.getElementById('call-controls').classList.add('hidden-view');
}

function playAudioTone(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'login' ? 520 : 750, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
}

window.addEventListener('offline', () => document.getElementById('offline-bar').style.top = '0px');
window.addEventListener('online', () => document.getElementById('offline-bar').style.top = '-50px');

initLanguagesDropdown();
