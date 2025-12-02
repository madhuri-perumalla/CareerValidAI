import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SessionData, ChatMessage, ManualSkill, ResumeBuilder, Achievement } from '@/types';

interface CareerState {
  sessionId: string | null;
  sessionData: SessionData | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  achievements: Achievement[];
  builtResume: ResumeBuilder | null;
}

type CareerAction = 
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_SESSION_DATA'; payload: SessionData }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_GITHUB_DATA'; payload: any }
  | { type: 'UPDATE_RESUME_DATA'; payload: any }
  | { type: 'UPDATE_PORTFOLIO_DATA'; payload: any }
  | { type: 'ADD_MANUAL_SKILL'; payload: ManualSkill }
  | { type: 'SET_BUILT_RESUME'; payload: ResumeBuilder }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'RESET_SESSION' };

const initialState: CareerState = {
  sessionId: null,
  sessionData: null,
  chatMessages: [],
  isLoading: false,
  error: null,
  achievements: [
    { id: 'github-analyzed', title: 'GitHub Analyzed', description: 'Successfully analyzed your GitHub profile', icon: '✅', unlocked: false },
    { id: 'resume-uploaded', title: 'Resume Analyzed', description: 'Uploaded and analyzed your resume', icon: '📄', unlocked: false },
    { id: 'skills-added', title: 'Top 3 Skills', description: 'Added at least 3 manual skills', icon: '⚡', unlocked: false },
    { id: 'resume-generated', title: 'Resume Generated', description: 'Generated AI-powered resume', icon: '🎯', unlocked: false },
    { id: 'portfolio-analyzed', title: 'Portfolio Analyzed', description: 'Analyzed your portfolio website', icon: '🌐', unlocked: false },
    { id: 'career-explorer', title: 'Career Explorer', description: 'Completed full career analysis', icon: '⭐', unlocked: false },
  ],
  builtResume: null,
};

function careerReducer(state: CareerState, action: CareerAction): CareerState {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    
    case 'SET_SESSION_DATA':
      return { ...state, sessionData: action.payload };
    
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };
    
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_GITHUB_DATA':
      return {
        ...state,
        sessionData: state.sessionData ? {
          ...state.sessionData,
          githubData: action.payload
        } : null
      };
    
    case 'UPDATE_RESUME_DATA':
      return {
        ...state,
        sessionData: state.sessionData ? {
          ...state.sessionData,
          resumeData: action.payload
        } : null
      };
    
    case 'UPDATE_PORTFOLIO_DATA':
      return {
        ...state,
        sessionData: state.sessionData ? {
          ...state.sessionData,
          portfolioData: action.payload
        } : null
      };
    
    case 'ADD_MANUAL_SKILL':
      const currentSkills = state.sessionData?.manualSkills || [];
      return {
        ...state,
        sessionData: state.sessionData ? {
          ...state.sessionData,
          manualSkills: [...currentSkills, action.payload]
        } : null
      };
    
    case 'SET_BUILT_RESUME':
      return { ...state, builtResume: action.payload };
    
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload
            ? { ...achievement, unlocked: true, unlockedAt: new Date() }
            : achievement
        )
      };
    
    case 'RESET_SESSION':
      return { ...initialState, achievements: state.achievements };
    
    default:
      return state;
  }
}

const CareerContext = createContext<{
  state: CareerState;
  dispatch: React.Dispatch<CareerAction>;
} | null>(null);

export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(careerReducer, initialState);

  return (
    <CareerContext.Provider value={{ state, dispatch }}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
}
