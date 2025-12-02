import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCareer } from '@/store/career-store';

export function SkillChart() {
  const { state } = useCareer();
  
  const skillData = (state.sessionData?.manualSkills || []).map(skill => ({
    name: skill.skillName,
    score: skill.proficiencyScore,
    years: skill.yearsExperience,
    type: skill.usageType,
  }));

  if (skillData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Proficiency Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Add skills to see your proficiency chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Proficiency Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                domain={[0, 100]}
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value}/100`,
                  'Proficiency Score'
                ]}
                labelFormatter={(label: string, payload: any) => {
                  const data = payload?.[0]?.payload;
                  return data ? `${label} (${data.years}, ${data.type})` : label;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="score" 
                fill="hsl(207, 90%, 54%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
