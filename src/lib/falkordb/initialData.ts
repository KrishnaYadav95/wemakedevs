import { GraphNode, GraphEdge } from './types';

export function getInitialGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    // PEOPLE
    {
      id: 'person_elena',
      labels: ['Person'],
      properties: {
        name: 'Elena Rostova',
        role: 'VP of Platform Engineering',
        email: 'elena.rostova@acme-corp.internal',
        approvalAuthority: 'Tier-1 Systems & Production Exceptions',
        timezone: 'UTC-5 (New York)',
        avatarUrl: '/src/assets/images/avatar_elena_lead_1792327013526.jpg',
      },
    },
    {
      id: 'person_marcus',
      labels: ['Person'],
      properties: {
        name: 'Marcus Chen',
        role: 'Staff Reliability Engineer',
        email: 'marcus.chen@acme-corp.internal',
        specialty: 'Distributed Caching & SRE Incident Commander',
        timezone: 'UTC-8 (San Francisco)',
        avatarUrl: '/src/assets/images/avatar_marcus_sre_1792327012953.jpg',
      },
    },
    {
      id: 'person_sarah',
      labels: ['Person'],
      properties: {
        name: 'Sarah Jenkins',
        role: 'Lead Security & Risk Officer',
        email: 'sarah.jenkins@acme-corp.internal',
        specialty: 'PCI-DSS, SOC2 Compliance & Governance Gatekeeper',
        timezone: 'UTC+0 (London)',
        avatarUrl: '/src/assets/images/avatar_sarah_risk_1792327012762.jpg',
      },
    },
    {
      id: 'person_priya',
      labels: ['Person'],
      properties: {
        name: 'Priya Nair',
        role: 'Principal Tech Lead - Payments',
        email: 'priya.nair@acme-corp.internal',
        specialty: 'Payment Gateway Architecture & Transaction Pipelines',
        timezone: 'UTC+5:30 (Bangalore)',
      },
    },
    {
      id: 'person_liam',
      labels: ['Person'],
      properties: {
        name: 'Liam Gallagher',
        role: 'Release & Deployment Lead',
        email: 'liam.gallagher@acme-corp.internal',
        specialty: 'CI/CD Pipelines & Deployment Gate Execution',
        timezone: 'UTC-5 (Toronto)',
      },
    },

    // SYSTEMS
    {
      id: 'sys_payments',
      labels: ['System'],
      properties: {
        name: 'Payment Gateway v3',
        tier: 'Tier-1 Core Financial',
        status: 'Operational (High Traffic)',
        revenueImpact: '$1.4M / hour',
        sla: '99.99%',
        repository: 'git://internal/payments-core.git',
        lastReleaseDate: '2026-10-10',
      },
    },
    {
      id: 'sys_auth',
      labels: ['System'],
      properties: {
        name: 'Auth0 Federated Bridge',
        tier: 'Tier-1 Identity Core',
        status: 'Audit Flagged (Open Findings)',
        sla: '99.995%',
        authStandard: 'OAuth2 / OIDC + mTLS',
        repository: 'git://internal/auth-bridge.git',
      },
    },
    {
      id: 'sys_ledger',
      labels: ['System'],
      properties: {
        name: 'Ledger Transaction DB',
        tier: 'Tier-1 Storage Core',
        engine: 'Distributed CockroachDB Cluster',
        dataVolume: '480M row records',
        complianceScope: 'PCI-DSS Tier-1 / SOX',
      },
    },
    {
      id: 'sys_checkout',
      labels: ['System'],
      properties: {
        name: 'Checkout Orchestrator API',
        tier: 'Tier-1 Customer Facing',
        status: 'Active',
        rpsPeak: '42,000 req/sec',
        framework: 'Go 1.25 / gRPC',
      },
    },
    {
      id: 'sys_cache',
      labels: ['System'],
      properties: {
        name: 'Valkey Distributed Cache B',
        tier: 'Tier-2 Infrastructure',
        nodes: 12,
        memoryUsed: '88% peak saturation',
        warningState: 'Under SRE connection throttle watch',
      },
    },

    // POLICIES
    {
      id: 'pol_friday_freeze',
      labels: ['Policy'],
      properties: {
        code: 'POL-19',
        name: 'Tier-1 Friday Deployment Freeze',
        severity: 'Mandatory Blocker',
        rule: 'No production deployments or schema migrations to Tier-1 systems between Thursday 18:00 UTC and Monday 06:00 UTC without formal written approval from VP of Engineering and Risk Lead.',
        originIncident: 'INC-402',
        enforcedBy: 'Automated CI/CD Gate + Sarah Jenkins',
      },
    },
    {
      id: 'pol_pci_boundary',
      labels: ['Policy'],
      properties: {
        code: 'POL-34',
        name: 'PCI-DSS Zero-Trust Data Boundary',
        severity: 'Regulatory Mandate',
        rule: 'Cardholder PAN data and token exchanges must never traverse uncertified proxy layers or unencrypted caching layers.',
        auditCycle: 'Quarterly',
      },
    },
    {
      id: 'pol_schema_migration',
      labels: ['Policy'],
      properties: {
        code: 'POL-42',
        name: 'High-Impact Database Migration Protocol',
        severity: 'Engineering Standard',
        rule: 'Any schema change affecting >5M rows must undergo 48hr shadow replay in pre-prod and be scheduled exclusively in Tuesday maintenance windows.',
      },
    },

    // INCIDENTS (HISTORICAL POST-MORTEMS)
    {
      id: 'inc_402',
      labels: ['Incident'],
      properties: {
        code: 'INC-402',
        title: 'Black Friday Checkout Meltdown',
        date: '2025-11-28',
        duration: '112 minutes',
        financialLoss: '$480,000',
        rootCause: 'Friday 4 PM uncoordinated cache deployment caused cache stampede and cascade timeouts across Payment Gateway and Checkout API.',
        postMortemOutcome: 'Codified into POL-19 (Friday Deployment Freeze).',
        incidentCommander: 'Marcus Chen',
      },
    },
    {
      id: 'inc_518',
      labels: ['Incident'],
      properties: {
        code: 'INC-518',
        title: 'Auth Bridge Token Desync',
        date: '2026-03-14',
        duration: '42 minutes',
        impact: '38,000 user checkout sessions dropped due to non-atomic JWT key rotation.',
        actionItem: 'Enforce atomic key rotation standard in ADR-88.',
      },
    },

    // DECISIONS / ADRs
    {
      id: 'dec_adr88',
      labels: ['Decision'],
      properties: {
        code: 'ADR-88',
        title: 'Standard Enterprise Maintenance Window',
        status: 'Accepted & Enforced',
        agreedWindow: 'Tuesdays 06:00 - 10:00 UTC',
        signatories: 'Elena Rostova, Sarah Jenkins, Marcus Chen',
        rationale: 'Lowest global transaction volume window with full on-call SRE and compliance support.',
      },
    },
    {
      id: 'dec_adr104',
      labels: ['Decision'],
      properties: {
        code: 'ADR-104',
        title: 'Dual-Region Active-Passive Failover for Ledger',
        status: 'Accepted',
        author: 'Marcus Chen',
        rpoTarget: '< 100ms',
        rtoTarget: '< 3 minutes',
      },
    },

    // CROSS-SESSION MEMORIES (Stored in FalkorDB Graph Across Sessions)
    {
      id: 'mem_101',
      labels: ['Memory'],
      properties: {
        sessionId: 'session-101',
        timestamp: '2026-10-15T14:32:00Z',
        author: 'Agent-Memory',
        speaker: 'Marcus Chen',
        observation: 'Valkey Distributed Cache B experienced packet drop at 12k concurrent connections. Marcus explicitly warned: do NOT route new auth service traffic to Cache B until pool size is increased.',
        confidence: 0.98,
        topic: 'Cache Health & Connection Pooling',
      },
    },
    {
      id: 'mem_102',
      labels: ['Memory'],
      properties: {
        sessionId: 'session-101',
        timestamp: '2026-10-15T16:15:00Z',
        author: 'Agent-Memory',
        speaker: 'Elena Rostova',
        observation: 'Elena reaffirmed: Zero exceptions will be granted for Friday deploys on Payment Gateway or Auth Bridge. Any emergency hotfix requires both her and Sarah Jenkins digital keys.',
        confidence: 1.0,
        topic: 'Deployment Exceptions & Executive Policy',
      },
    },
    {
      id: 'mem_103',
      labels: ['Memory'],
      properties: {
        sessionId: 'session-102',
        timestamp: '2026-10-17T09:20:00Z',
        author: 'Agent-Memory',
        speaker: 'Sarah Jenkins',
        observation: 'Sarah Jenkins confirmed the Q4 PCI audit flagged Auth0 Bridge token revocation latency. Any changes to Auth0 Bridge must be reviewed alongside the remediation ticket SEC-904.',
        confidence: 0.95,
        topic: 'Security Audit & Compliance Findings',
      },
    },
    {
      id: 'mem_104',
      labels: ['Memory'],
      properties: {
        sessionId: 'session-102',
        timestamp: '2026-10-17T11:45:00Z',
        author: 'Agent-Memory',
        speaker: 'Priya Nair',
        observation: 'Priya completed the dry-run for Payment Gateway v3 on staging; all unit tests passed, but she noted she is awaiting Marcus Chen approval on cache sizing.',
        confidence: 0.96,
        topic: 'Payment Gateway Staging Verification',
      },
    },

    // MULTI-AGENT BLACKBOARD NODES
    {
      id: 'agent_architect',
      labels: ['Agent'],
      properties: {
        name: 'Architect Agent',
        specialty: 'Topology, Microservices & Dependency Cascades',
        status: 'Active',
        assignedGraph: 'enterprise_context_graph',
      },
    },
    {
      id: 'agent_risk',
      labels: ['Agent'],
      properties: {
        name: 'Risk & Compliance Agent',
        specialty: 'Governance, Policies, Historical Incidents & Blockers',
        status: 'Active',
        assignedGraph: 'enterprise_context_graph',
      },
    },
    {
      id: 'agent_people',
      labels: ['Agent'],
      properties: {
        name: 'People & Ownership Agent',
        specialty: 'Stakeholder Escalation, RACI Matrix & Responders',
        status: 'Active',
        assignedGraph: 'enterprise_context_graph',
      },
    },
    {
      id: 'agent_memory',
      labels: ['Agent'],
      properties: {
        name: 'Episodic Memory Agent',
        specialty: 'Cross-Session Continuity, Past Dialogues & Intent Tracking',
        status: 'Active',
        assignedGraph: 'enterprise_context_graph',
      },
    },
  ];

  const edges: GraphEdge[] = [
    // PEOPLE -> SYSTEMS (Ownership)
    {
      id: 'e_priya_owns_payments',
      type: 'OWNS',
      source: 'person_priya',
      target: 'sys_payments',
      properties: { role: 'Principal Architect & Code Owner', since: '2024' },
    },
    {
      id: 'e_priya_owns_checkout',
      type: 'OWNS',
      source: 'person_priya',
      target: 'sys_checkout',
      properties: { role: 'Lead Architect', since: '2023' },
    },
    {
      id: 'e_marcus_owns_cache',
      type: 'OWNS',
      source: 'person_marcus',
      target: 'sys_cache',
      properties: { role: 'SRE Infrastructure Owner', since: '2024' },
    },
    {
      id: 'e_sarah_governs_auth',
      type: 'GOVERNED_BY',
      source: 'sys_auth',
      target: 'person_sarah',
      properties: { scope: 'PCI & Identity Compliance Sign-Off' },
    },
    {
      id: 'e_elena_approves_tier1',
      type: 'OWNS',
      source: 'person_elena',
      target: 'sys_payments',
      properties: { role: 'Executive Sponsor & Exception Approver' },
    },
    {
      id: 'e_liam_deploys_payments',
      type: 'EXECUTES',
      source: 'person_liam',
      target: 'sys_payments',
      properties: { role: 'Pipeline Gatekeeper' },
    },

    // SYSTEM DEPENDENCIES
    {
      id: 'e_checkout_depends_payments',
      type: 'DEPENDS_ON',
      source: 'sys_checkout',
      target: 'sys_payments',
      properties: { criticality: 'Hard Blocker', protocol: 'gRPC mTLS' },
    },
    {
      id: 'e_payments_depends_ledger',
      type: 'DEPENDS_ON',
      source: 'sys_payments',
      target: 'sys_ledger',
      properties: { criticality: 'Transactional Hard Dependency', writeMode: 'Two-Phase Commit' },
    },
    {
      id: 'e_payments_depends_auth',
      type: 'DEPENDS_ON',
      source: 'sys_payments',
      target: 'sys_auth',
      properties: { criticality: 'Token Validation Gate', cachingTTL: '60s' },
    },
    {
      id: 'e_auth_depends_cache',
      type: 'DEPENDS_ON',
      source: 'sys_auth',
      target: 'sys_cache',
      properties: { criticality: 'Session Token Cache', fallback: 'Local Memory (5min)' },
    },

    // SYSTEMS -> POLICIES
    {
      id: 'e_payments_governed_friday',
      type: 'GOVERNED_BY',
      source: 'sys_payments',
      target: 'pol_friday_freeze',
      properties: { tier: 'Tier-1 Strictly Enforced' },
    },
    {
      id: 'e_auth_governed_friday',
      type: 'GOVERNED_BY',
      source: 'sys_auth',
      target: 'pol_friday_freeze',
      properties: { tier: 'Tier-1 Strictly Enforced' },
    },
    {
      id: 'e_payments_governed_pci',
      type: 'GOVERNED_BY',
      source: 'sys_payments',
      target: 'pol_pci_boundary',
      properties: { scope: 'Primary PAN Vault Gate' },
    },
    {
      id: 'e_ledger_governed_migration',
      type: 'GOVERNED_BY',
      source: 'sys_ledger',
      target: 'pol_schema_migration',
      properties: { dataThreshold: '5M rows' },
    },

    // INCIDENTS -> SYSTEMS & POLICIES
    {
      id: 'e_inc402_impacted_payments',
      type: 'IMPACTED_BY',
      source: 'sys_payments',
      target: 'inc_402',
      properties: { downtimeMinutes: 112 },
    },
    {
      id: 'e_inc402_created_friday_pol',
      type: 'RESOLVED',
      source: 'inc_402',
      target: 'pol_friday_freeze',
      properties: { correctiveAction: 'Created formal Friday Freeze policy' },
    },
    {
      id: 'e_inc518_impacted_auth',
      type: 'IMPACTED_BY',
      source: 'sys_auth',
      target: 'inc_518',
      properties: { sessionsDropped: 38000 },
    },
    {
      id: 'e_marcus_resolved_inc402',
      type: 'RESOLVED',
      source: 'person_marcus',
      target: 'inc_402',
      properties: { role: 'Incident Commander' },
    },

    // DECISIONS / ADRs CONNECTIONS
    {
      id: 'e_elena_authored_adr88',
      type: 'AUTHOR_OF',
      source: 'person_elena',
      target: 'dec_adr88',
      properties: { role: 'Executive Co-Author' },
    },
    {
      id: 'e_sarah_authored_adr88',
      type: 'AUTHOR_OF',
      source: 'person_sarah',
      target: 'dec_adr88',
      properties: { role: 'Risk Co-Author' },
    },
    {
      id: 'e_adr88_governs_payments',
      type: 'GOVERNED_BY',
      source: 'sys_payments',
      target: 'dec_adr88',
      properties: { approvedSlot: 'Tuesdays 06:00-10:00 UTC' },
    },
    {
      id: 'e_marcus_authored_adr104',
      type: 'AUTHOR_OF',
      source: 'person_marcus',
      target: 'dec_adr104',
      properties: { role: 'Author' },
    },
    {
      id: 'e_adr104_governs_ledger',
      type: 'GOVERNED_BY',
      source: 'sys_ledger',
      target: 'dec_adr104',
      properties: { mode: 'Active-Passive failover' },
    },

    // CROSS-SESSION MEMORIES -> NODES
    {
      id: 'e_mem101_refs_cache',
      type: 'REFERENCES',
      source: 'mem_101',
      target: 'sys_cache',
      properties: { observationType: 'Capacity Limitation Alert' },
    },
    {
      id: 'e_mem101_refs_marcus',
      type: 'REFERENCES',
      source: 'mem_101',
      target: 'person_marcus',
      properties: { relation: 'Reported by' },
    },
    {
      id: 'e_mem102_refs_elena',
      type: 'REFERENCES',
      source: 'mem_102',
      target: 'person_elena',
      properties: { relation: 'Mandate by VP' },
    },
    {
      id: 'e_mem102_refs_payments',
      type: 'REFERENCES',
      source: 'mem_102',
      target: 'sys_payments',
      properties: { relation: 'Target System' },
    },
    {
      id: 'e_mem102_refs_friday_freeze',
      type: 'REFERENCES',
      source: 'mem_102',
      target: 'pol_friday_freeze',
      properties: { relation: 'Reaffirmed enforcement' },
    },
    {
      id: 'e_mem103_refs_sarah',
      type: 'REFERENCES',
      source: 'mem_103',
      target: 'person_sarah',
      properties: { relation: 'Compliance finding logged' },
    },
    {
      id: 'e_mem103_refs_auth',
      type: 'REFERENCES',
      source: 'mem_103',
      target: 'sys_auth',
      properties: { relation: 'Security audit flag' },
    },
    {
      id: 'e_mem104_refs_priya',
      type: 'REFERENCES',
      source: 'mem_104',
      target: 'person_priya',
      properties: { relation: 'Status update' },
    },
    {
      id: 'e_mem104_refs_payments',
      type: 'REFERENCES',
      source: 'mem_104',
      target: 'sys_payments',
      properties: { relation: 'Staging verification ready' },
    },

    // MULTI-AGENT CONNECTIONS (Agent -> Subgraphs)
    {
      id: 'e_agent_arch_sys',
      type: 'REFERENCES',
      source: 'agent_architect',
      target: 'sys_payments',
      properties: { scope: 'Primary Topology Monitor' },
    },
    {
      id: 'e_agent_risk_pol',
      type: 'REFERENCES',
      source: 'agent_risk',
      target: 'pol_friday_freeze',
      properties: { scope: 'Policy Enforcement' },
    },
    {
      id: 'e_agent_people_elena',
      type: 'REFERENCES',
      source: 'agent_people',
      target: 'person_elena',
      properties: { scope: 'RACI Hierarchy' },
    },
    {
      id: 'e_agent_mem_mem102',
      type: 'REMEMBERS',
      source: 'agent_memory',
      target: 'mem_102',
      properties: { sessionRecall: 'Past directives' },
    },
  ];

  return { nodes, edges };
}
