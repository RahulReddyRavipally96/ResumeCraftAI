import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download, Upload, ThumbsUp, ThumbsDown, RefreshCw, Clipboard, MessageSquare, FileUp, Edit, Check, X } from 'lucide-react';
import { ResumeService, ResumeGenerationRequest, ChatMessage } from '@/services/ResumeService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ResumeGeneratorTab = ({ onComplete }) => {
  const { user, addResume, addCoverLetter } = useAuth();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [uploadedResumeFileName, setUploadedResumeFileName] = useState('');
  const [uploadedResumePath, setUploadedResumePath] = useState('');
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [generatedContent, setGeneratedContent] = useState<{
    resume: string | null;
    coverLetter: string | null;
  }>({ resume: null, coverLetter: null });

  const [editedContent, setEditedContent] = useState<{
    resume: string | null;
    coverLetter: string | null;
  }>({ resume: null, coverLetter: null });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedResumeFileName(file.name);
    
    try {
      const result = await ResumeService.uploadResume(file);
      setUploadedResumePath(result.path);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedResume(content);
        toast({
          title: "Resume uploaded and saved",
          description: `${file.name} has been uploaded to server and saved successfully.`
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Failed to upload resume:", error);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedResume(content);
        toast({
          title: "Resume uploaded locally",
          description: `${file.name} couldn't be saved to server, but is available for this session.`,
          variant: "destructive"
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both job title and job description",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const generationRequest: ResumeGenerationRequest = {
        jobTitle,
        jobDescription,
        education: user?.education || [],
        workExperience: user?.workExperiences || [],
        skills: user?.skills || [],
        previousResumes: user?.resumes || [],
        existingResumeFormat: uploadedResume || undefined
      };
      
      const response = await ResumeService.generateResume(generationRequest);
      
      setGeneratedContent({
        resume: response.resume,
        coverLetter: response.coverLetter
      });
      
      setEditedContent({
        resume: response.resume,
        coverLetter: response.coverLetter
      });
      
      toast({
        title: "Generation complete",
        description: "Your resume and cover letter have been generated successfully."
      });
    } catch (error) {
      console.error("Error generating resume:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (editedContent.resume) {
      addResume({
        title: `Resume for ${jobTitle}`,
        content: editedContent.resume
      });
    }
    
    if (editedContent.coverLetter) {
      addCoverLetter({
        title: `Cover Letter for ${jobTitle}`,
        content: editedContent.coverLetter
      });
    }
    
    if (chatMessages.length > 0) {
      try {
        setIsSavingChat(true);
        
        const chatId = await ResumeService.saveChatHistory(chatMessages, jobTitle);
        
        const convId = await ResumeService.saveAIConversation(
          conversationId,
          jobTitle,
          chatMessages
        );
        
        setConversationId(convId);
        
        toast({
          title: "Chat history saved",
          description: "Your conversation with the AI assistant has been saved."
        });
      } catch (error) {
        console.error("Failed to save chat history:", error);
        toast({
          title: "Chat save failed",
          description: "Your chat history couldn't be saved to the server.",
          variant: "destructive"
        });
      } finally {
        setIsSavingChat(false);
      }
    }
    
    toast({
      title: "Documents saved",
      description: "Your resume and cover letter have been saved to your profile."
    });
    
    onComplete();
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard."
    });
  };

  const handleDownload = async (content, fileName, format) => {
    try {
      const success = await ResumeService.downloadDocument(content, fileName, format);
      if (success) {
        toast({
          title: `${format.toUpperCase()} downloaded`,
          description: `Your ${fileName} has been downloaded successfully.`
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your document.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
  
    const timestamp = new Date().toISOString();
  
    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'user' as const, content: messageInput, timestamp }
    ];
    setChatMessages(newMessages);
    setMessageInput('');
  
    try {
      const reply = await ResumeService.getAIChatReply(newMessages);
  
      const updatedMessages: ChatMessage[] = [
        ...newMessages,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString()
        }
      ];
      setChatMessages(updatedMessages);
  
      if (conversationId || updatedMessages.length > 1) {
        const id = await ResumeService.saveAIConversation(
          conversationId,
          jobTitle || "Untitled Job",
          updatedMessages
        );
        if (!conversationId) setConversationId(id);
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat && chatMessages.length === 0) {
      const initialMessage = { 
        role: 'assistant' as const, 
        content: 'How would you like to improve the generated documents? I can help with formatting, wording, or emphasizing different aspects of your experience.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages([initialMessage]);
      
      if (jobTitle) {
        ResumeService.saveAIConversation(
          null,
          jobTitle,
          [initialMessage]
        ).then(id => {
          setConversationId(id);
        }).catch(error => {
          console.error("Failed to save initial AI conversation:", error);
        });
      }
    }
  };

  const toggleEditResume = () => {
    setIsEditingResume(!isEditingResume);
  };
  
  const toggleEditCoverLetter = () => {
    setIsEditingCoverLetter(!isEditingCoverLetter);
  };
  
  const saveEditedResume = () => {
    setIsEditingResume(false);
  };
  
  const saveEditedCoverLetter = () => {
    setIsEditingCoverLetter(false);
  };
  
  const cancelEditResume = () => {
    setEditedContent({...editedContent, resume: generatedContent.resume});
    setIsEditingResume(false);
  };
  
  const cancelEditCoverLetter = () => {
    setEditedContent({...editedContent, coverLetter: generatedContent.coverLetter});
    setIsEditingCoverLetter(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Resume & Cover Letter</CardTitle>
          <CardDescription>
            Enter job details to create customized application documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="form-group">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer, Project Manager"
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="existingResume">Upload Existing Resume</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="existingResume"
                  type="file"
                  ref={resumeFileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.doc,.docx,.pdf"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => resumeFileInputRef.current?.click()}
                  className="w-full flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  {uploadedResumeFileName || "Select a file"}
                </Button>
                {uploadedResumeFileName && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setUploadedResume(null);
                      setUploadedResumeFileName('');
                      if (resumeFileInputRef.current) {
                        resumeFileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload your existing resume to use its additional information for the generated resume
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-resume-primary hover:bg-resume-dark"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Resume & Cover Letter
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Resume Generation Tips</h3>
            <ul className="text-sm text-gray-700 space-y-2 pl-5 list-disc">
              <li>Paste the complete job description for better results</li>
              <li>The system will match your profile with job requirements</li>
              <li>Add detailed work experiences in your profile for better matching</li>
              <li>Include diverse skills in your profile to showcase your versatility</li>
              <li>Upload an existing resume to ensure the generated resue cover all details</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {!generatedContent.resume && !generatedContent.coverLetter ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-resume-light flex items-center justify-center mb-4">
                <FileText size={32} className="text-resume-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Generated Yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Fill out the job details and click "Generate" to create your custom resume and cover letter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Generated Resume</CardTitle>
                  <div className="flex gap-2">
                    {isEditingResume ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={saveEditedResume}
                          className="text-green-600"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={cancelEditResume}
                          className="text-red-600"
                        >
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopyToClipboard(editedContent.resume)}
                        >
                          <Clipboard size={16} />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Download size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownload(editedContent.resume, `Resume_${jobTitle}`, 'pdf')}
                                className="justify-start"
                              >
                                Download as PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownload(editedContent.resume, `Resume_${jobTitle}`, 'docx')}
                                className="justify-start"
                              >
                                Download as Word
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={toggleEditResume}
                        >
                          <Edit size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isEditingResume ? (
                  <Textarea
                    value={editedContent.resume || ''}
                    onChange={(e) => setEditedContent({...editedContent, resume: e.target.value})}
                    className="h-[250px] font-mono text-sm"
                  />
                ) : (
                  <ScrollArea className="h-[250px] border rounded-md p-4 bg-gray-50">
                    <div className="whitespace-pre-line font-mono text-sm">
                      {editedContent.resume}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp size={14} className="mr-1" /> Good
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown size={14} className="mr-1" /> Needs Work
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw size={14} />
                  <span>Regenerate</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Generated Cover Letter</CardTitle>
                  <div className="flex gap-2">
                    {isEditingCoverLetter ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={saveEditedCoverLetter}
                          className="text-green-600"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={cancelEditCoverLetter}
                          className="text-red-600"
                        >
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopyToClipboard(editedContent.coverLetter)}
                        >
                          <Clipboard size={16} />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Download size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownload(editedContent.coverLetter, `CoverLetter_${jobTitle}`, 'pdf')}
                                className="justify-start"
                              >
                                Download as PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownload(editedContent.coverLetter, `CoverLetter_${jobTitle}`, 'docx')}
                                className="justify-start"
                              >
                                Download as Word
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={toggleEditCoverLetter}
                        >
                          <Edit size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isEditingCoverLetter ? (
                  <Textarea
                    value={editedContent.coverLetter || ''}
                    onChange={(e) => setEditedContent({...editedContent, coverLetter: e.target.value})}
                    className="h-[250px] font-mono text-sm"
                  />
                ) : (
                  <ScrollArea className="h-[250px] border rounded-md p-4 bg-gray-50">
                    <div className="whitespace-pre-line font-mono text-sm">
                      {editedContent.coverLetter}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp size={14} className="mr-1" /> Good
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown size={14} className="mr-1" /> Needs Work
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw size={14} />
                  <span>Regenerate</span>
                </Button>
              </CardFooter>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                onClick={toggleChat}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? "Hide Chat" : "Chat with AI"}
              </Button>
              
              <Button 
                onClick={handleSave}
                className="bg-resume-primary hover:bg-resume-dark"
              >
                <Upload className="mr-2 h-4 w-4" />
                Save to My Documents
              </Button>
            </div>
            
            {showChat && (
              <Card>
                <CardHeader>
                  <CardTitle>Chat with AI Assistant</CardTitle>
                  <CardDescription>
                    Request changes to your generated documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] border rounded-md p-4 bg-gray-50 mb-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user' 
                              ? 'bg-resume-primary text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your request or feedback..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeGeneratorTab;