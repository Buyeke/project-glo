
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddConcernDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const concernTypes = [
  'hygiene',
  'addiction',
  'childcare',
  'superstition',
  'digital_literacy',
  'mental_health',
  'housing',
  'employment',
  'education',
  'legal_aid',
  'healthcare',
  'safety',
  'financial',
  'other'
];

const AddConcernDialog = ({ isOpen, onClose, userId }: AddConcernDialogProps) => {
  const [concernType, setConcernType] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConcern = useMutation({
    mutationFn: async (data: { concern_type: string; description: string }) => {
      const { error } = await supabase
        .from('user_concerns')
        .insert({
          user_id: userId,
          concern_type: data.concern_type,
          description: data.description,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerns', userId] });
      toast({
        title: "Concern added",
        description: "The concern has been recorded successfully.",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add concern. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setConcernType('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernType) {
      toast({
        title: "Validation Error",
        description: "Please select a concern type.",
        variant: "destructive",
      });
      return;
    }
    
    createConcern.mutate({ concern_type: concernType, description });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Concern</DialogTitle>
          <DialogDescription>
            Record a new concern or support need to track and address.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concern-type">Concern Type *</Label>
            <Select value={concernType} onValueChange={setConcernType}>
              <SelectTrigger>
                <SelectValue placeholder="Select concern type" />
              </SelectTrigger>
              <SelectContent>
                {concernTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about this concern..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createConcern.isPending}>
              {createConcern.isPending ? 'Adding...' : 'Add Concern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConcernDialog;
