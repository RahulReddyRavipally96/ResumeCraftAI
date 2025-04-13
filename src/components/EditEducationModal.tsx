import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const EditEducationModal = ({ isOpen, onClose, education, onSave }) => {
  const { toast } = useToast();
  const { updateEducation } = useAuth();

  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startDate: education?.startDate || '',
    endDate: education?.endDate || '',
    description: education?.description || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedEducation = {
        ...education,
        ...formData,
      };
      
      // Update through context first (for immediate UI update)
      updateEducation(updatedEducation);
      
      // Then try API calls
      try {
        // Try to update using the available methods
        await ResumeService.updateEducationDirect(updatedEducation.id, updatedEducation)
          .catch(async () => {
            // If direct update fails, try general update
            console.log("Direct update failed, trying general update");
            await ResumeService.updateEducation(updatedEducation.id, updatedEducation);
          });
        
        // Call onSave callback to refresh parent component
        onSave(updatedEducation);
        
        toast({
          title: "Education updated",
          description: "Your education entry has been updated successfully",
        });
      } catch (apiError) {
        console.error("All API update attempts failed:", apiError);
        // We still keep the local update via context
        
        toast({
          title: "Education updated locally",
          description: "Changes saved locally but server sync failed. Will update when connection is restored.",
        });
        
        // Still call onSave to update the UI
        onSave(updatedEducation);
      }
      
      // Close the modal regardless of API success (since we updated locally)
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your education entry",
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
          <DialogTitle>Edit Education</DialogTitle>
          <DialogDescription>
            Make changes to your education entry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="form-group">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="University Name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="Bachelor's, Master's, etc."
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                name="field"
                value={formData.field}
                onChange={handleChange}
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
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="endDate">End Date (or Expected)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Relevant courses, achievements, activities..."
              rows={3}
            />
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

export default EditEducationModal;
