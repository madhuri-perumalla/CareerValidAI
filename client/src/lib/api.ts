import { apiRequest } from './queryClient';

class CareerAPI {
  async initializeSession(sessionId?: string) {
    const response = await apiRequest('POST', '/api/session', { sessionId });
    return response.json();
  }

  async analyzeGitHub(data: { profileUrl: string; token?: string; sessionId: string }) {
    const response = await apiRequest('POST', '/api/analyze/github', data);
    return response.json();
  }

  async analyzeResume(data: { fileContent: string; fileName: string; fileType: string; sessionId: string }) {
    const response = await apiRequest('POST', '/api/analyze/resume', data);
    return response.json();
  }

  async analyzePortfolio(data: { portfolioUrl: string; sessionId: string }) {
    const response = await apiRequest('POST', '/api/analyze/portfolio', data);
    return response.json();
  }

  async addSkill(data: {
    skillName: string;
    yearsExperience: string;
    usageType: string;
    confidenceLevel: number;
    sessionId: string;
  }) {
    const response = await apiRequest('POST', '/api/skills/add', data);
    return response.json();
  }

  async buildResume(data: {
    targetRole: string;
    additionalInfo?: string;
    contactInfo?: any;
    professionalLinks?: any;
    education?: any;
    certifications?: any;
    awards?: any;
    languages?: any;
    includeGithubData?: boolean;
    includeSkillsData?: boolean;
    includePortfolioData?: boolean;
    sessionId: string;
  }) {
    const response = await apiRequest('POST', '/api/resume/build', data);
    return response.json();
  }

  async sendChatMessage(data: { message: string; sessionId: string }) {
    const response = await apiRequest('POST', '/api/chat', data);
    return response.json();
  }

  async getSessionData(sessionId: string) {
    const response = await fetch(`/api/session/${sessionId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to get session data');
    }
    return response.json();
  }

  async exportSessionData(sessionId: string) {
    const response = await fetch(`/api/session/${sessionId}/export`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to export session data');
    }
    return response.blob();
  }
}

export const careerAPI = new CareerAPI();
