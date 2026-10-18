import React, { useState, useEffect, useCallback } from 'react';
import { TopBar, ActiveTab } from './components/TopBar';
import { FalkorStatsBar } from './components/FalkorStatsBar';
import { GraphCanvas } from './components/GraphCanvas';
import { AgentWorkspace } from './components/AgentWorkspace';
import { Track01Inspector } from './components/Track01Inspector';
import { ProvenanceViewer } from './components/ProvenanceViewer';
import { CypherConsole } from './components/CypherConsole';
import { MemoryVault } from './components/MemoryVault';
import { NodeDrawer } from './components/NodeDrawer';
import { ExportGraphModal } from './components/ExportGraphModal';
import { globalFalkor } from './lib/falkordb/falkorEngine';
import {
  GraphNode,
  GraphEdge,
  ProvenancePath,
  AgentRunResponse,
  FalkorEngineStats
} from './lib/falkordb/types';
import {
  runMultiAgentCoordination,
  PREBUILT_SCENARIOS,
  PrebuiltScenario
} from './lib/agents/agentCoordinator';
import {
  runTrack01AutonomousInvestigation
} from './lib/agents/autonomousInvestigator';
import { Track01InvestigationResult } from './lib/mcp/types';
import { DomainPreset } from './lib/falkordb/track01Data';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('track01');
  const [activeSessionId, setActiveSessionId] = useState<string>('session-103');
  
  // Graph state
  const [nodes, setNodes] = useState<GraphNode[]>(() => globalFalkor.getAllNodes());
  const [edges, setEdges] = useState<GraphEdge[]>(() => globalFalkor.getAllEdges());
  const [stats, setStats] = useState<FalkorEngineStats>(() => globalFalkor.getStats());

  // Interactive graph inspection
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>([]);

  // Agent execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestResponse, setLatestResponse] = useState<AgentRunResponse | null>(null);

  // Track 01 state
  const [track01Result, setTrack01Result] = useState<Track01InvestigationResult | null>(null);
  const [isGlobalExportOpen, setIsGlobalExportOpen] = useState<boolean>(false);

  // Sync graph state after mutations
  const refreshGraphState = useCallback(() => {
    setNodes(globalFalkor.getAllNodes());
    setEdges(globalFalkor.getAllEdges());
    setStats(globalFalkor.getStats());
  }, []);

  // Run initial Track 01 investigation on mount
  useEffect(() => {
    const initRun = async () => {
      setIsLoading(true);
      try {
        const res = await runTrack01AutonomousInvestigation('fraud_investigation');
        setTrack01Result(res);
        setHighlightedNodeIds(res.traversedPath.nodeIds);
        setHighlightedEdgeIds(res.traversedPath.edgeIds);
        refreshGraphState();
      } catch (err) {
        console.error('Error in Track 01 investigation:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initRun();
  }, [refreshGraphState]);

  const handleRunTrack01 = async (domainId: DomainPreset['id']) => {
    setIsLoading(true);
    try {
      const res = await runTrack01AutonomousInvestigation(domainId);
      setTrack01Result(res);
      setHighlightedNodeIds(res.traversedPath.nodeIds);
      setHighlightedEdgeIds(res.traversedPath.edgeIds);
      refreshGraphState();
    } catch (err) {
      console.error('Track 01 error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQuery = async (query: string, sessionId: string) => {
    setIsLoading(true);
    try {
      const res = await runMultiAgentCoordination(query, sessionId);
      setLatestResponse(res);
      setHighlightedNodeIds(res.provenance.nodeIds);
      setHighlightedEdgeIds(res.provenance.edgeIds);
      refreshGraphState();
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHighlightPathOnGraph = (path: ProvenancePath) => {
    setHighlightedNodeIds(path.nodeIds);
    setHighlightedEdgeIds(path.edgeIds);
    setActiveTab('graph');
    if (path.nodeIds.length > 0) {
      const target = globalFalkor.getNode(path.nodeIds[0]);
      if (target) setSelectedNode(target);
    }
  };

  const handleHighlightRawHops = (nodeIds: string[], edgeIds: string[]) => {
    setHighlightedNodeIds(nodeIds);
    setHighlightedEdgeIds(edgeIds);
    setActiveTab('graph');
    if (nodeIds.length > 0) {
      const target = globalFalkor.getNode(nodeIds[0]);
      if (target) setSelectedNode(target);
    }
  };

  const handleResetGraph = () => {
    globalFalkor.resetToDefault();
    refreshGraphState();
    setHighlightedNodeIds([]);
    setHighlightedEdgeIds([]);
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen bg-[#090e1a] text-slate-100 flex flex-col font-sans">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddMemory={() => setActiveTab('memory')}
        onTriggerPreset={() => handleRunQuery(PREBUILT_SCENARIOS[0].query, activeSessionId)}
      />

      {/* 2. FalkorDB Continuous Telemetry Bar */}
      <FalkorStatsBar
        stats={stats}
        onResetGraph={handleResetGraph}
        onOpenExport={() => setIsGlobalExportOpen(true)}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto">
        {activeTab === 'track01' && (
          <Track01Inspector
            onRunInvestigation={handleRunTrack01}
            currentResult={track01Result}
            isLoading={isLoading}
            onHighlightOnGraph={handleHighlightRawHops}
          />
        )}

        {activeTab === 'agents' && (
          <AgentWorkspace
            onRunQuery={handleRunQuery}
            isLoading={isLoading}
            latestResponse={latestResponse}
            onHighlightPathOnGraph={handleHighlightPathOnGraph}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
          />
        )}

        {activeTab === 'graph' && (
          <div className="w-full h-[calc(100vh-170px)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Interactive Property Graph View — Click any node to inspect properties & relationships</span>
              {highlightedNodeIds.length > 0 && (
                <span className="text-emerald-400 font-mono">
                  Active Highlight: {highlightedNodeIds.length} nodes, {highlightedEdgeIds.length} relationships
                </span>
              )}
            </div>
            <div className="flex-1 relative">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                highlightedNodeIds={highlightedNodeIds}
                highlightedEdgeIds={highlightedEdgeIds}
                selectedNodeId={selectedNode?.id}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          </div>
        )}

        {activeTab === 'provenance' && (
          <ProvenanceViewer
            currentPath={latestResponse?.provenance || null}
            onSelectScenario={(sc) => handleRunQuery(sc.query, activeSessionId)}
            onHighlightOnGraph={handleHighlightPathOnGraph}
          />
        )}

        {activeTab === 'cypher' && (
          <CypherConsole onGraphMutated={refreshGraphState} />
        )}

        {activeTab === 'memory' && (
          <MemoryVault
            onMemoryAdded={refreshGraphState}
            activeSessionId={activeSessionId}
          />
        )}
      </main>

      {/* Slide-over Node Inspector Drawer */}
      <NodeDrawer
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(n) => setSelectedNode(n)}
      />

      {/* Global Export Modal */}
      <ExportGraphModal
        isOpen={isGlobalExportOpen}
        onClose={() => setIsGlobalExportOpen(false)}
        filteredNodeIds={highlightedNodeIds}
      />
    </div>
  );
}
