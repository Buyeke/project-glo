
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoiceCapabilities } from '@/hooks/useVoiceCapabilities';

interface VoiceControlsProps {
  onVoiceInput: (text: string) => void;
  lastBotMessage?: string;
}

export const VoiceControls = ({ onVoiceInput, lastBotMessage }: VoiceControlsProps) => {
  const {
    isPlaying,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking
  } = useVoiceCapabilities();

  const handleRecordingToggle = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        if (transcribedText.trim()) {
          onVoiceInput(transcribedText);
        }
      } catch (error) {
        console.error('Recording error:', error);
      }
    } else {
      await startRecording();
    }
  };

  const handlePlayToggle = async () => {
    if (isPlaying) {
      stopSpeaking();
    } else if (lastBotMessage) {
      await speakText(lastBotMessage);
    }
  };

  return (
    <div className="flex gap-2 p-2 border-t border-gray-200">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRecordingToggle}
        disabled={isProcessing}
        className={`${isRecording ? 'bg-red-50 border-red-200' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4 text-red-600" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isProcessing ? 'Processing...' : isRecording ? 'Stop' : 'Record'}
      </Button>

      {lastBotMessage && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayToggle}
          disabled={isProcessing}
        >
          {isPlaying ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {isPlaying ? 'Stop' : 'Listen'}
        </Button>
      )}
    </div>
  );
};
