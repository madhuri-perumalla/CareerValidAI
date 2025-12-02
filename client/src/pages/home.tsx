import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCards } from '@/components/stats-cards';
import { useCareer } from '@/store/career-store';
import { Link } from 'wouter';
import { Github, FileText, Globe, Zap, BarChart3, FileDown } from 'lucide-react';

export default function Home() {
  const { state } = useCareer();

  const features = [
    {
      icon: Github,
      title: 'GitHub Analyzer',
      description: 'Analyze your repositories, languages, and contribution patterns with AI insights.',
      href: '/github',
      color: 'text-white',
      bgColor: 'bg-pink-700',
      backgroundColor: 'bg-pink-50',
    },
    {
      icon: FileText,
      title: 'Resume Analyzer',
      description: 'Upload and get AI-powered feedback on your resume with scoring and improvements.',
      href: '/resume',
      color: 'text-white',
      bgColor: 'bg-emerald-700',
      backgroundColor:'bg-gradient-to-br from-emerald-50 to-emerald-100',
      border : 'bg-emerald-700',
    },
    {
      icon: Globe,
      title: 'Portfolio Review',
      description: 'Get professional feedback on your portfolio website and personal branding.',
      href: '/portfolio',
      color: 'text-white',
      bgColor: 'bg-blue-700',
      backgroundColor : 'bg-blue-50',
    },
    {
      icon: Zap,
      title: 'Skill Assessment',
      description: 'Manually add skills and get personalized learning roadmaps and project ideas.',
      href: '/manual',
      color: 'text-white',
      bgColor: 'bg-violet-700',
      backgroundColor : 'bg-violet-50',
    },
    {
      icon: BarChart3,
      title: 'Visual Insights',
      description: 'Interactive charts and role matching based on your complete profile analysis.',
      href: '/insights',
      color: 'text-white',
      bgColor: 'bg-slate-700',
      backgroundColor : 'bg-slate-100' ,
    },
    {
      icon: FileDown,
      title: 'Resume Builder',
      description: 'Generate professional resumes automatically using AI and your analyzed data.',
      href: '/builder',
      color: 'text-white',
      bgColor: 'bg-amber-700',
      backgroundColor : 'bg-amber-50 ',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Unlock Your <span className="text-primary">Developer Potential</span>
              <br className="hidden sm:block" />
              with AI-Powered Insights
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Analyze your GitHub profile, optimize your resume, and get personalized career recommendations. 
              No login required — your data stays private and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/github">
                <Button size="lg" className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                  Start Analysis
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="outline" size="lg" className="border border-slate-300 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Cards */}
        {state.sessionData && <StatsCards />}

        {/* Features Grid */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Career Development Platform
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From analysis to actionable insights, everything you need to advance your developer career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href}>
                <Card className={`h-full hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 ${feature.backgroundColor} ${feature.border}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                          <Icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 ml-3">
                          {feature.title}
                        </h3>
                      </div>
                      <p className= "text-slate-600 leading-relaxed ">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

 


        {/* Privacy Section */}
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            🔒 Privacy & Security First
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">No Login Required</h4>
              <p className="text-slate-600 text-sm">
                Start analyzing immediately without creating accounts or sharing personal information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Temporary Storage</h4>
              <p className="text-slate-600 text-sm">
                Your data is processed temporarily and can be exported or deleted at any time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Client-Side Processing</h4>
              <p className="text-slate-600 text-sm">
                Resume parsing and sensitive operations happen on your device for maximum privacy.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
