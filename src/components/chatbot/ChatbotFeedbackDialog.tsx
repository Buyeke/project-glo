import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Heart } from 'lucide-react';
import { useChatbotFeedback } from '@/hooks/useChatbotFeedback';

interface ChatbotFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatInteractionId: string;
  messageText: string;
}

export const ChatbotFeedbackDialog = ({
  open,
  onOpenChange,
  chatInteractionId,
  messageText
}: ChatbotFeedbackDialogProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [responseRelevance, setResponseRelevance] = useState(5);
  const [languageQuality, setLanguageQuality] = useState(5);
  const [culturalSensitivity, setCulturalSensitivity] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackTypes, setFeedbackTypes] = useState<string[]>(['helpful']);
  const [anonymous, setAnonymous] = useState(false);

  const { submitFeedback, isSubmitting } = useChatbotFeedback();

  const handleSubmit = () => {
    submitFeedback({
      chatInteractionId,
      rating,
      feedbackType: feedbackTypes[0] as any || 'helpful',
      comment: comment.trim() || undefined,
      responseRelevance,
      languageQuality,
      culturalSensitivity,
      anonymous
    }, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        setRating(5);
        setComment('');
        setFeedbackTypes(['helpful']);
        setAnonymous(false);
      }
    });
  };

  const toggleFeedbackType = (type: string) => {
    setFeedbackTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Help Us Improve GLO
          </DialogTitle>
          <DialogDescription>
            Your feedback helps us provide better support for everyone in our community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Type Checkboxes */}
          <div className="space-y-2">
            <Label>What describes this response?</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'helpful', label: 'Helpful' },
                { value: 'accurate', label: 'Accurate' },
                { value: 'culturally_appropriate', label: 'Culturally Appropriate' },
                { value: 'not_helpful', label: 'Not Helpful' },
                { value: 'inaccurate', label: 'Inaccurate' },
                { value: 'needs_improvement', label: 'Needs Improvement' }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={value}
                    checked={feedbackTypes.includes(value)}
                    onCheckedChange={() => toggleFeedbackType(value)}
                  />
                  <Label htmlFor={value} className="text-sm font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label className="text-sm">Response Relevance</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setResponseRelevance(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= responseRelevance
                          ? 'fill-blue-400 text-blue-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Language Quality</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setLanguageQuality(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= languageQuality
                          ? 'fill-green-400 text-green-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Cultural Sensitivity</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCulturalSensitivity(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= culturalSensitivity
                          ? 'fill-purple-400 text-purple-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Additional Comments (Optional)</Label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              Submit feedback anonymously
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
