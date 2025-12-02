import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Github, Star, GitFork, BookOpen } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function GitHubPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [token, setToken] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { state, dispatch } = useCareer();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profileUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub profile URL",
        variant: "destructive",
      });
      return;
    }

    if (!state.sessionId) {
      toast({
        title: "Error",
        description: "Session not initialized",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await careerAPI.analyzeGitHub({
        profileUrl: profileUrl.trim(),
        token: token.trim() || undefined,
        sessionId: state.sessionId,
      });

      if (response.success) {
        dispatch({ type: 'UPDATE_GITHUB_DATA', payload: response.data });
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'github-analyzed' });
        
        toast({
          title: "Success",
          description: "GitHub profile analyzed successfully!",
        });
      }
    } catch (error) {
      console.error('GitHub analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze GitHub profile. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const githubData = state.sessionData?.githubData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Github className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">GitHub Analyzer</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            AI-Powered
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Analyze your GitHub profile to discover insights about your coding patterns, skills, and project highlights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profileUrl">GitHub Profile URL</Label>
                <Input
                  id="profileUrl"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="token">
                  GitHub Token (Optional - for enhanced analysis)
                  <span className="text-xs text-slate-500 ml-2">Read-only access</span>
                </Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Some data may be limited without token
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !profileUrl.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze GitHub Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {githubData && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Profile Overview */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                      <Github className="h-8 w-8 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{githubData.profile.name || githubData.profile.login}</h3>
                      <p className="text-slate-600">@{githubData.profile.login}</p>
                      {githubData.profile.bio && (
                        <p className="text-sm text-slate-700 mt-1">{githubData.profile.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold">{githubData.stats.totalRepos}</span>
                      <span className="text-sm text-slate-600">repos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{githubData.stats.totalStars}</span>
                      <span className="text-sm text-slate-600">stars</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <GitFork className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold">{githubData.stats.totalForks}</span>
                      <span className="text-sm text-slate-600">forks</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="whitespace-pre-line text-slate-700"
                    dangerouslySetInnerHTML={{ __html: githubData.insights }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Language Stats */}
          {githubData?.languageStats && githubData.languageStats.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Top Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {githubData.languageStats.slice(0, 8).map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{lang.language}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-8 text-right">{lang.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Repositories */}
          {githubData?.repositories && (
            <Card>
              <CardHeader>
                <CardTitle>Top Repositories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {githubData.repositories
                    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
                    .slice(0, 5)
                    .map((repo) => (
                      <div key={repo.id} className="p-3 border border-slate-200 rounded-lg">
                        <h4 className="font-semibold text-slate-900 text-sm">{repo.name}</h4>
                        {repo.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks_count || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
