export interface McpToolParameter {
  type: string;
  description: string;
  required?: boolean;
  default?: any;
}

export interface McpTool {
  name: string;
  description: string;
  category: 'graph_query' | 'graph_algorithm' | 'autonomous_action' | 'system_remediation';
  inputSchema: {
    type: 'object';
    properties: Record<string, McpToolParameter>;
    required: string[];
  };
}

export interface McpToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  timestamp: string;
}

export interface McpToolResult {
  toolCallId: string;
  toolName: string;
  isError: boolean;
  content: {
    type: 'text' | 'graph_subgraph' | 'action_receipt';
    text?: string;
    data?: any;
  }[];
  graphNodesVisited?: number;
  graphRelsTraversed?: number;
  executionTimeMs?: number;
}

export interface AutonomousActionReceipt {
  actionId: string;
  actionType: 'QUARANTINE_ENTITY' | 'REVOKE_CREDENTIAL' | 'ISOLATE_CLUSTER' | 'FREEZE_PIPELINE' | 'CREATE_INCIDENT_TICKET';
  targetNodeId: string;
  targetNodeName: string;
  reason: string;
  governingGraphEvidence: string[];
  executedAt: string;
  status: 'EXECUTED_IN_GRAPH' | 'PENDING_APPROVAL';
}

export interface McpStepExecution {
  stepNumber: number;
  thought: string;
  mcpToolCall: McpToolCall;
  mcpToolResult: McpToolResult;
  graphPathSegment?: {
    fromNodeId: string;
    relType: string;
    toNodeId: string;
  };
}

export interface Track01InvestigationResult {
  investigationId: string;
  domain: 'fraud_investigation' | 'security_lateral_movement' | 'codebase_blast_radius';
  targetEntity: string;
  headline: string;
  executiveSummary: string;
  mcpSteps: McpStepExecution[];
  traversedPath: {
    nodeIds: string[];
    edgeIds: string[];
  };
  actionsTaken: AutonomousActionReceipt[];
  graphMetrics: {
    totalMcpCalls: number;
    graphNodesEvaluated: number;
    relationshipsTraversed: number;
    cyclesDetected: number;
    totalLatencyMs: number;
  };
  explainableProof: {
    whyThisAction: string;
    falkorGraphProofHops: string[];
    uninformedLlmContrast: string;
  };
}
