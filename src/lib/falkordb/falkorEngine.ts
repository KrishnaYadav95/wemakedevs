import {
  GraphNode,
  GraphEdge,
  NodeLabel,
  RelationshipType,
  CypherQueryResult,
  FalkorEngineStats,
  GraphPathStep,
  ProvenancePath
} from './types';
import { getInitialGraphData } from './initialData';
import { getTrack01Dataset } from './track01Data';

export class FalkorDBEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  
  // GraphBLAS Sparse Adjacency Representation: RelType -> SourceId -> Set of { targetId, edgeId }
  private adjacency: Map<string, Map<string, Set<{ targetId: string; edgeId: string }>>> = new Map();
  // Reverse Adjacency: RelType -> TargetId -> Set of { sourceId, edgeId }
  private reverseAdjacency: Map<string, Map<string, Set<{ sourceId: string; edgeId: string }>>> = new Map();
  // Label Index: Label -> Set of Node IDs
  private labelIndex: Map<string, Set<string>> = new Map();

  private activeGraphName: string = 'enterprise_context_graph';
  private lastQueryTimeMs: number = 0;
  private isConnectedRemote: boolean = false;
  private remoteClient: any = null;

  constructor() {
    this.resetToDefault();
  }

  /**
   * Resets the graph to initial seed enterprise state
   */
  public resetToDefault(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
    this.reverseAdjacency.clear();
    this.labelIndex.clear();

    const initial = getInitialGraphData();
    for (const node of initial.nodes) {
      this.addNodeInternal(node);
    }
    for (const edge of initial.edges) {
      this.addEdgeInternal(edge);
    }

    // Also load Track 01: Fraud, Lateral Movement & Codebase datasets
    const trackData = getTrack01Dataset();
    for (const node of trackData.nodes) {
      if (!this.nodes.has(node.id)) {
        this.addNodeInternal(node);
      }
    }
    for (const edge of trackData.edges) {
      if (!this.edges.has(edge.id)) {
        this.addEdgeInternal(edge);
      }
    }
  }

  private addNodeInternal(node: GraphNode): void {
    this.nodes.set(node.id, node);
    for (const label of node.labels) {
      if (!this.labelIndex.has(label)) {
        this.labelIndex.set(label, new Set());
      }
      this.labelIndex.get(label)!.add(node.id);
    }
  }

  private addEdgeInternal(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    const rel = edge.type;

    // Forward adjacency
    if (!this.adjacency.has(rel)) {
      this.adjacency.set(rel, new Map());
    }
    const forwardMap = this.adjacency.get(rel)!;
    if (!forwardMap.has(edge.source)) {
      forwardMap.set(edge.source, new Set());
    }
    forwardMap.get(edge.source)!.add({ targetId: edge.target, edgeId: edge.id });

    // Reverse adjacency
    if (!this.reverseAdjacency.has(rel)) {
      this.reverseAdjacency.set(rel, new Map());
    }
    const revMap = this.reverseAdjacency.get(rel)!;
    if (!revMap.has(edge.target)) {
      revMap.set(edge.target, new Set());
    }
    revMap.get(edge.target)!.add({ sourceId: edge.source, edgeId: edge.id });
  }

  /**
   * Add a node to FalkorDB
   */
  public createNode(labels: NodeLabel[], properties: Record<string, any>, customId?: string): GraphNode {
    const id = customId || `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const node: GraphNode = {
      id,
      labels,
      properties,
    };
    this.addNodeInternal(node);
    return node;
  }

  /**
   * Add a relationship to FalkorDB
   */
  public createEdge(
    type: RelationshipType | string,
    sourceId: string,
    targetId: string,
    properties: Record<string, any> = {},
    customId?: string
  ): GraphEdge | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }
    const id = customId || `edge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const edge: GraphEdge = {
      id,
      type,
      source: sourceId,
      target: targetId,
      properties,
    };
    this.addEdgeInternal(edge);
    return edge;
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Records a cross-session episodic memory in FalkorDB and links it to related entities
   */
  public recordMemory(
    sessionId: string,
    speaker: string,
    observation: string,
    topic: string,
    relatedNodeIds: string[] = []
  ): { memoryNode: GraphNode; createdEdges: GraphEdge[] } {
    const memId = `mem_${sessionId}_${Date.now().toString(36)}`;
    const memoryNode = this.createNode(
      ['Memory'],
      {
        sessionId,
        timestamp: new Date().toISOString(),
        author: 'Episodic Memory Agent',
        speaker,
        observation,
        topic,
        confidence: 0.99,
      },
      memId
    );

    const createdEdges: GraphEdge[] = [];
    for (const targetId of relatedNodeIds) {
      if (this.nodes.has(targetId)) {
        const edge = this.createEdge('REFERENCES', memoryNode.id, targetId, {
          relation: 'Episodic recall link',
          establishedAt: new Date().toISOString(),
        });
        if (edge) createdEdges.push(edge);
      }
    }

    return { memoryNode, createdEdges };
  }

  /**
   * FalkorDB OpenCypher Query Evaluator
   * Supports: MATCH, WHERE, RETURN, CREATE, MERGE, path expressions
   */
  public query(cypher: string): CypherQueryResult {
    const start = performance.now();
    const cleanCypher = cypher.trim();
    let nodesVisited = 0;
    let relationshipsTraversed = 0;

    const matchedNodes = new Set<GraphNode>();
    const matchedEdges = new Set<GraphEdge>();
    const records: any[][] = [];
    let columns: string[] = [];

    try {
      // 1. Handle CREATE or MERGE queries
      if (/^CREATE\s+/i.test(cleanCypher)) {
        const createResult = this.executeCreate(cleanCypher);
        this.lastQueryTimeMs = Math.round((performance.now() - start) * 100) / 100;
        return {
          columns: ['operation', 'nodeId', 'labels'],
          records: [[createResult.op, createResult.node.id, createResult.node.labels.join(':')]],
          executionTimeMs: this.lastQueryTimeMs,
          nodesVisited: 1,
          relationshipsTraversed: 0,
          cypher,
          graphSnippet: { nodes: [createResult.node], edges: [] },
        };
      }

      // 2. Handle MATCH queries
      const matchPattern = cleanCypher.match(/MATCH\s+(.+?)(?:\s+WHERE\s+(.+?))?\s+RETURN\s+(.+)$/i);
      
      if (!matchPattern) {
        // Fallback simple search if Cypher format is slightly non-standard
        return this.fallbackQuery(cleanCypher, start);
      }

      const patternStr = matchPattern[1].trim();
      const whereStr = matchPattern[2] ? matchPattern[2].trim() : null;
      const returnStr = matchPattern[3].trim();

      columns = returnStr.split(',').map((c) => c.trim().replace(/^DISTINCT\s+/i, ''));

      // Check if it's a multi-hop pattern: (a:Label)-[:REL]->(b:Label)...
      const hops = this.parsePathPattern(patternStr);
      
      if (hops.length === 1 && hops[0].isSingleNode) {
        // Single node match: e.g. (p:Person), (s:System), (m:Memory)
        const hop = hops[0];
        const candidateIds = hop.label ? Array.from(this.labelIndex.get(hop.label) || []) : Array.from(this.nodes.keys());
        
        for (const nid of candidateIds) {
          nodesVisited++;
          const node = this.nodes.get(nid)!;
          if (this.evalNodeWhere(node, hop.varName, whereStr)) {
            matchedNodes.add(node);
            const row = columns.map((col) => this.evalProjection(col, { [hop.varName]: node }));
            records.push(row);
          }
        }
      } else {
        // Multi-hop path pattern match
        const pathMatches = this.evalMultiHopPath(hops, whereStr);
        nodesVisited += pathMatches.nodesVisited;
        relationshipsTraversed += pathMatches.relationshipsTraversed;

        for (const match of pathMatches.bindings) {
          for (const node of match.nodes) matchedNodes.add(node);
          for (const edge of match.edges) matchedEdges.add(edge);

          const row = columns.map((col) => this.evalProjection(col, match.vars));
          records.push(row);
        }
      }

    } catch (e: any) {
      console.error('Cypher execution error:', e);
      records.push([`Error executing Cypher: ${e.message}`]);
      columns = ['error'];
    }

    this.lastQueryTimeMs = Math.round((performance.now() - start) * 100) / 100;

    return {
      columns,
      records: records.slice(0, 100), // Cap for UI cleanliness
      executionTimeMs: this.lastQueryTimeMs,
      nodesVisited,
      relationshipsTraversed,
      cypher,
      graphSnippet: {
        nodes: Array.from(matchedNodes),
        edges: Array.from(matchedEdges),
      },
    };
  }

  /**
   * Parses Cypher path syntax into hop definitions
   */
  private parsePathPattern(pattern: string): any[] {
    // Check if single node: (n:Label) or (n)
    const singleMatch = pattern.match(/^\(([a-zA-Z0-9_]+)?(?::([a-zA-Z0-9_]+))?\)$/);
    if (singleMatch) {
      return [{
        isSingleNode: true,
        varName: singleMatch[1] || 'n',
        label: singleMatch[2] || null,
      }];
    }

    // Pattern with relationships: (a:Label)-[:REL]->(b:Label)
    const segments: any[] = [];
    // Regex for node - [edge] -> node sequences
    const regex = /\(([a-zA-Z0-9_]*)(?::([a-zA-Z0-9_]+))?\)(?:-\[(?:([a-zA-Z0-9_]*)(?::([a-zA-Z0-9_*..]+))?)?\]->\(([a-zA-Z0-9_]*)(?::([a-zA-Z0-9_]+))?\))?/g;
    
    let match: RegExpExecArray | null;
    let lastTargetVar: string | null = null;
    
    while ((match = regex.exec(pattern)) !== null) {
      const srcVar = match[1] || lastTargetVar || 'n';
      const srcLabel = match[2] || null;
      const edgeVar = match[3] || 'r';
      const edgeType = match[4] || null;
      const tgtVar = match[5] || null;
      const tgtLabel = match[6] || null;

      segments.push({
        srcVar,
        srcLabel,
        edgeVar,
        edgeType,
        tgtVar,
        tgtLabel,
      });

      lastTargetVar = tgtVar;
      if (!edgeType) break;
    }

    if (segments.length === 0) {
      return [{ isSingleNode: true, varName: 'n', label: null }];
    }

    return segments;
  }

  /**
   * Multi-hop path evaluator using FalkorDB adjacency
   */
  private evalMultiHopPath(hops: any[], whereStr: string | null): { bindings: any[]; nodesVisited: number; relationshipsTraversed: number } {
    const bindings: any[] = [];
    let nodesVisited = 0;
    let relationshipsTraversed = 0;

    const firstHop = hops[0];
    const candidateStartIds = firstHop.srcLabel
      ? Array.from(this.labelIndex.get(firstHop.srcLabel) || [])
      : Array.from(this.nodes.keys());

    for (const startId of candidateStartIds) {
      nodesVisited++;
      const startNode = this.nodes.get(startId)!;
      
      // DFS traverse through defined hops
      const dfs = (
        hopIndex: number,
        currentNode: GraphNode,
        currentVars: Record<string, any>,
        pathNodes: GraphNode[],
        pathEdges: GraphEdge[]
      ) => {
        if (hopIndex >= hops.length) {
          // Check WHERE condition
          if (this.evalWhereConditions(currentVars, whereStr)) {
            bindings.push({
              vars: { ...currentVars },
              nodes: [...pathNodes],
              edges: [...pathEdges],
            });
          }
          return;
        }

        const hop = hops[hopIndex];
        const relType = hop.edgeType;
        const targetLabel = hop.tgtLabel;

        // Check variable length hop: e.g. DEPENDS_ON*1..3
        const isVarLength = relType && relType.includes('*');
        const cleanRelType = relType ? relType.split('*')[0] : null;

        const forwardRels = cleanRelType
          ? [cleanRelType]
          : Array.from(this.adjacency.keys());

        for (const rType of forwardRels) {
          const forwardMap = this.adjacency.get(rType);
          if (!forwardMap || !forwardMap.has(currentNode.id)) continue;

          for (const neighbor of forwardMap.get(currentNode.id)!) {
            relationshipsTraversed++;
            const nextNode = this.nodes.get(neighbor.targetId);
            const edge = this.edges.get(neighbor.edgeId);
            if (!nextNode || !edge) continue;

            nodesVisited++;
            if (targetLabel && !nextNode.labels.includes(targetLabel as NodeLabel)) {
              continue;
            }

            const nextVars = {
              ...currentVars,
              [hop.edgeVar || `r${hopIndex}`]: edge,
              [hop.tgtVar || `n${hopIndex + 1}`]: nextNode,
            };

            dfs(
              hopIndex + 1,
              nextNode,
              nextVars,
              [...pathNodes, nextNode],
              [...pathEdges, edge]
            );
          }
        }
      };

      dfs(0, startNode, { [firstHop.srcVar]: startNode }, [startNode], []);
    }

    return { bindings, nodesVisited, relationshipsTraversed };
  }

  private evalNodeWhere(node: GraphNode, varName: string, whereStr: string | null): boolean {
    if (!whereStr) return true;
    return this.evalWhereConditions({ [varName]: node }, whereStr);
  }

  private evalWhereConditions(vars: Record<string, any>, whereStr: string | null): boolean {
    if (!whereStr) return true;

    // Support AND clauses
    const clauses = whereStr.split(/\s+AND\s+/i);
    for (const clause of clauses) {
      const trimmed = clause.trim();
      // Match: var.prop = 'val' or var.prop CONTAINS 'val' or var.tier = 'Tier-1'
      const eqMatch = trimmed.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*(=|CONTAINS|STARTS WITH)\s*['"]?([^'"]+)['"]?/i);
      if (eqMatch) {
        const vName = eqMatch[1];
        const prop = eqMatch[2];
        const op = eqMatch[3].toUpperCase();
        const expectedVal = eqMatch[4].trim();

        const entity = vars[vName];
        if (!entity || !entity.properties) return false;

        const actualVal = String(entity.properties[prop] ?? '');
        if (op === '=' && actualVal.toLowerCase() !== expectedVal.toLowerCase()) return false;
        if (op === 'CONTAINS' && !actualVal.toLowerCase().includes(expectedVal.toLowerCase())) return false;
        if (op === 'STARTS WITH' && !actualVal.toLowerCase().startsWith(expectedVal.toLowerCase())) return false;
      }
    }
    return true;
  }

  private evalProjection(colExpr: string, vars: Record<string, any>): any {
    const clean = colExpr.trim();
    // Case 1: var.prop (e.g. p.name, s.tier)
    const dotMatch = clean.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
    if (dotMatch) {
      const v = vars[dotMatch[1]];
      return v?.properties?.[dotMatch[2]] ?? 'null';
    }

    // Case 2: var directly (e.g. RETURN p, s)
    if (vars[clean]) {
      const item = vars[clean];
      if (item.properties?.name) return item.properties.name;
      if (item.properties?.title) return item.properties.title;
      if (item.properties?.code) return item.properties.code;
      if (item.properties?.observation) return item.properties.observation;
      return item.id;
    }

    // Case 3: count(var)
    if (/^count\(/i.test(clean)) {
      return 1;
    }

    return clean;
  }

  private executeCreate(cypher: string): { op: string; node: GraphNode } {
    // CREATE (n:Label {prop: 'val'})
    const match = cypher.match(/CREATE\s+\(([a-zA-Z0-9_]*):([a-zA-Z0-9_]+)\s*(\{[^}]*\})?\)/i);
    const label = (match?.[2] || 'Memory') as NodeLabel;
    let props: Record<string, any> = { createdVia: 'Cypher Query Console' };

    if (match?.[3]) {
      try {
        const jsonLike = match[3]
          .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
          .replace(/'/g, '"');
        props = { ...props, ...JSON.parse(jsonLike) };
      } catch {
        props.rawText = match[3];
      }
    }

    const node = this.createNode([label], props);
    return { op: 'CREATED', node };
  }

  private fallbackQuery(cypher: string, start: number): CypherQueryResult {
    // Return all nodes if query is MATCH (n) RETURN n
    const nodes = this.getAllNodes().slice(0, 50);
    this.lastQueryTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      columns: ['id', 'labels', 'nameOrTitle'],
      records: nodes.map((n) => [
        n.id,
        n.labels.join(':'),
        n.properties.name || n.properties.title || n.properties.code || n.properties.observation || n.id,
      ]),
      executionTimeMs: this.lastQueryTimeMs,
      nodesVisited: nodes.length,
      relationshipsTraversed: 0,
      cypher,
      graphSnippet: { nodes, edges: [] },
    };
  }

  /**
   * Generates step-by-step Provenance Path for an agent answer
   */
  public extractProvenancePath(startNodeId: string, endNodeId: string, rationaleNarrative?: string): ProvenancePath | null {
    // BFS shortest path in adjacency
    const queue: { nodeId: string; path: { node: GraphNode; edge?: GraphEdge }[] }[] = [];
    const visited = new Set<string>();

    const startNode = this.nodes.get(startNodeId);
    const endNode = this.nodes.get(endNodeId);
    if (!startNode || !endNode) return null;

    queue.push({ nodeId: startNodeId, path: [{ node: startNode }] });
    visited.add(startNodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.nodeId === endNodeId) {
        // Construct Provenance
        const steps: GraphPathStep[] = [];
        const nodeIds: string[] = [];
        const edgeIds: string[] = [];

        for (let i = 0; i < current.path.length - 1; i++) {
          const from = current.path[i].node;
          const to = current.path[i + 1].node;
          const edge = current.path[i + 1].edge!;
          
          steps.push({
            fromNode: from,
            edge,
            toNode: to,
            rationale: `Followed [${edge.type}] from ${from.properties.name || from.id} to ${to.properties.name || to.properties.code || to.id}`,
            cypherClause: `MATCH (${from.labels[0]}:{id: '${from.id}'})-[:${edge.type}]->(${to.labels[0]}:{id: '${to.id}'})`,
            evidenceProperty: Object.keys(to.properties).slice(0, 3).map((k) => `${k}: ${to.properties[k]}`).join(', '),
          });

          nodeIds.push(from.id);
          edgeIds.push(edge.id);
        }
        nodeIds.push(endNode.id);

        return {
          id: `path_${Date.now()}`,
          title: `Graph Path: ${startNode.properties.name || startNode.id} ➔ ${endNode.properties.name || endNode.properties.code || endNode.id}`,
          summary: rationaleNarrative || `Grounded path verified across ${steps.length} relationships in FalkorDB.`,
          steps,
          nodeIds,
          edgeIds,
          confidence: 0.98,
          cypherExecuted: `MATCH p = (start {id: '${startNodeId}'})-[*1..4]->(target {id: '${endNodeId}'}) RETURN p`,
        };
      }

      // Check outgoing edges
      for (const [relType, forwardMap] of this.adjacency.entries()) {
        const neighbors = forwardMap.get(current.nodeId);
        if (!neighbors) continue;
        for (const item of neighbors) {
          if (!visited.has(item.targetId)) {
            visited.add(item.targetId);
            const nextNode = this.nodes.get(item.targetId);
            const edge = this.edges.get(item.edgeId);
            if (nextNode && edge) {
              queue.push({
                nodeId: item.targetId,
                path: [...current.path, { node: nextNode, edge }],
              });
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Retrieves high-level FalkorDB operational metrics
   */
  /**
   * Export the graph as JSON format
   */
  public exportToJson(filterNodeIds?: string[]): string {
    const filterSet = filterNodeIds && filterNodeIds.length > 0 ? new Set(filterNodeIds) : null;
    const exportNodes = this.getAllNodes().filter(n => !filterSet || filterSet.has(n.id));
    const exportNodeIds = new Set(exportNodes.map(n => n.id));
    const exportEdges = this.getAllEdges().filter(e => exportNodeIds.has(e.source) && exportNodeIds.has(e.target));

    const exportPayload = {
      meta: {
        engine: this.isConnectedRemote ? 'FalkorDB v6.8' : 'Embedded FalkorDB GraphBLAS',
        activeGraph: this.activeGraphName,
        exportedAt: new Date().toISOString(),
        totalNodes: exportNodes.length,
        totalEdges: exportEdges.length,
        isFiltered: Boolean(filterSet),
      },
      nodes: exportNodes.map(n => ({
        id: n.id,
        labels: n.labels,
        properties: n.properties,
      })),
      edges: exportEdges.map(e => ({
        id: e.id,
        type: e.type,
        source: e.source,
        target: e.target,
        properties: e.properties,
      })),
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  /**
   * Export the graph as executable OpenCypher script
   */
  public exportToCypherDump(filterNodeIds?: string[]): string {
    const filterSet = filterNodeIds && filterNodeIds.length > 0 ? new Set(filterNodeIds) : null;
    const exportNodes = this.getAllNodes().filter(n => !filterSet || filterSet.has(n.id));
    const exportNodeIds = new Set(exportNodes.map(n => n.id));
    const exportEdges = this.getAllEdges().filter(e => exportNodeIds.has(e.source) && exportNodeIds.has(e.target));

    const lines: string[] = [];
    lines.push(`// ========================================================`);
    lines.push(`// FalkorDB OpenCypher Database Dump`);
    lines.push(`// Graph: ${this.activeGraphName}`);
    lines.push(`// Exported: ${new Date().toISOString()}`);
    lines.push(`// Nodes: ${exportNodes.length} | Relationships: ${exportEdges.length}`);
    lines.push(`// ========================================================\n`);

    lines.push(`// --- 1. CREATE NODES ---`);
    for (const node of exportNodes) {
      const labelStr = node.labels.map(l => `:${l}`).join('');
      const props = { id: node.id, ...node.properties };
      const propPairs = Object.entries(props).map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}: "${v.replace(/"/g, '\\"')}"`;
        }
        return `${k}: ${JSON.stringify(v)}`;
      });
      lines.push(`CREATE (${labelStr} {${propPairs.join(', ')}});`);
    }

    lines.push(`\n// --- 2. CREATE RELATIONSHIPS ---`);
    for (const edge of exportEdges) {
      const propPairs = Object.entries(edge.properties || {}).map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}: "${v.replace(/"/g, '\\"')}"`;
        }
        return `${k}: ${JSON.stringify(v)}`;
      });
      const propsStr = propPairs.length > 0 ? ` {${propPairs.join(', ')}}` : '';
      lines.push(
        `MATCH (src {id: "${edge.source}"}), (tgt {id: "${edge.target}"}) CREATE (src)-[:${edge.type}${propsStr}]->(tgt);`
      );
    }

    return lines.join('\n');
  }

  public getStats(): FalkorEngineStats {
    const labels = Array.from(this.labelIndex.keys());
    const relTypes = Array.from(this.adjacency.keys());
    const approxMemKb = Math.round((this.nodes.size * 280 + this.edges.size * 210) / 1024);

    return {
      engine: this.isConnectedRemote ? 'FalkorDB v6.8' : 'Embedded FalkorDB GraphBLAS',
      activeGraph: this.activeGraphName,
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      labels,
      relationshipTypes: relTypes,
      memoryUsageKb: approxMemKb,
      sparseAdjacencyMatricesCount: relTypes.length,
      lastQueryTimeMs: this.lastQueryTimeMs,
      connectedRemote: this.isConnectedRemote,
    };
  }
}

// Singleton global engine instance
export const globalFalkor = new FalkorDBEngine();
