import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCareer } from '@/store/career-store';

const COLORS = [
  'hsl(207, 90%, 54%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
  'hsl(166, 100%, 37%)',
  'hsl(31, 100%, 50%)',
  'hsl(210, 100%, 66%)',
];

export function LanguageChart() {
  const { state } = useCareer();
  
  const languageData = state.sessionData?.githubData?.languageStats?.slice(0, 8) || [];

  if (languageData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Analyze your GitHub profile to see language distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = languageData.map((lang) => ({
    name: lang.language,
    value: lang.percentage,
    color: COLORS[languageData.indexOf(lang) % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                fontSize={12}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Usage']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
