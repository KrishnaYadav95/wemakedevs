import React, { useState } from 'react';
import { globalFalkor } from '../lib/falkordb/falkorEngine';
import { CypherQueryResult } from '../lib/falkordb/types';
import { Play, Code2, Database, Clock, Activity, CheckCircle2, Copy, Check } from 'lucide-react';

const SAMPLE_CYPHER_QUERIES = [
  {
    title: 'Find all Systems and their Owners',
    cypher: 'MATCH (p:Person)-[:OWNS]->(s:System) RETURN p.name, s.name, s.tier',
  },
  {
    title: 'Audit Governance Policies for Systems',
    cypher: 'MATCH (s:System)-[:GOVERNED_BY]->(pol:Policy) RETURN s.name, pol.code, pol.severity',
  },
  {
    title: 'Retrieve Cross-Session Episodic Memories',
    cypher: 'MATCH (m:Memory)-[:REFERENCES]->(target) RETURN m.sessionId, m.speaker, m.observation',
  },
  {
    title: 'Trace Incident Post-Mortems to Created Policies',
    cypher: 'MATCH (inc:Incident)-[:RESOLVED]->(pol:Policy) RETURN inc.title, pol.code, pol.name',
  },
  {
    title: 'Query Architectural Decisions & Authors',
    cypher: 'MATCH (p:Person)-[:AUTHOR_OF]->(d:Decision) RETURN p.name, d.code, d.title',
  },
  {
    title: 'Create New Memory Fact Node in FalkorDB',
    cypher: "CREATE (m:Memory {sessionId: 'session-103', speaker: 'Elena Rostova', observation: 'Approved Tuesday morning deployment slot for Auth0 Bridge', topic: 'Deployment Approval'})",
  },
];

interface CypherConsoleProps {
  onGraphMutated?: () => void;
}

export const CypherConsole: React.FC<CypherConsoleProps> = ({ onGraphMutated }) => {
  const [cypherText, setCypherText] = useState(
    'MATCH (p:Person)-[:OWNS]->(s:System) RETURN p.name, s.name, s.tier'
  );
  const [result, setResult] = useState<CypherQueryResult | null>(() =>
    globalFalkor.query('MATCH (p:Person)-[:OWNS]->(s:System) RETURN p.name, s.name, s.tier')
  );
  const [copied, setCopied] = useState(false);

  const handleExecute = () => {
    if (!cypherText.trim()) return;
    const queryRes = globalFalkor.query(cypherText.trim());
    setResult(queryRes);
    if (/^CREATE|^MERGE|^SET|^DELETE/i.test(cypherText.trim()) && onGraphMutated) {
      onGraphMutated();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cypherText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header and explanation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
          <Database className="w-4 h-4" />
          <span>FalkorDB OpenCypher Query Engine</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Direct Cypher Query Playground
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Execute standard openCypher graph patterns against the active enterprise context graph.
          FalkorDB stores relationships as sparse adjacency matrices for sub-millisecond multi-hop path traversals.
        </p>

        {/* Query Library */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Sample OpenCypher Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CYPHER_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCypherText(sample.cypher);
                  const res = globalFalkor.query(sample.cypher);
                  setResult(res);
                  if (/^CREATE|^MERGE/i.test(sample.cypher) && onGraphMutated) {
                    onGraphMutated();
                  }
                }}
                className="px-3 py-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700/80 transition-colors whitespace-nowrap shrink-0"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Editor Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>falkordb-cli // graph: enterprise_context_graph</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Copy Query"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExecute}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Cypher</span>
            </button>
          </div>
        </div>

        <textarea
          value={cypherText}
          onChange={(e) => setCypherText(e.target.value)}
          rows={3}
          className="w-full p-4 bg-slate-950 text-cyan-200 font-mono text-xs focus:outline-none resize-none selection:bg-cyan-500/30"
          placeholder="MATCH (n) RETURN n"
        />
      </div>

      {/* Query Results & Telemetry */}
      {result && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md space-y-4 p-5">
          {/* Result Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Success</span>
              </span>
              <span>{result.records.length} record(s) returned</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{result.nodesVisited} nodes visited</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{result.relationshipsTraversed} rels traversed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">{result.executionTimeMs} ms</span>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  {result.columns.map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3 font-semibold text-slate-400 font-mono">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {result.records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={result.columns.length}
                      className="py-8 text-center text-slate-500 italic"
                    >
                      No records matched this Cypher pattern.
                    </td>
                  </tr>
                ) : (
                  result.records.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-200">
                          {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
