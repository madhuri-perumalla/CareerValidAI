import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCareer } from '@/store/career-store';

export function SkillRadarChart() {
  const { state } = useCareer();
  
  // Categorize skills into different areas
  const categorizeSkills = () => {
    const skills = state.sessionData?.manualSkills || [];
    const githubLanguages = state.sessionData?.githubData?.languageStats || [];
    
    const categories = {
      Frontend: 0,
      Backend: 0,
      DevOps: 0,
      Database: 0,
      Mobile: 0,
      'Data Science': 0,
    };

    // Categorize manual skills
    skills.forEach(skill => {
      const skillName = skill.skillName.toLowerCase();
      if (['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'].some(tech => skillName.includes(tech))) {
        categories.Frontend = Math.max(categories.Frontend, skill.proficiencyScore);
      } else if (['node', 'python', 'java', 'go', 'rust', 'php', 'ruby'].some(tech => skillName.includes(tech))) {
        categories.Backend = Math.max(categories.Backend, skill.proficiencyScore);
      } else if (['docker', 'kubernetes', 'aws', 'azure', 'devops', 'ci/cd'].some(tech => skillName.includes(tech))) {
        categories.DevOps = Math.max(categories.DevOps, skill.proficiencyScore);
      } else if (['sql', 'mongodb', 'redis', 'postgresql', 'mysql'].some(tech => skillName.includes(tech))) {
        categories.Database = Math.max(categories.Database, skill.proficiencyScore);
      } else if (['react native', 'flutter', 'swift', 'kotlin', 'mobile'].some(tech => skillName.includes(tech))) {
        categories.Mobile = Math.max(categories.Mobile, skill.proficiencyScore);
      } else if (['machine learning', 'data science', 'pandas', 'numpy', 'tensorflow'].some(tech => skillName.includes(tech))) {
        categories['Data Science'] = Math.max(categories['Data Science'], skill.proficiencyScore);
      }
    });

    // Add GitHub language data
    githubLanguages.forEach(lang => {
      const langName = lang.language.toLowerCase();
      const score = Math.min(100, lang.percentage * 2); // Scale percentage to score
      
      if (['javascript', 'typescript', 'html', 'css', 'vue', 'svelte'].includes(langName)) {
        categories.Frontend = Math.max(categories.Frontend, score);
      } else if (['python', 'java', 'go', 'rust', 'php', 'ruby', 'c++', 'c#'].includes(langName)) {
        categories.Backend = Math.max(categories.Backend, score);
      } else if (['dockerfile', 'shell', 'makefile'].includes(langName)) {
        categories.DevOps = Math.max(categories.DevOps, score);
      } else if (['sql', 'plpgsql'].includes(langName)) {
        categories.Database = Math.max(categories.Database, score);
      } else if (['swift', 'kotlin', 'dart'].includes(langName)) {
        categories.Mobile = Math.max(categories.Mobile, score);
      } else if (['jupyter notebook', 'r'].includes(langName)) {
        categories['Data Science'] = Math.max(categories['Data Science'], score);
      }
    });

    return Object.entries(categories).map(([category, score]) => ({
      category,
      score: Math.round(score),
    }));
  };

  const radarData = categorizeSkills();
  const hasData = radarData.some(item => item.score > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🕸️</div>
              <p>Add skills or analyze GitHub to see skill radar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="category" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                fontSize={10}
                tick={{ fill: '#64748b' }}
              />
              <Radar
                name="Skills"
                dataKey="score"
                stroke="hsl(207, 90%, 54%)"
                fill="hsl(207, 90%, 54%)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
