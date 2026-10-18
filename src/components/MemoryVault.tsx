import React, { useState } from 'react';
import { GraphNode } from '../lib/falkordb/types';
import { globalFalkor } from '../lib/falkordb/falkorEngine';
import { Brain, Plus, Calendar, User, Tag, Link2, Sparkles, CheckCircle2, History } from 'lucide-react';

interface MemoryVaultProps {
  onMemoryAdded?: () => void;
  activeSessionId: string;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ onMemoryAdded, activeSessionId }) => {
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [speaker, setSpeaker] = useState('Elena Rostova');
  const [topic, setTopic] = useState('Production Release Exception');
  const [observation, setObservation] = useState(
    'Granted special exception for Payment Gateway v3 to deploy Tuesday 07:00 UTC with full SRE monitoring.'
  );
  const [targetSystemId, setTargetSystemId] = useState('sys_payments');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const memories = globalFalkor
    .getAllNodes()
    .filter((n) => n.labels.includes('Memory'))
    .sort((a, b) => new Date(b.properties.timestamp).getTime() - new Date(a.properties.timestamp).getTime());

  const filteredMemories =
    selectedSessionFilter === 'all'
      ? memories
      : memories.filter((m) => m.properties.sessionId === selectedSessionFilter);

  const handleRecordFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) return;

    const res = globalFalkor.recordMemory(
      activeSessionId,
      speaker,
      observation.trim(),
      topic,
      [targetSystemId]
    );

    setJustAddedId(res.memoryNode.id);
    setIsAdding(false);
    if (onMemoryAdded) onMemoryAdded();

    setTimeout(() => setJustAddedId(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <Brain className="w-4 h-4" />
              <span>Episodic Cross-Session Memory in FalkorDB</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Cross-Session Knowledge Vault
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standard agents forget instructions the moment a chat concludes. In FalkorAgent, observations and decisions
              are written into FalkorDB as persistent <span className="text-cyan-300 font-mono">:Memory</span> nodes with
              explicit <span className="text-emerald-300 font-mono">-[:REFERENCES]-&gt;</span> edges to people, systems, and policies.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Record New Memory'}</span>
          </button>
        </div>

        {/* Filter by session */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Filter by Session:</span>
          {['all', 'session-101', 'session-102', 'session-103'].map((sId) => (
            <button
              key={sId}
              onClick={() => setSelectedSessionFilter(sId)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSessionFilter === sId
                  ? 'bg-slate-700 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sId === 'all' ? 'All Sessions' : sId}
            </button>
          ))}
        </div>
      </div>

      {/* Record Fact Modal / Card */}
      {isAdding && (
        <form
          onSubmit={handleRecordFact}
          className="bg-slate-950 border border-cyan-500/40 rounded-xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Record New Fact to FalkorDB Graph</span>
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              Writing to: {activeSessionId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Speaker / Authority:
              </label>
              <select
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Elena Rostova">Elena Rostova (VP of Platform)</option>
                <option value="Marcus Chen">Marcus Chen (Staff SRE Lead)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Lead Risk Officer)</option>
                <option value="Priya Nair">Priya Nair (Payments Principal Lead)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Topic Tag:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Deployment Window Change"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Connect To Target Entity:
              </label>
              <select
                value={targetSystemId}
                onChange={(e) => setTargetSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="sys_payments">Payment Gateway v3</option>
                <option value="sys_auth">Auth0 Federated Bridge</option>
                <option value="sys_ledger">Ledger Transaction DB</option>
                <option value="sys_cache">Valkey Cache Cluster B</option>
                <option value="pol_friday_freeze">POL-19 Friday Freeze</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Observation / Learned Context:
            </label>
            <textarea
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="What did the user or leader instruct? (e.g. SRE completed cache connection pool patch; capacity increased to 30k req/s)..."
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              Commit to FalkorDB
            </button>
          </div>
        </form>
      )}

      {/* Just Added Confirmation Banner */}
      {justAddedId && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Memory node successfully created in FalkorDB with ID <strong>{justAddedId}</strong>.
            The multi-agent ecosystem will now factor this fact into future questions!
          </span>
        </div>
      )}

      {/* List of Cross-Session Memories */}
      <div className="space-y-3">
        {filteredMemories.map((mem) => {
          const isJustAdded = justAddedId === mem.id;
          return (
            <div
              key={mem.id}
              className={`p-5 rounded-xl bg-slate-900/70 border transition-all ${
                isJustAdded
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {mem.id}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {mem.properties.topic || 'General Context'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(mem.properties.timestamp).toLocaleDateString()}</span>
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[11px] text-slate-300">
                    {mem.properties.sessionId}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-normal mb-3">
                "{mem.properties.observation}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Authority: </span>
                  <strong className="text-slate-300">{mem.properties.speaker}</strong>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                  <Link2 className="w-3 h-3 text-cyan-400" />
                  <span>FalkorDB Provenance: -[:REFERENCES]-&gt; linked</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
