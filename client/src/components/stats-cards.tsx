import { BarChart3, Zap, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCareer } from '@/store/career-store';

export function StatsCards() {
  const { state } = useCareer();
  
  const stats = [
    {
      title: 'GitHub Repos',
      value: state.sessionData?.githubData?.stats.totalRepos || 0,
      icon: BarChart3,
      color: 'bg-blue-100 text-primary',
    },
    {
      title: 'Skills Detected',
      value: (state.sessionData?.manualSkills?.length || 0) + 
             (state.sessionData?.githubData?.languageStats?.length || 0),
      icon: Zap,
      color: 'bg-emerald-300 text-accent',
    },
    {
      title: 'Resume Score',
      value: state.sessionData?.resumeData?.score ? `${state.sessionData.resumeData.score}/100` : 'N/A',
      icon: CheckCircle,
      color: 'bg-violet-300 text-secondary',
    },
    {
      title: 'Role Match',
      value: state.sessionData?.githubData ? '78%' : 'N/A',
      icon: Star,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
