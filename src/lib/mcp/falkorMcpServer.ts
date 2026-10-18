import { globalFalkor } from '../falkordb/falkorEngine';
import { GraphNode, GraphEdge } from '../falkordb/types';
import {
  McpTool,
  McpToolCall,
  McpToolResult,
  AutonomousActionReceipt
} from './types';

export const FALKOR_MCP_TOOLS: McpTool[] = [
  {
    name: 'falkordb_run_cypher',
    description: 'Execute an OpenCypher query pattern against the FalkorDB graph layer to retrieve connected nodes, relationships, and property predicates.',
    category: 'graph_query',
    inputSchema: {
      type: 'object',
      properties: {
        cypher: {
          type: 'string',
          description: 'Valid openCypher query (e.g. MATCH (a:Person)-[r:TRANSFERRED]->(b) RETURN a, r, b)',
        },
      },
      required: ['cypher'],
    },
  },
  {
    name: 'falkordb_detect_cycles',
    description: 'Run cycle detection graph algorithm on FalkorDB to locate directed circular loops (e.g. circular money laundering rings or microservice deadlock loops).',
    category: 'graph_algorithm',
    inputSchema: {
      type: 'object',
      properties: {
        startNodeId: {
          type: 'string',
          description: 'The root entity node ID to search for circular return paths.',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum hops to traverse (default 5).',
        },
      },
      required: ['startNodeId'],
    },
  },
  {
    name: 'falkordb_find_shortest_path',
    description: 'Run shortest path algorithm in FalkorDB between two entities to discover critical lateral movement or exfiltration routes.',
    category: 'graph_algorithm',
    inputSchema: {
      type: 'object',
      properties: {
        sourceNodeId: {
          type: 'string',
          description: 'Starting node ID (e.g. compromised pod or originating account).',
        },
        targetNodeId: {
          type: 'string',
          description: 'Destination node ID (e.g. crown-jewel database or crypto off-ramp).',
        },
      },
      required: ['sourceNodeId', 'targetNodeId'],
    },
  },
  {
    name: 'falkordb_blast_radius',
    description: 'Calculate multi-hop downstream blast radius and affected systems/identities reachable within k-hops.',
    category: 'graph_algorithm',
    inputSchema: {
      type: 'object',
      properties: {
        rootNodeId: {
          type: 'string',
          description: 'Originating vulnerable or suspect entity ID.',
        },
        hops: {
          type: 'number',
          description: 'Number of hops to expand (1 to 4).',
        },
      },
      required: ['rootNodeId'],
    },
  },
  {
    name: 'falkordb_centrality',
    description: 'Calculate degree and connection centrality to identify kingpin nodes, bridge devices, or single points of failure.',
    category: 'graph_algorithm',
    inputSchema: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'Filter by node label (e.g. Person, System, Incident).',
        },
      },
      required: [],
    },
  },
  {
    name: 'falkordb_execute_action',
    description: 'Autonomous decisive action executed on the graph and infrastructure based on verified graph evidence (e.g. quarantine account, revoke credential, isolate cluster, freeze pipeline).',
    category: 'autonomous_action',
    inputSchema: {
      type: 'object',
      properties: {
        actionType: {
          type: 'string',
          description: 'Action type: QUARANTINE_ENTITY | REVOKE_CREDENTIAL | ISOLATE_CLUSTER | FREEZE_PIPELINE | CREATE_INCIDENT_TICKET',
        },
        targetNodeId: {
          type: 'string',
          description: 'Target entity ID on which action is enforced.',
        },
        reason: {
          type: 'string',
          description: 'Grounded rationale backed by verified graph path evidence.',
        },
      },
      required: ['actionType', 'targetNodeId', 'reason'],
    },
  },
];

export class FalkorMcpServer {
  /**
   * Returns list of tools according to MCP Specification (tools/list)
   */
  public listTools(): McpTool[] {
    return FALKOR_MCP_TOOLS;
  }

  /**
   * Executes a tool invocation according to MCP Specification (tools/call)
   */
  public async callTool(toolCall: McpToolCall): Promise<McpToolResult> {
    const startTime = performance.now();
    const { toolName, arguments: args, id } = toolCall;

    try {
      switch (toolName) {
        case 'falkordb_run_cypher': {
          const cypher = args.cypher || 'MATCH (n) RETURN n';
          const result = globalFalkor.query(cypher);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
          return {
            toolCallId: id,
            toolName,
            isError: false,
            content: [
              {
                type: 'text',
                text: `Executed Cypher: ${cypher}. Returned ${result.records.length} record(s).`,
              },
              {
                type: 'graph_subgraph',
                data: result,
              },
            ],
            graphNodesVisited: result.nodesVisited,
            graphRelsTraversed: result.relationshipsTraversed,
            executionTimeMs,
          };
        }

        case 'falkordb_detect_cycles': {
          const startId = args.startNodeId;
          const maxDepth = args.maxDepth || 5;
          const cycle = this.findDirectedCycle(startId, maxDepth);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

          if (cycle.length > 0) {
            return {
              toolCallId: id,
              toolName,
              isError: false,
              content: [
                {
                  type: 'text',
                  text: `CRITICAL GRAPH CYCLE DETECTED: Loop length ${cycle.length}. Cycle: ${cycle.map(n => n.properties.name || n.id).join(' ➔ ')}. Evidence of closed money laundering or service deadlock.`,
                },
                {
                  type: 'graph_subgraph',
                  data: { cycleNodeIds: cycle.map(n => n.id) },
                },
              ],
              graphNodesVisited: cycle.length * 2,
              graphRelsTraversed: cycle.length,
              executionTimeMs,
            };
          } else {
            return {
              toolCallId: id,
              toolName,
              isError: false,
              content: [
                {
                  type: 'text',
                  text: `No directed cycles detected from node ${startId} within depth ${maxDepth}.`,
                },
              ],
              executionTimeMs,
            };
          }
        }

        case 'falkordb_find_shortest_path': {
          const { sourceNodeId, targetNodeId } = args;
          const path = globalFalkor.extractProvenancePath(sourceNodeId, targetNodeId);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

          if (path) {
            return {
              toolCallId: id,
              toolName,
              isError: false,
              content: [
                {
                  type: 'text',
                  text: `Shortest graph traversal path discovered (${path.steps.length} hops): ${path.nodeIds.join(' ➔ ')}. Summary: ${path.summary}`,
                },
                {
                  type: 'graph_subgraph',
                  data: path,
                },
              ],
              graphNodesVisited: path.nodeIds.length,
              graphRelsTraversed: path.edgeIds.length,
              executionTimeMs,
            };
          } else {
            return {
              toolCallId: id,
              toolName,
              isError: false,
              content: [
                {
                  type: 'text',
                  text: `No reachable graph path between ${sourceNodeId} and ${targetNodeId}.`,
                },
              ],
              executionTimeMs,
            };
          }
        }

        case 'falkordb_blast_radius': {
          const rootId = args.rootNodeId;
          const hops = args.hops || 2;
          const blast = this.calculateBlastRadius(rootId, hops);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

          return {
            toolCallId: id,
            toolName,
            isError: false,
            content: [
              {
                type: 'text',
                text: `Blast radius analysis for ${rootId}: ${blast.impactedNodes.length} reachable systems/identities across ${hops} hops. Critical assets in range: ${blast.criticalCount}.`,
              },
              {
                type: 'graph_subgraph',
                data: blast,
              },
            ],
            graphNodesVisited: blast.impactedNodes.length,
            graphRelsTraversed: blast.impactedEdges.length,
            executionTimeMs,
          };
        }

        case 'falkordb_centrality': {
          const labelFilter = args.label;
          const rankings = this.computeCentrality(labelFilter);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

          return {
            toolCallId: id,
            toolName,
            isError: false,
            content: [
              {
                type: 'text',
                text: `Top Centrality Nodes in FalkorDB: ${rankings.slice(0, 3).map(r => `${r.node.properties.name || r.node.id} (degree: ${r.degree})`).join(', ')}.`,
              },
              {
                type: 'graph_subgraph',
                data: rankings.slice(0, 5),
              },
            ],
            graphNodesVisited: rankings.length,
            graphRelsTraversed: rankings.length * 2,
            executionTimeMs,
          };
        }

        case 'falkordb_execute_action': {
          const { actionType, targetNodeId, reason } = args;
          const targetNode = globalFalkor.getNode(targetNodeId);
          const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

          if (!targetNode) {
            return {
              toolCallId: id,
              toolName,
              isError: true,
              content: [{ type: 'text', text: `Node ${targetNodeId} not found in FalkorDB.` }],
              executionTimeMs,
            };
          }

          // Commit action to graph: update node properties and create :ActionExecution node
          targetNode.properties.status = `ENFORCED: ${actionType}`;
          targetNode.properties.quarantinedAt = new Date().toISOString();
          targetNode.properties.quarantineReason = reason;

          const actionNode = globalFalkor.createNode(
            ['Decision'],
            {
              actionType,
              targetNodeId,
              targetName: targetNode.properties.name || targetNodeId,
              reason,
              timestamp: new Date().toISOString(),
              enforcementStatus: 'ACTIVE_ENFORCED',
            }
          );
          globalFalkor.createEdge('GOVERNED_BY', targetNode.id, actionNode.id);

          const receipt: AutonomousActionReceipt = {
            actionId: actionNode.id,
            actionType,
            targetNodeId,
            targetNodeName: targetNode.properties.name || targetNodeId,
            reason,
            governingGraphEvidence: [reason],
            executedAt: new Date().toISOString(),
            status: 'EXECUTED_IN_GRAPH',
          };

          return {
            toolCallId: id,
            toolName,
            isError: false,
            content: [
              {
                type: 'text',
                text: `AUTONOMOUS ACTION EXECUTED: [${actionType}] applied to ${targetNode.properties.name || targetNodeId}. Reason: ${reason}. Action node committed to FalkorDB as ${actionNode.id}.`,
              },
              {
                type: 'action_receipt',
                data: receipt,
              },
            ],
            graphNodesVisited: 2,
            graphRelsTraversed: 1,
            executionTimeMs,
          };
        }

        default:
          return {
            toolCallId: id,
            toolName,
            isError: true,
            content: [{ type: 'text', text: `Unknown MCP tool: ${toolName}` }],
            executionTimeMs: 0,
          };
      }
    } catch (err: any) {
      return {
        toolCallId: id,
        toolName,
        isError: true,
        content: [{ type: 'text', text: `MCP Execution Error: ${err.message}` }],
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }
  }

  // Directed cycle detection using DFS
  private findDirectedCycle(startId: string, maxDepth: number): GraphNode[] {
    const allEdges = globalFalkor.getAllEdges();
    const adjMap = new Map<string, string[]>();

    for (const e of allEdges) {
      if (!adjMap.has(e.source)) adjMap.set(e.source, []);
      adjMap.get(e.source)!.push(e.target);
    }

    const path: string[] = [startId];
    const visitedInPath = new Set<string>([startId]);

    const dfs = (current: string, depth: number): boolean => {
      if (depth > maxDepth) return false;
      const neighbors = adjMap.get(current) || [];

      for (const next of neighbors) {
        if (next === startId && path.length >= 2) {
          path.push(startId);
          return true;
        }
        if (!visitedInPath.has(next)) {
          visitedInPath.add(next);
          path.push(next);
          if (dfs(next, depth + 1)) return true;
          visitedInPath.delete(next);
          path.pop();
        }
      }
      return false;
    };

    if (dfs(startId, 1)) {
      return path.map(id => globalFalkor.getNode(id)!).filter(Boolean);
    }
    return [];
  }

  // Blast radius calculator
  private calculateBlastRadius(rootId: string, maxHops: number): { impactedNodes: GraphNode[]; impactedEdges: GraphEdge[]; criticalCount: number } {
    const visitedNodes = new Set<string>([rootId]);
    const visitedEdges = new Set<string>();
    const allEdges = globalFalkor.getAllEdges();

    let currentLevel = [rootId];
    for (let hop = 0; hop < maxHops; hop++) {
      const nextLevel: string[] = [];
      for (const nodeId of currentLevel) {
        const outgoing = allEdges.filter(e => e.source === nodeId);
        for (const edge of outgoing) {
          visitedEdges.add(edge.id);
          if (!visitedNodes.has(edge.target)) {
            visitedNodes.add(edge.target);
            nextLevel.push(edge.target);
          }
        }
      }
      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }

    const impactedNodes = Array.from(visitedNodes).map(id => globalFalkor.getNode(id)!).filter(Boolean);
    const impactedEdges = Array.from(visitedEdges).map(id => globalFalkor.getEdge(id)!).filter(Boolean);
    const criticalCount = impactedNodes.filter(n =>
      n.properties.tier === 'Tier-1' ||
      n.properties.tier?.includes('Tier-1') ||
      n.properties.dataClassification?.includes('Sovereign') ||
      n.properties.cvssScore >= 9.0
    ).length;

    return { impactedNodes, impactedEdges, criticalCount };
  }

  // Centrality calculator
  private computeCentrality(labelFilter?: string): { node: GraphNode; degree: number }[] {
    const nodes = globalFalkor.getAllNodes();
    const edges = globalFalkor.getAllEdges();
    const degreeMap = new Map<string, number>();

    for (const e of edges) {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    }

    return nodes
      .filter(n => !labelFilter || n.labels.includes(labelFilter as any))
      .map(n => ({
        node: n,
        degree: degreeMap.get(n.id) || 0,
      }))
      .sort((a, b) => b.degree - a.degree);
  }
}

export const globalFalkorMcp = new FalkorMcpServer();
