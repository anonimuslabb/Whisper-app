let currentUser = null;
let users = [];
let currentView = 'auth';
let activeTab = 'dashboard';
let audioContext = null;

const SOUNDS = {
    success: { frequency: 523, duration: 0.35, type: 'sine' },
    error: { frequency: 165, duration: 0.5, type: 'sawtooth' },
    click: { frequency: 880, duration: 0.1, type: 'sine' },
    login: { frequency: 220, duration: 0.4, type: 'sine' },
    message: { frequency: 440, duration: 0.3, type: 'sine' }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    initializeEventListeners();
    checkAuthentication();
});

function initializeData() {
    const storedUsers = localStorage.getItem('whisperUsers');
    if (storedUsers) {
        try {
            users = JSON.parse(storedUsers);
        } catch (error) {
            users = createDefaultUser();
        }
    } else {
        users = createDefaultUser();
        saveUsersData();
    }
}

function createDefaultUser() {
    return [{
        id: 'user_admin',
        username: 'admin',
        password: 'heslo123',
        email: 'admin@example.com',
        links: [],
        messages: [],
        createdAt: new Date().toISOString()
    }];
}

function saveUsersData() {
    localStorage.setItem('whisperUsers', JSON.stringify(users));
}

async function playSound(soundType) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        const soundConfig = SOUNDS[soundType];
        if (!soundConfig) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
        oscillator.type = soundConfig.type;
        
        const volume = 0.3;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + soundConfig.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + soundConfig.duration);
        
    } catch (error) {
        console.error('Audio error:', error);
    }
}

function initializeEventListeners() {
    document.querySelectorAll('.auth-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleAuthMode(this.getAttribute('data-mode'));
        });
    });
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const createForm = document.getElementById('create-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateLink);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.matches('button, .nav-btn, .auth-btn')) {
            playSound('click');
        }
    });
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authBtns = document.querySelectorAll('.auth-btn');
    
    authBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentWhisperUser', JSON.stringify({ username: user.username }));
        
        playSound('login');
        showNotification('✅ Přihlášení úspěšné!', 'success');
        
        setTimeout(() => {
            showView('dashboard-view');
            updateDashboard();
        }, 500);
        
    } else {
        playSound('error');
        showNotification('❌ Nesprávné přihlašovací údaje!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;
    const email = document.getElementById('reg-email').value.trim();
    
    if (!username || !password) {
        playSound('error');
        showNotification('❌ Vyplňte všechna povinná pole!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        playSound('error');
        showNotification('❌ Hesla se neshodují!', 'error');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        playSound('error');
        showNotification('❌ Uživatelské jméno již existuje!', 'error');
        return;
    }
    
    const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        password: password,
        email: email,
        links: [],
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsersData();
    
    currentUser = newUser;
    localStorage.setItem('currentWhisperUser', JSON.stringify({ username: newUser.username }));
    
    playSound('success');
    showNotification('✅ Registrace úspěšná!', 'success');
    
    setTimeout(() => {
        showView('dashboard-view');
        updateDashboard();
    }, 500);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentWhisperUser');
    
    playSound('click');
    showNotification('👋 Odhlášení úspěšné!', 'success');
    
    showView('auth-view');
}

function checkAuthentication() {
    const sessionUser = localStorage.getItem('currentWhisperUser');
    if (sessionUser) {
        try {
            const userData = JSON.parse(sessionUser);
            const user = users.find(u => u.username === userData.username);
            if (user) {
                currentUser = user;
                showView('dashboard-view');
                updateDashboard();
                return;
            }
        } catch (error) {
            console.error('Error parsing session user:', error);
        }
    }
    showView('auth-view');
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    currentView = viewId.replace('-view', '');
}

function showTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) || 
            btn.getAttribute('onclick')?.includes(tabName)) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    activeTab = tabName;
    
    switch (tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'links':
            loadLinksList();
            break;
        case 'messages':
            loadMessagesList();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

function handleCreateLink(e) {
    e.preventDefault();
    
    const linkName = document.getElementById('link-name').value.trim();
    const effectCheckboxes = document.querySelectorAll('.effects-checkboxes input:checked');
    const selectedEffects = Array.from(effectCheckboxes).map(cb => cb.value);
    
    if (!linkName) {
        playSound('error');
        showNotification('❌ Zadejte název odkazu!', 'error');
        return;
    }
    
    const token = generateToken();
    const link = {
        id: 'link_' + Date.now(),
        token: token,
        name: linkName,
        effects: selectedEffects,
        isActive: true,
        createdAt: new Date().toISOString(),
        messages: []
    };
    
    if (!currentUser.links) {
        currentUser.links = [];
    }
    currentUser.links.push(link);
    
    const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');
    allLinks.push({
        ...link,
        ownerId: currentUser.id
    });
    localStorage.setItem('whisperLinks', JSON.stringify(allLinks));
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveUsersData();
    }
    
    playSound('success');
    showNotification('✅ Odkaz vytvořen!', 'success');
    
    document.getElementById('create-form').reset();
    showTab('links');
}

function generateToken(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function loadLinksList() {
    const linksList = document.getElementById('links-list');
    if (!linksList || !currentUser.links) return;
    
    if (currentUser.links.length === 0) {
        linksList.innerHTML = '<p style="text-align: center;">🔗 Zatím nemáte žádné odkazy.</p>';
        return;
    }
    
    let html = '';
    currentUser.links.forEach(link => {
        const linkUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}2.anon.html?token=${link.token}`;
        const messageCount = link.messages ? link.messages.length : 0;
        
        html += `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <div style="font-weight: 600;">${link.name}</div>
                        <div style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; ${link.isActive ? 'background: rgba(22, 163, 74, 0.1); color: #16a34a;' : 'background: rgba(220, 38, 38, 0.1); color: #dc2626;'}">
                            ${link.isActive ? 'Aktivní' : 'Použito'}
                        </div>
                    </div>
                    <div style="font-family: monospace; background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 14px; word-break: break-all; margin: 8px 0;">${linkUrl}</div>
                    <div style="margin: 8px 0; font-size: 14px; color: #64748b;">
                        📅 ${new Date(link.createdAt).toLocaleDateString('cs-CZ')} • 💬 ${messageCount} zpráv
                    </div>
                    <button class="btn btn-outline" onclick="copyToClipboard('${linkUrl}')">📋 Kopírovat</button>
                </div>
            </div>
