let linkData = null;
let selectedEffects = [];
let audioContext = null;

const SOUNDS = {
    success: { frequency: 523, duration: 0.35, type: 'sine' },
    error: { frequency: 165, duration: 0.5, type: 'sawtooth' },
    click: { frequency: 880, duration: 0.1, type: 'sine' }
};

document.addEventListener('DOMContentLoaded', function() {
    loadLinkFromURL();
    initializeEventListeners();
});

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

function loadLinkFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError('Neplatný odkaz - chybí token.');
        return;
    }
    
    const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');
    linkData = allLinks.find(link => link.token === token);
    
    if (!linkData) {
        showError('Odkaz nebyl nalezen.');
        return;
    }
    
    if (!linkData.isActive) {
        showError('Tento odkaz již byl použit a není aktivní.');
        return;
    }
    
    displayLinkInfo();
}

function displayLinkInfo() {
    const linkInfo = document.getElementById('link-info');
    if (linkInfo && linkData) {
        let effectsText = '';
        if (linkData.effects && linkData.effects.length > 0) {
            effectsText = ` • Dostupné efekty: ${linkData.effects.join(', ')}`;
        }
        
        linkInfo.innerHTML = `
            <div style="background: rgba(5, 150, 105, 0.1); padding: 12px; border-radius: 8px; margin: 16px 0;">
                📍 <strong>${linkData.name}</strong>${effectsText}
            </div>
        `;
    }
}

function initializeEventListeners() {
    document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const effect = this.getAttribute('data-effect');
            toggleEffect(effect, this);
        });
    });
    
    const sendButton = document.getElementById('send-btn');
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.matches('button, .effect-btn')) {
            playSound('click');
        }
    });
}

function toggleEffect(effect, buttonElement) {
    if (linkData.effects && !linkData.effects.includes(effect)) {
        showError(`Efekt ${effect} není dostupný.`);
        return;
    }
    
    const index = selectedEffects.indexOf(effect);
    
    if (index > -1) {
        selectedEffects.splice(index, 1);
        buttonElement.classList.remove('selected');
    } else {
        if (selectedEffects.length >= 3) {
            showError('Můžete vybrat maximálně 3 efekty.');
            return;
        }
        selectedEffects.push(effect);
        buttonElement.classList.add('selected');
    }
    
    updateSelectedEffectsDisplay();
}

function updateSelectedEffectsDisplay() {
    const selectedEffectsEl = document.getElementById('selected-effects');
    if (!selectedEffectsEl) return;
    
    if (selectedEffects.length === 0) {
        selectedEffectsEl.innerHTML = '';
        return;
    }
    
    const effectsHtml = selectedEffects.map(effect => 
        `<span class="selected-effect">${effect}</span>`
    ).join('');
    
    selectedEffectsEl.innerHTML = `<div style="margin-top: 8px;">Vybrané: ${effectsHtml}</div>`;
}

function handleSendMessage(e) {
    e.preventDefault();
    
    const messageText = document.getElementById('message-text').value.trim();
    
    if (!messageText) {
        playSound('error');
        showError('Napište nějakou zprávu!');
        return;
    }
    
    if (!linkData || !linkData.isActive) {
        playSound('error');
        showError('Odkaz není aktivní!');
        return;
    }
    
    const message = {
        id: 'msg_' + Date.now(),
        content: messageText,
        effects: [...selectedEffects],
        timestamp: new Date().toISOString(),
        anonymous: true
    };
    
    if (!linkData.messages) {
        linkData.messages = [];
    }
    linkData.messages.push(message);
    
    linkData.isActive = false;
    
    const allLinks = JSON.parse(localStorage.getItem('whisperLinks') || '[]');
    const linkIndex = allLinks.findIndex(l => l.token === linkData.token);
    if (linkIndex !== -1) {
        allLinks[linkIndex] = linkData;
        localStorage.setItem('whisperLinks', JSON.stringify(allLinks));
    }
    
    playSound('success');
    showSuccess();
}

function showSuccess() {
    const messageForm = document.getElementById('message-form');
    const messageStatus = document.getElementById('message-status');
    const errorMessage = document.getElementById('error-message');
    
    if (messageForm) messageForm.classList.add('hidden');
    if (messageStatus) messageStatus.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
}

function showError(errorText) {
    const messageForm = document.getElementById('message-form');
    const messageStatus = document.getElementById('message-status');
    const errorMessage = document.getElementById('error-message');
    const errorTextEl = document.getElementById('error-text');
    
    if (messageForm) messageForm.classList.add('hidden');
    if (messageStatus) messageStatus.classList.add('hidden');
    if (errorMessage) errorMessage.classList.remove('hidden');
    if (errorTextEl) errorTextEl.textContent = errorText;
    
    playSound('error');
}
