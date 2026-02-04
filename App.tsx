
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, WorldStat, GeneratedScript } from './types';
import { fetchCurrentWorldStats, generatePythonScraper } from './services/geminiService';
import StatCard from './components/StatCard';
import CodeViewer from './components/CodeViewer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppState>(AppState.DASHBOARD);
  const [stats, setStats] = useState<WorldStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(60);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const [scriptData, setScriptData] = useState<GeneratedScript | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      const result = await fetchCurrentWorldStats();
      setStats(result.data);
      setIsFallback(result.isFallback);
      setLoadingStats(false);
    };
    loadStats();
  }, []);

  // Polling para modo Live
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isLiveMode && activeTab === AppState.DASHBOARD) {
      intervalId = setInterval(async () => {
        setIsUpdating(true);
        const result = await fetchCurrentWorldStats();
        setStats(result.data);
        setIsFallback(result.isFallback);
        setIsUpdating(false);
      }, 20000);
    }
    return () => clearInterval(intervalId);
  }, [isLiveMode, activeTab]);

  const handleRefresh = async () => {
    setIsUpdating(true);
    const result = await fetchCurrentWorldStats();
    setStats(result.data);
    setIsFallback(result.isFallback);
    setIsUpdating(false);
  };

  const handleDownloadCSV = (currentStats: WorldStat[]) => {
    if (currentStats.length === 0) return;
    const headers = ['Timestamp', 'Category', 'Label', 'Value'];
    const timestamp = new Date().toISOString();
    const rows = currentStats.map(stat => {
      const safeLabel = `"${stat.label.replace(/"/g, '""')}"`;
      const safeValue = `"${stat.value.replace(/"/g, '""')}"`;
      return `${timestamp},${stat.category},${safeLabel},${safeValue}`;
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `worldometers_full_data_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stats.map(s => s.category)));
    return ['all', ...cats];
  }, [stats]);

  const filteredStats = useMemo(() => {
    return stats.filter(stat => {
      const matchesSearch = stat.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || stat.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stats, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-sky-500/30">
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-white tracking-tight">WorldData <span className="text-sky-400">Hub</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global Intelligence Scraper</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab(AppState.DASHBOARD)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === AppState.DASHBOARD ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              DASHBOARD
            </button>
            <button
              onClick={() => { setActiveTab(AppState.GENERATOR); if (!scriptData) generatePythonScraper().then(setScriptData); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === AppState.GENERATOR ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              PYTHON API
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === AppState.DASHBOARD && (
          <div className="space-y-8 animate-fade-in">
            {/* Control Panel Superior */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      placeholder="Search across 50+ metrics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isFallback ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isFallback ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {isFallback ? 'SIMULATED DATA (RATE LIMIT)' : 'LIVE FROM WORLDOMETERS'}
                   </div>
                   <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      TOTAL METRICS: {stats.length}
                   </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</span>
                  <div className="flex gap-2">
                    <button onClick={handleRefresh} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300">
                      <svg className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h5M20 20v-5h-5M4 13a8.1 8.1 0 0015.5 2m-.5-5A8.1 8.1 0 004.5 9" /></svg>
                    </button>
                    <button onClick={() => setIsLiveMode(!isLiveMode)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${isLiveMode ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {isLiveMode ? 'LIVE: ON' : 'LIVE: OFF'}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadCSV(stats)}
                  className="w-full bg-white text-slate-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-sky-400 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export All Metrics (.csv)
                </button>
              </div>
            </div>

            {/* Grid de Resultados */}
            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredStats.map((stat, idx) => (
                  <StatCard key={`${stat.label}-${idx}`} stat={stat} isUpdating={isUpdating} />
                ))}
              </div>
            )}

            {filteredStats.length === 0 && !loadingStats && (
              <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 font-medium">No metrics match your search or category filter.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === AppState.GENERATOR && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Python Data Infrastructure</h2>
                <p className="text-slate-500 text-sm">Deploy this script to capture historical trends into your local database.</p>
              </div>
            </div>
            {scriptData ? (
              <CodeViewer {...scriptData} />
            ) : (
              <div className="flex items-center justify-center py-40">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
