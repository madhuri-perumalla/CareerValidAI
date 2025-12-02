import { 
  sessions, 
  chatMessages, 
  type Session, 
  type InsertSession, 
  type ChatMessage, 
  type InsertChatMessage 
} from "@shared/schema";

export interface IStorage {
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  updateSession(sessionId: string, data: Partial<InsertSession>): Promise<Session | undefined>;
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private chatMessages: Map<string, ChatMessage[]>;
  private sessionIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.sessions = new Map();
    this.chatMessages = new Map();
    this.sessionIdCounter = 1;
    this.messageIdCounter = 1;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const session: Session = {
      id,
      sessionId: insertSession.sessionId,
      githubData: insertSession.githubData || null,
      resumeData: insertSession.resumeData || null,
      portfolioData: insertSession.portfolioData || null,
      manualSkills: insertSession.manualSkills || null,
      insights: insertSession.insights || null,
      createdAt: new Date(),
    };
    
    this.sessions.set(insertSession.sessionId, session);
    this.chatMessages.set(insertSession.sessionId, []);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(sessionId: string, data: Partial<InsertSession>): Promise<Session | undefined> {
    const existingSession = this.sessions.get(sessionId);
    if (!existingSession) return undefined;

    const updatedSession: Session = {
      ...existingSession,
      ...data,
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageIdCounter++;
    const message: ChatMessage = {
      id,
      sessionId: insertMessage.sessionId,
      message: insertMessage.message,
      response: insertMessage.response,
      timestamp: new Date(),
    };

    const sessionMessages = this.chatMessages.get(insertMessage.sessionId) || [];
    sessionMessages.push(message);
    this.chatMessages.set(insertMessage.sessionId, sessionMessages);

    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }
}

export const storage = new MemStorage();
