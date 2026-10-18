import React from 'react';
import { GraphNode, GraphEdge } from '../lib/falkordb/types';
import { X, ExternalLink, ArrowRight, ArrowLeft, Tag, Layers, Database } from 'lucide-react';

interface NodeDrawerProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  edges,
  allNodes,
  onClose,
  onSelectNode,
}) => {
  if (!node) return null;

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Find incoming and outgoing edges
  const outgoing = edges.filter((e) => e.source === node.id);
  const incoming = edges.filter((e) => e.target === node.id);

  const primaryLabel = node.labels[0] || 'Node';
  const name =
    node.properties.name ||
    node.properties.title ||
    node.properties.code ||
    node.properties.topic ||
    node.id;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0c1220]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-40 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
              :{primaryLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Title & Avatar */}
        <div className="p-5 border-b border-slate-800 space-y-3">
          {node.properties.avatarUrl && (
            <img
              src={node.properties.avatarUrl}
              alt={name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 shadow-md mb-2"
            />
          )}
          <h3 className="text-lg font-bold text-white leading-snug">{name}</h3>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>ID: {node.id}</span>
            <span aria-hidden="true">·</span>
            <span>Labels: {node.labels.join(', ')}</span>
          </div>
        </div>

        {/* Scrollable Content: Properties & Connected Edges */}
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-280px)] space-y-5 text-xs">
          {/* Properties Grid */}
          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Node Properties</span>
            </h4>
            <div className="bg-slate-950/80 rounded-lg border border-slate-800/80 divide-y divide-slate-800/60 font-mono">
              {Object.entries(node.properties).map(([k, v]) => {
                if (k === 'avatarUrl') return null;
                return (
                  <div key={k} className="p-2.5 flex flex-col gap-0.5">
                    <span className="text-slate-500 text-[10px] uppercase">{k}</span>
                    <span className="text-slate-200 text-xs break-words">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outgoing Edges */}
          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Outgoing Relationships ({outgoing.length})</span>
            </h4>
            <div className="space-y-1.5">
              {outgoing.length === 0 ? (
                <span className="text-slate-500 italic block">No outgoing edges</span>
              ) : (
                outgoing.map((edge) => {
                  const targetNode = nodeMap.get(edge.target);
                  return (
                    <button
                      key={edge.id}
                      onClick={() => targetNode && onSelectNode(targetNode)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <span className="font-mono text-cyan-400 text-[11px] block">
                          -[:{edge.type}]-&gt;
                        </span>
                        <span className="text-slate-200 group-hover:text-white font-medium">
                          {targetNode?.properties.name || targetNode?.properties.title || edge.target}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Incoming Edges */}
          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>Incoming Relationships ({incoming.length})</span>
            </h4>
            <div className="space-y-1.5">
              {incoming.length === 0 ? (
                <span className="text-slate-500 italic block">No incoming edges</span>
              ) : (
                incoming.map((edge) => {
                  const srcNode = nodeMap.get(edge.source);
                  return (
                    <button
                      key={edge.id}
                      onClick={() => srcNode && onSelectNode(srcNode)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <span className="font-mono text-indigo-400 text-[11px] block">
                          &lt;-[:{edge.type}]-
                        </span>
                        <span className="text-slate-200 group-hover:text-white font-medium">
                          {srcNode?.properties.name || srcNode?.properties.title || edge.source}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>FalkorDB Node Inspector</span>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
