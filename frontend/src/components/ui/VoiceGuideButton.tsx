import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface VoiceGuideButtonProps {
  message: string;
  label?: string;
  className?: string;
  rate?: number;
  pitch?: number;
}

export const VoiceGuideButton: React.FC<VoiceGuideButtonProps> = ({
  message,
  label = 'Listen to this page',
  className,
  rate = 0.95,
  pitch = 1,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Voice guidance is not supported in this browser.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    if (!message?.trim()) {
      toast.error('No guidance text available for this page.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  return (
    <Button variant="outline" onClick={handleClick} className={className}>
      {isSpeaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
      {isSpeaking ? 'Speaking…' : label}
    </Button>
  );
};
