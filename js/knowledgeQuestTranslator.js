/**
 * Knowledge Quest Translator - Converts knowledge principles into real-world quests
 * Ensures all quests are grounded in authoritative sources
 */

class KnowledgeQuestTranslator {
    constructor() {
        this.translationCache = new Map();
    }

    // Translate knowledge principle/framework to actionable quest
    async translateToQuest(domain, context = {}, knowledgeEngine) {
        const playerData = gameEngine.getPlayerData();
        const level = playerData.level || 1;

        // Get knowledge source for domain
        const principleData = knowledgeEngine.getRandomPrinciple(domain);
        if (!principleData) {
            console.warn(`[Quest Translator] No principles found for domain: ${domain}`);
            return null;
        }

        const { principle, source } = principleData;

        // Get or create exercise from source
        let exercise = null;
        if (source.exercises && source.exercises.length > 0) {
            exercise = utils.randomElement(source.exercises);
        } else {
            // Generate exercise from principle
            exercise = this.generateExerciseFromPrinciple(principle, domain, context);
        }

        // Determine difficulty based on level and principle complexity
        const difficulty = this.calculateDifficulty(level, principle, domain);

        // Calculate rewards based on difficulty and domain
        const rewards = this.calculateRewards(domain, difficulty, level);

        // Generate quest title
        const title = this.generateQuestTitle(domain, principle, source);

        // Generate quest description
        const description = this.generateQuestDescription(principle, exercise, source, context);

        // Create quest object
        const quest = {
            id: utils.generateId(),
            title: title,
            description: description,
            category: this.mapDomainToCategory(domain),
            questType: 'knowledge_backed',
            difficulty: difficulty,
            timeFrame: this.determineTimeFrame(difficulty, context),
            xp: rewards.xp,
            stats: rewards.stats,
            skillPoints: rewards.skillPoints,
            status: 'pending',
            createdAt: Date.now(),
            completedAt: null,
            knowledgeSource: {
                sourceId: source.id,
                sourceTitle: source.title,
                author: source.author,
                domain: domain,
                principle: typeof principle === 'string' ? principle : principle.name,
                principleDescription: typeof principle === 'object' ? principle.description : '',
                exercise: exercise
            },
            sourceAttribution: {
                visible: false, // Hidden by default
                source: source.title,
                author: source.author,
                principle: typeof principle === 'string' ? principle : principle.name
            },
            autoAccepted: false
        };

        return quest;
    }

    // Generate exercise from principle if source doesn't have one
    generateExerciseFromPrinciple(principle, domain, context) {
        const principleName = typeof principle === 'string' ? principle : principle.name;
        const principleDesc = typeof principle === 'object' ? principle.description : '';

        // Domain-specific exercise templates
        const templates = {
            strategy: `Apply the principle "${principleName}" to identify and influence a key leverage point in your current environment. Take one concrete action based on this principle.`,
            medicine: `Apply the principle "${principleName}" in a clinical or medical context. Document how this principle relates to a real situation.`,
            economics: `Apply the principle "${principleName}" to analyze an economic decision or situation. Consider both seen and unseen consequences.`,
            finance: `Apply the principle "${principleName}" to improve your financial situation. Take one specific action based on this principle.`,
            social: `Apply the principle "${principleName}" in a social interaction. Practice this principle in one real conversation or relationship.`,
            psychology: `Apply the principle "${principleName}" to understand or influence behavior. Use this principle to analyze one situation.`,
            leadership: `Apply the principle "${principleName}" in a leadership context. Practice this principle with your team or group.`,
            power: `Apply the principle "${principleName}" to understand power dynamics. Identify and act on one power-related situation.`,
            systems: `Apply the principle "${principleName}" to map or influence a system. Identify feedback loops and leverage points.`,
            learning: `Apply the principle "${principleName}" to learn something new. Use this principle to improve your learning process.`
        };

        return templates[domain] || `Apply the principle "${principleName}" in a real-world context. Take one concrete action based on this principle.`;
    }

    // Calculate quest difficulty
    calculateDifficulty(level, principle, domain) {
        // Base difficulty on level
        let difficulty = 'medium';
        
        if (level < 5) {
            difficulty = 'easy';
        } else if (level >= 15) {
            difficulty = 'hard';
        }

        // Adjust based on principle complexity
        const principleText = typeof principle === 'string' ? principle : (principle.name || '');
        if (principleText.length > 50 || principleText.includes('complex') || principleText.includes('advanced')) {
            if (difficulty === 'easy') difficulty = 'medium';
            else if (difficulty === 'medium') difficulty = 'hard';
        }

        return difficulty;
    }

    // Calculate rewards
    calculateRewards(domain, difficulty, level) {
        const difficultyMultipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.5
        };

        const domainBaseXP = {
            strategy: 100,
            medicine: 90,
            economics: 95,
            finance: 110,
            social: 85,
            psychology: 90,
            leadership: 100,
            power: 95,
            systems: 105,
            learning: 95
        };

        const baseXP = domainBaseXP[domain] || 100;
        const multiplier = difficultyMultipliers[difficulty] || 1.0;
        const levelMultiplier = 1 + (level * 0.1);
        
        const xp = Math.floor(baseXP * multiplier * levelMultiplier);

        // Stat rewards
        const statRewards = knowledgeEngine.getStatRewardsForDomain(domain);
        
        // Apply difficulty multiplier to stats
        const statMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0;
        const finalStats = {};
        for (const [stat, value] of Object.entries(statRewards)) {
            finalStats[stat] = Math.floor(value * statMultiplier);
        }

        // Skill points for harder quests
        const skillPoints = difficulty === 'hard' ? 1 : 0;

        return {
            xp: xp,
            stats: finalStats,
            skillPoints: skillPoints
        };
    }

    // Generate quest title
    generateQuestTitle(domain, principle, source) {
        const domainPrefix = {
            strategy: '[Strategic Quest]',
            medicine: '[Medical Quest]',
            economics: '[Economic Quest]',
            finance: '[Financial Quest]',
            social: '[Social Quest]',
            psychology: '[Psychological Quest]',
            leadership: '[Leadership Quest]',
            power: '[Power Quest]',
            systems: '[Systems Quest]',
            learning: '[Learning Quest]'
        };

        const actionWords = ['Apply', 'Master', 'Conquer', 'Execute', 'Implement', 'Practice'];
        const action = utils.randomElement(actionWords);
        
        const principleName = typeof principle === 'string' ? principle : principle.name;
        const shortPrinciple = principleName.length > 40 ? principleName.substring(0, 37) + '...' : principleName;

        return `${domainPrefix[domain] || '[Quest]'} ${action}: ${shortPrinciple}`;
    }

    // Generate quest description
    generateQuestDescription(principle, exercise, source, context) {
        const principleName = typeof principle === 'string' ? principle : principle.name;
        const principleDesc = typeof principle === 'object' ? principle.description : '';

        let description = `Apply the principle "${principleName}" from ${source.title} by ${source.author}. `;
        
        if (principleDesc) {
            description += `${principleDesc} `;
        }

        description += `\n\n${exercise}`;

        // Add context if available
        if (context.userInput) {
            description += `\n\nContext: ${context.userInput.substring(0, 100)}`;
        }

        return description;
    }

    // Map knowledge domain to quest category
    mapDomainToCategory(domain) {
        const mapping = {
            strategy: 'strategy',
            medicine: 'medical',
            economics: 'financial',
            finance: 'financial',
            social: 'social',
            psychology: 'social',
            leadership: 'social',
            power: 'strategy',
            systems: 'strategy',
            learning: 'medical' // Learning often involves study
        };

        return mapping[domain] || 'strategy';
    }

    // Determine time frame
    determineTimeFrame(difficulty, context) {
        if (context.timeFrame) {
            return context.timeFrame;
        }

        const timeFrames = {
            'easy': 'today',
            'medium': 'week',
            'hard': 'month'
        };

        return timeFrames[difficulty] || 'week';
    }

    // Validate quest is knowledge-backed
    validateQuest(quest) {
        if (!quest.knowledgeSource) {
            return { valid: false, reason: 'Quest missing knowledge source' };
        }

        if (!quest.knowledgeSource.sourceId) {
            return { valid: false, reason: 'Quest missing source ID' };
        }

        if (!quest.knowledgeSource.principle) {
            return { valid: false, reason: 'Quest missing principle' };
        }

        return { valid: true };
    }
}

// Export singleton instance
const knowledgeQuestTranslator = new KnowledgeQuestTranslator();

