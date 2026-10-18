import React from 'react';
import { Network, Database, Sparkles, Brain, Code2, Plus } from 'lucide-react';

export type ActiveTab = 'track01' | 'agents' | 'graph' | 'provenance' | 'cypher' | 'memory';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddMemory: () => void;
  onTriggerPreset: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddMemory,
  onTriggerPreset,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0e1626] border-b border-slate-800 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 inline-block" />
          <span>FalkorContext</span>
        </a>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('track01')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'track01'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
              : 'text-cyan-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono rounded bg-cyan-900/60 text-cyan-200">Track 01</span>
          <span>Agent Actions & MCP</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'agents'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Brain className="w-4 h-4 text-cyan-400" />
          <span>Multi-Agent System</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'graph'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Network className="w-4 h-4 text-emerald-400" />
          <span>FalkorDB Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'provenance'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Path Provenance</span>
        </button>

        <button
          onClick={() => setActiveTab('cypher')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'cypher'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>Cypher Console</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'memory'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>Cross-Session Memory</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenAddMemory}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Graph Fact</span>
        </button>
      </div>
    </header>
  );
};
