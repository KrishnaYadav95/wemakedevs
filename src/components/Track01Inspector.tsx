import React, { useState } from 'react';
import {
  Track01InvestigationResult,
  McpStepExecution,
  AutonomousActionReceipt
} from '../lib/mcp/types';
import {
  TRACK_01_DOMAINS,
  DomainPreset
} from '../lib/falkordb/track01Data';
import { FALKOR_MCP_TOOLS } from '../lib/mcp/falkorMcpServer';
import {
  ShieldAlert,
  Terminal,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCw,
  Flame,
  Key,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCode,
  Network
} from 'lucide-react';

interface Track01InspectorProps {
  onRunInvestigation: (domainId: DomainPreset['id']) => Promise<void>;
  currentResult: Track01InvestigationResult | null;
  isLoading: boolean;
  onHighlightOnGraph: (nodeIds: string[], edgeIds: string[]) => void;
}

export const Track01Inspector: React.FC<Track01InspectorProps> = ({
  onRunInvestigation,
  currentResult,
  isLoading,
  onHighlightOnGraph,
}) => {
  const [activeDomainId, setActiveDomainId] = useState<DomainPreset['id']>('fraud_investigation');
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [showMcpRegistry, setShowMcpRegistry] = useState(false);

  const activeDomain = TRACK_01_DOMAINS.find(d => d.id === activeDomainId) || TRACK_01_DOMAINS[0];

  const handleDomainSelect = (dId: DomainPreset['id']) => {
    setActiveDomainId(dId);
    onRunInvestigation(dId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Track 01 Lead Banner */}
      <div className="bg-[#0b1324] border border-cyan-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] uppercase font-mono tracking-wider">
                Track 01 Focus
              </span>
              <span>Agents That Act on Connected Data</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">MCP Tool Protocol</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance">
              Autonomous Agent Decision & Action Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              The agent selects graph algorithms and Cypher queries as <strong>MCP tools</strong> to reason over multi-hop
              connections, detects fraud rings or lateral breach paths, and <strong>acts decisively</strong> by quarantining entities
              and freezing compromised pipelines.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowMcpRegistry(!showMcpRegistry)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showMcpRegistry ? 'Hide MCP Tools' : 'Inspect MCP Registry (6 Tools)'}</span>
            </button>

            <button
              onClick={() => onRunInvestigation(activeDomainId)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-md"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent Reasoning & Acting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Run Investigation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Domain Switcher Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 block mb-2.5">
            Select Track 01 Problem Domain:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TRACK_01_DOMAINS.map((domain) => {
              const isSelected = activeDomainId === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => handleDomainSelect(domain.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md'
                      : 'bg-slate-900/40 hover:bg-slate-800/50 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase">
                        {domain.badge}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-200 leading-snug">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {domain.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Seed: {domain.seedEntityId}</span>
                    <span className="text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                      Investigate ➔
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MCP Tool Registry Viewer (Toggled) */}
      {showMcpRegistry && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Model Context Protocol (MCP) Tool Specification
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">protocol: JSON-RPC 2.0 (tools/list)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FALKOR_MCP_TOOLS.map((tool) => (
              <div key={tool.name} className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    {tool.name}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {tool.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tool.description}
                </p>
                <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-500">
                  required: {tool.inputSchema.required.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Investigation Results */}
      {currentResult && (
        <div className="space-y-6">
          {/* Executive Action Summary Header */}
          <div className="bg-[#0e172a] border border-cyan-800/40 rounded-xl p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Autonomous Investigation Complete</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 font-mono">{currentResult.actionsTaken.length} Decisive Actions Executed</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {currentResult.headline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentResult.executiveSummary}
              </p>
            </div>

            <button
              onClick={() => onHighlightOnGraph(currentResult.traversedPath.nodeIds, currentResult.traversedPath.edgeIds)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Show Traversed Trail on Graph</span>
            </button>
          </div>

          {/* Autonomous Actions Taken (The "ACT" requirement) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Autonomous Actions Executed in FalkorDB & Systems ({currentResult.actionsTaken.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Actions triggered automatically based on verified graph proof</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentResult.actionsTaken.map((act) => (
                <div
                  key={act.actionId}
                  className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-700/60 rounded font-mono text-xs font-bold">
                      {act.actionType}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{act.status}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Target Entity:</span>
                    <h4 className="text-sm font-bold text-white font-mono">
                      {act.targetNodeName} ({act.targetNodeId})
                    </h4>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                    <span className="text-slate-500 block mb-1">Graph Evidence Justification:</span>
                    {act.reason}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Action Node ID: {act.actionId}</span>
                    <span>{new Date(act.executedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCP Tool Selection & Multi-Hop Reasoning Trail */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Model Context Protocol (MCP) Multi-Hop Execution Chain</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Observe how the model autonomously selects tools, processes graph returns, and proceeds to the next hop.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentResult.graphMetrics.totalLatencyMs} ms</span>
              </div>
            </div>

            <div className="space-y-3">
              {currentResult.mcpSteps.map((step, idx) => {
                const isExpanded = expandedStepIndex === idx;
                const toolCat = FALKOR_MCP_TOOLS.find(t => t.name === step.mcpToolCall.toolName)?.category || 'tool';

                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                          {step.stepNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              {step.mcpToolCall.toolName}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {toolCat}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 italic">
                            "{step.thought}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                          {step.mcpToolResult.executionTimeMs}ms
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-900/40 space-y-3 text-xs">
                        {/* Parameters Sent */}
                        <div>
                          <span className="text-slate-400 font-semibold block mb-1">
                            MCP Tool Parameters Sent:
                          </span>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-200">
                            {JSON.stringify(step.mcpToolCall.arguments, null, 2)}
                          </div>
                        </div>

                        {/* Tool Result Received */}
                        <div>
                          <span className="text-slate-400 font-semibold block mb-1">
                            FalkorDB MCP Tool Result Received:
                          </span>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1">
                            {step.mcpToolResult.content.map((c, cIdx) => (
                              <div key={cIdx}>
                                {c.text && <div>{c.text}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explainable Proof & Contrast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Why This Action (2 columns) */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-cyan-800/40 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Explainable Result: Why the Agent Took This Action</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentResult.explainableProof.whyThisAction}
              </p>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Verified Multi-Hop Relational Proof Trail:
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {currentResult.explainableProof.falkorGraphProofHops.map((hop, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <span className="text-cyan-400 font-bold">#{hIdx + 1}</span>
                      <span>{hop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contrast: What Ungrounded Model Missed */}
            <div className="bg-slate-900/60 border border-rose-900/30 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 mb-2 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>The Contrast: No Graph</span>
                </div>
                <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
                  How an agent without the FalkorDB graph layer would have failed this task:
                </p>
                <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-rose-200/90 font-mono leading-relaxed">
                  "{currentResult.explainableProof.uninformedLlmContrast}"
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Failure Mode: </span>
                Without multi-hop cycle detection and shortest path algorithms, disconnected models cannot perceive criminal syndicates or lateral movement chains.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
