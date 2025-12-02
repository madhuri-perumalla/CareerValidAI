import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileDown, Wand2, Eye, Download, User, Mail, Phone, MapPin, Plus, Trash2, Link, Award, BookOpen, Globe } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { generatePDF } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/use-toast';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface ProfessionalLinks {
  portfolio: string;
  linkedin: string;
  github: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa: string;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
}

interface Award {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

interface Language {
  language: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export default function BuilderPage() {
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [professionalLinks, setProfessionalLinks] = useState<ProfessionalLinks>({
    portfolio: '',
    linkedin: '',
    github: '',
  });
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [includeGithubData, setIncludeGithubData] = useState(true);
  const [includeSkillsData, setIncludeSkillsData] = useState(true);
  const [includePortfolioData, setIncludePortfolioData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { state, dispatch } = useCareer();
  const { toast } = useToast();

  // Helper functions for managing arrays
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', graduationYear: '', gpa: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '' }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addAward = () => {
    setAwards([...awards, { title: '', issuer: '', date: '', description: '' }]);
  };

  const updateAward = (index: number, field: keyof Award, value: string) => {
    const updated = [...awards];
    updated[index][field] = value;
    setAwards(updated);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: 'Conversational' }]);
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updated = [...languages];
    if (field === 'proficiency') {
      updated[index][field] = value as Language['proficiency'];
    } else {
      updated[index][field] = value;
    }
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleGenerateResume = async () => {
    if (!state.sessionId) {
      toast({
        title: "Error",
        description: "Session not initialized",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await careerAPI.buildResume({
        targetRole,
        additionalInfo: additionalInfo.trim() || undefined,
        contactInfo: Object.values(contactInfo).some(v => v.trim()) ? {
          ...contactInfo,
          email: contactInfo.email.trim() || undefined
        } : undefined,
        professionalLinks: Object.values(professionalLinks).some(v => v.trim()) ? professionalLinks : undefined,
        education: education.length > 0 ? education : undefined,
        certifications: certifications.length > 0 ? certifications : undefined,
        awards: awards.length > 0 ? awards : undefined,
        languages: languages.length > 0 ? languages : undefined,
        includeGithubData,
        includeSkillsData,
        includePortfolioData,
        sessionId: state.sessionId,
      });

      if (response.success && response.resume) {
        dispatch({ type: 'SET_BUILT_RESUME', payload: response.resume });
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'resume-generated' });
        
        // Check if user has completed everything for career explorer badge
        const hasGithub = !!state.sessionData?.githubData;
        const hasResume = !!state.sessionData?.resumeData;
        const hasSkills = (state.sessionData?.manualSkills?.length || 0) > 0;
        
        if (hasGithub && hasResume && hasSkills) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'career-explorer' });
        }
        
        setShowPreview(true);
        
        toast({
          title: "Success",
          description: "Resume generated successfully!",
        });
      }
    } catch (error) {
      console.error('Resume generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!state.builtResume?.html) {
      toast({
        title: "Error",
        description: "No resume to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = `${contactInfo.name || 'resume'}-${targetRole.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      await generatePDF(state.builtResume.html, fileName);
      
      toast({
        title: "Success",
        description: "Resume downloaded successfully!",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDataSummary = () => {
    const summary = {
      github: !!state.sessionData?.githubData,
      resume: !!state.sessionData?.resumeData,
      portfolio: !!state.sessionData?.portfolioData,
      skills: (state.sessionData?.manualSkills?.length || 0) > 0,
    };

    const availableData = Object.entries(summary).filter(([_, hasData]) => hasData);
    return {
      summary,
      availableCount: availableData.length,
      totalCount: Object.keys(summary).length,
    };
  };

  const dataSummary = getDataSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileDown className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Resume Builder</h1>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Auto-Generated
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Generate a professional resume automatically using your analyzed data and AI recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Available Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Data Sources:</span>
                  <span className="text-slate-600">
                    {dataSummary.availableCount}/{dataSummary.totalCount}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${
                    dataSummary.summary.github ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      dataSummary.summary.github ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    GitHub Analysis
                  </div>
                  
                  <div className={`flex items-center gap-2 text-sm ${
                    dataSummary.summary.resume ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      dataSummary.summary.resume ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    Resume Analysis
                  </div>
                  
                  <div className={`flex items-center gap-2 text-sm ${
                    dataSummary.summary.portfolio ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      dataSummary.summary.portfolio ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    Portfolio Analysis
                  </div>
                  
                  <div className={`flex items-center gap-2 text-sm ${
                    dataSummary.summary.skills ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      dataSummary.summary.skills ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    Manual Skills ({state.sessionData?.manualSkills?.length || 0})
                  </div>
                </div>

                {dataSummary.availableCount === 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      Add some data first to generate a comprehensive resume.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetRole">Target Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                    <SelectItem value="Full-Stack Developer">Full-Stack Developer</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="Mobile Developer">Mobile Developer</SelectItem>
                    <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Awards, certifications, notable achievements..."
                  rows={3}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="mt-2 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={contactInfo.location}
                    onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Professional Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={professionalLinks.portfolio}
                  onChange={(e) => setProfessionalLinks({ ...professionalLinks, portfolio: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={professionalLinks.linkedin}
                  onChange={(e) => setProfessionalLinks({ ...professionalLinks, linkedin: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={professionalLinks.github}
                  onChange={(e) => setProfessionalLinks({ ...professionalLinks, github: e.target.value })}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Include Analyzed Data */}
          <Card>
            <CardHeader>
              <CardTitle>Include Analyzed Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeGithub"
                  checked={includeGithubData}
                  onCheckedChange={(checked) => setIncludeGithubData(checked === true)}
                />
                <Label htmlFor="includeGithub" className="text-sm font-medium">
                  Include GitHub projects and analysis
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSkills"
                  checked={includeSkillsData}
                  onCheckedChange={(checked) => setIncludeSkillsData(checked === true)}
                />
                <Label htmlFor="includeSkills" className="text-sm font-medium">
                  Include skills assessment data
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePortfolio"
                  checked={includePortfolioData}
                  onCheckedChange={(checked) => setIncludePortfolioData(checked === true)}
                />
                <Label htmlFor="includePortfolio" className="text-sm font-medium">
                  Include portfolio analysis
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Education
                </CardTitle>
                <Button onClick={addEducation} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Education #{index + 1}</span>
                    <Button
                      onClick={() => removeEducation(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    />
                    <Input
                      placeholder="Graduation Year"
                      value={edu.graduationYear}
                      onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                    />
                  </div>
                  
                  <Input
                    placeholder="GPA (Optional)"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                  />
                </div>
              ))}
              
              {education.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No education entries added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
                <Button onClick={addCertification} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Certification #{index + 1}</span>
                    <Button
                      onClick={() => removeCertification(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Certification Name"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Issuer"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    />
                    <Input
                      placeholder="Issue Date"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                    />
                    <Input
                      placeholder="Expiry Date"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                    />
                  </div>
                  
                  <Input
                    placeholder="Credential ID (Optional)"
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                  />
                </div>
              ))}
              
              {certifications.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No certifications added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Awards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards
                </CardTitle>
                <Button onClick={addAward} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {awards.map((award, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Award #{index + 1}</span>
                    <Button
                      onClick={() => removeAward(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Award Title"
                      value={award.title}
                      onChange={(e) => updateAward(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Issuer"
                      value={award.issuer}
                      onChange={(e) => updateAward(index, 'issuer', e.target.value)}
                    />
                    <Input
                      placeholder="Date"
                      value={award.date}
                      onChange={(e) => updateAward(index, 'date', e.target.value)}
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Description (Optional)"
                    value={award.description}
                    onChange={(e) => updateAward(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
              
              {awards.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No awards added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </CardTitle>
                <Button onClick={addLanguage} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {languages.map((lang, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Language #{index + 1}</span>
                    <Button
                      onClick={() => removeLanguage(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Language"
                      value={lang.language}
                      onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    />
                    <Select 
                      value={lang.proficiency} 
                      onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Conversational">Conversational</SelectItem>
                        <SelectItem value="Fluent">Fluent</SelectItem>
                        <SelectItem value="Native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              {languages.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No languages added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateResume}
            disabled={isGenerating}
            className="w-full bg-violet-700 text-white hover:bg-violet-500"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate AI Resume
              </>
            )}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          {state.builtResume && showPreview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Resume Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      size="sm"
                      className="bg-primary hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-lg p-6 bg-white max-h-96 overflow-y-auto custom-scrollbar">
                  <div 
                    dangerouslySetInnerHTML={{ __html: state.builtResume.html }}
                    className="prose prose-sm max-w-none"
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900">Resume Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Target Role:</span>
                      <span className="ml-2 font-medium">{state.builtResume.targetRole}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Generated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(state.builtResume.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {state.builtResume.contactInfo?.name && (
                      <div>
                        <span className="text-slate-600">Contact:</span>
                        <span className="ml-2 font-medium">{state.builtResume.contactInfo.name}</span>
                      </div>
                    )}
                    {state.builtResume.additionalInfo && (
                      <div className="col-span-2">
                        <span className="text-slate-600">Additional Info:</span>
                        <p className="text-slate-700 mt-1">{state.builtResume.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <FileDown className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    AI-Powered Resume Generator
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Our AI will create a professional resume tailored to your target role using your GitHub data, 
                    skills, and analysis results.
                  </p>
                  
                  <div className="bg-slate-50 rounded-lg p-6 text-left">
                    <h4 className="font-semibold text-slate-900 mb-3">What's Included:</h4>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        Professional summary tailored to your target role
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        Technical skills organized by category
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        Project highlights from your GitHub analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        Experience summary based on your data
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        ATS-friendly formatting for job applications
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        PDF download for easy sharing
                      </li>
                    </ul>
                  </div>

                  {dataSummary.availableCount === 0 && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        💡 Add GitHub analysis, upload a resume, or enter skills to create a more comprehensive resume.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
