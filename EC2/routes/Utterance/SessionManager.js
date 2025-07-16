class SessionManager {
    static instance;

    constructor() {
        if (!SessionManager.instance) {
            this.sessionAttributes = {}; // Store session data
            this.cleanupInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
            this.startCleanupTask();
            SessionManager.instance = this;
        }
        return SessionManager.instance;
    }

    // Get session data or initialize a new session
    getSession(sessionId) {
        const now = Date.now();
        if (!this.sessionAttributes[sessionId]) {
            this.sessionAttributes[sessionId] = {
                history: [],
                lastAccessed: now,
            };
        } else {
            this.sessionAttributes[sessionId].lastAccessed = now; // Update access time
        }
        return this.sessionAttributes[sessionId];
    }

    // Add a message to the session history
    addToSessionHistory(sessionId, role, content) {
        const session = this.getSession(sessionId);
        session.history.push({ role, content });
        console.log("Updated Session ", JSON.stringify(this.sessionAttributes))
    }

    // Remove sessions that haven't been accessed for over 2 minutes
    cleanupSessions() {
        // console.log("Before clean up :: ", this.sessionAttributes)
        const now = Date.now();
        for (const sessionId in this.sessionAttributes) {
            if (now - this.sessionAttributes[sessionId].lastAccessed > this.cleanupInterval) {
                delete this.sessionAttributes[sessionId];
            }
        }
        // console.log("After clean up :: ", this.sessionAttributes)
    }

    // Start a periodic cleanup task
    startCleanupTask() {
        setInterval(() => {
            this.cleanupSessions();
        }, this.cleanupInterval);
    }
}

module.exports = new SessionManager(); // Export as a singleton