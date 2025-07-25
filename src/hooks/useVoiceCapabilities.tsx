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
  const speechRecognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startRecording = async () => {
    try {
      // Try browser speech recognition first
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = 'en-US';

        speechRecognitionRef.current.start();
        setIsRecording(true);
        return;
      }

      // Fallback to audio recording for API processing
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
      // Handle browser speech recognition
      if (speechRecognitionRef.current) {
        let finalTranscript = '';
        
        speechRecognitionRef.current.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
        };

        speechRecognitionRef.current.onend = () => {
          setIsRecording(false);
          resolve(finalTranscript || '');
        };

        speechRecognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          reject(new Error('Speech recognition failed'));
        };

        speechRecognitionRef.current.stop();
        return;
      }

      // Handle audio recording
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

              if (error) {
                console.error('API error, falling back to placeholder');
                toast.error('Voice processing failed, please type your message');
                resolve('');
                return;
              }
              
              resolve(data.text || '');
            } catch (error) {
              console.error('Voice-to-text error:', error);
              toast.error('Voice processing failed, please type your message');
              resolve('');
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

  const speakText = async (text: string, voice: string = 'custom') => {
    try {
      setIsPlaying(true);
      
      // Try browser speech synthesis first
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen'));
        if (femaleVoice) utterance.voice = femaleVoice;
        
        utterance.onend = () => {
          setIsPlaying(false);
          currentUtteranceRef.current = null;
        };
        
        utterance.onerror = async () => {
          console.log('Browser TTS failed, trying API with custom voice...');
          await tryApiTTS(text, voice);
        };
        
        currentUtteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
        return;
      }

      // Fallback to API with custom voice
      await tryApiTTS(text, voice);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Speech generation failed');
      setIsPlaying(false);
    }
  };

  const tryApiTTS = async (text: string, voice: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error('API TTS failed:', error);
        toast.error('Speech generation failed');
        setIsPlaying(false);
        return;
      }

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
      console.error('API TTS error:', error);
      toast.error('Speech generation failed');
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    // Stop browser speech synthesis
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }

    // Stop audio playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsPlaying(false);
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
