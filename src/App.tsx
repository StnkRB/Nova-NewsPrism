import React, { useState } from 'react';
import { Search, Newspaper, TrendingUp, ArrowRight, Share2, Bookmark, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIFactory } from './services/aiFactory';
import { AnalysisResult } from './services/aiTypes';
import { AGENTS } from './services/newsPrismService';
import { LiveDebate } from './LiveDebate';

export default function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showDebate, setShowDebate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const aiService = AIFactory.getService();
      const result = await aiService.analyzeUrl(url);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to analyze the URL. ${err.message || ''}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b nyt-border bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-black/5 rounded-full"><Search className="w-5 h-5" /></button>
            <div className="hidden md:flex gap-4 text-xs font-bold uppercase tracking-widest">
              <span>Politics</span>
              <span>World</span>
              <span>Opinion</span>
              <span>Tech</span>
            </div>
          </div>
          
          <h1 className="nyt-header text-4xl font-black absolute left-1/2 -translate-x-1/2">
            NewsPrism
          </h1>

          <div className="flex items-center gap-4">
            <button className="bg-[#567B95] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#4A6A81] transition-colors">
              SUBSCRIBE
            </button>
            <button className="text-xs font-bold px-4 py-2 border nyt-border rounded hover:bg-black/5 transition-colors">
              LOG IN
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-2 border-t nyt-border flex justify-between items-center text-[10px] font-medium text-black/60">
          <div className="flex gap-4">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Today's Paper</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> S&P 500 +0.45%</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {!analysis ? (
          <div className="max-w-2xl mx-auto mt-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                <Newspaper className="w-3 h-3" />
                The Future of News Analysis
              </div>
              <h2 className="nyt-header text-6xl font-bold leading-tight">
                See the news from every angle.
              </h2>
              <p className="text-xl text-black/60 font-serif italic">
                Paste a link to any article, video, or report. Our agents will dissect the narrative, expose polarization, and debate the facts in real-time.
              </p>

              <form onSubmit={handleAnalyze} className="relative mt-12">
                <input
                  type="url"
                  placeholder="Paste article URL here..."
                  className="w-full h-16 pl-6 pr-32 bg-white border-2 nyt-border rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black/80 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-600 mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Perspectives */}
            <div className="lg:col-span-8 space-y-12">
              <div className="flex items-center justify-between border-b nyt-border pb-4">
                <h2 className="nyt-header text-3xl font-bold">The Narrative Spectrum</h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-black/5 rounded-full"><Share2 className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-black/5 rounded-full"><Bookmark className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {analysis.perspectives.map((p, i) => {
                  const agent = AGENTS.find(a => a.role.toLowerCase().includes(p.role.split(' / ')[0].toLowerCase()));
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <img src={agent?.avatar} alt={p.name} className="w-10 h-10 rounded-full border nyt-border" referrerPolicy="no-referrer" />
                        <div>
                          <h3 className="font-bold text-sm">{p.name}</h3>
                          <p className={`text-[10px] font-bold uppercase tracking-tighter ${agent?.color}`}>{p.role}</p>
                        </div>
                      </div>
                      <div className="font-serif text-sm leading-relaxed text-black/80">
                        {p.narrative}
                      </div>
                      <ul className="space-y-2">
                        {p.keyPoints.map((point, j) => (
                          <li key={j} className="text-xs flex gap-2">
                            <span className="text-black/30">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>

              <div className="bg-[#F2F2F2] p-8 rounded-2xl space-y-6">
                <h3 className="nyt-header text-2xl font-bold">Convergence & Divergence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Areas of Agreement</h4>
                    <p className="text-sm leading-relaxed">{analysis.convergence}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-red-700">Fundamental Disagreements</h4>
                    <p className="text-sm leading-relaxed">{analysis.divergence}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Polarization & Live Debate */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white border nyt-border p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-widest">Polarization Index</h3>
                  <div className="text-2xl font-black">{analysis.polarizationScore}%</div>
                </div>
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.polarizationScore}%` }}
                    className={`h-full ${analysis.polarizationScore > 70 ? 'bg-red-600' : analysis.polarizationScore > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Evaluator's Summary</span>
                  </div>
                  <p className="text-sm font-serif italic leading-relaxed text-black/70">
                    "{analysis.evaluatorSummary}"
                  </p>
                </div>
              </div>

              <div className="bg-black text-white p-8 rounded-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <h3 className="font-bold text-sm uppercase tracking-widest">Live Debate Ready</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  The agents have analyzed the facts. They are now ready to debate their perspectives live. You will act as the Jury.
                </p>
                <button
                  onClick={() => setShowDebate(true)}
                  className="w-full py-4 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
                >
                  Enter Live Debate <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t nyt-border pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Source Metadata</h4>
                <div className="flex items-center gap-2 text-xs text-black/60">
                  <Clock className="w-3 h-3" />
                  <span>Analyzed {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 text-xs text-black/60 truncate">
                  {url}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showDebate && analysis && (
          <LiveDebate
            analysis={analysis}
            url={url}
            onClose={() => setShowDebate(false)}
          />
        )}
      </AnimatePresence>

      <footer className="border-t nyt-border py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h1 className="nyt-header text-2xl font-black">NewsPrism</h1>
            <p className="text-xs text-black/60">© 2026 NewsPrism Corporation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
