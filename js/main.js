/**
 * Main Application - Initialization and event handling
 */

// Navigation function
async function navigateTo(page) {
    try {
        console.log(`Navigating to: ${page}`);
        
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        console.log(`Found ${allPages.length} pages`);
        allPages.forEach(p => {
            p.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`Successfully navigated to: ${page}`);
        } else {
            console.error(`Page "${page}" not found! Looking for: page-${page}`);
            // Show dashboard as fallback
            const dashboard = document.getElementById('page-dashboard');
            if (dashboard) {
                dashboard.classList.add('active');
            }
            return;
        }
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
        
        // Refresh page content if needed
        if (page === 'quests') {
            if (typeof questSystem !== 'undefined') {
                questSystem.renderQuests();
            }
        } else if (page === 'achievements') {
            renderAchievementsPage();
        } else if (page === 'assistant') {
            // Refresh AI journal entries when navigating to assistant page
            if (typeof aiJournalSystem !== 'undefined') {
                aiJournalSystem.renderJournalEntries();
            }
            if (typeof journalSearch !== 'undefined') {
                journalSearch.applyFilters();
            }
            // Load active quests for reporting
            if (typeof updateQuestReportDropdown === 'function') {
                updateQuestReportDropdown();
            } else if (typeof reportSystem !== 'undefined' && typeof reportSystem.updateQuestDropdown === 'function') {
                reportSystem.updateQuestDropdown();
            }
        } else if (page === 'skills') {
            // Refresh skill tree and all skill-related features
            if (typeof skillSystem !== 'undefined') {
                skillSystem.renderSkillTree();
            }
            if (typeof activeSkills !== 'undefined') {
                activeSkills.renderSkills();
            }
            if (typeof passiveSkills !== 'undefined') {
                passiveSkills.renderPassiveSkills();
            }
            if (typeof realWorldCrafting !== 'undefined') {
                realWorldCrafting.renderCrafting();
            }
            if (typeof instantDungeons !== 'undefined') {
                instantDungeons.renderDungeons();
            }
            if (typeof statAllocation !== 'undefined') {
                statAllocation.renderStatAllocationUI();
            }
        } else if (page === 'stats') {
            // Refresh analytics and charts
            if (typeof gameEngine !== 'undefined') {
                gameEngine.updateStatsUI();
            }
            if (typeof statisticsDashboard !== 'undefined') {
                statisticsDashboard.renderDashboard();
            }
            if (typeof questAnalytics !== 'undefined') {
                await questAnalytics.calculateAnalytics();
                questAnalytics.renderDashboard('quest-analytics-dashboard');
            }
            if (typeof progressCharts !== 'undefined') {
                await progressCharts.loadChartData();
                progressCharts.renderXPChart('xp-chart-container');
                progressCharts.renderQuestChart('quest-chart-container');
            }
            if (typeof statAllocation !== 'undefined') {
                statAllocation.renderStatAllocationUI();
            }
        } else if (page === 'shop') {
            // Refresh shop
            if (typeof realWorldShop !== 'undefined') {
                realWorldShop.renderShop();
            }
        } else if (page === 'inventory') {
            // Render detailed inventory
            if (typeof detailedInventory !== 'undefined') {
                detailedInventory.renderDetailedInventory();
            }
        } else if (page === 'history') {
            // Render enhanced history
            if (typeof enhancedHistory !== 'undefined') {
                enhancedHistory.renderHistory();
            }
        } else if (page === 'settings') {
            // Render settings page content
            renderSettingsPage();
        }
    } catch (error) {
        console.error(`Error navigating to ${page}:`, error);
    }
}

// Render settings page
function renderSettingsPage() {
    // Render knowledge library
    if (typeof knowledgeReader !== 'undefined') {
        knowledgeReader.renderSourceLibrary();
    }

    // Render shadow monarch status
    renderShadowMonarchStatus();

    // Render loot boxes
    renderLootBoxes();

    // Setup export/import buttons
    setupDataManagement();
}

function renderShadowMonarchStatus() {
    const container = document.getElementById('shadow-monarch-status');
    if (!container) return;

    const playerData = gameEngine.getPlayerData();
    const rank = playerData.rank;
    
    if (typeof shadowMonarch !== 'undefined') {
        const stage = shadowMonarch.getEvolutionStage(rank);
        const bonus = shadowMonarch.getClassBonus(rank);

        container.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${stage.special ? '👹' : '⚔️'}</div>
                <div style="font-size: 1.25rem; font-weight: bold; color: var(--neon-blue); margin-bottom: 0.5rem;">
                    ${stage.name}
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Class: ${stage.class}
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-top: 1rem;">
                    <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">XP Multiplier</div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: var(--neon-blue);">
                            ${bonus.xpMultiplier.toFixed(1)}x
                        </div>
                    </div>
                    <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Stat Multiplier</div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: var(--neon-blue);">
                            ${bonus.statMultiplier.toFixed(1)}x
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderLootBoxes() {
    const container = document.getElementById('loot-boxes-container');
    if (!container) return;

    if (typeof lootBoxSystem === 'undefined') {
        container.innerHTML = '<p class="empty-state">Loot box system not available</p>';
        return;
    }

    const lootBoxes = lootBoxSystem.lootBoxes || [];
    
    if (lootBoxes.length === 0) {
        container.innerHTML = '<p class="empty-state">No loot boxes available</p>';
        return;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">';
    
    lootBoxes.forEach(box => {
        const rarityClass = box.rarity || 'common';
        html += `
            <div class="glass-panel" style="padding: 1.5rem; text-align: center; cursor: pointer;" onclick="lootBoxSystem.openLootBox('${box.rarity}')">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${box.icon || '📦'}</div>
                <div style="font-weight: bold; margin-bottom: 0.25rem; color: var(--text-primary);">${box.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${rarityClass.charAt(0).toUpperCase() + rarityClass.slice(1)}</div>
                <button class="btn-primary" style="width: 100%;">Open Loot Box</button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function setupDataManagement() {
    // Export button
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn && typeof dataExport !== 'undefined') {
        exportBtn.addEventListener('click', async () => {
            await dataExport.exportToFile();
        });
    }

    // Import button
    const importInput = document.getElementById('import-file-input');
    if (importInput && typeof dataExport !== 'undefined') {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const confirmed = confirm('This will replace all your current data. Are you sure?');
                if (confirmed) {
                    await dataExport.importFromFile(file);
                    // Reload page to show updated data
                    location.reload();
                }
            }
        });
    }
}

// Render achievements page
function renderAchievementsPage() {
    // Render streak
    if (typeof streakSystem !== 'undefined') {
        const currentStreakEl = document.getElementById('current-streak');
        const longestStreakEl = document.getElementById('longest-streak');
        if (currentStreakEl) {
            currentStreakEl.textContent = `${streakSystem.getCurrentStreak()} days 🔥`;
        }
        if (longestStreakEl) {
            longestStreakEl.textContent = `${streakSystem.getLongestStreak()} days`;
        }
    }

    // Render challenges
    if (typeof dailyChallenges !== 'undefined') {
        const dailyList = document.getElementById('daily-challenges-list');
        if (dailyList) {
            const challenges = dailyChallenges.getDailyChallenges();
            dailyList.innerHTML = challenges.map(c => `
                <div class="challenge-item ${c.completed ? 'completed' : ''}">
                    <div class="challenge-title">${c.title}</div>
                    <div class="challenge-description">${c.description}</div>
                    <div class="challenge-progress">${c.progress}/${c.requirement.count}</div>
                    <div class="challenge-reward">Reward: +${c.reward.xp} XP</div>
                </div>
            `).join('');
        }

        const weeklyList = document.getElementById('weekly-challenges-list');
        if (weeklyList) {
            const challenges = dailyChallenges.getWeeklyChallenges();
            weeklyList.innerHTML = challenges.map(c => `
                <div class="challenge-item ${c.completed ? 'completed' : ''}">
                    <div class="challenge-title">${c.title}</div>
                    <div class="challenge-description">${c.description}</div>
                    <div class="challenge-progress">${c.progress}/${c.requirement.count}</div>
                    <div class="challenge-reward">Reward: +${c.reward.xp} XP</div>
                </div>
            `).join('');
        }
    }

    // Render achievements
    if (typeof achievementSystem !== 'undefined') {
        const unlockedEl = document.getElementById('achievements-unlocked');
        const lockedEl = document.getElementById('achievements-locked');
        
        if (unlockedEl) {
            const unlocked = achievementSystem.getUnlockedAchievements();
            unlockedEl.innerHTML = unlocked.map(a => `
                <div class="achievement-item unlocked">
                    <span class="achievement-icon">${a.icon}</span>
                    <div class="achievement-info">
                        <div class="achievement-name">${a.name}</div>
                        <div class="achievement-description">${a.description}</div>
                    </div>
                </div>
            `).join('');
        }

        if (lockedEl) {
            const locked = achievementSystem.getLockedAchievements();
            lockedEl.innerHTML = locked.map(a => {
                const progress = achievementSystem.getAchievementProgress(a.id);
                return `
                    <div class="achievement-item locked">
                        <span class="achievement-icon">🔒</span>
                        <div class="achievement-info">
                            <div class="achievement-name">${a.name}</div>
                            <div class="achievement-description">${a.description}</div>
                            <div class="achievement-progress">${Math.floor(progress.progress)}%</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Initialize application
async function init() {
    const loadingScreen = document.getElementById('loading-screen');
    const hideLoadingScreen = () => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.pointerEvents = 'none';
            loadingScreen.classList.add('hidden');
        }
    };

    try {
        // Check for early script loading errors
        if (window.earlyErrors && window.earlyErrors.length > 0) {
            console.warn('[INIT] Early script loading errors detected:', window.earlyErrors);
        }
        
        // Check for critical dependencies
        const missingModules = [];
        const criticalChecks = [
            { name: 'db', file: 'database.js' },
            { name: 'gameEngine', file: 'gameEngine.js' },
            { name: 'questSystem', file: 'questSystem.js' },
            { name: 'skillSystem', file: 'skillSystem.js' }
        ];
        
        criticalChecks.forEach(check => {
            if (typeof window[check.name] === 'undefined') {
                missingModules.push(`${check.name} (${check.file})`);
            }
        });
        
        // Optional but recommended modules
        const optionalChecks = [
            { name: 'dataCollection', file: 'dataCollection.js' },
            { name: 'materialRewardsSystem', file: 'materialRewards.js' },
            { name: 'reportSystem', file: 'reportSystem.js' },
            { name: 'aiQuestGenerator', file: 'aiQuestGenerator.js' },
            { name: 'backgroundQuestGenerator', file: 'backgroundQuestGenerator.js' },
            { name: 'aiAssistant', file: 'aiAssistant.js' },
            { name: 'notificationSystem', file: 'notifications.js' },
            { name: 'prayerTimes', file: 'prayerTimes.js' }
        ];
        
        optionalChecks.forEach(check => {
            if (typeof window[check.name] === 'undefined') {
                console.warn(`[INIT] Optional module ${check.name} (${check.file}) not loaded`);
            }
        });
        
        if (missingModules.length > 0) {
            const errorMsg = `CRITICAL ERROR: Required modules not loaded:\n\n${missingModules.join('\n')}\n\nPossible causes:\n1. Script files failed to load (check browser Network/Console tabs)\n2. JavaScript syntax errors in script files\n3. File path/permission issues (common on mobile/webview)\n4. CORS or security restrictions\n\nPlease check:\n- Browser console for errors\n- Network tab for failed script loads\n- That all js/*.js files exist and are accessible`;
            console.error('[INIT] Missing critical modules:', missingModules);
            console.error('[INIT] Available window properties:', Object.keys(window).filter(k => k.startsWith('db') || k.startsWith('game') || k.startsWith('quest') || k.startsWith('skill')));
            throw new Error(errorMsg);
        }
        
        console.log('[INIT] All critical modules loaded successfully');

        // Show loading screen
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            loadingScreen.style.visibility = 'visible';
        }
        
        // Initialize database
        console.log('Initializing database...');
        try {
            await db.init();
        } catch (error) {
            console.error('Error initializing database:', error);
            throw new Error(`Database initialization failed: ${error.message}`);
        }
        
        // Initialize knowledge engine (must be before quest generators)
        console.log('Initializing knowledge engine...');
        try {
            if (typeof knowledgeEngine !== 'undefined') {
                await knowledgeEngine.init();
                
                // Initialize knowledge sync
                if (typeof knowledgeSync !== 'undefined') {
                    await knowledgeSync.init();
                }
                
                // Cache sources for offline use
                await knowledgeEngine.cacheSources();
                
                // Verify coverage
                const coverage = knowledgeEngine.getCoverageReport();
                console.log('[Knowledge Engine] Coverage:', coverage);
                console.log(`[Knowledge Engine] Total sources: ${knowledgeEngine.sources.length}`);
            }
        } catch (error) {
            console.error('Error initializing knowledge engine:', error);
            // Continue - knowledge engine is not critical for basic functionality
        }
        
        // Initialize game engine
        console.log('Initializing game engine...');
        try {
            await gameEngine.init();
        } catch (error) {
            console.error('Error initializing game engine:', error);
            throw new Error(`Game engine initialization failed: ${error.message}`);
        }
        
        // Initialize data collection system first
        console.log('Initializing data collection system...');
        try {
            await dataCollection.init();
        } catch (error) {
            console.error('Error initializing data collection:', error);
            // Continue - not critical
        }
        
        // Initialize material rewards system
        console.log('Initializing material rewards system...');
        try {
            await materialRewardsSystem.init();
        } catch (error) {
            console.error('Error initializing material rewards:', error);
            // Continue - not critical
        }
        
        // Initialize report system
        console.log('Initializing report system...');
        try {
            await reportSystem.init();
        } catch (error) {
            console.error('Error initializing report system:', error);
            // Continue - not critical
        }
        
        // Initialize AI quest generator
        console.log('Initializing AI quest generator...');
        try {
            await aiQuestGenerator.init();
        } catch (error) {
            console.error('Error initializing AI quest generator:', error);
            // Continue - not critical
        }
        
        // Initialize quest system
        console.log('Initializing quest system...');
        try {
            await questSystem.init();
        } catch (error) {
            console.error('Error initializing quest system:', error);
            throw new Error(`Quest system initialization failed: ${error.message}`);
        }
        
        // Initialize background quest generator
        console.log('Initializing background quest generator...');
        try {
            await backgroundQuestGenerator.init();
        } catch (error) {
            console.error('Error initializing background quest generator:', error);
            // Continue - not critical
        }
        
        // Initialize skill system
        console.log('Initializing skill system...');
        try {
            await skillSystem.init();
        } catch (error) {
            console.error('Error initializing skill system:', error);
            throw new Error(`Skill system initialization failed: ${error.message}`);
        }
        
        // Initialize AI assistant
        console.log('Initializing AI assistant...');
        try {
            await aiAssistant.init();
        } catch (error) {
            console.error('Error initializing AI assistant:', error);
            // Continue - not critical
        }
        
        // Initialize notification system
        console.log('Initializing notification system...');
        try {
            notificationSystem.init();
        } catch (error) {
            console.error('Error initializing notification system:', error);
            // Continue - not critical
        }
        
        // Initialize prayer times (optional feature)
        console.log('Initializing prayer times...');
        try {
            await prayerTimes.init();
            prayerTimes.renderPrayerTimes();
        } catch (error) {
            console.error('Error initializing prayer times:', error);
            // Continue - optional feature
        }
        
        // Initialize new systems (all optional - wrap in try-catch)
        console.log('Initializing achievement system...');
        try {
            if (typeof achievementSystem !== 'undefined') {
                await achievementSystem.init();
            }
        } catch (error) {
            console.error('Error initializing achievement system:', error);
        }
        
        console.log('Initializing streak system...');
        try {
            if (typeof streakSystem !== 'undefined') {
                await streakSystem.init();
            }
        } catch (error) {
            console.error('Error initializing streak system:', error);
        }
        
        console.log('Initializing statistics dashboard...');
        try {
            if (typeof statisticsDashboard !== 'undefined') {
                await statisticsDashboard.init();
            }
        } catch (error) {
            console.error('Error initializing statistics dashboard:', error);
        }
        
        console.log('Initializing avatar evolution...');
        try {
            if (typeof avatarEvolution !== 'undefined') {
                avatarEvolution.updateAvatar();
            }
        } catch (error) {
            console.error('Error initializing avatar evolution:', error);
        }
        
        console.log('Initializing quest chains...');
        try {
            if (typeof questChains !== 'undefined') {
                await questChains.init();
            }
        } catch (error) {
            console.error('Error initializing quest chains:', error);
        }
        
        console.log('Initializing daily challenges...');
        try {
            if (typeof dailyChallenges !== 'undefined') {
                await dailyChallenges.init();
            }
        } catch (error) {
            console.error('Error initializing daily challenges:', error);
        }
        
        console.log('Initializing enhanced history...');
        try {
            if (typeof enhancedHistory !== 'undefined') {
                await enhancedHistory.init();
            }
        } catch (error) {
            console.error('Error initializing enhanced history:', error);
        }
        
        console.log('Initializing audio system...');
        try {
            if (typeof audioSystem !== 'undefined') {
                audioSystem.init();
            }
        } catch (error) {
            console.error('Error initializing audio system:', error);
        }
        
        console.log('Initializing shadow monarch system...');
        try {
            if (typeof shadowMonarch !== 'undefined') {
                await shadowMonarch.checkEvolution();
            }
        } catch (error) {
            console.error('Error initializing shadow monarch:', error);
        }
        
        console.log('Initializing skill synergies...');
        try {
            if (typeof skillSynergies !== 'undefined') {
                skillSynergies.checkNewSynergy();
            }
        } catch (error) {
            console.error('Error initializing skill synergies:', error);
        }
        
        // Initialize AI Journal System
        console.log('Initializing AI journal system...');
        try {
            if (typeof aiJournalSystem !== 'undefined') {
                await aiJournalSystem.init();
            }
        } catch (error) {
            console.error('Error initializing AI journal system:', error);
        }
        
        // Initialize Pending Quest Delivery System
        console.log('Initializing pending quest delivery system...');
        try {
            if (typeof pendingQuestDelivery !== 'undefined') {
                await pendingQuestDelivery.init();
            }
        } catch (error) {
            console.error('Error initializing pending quest delivery:', error);
        }
        
        // Initialize Journal Search
        console.log('Initializing journal search system...');
        try {
            if (typeof journalSearch !== 'undefined') {
                journalSearch.init();
            }
        } catch (error) {
            console.error('Error initializing journal search:', error);
        }
        
        // Initialize Quest Analytics
        console.log('Initializing quest analytics...');
        try {
            if (typeof questAnalytics !== 'undefined') {
                await questAnalytics.init();
            }
        } catch (error) {
            console.error('Error initializing quest analytics:', error);
        }
        
        // Initialize Daily Reflection Prompts
        console.log('Initializing daily reflection prompts...');
        try {
            if (typeof dailyReflectionPrompts !== 'undefined') {
                await dailyReflectionPrompts.init();
            }
        } catch (error) {
            console.error('Error initializing daily reflection prompts:', error);
        }
        
        // Initialize Progress Charts
        console.log('Initializing progress charts...');
        try {
            if (typeof progressCharts !== 'undefined') {
                await progressCharts.init();
            }
        } catch (error) {
            console.error('Error initializing progress charts:', error);
        }
        
        // Initialize Smart Reminders
        console.log('Initializing smart reminders...');
        try {
            if (typeof smartReminders !== 'undefined') {
                await smartReminders.init();
            }
        } catch (error) {
            console.error('Error initializing smart reminders:', error);
        }
        
        // Initialize Quest Difficulty Adjustment
        console.log('Initializing quest difficulty adjustment...');
        try {
            if (typeof questDifficultyAdjustment !== 'undefined') {
                await questDifficultyAdjustment.init();
            }
        } catch (error) {
            console.error('Error initializing quest difficulty adjustment:', error);
        }
        
        // Initialize Journal Achievements
        console.log('Initializing journal achievements...');
        try {
            if (typeof journalAchievements !== 'undefined') {
                await journalAchievements.init();
            }
        } catch (error) {
            console.error('Error initializing journal achievements:', error);
        }
        
        // Initialize Solo Leveling UI
        console.log('Initializing Solo Leveling UI enhancements...');
        try {
            if (typeof soloLevelingUI !== 'undefined') {
                soloLevelingUI.init();
            }
        } catch (error) {
            console.error('Error initializing Solo Leveling UI:', error);
        }
        
        // Initialize Real-World Features
        console.log('Initializing energy system...');
        try {
            if (typeof energySystem !== 'undefined') {
                await energySystem.init();
            }
        } catch (error) {
            console.error('Error initializing energy system:', error);
        }
        
        console.log('Initializing active skills...');
        try {
            if (typeof activeSkills !== 'undefined') {
                await activeSkills.init();
            }
        } catch (error) {
            console.error('Error initializing active skills:', error);
        }
        
        console.log('Initializing real-world shop...');
        try {
            if (typeof realWorldShop !== 'undefined') {
                await realWorldShop.init();
            }
        } catch (error) {
            console.error('Error initializing real-world shop:', error);
        }
        
        console.log('Initializing crafting system...');
        try {
            if (typeof realWorldCrafting !== 'undefined') {
                await realWorldCrafting.init();
            }
        } catch (error) {
            console.error('Error initializing crafting system:', error);
        }
        
        console.log('Initializing purchase reporting...');
        try {
            if (typeof purchaseReporting !== 'undefined') {
                await purchaseReporting.init();
            }
        } catch (error) {
            console.error('Error initializing purchase reporting:', error);
        }
        
        // Initialize Solo Leveling Missing Features
        console.log('Initializing stat allocation system...');
        try {
            if (typeof statAllocation !== 'undefined') {
                await statAllocation.init();
            }
        } catch (error) {
            console.error('Error initializing stat allocation:', error);
        }
        
        console.log('Initializing penalty quest system...');
        try {
            if (typeof penaltyQuestSystem !== 'undefined') {
                await penaltyQuestSystem.init();
            }
        } catch (error) {
            console.error('Error initializing penalty quest system:', error);
        }
        
        console.log('Initializing threat detection...');
        try {
            if (typeof threatDetection !== 'undefined') {
                await threatDetection.init();
            }
        } catch (error) {
            console.error('Error initializing threat detection:', error);
        }
        
        console.log('Initializing skill books...');
        try {
            if (typeof skillBooks !== 'undefined') {
                await skillBooks.init();
            }
        } catch (error) {
            console.error('Error initializing skill books:', error);
        }
        
        console.log('Initializing passive skills...');
        try {
            if (typeof passiveSkills !== 'undefined') {
                await passiveSkills.init();
            }
        } catch (error) {
            console.error('Error initializing passive skills:', error);
        }
        
        console.log('Initializing instant dungeons...');
        try {
            if (typeof instantDungeons !== 'undefined') {
                await instantDungeons.init();
            }
        } catch (error) {
            console.error('Error initializing instant dungeons:', error);
        }
        
        console.log('Initializing emergency quests...');
        try {
            if (typeof emergencyQuests !== 'undefined') {
                await emergencyQuests.init();
            }
        } catch (error) {
            console.error('Error initializing emergency quests:', error);
        }
        
        // Setup event listeners
        try {
            setupEventListeners();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw new Error(`Event listeners setup failed: ${error.message}`);
        }
        
        // Render initial UI
        try {
            gameEngine.updateUI();
            await gameEngine.updateMaterialRewardsUI();
            questSystem.renderActiveQuestsPreview();
            questSystem.renderQuests();
            skillSystem.renderSkillTree();
        } catch (error) {
            console.error('Error rendering initial UI:', error);
            // Continue - UI will update on next interaction
        }
        
        // Hide after initialization completes
        setTimeout(hideLoadingScreen, 1000);
        
        // Safety timeout - always hide after 10 seconds max (mobile fallback)
        setTimeout(hideLoadingScreen, 10000);
        
        // Show welcome message with Solo Leveling style
        setTimeout(() => {
            try {
                if (typeof gameEngine !== 'undefined' && gameEngine) {
                    const playerData = gameEngine.getPlayerData();
                    if (playerData) {
                        if (typeof showNotification !== 'undefined') {
                            showNotification('[System] Initialization Complete', 'Welcome back, Hunter. The System is ready. Describe your activities to generate quests.', 'info');
                        }
                        
                        // Show system message
                        const aiMessageContent = document.getElementById('ai-message-content');
                        if (aiMessageContent) {
                            aiMessageContent.textContent = `System active. Current status: Level ${playerData.level}, Rank ${playerData.rank}. The System will automatically generate quests based on your activities. You can also manually request quests or chat with me about your day, Hunter.`;
                        }
                    }
                }
            } catch (error) {
                console.error('Error showing welcome message:', error);
                // Don't throw - this is non-critical
            }
        }, 1000);
        
        console.log('Application initialized successfully!');
        window.appInitialized = true;
        console.log('[INIT] ✓ Application is ready. All systems operational.');
        
    } catch (error) {
        window.appInitialized = false;
        console.error('Error initializing application:', error);
        console.error('Error stack:', error.stack);
        
        // Hide loading screen on error
        hideLoadingScreen();
        
        // Show detailed error message with diagnostic info
        const diagnosticInfo = [];
        diagnosticInfo.push(`Error: ${error.message || error}`);
        if (error.stack) {
            diagnosticInfo.push(`\nStack: ${error.stack.substring(0, 500)}`);
        }
        if (window.earlyErrors && window.earlyErrors.length > 0) {
            diagnosticInfo.push(`\n\nEarly Errors: ${JSON.stringify(window.earlyErrors)}`);
        }
        diagnosticInfo.push(`\n\nBrowser: ${navigator.userAgent}`);
        diagnosticInfo.push(`IndexedDB: ${window.indexedDB ? 'Available' : 'NOT AVAILABLE'}`);
        diagnosticInfo.push(`ServiceWorker: ${'serviceWorker' in navigator ? 'Available' : 'NOT AVAILABLE'}`);
        
        const errorMessage = `INITIALIZATION ERROR\n\n${diagnosticInfo.join('\n')}\n\nTROUBLESHOOTING:\n1. Open browser console (F12) and check for errors\n2. Check Network tab for failed script loads\n3. Try clearing browser cache\n4. If on mobile/webview, check file permissions\n5. Ensure you're accessing via http:// or https:// (not file://)`;
        
        console.error('[INIT] Full error details:', {
            message: error.message,
            stack: error.stack,
            earlyErrors: window.earlyErrors,
            userAgent: navigator.userAgent,
            indexedDBAvailable: !!window.indexedDB
        });
        
        alert(errorMessage);
        
        // Also try to show error in UI if possible
        try {
            const aiMessageContent = document.getElementById('ai-message-content');
            if (aiMessageContent) {
                aiMessageContent.textContent = `System Error: ${error.message}. Please refresh the page.`;
                aiMessageContent.style.color = '#ef4444';
            }
        } catch (uiError) {
            console.error('Could not display error in UI:', uiError);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log(`Found ${navButtons.length} navigation buttons`);
    
    navButtons.forEach((btn, index) => {
        const page = btn.dataset.page;
        console.log(`Setting up nav button ${index}: ${page}`);
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetPage = btn.dataset.page;
            console.log(`Navigation button clicked: ${targetPage}`);
            if (targetPage) {
                navigateTo(targetPage);
            } else {
                console.warn('Navigation button has no data-page attribute');
            }
        });
    });

    // More menu button
    const moreMenuBtn = document.getElementById('more-menu-btn');
    const moreMenu = document.getElementById('more-menu');
    const moreMenuClose = document.getElementById('more-menu-close');
    const moreMenuOverlay = document.getElementById('more-menu-overlay');
    
    if (moreMenuBtn && moreMenu) {
        moreMenuBtn.addEventListener('click', () => {
            moreMenu.style.display = 'block';
            setTimeout(() => {
                moreMenu.classList.add('active');
            }, 10);
        });
    }

    if (moreMenuClose && moreMenu) {
        moreMenuClose.addEventListener('click', closeMoreMenu);
    }

    if (moreMenuOverlay && moreMenu) {
        moreMenuOverlay.addEventListener('click', closeMoreMenu);
    }

    // More menu items
    document.querySelectorAll('.more-menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page) {
                closeMoreMenu();
                navigateTo(page);
            }
        });
    });

    // Use skill points button
    const useSkillPointsBtn = document.getElementById('btn-use-skill-points');
    if (useSkillPointsBtn) {
        useSkillPointsBtn.addEventListener('click', () => {
            navigateTo('skills');
        });
    }
    
    // AI Journal System - Save entry button
    const saveJournalBtn = document.getElementById('btn-save-journal-entry');
    const journalInput = document.getElementById('ai-journal-input');
    
    if (saveJournalBtn && typeof aiJournalSystem !== 'undefined') {
        saveJournalBtn.addEventListener('click', async () => {
            const text = journalInput ? journalInput.value.trim() : '';
            if (text) {
                await aiJournalSystem.saveJournalEntry(text);
            }
        });
    }
    
    // AI Journal System - Enter key
    if (journalInput) {
        journalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (saveJournalBtn) {
                    saveJournalBtn.click();
                }
            }
        });
    }
    
    // AI Journal System - Voice input (online only)
    const voiceRecordBtn = document.getElementById('btn-ai-voice-record');
    if (voiceRecordBtn && typeof aiJournalSystem !== 'undefined') {
        voiceRecordBtn.addEventListener('click', () => {
            if (!aiJournalSystem.isOnline) {
                showNotification('Voice Unavailable', 'Voice input is only available when online.', 'info');
                return;
            }
            
            if (aiJournalSystem.voiceRecognition) {
                if (aiJournalSystem.voiceRecognition.running) {
                    aiJournalSystem.voiceRecognition.stop();
                    aiJournalSystem.updateVoiceButton(false);
                } else {
                    aiJournalSystem.voiceRecognition.start();
                    aiJournalSystem.updateVoiceButton(true);
                }
            } else {
                showNotification('Voice Not Available', 'Voice recognition is not supported in your browser.', 'info');
            }
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
    if (typeof gameEngine !== 'undefined') {
        gameEngine.on('levelUp', (data) => {
            if (typeof notificationSystem !== 'undefined') {
                notificationSystem.showLevelUp(data.newLevel, data.skillPointsGained);
            }
            gameEngine.updateUI();
        });
        
        gameEngine.on('xpGain', (data) => {
            if (typeof notificationSystem !== 'undefined') {
                notificationSystem.showXPGain(data.amount);
            }
        });
        
        gameEngine.on('rankChange', (data) => {
            if (typeof notificationSystem !== 'undefined') {
                notificationSystem.showRankChange(data.oldRank, data.newRank);
            }
            gameEngine.updateUI();
        });
    }
    
    // Online/offline status
    window.addEventListener('online', () => {
        if (typeof showNotification !== 'undefined') {
            showNotification('Connection Restored', 'You are back online. Syncing data...', 'info');
        }
        // Sync data here if needed
    });
    
    window.addEventListener('offline', () => {
        if (typeof showNotification !== 'undefined') {
            showNotification('Offline Mode', 'You are offline. Core features remain available.', 'info');
        }
    });
    
    // Prevent default touch behaviors for better mobile experience
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.assistant-messages')) {
            // Allow scrolling in messages
            return;
        }
    }, { passive: true });
}

function closeMoreMenu() {
    const moreMenu = document.getElementById('more-menu');
    if (moreMenu) {
        moreMenu.classList.remove('active');
        setTimeout(() => {
            moreMenu.style.display = 'none';
        }, 300);
    }
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

// Function to update quest report dropdown
async function updateQuestReportDropdown() {
    const select = document.getElementById('quest-select-for-report');
    if (!select) return;
    
    try {
        const activeQuests = await db.getActiveQuests();
        select.innerHTML = '<option value="">Select a quest to report...</option>';
        
        activeQuests.forEach(quest => {
            const option = document.createElement('option');
            option.value = quest.id;
            option.textContent = quest.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading quests for dropdown:', error);
    }
}

// Global error handlers to catch any unhandled errors
window.addEventListener('error', (event) => {
    // Ignore resource loading errors (like 404s for images, fonts, etc.)
    if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'LINK' || event.target.tagName === 'SCRIPT')) {
        console.warn('Resource loading error (non-critical):', event.target.src || event.target.href);
        return; // Don't show alerts for resource loading errors
    }
    
    // Ignore errors from browser extensions
    if (event.filename && (
        event.filename.includes('extension://') || 
        event.filename.includes('moz-extension://') || 
        event.filename.includes('chrome-extension://') ||
        event.filename.includes('safari-extension://')
    )) {
        console.warn('Extension error (ignored):', event.message);
        return;
    }
    
    console.error('Global error caught:', {
        message: event.message || event.error?.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
    });
    
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // Only show alert if init hasn't run yet OR if it's a critical error
    // Don't show alerts for minor errors after successful initialization
    if (typeof window.appInitialized === 'undefined' || window.appInitialized === false) {
        const errorMsg = `Script Error: ${event.message || event.error?.message || 'Unknown error'}\n\nFile: ${event.filename}\nLine: ${event.lineno}\n\nPlease check the browser console for more details.`;
        console.error('[CRITICAL]', errorMsg);
        // Only alert if it's a critical initialization error
        if (!window.appInitialized) {
            alert(errorMsg);
        }
    } else {
        console.warn('[NON-CRITICAL] Error after initialization (logged but not shown to user):', event.message || event.error?.message);
    }
}, true);

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', {
        reason: event.reason,
        message: event.reason?.message,
        stack: event.reason?.stack
    });
    
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !window.appInitialized) {
        loadingScreen.style.display = 'none';
    }
    
    // Only show alert if init hasn't run yet
    if (typeof window.appInitialized === 'undefined' || window.appInitialized === false) {
        const errorMsg = `Unhandled Error: ${event.reason?.message || event.reason || 'Unknown error'}\n\nPlease check the browser console for more details.`;
        console.error('[CRITICAL]', errorMsg);
        if (!window.appInitialized) {
            alert(errorMsg);
        }
    } else {
        console.warn('[NON-CRITICAL] Unhandled rejection after initialization (logged but not shown to user):', event.reason?.message || event.reason);
    }
});

// Wrap init call to catch any synchronous errors
function safeInit() {
    try {
        console.log('Starting application initialization...');
        init().then(() => {
            window.appInitialized = true;
            console.log('Application initialization complete');
        }).catch((error) => {
            console.error('Init promise rejected:', error);
            window.appInitialized = false;
        });
    } catch (error) {
        console.error('Synchronous error in init wrapper:', error);
        window.appInitialized = false;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        alert(`Initialization Error: ${error.message || error}\n\nPlease check the browser console for more details.`);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    // DOM already loaded, run immediately
    safeInit();
}

// Expose navigateTo globally
window.navigateTo = navigateTo;

// Expose updateQuestReportDropdown globally
window.updateQuestReportDropdown = updateQuestReportDropdown;

