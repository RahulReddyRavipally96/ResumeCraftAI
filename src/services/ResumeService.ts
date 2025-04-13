// This service will handle communication with the Python backend

export interface ResumeGenerationRequest {
  jobTitle: string;
  jobDescription: string;
  education: any[];
  workExperience: any[];
  skills: string[];
  previousResumes?: any[];
  existingResumeFormat?: string; // Added to support custom formatting based on uploaded resume
}

export interface ResumeGenerationResponse {
  resume: string;
  coverLetter: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  education: any[];
  workExperiences: any[];
  skills: string[];
  resumes: any[];
  coverLetters: any[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface WorkExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  bullets?: string[];
}

export interface ResumeDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  format?: string; // To store the format preference
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatHistory {
  id: string;
  jobTitle: string;
  timestamp: string;
  messages: ChatMessage[];
}

export interface AIConversation {
  jobTitle: string;
  lastUpdated: string;
  messages: ChatMessage[];
}

export interface AIConversationSummary {
  id: string;
  jobTitle: string;
  lastUpdated: string;
  messageCount: number;
}

// Helper function to generate mock resume (used as fallback when API is unavailable)
const generateMockResume = (data: ResumeGenerationRequest): ResumeGenerationResponse => {
  const { jobTitle, jobDescription, education, workExperience, skills } = data;
  
  // Format education entries
  let educationSection = "No formal education listed.";
  if (education && education.length > 0) {
    educationSection = education.map(edu => 
      `### ${edu.degree} in ${edu.field}\n${edu.institution}\n${edu.startDate} - ${edu.endDate || 'Present'}\n`
    ).join('\n');
  }
  
  // Format experience entries
  let experienceSection = "No previous work experience.";
  if (workExperience && workExperience.length > 0) {
    experienceSection = workExperience.map(exp => 
      `### ${exp.position} at ${exp.company}\n${exp.startDate} - ${exp.endDate || 'Present'}\n${exp.description || ''}\n${
        exp.bullets ? exp.bullets.map(bullet => `- ${bullet}`).join('\n') : ''
      }`
    ).join('\n\n');
  }
  
  // Generate resume content
  const resumeContent = `# ${jobTitle.toUpperCase()} RESUME

## PROFESSIONAL SUMMARY
Experienced professional seeking a ${jobTitle} position.
${jobDescription.substring(0, 150)}...

## WORK EXPERIENCE
${experienceSection}

## EDUCATION
${educationSection}

## SKILLS
${skills ? skills.join(', ') : 'No skills listed.'}
`;

  // Generate cover letter
  const coverLetterContent = `Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at your company.

${jobDescription.substring(0, 100)}...

I believe my experience and skills make me an excellent candidate for this role.

Sincerely,
[Your Name]
`;

  return {
    resume: resumeContent,
    coverLetter: coverLetterContent
  };
};

export const ResumeService = {
  generateResume: async (data: ResumeGenerationRequest): Promise<ResumeGenerationResponse> => {
    console.log("Sending data to resume generator:", data);
    
    try {
      // Clean up the data before sending to avoid undefined values
      const cleanData = {
        ...data,
        existingResumeFormat: data.existingResumeFormat || null,
        previousResumes: data.previousResumes || []
      };
      
      const response = await fetch('http://localhost:5000/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Resume generation successful:", result);
      return result;
    } catch (error) {
      console.error("Error generating resume:", error);
      
      // Fallback to local generation when API fails
      console.log("Using fallback local resume generation");
      return generateMockResume(data);
    }
  },
  
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      console.log("Fetching user profile from backend");
      const response = await fetch('http://localhost:5000/api/profile');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received user profile:", data);
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },
  
  updateUserProfile: async (profileData: Partial<UserProfile>) => {
    try {
      console.log("Updating user profile with data:", profileData);
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, message: "Failed to update profile" };
    }
  },
  
  updateEducation: async (educationId: string, educationData: Partial<EducationEntry>) => {
    try {
      console.log("Updating education entry through profile update:", educationId, educationData);
      
      // First, get the current user profile
      const profileResponse = await fetch('http://localhost:5000/api/profile');
      
      if (!profileResponse.ok) {
        throw new Error(`API error: ${profileResponse.status}`);
      }
      
      const userProfile = await profileResponse.json();
      
      // Find and update the education entry in the profile data
      const updatedEducation = userProfile.education.map(edu => 
        edu.id === educationId ? { ...edu, ...educationData } : edu
      );
      
      // Update the entire profile with the modified education array
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userProfile,
          education: updatedEducation
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Education updated through profile update:", result);
      return result;
    } catch (error) {
      console.error("Error updating education entry:", error);
      throw error;
    }
  },
  
  updateEducationDirect: async (educationId: string, educationData: Partial<EducationEntry>) => {
    try {
      console.log("Directly updating education entry:", educationId, educationData);
      
      const response = await fetch(`http://localhost:5000/api/profile/education/${educationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationData),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Education updated directly:", result);
      return result;
    } catch (error) {
      console.error("Error directly updating education entry:", error);
      throw error;
    }
  },
  
  updateWorkExperience: async (experienceId: string, experienceData: Partial<WorkExperienceEntry>) => {
    try {
      console.log("Updating work experience entry:", experienceId, experienceData);
      
      // First, get the current user profile
      const profileResponse = await fetch('http://localhost:5000/api/profile');
      
      if (!profileResponse.ok) {
        throw new Error(`API error: ${profileResponse.status}`);
      }
      
      const userProfile = await profileResponse.json();
      
      // Find and update the work experience entry in the profile data
      const updatedExperiences = userProfile.workExperiences.map(exp => 
        exp.id === experienceId ? { ...exp, ...experienceData } : exp
      );
      
      // Update the entire profile with the modified work experiences array
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userProfile,
          workExperiences: updatedExperiences
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating work experience entry:", error);
      throw error;
    }
  },
  
  updateWorkExperienceDirect: async (experienceId: string, experienceData: Partial<WorkExperienceEntry>) => {
    try {
      console.log("Directly updating work experience entry:", experienceId, experienceData);
      
      // For now, just use the general update method since we don't have a specific endpoint
      return await ResumeService.updateWorkExperience(experienceId, experienceData);
    } catch (error) {
      console.error("Error directly updating work experience entry:", error);
      throw error;
    }
  },
  
  downloadDocument: async (content: string, fileName: string, format: 'pdf' | 'docx'): Promise<boolean> => {
    try {
      console.log(`Downloading document as ${format}:`, fileName);
      
      // For development without backend, create a simple text file download
      if (!content) {
        throw new Error("No content to download");
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/document/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            fileName,
            format
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Get blob from response
        const blob = await response.blob();
        
        // Create a download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      } catch (error) {
        console.error("Backend download failed, using fallback method");
        
        // Fallback: Create a simple text file download if the backend is unavailable
        const blob = new Blob([content], { type: 'text/plain' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${fileName}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      }
    } catch (error) {
      console.error(`Error downloading document as ${format}:`, error);
      return false;
    }
  },
  
  uploadResume: async (file: File): Promise<{filename: string, path: string}> => {
    try {
      console.log("Uploading resume file:", file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Resume uploaded successfully:", result);
      return {
        filename: result.filename,
        path: result.path
      };
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  },
  
  saveChatHistory: async (chatMessages: ChatMessage[], jobTitle: string): Promise<string> => {
    try {
      console.log("Saving chat history for job:", jobTitle);
      
      const response = await fetch('http://localhost:5000/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatMessages,
          jobTitle
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Chat history saved successfully:", result);
      return result.chatId;
    } catch (error) {
      console.error("Error saving chat history:", error);
      throw error;
    }
  },
  
  getChatHistory: async (): Promise<ChatHistory[]> => {
    try {
      console.log("Fetching chat history");
      
      const response = await fetch('http://localhost:5000/api/chat/history');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Retrieved ${result.length} chat histories`);
      return result;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  },
  
  saveAIConversation: async (conversationId: string | null, jobTitle: string, messages: ChatMessage[]): Promise<string> => {
    try {
      console.log("Saving AI conversation for job:", jobTitle);
      
      const response = await fetch('http://localhost:5000/api/ai-conversation/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          jobTitle,
          messages
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("AI conversation saved successfully:", result);
      return result.conversationId;
    } catch (error) {
      console.error("Error saving AI conversation:", error);
      throw error;
    }
  },
  
  getAIConversation: async (conversationId: string): Promise<AIConversation> => {
    try {
      console.log("Fetching AI conversation:", conversationId);
      
      const response = await fetch(`http://localhost:5000/api/ai-conversation/${conversationId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Retrieved AI conversation:", result);
      return result;
    } catch (error) {
      console.error("Error fetching AI conversation:", error);
      throw error;
    }
  },
  
  listAIConversations: async (): Promise<AIConversationSummary[]> => {
    try {
      console.log("Listing AI conversations");
      
      const response = await fetch('http://localhost:5000/api/ai-conversation/list');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Retrieved ${result.length} AI conversations`);
      return result;
    } catch (error) {
      console.error("Error listing AI conversations:", error);
      return [];
    }
  },

  getAIChatReply: async (messages: ChatMessage[]): Promise<string> => {
    try {
      const response = await fetch("http://localhost:5000/api/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "Sorry, I didn't quite get that.";
    } catch (error) {
      console.error("Error in getAIChatReply:", error);
      return "Sorry, something went wrong while generating a response.";
    }
  }
};