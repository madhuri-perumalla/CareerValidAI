import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Award, Github, FileText, Globe, Zap } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { StatsCards } from '@/components/stats-cards';
import { SkillChart } from '@/components/charts/skill-chart';
import { LanguageChart } from '@/components/charts/language-chart';
import { SkillRadarChart } from '@/components/charts/radar-chart';

export default function InsightsPage() {
  const { state } = useCareer();

  const getRoleCompatibility = () => {
    const githubData = state.sessionData?.githubData;
    const skills = state.sessionData?.manualSkills || [];
    
    // Only return role compatibility if we have actual data
    if (!githubData && skills.length === 0) {
      return [];
    }
    
    // Calculate role compatibility based on available data
    const roles = [
      {
        title: 'Frontend Developer',
        compatibility: 0,
        description: 'No frontend skills detected',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
      },
      {
        title: 'Full-Stack Developer',
        compatibility: 0,
        description: 'No full-stack skills detected',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
      },
      {
        title: 'Backend Developer',
        compatibility: 0,
        description: 'No backend skills detected',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
      },
      {
        title: 'DevOps Engineer',
        compatibility: 0,
        description: 'No DevOps skills detected',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
      },
    ];

    // Calculate compatibility based on GitHub data
    if (githubData?.languageStats) {
      const languages = githubData.languageStats;
      
      // Frontend calculation
      const frontendLangs = languages.filter(lang => 
        ['javascript', 'typescript', 'html', 'css', 'vue', 'svelte'].includes(lang.language.toLowerCase())
      );
      const frontendScore = frontendLangs.reduce((sum, lang) => sum + lang.percentage, 0);
      roles[0].compatibility = Math.min(95, frontendScore * 1.2);
      roles[0].description = `${frontendScore.toFixed(0)}% frontend languages in repositories`;
      roles[0].color = frontendScore > 60 ? 'text-emerald-600' : frontendScore > 30 ? 'text-blue-600' : 'text-slate-600';
      roles[0].bgColor = frontendScore > 60 ? 'bg-emerald-100' : frontendScore > 30 ? 'bg-blue-100' : 'bg-slate-100';
      
      // Backend calculation
      const backendLangs = languages.filter(lang => 
        ['python', 'java', 'go', 'rust', 'php', 'ruby', 'c++', 'c#', 'c'].includes(lang.language.toLowerCase())
      );
      const backendScore = backendLangs.reduce((sum, lang) => sum + lang.percentage, 0);
      roles[2].compatibility = Math.min(95, backendScore * 1.2);
      roles[2].description = `${backendScore.toFixed(0)}% backend languages in repositories`;
      roles[2].color = backendScore > 60 ? 'text-emerald-600' : backendScore > 30 ? 'text-blue-600' : 'text-slate-600';
      roles[2].bgColor = backendScore > 60 ? 'bg-emerald-100' : backendScore > 30 ? 'bg-blue-100' : 'bg-slate-100';
      
      // Full-stack calculation
      const fullStackScore = (frontendScore + backendScore) / 2;
      roles[1].compatibility = Math.min(95, fullStackScore * 1.1);
      roles[1].description = `Balanced mix of frontend (${frontendScore.toFixed(0)}%) and backend (${backendScore.toFixed(0)}%)`;
      roles[1].color = fullStackScore > 60 ? 'text-emerald-600' : fullStackScore > 30 ? 'text-blue-600' : 'text-slate-600';
      roles[1].bgColor = fullStackScore > 60 ? 'bg-emerald-100' : fullStackScore > 30 ? 'bg-blue-100' : 'bg-slate-100';
      
      // DevOps calculation
      const devopsLangs = languages.filter(lang => 
        ['dockerfile', 'shell', 'makefile', 'yaml'].includes(lang.language.toLowerCase())
      );
      const devopsScore = devopsLangs.reduce((sum, lang) => sum + lang.percentage, 0);
      roles[3].compatibility = Math.min(95, devopsScore * 2 + (backendScore * 0.3));
      roles[3].description = `${devopsScore.toFixed(0)}% DevOps-related languages`;
      roles[3].color = devopsScore > 20 ? 'text-emerald-600' : devopsScore > 10 ? 'text-blue-600' : 'text-slate-600';
      roles[3].bgColor = devopsScore > 20 ? 'bg-emerald-100' : devopsScore > 10 ? 'bg-blue-100' : 'bg-slate-100';
    }

    // Enhance with manual skills data
    if (skills.length > 0) {
      const frontendSkills = skills.filter(skill => 
        ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html'].some(tech => 
          skill.skillName.toLowerCase().includes(tech)
        )
      );
      
      const backendSkills = skills.filter(skill => 
        ['node', 'python', 'java', 'go', 'php', 'ruby', 'sql', 'mongodb'].some(tech => 
          skill.skillName.toLowerCase().includes(tech)
        )
      );
      
      const devopsSkills = skills.filter(skill => 
        ['docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'terraform'].some(tech => 
          skill.skillName.toLowerCase().includes(tech)
        )
      );

      // Boost scores based on manual skills
      if (frontendSkills.length > 0) {
        const avgScore = frontendSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / frontendSkills.length;
        roles[0].compatibility = Math.max(roles[0].compatibility, avgScore);
        roles[0].description = `${frontendSkills.length} frontend skills, avg proficiency ${avgScore.toFixed(0)}%`;
      }
      
      if (backendSkills.length > 0) {
        const avgScore = backendSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / backendSkills.length;
        roles[2].compatibility = Math.max(roles[2].compatibility, avgScore);
        roles[2].description = `${backendSkills.length} backend skills, avg proficiency ${avgScore.toFixed(0)}%`;
      }
      
      if (frontendSkills.length > 0 && backendSkills.length > 0) {
        const fullStackAvg = (
          frontendSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) +
          backendSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0)
        ) / (frontendSkills.length + backendSkills.length);
        roles[1].compatibility = Math.max(roles[1].compatibility, fullStackAvg);
        roles[1].description = `${frontendSkills.length + backendSkills.length} full-stack skills`;
      }
      
      if (devopsSkills.length > 0) {
        const avgScore = devopsSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / devopsSkills.length;
        roles[3].compatibility = Math.max(roles[3].compatibility, avgScore);
        roles[3].description = `${devopsSkills.length} DevOps skills, avg proficiency ${avgScore.toFixed(0)}%`;
      }
    }

    return roles.sort((a, b) => b.compatibility - a.compatibility);
  };

  const getAnalysisProgress = () => {
    const progress = {
      github: !!state.sessionData?.githubData,
      resume: !!state.sessionData?.resumeData,
      portfolio: !!state.sessionData?.portfolioData,
      skills: (state.sessionData?.manualSkills?.length || 0) > 0,
    };

    const completed = Object.values(progress).filter(Boolean).length;
    const total = Object.keys(progress).length;

    return {
      progress,
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  const analysisProgress = getAnalysisProgress();
  const roleCompatibility = getRoleCompatibility();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Visual Insights</h1>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            Interactive
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Comprehensive analysis of your skills, GitHub activity, and career compatibility.
        </p>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Analysis Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analysis Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-slate-900">
                    {analysisProgress.completed}/{analysisProgress.total} Complete
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {analysisProgress.percentage}%
                  </span>
                </div>
                
                <Progress value={analysisProgress.percentage} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    analysisProgress.progress.github ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      analysisProgress.progress.github ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <Github className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">GitHub</div>
                      <div className={`text-xs ${
                        analysisProgress.progress.github ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {analysisProgress.progress.github ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    analysisProgress.progress.resume ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      analysisProgress.progress.resume ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Resume</div>
                      <div className={`text-xs ${
                        analysisProgress.progress.resume ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {analysisProgress.progress.resume ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    analysisProgress.progress.portfolio ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      analysisProgress.progress.portfolio ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Portfolio</div>
                      <div className={`text-xs ${
                        analysisProgress.progress.portfolio ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {analysisProgress.progress.portfolio ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    analysisProgress.progress.skills ? 'bg-emerald-50' : 'bg-slate-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      analysisProgress.progress.skills ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Skills</div>
                      <div className={`text-xs ${
                        analysisProgress.progress.skills ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {analysisProgress.progress.skills ? 'Added' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LanguageChart />
            <SkillRadarChart />
          </div>

          <SkillChart />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Compatibility */}
          {roleCompatibility.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Role Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleCompatibility.map((role, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{role.title}</span>
                        <span className={`font-bold ${role.color}`}>
                          {Math.round(role.compatibility)}%
                        </span>
                      </div>
                      <Progress value={role.compatibility} className="h-2" />
                      <p className="text-xs text-slate-600">{role.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Role Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Add skills or analyze your GitHub profile to see role compatibility scores.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {state.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`text-center p-3 rounded-lg transition-all ${
                      achievement.unlocked
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 border border-slate-200 opacity-50'
                    }`}
                  >
                    <div className={`text-2xl mb-1 ${
                      achievement.unlocked ? 'transform scale-110' : ''
                    }`}>
                      {achievement.icon}
                    </div>
                    <p className="text-xs font-medium text-slate-900">
                      {achievement.title}
                    </p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-emerald-600 mt-1">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {state.sessionData && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {state.sessionData.githubData && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">GitHub Stars:</span>
                        <span className="font-medium">{state.sessionData.githubData.stats.totalStars}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Repositories:</span>
                        <span className="font-medium">{state.sessionData.githubData.stats.totalRepos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Top Language:</span>
                        <span className="font-medium">
                          {state.sessionData.githubData.languageStats?.[0]?.language || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {state.sessionData.resumeData && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Resume Score:</span>
                      <span className="font-medium">{state.sessionData.resumeData.score}/100</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Skills Added:</span>
                    <span className="font-medium">{state.sessionData.manualSkills?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Analysis Progress:</span>
                    <span className="font-medium">{analysisProgress.percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!analysisProgress.progress.github && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Github className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Analyze GitHub</p>
                      <p className="text-xs text-blue-700">Get insights from your repositories</p>
                    </div>
                  </div>
                )}
                
                {!analysisProgress.progress.resume && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <FileText className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Upload Resume</p>
                      <p className="text-xs text-emerald-700">Get AI-powered feedback</p>
                    </div>
                  </div>
                )}
                
                {!analysisProgress.progress.skills && (
                  <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg">
                    <Zap className="h-4 w-4 text-violet-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-violet-900">Add Skills</p>
                      <p className="text-xs text-violet-700">Manual skill assessment</p>
                    </div>
                  </div>
                )}
                
                {analysisProgress.percentage === 100 && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Target className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Build Resume</p>
                      <p className="text-xs text-amber-700">Generate AI-powered resume</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
