import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, User, MessageSquare, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS } from './services/newsPrismService';
import { AnalysisResult } from './services/aiTypes';
import { AIFactory } from './services/aiFactory';

interface LiveDebateProps {
  analysis: AnalysisResult;
  url: string;
  onClose: () => void;
}

export const LiveDebate: React.FC<LiveDebateProps> = ({ analysis, url, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [transcripts, setTranscripts] = useState<{ role: string; text: string; agentId?: string }[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const aiServiceRef = useRef<any>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const startSession = async () => {
    try {
      const aiService = AIFactory.getService();
      aiServiceRef.current = aiService;

      await aiService.connectLive(url, analysis, {
        onOpen: () => {
          setIsConnected(true);
          setError(null);
          nextStartTimeRef.current = 0;
        },
        onMessage: (text, audioData, interrupted) => {
          if (audioData) {
            playOutputAudio(audioData);
          }

          if (interrupted) {
            stopOutputAudio();
            setActiveSpeaker(null);
            nextStartTimeRef.current = 0;
          }

          if (text) {
            const speakerMatch = text.match(/(Elias|Marcus|Sarah|Moderator):/i);
            
            setTranscripts(prev => {
              const newTranscripts = [...prev];
              const last = newTranscripts[newTranscripts.length - 1];
              
              if (speakerMatch) {
                const speakerName = speakerMatch[1];
                const agent = AGENTS.find(a => a.name.toLowerCase().includes(speakerName.toLowerCase()));
                const speakerId = agent?.id || 'moderator';
                const cleanText = text.replace(speakerMatch[0], '').trim();
                
                setActiveSpeaker(speakerId);
                
                // If the last message was from the same speaker, append to it
                if (last && last.role === speakerName) {
                  last.text += ' ' + cleanText;
                  return newTranscripts;
                } else {
                  return [...newTranscripts, { role: speakerName, text: cleanText, agentId: agent?.id }];
                }
              } else if (last) {
                // No speaker match, append to the last message
                last.text += (last.text ? ' ' : '') + text;
                return newTranscripts;
              }
              return prev;
            });
          }
        },
        onError: (err) => {
          console.error("AI Service Error:", err);
          setError(err);
        },
        onClose: () => {
          setIsConnected(false);
        }
      });
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(`Failed to initialize the live session. ${err.message || ''}`);
    }
  };

  const playOutputAudio = async (base64Data: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;
          setAudioLevel(average);
          requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }
    
    const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyserRef.current!);
    
    const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime + 0.05);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  };

  const stopOutputAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      nextStartTimeRef.current = 0;
    }
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setIsMicOn(true);
        
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
          aiServiceRef.current?.sendAudio(base64Data);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      } catch (err) {
        console.error("Mic access denied:", err);
        setError("Microphone access denied.");
      }
    } else {
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsMicOn(false);
    }
  };

  useEffect(() => {
    const transcriptEnd = document.getElementById('transcript-end');
    transcriptEnd?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    startSession();
    return () => {
      aiServiceRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl h-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-red-600 rounded-full relative" />
            </div>
            <h2 className="text-white font-serif text-2xl uppercase tracking-widest">Live Debate Session</h2>
            <div className="bg-red-600/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-tighter">
              On Air
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {AGENTS.map((agent) => {
              const isSpeaking = activeSpeaker === agent.id;
              return (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isSpeaking ? 1.05 : 1,
                    borderColor: isSpeaking ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isSpeaking ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'
                  }}
                  className={`relative rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center text-center h-fit`}
                >
                  <div className="relative mb-4">
                    <div className={`absolute -inset-4 rounded-full blur-xl transition-opacity duration-500 ${isSpeaking ? 'bg-white/10 opacity-100' : 'opacity-0'}`} />
                    <img 
                      src={agent.avatar} 
                      alt={agent.name} 
                      className={`w-24 h-24 rounded-full border-4 transition-all duration-300 ${isSpeaking ? 'border-white scale-110' : 'border-white/10'}`}
                      referrerPolicy="no-referrer"
                    />
                    {isSpeaking && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter shadow-lg"
                      >
                        Speaking
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-white font-serif text-lg mb-1">{agent.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter mb-3 ${agent.color}`}>{agent.role}</p>
                  
                  <button
                    onClick={() => aiServiceRef.current?.sendText(`Moderator: ${agent.name}, what is your take on this?`)}
                    className="mt-2 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded uppercase tracking-widest transition-all"
                  >
                    Call on {agent.name.split(' ')[0]}
                  </button>
                  
                  {/* Real-time Voice Waveform */}
                  <div className="mt-4 flex gap-1 h-8 items-center justify-center w-full">
                    {[...Array(8)].map((_, i) => {
                      const baseHeight = isSpeaking ? 4 : 2;
                      const dynamicHeight = isSpeaking ? (audioLevel * (0.5 + Math.random() * 0.5)) : 0;
                      const height = Math.max(baseHeight, Math.min(32, baseHeight + dynamicHeight));
                      
                      return (
                        <motion.div
                          key={i}
                          animate={{ height }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={`w-1 rounded-full transition-colors duration-300 ${isSpeaking ? 'bg-white' : 'bg-white/10'}`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Transcript Sidebar */}
          <div className="lg:col-span-1 bg-white/5 rounded-2xl border border-white/10 flex flex-col min-h-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Live Transcript
              </h3>
              <span className="text-white/40 text-[10px]">{transcripts.length} turns</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-white/20 text-xs italic">Waiting for the debate to begin...</p>
                </div>
              ) : (
                transcripts.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-tighter ${AGENTS.find(a => a.name.includes(t.role))?.color || 'text-white/40'}`}>
                      {t.role}
                    </p>
                    <p className="text-white/80 text-xs leading-relaxed font-serif">
                      {t.text}
                    </p>
                  </motion.div>
                ))
              )}
              <div id="transcript-end" />
            </div>
          </div>
        </div>

        {/* User / Jury Controls */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <User className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-medium">You (The Jury)</p>
              <p className="text-white/40 text-sm">Listen and intervene to guide the debate</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => aiServiceRef.current?.sendText("Moderator: Panel, please introduce yourselves and give us your opening statements.")}
              className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all text-sm uppercase tracking-widest"
            >
              Kick off Debate
            </button>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-full">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={toggleMic}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isMicOn ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isMicOn ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-white/40 text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{transcripts.length} exchanges recorded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
