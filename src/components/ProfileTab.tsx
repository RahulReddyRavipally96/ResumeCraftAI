import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { User, Briefcase, GraduationCap, ListChecks, FileText, Plus, Trash2, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentsTab from './DocumentsTab';
import EditEducationModal from './EditEducationModal';
import EditExperienceModal from './EditExperienceModal';
import { useToast } from '@/hooks/use-toast';
import { ResumeService } from '@/services/ResumeService';

const ProfileTab = () => {
  const { 
    user, 
    updateUserProfile, 
    addEducation, 
    removeEducation, 
    addWorkExperience, 
    removeWorkExperience, 
    updateSkills,
    removeResume,
    removeCoverLetter,
    updateEducation,
    updateWorkExperience
  } = useAuth();

  const { toast } = useToast();
  
  if (!user) return null;

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="mb-6 grid grid-cols-5 gap-2">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Personal</span>
        </TabsTrigger>
        <TabsTrigger value="education" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span className="hidden sm:inline">Education</span>
        </TabsTrigger>
        <TabsTrigger value="experience" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Experience</span>
        </TabsTrigger>
        <TabsTrigger value="skills" className="flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          <span className="hidden sm:inline">Skills</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <PersonalInfoForm user={user} updateUserProfile={updateUserProfile} />
      </TabsContent>
      
      <TabsContent value="education">
        <EducationForm 
          educations={user.education} 
          addEducation={addEducation} 
          removeEducation={removeEducation}
          updateEducation={updateEducation}
        />
      </TabsContent>
      
      <TabsContent value="experience">
        <ExperienceForm 
          experiences={user.workExperiences} 
          addExperience={addWorkExperience} 
          removeExperience={removeWorkExperience}
          updateExperience={updateWorkExperience}
        />
      </TabsContent>
      
      <TabsContent value="skills">
        <SkillsForm 
          currentSkills={user.skills} 
          updateSkills={updateSkills} 
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentsTab 
          resumes={user.resumes} 
          coverLetters={user.coverLetters}
          onDeleteResume={removeResume}
          onDeleteCoverLetter={removeCoverLetter}
        />
      </TabsContent>
    </Tabs>
  );
};

const PersonalInfoForm = ({ user, updateUserProfile }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [linkedin, setLinkedin] = useState(user.linkedin);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, linkedin });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details used for your resume and cover letter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(123) 456-7890"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>
          
          <Button type="submit" className="bg-resume-primary hover:bg-resume-dark">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const EducationForm = ({ educations, addEducation, removeEducation, updateEducation }) => {
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [editingEducation, setEditingEducation] = useState(null);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    addEducation({
      institution,
      degree,
      field,
      startDate,
      endDate,
      description
    });
    setInstitution('');
    setDegree('');
    setField('');
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const handleEdit = (education) => {
    setEditingEducation(education);
  };

  const handleSaveEdit = async (updatedEducation) => {
    try {
      // Update local state through context
      updateEducation(updatedEducation);
      
      try {
        // Try direct API update
        await ResumeService.updateEducationDirect(updatedEducation.id, updatedEducation);
        
        toast({
          title: "Education updated",
          description: "Your education entry has been updated successfully."
        });
        
        // Try to refresh the profile to get the latest data
        try {
          const refreshedProfile = await ResumeService.getUserProfile();
          if (refreshedProfile) {
            updateUserProfile({
              education: refreshedProfile.education
            });
          }
        } catch (refreshError) {
          console.warn("Could not refresh profile:", refreshError);
          // Continue since the local update was successful
        }
      } catch (directError) {
        console.warn("Direct education update failed, trying fallback method:", directError);
        
        // Try fallback update method
        try {
          await ResumeService.updateEducation(updatedEducation.id, updatedEducation);
          toast({
            title: "Education updated",
            description: "Your education entry has been updated using the fallback method."
          });
        } catch (fallbackError) {
          console.error("Fallback update also failed:", fallbackError);
          toast({
            title: "Update partially completed",
            description: "Your changes are saved locally but may not be synced to the server yet.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error("Error updating education:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your education entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Education</CardTitle>
          <CardDescription>
            Add your educational background to showcase in your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University Name"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="Bachelor's, Master's, etc."
                  required
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="Computer Science, Business, etc."
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="endDate">End Date (or Expected)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Relevant courses, achievements, activities..."
                rows={3}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-resume-primary hover:bg-resume-dark flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Education
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Education</CardTitle>
          <CardDescription>
            {educations.length === 0 
              ? "No education entries yet. Add your educational background." 
              : "Your saved educational background"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {educations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                <p>No education entries yet.</p>
                <p className="text-sm">Add your education details using the form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="resume-card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{edu.institution}</h3>
                        <p className="text-sm text-gray-500">
                          {edu.degree} in {edu.field}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-500"
                          onClick={() => handleEdit(edu)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ' Present'}
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-700">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {editingEducation && (
        <EditEducationModal
          isOpen={!!editingEducation}
          onClose={() => setEditingEducation(null)}
          education={editingEducation}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

const ExperienceForm = ({ experiences, addExperience, removeExperience, updateExperience }) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [bullets, setBullets] = useState(['']);
  const [editingExperience, setEditingExperience] = useState(null);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();

  const handleBulletChange = (index, value) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const addBullet = () => {
    setBullets([...bullets, '']);
  };

  const removeBullet = (index) => {
    const newBullets = bullets.filter((_, i) => i !== index);
    setBullets(newBullets);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredBullets = bullets.filter(bullet => bullet.trim() !== '');
    
    addExperience({
      company,
      position,
      startDate,
      endDate: current ? '' : endDate,
      current,
      description,
      bullets: filteredBullets
    });
    
    setCompany('');
    setPosition('');
    setStartDate('');
    setEndDate('');
    setCurrent(false);
    setDescription('');
    setBullets(['']);
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
  };

  const handleSaveEdit = async (updatedExperience) => {
    try {
      // Update local state through context
      updateExperience(updatedExperience);
      
      try {
        // Try API update
        await ResumeService.updateWorkExperience(updatedExperience.id, updatedExperience);
        
        toast({
          title: "Experience updated",
          description: "Your work experience entry has been updated successfully."
        });
        
        // Try to refresh the profile to get the latest data
        try {
          const refreshedProfile = await ResumeService.getUserProfile();
          if (refreshedProfile) {
            updateUserProfile({
              workExperiences: refreshedProfile.workExperiences
            });
          }
        } catch (refreshError) {
          console.warn("Could not refresh profile:", refreshError);
          // Continue since the local update was successful
        }
      } catch (error) {
        console.error("Error updating work experience with API:", error);
        toast({
          title: "Update partially completed",
          description: "Your changes are saved locally but may not be synced to the server yet.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error updating work experience:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your work experience entry.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Work Experience</CardTitle>
          <CardDescription>
            Add your professional experience to showcase in your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company, Inc."
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="position">Position Title</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Software Engineer, Project Manager, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={current}
                  required={!current}
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="currentPosition"
                    checked={current}
                    onChange={() => setCurrent(!current)}
                    className="rounded border-gray-300 text-resume-primary focus:ring-resume-primary"
                  />
                  <label htmlFor="currentPosition" className="ml-2 text-sm text-gray-700">
                    I currently work here
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of your role and responsibilities..."
                rows={2}
              />
            </div>
            
            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <Label>Key Achievements</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addBullet}
                  className="h-8 px-2 text-xs"
                >
                  Add Bullet
                </Button>
              </div>
              
              {bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={bullet}
                    onChange={(e) => handleBulletChange(index, e.target.value)}
                    placeholder="Achieved X by implementing Y, resulting in Z..."
                  />
                  {bullets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => removeBullet(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-1">
                Use action verbs and quantify results when possible
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-resume-primary hover:bg-resume-dark flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Experience
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Work Experience</CardTitle>
          <CardDescription>
            {experiences.length === 0 
              ? "No work experience entries yet. Add your professional background." 
              : "Your saved work experience"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px] pr-4">
            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                <p>No work experience entries yet.</p>
                <p className="text-sm">Add your professional experience using the form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="resume-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{exp.position}</h3>
                        <p className="text-sm text-gray-500">{exp.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-blue-500"
                          onClick={() => handleEdit(exp)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                      {exp.current 
                        ? ' Present' 
                        : exp.endDate 
                          ? ` ${new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` 
                          : ' Present'}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                    )}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {exp.bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {editingExperience && (
        <EditExperienceModal
          isOpen={!!editingExperience}
          onClose={() => setEditingExperience(null)}
          experience={editingExperience}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

const SkillsForm = ({ currentSkills, updateSkills }) => {
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(currentSkills);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() !== '') {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      updateSkills(newSkills);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    updateSkills(newSkills);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your technical and soft skills to enhance your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill (e.g., Python, Project Management, Communication)"
              className="flex-1"
            />
            <Button 
              type="submit"
              className="bg-resume-primary hover:bg-resume-dark"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Your Skills</h3>
            {skills.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-300 rounded-md">
                <ListChecks className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No skills added yet</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-resume-light text-resume-dark px-3 py-1 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-resume-accent text-resume-dark"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
