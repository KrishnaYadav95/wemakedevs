import React, { useState, useMemo } from 'react';
import { globalFalkor } from '../lib/falkordb/falkorEngine';
import { X, Download, Copy, Check, FileCode, FileJson, CheckCircle2, Filter } from 'lucide-react';

interface ExportGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredNodeIds?: string[];
  searchQuery?: string;
}

export const ExportGraphModal: React.FC<ExportGraphModalProps> = ({
  isOpen,
  onClose,
  filteredNodeIds = [],
  searchQuery = '',
}) => {
  const [exportFormat, setExportFormat] = useState<'cypher' | 'json'>('cypher');
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [copied, setCopied] = useState(false);

  // Compute target node IDs based on selected scope
  const targetNodeIds = useMemo(() => {
    if (scope === 'filtered' && filteredNodeIds.length > 0) {
      return filteredNodeIds;
    }
    return undefined; // export all
  }, [scope, filteredNodeIds]);

  // Generate output content
  const exportContent = useMemo(() => {
    if (!isOpen) return '';
    if (exportFormat === 'json') {
      return globalFalkor.exportToJson(targetNodeIds);
    } else {
      return globalFalkor.exportToCypherDump(targetNodeIds);
    }
  }, [isOpen, exportFormat, targetNodeIds]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `falkordb_${scope === 'filtered' ? 'subset' : 'dump'}_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
    const mimeType = exportFormat === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasFilter = filteredNodeIds.length > 0;
  const lineCount = exportContent.split('\n').length;
  const byteSize = new Blob([exportContent]).size;
  const formattedSize = byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0c1322] border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Export FalkorDB Graph Visualization
              </h3>
              <p className="text-xs text-slate-400">
                Dump property graph nodes and relationships for external graph analysis, backup, or Neo4j / FalkorDB CLI import.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format & Scope Configuration Bar */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setExportFormat('cypher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                exportFormat === 'cypher'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>OpenCypher Dump (.cypher)</span>
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                exportFormat === 'json'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Graph JSON (.json)</span>
            </button>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Export Scope:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  scope === 'all'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Entire Graph (All Nodes)
              </button>
              <button
                onClick={() => setScope('filtered')}
                disabled={!hasFilter}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  scope === 'filtered'
                    ? 'bg-slate-700 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={hasFilter ? 'Export only search matches or highlighted path' : 'Filter or search first'}
              >
                <Filter className="w-3 h-3" />
                <span>
                  Filtered Selection ({hasFilter ? filteredNodeIds.length : 0})
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Code Preview Area */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0 bg-[#080d17]">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Preview ({lineCount} lines · {formattedSize})</span>
            </span>
            <span className="text-slate-500">
              Target: {exportFormat === 'cypher' ? 'FalkorDB / Neo4j OpenCypher' : 'JSON Standard'}
            </span>
          </div>

          <div className="flex-1 overflow-auto bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-200 selection:bg-cyan-500/30">
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">
              <code>{exportContent}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Ready to import into FalkorDB via <code className="text-cyan-300">falkordb-cli</code> or read via Graph JSON parser.
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{exportFormat} File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
