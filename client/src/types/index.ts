export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
}

export interface LanguageStat {
  language: string;
  percentage: number;
  bytes: number;
}

export interface GitHubData {
  profile: GitHubProfile;
  repositories: GitHubRepo[];
  insights: string;
  languageStats: LanguageStat[];
  stats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
  };
}

export interface ResumeData {
  fileName: string;
  fileType: 'pdf' | 'docx';
  insights: string;
  score: number;
  analyzedAt: Date;
}

export interface PortfolioData {
  url: string;
  title: string;
  description: string;
  insights: string;
  analyzedAt: Date;
}

export interface ManualSkill {
  skillName: string;
  yearsExperience: '0-1' | '1-2' | '2-3' | '3+';
  usageType: 'Personal Project' | 'Work Experience' | 'Open Source' | 'Learning';
  confidenceLevel: number;
  proficiencyScore: number;
  addedAt: Date;
}

export interface ChatMessage {
  id: number;
  sessionId: string;
  message: string;
  response: string;
  timestamp: Date;
}

export interface SessionData {
  id: number;
  sessionId: string;
  githubData?: GitHubData;
  resumeData?: ResumeData;
  portfolioData?: PortfolioData;
  manualSkills?: ManualSkill[];
  insights?: any;
  createdAt: Date;
}

export interface ResumeBuilder {
  targetRole: string;
  html: string;
  additionalInfo?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalLinks?: {
    portfolio?: string;
    linkedin?: string;
    github?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: string;
    gpa?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
  }>;
  includeGithubData?: boolean;
  includeSkillsData?: boolean;
  includePortfolioData?: boolean;
  generatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}
