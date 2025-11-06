import type { ChatSession, Message } from '@assist-widget/shared';

/**
 * In-memory session management
 * In production, use Redis or a database
 */
export class SessionService {
  private sessions = new Map<string, ChatSession>();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  getSession(sessionId: string, customerId: string): ChatSession {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        customerId,
        messages: [],
        createdAt: Date.now(),
      };
      this.sessions.set(sessionId, session);
    }

    // Update session timestamp
    session.createdAt = Date.now();

    return session;
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.createdAt = Date.now();
    }
  }

  getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  cleanup(): void {
    const now = Date.now();
    const sessionsToDelete: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now - session.createdAt > this.sessionTimeout) {
        sessionsToDelete.push(sessionId);
      }
    });

    sessionsToDelete.forEach((sessionId) => {
      this.sessions.delete(sessionId);
    });

    if (sessionsToDelete.length > 0) {
      console.log(`[SessionService] Cleaned up ${sessionsToDelete.length} expired sessions`);
    }
  }

  startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Run cleanup every 5 minutes
  }
}
