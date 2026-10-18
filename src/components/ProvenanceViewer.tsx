import React, { useState } from 'react';
import { ProvenancePath } from '../lib/falkordb/types';
import {
  PREBUILT_SCENARIOS,
  PrebuiltScenario
} from '../lib/agents/agentCoordinator';
import {
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Eye,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ProvenanceViewerProps {
  currentPath: ProvenancePath | null;
  onSelectScenario: (sc: PrebuiltScenario) => void;
  onHighlightOnGraph: (path: ProvenancePath) => void;
}

export const ProvenanceViewer: React.FC<ProvenanceViewerProps> = ({
  currentPath,
  onSelectScenario,
  onHighlightOnGraph,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  if (!currentPath) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl max-w-3xl mx-auto">
        <Sparkles className="w-12 h-12 text-cyan-400 mb-4 opacity-80" />
        <h3 className="text-lg font-bold text-white mb-2">
          No Provenance Path Active
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Execute a query in the Multi-Agent System or pick a scenario below to inspect how FalkorDB graphs every hop behind an answer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
          {PREBUILT_SCENARIOS.slice(0, 2).map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="p-3 text-left bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors text-xs text-slate-200"
            >
              <span className="font-semibold text-cyan-400 block mb-1">{sc.category}</span>
              <span>{sc.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeStep = currentPath.steps[selectedStepIndex] || currentPath.steps[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>FalkorDB Provenance & Explainability Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentPath.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentPath.summary} Each hop corresponds to a validated edge in the FalkorDB property graph,
              preventing hallucination by forcing the model to cite exact relational provenance.
            </p>
          </div>

          <button
            onClick={() => onHighlightOnGraph(currentPath)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Highlight Full Trail on Graph</span>
          </button>
        </div>

        {/* Global Path Stepper Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {currentPath.steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-300 text-[11px] font-mono flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{step.fromNode.properties.name || step.fromNode.id}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{step.toNode.properties.name || step.toNode.properties.title || step.toNode.properties.code || step.toNode.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deep-Dive Step Inspector */}
      {activeStep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Narrative & Reasoning (2 columns) */}
          <div className="lg:col-span-2 bg-[#0c1322] border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                  {selectedStepIndex + 1}
                </span>
                <h3 className="text-base font-bold text-white">
                  Step {selectedStepIndex + 1}: Relational Traversal Rationale
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 px-2.5 py-0.5 bg-slate-900 rounded border border-slate-700">
                Relationship: -[:{activeStep.edge.type}]-&gt;
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Why the Agent Traversed this Edge:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                {activeStep.rationale}
              </p>
            </div>

            {/* The Executed OpenCypher Pattern */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Underlying OpenCypher Execution:</span>
              </span>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                {activeStep.cypherClause}
              </div>
            </div>

            {/* Evidence Properties Cited */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extracted Node Properties & Invariants:</span>
              </span>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
                {activeStep.evidenceProperty}
              </div>
            </div>
          </div>

          {/* Connected Entities Snapshot (1 column) */}
          <div className="space-y-4">
            {/* From Node Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Origin Node ({activeStep.fromNode.labels[0]})
              </span>
              <h4 className="text-sm font-bold text-white">
                {activeStep.fromNode.properties.name || activeStep.fromNode.id}
              </h4>
              <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
                {Object.entries(activeStep.fromNode.properties).slice(0, 3).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-slate-500">{k}:</span> {String(v)}
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Card */}
            <div className="p-3 rounded-lg bg-slate-950 text-center border border-slate-800 font-mono text-xs text-cyan-400">
              ▼ -[:{activeStep.edge.type}]-&gt; ▼
            </div>

            {/* To Node Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-800/40 space-y-2">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                Destination Node ({activeStep.toNode.labels[0]})
              </span>
              <h4 className="text-sm font-bold text-white">
                {activeStep.toNode.properties.name || activeStep.toNode.properties.title || activeStep.toNode.properties.code || activeStep.toNode.id}
              </h4>
              <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
                {Object.entries(activeStep.toNode.properties).slice(0, 3).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-slate-500">{k}:</span> {String(v)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
