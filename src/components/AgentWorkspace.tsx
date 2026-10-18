import React, { useState } from 'react';
import {
  AgentRunResponse,
  AgentObservation,
  ProvenancePath
} from '../lib/falkordb/types';
import {
  PREBUILT_SCENARIOS,
  PrebuiltScenario
} from '../lib/agents/agentCoordinator';
import {
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Layers,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

interface AgentWorkspaceProps {
  onRunQuery: (query: string, sessionId: string) => Promise<void>;
  isLoading: boolean;
  latestResponse: AgentRunResponse | null;
  onHighlightPathOnGraph: (path: ProvenancePath) => void;
  activeSessionId: string;
  setActiveSessionId: (sId: string) => void;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  onRunQuery,
  isLoading,
  latestResponse,
  onHighlightPathOnGraph,
  activeSessionId,
  setActiveSessionId,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onRunQuery(inputQuery.trim(), activeSessionId);
  };

  const handleSelectScenario = (sc: PrebuiltScenario) => {
    setInputQuery(sc.query);
    onRunQuery(sc.query, activeSessionId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Hero Problem-to-Shift Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span>FalkorDB Context Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Session {activeSessionId}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">OpenCypher GraphBLAS Layer</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance">
              Give your agent the context to act
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Without a graph, agents see disconnected pieces and hallucinate answers.
              FalkorDB gives our multi-agent team persistent relational context: following multi-hop connections,
              recalling memories across sessions, and proving every decision through graph paths.
            </p>
          </div>

          {/* Session Switcher Pill */}
          <div className="flex flex-col gap-2 shrink-0 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active Graph Session:</span>
            <div className="flex items-center gap-1.5">
              {['session-101', 'session-102', 'session-103'].map((sId) => (
                <button
                  key={sId}
                  onClick={() => setActiveSessionId(sId)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeSessionId === sId
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  {sId === 'session-101' && 'S-101 (3d ago)'}
                  {sId === 'session-102' && 'S-102 (Yesterday)'}
                  {sId === 'session-103' && 'S-103 (Active)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Pre-built Enterprise Scenarios */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400">
            Test Real Graph-Shaped Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5">
            {PREBUILT_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className="text-left p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-cyan-400 mb-1 block">
                    {sc.category}
                  </span>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                    {sc.title}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800">
                  <span className="truncate">{sc.targetStartNode.replace('sys_', '').replace('person_', '')}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 shadow-md">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask the multi-agent team anything (e.g. Can Payments deploy on Friday at 4 PM?)..."
            className="w-full px-5 py-4 text-sm bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="mr-3 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Traversing FalkorDB...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute Query</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Results Section */}
      {latestResponse && (
        <div className="space-y-6">
          {/* FalkorDB Traversal Telemetry Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-semibold">Graph Execution Metrics:</span>
              <span>{latestResponse.stats.totalGraphQueries} Cypher Queries</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{latestResponse.stats.nodesTraversed} Nodes Visited</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{latestResponse.stats.edgesTraversed} Relationships Traversed</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{latestResponse.stats.falkorMemoryNodesReferenced} Memories Recalled</span>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{latestResponse.stats.latencyMs} ms latency</span>
            </div>
          </div>

          {/* Side-by-Side: Graph-Grounded Answer vs Ungrounded LLM Guess */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grounded FalkorDB Answer (2 columns) */}
            <div className="lg:col-span-2 bg-[#0d1527] border border-cyan-500/30 rounded-xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-base font-bold text-white">
                      Verified Multi-Agent Answer (FalkorDB Context)
                    </h2>
                  </div>
                  <button
                    onClick={() => onHighlightPathOnGraph(latestResponse.provenance)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Path on Graph</span>
                  </button>
                </div>

                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                  {latestResponse.answer}
                </div>
              </div>

              {/* Provenance Quick Breadcrumb */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Traversed Path Provenance:
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {latestResponse.provenance.steps.length} verified hops
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {latestResponse.provenance.nodeIds.map((nId, idx) => (
                    <React.Fragment key={nId}>
                      <span className="px-2.5 py-1 bg-slate-800 rounded font-mono text-slate-300 border border-slate-700">
                        {nId}
                      </span>
                      {idx < latestResponse.provenance.nodeIds.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Ungrounded Guess Card (1 column - The Contrast) */}
            <div className="bg-slate-900/60 border border-rose-900/30 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 mb-3 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Without FalkorDB (Ungrounded Guess)</span>
                </div>
                <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
                  How standard LLMs fail because they lack the graph context, cannot see historical incident post-mortems, and forget earlier session directives:
                </p>
                <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-rose-200/90 font-mono leading-relaxed">
                  {latestResponse.ungroundedGuess}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Failure Mode: </span>
                Misses POL-19 Friday freeze, forgets INC-402 $480k outage, and ignores Elena Rostova's Session #101 memory.
              </div>
            </div>
          </div>

          {/* Multi-Agent Shared Blackboard (The 4 Agents) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Shared Agent State (FalkorDB Blackboard)</span>
              </h3>
              <span className="text-xs text-slate-400">
                4 Specialized Agents querying and updating the shared graph
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestResponse.agentObservations.map((obs) => {
                const isBlocked = obs.verdict === 'blocked';
                const isWarning = obs.verdict === 'warning';
                return (
                  <div
                    key={obs.agentId}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">
                          {obs.agentName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isBlocked
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : isWarning
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {obs.verdict}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {obs.findings}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400 truncate" title={obs.cypherQuery}>
                      <span className="text-cyan-400">Cypher: </span>
                      {obs.cypherQuery}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Path Provenance Accordion */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>The Path Behind the Answer (Explainable Provenance)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect the precise node-to-node traversals, Cypher pattern matches, and verified evidence.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {latestResponse.provenance.steps.map((step, idx) => {
                const isExpanded = expandedStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-lg bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-white">
                            <span>{step.fromNode.properties.name || step.fromNode.id}</span>
                            <span className="text-cyan-400 font-mono">-[{step.edge.type}]-&gt;</span>
                            <span>{step.toNode.properties.name || step.toNode.properties.title || step.toNode.properties.code || step.toNode.id}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {step.rationale}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-900/40 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400 block mb-1">OpenCypher Clause:</span>
                            <span className="text-cyan-300">{step.cypherClause}</span>
                          </div>
                          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]">
                            <span className="text-slate-400 block mb-1">Verified Properties:</span>
                            <span className="text-emerald-300">{step.evidenceProperty}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
