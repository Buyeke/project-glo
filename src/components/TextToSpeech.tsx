
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  className?: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.log('Speech synthesis not supported');
    }
  };

  return (
    <Button
      onClick={handleSpeak}
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 hover:bg-secondary/20 ${className}`}
      aria-label={isPlaying ? "Stop reading" : "Read aloud"}
    >
      {isPlaying ? (
        <VolumeX className="h-3 w-3 text-secondary" />
      ) : (
        <Volume2 className="h-3 w-3 text-secondary" />
      )}
    </Button>
  );
};

export default TextToSpeech;
