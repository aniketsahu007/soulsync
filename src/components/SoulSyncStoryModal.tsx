import React, { useState, useEffect, useRef } from 'react';
import { generateDailyStory, DailyStory } from '@/services/story.service';
import { X, Volume2, VolumeX, BookOpen, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// ─── Om Synthesizer ──────────────────────────────────────────────────────────
function createOmSynth(ctx: AudioContext): GainNode {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const reverbLen = ctx.sampleRate * 3.5;
  const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = reverbBuf.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = reverbBuf;
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.5;
  convolver.connect(reverbGain);
  reverbGain.connect(master);

  const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 800; f1.Q.value = 4;
  const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1100; f2.Q.value = 6;
  const fWarm = ctx.createBiquadFilter(); fWarm.type = 'lowshelf'; fWarm.frequency.value = 300; fWarm.gain.value = 9;

  const FUND = 136.1;
  ([
    [FUND,       0.60, 'sine'],
    [FUND * 2,   0.25, 'sine'],
    [FUND * 3,   0.12, 'triangle'],
    [FUND * 4,   0.06, 'sine'],
    [FUND * 0.5, 0.20, 'sine'],
  ] as [number, number, OscillatorType][]).forEach(([freq, g, type]) => {
    const osc = ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const og = ctx.createGain(); og.gain.value = g;
    osc.connect(og); og.connect(fWarm); og.connect(f1); og.connect(f2);
    osc.start();
  });

  fWarm.connect(master); fWarm.connect(convolver);
  f1.connect(master); f1.connect(convolver);
  f2.connect(master); f2.connect(convolver);

  const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.1;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.1;
  lfo.connect(lfoG); lfoG.connect(master.gain); lfo.start();

  master.gain.setValueAtTime(0.001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 4);
  return master;
}

// ─── Today's date formatted nicely ───────────────────────────────────────────
function getTodayLabel() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function SoulSyncStoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [story, setStory] = useState<DailyStory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'landing' | 'hook' | 'story'>('landing');
  const [isMuted, setIsMuted] = useState(false);
  const [breatheIn, setBreatheIn] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Breathing animation cycle
  useEffect(() => {
    const t = setInterval(() => setBreatheIn(v => !v), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const startAudio = () => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC() as AudioContext;
      audioCtxRef.current = ctx;
      masterGainRef.current = createOmSynth(ctx);
    } catch (e) { console.error('Om synth failed:', e); }
  };

  const handleBegin = async () => {
    startAudio();
    setPhase('hook');
    setIsLoading(true);
    try {
      const s = await generateDailyStory();
      setStory(s);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleReadStory = () => setPhase('story');

  const handleClose = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      masterGainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
      setTimeout(() => audioCtxRef.current?.close(), 1200);
    }
    setIsOpen(false);
    localStorage.setItem('soulSync_lastStoryDate', new Date().toDateString());
  };

  const toggleMute = () => {
    if (masterGainRef.current && audioCtxRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      masterGainRef.current.gain.setTargetAtTime(next ? 0 : 0.85, audioCtxRef.current.currentTime, 0.4);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden border-0 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.4)] h-[88vh] sm:h-[680px] flex flex-col rounded-[28px] bg-[#0f0e0c] [&>button:first-child]:hidden">
        <VisuallyHidden>
          <DialogTitle>SoulSync Daily Story</DialogTitle>
          <DialogDescription>Your daily meditative story experience.</DialogDescription>
        </VisuallyHidden>

        {/* ─── LANDING PHASE ─────────────────────────────────────────────── */}
        {phase === 'landing' && (
          <div className="relative flex-1 flex flex-col items-center justify-between overflow-hidden">
            {/* Full bleed gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1208] via-[#0f0e0c] to-[#0c0f1a]" />

            {/* Animated ambient orbs */}
            <div
              className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full opacity-30 transition-all duration-[8000ms] ease-in-out"
              style={{
                background: 'radial-gradient(circle, #d4a373 0%, transparent 70%)',
                transform: breatheIn ? 'scale(1.1)' : 'scale(0.9)',
              }}
            />
            <div
              className="absolute bottom-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full opacity-20 transition-all duration-[10000ms] ease-in-out"
              style={{
                background: 'radial-gradient(circle, #7c5cbf 0%, transparent 70%)',
                transform: breatheIn ? 'scale(0.9)' : 'scale(1.1)',
              }}
            />

            {/* Top bar */}
            <div className="w-full flex items-center justify-between px-8 pt-8 z-10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4a373]" />
                <span className="text-[#d4a373] text-xs font-semibold tracking-[0.2em] uppercase">SoulSync</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
              </button>
            </div>

            {/* Centre content */}
            <div className="z-10 flex flex-col items-center text-center px-10">
              {/* Breathing Om circle */}
              <div className="relative mb-10 flex items-center justify-center">
                <div
                  className="absolute rounded-full bg-[#d4a373]/10 transition-all duration-[4000ms] ease-in-out"
                  style={{ width: breatheIn ? '140px' : '100px', height: breatheIn ? '140px' : '100px' }}
                />
                <div
                  className="absolute rounded-full bg-[#d4a373]/20 transition-all duration-[4000ms] ease-in-out"
                  style={{ width: breatheIn ? '110px' : '80px', height: breatheIn ? '110px' : '80px' }}
                />
                <div className="w-16 h-16 rounded-full bg-[#d4a373]/30 flex items-center justify-center relative">
                  <span className="text-2xl font-serif text-[#d4a373]">ॐ</span>
                </div>
              </div>

              <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-4">{getTodayLabel()}</p>
              <h1 className="text-white text-5xl font-serif font-light leading-[1.15] mb-6 tracking-tight">
                A moment<br />just for you.
              </h1>
              <p className="text-white/45 text-base font-light leading-relaxed max-w-xs">
                Close the notifications. Take one slow breath.<br />
                Your story for today is ready.
              </p>

              {/* Breathing guide */}
              <p className="mt-8 text-[#d4a373]/60 text-sm font-light tracking-widest transition-all duration-[4000ms]">
                {breatheIn ? 'breathe in...' : 'breathe out...'}
              </p>
            </div>

            {/* CTA */}
            <div className="z-10 w-full px-10 pb-12 flex flex-col items-center gap-4">
              <button
                onClick={handleBegin}
                className="w-full max-w-sm py-5 rounded-2xl text-[#0f0e0c] font-semibold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(212,163,115,0.35)] hover:shadow-[0_12px_40px_rgba(212,163,115,0.5)]"
                style={{ background: 'linear-gradient(135deg, #d4a373 0%, #c8864a 100%)' }}
              >
                Open Today's Story
              </button>
              <p className="text-white/20 text-xs">Soothing Om meditation will play</p>
            </div>
          </div>
        )}

        {/* ─── HOOK PHASE ────────────────────────────────────────────────── */}
        {phase === 'hook' && (
          <div className="relative flex-1 flex flex-col items-center justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1208] to-[#0f0e0c]" />
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(circle at 50% 40%, #d4a373, transparent 70%)' }}
            />

            <div className="w-full flex items-center justify-between px-8 pt-8 z-10">
              <span className="text-[#d4a373] text-xs font-semibold tracking-[0.2em] uppercase">Today's Story</span>
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-white/30 hover:text-white/60 transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4" strokeWidth={1.5} />}
                </button>
                <button onClick={handleClose} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#d4a373]/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-white/30 text-sm font-light tracking-widest">Writing your story...</p>
                </div>
              ) : story ? (
                <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700">
                  <BookOpen className="w-8 h-8 text-[#d4a373]/50" strokeWidth={1.5} />
                  <div>
                    <p className="text-white/40 text-xs tracking-[0.25em] uppercase mb-5">Today's Story</p>
                    <h2 className="text-white text-3xl sm:text-4xl font-serif font-light leading-tight mb-8 tracking-tight">
                      {story.title}
                    </h2>
                    <p className="text-[#d4a373]/90 text-xl sm:text-2xl font-serif italic font-light leading-relaxed max-w-lg">
                      "{story.hook}"
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {!isLoading && story && (
              <div className="z-10 w-full px-10 pb-12">
                <button
                  onClick={handleReadStory}
                  className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 py-5 rounded-2xl border border-[#d4a373]/20 text-[#d4a373] font-medium text-base tracking-wide hover:bg-[#d4a373]/5 transition-all duration-300 hover:border-[#d4a373]/40 hover:gap-4"
                >
                  Read the Full Story
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STORY PHASE ───────────────────────────────────────────────── */}
        {phase === 'story' && story && (
          <div className="flex flex-col h-full bg-[#faf8f4] dark:bg-[#0f0e0c]">
            {/* Story header */}
            <div className="px-8 pt-8 pb-4 shrink-0 bg-[#faf8f4] dark:bg-[#0f0e0c] border-b border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#c89462] font-semibold tracking-[0.25em] uppercase">SoulSync · Daily Story</span>
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className="text-[#c4b49a] hover:text-[#8c7a62] transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                  <button onClick={handleClose} className="text-[#c4b49a] hover:text-[#8c7a62] transition-colors">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <h1 className="text-[#2a2318] dark:text-[#f0ece4] text-3xl font-serif font-light leading-snug tracking-tight">
                {story.title}
              </h1>
            </div>

            {/* Story body */}
            <ScrollArea className="flex-1">
              <div className="px-8 sm:px-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Pull quote / hook */}
                <p className="text-[#c8864a] font-serif italic text-lg leading-relaxed mb-8 pb-8 border-b border-[#d4a373]/15">
                  "{story.hook}"
                </p>

                {/* Story paragraphs */}
                <div className="space-y-6">
                  {story.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-[#3a3020] dark:text-[#d1cbc1] text-lg font-serif leading-[1.9] font-light">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-12">
                  <div className="flex-1 h-px bg-[#d4a373]/15" />
                  <span className="text-[#d4a373]/40 text-lg font-serif">ॐ</span>
                  <div className="flex-1 h-px bg-[#d4a373]/15" />
                </div>

                {/* Reflection question */}
                <div className="mb-10">
                  <p className="text-[#8c7a62] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Reflect</p>
                  <p className="text-[#4a3f2e] dark:text-[#d1c8b8] text-2xl font-serif italic font-light leading-relaxed">
                    {story.reflectionQuestion}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="w-full py-5 rounded-2xl text-[#8c7a62] font-medium text-sm tracking-widest uppercase border border-[#d4a373]/20 hover:bg-[#d4a373]/5 hover:border-[#d4a373]/40 transition-all mb-4"
                >
                  Carry This With You
                </button>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
