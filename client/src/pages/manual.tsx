import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, Plus, Trash2, BarChart3 } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SkillChart } from '@/components/charts/skill-chart';
import { SkillRadarChart } from '@/components/charts/radar-chart';

interface SkillFormData {
  skillName: string;
  yearsExperience: '0-1' | '1-2' | '2-3' | '3+';
  usageType: 'Personal Project' | 'Work Experience' | 'Open Source' | 'Learning';
  confidenceLevel: number;
}

export default function ManualPage() {
  const [formData, setFormData] = useState<SkillFormData>({
    skillName: '',
    yearsExperience: '0-1',
    usageType: 'Personal Project',
    confidenceLevel: 7,
  });
  const [isAdding, setIsAdding] = useState(false);
  
  const { state, dispatch } = useCareer();
  const { toast } = useToast();

  const handleAddSkill = async () => {
    if (!formData.skillName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill name",
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

    // Check for duplicate skills
    const existingSkills = state.sessionData?.manualSkills || [];
    const isDuplicate = existingSkills.some(
      skill => skill.skillName.toLowerCase() === formData.skillName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "This skill has already been added",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      const response = await careerAPI.addSkill({
        ...formData,
        sessionId: state.sessionId,
      });

      if (response.success && response.skills) {
        // Update session data with new skills
        const updatedSessionData = {
          ...state.sessionData,
          manualSkills: response.skills,
          insights: response.insights ? { skills: response.insights } : state.sessionData?.insights,
        };
        
        dispatch({ type: 'SET_SESSION_DATA', payload: updatedSessionData });

        // Check for achievements
        if (response.skills.length >= 3) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'skills-added' });
        }

        // Reset form
        setFormData({
          skillName: '',
          yearsExperience: '0-1',
          usageType: 'Personal Project',
          confidenceLevel: 7,
        });

        toast({
          title: "Success",
          description: "Skill added successfully!",
        });
      }
    } catch (error) {
      console.error('Add skill error:', error);
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const skills = state.sessionData?.manualSkills || [];
  const skillsInsights = state.sessionData?.insights?.skills;

  const getSkillColor = (proficiencyScore: number) => {
    if (proficiencyScore >= 80) return 'bg-emerald-500';
    if (proficiencyScore >= 60) return 'bg-blue-500';
    if (proficiencyScore >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getExperienceLabel = (years: string) => {
    const labels = {
      '0-1': '0-1 years',
      '1-2': '1-2 years',
      '2-3': '2-3 years',
      '3+': '3+ years',
    };
    return labels[years as keyof typeof labels];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Manual Skill Entry</h1>
          <Badge variant="secondary" className="bg-violet-100 text-violet-800">
            Step-by-Step
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Add your skills manually to get personalized learning roadmaps, project suggestions, and career guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Entry Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Skill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input
                    id="skillName"
                    placeholder="e.g., React"
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="yearsExperience">Years Experience</Label>
                  <Select
                    value={formData.yearsExperience}
                    onValueChange={(value: any) => setFormData({ ...formData, yearsExperience: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="3+">3+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="usageType">Usage Type</Label>
                  <Select
                    value={formData.usageType}
                    onValueChange={(value: any) => setFormData({ ...formData, usageType: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal Project">Personal Project</SelectItem>
                      <SelectItem value="Work Experience">Work Experience</SelectItem>
                      <SelectItem value="Open Source">Open Source</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="confidenceLevel">
                  Confidence Level: {formData.confidenceLevel}/10
                </Label>
                <div className="mt-2 px-2">
                  <Slider
                    value={[formData.confidenceLevel]}
                    onValueChange={(value) => setFormData({ ...formData, confidenceLevel: value[0] })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>

              <Button
                onClick={handleAddSkill}
                disabled={isAdding || !formData.skillName.trim()}
                className="w-full bg-accent hover:bg-emerald-700"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Skill...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skill
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Skills List */}
          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Skills ({skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900">{skill.skillName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getExperienceLabel(skill.yearsExperience)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {skill.usageType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {skill.proficiencyScore}/100
                          </div>
                          <div className="text-xs text-slate-500">
                            Confidence: {skill.confidenceLevel}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${getSkillColor(skill.proficiencyScore)}`}
                            style={{ width: `${skill.proficiencyScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-12 text-right">
                          {skill.proficiencyScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {skillsInsights && (
            <Card>
              <CardHeader>
                <CardTitle>AI Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="whitespace-pre-line text-slate-700"
                    dangerouslySetInnerHTML={{ __html: skillsInsights }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Sidebar */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Assessment Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900">How Scoring Works:</h4>
                  <p className="text-slate-600 mt-1">
                    Your proficiency score is calculated based on years of experience, usage type, and confidence level.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-slate-900">Usage Types:</h4>
                  <ul className="text-slate-600 mt-1 space-y-1">
                    <li>• <strong>Work Experience:</strong> Highest weight</li>
                    <li>• <strong>Open Source:</strong> High weight</li>
                    <li>• <strong>Personal Project:</strong> Medium weight</li>
                    <li>• <strong>Learning:</strong> Lower weight</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-slate-900">Pro Tips:</h4>
                  <ul className="text-slate-600 mt-1 space-y-1">
                    <li>• Be honest about your confidence level</li>
                    <li>• Include both technical and soft skills</li>
                    <li>• Add tools, frameworks, and languages</li>
                    <li>• Update as you gain more experience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State or Charts */}
          {skills.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Skills Added Yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Start by adding your first skill to see interactive charts and get AI recommendations.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-slate-900 mb-2">Popular Skills to Add:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'JavaScript', 'Python', 'Node.js', 'CSS', 'Git', 'SQL', 'Docker'].map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Skill Categories Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const categories = skills.reduce((acc, skill) => {
                      const name = skill.skillName.toLowerCase();
                      let category = 'Other';
                      
                      if (['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'].some(tech => name.includes(tech))) {
                        category = 'Frontend';
                      } else if (['node', 'python', 'java', 'go', 'rust', 'php', 'ruby'].some(tech => name.includes(tech))) {
                        category = 'Backend';
                      } else if (['docker', 'kubernetes', 'aws', 'azure', 'devops'].some(tech => name.includes(tech))) {
                        category = 'DevOps';
                      } else if (['sql', 'mongodb', 'redis', 'postgresql'].some(tech => name.includes(tech))) {
                        category = 'Database';
                      }
                      
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(skill);
                      return acc;
                    }, {} as Record<string, typeof skills>);

                    return (
                      <div className="space-y-3">
                        {Object.entries(categories).map(([category, categorySkills]) => (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700">{category}</span>
                              <span className="text-xs text-slate-500">{categorySkills.length} skills</span>
                            </div>
                            <div className="space-y-1">
                              {categorySkills.slice(0, 3).map((skill, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">{skill.skillName}</span>
                                  <span className="text-slate-500">{skill.proficiencyScore}</span>
                                </div>
                              ))}
                              {categorySkills.length > 3 && (
                                <div className="text-xs text-slate-500">
                                  +{categorySkills.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {skills.length > 0 && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkillChart />
          <SkillRadarChart />
        </div>
      )}
    </div>
  );
}
