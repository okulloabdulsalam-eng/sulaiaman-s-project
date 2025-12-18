/**
 * Database Module - IndexedDB for offline data storage
 */
class Database {
    constructor() {
        this.dbName = 'SoloLevelingDB';
        this.version = 2; // Incremented for knowledge sources
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Player data store
                if (!db.objectStoreNames.contains('player')) {
                    const playerStore = db.createObjectStore('player', { keyPath: 'id' });
                    playerStore.createIndex('level', 'level', { unique: false });
                }

                // Quests store
                if (!db.objectStoreNames.contains('quests')) {
                    const questStore = db.createObjectStore('quests', { keyPath: 'id', autoIncrement: true });
                    questStore.createIndex('status', 'status', { unique: false });
                    questStore.createIndex('category', 'category', { unique: false });
                }

                // Skills store
                if (!db.objectStoreNames.contains('skills')) {
                    const skillStore = db.createObjectStore('skills', { keyPath: 'id' });
                    skillStore.createIndex('level', 'level', { unique: false });
                }

                // Stats store
                if (!db.objectStoreNames.contains('stats')) {
                    db.createObjectStore('stats', { keyPath: 'statName' });
                }

                // History store for XP gains, level ups, etc.
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Knowledge sources store (for offline caching)
                if (!db.objectStoreNames.contains('knowledgeSources')) {
                    const knowledgeStore = db.createObjectStore('knowledgeSources', { keyPath: 'id' });
                    knowledgeStore.createIndex('domain', 'domain', { unique: false });
                    knowledgeStore.createIndex('author', 'author', { unique: false });
                }
            };
        });
    }

    // Player data methods
    async savePlayerData(data) {
        return this.put('player', { id: 'current', ...data });
    }

    async getPlayerData() {
        return this.get('player', 'current');
    }

    // Quest methods
    async saveQuest(quest) {
        return this.put('quests', quest);
    }

    async getAllQuests() {
        return this.getAll('quests');
    }

    async getActiveQuests() {
        return this.getByIndex('quests', 'status', 'active');
    }

    async getCompletedQuests() {
        return this.getByIndex('quests', 'status', 'completed');
    }

    // Skill methods
    async saveSkill(skill) {
        return this.put('skills', skill);
    }

    async getAllSkills() {
        return this.getAll('skills');
    }

    async getSkill(skillId) {
        return this.get('skills', skillId);
    }

    // Stats methods
    async saveStat(statName, value) {
        return this.put('stats', { statName, value });
    }

    async getAllStats() {
        return this.getAll('stats');
    }

    async getStat(statName) {
        const result = await this.get('stats', statName);
        return result ? result.value : 0;
    }

    // History methods
    async addHistory(entry) {
        return this.put('history', { ...entry, timestamp: Date.now() });
    }

    async getHistory(limit = 50) {
        const all = await this.getAll('history');
        return all
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // Knowledge sources methods
    async saveKnowledgeSources(sources) {
        // Save all sources
        const promises = sources.map(source => this.put('knowledgeSources', source));
        return Promise.all(promises);
    }

    async getKnowledgeSources() {
        return this.getAll('knowledgeSources');
    }

    async getKnowledgeSourcesByDomain(domain) {
        return this.getByIndex('knowledgeSources', 'domain', domain);
    }

    async getKnowledgeSource(sourceId) {
        return this.get('knowledgeSources', sourceId);
    }

    // Generic database methods
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

// Export singleton instance
const db = new Database();




