import React from 'react';
import { FalkorEngineStats } from '../lib/falkordb/types';
import { Database, Activity, RefreshCw, Cpu, Layers } from 'lucide-react';

interface FalkorStatsBarProps {
  stats: FalkorEngineStats;
  onResetGraph: () => void;
  onOpenExport?: () => void;
}

export const FalkorStatsBar: React.FC<FalkorStatsBarProps> = ({ stats, onResetGraph, onOpenExport }) => {
  return (
    <div className="w-full bg-[#080d18] border-b border-slate-800/80 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
          <Database className="w-3.5 h-3.5" />
          <span>FalkorDB Engine: {stats.engine}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Active Graph:</span>
          <span className="font-mono text-slate-200">{stats.activeGraph}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <span className="text-slate-500">Nodes:</span>
          <span className="text-emerald-400 font-semibold">{stats.totalNodes}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <span className="text-slate-500">Edges:</span>
          <span className="text-emerald-400 font-semibold">{stats.totalEdges}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 font-mono tabular-nums">
          <span className="text-slate-500">Sparse Matrices:</span>
          <span className="text-cyan-300">{stats.sparseAdjacencyMatricesCount}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 font-mono tabular-nums">
          <span className="text-slate-500">Memory:</span>
          <span className="text-slate-300">{stats.memoryUsageKb} KB</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Last Query: {stats.lastQueryTimeMs} ms</span>
        </div>

        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:text-white rounded hover:bg-slate-800/80 transition-colors border border-slate-700/80"
            title="Export graph as JSON or Cypher dump file"
          >
            <span>Export Dump</span>
          </button>
        )}

        <button
          onClick={onResetGraph}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-white rounded hover:bg-slate-800/80 transition-colors border border-slate-800"
          title="Reset graph to seed corporate context"
        >
          <RefreshCw className="w-3 h-3 text-slate-500" />
          <span>Reset Graph</span>
        </button>
      </div>
    </div>
  );
};
