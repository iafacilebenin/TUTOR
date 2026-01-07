
import React, { useState, useRef, useEffect } from 'react';
import { EducationLevel, ChatMessage, MessageRole, UserSession } from './types';
import { SUBJECTS, BENIN_CURRICULUM_PROMPT } from './constants';
import { generateTutorResponse, analyzeImage, generateEducationalImage } from './services/geminiService';
import { VoiceInterface } from './components/VoiceInterface';

const AMAZON_MONUMENT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Statue_de_l%27Amazone_au_B%C3%A9nin.jpg/1200px-Statue_de_l%27Amazone_au_B%C3%A9nin.jpg";

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech API for Dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsDictating(false);
      };

      recognitionRef.current.onerror = () => setIsDictating(false);
      recognitionRef.current.onend = () => setIsDictating(false);
    }
  }, []);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
    } else {
      setIsDictating(true);
      recognitionRef.current?.start();
    }
  };

  const handleStartSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSession: UserSession = {
      name: formData.get('name') as string,
      level: formData.get('level') as EducationLevel,
      subject: formData.get('subject') as string,
    };
    setSession(newSession);
    const welcome = `Bienvenue ${newSession.name} ! Je suis votre "MAÎTRE D'ÉTUDES", prêt à vous accompagner vers la réussite au Bénin. Que souhaites-tu réviser en ${newSession.subject} aujourd'hui ?`;
    setMessages([{ id: '1', role: MessageRole.ASSISTANT, content: welcome }]);
  };

  const handleSend = async (text?: string, imageUrl?: string) => {
    const msg = text || input;
    if (!msg.trim() && !imageUrl) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, content: msg, imageUrl };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemInst = BENIN_CURRICULUM_PROMPT
        .replace('{level}', session?.level || '')
        .replace('{subject}', session?.subject || '')
        .replace('{name}', session?.name || '');

      let aiResponseText = '';
      let groundingSources: { title: string; uri: string }[] | undefined;

      if (imageUrl) {
        aiResponseText = await analyzeImage(imageUrl.split(',')[1], msg || "Explique cet exercice étape par étape.", systemInst);
      } else {
        const result = await generateTutorResponse(msg, systemInst);
        aiResponseText = result.text;
        groundingSources = result.groundingChunks
          ?.filter(chunk => chunk.web)
          .map(chunk => ({ title: chunk.web.title, uri: chunk.web.uri }));
      }
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: MessageRole.ASSISTANT, 
        content: aiResponseText,
        groundingSources
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: MessageRole.ASSISTANT, content: "Désolé, j'ai rencontré une erreur. Réessayez, champion !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInfographic = async () => {
    if (!session) return;
    setIsLoading(true);
    const visualPrompt = `Schéma pédagogique détaillé pour un élève de ${session.level} au Bénin sur le sujet : ${session.subject}. Style infographie éducative moderne, claire, avec des légendes en français.`;
    try {
      const imageUrl = await generateEducationalImage(visualPrompt);
      if (imageUrl) {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: MessageRole.ASSISTANT, 
          content: `Voici une infographie pour t'aider à visualiser les concepts clés en ${session.subject}.`,
          imageUrl: imageUrl,
          isImageGeneration: true
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSend("Analyse cette photo de mon cahier/exercice.", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#0a0c0a]">
        <div className="hero-glow top-0 left-0"></div>
        <div className="hero-glow bottom-0 right-0" style={{ background: 'radial-gradient(circle, rgba(232, 17, 45, 0.1) 0%, transparent 70%)' }}></div>
        <div className="glass-panel w-full max-w-lg rounded-[2.5rem] p-10 relative overflow-hidden text-center shadow-2xl border-white/10">
          <div className="absolute top-0 left-0 w-full h-1.5 flex">
            <div className="bg-[#008751] flex-1"></div>
            <div className="bg-[#FCD116] flex-1"></div>
            <div className="bg-[#E8112D] flex-1"></div>
          </div>
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto mb-6 rounded-3xl p-1 bg-gradient-to-tr from-[#008751] via-[#FCD116] to-[#E8112D] float-anim shadow-2xl">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-black">
                <img src={AMAZON_MONUMENT_IMAGE} alt="L'Amazone du Bénin" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">MAÎTRE D'ÉTUDES</h1>
            <p className="benin-gradient-text text-xs tracking-[0.3em] uppercase mb-8">1ER MAÎTRE D'ÉTUDES IA AU BENIN</p>
          </div>
          <form onSubmit={handleStartSession} className="space-y-6 text-left">
            <input name="name" required placeholder="Ton Prénom" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-[#FCD116] outline-none text-white" />
            <div className="grid grid-cols-2 gap-4">
              <select name="level" required className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none">
                {Object.values(EducationLevel).map(l => <option key={l} value={l} className="bg-[#0d0f0d]">{l}</option>)}
              </select>
              <select name="subject" required className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none">
                {Object.values(SUBJECTS).flat().filter((v, i, a) => a.indexOf(v) === i).map(s => <option key={s} value={s} className="bg-[#0d0f0d]">{s}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-5 rounded-2xl bg-[#008751] hover:bg-[#00a362] text-white font-black text-lg shadow-xl uppercase tracking-widest active:scale-95">Ouvrir mon cahier</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#090b09]">
      <header className="px-6 py-4 glass-panel flex items-center justify-between sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl p-0.5 bg-gradient-to-br from-[#008751] to-[#E8112D] shadow-lg">
            <div className="w-full h-full rounded-[10px] overflow-hidden border border-black">
              <img src={AMAZON_MONUMENT_IMAGE} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-md font-black tracking-tight text-white">MAÎTRE D'ÉTUDES</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] font-black uppercase text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full border border-[#008751]/20">{session.level}</span>
              <span className="text-[9px] font-black uppercase text-[#FCD116] bg-[#FCD116]/10 px-2 py-0.5 rounded-full border border-[#FCD116]/20">{session.subject}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerateInfographic} disabled={isLoading} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#FCD116] hover:bg-white/10 transition-all disabled:opacity-50">
            <i className="fas fa-project-diagram"></i>
            <span>Infographie</span>
          </button>
          <button onClick={() => setSession(null)} className="p-3 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] p-6 shadow-2xl ${msg.role === MessageRole.USER ? 'message-user rounded-tr-none text-white' : 'message-ai rounded-tl-none glass-panel border-white/10 text-gray-100'}`}>
                {msg.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                    <img src={msg.imageUrl} alt="Contenu" className="w-full" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-bold text-[#FCD116] uppercase tracking-widest opacity-80">Sources vérifiées :</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingSources.map((source, sIdx) => (
                        <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                          <i className="fas fa-link text-[8px]"></i>
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {msg.role === MessageRole.ASSISTANT && (
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <VoiceInterface textToSpeak={msg.content} autoPlay={idx === messages.length - 1} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#FCD116] opacity-60">République du Bénin</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 p-5 glass-panel rounded-2xl w-fit border-white/5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-[#008751] animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#FCD116] animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-[#E8112D] animate-bounce [animation-delay:0.4s]"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 md:p-6 bg-[#0d0f0d] border-t border-white/10 relative">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FCD116] hover:bg-white/10 transition-all shrink-0 active:scale-90"
            title="Prendre une photo de l'exercice"
          >
            <i className="fas fa-camera text-xl"></i>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          
          <button 
            onClick={toggleDictation}
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shrink-0 active:scale-90 ${isDictating ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-gray-400 hover:text-[#008751]'}`}
            title="Parler pour écrire"
          >
            <i className={`fas ${isDictating ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
          </button>

          <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 p-2 flex items-end gap-2 focus-within:border-[#FCD116]/50 transition-all shadow-inner">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={isDictating ? "Écoute en cours..." : "Écris ta question ici..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 resize-none max-h-40 font-medium text-sm placeholder:text-gray-600"
              rows={1}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-[#008751] flex items-center justify-center text-white disabled:opacity-20 hover:bg-[#00a362] transition-all shrink-0 shadow-lg active:scale-90"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-[1px] flex opacity-20">
          <div className="bg-[#008751] flex-1"></div>
          <div className="bg-[#FCD116] flex-1"></div>
          <div className="bg-[#E8112D] flex-1"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
