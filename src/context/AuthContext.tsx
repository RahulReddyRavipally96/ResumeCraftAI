import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ResumeService, UserProfile } from '@/services/ResumeService';

type User = {
  username: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  education: Education[];
  workExperiences: WorkExperience[];
  skills: string[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type WorkExperience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
};

export type Resume = {
  id: string;
  title: string;
  createdAt: string;
  content: string;
};

export type CoverLetter = {
  id: string;
  title: string;
  createdAt: string;
  content: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  addEducation: (education: Omit<Education, 'id'>) => void;
  updateEducation: (education: Education) => void;
  removeEducation: (id: string) => void;
  addWorkExperience: (experience: Omit<WorkExperience, 'id'>) => void;
  updateWorkExperience: (experience: WorkExperience) => void;
  removeWorkExperience: (id: string) => void;
  addResume: (resume: Omit<Resume, 'id' | 'createdAt'>) => void;
  addCoverLetter: (coverLetter: Omit<CoverLetter, 'id' | 'createdAt'>) => void;
  removeResume: (id: string) => void;
  removeCoverLetter: (id: string) => void;
  updateSkills: (skills: string[]) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      
      ResumeService.updateUserProfile(user)
        .then(response => {
          console.log("Profile synced with backend:", response);
        })
        .catch(error => {
          console.error("Failed to sync profile with backend:", error);
        });
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(async () => {
        if (username === 'user001' && password === 'pass001') {
          setLoading(true);
          
          try {
            const backendProfile = await ResumeService.getUserProfile();
            
            if (backendProfile) {
              const newUser: User = {
                username: 'user001',
                name: backendProfile.name || '',
                email: backendProfile.email || '',
                phone: backendProfile.phone || '',
                linkedin: backendProfile.linkedin || '',
                education: backendProfile.education || [],
                workExperiences: backendProfile.workExperiences || [],
                skills: backendProfile.skills || [],
                resumes: backendProfile.resumes || [],
                coverLetters: backendProfile.coverLetters || []
              };
              
              setUser(newUser);
              localStorage.setItem('user', JSON.stringify(newUser));
              
              toast({
                title: "Login successful",
                description: "Welcome back! Your profile has been loaded.",
              });
            } else {
              const newUser: User = {
                username: 'user001',
                name: '',
                email: '',
                phone: '',
                linkedin: '',
                education: [],
                workExperiences: [],
                skills: [],
                resumes: [],
                coverLetters: []
              };
              
              setUser(newUser);
              localStorage.setItem('user', JSON.stringify(newUser));
              
              toast({
                title: "Login successful",
                description: "Welcome! Please complete your profile.",
              });
            }
          } catch (error) {
            console.error("Error fetching profile on login:", error);
            
            const newUser: User = {
              username: 'user001',
              name: '',
              email: '',
              phone: '',
              linkedin: '',
              education: [],
              workExperiences: [],
              skills: [],
              resumes: [],
              coverLetters: []
            };
            
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            
            toast({
              title: "Login successful",
              description: "Welcome! (Profile data could not be loaded)",
            });
          }
          
          setLoading(false);
          resolve(true);
        } else {
          toast({
            title: "Login failed",
            description: "Incorrect username or password",
            variant: "destructive",
          });
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(response => {
          if (response.success !== false) {
            toast({
              title: "Profile updated",
              description: "Your profile has been updated successfully",
            });
          } else {
            toast({
              title: "Warning",
              description: "Profile updated locally, but failed to sync with server",
              variant: "destructive",
            });
          }
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Profile updated locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const addEducation = (education: Omit<Education, 'id'>) => {
    if (user) {
      const newEducation = { id: generateId(), ...education };
      const updatedUser = { ...user, education: [...user.education, newEducation] };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Education added",
            description: "Your education entry has been added",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Education added locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const updateEducation = (education: Education) => {
    if (user) {
      const updatedEducation = user.education.map(item => 
        item.id === education.id ? education : item
      );
      const updatedUser = { ...user, education: updatedEducation };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Education updated",
            description: "Your education entry has been updated",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Education updated locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const removeEducation = (id: string) => {
    if (user) {
      const updatedUser = {
        ...user, 
        education: user.education.filter(item => item.id !== id)
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Education removed",
            description: "The education entry has been removed",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Education removed locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const addWorkExperience = (experience: Omit<WorkExperience, 'id'>) => {
    if (user) {
      const newExperience = { id: generateId(), ...experience };
      const updatedUser = {
        ...user, 
        workExperiences: [...user.workExperiences, newExperience]
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Experience added",
            description: "Your work experience has been added",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Experience added locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const updateWorkExperience = (experience: WorkExperience) => {
    if (user) {
      const updatedExperiences = user.workExperiences.map(item => 
        item.id === experience.id ? experience : item
      );
      const updatedUser = { ...user, workExperiences: updatedExperiences };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Experience updated",
            description: "Your work experience has been updated",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Experience updated locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const removeWorkExperience = (id: string) => {
    if (user) {
      const updatedUser = {
        ...user, 
        workExperiences: user.workExperiences.filter(item => item.id !== id)
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Experience removed",
            description: "The work experience has been removed",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Experience removed locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const addResume = (resume: Omit<Resume, 'id' | 'createdAt'>) => {
    if (user) {
      const newResume = { 
        id: generateId(), 
        createdAt: new Date().toISOString(),
        ...resume 
      };
      const updatedUser = { ...user, resumes: [...user.resumes, newResume] };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Resume added",
            description: "Your resume has been added to your profile",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Resume added locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const addCoverLetter = (coverLetter: Omit<CoverLetter, 'id' | 'createdAt'>) => {
    if (user) {
      const newCoverLetter = { 
        id: generateId(), 
        createdAt: new Date().toISOString(),
        ...coverLetter 
      };
      const updatedUser = {
        ...user, 
        coverLetters: [...user.coverLetters, newCoverLetter]
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Cover letter added",
            description: "Your cover letter has been added to your profile",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Cover letter added locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const removeResume = (id: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        resumes: user.resumes.filter(resume => resume.id !== id)
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Resume removed",
            description: "The resume has been deleted from your profile."
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Resume removed locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const removeCoverLetter = (id: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        coverLetters: user.coverLetters.filter(letter => letter.id !== id)
      };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Cover letter removed",
            description: "The cover letter has been deleted from your profile."
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Cover letter removed locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  const updateSkills = (skills: string[]) => {
    if (user) {
      const updatedUser = { ...user, skills };
      setUser(updatedUser);
      
      ResumeService.updateUserProfile(updatedUser)
        .then(() => {
          toast({
            title: "Skills updated",
            description: "Your skills have been updated",
          });
        })
        .catch(() => {
          toast({
            title: "Warning",
            description: "Skills updated locally, but failed to sync with server",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUserProfile,
      addEducation,
      updateEducation,
      removeEducation,
      addWorkExperience,
      updateWorkExperience,
      removeWorkExperience,
      addResume,
      addCoverLetter,
      removeResume,
      removeCoverLetter,
      updateSkills
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
