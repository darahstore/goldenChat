const SUPABASE_URL = 'https://vfysgxgjahaojrtdagbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aRu1BBu5Pb29tq-fNYSZIA_PeSrrpoC';
const AGORA_APP_ID = '51bbd33de1714538936e409f5f050768';
const OFFICIAL_CHANNEL_ID = 'official-golden-chat';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentLang = 'ar';
let currentChannel = null;
let agoraClient = null;
let localTracks = { videoTrack: null, audioTrack: null };

const dict = {
    ar: {
        create_account: "إنشاء حساب / دخول", send_code: "إرسال رمز التحقق",
        enter_otp: "أدخل رمز التحقق", otp_sent: "تم إرسال الرمز لبريدك.", verify_btn: "تأكيد ودخول",
        online: "متصل", offline_msg: "لا يوجد اتصال بالإنترنت. جاري المحاولة...", loading: "جاري التحميل...",
        official: "رسمي", type_msg: "اكتب رسالة...", waiting_others: "في انتظار انضمام الطرف الآخر...",
        vid_limit: "عذراً، مدة الفيديو يجب أن لا تتجاوز 3 دقائق لحفظ المساحة."
    },
    en: {
        create_account: "Login / Register", send_code: "Send OTP Code",
        enter_otp: "Enter OTP", otp_sent: "Code sent to your email.", verify_btn: "Verify & Enter",
        online: "Online", offline_msg: "No Internet Connection...", loading: "Loading...",
        official: "Official", type_msg: "Type a message...", waiting_others: "Waiting for others to join...",
        vid_limit: "Sorry, video duration cannot exceed 3 minutes."
    },
    fr: {
        create_account: "Connexion / Inscription", send_code: "Envoyer le code",
        enter_otp: "Entrez le code OTP", otp_sent: "Code envoyé à votre e-mail.", verify_btn: "Vérifier",
        online: "En ligne", offline_msg: "Pas de connexion Internet...", loading: "Chargement...",
        official: "Officiel", type_msg: "Écrivez un message...", waiting_others: "En attente des autres...",
        vid_limit: "Désolé, la vidéo ne peut pas dépasser 3 minutes."
    }
};

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('html-root').dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(dict[lang][key]) el.innerText = dict[lang][key];
    });
    document.getElementById('msg-input').placeholder = dict[lang].type_msg;
    
    switchView('lang-view', false);
    checkSession();
}

function switchView(viewId, show) {
    document.getElementById(viewId).classList.toggle('hidden-view', !show);
}

function checkAuthInputs() {
    const phone = document.getElementById('phone-input').value;
    const btn = document.getElementById('send-otp-btn');
    if(phone.length > 5) {
        btn.disabled = false; 
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = true; 
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

async function requestOTP() {
    const email = document.getElementById('email-input').value;
    const phone = document.getElementById('phone-input').value;
    const err = document.getElementById('auth-error-1');
    
    if(!email || !phone) return;
    
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { data: { phone_number: phone } }
    });

    if(error) { 
        err.innerText = error.message; 
        err.classList.remove('hidden'); 
    } else {
        switchView('auth-step-1', false);
        switchView('auth-step-2', true);
    }
}

async function verifyOTP() {
    const email = document.getElementById('email-input').value;
    const otp = document.getElementById('otp-input').value;
    const err = document.getElementById('auth-error-2');

    const { data: { session }, error } = await supabase.auth.verifyOtp({
        email: email, token: otp, type: 'email'
    });

    if (error) { 
        err.innerText = "الرمز خاطئ!"; 
        err.classList.remove('hidden'); 
    } else if (session) {
        currentUser = session.user;
        await finalizeUserRegistration();
        loadMainApp();
    }
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        loadMainApp();
    } else {
        switchView('auth-view', true);
        switchView('auth-step-1', true);
    }
}

async function finalizeUserRegistration() {
    const phone = currentUser.user_metadata?.phone_number;
    if(phone) {
        await supabase.from('profiles').upsert({ id: currentUser.id, phone: phone });
    }
    await autoJoinOfficialChannel();
}

async function autoJoinOfficialChannel() {
    await supabase.from('channel_members').upsert(
        { user_id: currentUser.id, channel_id: OFFICIAL_CHANNEL_ID },
        { onConflict: 'user_id, channel_id' }
    );
}

async function loadMainApp() {
    switchView('auth-view', false);
    switchView('main-view', true);
    fetchChannels();
}

function renderChannelUI(id, name, isOfficial) {
    const list = document.getElementById('channels-list');
    const officialBadge = isOfficial ? `<span class="bg-gold-500 text-dark-900 text-xs px-2 py-1 rounded-full font-bold ml-2">📌 ${dict[currentLang].official}</span>` : '';
    const html = `
        <div onclick="openChat('${id}', '${name}')" class="flex items-center justify-between p-4 bg-dark-800 rounded-xl cursor-pointer hover:bg-gray-800 border-l-4 ${isOfficial ? 'border-gold-500' : 'border-transparent'}">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full ${isOfficial ? 'bg-gold-500' : 'bg-gray-600'} flex items-center justify-center text-xl text-white">
                    ${isOfficial ? '<i class="ph-fill ph-crown"></i>' : '<i class="ph-fill ph-users"></i>'}
                </div>
                <div>
                    <h3 class="font-bold text-white">${name} ${officialBadge}</h3>
                    <p class="text-sm text-gray-400">اضغط لدخول المحادثة</p>
                </div>
            </div>
        </div>
    `;
    isOfficial ? list.insertAdjacentHTML('afterbegin', html) : list.insertAdjacentHTML('beforeend', html);
}

function fetchChannels() {
    const list = document.getElementById('channels-list');
    list.innerHTML = '';
    renderChannelUI(OFFICIAL_CHANNEL_ID, 'goldenChat Official', true);
    renderChannelUI('demo-room-1', 'الغرفة العامة', false);
}

function openChat(id, name) {
    currentChannel = id;
    document.getElementById('current-chat-title').innerHTML = name;
    switchView('channels-list', false);
    switchView('chat-area', true);
}

function closeChat() {
    switchView('chat-area', false);
    switchView('channels-list', true);
    currentChannel = null;
}

function handleMediaUpload(event) {
    const file = event.target.files[0];
    if(!file) return;

    if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            const durationInMinutes = video.duration / 60;
            if (durationInMinutes > 3) {
                alert(dict[currentLang].vid_limit);
                event.target.value = '';
            } else {
                uploadToSupabase(file);
            }
        }
        video.src = URL.createObjectURL(file);
    } else {
        uploadToSupabase(file);
    }
}

async function uploadToSupabase(file) {
    console.log("جاري الرفع...", file.name);
    playSound();
}

async function initiateCall(type) {
    if(!currentChannel) return;
    switchView('call-view', true);
    
    agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    
    try {
        await agoraClient.join(AGORA_APP_ID, currentChannel, null, currentUser?.id || Math.floor(Math.random()*1000));
        
        localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if(type === 'video') {
            localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
            localTracks.videoTrack.play("local-video-container");
            await agoraClient.publish([localTracks.audioTrack, localTracks.videoTrack]);
        } else {
            await agoraClient.publish([localTracks.audioTrack]);
            document.getElementById('cam-btn').classList.add('hidden');
        }

        agoraClient.on("user-published", async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === "video") {
                document.getElementById('remote-video-container').innerHTML = '';
                user.videoTrack.play("remote-video-container");
            }
            if (mediaType === "audio") user.audioTrack.play();
        });

    } catch (error) {
        console.error("خطأ في المكالمة:", error);
        endCall();
    }
}

function endCall() {
    if(localTracks.audioTrack) { localTracks.audioTrack.close(); localTracks.audioTrack = null; }
    if(localTracks.videoTrack) { localTracks.videoTrack.close(); localTracks.videoTrack = null; }
    if(agoraClient) agoraClient.leave();
    switchView('call-view', false);
}

function playSound() {
    document.getElementById('notification-sound').play().catch(e=>console.log("تم كتم الصوت افتراضياً"));
}

window.addEventListener('online', () => {
    document.getElementById('offline-bar').classList.add('hidden');
    document.getElementById('status-dot').classList.replace('bg-red-500', 'bg-green-500');
    document.getElementById('status-text').innerText = dict[currentLang].online;
});

window.addEventListener('offline', () => {
    document.getElementById('offline-bar').classList.remove('hidden');
    document.getElementById('status-dot').classList.replace('bg-green-500', 'bg-red-500');
    document.getElementById('status-text').innerText = "Offline";
});

async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
}
