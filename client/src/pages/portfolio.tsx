import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, ExternalLink } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function PortfolioPage() {
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { state, dispatch } = useCareer();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!portfolioUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(portfolioUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
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
      const response = await careerAPI.analyzePortfolio({
        portfolioUrl: portfolioUrl.trim(),
        sessionId: state.sessionId,
      });

      if (response.success) {
        dispatch({ type: 'UPDATE_PORTFOLIO_DATA', payload: response.data });
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'portfolio-analyzed' });
        
        toast({
          title: "Success",
          description: "Portfolio analyzed successfully!",
        });
      }
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze portfolio. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const portfolioData = state.sessionData?.portfolioData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Analyzer</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            AI-Powered
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Get professional feedback on your portfolio website, personal branding, and online presence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analysis Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="portfolioUrl">Portfolio Website URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the URL of your portfolio, personal website, or professional landing page
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !portfolioUrl.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Portfolio...
                  </>
                ) : (
                  'Analyze Portfolio'
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What We Analyze:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Personal branding and messaging</li>
                  <li>• Design quality and user experience</li>
                  <li>• Project presentation and descriptions</li>
                  <li>• Technical skills demonstration</li>
                  <li>• Professional impact and credibility</li>
                  <li>• Mobile responsiveness and accessibility</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Example Portfolios */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Portfolio Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900">Essential Sections:</h4>
                  <ul className="text-sm text-slate-600 mt-2 space-y-1">
                    <li>• About/Introduction with clear value proposition</li>
                    <li>• Featured projects with live demos and code links</li>
                    <li>• Skills and technologies overview</li>
                    <li>• Contact information and social links</li>
                    <li>• Professional experience or testimonials</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900">Design Tips:</h4>
                  <ul className="text-sm text-slate-600 mt-2 space-y-1">
                    <li>• Clean, professional design with consistent branding</li>
                    <li>• Fast loading times and mobile optimization</li>
                    <li>• Clear navigation and intuitive user flow</li>
                    <li>• High-quality project screenshots or demos</li>
                    <li>• Professional photography and visual assets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          {portfolioData ? (
            <div className="space-y-6">
              {/* Portfolio Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Portfolio Overview
                    <a
                      href={portfolioData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">Site Title</h4>
                      <p className="text-slate-600">{portfolioData.title || 'No title detected'}</p>
                    </div>
                    
                    {portfolioData.description && (
                      <div>
                        <h4 className="font-semibold text-slate-900">Description</h4>
                        <p className="text-slate-600">{portfolioData.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-slate-900">URL</h4>
                      <a
                        href={portfolioData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {portfolioData.url}
                      </a>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900">Analyzed</h4>
                      <p className="text-slate-600 text-sm">
                        {new Date(portfolioData.analyzedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-line text-slate-700"
                      dangerouslySetInnerHTML={{ __html: portfolioData.insights }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Portfolio Analyzed Yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Enter your portfolio URL to get professional feedback and improvement suggestions.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-slate-900 mb-2">Sample Portfolio URLs:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Personal website (yourname.com)</li>
                    <li>• GitHub Pages site (username.github.io)</li>
                    <li>• Portfolio platforms (Behance, Dribbble)</li>
                    <li>• Professional landing pages</li>
                    <li>• Developer portfolios with project showcases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
