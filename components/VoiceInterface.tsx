
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

interface VoiceInterfaceProps {
  textToSpeak: string;
  onFinished?: () => void;
  autoPlay?: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ textToSpeak, onFinished, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const hasAutoPlayed = useRef(false);

  const speak = useCallback(async () => {
    if (!textToSpeak || isPlaying) return;

    try {
      setIsPlaying(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: textToSpeak }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decode(base64Audio);
        const buffer = await decodeAudioData(decoded, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
          setIsPlaying(false);
          if (onFinished) onFinished();
        };
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Speech error:", error);
      setIsPlaying(false);
    }
  }, [textToSpeak, isPlaying, onFinished]);

  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      speak();
    }
  }, [autoPlay, speak]);

  return (
    <button 
      onClick={speak}
      disabled={isPlaying}
      className={`p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isPlaying ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#008751]/20 text-[#008751] hover:bg-[#008751]/30'}`}
      title="Lire la réponse"
    >
      <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-volume-up'}`}></i>
      <span>{isPlaying ? 'Lecture...' : 'Écouter'}</span>
    </button>
  );
};
