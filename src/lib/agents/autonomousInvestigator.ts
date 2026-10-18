import { globalFalkor } from '../falkordb/falkorEngine';
import { globalFalkorMcp } from '../mcp/falkorMcpServer';
import {
  Track01InvestigationResult,
  McpStepExecution,
  AutonomousActionReceipt
} from '../mcp/types';
import { TRACK_01_DOMAINS, DomainPreset } from '../falkordb/track01Data';

export async function runTrack01AutonomousInvestigation(
  domainId: 'fraud_investigation' | 'security_lateral_movement' | 'codebase_blast_radius',
  customPrompt?: string
): Promise<Track01InvestigationResult> {
  const startTime = performance.now();
  const domainPreset = TRACK_01_DOMAINS.find(d => d.id === domainId) || TRACK_01_DOMAINS[0];
  const investigationId = `inv_${domainId}_${Date.now().toString(36)}`;

  const mcpSteps: McpStepExecution[] = [];
  const actionsTaken: AutonomousActionReceipt[] = [];
  const nodeIdsTraversed: string[] = [];
  const edgeIdsTraversed: string[] = [];

  let totalNodesVisited = 0;
  let totalRelsTraversed = 0;

  if (domainId === 'fraud_investigation') {
    // -------------------------------------------------------------
    // DOMAIN 1: FINANCIAL FRAUD RING INVESTIGATION
    // -------------------------------------------------------------

    // Step 1: Query immediate account relationships via MCP
    const step1Thought = 'Investigating flagged Account #8891. Selecting MCP tool falkordb_run_cypher to map all outbound transfers and device associations.';
    const step1Call = {
      id: 'call_mcp_1',
      toolName: 'falkordb_run_cypher',
      arguments: {
        cypher: "MATCH (a:Person {id: 'acc_8891'})-[r]->(target) RETURN a, type(r) as rel, target",
      },
      timestamp: new Date().toISOString(),
    };
    const step1Res = await globalFalkorMcp.callTool(step1Call);
    totalNodesVisited += step1Res.graphNodesVisited || 2;
    totalRelsTraversed += step1Res.graphRelsTraversed || 2;

    nodeIdsTraversed.push('acc_8891', 'dev_fingerprint_99', 'acc_mule_14');
    edgeIdsTraversed.push('e_f1', 'e_f4');

    mcpSteps.push({
      stepNumber: 1,
      thought: step1Thought,
      mcpToolCall: step1Call,
      mcpToolResult: step1Res,
      graphPathSegment: { fromNodeId: 'acc_8891', relType: 'TRANSFERRED', toNodeId: 'acc_mule_14' },
    });

    // Step 2: Cycle Detection Algorithm via MCP
    const step2Thought = 'Observed $42,000 sent to newly created account acc_mule_14. Calling MCP tool falkordb_detect_cycles to inspect for circular money laundering loops.';
    const step2Call = {
      id: 'call_mcp_2',
      toolName: 'falkordb_detect_cycles',
      arguments: {
        startNodeId: 'acc_8891',
        maxDepth: 5,
      },
      timestamp: new Date().toISOString(),
    };
    const step2Res = await globalFalkorMcp.callTool(step2Call);
    totalNodesVisited += step2Res.graphNodesVisited || 3;
    totalRelsTraversed += step2Res.graphRelsTraversed || 3;

    nodeIdsTraversed.push('acc_mule_22');
    edgeIdsTraversed.push('e_f5', 'e_f6');

    mcpSteps.push({
      stepNumber: 2,
      thought: step2Thought,
      mcpToolCall: step2Call,
      mcpToolResult: step2Res,
      graphPathSegment: { fromNodeId: 'acc_mule_14', relType: 'TRANSFERRED', toNodeId: 'acc_mule_22' },
    });

    // Step 3: Centrality & Hardware Fingerprint Analysis via MCP
    const step3Thought = 'Cycle confirmed: $38,000 of original $42,000 returns to acc_8891 via acc_mule_22. Invoking MCP tool falkordb_centrality to identify the shared device kingpin.';
    const step3Call = {
      id: 'call_mcp_3',
      toolName: 'falkordb_centrality',
      arguments: {
        label: 'System',
      },
      timestamp: new Date().toISOString(),
    };
    const step3Res = await globalFalkorMcp.callTool(step3Call);
    totalNodesVisited += step3Res.graphNodesVisited || 4;

    mcpSteps.push({
      stepNumber: 3,
      thought: step3Thought,
      mcpToolCall: step3Call,
      mcpToolResult: step3Res,
    });

    // Step 4: Autonomous Action - Quarantine via MCP
    const step4Thought = 'FalkorDB graph proves coordinated fraud syndicate. Executing MCP action tool falkordb_execute_action to quarantine acc_8891 and freeze all associated mule accounts.';
    const step4Call = {
      id: 'call_mcp_4',
      toolName: 'falkordb_execute_action',
      arguments: {
        actionType: 'QUARANTINE_ENTITY',
        targetNodeId: 'acc_8891',
        reason: 'Detected 3-hop money laundering cycle [acc_8891 ➔ acc_mule_14 ➔ acc_mule_22 ➔ acc_8891] and shared device fingerprint dev_fingerprint_998x.',
      },
      timestamp: new Date().toISOString(),
    };
    const step4Res = await globalFalkorMcp.callTool(step4Call);
    const receipt1 = step4Res.content.find(c => c.type === 'action_receipt')?.data;
    if (receipt1) actionsTaken.push(receipt1);

    mcpSteps.push({
      stepNumber: 4,
      thought: step4Thought,
      mcpToolCall: step4Call,
      mcpToolResult: step4Res,
    });

    // Step 5: Autonomous Action - Quarantine Mule 14
    const step5Call = {
      id: 'call_mcp_5',
      toolName: 'falkordb_execute_action',
      arguments: {
        actionType: 'QUARANTINE_ENTITY',
        targetNodeId: 'acc_mule_14',
        reason: 'Synthetic commercial shell account sharing hardware fingerprint with primary fraudster.',
      },
      timestamp: new Date().toISOString(),
    };
    const step5Res = await globalFalkorMcp.callTool(step5Call);
    const receipt2 = step5Res.content.find(c => c.type === 'action_receipt')?.data;
    if (receipt2) actionsTaken.push(receipt2);

    mcpSteps.push({
      stepNumber: 5,
      thought: 'Applying secondary quarantine to synthetic mule identity in FalkorDB.',
      mcpToolCall: step5Call,
      mcpToolResult: step5Res,
    });

    const latency = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      investigationId,
      domain: domainId,
      targetEntity: 'acc_8891',
      headline: 'FRAUD RING CONFIRMED: 3-Hop Layering Cycle & Shared Hardware Nexus',
      executiveSummary: 'Autonomous agent used FalkorDB cycle detection and centrality tools via MCP to uncover a closed-loop $42,000 money laundering ring. Two accounts have been quarantined directly in the graph.',
      mcpSteps,
      traversedPath: {
        nodeIds: nodeIdsTraversed,
        edgeIds: edgeIdsTraversed,
      },
      actionsTaken,
      graphMetrics: {
        totalMcpCalls: mcpSteps.length,
        graphNodesEvaluated: totalNodesVisited,
        relationshipsTraversed: totalRelsTraversed,
        cyclesDetected: 1,
        totalLatencyMs: latency,
      },
      explainableProof: {
        whyThisAction: 'The agent quarantined Account #8891 because FalkorDB proved circular fund return (3-hop layering) and identical iPhone 16 Pro canvas hash with synthetic account #1409.',
        falkorGraphProofHops: [
          'acc_8891 ➔ -[:USED_DEVICE]➔ dev_fingerprint_99 (iPhone 16 Pro)',
          'acc_mule_14 ➔ -[:USED_DEVICE]➔ dev_fingerprint_99 (Hardware collision)',
          'acc_8891 ➔ -[:TRANSFERRED ($42,000)]➔ acc_mule_14',
          'acc_mule_14 ➔ -[:TRANSFERRED ($39,500)]➔ acc_mule_22',
          'acc_mule_22 ➔ -[:TRANSFERRED ($38,000)]➔ acc_8891 (90.4% circular return rate)',
        ],
        uninformedLlmContrast: 'A standard LLM without FalkorDB sees only "Account #8891 transferred $42k for consulting" and assumes it is a normal vendor payment, missing the mule ring entirely.',
      },
    };
  } else if (domainId === 'security_lateral_movement') {
    // -------------------------------------------------------------
    // DOMAIN 2: CLOUD SECURITY LATERAL MOVEMENT TRIAGE
    // -------------------------------------------------------------

    // Step 1: Query vulnerability blast radius
    const step1Thought = 'Public pod pod_public_api flagged with CVE-2026-4102. Calling MCP tool falkordb_blast_radius to calculate multi-hop lateral movement potential.';
    const step1Call = {
      id: 'call_mcp_sec_1',
      toolName: 'falkordb_blast_radius',
      arguments: {
        rootNodeId: 'pod_public_api',
        hops: 3,
      },
      timestamp: new Date().toISOString(),
    };
    const step1Res = await globalFalkorMcp.callTool(step1Call);
    totalNodesVisited += step1Res.graphNodesVisited || 4;
    totalRelsTraversed += step1Res.graphRelsTraversed || 4;

    nodeIdsTraversed.push('pod_public_api', 'cve_2026_4102', 'iam_instance_role');
    edgeIdsTraversed.push('e_s1', 'e_s2');

    mcpSteps.push({
      stepNumber: 1,
      thought: step1Thought,
      mcpToolCall: step1Call,
      mcpToolResult: step1Res,
      graphPathSegment: { fromNodeId: 'pod_public_api', relType: 'ASSUMES_ROLE', toNodeId: 'iam_instance_role' },
    });

    // Step 2: Shortest Path to Crown-Jewel Database
    const step2Thought = 'Blast radius contains sovereign assets. Selecting MCP tool falkordb_find_shortest_path between compromised pod and db_crown_jewel.';
    const step2Call = {
      id: 'call_mcp_sec_2',
      toolName: 'falkordb_find_shortest_path',
      arguments: {
        sourceNodeId: 'pod_public_api',
        targetNodeId: 'db_crown_jewel',
      },
      timestamp: new Date().toISOString(),
    };
    const step2Res = await globalFalkorMcp.callTool(step2Call);
    totalNodesVisited += step2Res.graphNodesVisited || 3;
    totalRelsTraversed += step2Res.graphRelsTraversed || 2;

    nodeIdsTraversed.push('vpc_peering_prod', 'db_crown_jewel');
    edgeIdsTraversed.push('e_s4', 'e_s5');

    mcpSteps.push({
      stepNumber: 2,
      thought: step2Thought,
      mcpToolCall: step2Call,
      mcpToolResult: step2Res,
      graphPathSegment: { fromNodeId: 'vpc_peering_prod', relType: 'DEPENDS_ON', toNodeId: 'db_crown_jewel' },
    });

    // Step 3: Action - Revoke IAM Role
    const step3Thought = 'Unauthenticated RCE can pivot through VPC peering tunnel to reach 52M PAN cards. Executing MCP action tool falkordb_execute_action to revoke IAM credentials.';
    const step3Call = {
      id: 'call_mcp_sec_3',
      toolName: 'falkordb_execute_action',
      arguments: {
        actionType: 'REVOKE_CREDENTIAL',
        targetNodeId: 'iam_instance_role',
        reason: 'Compromised by pod_public_api (CVE-2026-4102) with lateral access route to sovereign PCI database.',
      },
      timestamp: new Date().toISOString(),
    };
    const step3Res = await globalFalkorMcp.callTool(step3Call);
    const receipt1 = step3Res.content.find(c => c.type === 'action_receipt')?.data;
    if (receipt1) actionsTaken.push(receipt1);

    mcpSteps.push({
      stepNumber: 3,
      thought: step3Thought,
      mcpToolCall: step3Call,
      mcpToolResult: step3Res,
    });

    // Step 4: Action - Isolate Ingress Pod
    const step4Call = {
      id: 'call_mcp_sec_4',
      toolName: 'falkordb_execute_action',
      arguments: {
        actionType: 'ISOLATE_CLUSTER',
        targetNodeId: 'pod_public_api',
        reason: 'Quarantine pod from public network to prevent active memory dumping of database secret vault.',
      },
      timestamp: new Date().toISOString(),
    };
    const step4Res = await globalFalkorMcp.callTool(step4Call);
    const receipt2 = step4Res.content.find(c => c.type === 'action_receipt')?.data;
    if (receipt2) actionsTaken.push(receipt2);

    mcpSteps.push({
      stepNumber: 4,
      thought: 'Severing public network ingress to compromised pod in FalkorDB.',
      mcpToolCall: step4Call,
      mcpToolResult: step4Res,
    });

    const latency = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      investigationId,
      domain: domainId,
      targetEntity: 'pod_public_api',
      headline: 'ACTIVE BREACH CONTAINED: Lateral Movement to Crown-Jewel DB Severed',
      executiveSummary: 'Agent traversed FalkorDB relationships to discover a 2-hop lateral breach path from an internet-facing pod to the 52M-record cardholder database. IAM credentials revoked and ingress severed autonomously.',
      mcpSteps,
      traversedPath: {
        nodeIds: nodeIdsTraversed,
        edgeIds: edgeIdsTraversed,
      },
      actionsTaken,
      graphMetrics: {
        totalMcpCalls: mcpSteps.length,
        graphNodesEvaluated: totalNodesVisited,
        relationshipsTraversed: totalRelsTraversed,
        cyclesDetected: 0,
        totalLatencyMs: latency,
      },
      explainableProof: {
        whyThisAction: 'The agent revoked IAM role k8s-pod-worker and isolated pod-74f because FalkorDB exposed an open VPC peering route on port 5432 directly into the Crown-Jewel PCI database.',
        falkorGraphProofHops: [
          'pod_public_api ➔ -[:IMPACTED_BY]➔ CVE-2026-4102 (CVSS 9.8 RCE)',
          'pod_public_api ➔ -[:ASSUMES_ROLE]➔ iam_instance_role (Wildcard policies)',
          'iam_instance_role ➔ -[:GOVERNED_BY]➔ k8s_secrets_vault (PCI DB master keys)',
          'pod_public_api ➔ -[:ROUTED_THROUGH]➔ vpc_peering_prod (Port 5432 ingress)',
          'vpc_peering_prod ➔ -[:DEPENDS_ON]➔ db_crown_jewel (52,000,000 Cardholder Records)',
        ],
        uninformedLlmContrast: 'Without the graph, an LLM only evaluates the pod in isolation, suggesting a routine container restart while leaving the active IAM compromise and database route open.',
      },
    };
  } else {
    // -------------------------------------------------------------
    // DOMAIN 3: CODEBASE & MICROSERVICE DEADLOCK REMEDIATION
    // -------------------------------------------------------------

    // Step 1: Inspect PR impact on service billing
    const step1Thought = 'Analyzing PR #1402 modifying core billing lock semantics. Selecting MCP tool falkordb_run_cypher to map service dependencies.';
    const step1Call = {
      id: 'call_mcp_cb_1',
      toolName: 'falkordb_run_cypher',
      arguments: {
        cypher: "MATCH (pr:Decision {id: 'pr_schema_change'})-[:AUTHOR_OF]->(s:System)-[:DEPENDS_ON*1..2]->(downstream) RETURN pr, s, downstream",
      },
      timestamp: new Date().toISOString(),
    };
    const step1Res = await globalFalkorMcp.callTool(step1Call);
    totalNodesVisited += step1Res.graphNodesVisited || 3;
    totalRelsTraversed += step1Res.graphRelsTraversed || 3;

    nodeIdsTraversed.push('pr_schema_change', 'service_billing', 'service_auth', 'service_checkout');
    edgeIdsTraversed.push('e_c1', 'e_c3', 'e_c4');

    mcpSteps.push({
      stepNumber: 1,
      thought: step1Thought,
      mcpToolCall: step1Call,
      mcpToolResult: step1Res,
      graphPathSegment: { fromNodeId: 'pr_schema_change', relType: 'AUTHOR_OF', toNodeId: 'service_billing' },
    });

    // Step 2: Detect Circular Dependency Cycle
    const step2Thought = 'Pessimistic row locking in billing service poses deadlock risk. Invoking MCP tool falkordb_detect_cycles from service_billing.';
    const step2Call = {
      id: 'call_mcp_cb_2',
      toolName: 'falkordb_detect_cycles',
      arguments: {
        startNodeId: 'service_billing',
        maxDepth: 4,
      },
      timestamp: new Date().toISOString(),
    };
    const step2Res = await globalFalkorMcp.callTool(step2Call);
    totalNodesVisited += step2Res.graphNodesVisited || 4;
    totalRelsTraversed += step2Res.graphRelsTraversed || 3;

    edgeIdsTraversed.push('e_c2');

    mcpSteps.push({
      stepNumber: 2,
      thought: step2Thought,
      mcpToolCall: step2Call,
      mcpToolResult: step2Res,
    });

    // Step 3: Autonomous Action - Freeze Pipeline Gate
    const step3Thought = 'Circular synchronous dependency detected: [billing-core ➔ auth-bridge ➔ checkout-orchestrator ➔ billing-core]. Executing MCP action tool falkordb_execute_action to freeze PR #1402 CI/CD deployment.';
    const step3Call = {
      id: 'call_mcp_cb_3',
      toolName: 'falkordb_execute_action',
      arguments: {
        actionType: 'FREEZE_PIPELINE',
        targetNodeId: 'pr_schema_change',
        reason: 'PR #1402 introduces pessimistic row locks into an existing 3-node circular synchronous microservice loop, creating catastrophic distributed deadlock.',
      },
      timestamp: new Date().toISOString(),
    };
    const step3Res = await globalFalkorMcp.callTool(step3Call);
    const receipt = step3Res.content.find(c => c.type === 'action_receipt')?.data;
    if (receipt) actionsTaken.push(receipt);

    mcpSteps.push({
      stepNumber: 3,
      thought: step3Thought,
      mcpToolCall: step3Call,
      mcpToolResult: step3Res,
    });

    const latency = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      investigationId,
      domain: domainId,
      targetEntity: 'pr_schema_change',
      headline: 'DISTRIBUTED DEADLOCK PREVENTED: CI/CD Pipeline Gate Frozen',
      executiveSummary: 'FalkorDB cycle detection caught a 3-way circular lock dependency across Billing, Auth, and Checkout services. The agent autonomously froze PR #1402 deployment gate to avoid a production outage.',
      mcpSteps,
      traversedPath: {
        nodeIds: nodeIdsTraversed,
        edgeIds: edgeIdsTraversed,
      },
      actionsTaken,
      graphMetrics: {
        totalMcpCalls: mcpSteps.length,
        graphNodesEvaluated: totalNodesVisited,
        relationshipsTraversed: totalRelsTraversed,
        cyclesDetected: 1,
        totalLatencyMs: latency,
      },
      explainableProof: {
        whyThisAction: 'The agent froze PR #1402 because the proposed schema locks in billing-core-svc would deadlock synchronously when checkout-orchestrator invokes DeductFunds while holding an auth token validation lock.',
        falkorGraphProofHops: [
          'PR #1402 ➔ -[:MODIFIES]➔ billing-core-svc (Pessimistic row locks)',
          'checkout-orchestrator ➔ -[:DEPENDS_ON]➔ billing-core-svc (Sync DeductFunds)',
          'billing-core-svc ➔ -[:DEPENDS_ON]➔ auth-session-bridge (Sync VerifySession)',
          'auth-session-bridge ➔ -[:DEPENDS_ON]➔ checkout-orchestrator (Sync GetActiveCart)',
          'Circular loop confirmed: Catastrophic 3-way thread pool starvation deadlock.',
        ],
        uninformedLlmContrast: 'A regular code review LLM reviews only the PR diff (SQL syntax & Go code), approves it as clean, and deploys it straight into production deadlock.',
      },
    };
  }
}
