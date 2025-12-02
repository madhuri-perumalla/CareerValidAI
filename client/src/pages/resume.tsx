import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, Upload, CheckCircle } from 'lucide-react';
import { useCareer } from '@/store/career-store';
import { careerAPI } from '@/lib/api';
import { parseFile, validateFile } from '@/lib/file-parser';
import { useToast } from '@/hooks/use-toast';

export default function ResumePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { state, dispatch } = useCareer();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
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
      const fileContent = await parseFile(file);
      
      const response = await careerAPI.analyzeResume({
        fileContent,
        fileName: file.name,
        fileType: file.type.includes('pdf') ? 'pdf' : 'docx',
        sessionId: state.sessionId,
      });

      if (response.success) {
        dispatch({ type: 'UPDATE_RESUME_DATA', payload: response.data });
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'resume-uploaded' });
        
        toast({
          title: "Success",
          description: "Resume analyzed successfully!",
        });
      }
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const resumeData = state.sessionData?.resumeData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Resume Analyzer</h1>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Secure
          </Badge>
        </div>
        <p className="text-lg text-slate-600">
          Upload your resume for AI-powered analysis, scoring, and personalized improvement recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium text-slate-900 mb-2">Analyzing Resume...</p>
                    <p className="text-sm text-slate-600">This may take a few moments</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-900 mb-2">Upload Your Resume</p>
                    <p className="text-sm text-slate-600 mb-4">
                      PDF, DOCX supported. Client-side parsing for privacy.
                    </p>
                    <Button onClick={openFileDialog} className="bg-primary hover:bg-blue-700">
                      Choose File
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      Or drag and drop your file here
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Supports PDF and DOCX formats</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Maximum file size: 10MB</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Client-side processing for privacy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          {resumeData ? (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">
                        {resumeData.score}/100
                      </div>
                      <p className="text-sm font-medium text-slate-600">Resume Score</p>
                      <Progress value={resumeData.score} className="mt-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {resumeData.score > 80 ? 'A' : resumeData.score > 60 ? 'B' : 'C'}
                      </div>
                      <p className="text-sm font-medium text-slate-600">Grade</p>
                      <div className={`mt-3 px-2 py-1 rounded text-xs font-medium ${
                        resumeData.score > 80 
                          ? 'bg-emerald-100 text-emerald-800'
                          : resumeData.score > 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {resumeData.score > 80 ? 'Excellent' : resumeData.score > 60 ? 'Good' : 'Needs Work'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-line text-slate-700"
                      dangerouslySetInnerHTML={{ __html: resumeData.insights }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">File Name:</span>
                      <span className="font-medium">{resumeData.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">File Type:</span>
                      <span className="font-medium uppercase">{resumeData.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Analyzed:</span>
                      <span className="font-medium">
                        {new Date(resumeData.analyzedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Resume Analyzed Yet
                </h3>
                <p className="text-slate-600">
                  Upload your resume to get started with AI-powered analysis and recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
