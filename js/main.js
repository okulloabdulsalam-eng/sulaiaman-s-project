/**
 * Main Application - Initialization and event handling
 */

// Navigation function
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
    
    // Refresh page content if needed
    if (page === 'quests') {
        questSystem.renderQuests();
    } else if (page === 'skills') {
        skillSystem.renderSkillTree();
    } else if (page === 'stats') {
        gameEngine.updateStatsUI();
    }
}

// Initialize application
async function init() {
    try {
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        
        // Initialize database
        console.log('Initializing database...');
        await db.init();
        
        // Initialize game engine
        console.log('Initializing game engine...');
        await gameEngine.init();
        
        // Initialize material rewards system
        console.log('Initializing material rewards system...');
        await materialRewardsSystem.init();
        
        // Initialize report system
        console.log('Initializing report system...');
        await reportSystem.init();
        
        // Initialize AI quest generator first
        console.log('Initializing AI quest generator...');
        await aiQuestGenerator.init();
        
        // Initialize quest system
        console.log('Initializing quest system...');
        await questSystem.init();
        
        // Initialize skill system
        console.log('Initializing skill system...');
        await skillSystem.init();
        
        // Initialize AI assistant
        console.log('Initializing AI assistant...');
        await aiAssistant.init();
        
        // Initialize notification system
        console.log('Initializing notification system...');
        notificationSystem.init();
        
        // Initialize prayer times (optional feature)
        console.log('Initializing prayer times...');
        await prayerTimes.init();
        prayerTimes.renderPrayerTimes();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render initial UI
        gameEngine.updateUI();
        await gameEngine.updateMaterialRewardsUI();
        questSystem.renderActiveQuestsPreview();
        questSystem.renderQuests();
        skillSystem.renderSkillTree();
        
        // Hide loading screen
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
        
        // Show welcome message with Solo Leveling style
        setTimeout(() => {
            const playerData = gameEngine.getPlayerData();
            showNotification('[System] Initialization Complete', 'Welcome back, Hunter. The System is ready. Describe your activities to generate quests.', 'info');
            
            // Show system message
            const aiMessageContent = document.getElementById('ai-message-content');
            if (aiMessageContent) {
                aiMessageContent.textContent = `System active. Current status: Level ${playerData.level}, Rank ${playerData.rank}. Describe your activities, tasks, or goals to generate real-time quests, Hunter.`;
            }
        }, 1000);
        
        console.log('Application initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Error initializing application. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });
    
    // AI Quest Generation button
    const generateQuestBtn = document.getElementById('btn-generate-quest-ai');
    const questInputText = document.getElementById('quest-input-text');
    
    if (generateQuestBtn) {
        generateQuestBtn.addEventListener('click', async () => {
            const input = questInputText ? questInputText.value.trim() : '';
            if (!input) {
                showNotification('Input Required', 'Please describe your activity or goal to generate a quest.', 'info');
                return;
            }
            
            try {
                await questSystem.generateQuestFromInput(input);
                if (questInputText) {
                    questInputText.value = '';
                }
            } catch (error) {
                showNotification('Error', error.message || 'Failed to generate quest. Please try again.', 'info');
            }
        });
    }
    
    // Quest input Enter key
    if (questInputText) {
        questInputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateQuestBtn.click();
            }
        });
    }
    
    // Quest voice input button
    const questVoiceBtn = document.getElementById('btn-quest-voice-input');
    if (questVoiceBtn && questSystem.questVoiceRecognition) {
        questVoiceBtn.addEventListener('click', () => {
            if (questSystem.questVoiceRecognition) {
                if (questSystem.questVoiceRecognition.running) {
                    questSystem.questVoiceRecognition.stop();
                    questVoiceBtn.textContent = '🎤 Voice';
                } else {
                    questSystem.questVoiceRecognition.start();
                    questVoiceBtn.textContent = '🎤 Listening...';
                }
            } else {
                showNotification('Voice Not Available', 'Voice recognition is not supported in your browser.', 'info');
            }
        });
    }
    
    // Use skill points button
    const useSkillPointsBtn = document.getElementById('btn-use-skill-points');
    if (useSkillPointsBtn) {
        useSkillPointsBtn.addEventListener('click', () => {
            navigateTo('skills');
        });
    }
    
    // AI Assistant input
    const assistantInput = document.getElementById('assistant-input');
    const sendMessageBtn = document.getElementById('btn-send-message');
    
    if (assistantInput) {
        assistantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Voice toggle button
    const voiceToggleBtn = document.getElementById('btn-voice-toggle');
    if (voiceToggleBtn) {
        voiceToggleBtn.addEventListener('click', () => {
            aiAssistant.toggleVoice();
        });
    }
    
    // Modal close
    const questModal = document.getElementById('quest-modal');
    const modalClose = document.querySelector('.modal-close');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (questModal) {
                questModal.classList.remove('active');
            }
        });
    }
    
    // Close modal on outside click
    if (questModal) {
        questModal.addEventListener('click', (e) => {
            if (e.target === questModal) {
                questModal.classList.remove('active');
            }
        });
    }
    
    // Game engine event listeners
    gameEngine.on('levelUp', (data) => {
        notificationSystem.showLevelUp(data.newLevel, data.skillPointsGained);
        gameEngine.updateUI();
    });
    
    gameEngine.on('xpGain', (data) => {
        notificationSystem.showXPGain(data.amount);
    });
    
    gameEngine.on('rankChange', (data) => {
        notificationSystem.showRankChange(data.oldRank, data.newRank);
        gameEngine.updateUI();
    });
    
    // Online/offline status
    window.addEventListener('online', () => {
        showNotification('Connection Restored', 'You are back online. Syncing data...', 'info');
        // Sync data here if needed
    });
    
    window.addEventListener('offline', () => {
        showNotification('Offline Mode', 'You are offline. Core features remain available.', 'info');
    });
    
    // Prevent default touch behaviors for better mobile experience
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.assistant-messages')) {
            // Allow scrolling in messages
            return;
        }
    }, { passive: true });
}

// Send message function
function sendMessage() {
    const input = document.getElementById('assistant-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    aiAssistant.handleInput(message);
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose navigateTo globally
window.navigateTo = navigateTo;

