
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceCapabilities {
  isPlaying: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  speakText: (text: string, voice?: string) => Promise<void>;
  stopSpeaking: () => void;
}

export const useVoiceCapabilities = (): VoiceCapabilities => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No recording in progress'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64 for API
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });

              if (error) throw error;
              resolve(data.text || '');
            } catch (error) {
              console.error('Voice-to-text error:', error);
              toast.error('Failed to process voice input');
              reject(error);
            } finally {
              setIsProcessing(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          setIsProcessing(false);
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    });
  };

  const speakText = async (text: string, voice: string = 'alloy') => {
    try {
      setIsPlaying(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      // Play the audio
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('Failed to play audio');
      };

      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Failed to generate speech');
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking
  };
};
