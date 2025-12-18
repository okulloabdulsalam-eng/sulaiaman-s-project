/**
 * Report System - User submits text/audio reports for quest verification
 * AI analyzes reports to verify quest completion and assign rewards
 */

class ReportSystem {
    constructor() {
        this.reports = [];
        this.pendingReports = [];
    }

    // Initialize report system
    async init() {
        await this.loadReports();
    }

    // Load reports from database
    async loadReports() {
        try {
            const history = await db.getHistory(1000);
            this.reports = history.filter(h => h.type === 'quest_report') || [];
            this.pendingReports = this.reports.filter(r => r.status === 'pending') || [];
        } catch (error) {
            console.error('Error loading reports:', error);
            this.reports = [];
            this.pendingReports = [];
        }
    }

    // Submit report for quest verification
    async submitReport(questId, reportText, reportType = 'text') {
        const quest = questSystem.getQuest(questId);
        if (!quest) {
            throw new Error('Quest not found');
        }

        if (!reportText || !reportText.trim()) {
            throw new Error('Report cannot be empty');
        }

        // Store report in data collection system
        await dataCollection.storeReport(reportText, questId);

        const report = {
            id: utils.generateId(),
            type: 'quest_report',
            questId: questId,
            questTitle: quest.title,
            reportText: reportText,
            reportType: reportType, // text or audio
            status: 'pending', // pending, analyzing, completed, rejected
            submittedAt: Date.now(),
            analyzedAt: null,
            completionScore: null,
            rewards: null
        };

        // Save report
        this.reports.push(report);
        this.pendingReports.push(report);
        await db.addHistory(report);

        // Analyze report with AI (automatic)
        await this.analyzeReport(report.id);

        return report;
    }

    // AI analyzes report to verify quest completion
    async analyzeReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return null;

        report.status = 'analyzing';
        await db.addHistory({ ...report });

        // Show analyzing notification
        showNotification(
            '[System] Analyzing Report',
            'The System is evaluating your report to verify quest completion...',
            'info'
        );

        // Simulate AI analysis (in production, this would call an AI service)
        setTimeout(async () => {
            const analysisResult = await this.performAIAnalysis(report);
            
            report.status = analysisResult.verified ? 'completed' : 'rejected';
            report.analyzedAt = Date.now();
            report.completionScore = analysisResult.score;
            report.analysisDetails = analysisResult.details;
            
            if (analysisResult.verified) {
                // Automatically complete quest and award rewards
                const quest = questSystem.getQuest(report.questId);
                if (quest) {
                    const completionData = {
                        quality: analysisResult.quality,
                        score: analysisResult.score,
                        verified: true
                    };
                    
                    // Automatically apply rewards
                    const rewards = await questSystem.completeQuestWithReport(
                        report.questId, 
                        completionData,
                        analysisResult
                    );
                    
                    report.rewards = rewards;
                    
                    // Automatic notification already shown by questSystem
                }
            } else {
                // Quest not verified - automatic notification
                showNotification(
                    '[System] Report Rejected',
                    'Your report did not meet the quest requirements. Please try again or revise your approach.',
                    'info'
                );
            }

            // Update report
            await db.addHistory({ ...report });
            this.pendingReports = this.pendingReports.filter(r => r.id !== reportId);
            
            // Update UI
            questSystem.renderQuests();
            questSystem.renderActiveQuestsPreview();
        }, 2000); // Simulate AI processing time

        return report;
    }

    // Perform AI analysis on report (SYSTEM-EVALUATED ONLY - No manual reward claiming)
    // Rewards are ONLY given after system analysis verifies real-world completion
    async performAIAnalysis(report) {
        const reportText = report.reportText.toLowerCase();
        const quest = questSystem.getQuest(report.questId);
        
        // For knowledge-backed quests, check if principle was actually applied
        if (quest.knowledgeSource) {
            return await this.analyzeKnowledgeBackedQuest(report, quest);
        }
        
        // Standard quest analysis
        // Analyze completion indicators
        const completionIndicators = [
            'completed', 'finished', 'done', 'accomplished', 'achieved', 
            'succeeded', 'finished', 'concluded', 'finalized'
        ];
        
        const detailIndicators = [
            'how', 'what', 'when', 'where', 'why', 'details', 'result',
            'outcome', 'learned', 'gained', 'improved'
        ];

        let score = 0;
        let verified = false;
        let quality = 'basic';
        const details = [];

        // Check for completion language
        const hasCompletionLanguage = completionIndicators.some(indicator => 
            reportText.includes(indicator)
        );

        // Check for detail (quality indicator)
        const detailCount = detailIndicators.filter(indicator => 
            reportText.includes(indicator)
        ).length;

        // Check for specific quest-related keywords
        const questKeywords = quest.userInput ? 
            quest.userInput.toLowerCase().split(/\W+/).filter(w => w.length > 4) : [];
        
        const keywordMatches = questKeywords.filter(keyword => 
            reportText.includes(keyword)
        ).length;

        // Calculate score
        if (hasCompletionLanguage) score += 30;
        if (detailCount > 0) score += detailCount * 10;
        if (keywordMatches > 0) score += keywordMatches * 15;
        if (reportText.length > 50) score += 20;
        if (reportText.length > 100) score += 10;
        
        // Bonus for quality indicators
        if (reportText.includes('successfully') || reportText.includes('effectively')) {
            score += 15;
            quality = 'good';
        }
        if (reportText.includes('excellent') || reportText.includes('outstanding')) {
            score += 25;
            quality = 'excellent';
        }

        // Verification threshold - SYSTEM ONLY, no manual claiming
        verified = score >= 50;
        
        // Determine quality level
        if (score >= 100) {
            quality = 'excellent';
        } else if (score >= 75) {
            quality = 'good';
        } else if (score >= 50) {
            quality = 'basic';
        }

        details.push(`Completion language detected: ${hasCompletionLanguage}`);
        details.push(`Detail level: ${detailCount} indicators found`);
        details.push(`Quest keyword matches: ${keywordMatches}/${questKeywords.length}`);
        details.push(`Report length: ${reportText.length} characters`);
        details.push(`Quality assessment: ${quality}`);
        details.push(`SYSTEM EVALUATED - No manual reward claiming allowed`);

        return {
            verified,
            score: Math.min(score, 150), // Cap at 150
            quality,
            details,
            keywordMatches,
            detailCount
        };
    }

    // Analyze knowledge-backed quest completion
    async analyzeKnowledgeBackedQuest(report, quest) {
        const reportText = report.reportText.toLowerCase();
        const knowledgeSource = quest.knowledgeSource;
        const principle = knowledgeSource.principle.toLowerCase();
        
        let score = 0;
        let verified = false;
        let quality = 'basic';
        const details = [];

        // Check if principle was mentioned or applied
        const principleWords = principle.split(/\W+/).filter(w => w.length > 3);
        const principleMatches = principleWords.filter(word => 
            reportText.includes(word)
        ).length;

        // Check for real-world application indicators
        const applicationIndicators = [
            'applied', 'used', 'implemented', 'practiced', 'executed',
            'tried', 'tested', 'experimented', 'action', 'did', 'took'
        ];
        const hasApplication = applicationIndicators.some(ind => reportText.includes(ind));

        // Check for outcome/results
        const outcomeIndicators = [
            'result', 'outcome', 'achieved', 'gained', 'learned', 'improved',
            'worked', 'helped', 'succeeded', 'benefited'
        ];
        const hasOutcome = outcomeIndicators.some(ind => reportText.includes(ind));

        // Calculate score for knowledge-backed quest
        if (principleMatches > 0) score += 40; // Principle recognition
        if (hasApplication) score += 30; // Actual application
        if (hasOutcome) score += 30; // Real-world results
        if (reportText.length > 100) score += 20; // Detailed report
        if (reportText.length > 200) score += 10; // Very detailed

        // Check for source/book mention (bonus)
        if (reportText.includes(knowledgeSource.sourceTitle.toLowerCase().split(' ')[0])) {
            score += 10;
        }

        // Verification threshold - must show real application
        verified = score >= 60 && hasApplication; // Higher threshold for knowledge quests
        
        // Determine quality
        if (score >= 120 && hasApplication && hasOutcome) {
            quality = 'excellent';
        } else if (score >= 90 && hasApplication) {
            quality = 'good';
        } else if (score >= 60) {
            quality = 'basic';
        }

        details.push(`Principle application detected: ${principleMatches > 0}`);
        details.push(`Real-world action taken: ${hasApplication}`);
        details.push(`Outcome reported: ${hasOutcome}`);
        details.push(`Report length: ${reportText.length} characters`);
        details.push(`Quality: ${quality}`);
        details.push(`SYSTEM EVALUATED - Knowledge-backed quest verification`);

        return {
            verified,
            score: Math.min(score, 150),
            quality,
            details,
            principleMatches,
            hasApplication,
            hasOutcome
        };
    }

    // Get reports for a quest
    getReportsForQuest(questId) {
        return this.reports.filter(r => r.questId === questId);
    }

    // Get pending reports
    getPendingReports() {
        return this.pendingReports;
    }
}

// Export singleton instance
const reportSystem = new ReportSystem();

