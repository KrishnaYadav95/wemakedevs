export type NodeLabel = 
  | 'Person' 
  | 'System' 
  | 'Policy' 
  | 'Incident' 
  | 'Decision' 
  | 'Memory' 
  | 'Agent' 
  | 'Task' 
  | 'Observation'
  | 'Team';

export type RelationshipType = 
  | 'OWNS' 
  | 'DEPENDS_ON' 
  | 'GOVERNED_BY' 
  | 'IMPACTED_BY' 
  | 'RESOLVED' 
  | 'AUTHOR_OF' 
  | 'REMEMBERS' 
  | 'REPORTS_TO' 
  | 'MEMBER_OF' 
  | 'REFERENCES' 
  | 'BLOCKED_BY' 
  | 'EXECUTES' 
  | 'POSTED' 
  | 'VERIFIED';

export interface GraphNode {
  id: string;
  labels: NodeLabel[];
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  type: RelationshipType | string;
  source: string; // source node id
  target: string; // target node id
  properties: Record<string, any>;
}

export interface GraphPathStep {
  fromNode: GraphNode;
  edge: GraphEdge;
  toNode: GraphNode;
  rationale: string;
  cypherClause?: string;
  evidenceProperty?: string;
}

export interface ProvenancePath {
  id: string;
  title: string;
  summary: string;
  steps: GraphPathStep[];
  nodeIds: string[];
  edgeIds: string[];
  confidence: number;
  cypherExecuted: string;
}

export interface CypherQueryResult {
  columns: string[];
  records: any[][];
  executionTimeMs: number;
  nodesVisited: number;
  relationshipsTraversed: number;
  cypher: string;
  graphSnippet?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface FalkorEngineStats {
  engine: 'FalkorDB v6.8' | 'Embedded FalkorDB GraphBLAS';
  activeGraph: string;
  totalNodes: number;
  totalEdges: number;
  labels: string[];
  relationshipTypes: string[];
  memoryUsageKb: number;
  sparseAdjacencyMatricesCount: number;
  lastQueryTimeMs: number;
  connectedRemote: boolean;
}

export interface AgentObservation {
  agentId: string;
  agentName: string;
  role: 'Architect' | 'Risk & Compliance' | 'People & Ownership' | 'Episodic Memory' | 'Chief Coordinator';
  cypherQuery: string;
  traversedPath: string[]; // node ids
  findings: string;
  verdict: 'clear' | 'warning' | 'blocked' | 'informative';
  createdNodeId?: string;
}

export interface AgentRunResponse {
  query: string;
  sessionId: string;
  answer: string;
  ungroundedGuess: string; // The contrast: what a naive LLM with no graph context would say
  provenance: ProvenancePath;
  agentObservations: AgentObservation[];
  stats: {
    totalGraphQueries: number;
    nodesTraversed: number;
    edgesTraversed: number;
    latencyMs: number;
    falkorMemoryNodesReferenced: number;
  };
}
