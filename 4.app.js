{\rtf1\ansi\ansicpg1250\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 let currentUser = null;\
let users = [];\
let currentView = 'auth';\
let activeTab = 'dashboard';\
let audioContext = null;\
\
const SOUNDS = \{\
    success: \{ frequency: 523, duration: 0.35, type: 'sine' \},\
    error: \{ frequency: 165, duration: 0.5, type: 'sawtooth' \},\
    click: \{ frequency: 880, duration: 0.1, type: 'sine' \},\
    login: \{ frequency: 220, duration: 0.4, type: 'sine' \},\
    message: \{ frequency: 440, duration: 0.3, type: 'sine' \}\
\};\
\
document.addEventListener('DOMContentLoaded', function() \{\
    initializeData();\
    initializeEventListeners();\
    checkAuthentication();\
\});\
\
function initializeData() \{\
    const storedUsers = localStorage.getItem('whisperUsers');\
    if (storedUsers) \{\
        try \{\
            users = JSON.parse(storedUsers);\
        \} catch (error) \{\
            users = createDefaultUser();\
        \}\
    \} else \{\
        users = createDefaultUser();\
        saveUsersData();\
    \}\
\}\
\
function createDefaultUser() \{\
    return [\{\
        id: 'user_admin',\
        username: 'admin',\
        password: 'heslo123',\
        email: 'admin@example.com',\
        links: [],\
        messages: [],\
        createdAt: new Date().toISOString()\
    \}];\
\}\
\
function saveUsersData() \{\
    localStorage.setItem('whisperUsers', JSON.stringify(users));\
\}\
\
async function playSound(soundType) \{\
    try \{\
        if (!audioContext) \{\
            audioContext = new (window.AudioContext || window.webkitAudioContext)();\
        \}\
        \
        if (audioContext.state === 'suspended') \{\
            await audioContext.resume();\
        \}\
        \
        const soundConfig = SOUNDS[soundType];\
        if (!soundConfig) return;\
        \
        const oscillator = audioContext.createOscillator();\
        const gainNode = audioContext.createGain();\
        \
        oscillator.connect(gainNode);\
        gainNode.connect(audioContext.destination);\
        \
        oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);\
        oscillator.type = soundConfig.type;\
        \
        const volume = 0.3;\
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);\
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);\
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + soundConfig.duration);\
        \
        oscillator.start(audioContext.currentTime);\
        oscillator.stop(audioContext.currentTime + soundConfig.duration);\
        \
    \} catch (error) \{\
        console.error('Audio error:', error);\
    \}\
\}\
\
function initializeEventListeners() \{\
    document.querySelectorAll('.auth-btn').forEach(btn => \{\
        btn.addEventListener('click', function() \{\
            toggleAuthMode(this.getAttribute('data-mode'));\
        \});\
    \});\
    \
    const loginForm = document.getElementById('login-form');\
    if (loginForm) \{\
        loginForm.addEventListener('submit', handleLogin);\
    \}\
    \
    const registerForm = document.getElementById('register-form');\
    if (registerForm) \{\
        registerForm.addEventListener('submit', handleRegister);\
    \}\
    \
    const createForm = document.getElementById('create-form');\
    if (createForm) \{\
        createForm.addEventListener('submit', handleCreateLink);\
    \}\
    \
    const logoutBtn = document.getElementById('logout-btn');\
    if (logoutBtn) \{\
        logoutBtn.addEventListener('click', handleLogout);\
    \}\
    \
    document.addEventListener('click', function(e) \{\
        if (e.target.matches('button, .nav-btn, .auth-btn')) \{\
            playSound('click');\
        \}\
    \});\
\}\
\
function toggleAuthMode(mode) \{\
    const loginForm = document.getElementById('login-form');\
    const registerForm = document.getElementById('register-form');\
    const authBtns = document.querySelectorAll('.auth-btn');\
    \
    authBtns.forEach(btn => btn.classList.remove('active'));\
    document.querySelector(`[data-mode="$\{mode\}"]`).classList.add('active');\
    \
    if (mode === 'login') \{\
        loginForm.classList.remove('hidden');\
        registerForm.classList.add('hidden');\
    \} else \{\
        loginForm.classList.add('hidden');\
        registerForm.classList.remove('hidden');\
    \}\
\}\
\
function handleLogin(e) \{\
    e.preventDefault();\
    \
    const username = document.getElementById('login-username').value.trim();\
    const password = document.getElementById('login-password').value;\
    \
    const user = users.find(u => u.username === username && u.password === password);\
    \
    if (user) \{\
        currentUser = user;\
        localStorage.setItem('currentWhisperUser', JSON.stringify(\{ username: user.username \}));\
        \
        playSound('login');\
        showNotification('\uc0\u9989  P\u345 ihl\'e1\'9aen\'ed \'fasp\u283 \'9an\'e9!', 'success');\
        \
        setTimeout(() => \{\
            showView('dashboard-view');\
            updateDashboard();\
        \}, 500);\
        \
    \} else \{\
        playSound('error');\
        showNotification('\uc0\u10060  Nespr\'e1vn\'e9 p\u345 ihla\'9aovac\'ed \'fadaje!', 'error');\
    \}\
\}\
\
function handleRegister(e) \{\
    e.preventDefault();\
    \
    const username = document.getElementById('reg-username').value.trim();\
    const password = document.getElementById('reg-password').value;\
    const confirmPassword = document.getElementById('reg-confirm').value;\
    const email = document.getElementById('reg-email').value.trim();\
    \
    if (!username || !password) \{\
        playSound('error');\
        showNotification('\uc0\u10060  Vypl\u328 te v\'9aechna povinn\'e1 pole!', 'error');\
        return;\
    \}\
    \
    if (password !== confirmPassword) \{\
        playSound('error');\
        showNotification('\uc0\u10060  Hesla se neshoduj\'ed!', 'error');\
        return;\
    \}\
    \
    if (users.find(u => u.username === username)) \{\
        playSound('error');\
        showNotification('\uc0\u10060  U\'9eivatelsk\'e9 jm\'e9no ji\'9e existuje!', 'error');\
        return;\
    \}\
    \
    const newUser = \{\
        id: 'user_' + Date.now(),\
        username: username,\
        password: password,\
        email: email,\
        links: [],\
        messages: [],\
        createdAt: new Date().toISOString()\
    \};\
    \
    users.push(newUser);\
    saveUsersData();\
    \
    currentUser = newUser;\
    localStorage.setItem('currentWhisperUser', JSON.stringify(\{ username: newUser.username \}));\
    \
    playSound('success');\
    showNotification('\uc0\u9989  Registrace \'fasp\u283 \'9an\'e1!', 'success');\
    \
    setTimeout(() => \{\
        showView('dashboard-view');\
        updateDashboard();\
    \}, 500);\
\}\
\
function handleLogout() \{\
    currentUser = null;\
    localStorage.removeItem('currentWhisperUser');\
    \
    playSound('click');\
    showNotification('\uc0\u55357 \u56395  Odhl\'e1\'9aen\'ed \'fasp\u283 \'9an\'e9!', 'success');\
    \
    showView('auth-view');\
\}\
\
function checkAuthentication() \{\
    const sessionUser = localStorage.getItem('currentWhisperUser');\
    if (sessionUser) \{\
        try \{\
            const userData = JSON.parse(sessionUser);\
            const user = users.find(u => u.username === userData.username);\
            if (user) \{\
                currentUser = user;\
                showView('dashboard-view');\
                updateDashboard();\
                return;\
            \}\
        \} catch (error) \{\
            console.error('Error parsing session user:', error);\
        \}\
    \}\
    showView('auth-view');\
\}\
\
function showView(viewId) \{\
    document.querySelectorAll('.view').forEach(view => \{\
        view.classList.remove('active');\
    \});\
    \
    const targetView = document.getElementById(viewId);\
    if (targetView) \{\
        targetView.classList.add('active');\
    \}\
    \
    currentView = viewId.replace('-view', '');\
\}\
\
function showTab(tabName) \{\
    document.querySelectorAll('.nav-btn').forEach(btn => \{\
        btn.classList.remove('active');\
    \});\
    \
    const navButtons = document.querySelectorAll('.nav-btn');\
    navButtons.forEach(btn => \{\
        if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) || \
            btn.getAttribute('onclick')?.includes(tabName)) \{\
            btn.classList.add('active');\
        \}\
    \});\
    \
    document.querySelectorAll('.tab-content').forEach(tab => \{\
        tab.classList.add('hidden');\
    \});\
    \
    const targetTab = document.getElementById(tabName + '-tab');\
    if (targetTab) \{\
        targetTab.classList.remove('hidden');\
    \}\
    \
    activeTab = tabName;\
    \
    switch (tabName) \{\
        case 'dashboard':\
            updateDashboard();\
            break;\
        case 'links':\
            loadLinksList();\
            break;\
        case 'messages':\
            loadMessagesList();\
            break;\
        case 'settings':\
            loadSettings();\
            break;\
    \}\
\}\
\
function handleCreateLink(e) \{\
    e.preventDefault();\
    \
    const linkName = document.getElementById('link-name').value.trim();\
    const effectCheckboxes = document.querySelectorAll('.effects-checkboxes input:checked');\
    const selectedEffects = Array.from(effectCheckboxes).map(cb => cb.value);\
    \
    if (!linkName) \{\
        playSound('error');\
        showNotification('\uc0\u10060  Zadejte n\'e1zev odkazu!', 'error');\
        return;\
    \}\
    \
    const token = generateToken();\
    const link = \{\
        id: 'link_' + Date.now(),\
        token: token,\
        name: linkName,\
        effects: selectedEffects,\
        isActive: true,\
        createdAt: new Date().toISOString(),\
        messages: []\
    \};\
    \
    if (!currentUser.links) \{\
        currentUser.links = [];\
    \}\
    currentUser.links.push(link);\
    \
    const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');\
    allLinks.push(\{\
        ...link,\
        ownerId: currentUser.id\
    \});\
    localStorage.setItem('whisperLinks', JSON.stringify(allLinks));\
    \
    const userIndex = users.findIndex(u => u.id === currentUser.id);\
    if (userIndex !== -1) \{\
        users[userIndex] = currentUser;\
        saveUsersData();\
    \}\
    \
    playSound('success');\
    showNotification('\uc0\u9989  Odkaz vytvo\u345 en!', 'success');\
    \
    document.getElementById('create-form').reset();\
    showTab('links');\
\}\
\
function generateToken(length = 12) \{\
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\
    let result = '';\
    for (let i = 0; i < length; i++) \{\
        result += chars.charAt(Math.floor(Math.random() * chars.length));\
    \}\
    return result;\
\}\
\
function loadLinksList() \{\
    const linksList = document.getElementById('links-list');\
    if (!linksList || !currentUser.links) return;\
    \
    if (currentUser.links.length === 0) \{\
        linksList.innerHTML = '<p class="text-center">\uc0\u55357 \u56599  Zat\'edm nem\'e1te \'9e\'e1dn\'e9 odkazy. <a href="#" onclick="showTab(\\'create\\')">Vytvo\u345 te prvn\'ed!</a></p>';\
        return;\
    \}\
    \
    let html = '';\
    currentUser.links.forEach(link => \{\
        const linkUrl = `$\{window.location.origin\}/anon.html?token=$\{link.token\}`;\
        const messageCount = link.messages ? link.messages.length : 0;\
        \
        html += `\
            <div class="card" style="margin-bottom: 16px;">\
                <div class="card-body">\
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">\
                        <div style="font-weight: 600; color: var(--color-text);">$\{link.name\}</div>\
                        <div style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; $\{link.isActive ? 'background: rgba(22, 163, 74, 0.1); color: var(--color-success);' : 'background: rgba(220, 38, 38, 0.1); color: var(--color-error);'\}">\
                            $\{link.isActive ? 'Aktivn\'ed' : 'Pou\'9eito'\}\
                        </div>\
                    </div>\
                    <div style="font-family: monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 14px; word-break: break-all; margin: 8px 0;">$\{linkUrl\}</div>\
                    <div style="margin: 8px 0; font-size: 14px; color: var(--color-text-light);">\
                        \uc0\u55357 \u56517  $\{new Date(link.createdAt).toLocaleDateString('cs-CZ')\}\
                        \uc0\u55357 \u56492  $\{messageCount\} zpr\'e1v\
                        $\{link.effects.length > 0 ? '\uc0\u10024  ' + link.effects.join(', ') : ''\}\
                    </div>\
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">\
                        <button class="btn btn-outline" onclick="copyToClipboard('$\{linkUrl\}')">\uc0\u55357 \u56523  Kop\'edrovat</button>\
                        $\{link.isActive ? \
                            `<button class="btn btn-outline" onclick="deactivateLink('$\{link.id\}')">\uc0\u55357 \u57003  Deaktivovat</button>` : \
                            ''\
                        \}\
                    </div>\
                </div>\
            </div>\
        `;\
    \});\
    \
    linksList.innerHTML = html;\
\}\
\
function copyToClipboard(text) \{\
    navigator.clipboard.writeText(text).then(() => \{\
        playSound('success');\
        showNotification('\uc0\u55357 \u56523  Odkaz zkop\'edrov\'e1n!', 'success');\
    \}).catch(() => \{\
        playSound('error');\
        showNotification('\uc0\u10060  Nepoda\u345 ilo se zkop\'edrovat!', 'error');\
    \});\
\}\
\
function deactivateLink(linkId) \{\
    const link = currentUser.links.find(l => l.id === linkId);\
    if (link) \{\
        link.isActive = false;\
        \
        const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');\
        const globalLink = allLinks.find(l => l.id === linkId);\
        if (globalLink) \{\
            globalLink.isActive = false;\
            localStorage.setItem('whisperLinks', JSON.stringify(allLinks));\
        \}\
        \
        const userIndex = users.findIndex(u => u.id === currentUser.id);\
        if (userIndex !== -1) \{\
            users[userIndex] = currentUser;\
            saveUsersData();\
        \}\
        \
        playSound('success');\
        showNotification('\uc0\u55357 \u57003  Odkaz deaktivov\'e1n!', 'success');\
        loadLinksList();\
    \}\
\}\
\
function loadMessagesList() \{\
    const messagesList = document.getElementById('messages-list');\
    if (!messagesList) return;\
    \
    const allMessages = [];\
    \
    if (currentUser.links) \{\
        currentUser.links.forEach(link => \{\
            if (link.messages && link.messages.length > 0) \{\
                link.messages.forEach(msg => \{\
                    allMessages.push(\{\
                        ...msg,\
                        linkName: link.name,\
                        linkId: link.id\
                    \});\
                \});\
            \}\
        \});\
    \}\
    \
    if (allMessages.length === 0) \{\
        messagesList.innerHTML = '<p class="text-center">\uc0\u55357 \u56492  Zat\'edm nem\'e1te \'9e\'e1dn\'e9 zpr\'e1vy.</p>';\
        return;\
    \}\
    \
    allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));\
    \
    let html = '';\
    allMessages.forEach(msg => \{\
        html += `\
            <div class="card" style="margin-bottom: 16px;">\
                <div class="card-body">\
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; color: var(--color-text-light);">\
                        <span>\uc0\u55357 \u56525  $\{msg.linkName\}</span>\
                        <span>$\{new Date(msg.timestamp).toLocaleString('cs-CZ')\}</span>\
                    </div>\
                    <div style="color: var(--color-text); line-height: 1.6;">$\{msg.content\}</div>\
                    $\{msg.effects && msg.effects.length > 0 ? \
                        `<div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">\
                            $\{msg.effects.map(effect => `<span style="background: rgba(5, 150, 105, 0.1); color: var(--color-primary); padding: 2px 8px; border-radius: 12px; font-size: 12px;">$\{effect\}</span>`).join('')\}\
                        </div>` : \
                        ''\
                    \}\
                </div>\
            </div>\
        `;\
    \});\
    \
    messagesList.innerHTML = html;\
\}\
\
function checkForNewMessages() \{\
    if (!currentUser || !currentUser.links) return;\
    \
    const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');\
    let hasNewMessages = false;\
    let newMessageCount = 0;\
    \
    currentUser.links.forEach(userLink => \{\
        const globalLink = allLinks.find(l => l.id === userLink.id && l.ownerId === currentUser.id);\
        if (globalLink && globalLink.messages) \{\
            const oldCount = userLink.messages ? userLink.messages.length : 0;\
            const newCount = globalLink.messages.length;\
            \
            if (newCount > oldCount) \{\
                hasNewMessages = true;\
                newMessageCount += (newCount - oldCount);\
                userLink.messages = globalLink.messages;\
            \}\
        \}\
    \});\
    \
    if (hasNewMessages) \{\
        const userIndex = users.findIndex(u => u.id === currentUser.id);\
        if (userIndex !== -1) \{\
            users[userIndex] = currentUser;\
            saveUsersData();\
        \}\
        \
        playSound('message');\
        showNotification(`\uc0\u55357 \u56492  M\'e1te $\{newMessageCount\} nov\'fdch zpr\'e1v!`, 'success');\
        updateDashboard();\
    \}\
\}\
\
function updateDashboard() \{\
    if (!currentUser) return;\
    \
    const totalLinks = currentUser.links ? currentUser.links.length : 0;\
    const activeLinks = currentUser.links ? currentUser.links.filter(l => l.isActive).length : 0;\
    \
    let totalMessages = 0;\
    if (currentUser.links) \{\
        currentUser.links.forEach(link => \{\
            if (link.messages) \{\
                totalMessages += link.messages.length;\
            \}\
        \});\
    \}\
    \
    const totalLinksEl = document.getElementById('total-links');\
    const activeLinksEl = document.getElementById('active-links');\
    const totalMessagesEl = document.getElementById('total-messages');\
    \
    if (totalLinksEl) totalLinksEl.textContent = totalLinks;\
    if (activeLinksEl) activeLinksEl.textContent = activeLinks;\
    if (totalMessagesEl) totalMessagesEl.textContent = totalMessages;\
\}\
\
function loadSettings() \{\
    const settingsContent = document.getElementById('settings-content');\
    if (!settingsContent) return;\
    \
    settingsContent.innerHTML = `\
        <div class="card">\
            <div class="card-body">\
                <h3>\uc0\u55357 \u56420  \'da\u269 et</h3>\
                <p><strong>U\'9eivatelsk\'e9 jm\'e9no:</strong> $\{currentUser.username\}</p>\
                <p><strong>Email:</strong> $\{currentUser.email || 'Nen\'ed nastaven'\}</p>\
                <button class="btn btn-outline" onclick="handleLogout()">Odhl\'e1sit se</button>\
            </div>\
        </div>\
        \
        <div class="card">\
            <div class="card-body">\
                <h3>\uc0\u55357 \u56561  Aplikace</h3>\
                <p><strong>Verze:</strong> Whisper v1.0</p>\
                <p><strong>Celkem u\'9eivatel\uc0\u367 :</strong> $\{users.length\}</p>\
            </div>\
        </div>\
    `;\
\}\
\
function showNotification(message, type = 'success') \{\
    const notifications = document.getElementById('notifications');\
    if (!notifications) return;\
    \
    const notification = document.createElement('div');\
    notification.className = `notification $\{type\}`;\
    notification.innerHTML = `<div>$\{message\}</div>`;\
    \
    notifications.appendChild(notification);\
    \
    setTimeout(() => \{\
        if (notification.parentElement) \{\
            notification.remove();\
        \}\
    \}, 3000);\
\}\
\
window.showTab = showTab;\
window.copyToClipboard = copyToClipboard;\
window.deactivateLink = deactivateLink;\
}