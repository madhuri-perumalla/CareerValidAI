import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as dotenv from 'dotenv';
import { 
  githubAnalysisSchema,
  resumeAnalysisSchema,
  portfolioAnalysisSchema,
  manualSkillSchema,
  resumeBuilderSchema,
  chatMessageSchema
} from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Helper function to get AI model
function getAIModel() {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize or get session
  app.post("/api/session", async (req: Request, res: Response) => {
    try {
      const sessionId = req.body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let session = await storage.getSession(sessionId);
      if (!session) {
        session = await storage.createSession({ sessionId });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error managing session:", error);
      res.status(500).json({ error: "Failed to manage session" });
    }
  });

  // GitHub Analysis
  app.post("/api/analyze/github", async (req: Request, res: Response) => {
    try {
      const validatedData = githubAnalysisSchema.parse(req.body);
      const { profileUrl, token } = validatedData;
      const sessionId = req.body.sessionId;

      // Extract username from GitHub URL
      const username = profileUrl.split('/').pop();
      if (!username) {
        return res.status(400).json({ error: "Invalid GitHub profile URL" });
      }

      // Fetch GitHub data
      const headers: Record<string, string> = {
        'User-Agent': 'CareerValid-AI',
      };
      
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      // Get user profile
      const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userResponse.ok) {
        throw new Error(`GitHub API error: ${userResponse.status}`);
      }
      const userData = await userResponse.json();

      // Get repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }
      const reposData = await reposResponse.json();

      // Analyze with Gemini AI
      const model = getAIModel();
      
      const analysisPrompt = `
        Analyze this GitHub profile data and provide career insights:
        
        Profile: ${JSON.stringify(userData, null, 2)}
        Repositories: ${JSON.stringify(reposData.slice(0, 20), null, 2)}
        
        Please provide insights in this exact format:
        
        🧠 **Career Insights**
        - Key Skills Detected: (list as inline code style)
        - Activity Summary: (commit behavior, projects, patterns)
        - Profile Strengths: (Frontend/Backend/Data Science/etc.)
        
        💡 **AI Recommendations**
        🔧 **Skills to Focus On**
        • [specific recommendations]
        
        🧪 **Suggested Projects**
        • [project ideas based on current skills]
        
        📚 **Learning Resources**
        • [specific learning recommendations]
        
        🚀 **Career Path Suggestions**
        • [role recommendations]
        
        🔄 **Final Motivation**
        [One motivational line]
      `;

      const result = await model.generateContent(analysisPrompt);
      const insights = result.response.text();

      // Calculate skill scores and extract languages
      const languages = new Map<string, number>();
      let totalBytes = 0;

      reposData.forEach((repo: any) => {
        if (repo.language) {
          const size = repo.size || 0;
          languages.set(repo.language, (languages.get(repo.language) || 0) + size);
          totalBytes += size;
        }
      });

      const languageStats = Array.from(languages.entries())
        .map(([language, bytes]) => ({
          language,
          percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
          bytes
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

      const githubData = {
        profile: userData,
        repositories: reposData,
        insights,
        languageStats,
        stats: {
          totalRepos: userData.public_repos,
          totalStars: reposData.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0),
          totalForks: reposData.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0),
        }
      };

      // Update session
      await storage.updateSession(sessionId, { githubData });

      res.json({ success: true, data: githubData });
    } catch (error) {
      console.error("Error analyzing GitHub:", error);
      res.status(500).json({ error: "Failed to analyze GitHub profile" });
    }
  });

  // Resume Analysis
  app.post("/api/analyze/resume", async (req: Request, res: Response) => {
    try {
      const validatedData = resumeAnalysisSchema.parse(req.body);
      const { fileContent, fileName, fileType } = validatedData;
      const sessionId = req.body.sessionId;

      // Analyze with Gemini AI
      const model = getAIModel();
      
      const analysisPrompt = `
        Analyze this resume content and provide feedback:
        
        File: ${fileName}
        Content: ${fileContent}
        
        Please provide analysis in this exact format:
        
        🧠 **Career Insights**
        - Key Skills Detected: (list as inline code style)
        - Experience Summary: (years, roles, industries)
        - Resume Strengths: (what stands out)
        
        💡 **AI Recommendations**
        🔧 **Skills to Highlight**
        • [skills to emphasize more]
        
        📝 **Format Improvements**
        • [specific formatting suggestions]
        
        📚 **Content Enhancements**
        • [what to add or modify]
        
        🚀 **Role Alignment**
        • [how well it matches target roles]
        
        Provide a resume score from 1-100 and explain the scoring.
        
        🔄 **Final Motivation**
        [One motivational line]
      `;

      const result = await model.generateContent(analysisPrompt);
      const insights = result.response.text();

      // Extract score from insights (simplified)
      const scoreMatch = insights.match(/(\d+)(?:\/100|\s*out\s*of\s*100)/i);
      const resumeScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;

      const resumeData = {
        fileName,
        fileType,
        insights,
        score: resumeScore,
        analyzedAt: new Date(),
      };

      // Update session
      await storage.updateSession(sessionId, { resumeData });

      res.json({ success: true, data: resumeData });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });

  // Portfolio Analysis
  app.post("/api/analyze/portfolio", async (req: Request, res: Response) => {
    try {
      const validatedData = portfolioAnalysisSchema.parse(req.body);
      const { portfolioUrl } = validatedData;
      const sessionId = req.body.sessionId;

      // Fetch portfolio content (simplified - in production would use proper scraping)
      const response = await fetch(portfolioUrl);
      const htmlContent = await response.text();
      
      // Extract basic info (simplified)
      const title = htmlContent.match(/<title>(.*?)<\/title>/i)?.[1] || '';
      const description = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i)?.[1] || '';

      // Analyze with Gemini AI
      const model = getAIModel();
      
      const analysisPrompt = `
        Analyze this portfolio website and provide feedback:
        
        URL: ${portfolioUrl}
        Title: ${title}
        Description: ${description}
        Content Preview: ${htmlContent.slice(0, 2000)}...
        
        Please provide analysis in this exact format:
        
        🧠 **Career Insights**
        - Personal Branding: (how well they present themselves)
        - Technical Skills Shown: (evident from projects/content)
        - Portfolio Strengths: (what works well)
        
        💡 **AI Recommendations**
        🎨 **Design Improvements**
        • [UI/UX suggestions]
        
        📝 **Content Enhancements**
        • [what sections to add/improve]
        
        🚀 **Professional Impact**
        • [how to increase impact]
        
        📱 **Technical Suggestions**
        • [performance, accessibility, etc.]
        
        🔄 **Final Motivation**
        [One motivational line]
      `;

      const result = await model.generateContent(analysisPrompt);
      const insights = result.response.text();

      const portfolioData = {
        url: portfolioUrl,
        title,
        description,
        insights,
        analyzedAt: new Date(),
      };

      // Update session
      await storage.updateSession(sessionId, { portfolioData });

      res.json({ success: true, data: portfolioData });
    } catch (error) {
      console.error("Error analyzing portfolio:", error);
      res.status(500).json({ error: "Failed to analyze portfolio" });
    }
  });

  // Manual Skills Management
  app.post("/api/skills/add", async (req: Request, res: Response) => {
    try {
      const validatedData = manualSkillSchema.parse(req.body);
      const sessionId = req.body.sessionId;

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const existingSkills = (session.manualSkills as any[]) || [];
      
      // Calculate proficiency score
      const yearMultiplier: Record<string, number> = {
        '0-1': 10,
        '1-2': 20,
        '2-3': 30,
        '3+': 40
      };
      
      const usageMultiplier: Record<string, number> = {
        'Personal Project': 10,
        'Work Experience': 20,
        'Open Source': 15,
        'Learning': 5
      };

      const yearsExp = validatedData.yearsExperience as keyof typeof yearMultiplier;
      const usageType = validatedData.usageType as keyof typeof usageMultiplier;

      const proficiencyScore = Math.min(100, 
        yearMultiplier[yearsExp] + 
        usageMultiplier[usageType] + 
        (validatedData.confidenceLevel * 5)
      );

      const newSkill = {
        ...validatedData,
        proficiencyScore,
        addedAt: new Date(),
      };

      const updatedSkills = [...existingSkills, newSkill];

      // Generate insights with Gemini AI
      const model = getAIModel();
      
      const skillsPrompt = `
        Analyze these manually entered skills and provide insights:
        
        Skills: ${JSON.stringify(updatedSkills, null, 2)}
        
        Please provide analysis in this exact format:
        
        🧠 **Career Insights**
        - Skill Categories: (frontend, backend, tools, etc.)
        - Proficiency Overview: (strongest and weakest areas)
        - Experience Level: (junior, mid, senior assessment)
        
        💡 **AI Recommendations**
        🔧 **Skills to Focus On**
        • [skills to improve or learn next]
        
        🧪 **Suggested Projects**
        • [projects that would use these skills]
        
        📚 **Learning Resources**
        • [specific learning recommendations]
        
        🚀 **Career Path Suggestions**
        • [suitable roles based on skill mix]
        
        🔄 **Final Motivation**
        [One motivational line]
      `;

      const result = await model.generateContent(skillsPrompt);
      const insights = result.response.text();

      // Update session
      await storage.updateSession(sessionId, { 
        manualSkills: updatedSkills,
        insights: { skills: insights }
      });

      res.json({ success: true, skills: updatedSkills, insights });
    } catch (error) {
      console.error("Error adding skill:", error);
      res.status(500).json({ error: "Failed to add skill" });
    }
  });

  // Resume Builder
  app.post("/api/resume/build", async (req: Request, res: Response) => {
    try {
      // Parse data without strict email validation for empty fields
      const { sessionId, ...resumeFormData } = req.body;
      
      // Clean email field if empty
      if (resumeFormData.contactInfo?.email === '') {
        delete resumeFormData.contactInfo.email;
      }
      
      const validatedData = resumeBuilderSchema.parse(resumeFormData);

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Collect all available data
      const githubData = session.githubData as any;
      const existingResumeData = session.resumeData as any;
      const portfolioData = session.portfolioData as any;
      const manualSkills = (session.manualSkills as any[]) || [];

      // Determine what data to include
      const includeGithub = validatedData.includeGithubData !== false;
      const includeSkills = validatedData.includeSkillsData !== false;
      const includePortfolio = validatedData.includePortfolioData !== false;

      // Generate resume with Gemini AI
      const model = getAIModel();
      
      const resumePrompt = `
        Create a professional resume for the target role: ${validatedData.targetRole}
        
        Contact Information:
        ${JSON.stringify(validatedData.contactInfo || {})}
        
        Professional Links:
        ${JSON.stringify(validatedData.professionalLinks || {})}
        
        Available analyzed data:
        ${includeGithub && githubData ? `GitHub Stats: ${JSON.stringify(githubData.stats)}` : ''}
        ${includeGithub && githubData ? `Top Languages: ${JSON.stringify(githubData.languageStats?.slice(0, 5))}` : ''}
        ${includeGithub && githubData ? `Top Repositories: ${JSON.stringify(githubData.repositories?.slice(0, 5))}` : ''}
        ${includeSkills ? `Manual Skills: ${JSON.stringify(manualSkills)}` : ''}
        ${includePortfolio && portfolioData ? `Portfolio: ${JSON.stringify(portfolioData)}` : ''}
        
        Additional sections provided by user:
        Education: ${JSON.stringify(validatedData.education || [])}
        Certifications: ${JSON.stringify(validatedData.certifications || [])}
        Awards: ${JSON.stringify(validatedData.awards || [])}
        Languages: ${JSON.stringify(validatedData.languages || [])}
        
        Additional Info: ${validatedData.additionalInfo || 'None provided'}
        
        Generate a complete, professional resume in HTML format with:
        1. Header with contact information and professional links
        2. Professional Summary (3-4 lines highlighting key qualifications for ${validatedData.targetRole})
        3. Technical Skills (organized by category based on analyzed data)
        4. Projects (from GitHub repositories if available)
        5. Experience Summary (inferred from skills and project data)
        6. Education (from provided data or inferred)
        7. Certifications (if provided)
        8. Awards (if provided)
        9. Languages (if provided)
        
        Use clean, professional HTML/CSS formatting. Make it ATS-friendly and well-structured.
        Focus on achievements and impact, not just responsibilities.
      `;

      const result = await model.generateContent(resumePrompt);
      const resumeHtml = result.response.text();

      const builtResume = {
        targetRole: validatedData.targetRole,
        html: resumeHtml,
        additionalInfo: validatedData.additionalInfo,
        contactInfo: validatedData.contactInfo,
        professionalLinks: validatedData.professionalLinks,
        education: validatedData.education,
        certifications: validatedData.certifications,
        awards: validatedData.awards,
        languages: validatedData.languages,
        includeGithubData: validatedData.includeGithubData,
        includeSkillsData: validatedData.includeSkillsData,
        includePortfolioData: validatedData.includePortfolioData,
        generatedAt: new Date(),
      };

      res.json({ success: true, resume: builtResume });
    } catch (error) {
      console.error("Error building resume:", error);
      res.status(500).json({ error: "Failed to build resume" });
    }
  });

  // Chat with AI
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = chatMessageSchema.parse(req.body);
      const { message, sessionId } = validatedData;

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Get session context
      const context = {
        githubData: session.githubData,
        resumeData: session.resumeData,
        portfolioData: session.portfolioData,
        manualSkills: session.manualSkills,
      };

      // Chat with Gemini AI
      const model = getAIModel();
      
      const chatPrompt = `
        You are CareerValid AI, a helpful career development assistant. 
        
        User's session context: ${JSON.stringify(context, null, 2)}
        
        User message: ${message}
        
        Provide helpful, actionable career advice. Keep responses concise but informative.
        Focus on practical next steps, learning resources, and career guidance.
        If the user asks about resume improvements, skill development, project ideas, or career paths, 
        use their session data to provide personalized recommendations.
        
        Always end with encouragement and maintain a positive, supportive tone.
      `;

      const result = await model.generateContent(chatPrompt);
      const response = result.response.text();

      // Save chat message
      await storage.createChatMessage({
        sessionId,
        message,
        response,
      });

      res.json({ success: true, response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get session data
  app.get("/api/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const chatMessages = await storage.getChatMessages(sessionId);
      
      res.json({ 
        session,
        chatMessages 
      });
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({ error: "Failed to get session data" });
    }
  });

  // Export session data
  app.get("/api/session/:sessionId/export", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const chatMessages = await storage.getChatMessages(sessionId);
      
      const exportData = {
        session,
        chatMessages,
        exportedAt: new Date(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="careervalid-session-${sessionId}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting session:", error);
      res.status(500).json({ error: "Failed to export session data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
