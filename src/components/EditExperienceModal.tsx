
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { ResumeService } from '@/services/ResumeService';

const EditExperienceModal = ({ isOpen, onClose, experience, onSave }) => {
  const { toast } = useToast();
  const { updateWorkExperience } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: experience?.company || '',
    position: experience?.position || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    current: experience?.current || false,
    description: experience?.description || '',
    bullets: experience?.bullets || [''],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // If current job is checked, clear the end date
    if (name === 'current' && checked) {
      setFormData((prev) => ({
        ...prev,
        endDate: '',
      }));
    }
  };

  const handleBulletChange = (index, value) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData((prev) => ({
      ...prev,
      bullets: newBullets,
    }));
  };

  const addBullet = () => {
    setFormData((prev) => ({
      ...prev,
      bullets: [...prev.bullets, ''],
    }));
  };

  const removeBullet = (index) => {
    const newBullets = formData.bullets.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      bullets: newBullets,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const filteredBullets = formData.bullets.filter(bullet => bullet.trim() !== '');
      
      const updatedExperience = {
        ...experience,
        ...formData,
        bullets: filteredBullets,
      };
      
      // Update through context first (for immediate UI update)
      updateWorkExperience(updatedExperience);
      
      // Then try API calls
      try {
        await ResumeService.updateWorkExperience(updatedExperience.id, updatedExperience);
        
        toast({
          title: "Experience updated",
          description: "Your work experience entry has been updated successfully",
        });
      } catch (apiError) {
        console.error("API update failed:", apiError);
        
        toast({
          title: "Experience updated locally",
          description: "Changes saved locally but server sync failed. Will update when connection is restored.",
        });
      }
      
      // Call onSave callback to refresh parent component
      onSave(updatedExperience);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating experience:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your work experience entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Work Experience</DialogTitle>
          <DialogDescription>
            Make changes to your work experience entry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="form-group">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company, Inc."
              required
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="position">Position Title</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Software Engineer, Project Manager, etc."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleChange}
                disabled={formData.current}
                required={!formData.current}
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="current"
                  name="current"
                  checked={formData.current}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-resume-primary focus:ring-resume-primary"
                />
                <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                  I currently work here
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
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
                <Plus className="h-3 w-3 mr-1" />
                Add Bullet
              </Button>
            </div>
            
            {formData.bullets.map((bullet, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  placeholder="Achieved X by implementing Y, resulting in Z..."
                />
                {formData.bullets.length > 1 && (
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

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExperienceModal;
