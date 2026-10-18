import { GraphNode, GraphEdge } from './types';

export interface DomainPreset {
  id: 'fraud_investigation' | 'security_lateral_movement' | 'codebase_blast_radius';
  title: string;
  badge: string;
  description: string;
  seedEntityId: string;
  samplePrompt: string;
}

export const TRACK_01_DOMAINS: DomainPreset[] = [
  {
    id: 'fraud_investigation',
    title: 'Financial Fraud Ring & Mule Network Investigation',
    badge: 'FinTech & AML',
    description: 'Investigate a suspicious $42,000 wire, detect circular layering loops, traverse shared device fingerprints, and execute autonomous account quarantines.',
    seedEntityId: 'acc_8891',
    samplePrompt: 'Investigate Account acc_8891 for syndication: trace device fingerprints, detect circular money laundering cycles, and quarantine high-risk accounts.',
  },
  {
    id: 'security_lateral_movement',
    title: 'Cloud Security Lateral Movement & Breach Triage',
    badge: 'SecOps & DevSecOps',
    description: 'Triage a critical CVE in a public k8s pod, trace IAM privilege escalation to the sovereign database, and autonomously isolate the compromised cluster.',
    seedEntityId: 'pod_public_api',
    samplePrompt: 'Triage public pod_public_api with CVE-2026-4102: calculate lateral movement blast radius to crown-jewel database and revoke compromised credentials.',
  },
  {
    id: 'codebase_blast_radius',
    title: 'Codebase Dependency & Circular Deadlock Remediation',
    badge: 'Platform Engineering',
    description: 'Analyze PR #1402 modifying core billing schema: run cycle detection across microservices and autonomously block deployment if circular lock hazards exist.',
    seedEntityId: 'pr_schema_change',
    samplePrompt: 'Evaluate PR #1402 for microservice deadlock risks: traverse downstream dependency blast radius and freeze CI/CD gate if circular locks are found.',
  },
];

export function getTrack01Dataset(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    // ----------------------------------------------------
    // DOMAIN 1: FRAUD RING & MULE NETWORK
    // ----------------------------------------------------
    {
      id: 'acc_8891',
      labels: ['Person'],
      properties: {
        name: 'Account #8891 (Alex Mercer)',
        accountType: 'Personal Checking',
        riskScore: 84,
        flaggedAmount: '$42,000 USD',
        status: 'Active (Flagged)',
        domain: 'fraud_investigation',
        kycStatus: 'Verified (Level 2)',
      },
    },
    {
      id: 'dev_fingerprint_99',
      labels: ['System'],
      properties: {
        name: 'Hardware Fingerprint #998x',
        deviceModel: 'Apple iPhone 16 Pro',
        osVersion: 'iOS 19.3',
        canvasHash: 'a7b8e91244cf',
        associatedAccountsCount: 4,
        domain: 'fraud_investigation',
      },
    },
    {
      id: 'acc_mule_14',
      labels: ['Person'],
      properties: {
        name: 'Mule Account #1409 (Elena K.)',
        accountType: 'Commercial Shell',
        createdDaysAgo: 4,
        status: 'High Velocity Transferring',
        syntheticIdentityScore: 0.94,
        domain: 'fraud_investigation',
      },
    },
    {
      id: 'acc_mule_22',
      labels: ['Person'],
      properties: {
        name: 'Mule Account #2281 (Liam O.)',
        accountType: 'Personal Savings',
        createdDaysAgo: 6,
        status: 'Active',
        domain: 'fraud_investigation',
      },
    },
    {
      id: 'crypto_bridge_01',
      labels: ['System'],
      properties: {
        name: 'Unregulated P2P Crypto Rail',
        jurisdiction: 'Offshore Seychelles',
        amlCompliance: 'Non-Compliant / Blacklisted',
        domain: 'fraud_investigation',
      },
    },
    {
      id: 'ip_vpn_nord',
      labels: ['System'],
      properties: {
        name: 'VPN Datacenter Exit Node',
        ipAddress: '194.26.29.11',
        isp: 'Datacenter Proxy Hosting',
        country: 'NL',
        domain: 'fraud_investigation',
      },
    },

    // ----------------------------------------------------
    // DOMAIN 2: SECURITY LATERAL MOVEMENT & BREACH TRIAGE
    // ----------------------------------------------------
    {
      id: 'pod_public_api',
      labels: ['System'],
      properties: {
        name: 'Pod: payment-ingress-74f',
        cluster: 'us-east-k8s-prod',
        exposedPort: 443,
        status: 'Compromised / Under Attack',
        trafficRps: 18400,
        domain: 'security_lateral_movement',
      },
    },
    {
      id: 'cve_2026_4102',
      labels: ['Incident'],
      properties: {
        name: 'CVE-2026-4102 (RCE in gRPC parser)',
        cvssScore: 9.8,
        vector: 'Network / Unauthenticated / Critical',
        exploitStatus: 'Active In-The-Wild Exploit',
        domain: 'security_lateral_movement',
      },
    },
    {
      id: 'iam_instance_role',
      labels: ['Policy'],
      properties: {
        name: 'IAM: role/k8s-pod-worker',
        arn: 'arn:aws:iam::123456789:role/k8s-pod-worker',
        privilegeLevel: 'Elevated Wildcard (s3:*, rds:*)',
        lastRotated: '2026-09-01',
        domain: 'security_lateral_movement',
      },
    },
    {
      id: 'vpc_peering_prod',
      labels: ['System'],
      properties: {
        name: 'VPC Peering: peer-08bf29c',
        sourceVpc: 'vpc-public-dmz',
        targetVpc: 'vpc-isolated-pci-core',
        firewallRule: 'Allow TCP 5432 (PostgreSQL)',
        domain: 'security_lateral_movement',
      },
    },
    {
      id: 'k8s_secrets_vault',
      labels: ['Decision'],
      properties: {
        name: 'Secret: pci-db-master-creds',
        type: 'Opaque Kubernetes Secret',
        vaultMount: '/etc/secrets/database',
        domain: 'security_lateral_movement',
      },
    },
    {
      id: 'db_crown_jewel',
      labels: ['System'],
      properties: {
        name: 'Database: Crown-Jewel PCI PII DB',
        dataClassification: 'Sovereign Restricted Tier-0',
        recordsCount: '52,000,000 PAN cards',
        complianceScope: 'PCI-DSS 4.0 / GDPR Strict',
        domain: 'security_lateral_movement',
      },
    },

    // ----------------------------------------------------
    // DOMAIN 3: CODEBASE BLAST RADIUS & ARCHITECTURE
    // ----------------------------------------------------
    {
      id: 'pr_schema_change',
      labels: ['Decision'],
      properties: {
        name: 'Pull Request #1402',
        title: 'Refactor Account Balance Locking Semantics',
        author: 'Junior Engineer',
        changedLines: 480,
        targetBranch: 'main',
        domain: 'codebase_blast_radius',
      },
    },
    {
      id: 'service_billing',
      labels: ['System'],
      properties: {
        name: 'Service: billing-core-svc',
        language: 'Go 1.25',
        concurrencyModel: 'Pessimistic Row Locks',
        domain: 'codebase_blast_radius',
      },
    },
    {
      id: 'service_auth',
      labels: ['System'],
      properties: {
        name: 'Service: auth-session-bridge',
        language: 'Rust / Tokio',
        domain: 'codebase_blast_radius',
      },
    },
    {
      id: 'service_checkout',
      labels: ['System'],
      properties: {
        name: 'Service: checkout-orchestrator',
        rpsPeak: '42,000 req/sec',
        domain: 'codebase_blast_radius',
      },
    },
  ];

  const edges: GraphEdge[] = [
    // ----------------------------------------------------
    // FRAUD EDGES
    // ----------------------------------------------------
    {
      id: 'e_f1',
      type: 'USED_DEVICE',
      source: 'acc_8891',
      target: 'dev_fingerprint_99',
      properties: { sessionsCount: 18, firstSeen: '2026-10-01' },
    },
    {
      id: 'e_f2',
      type: 'USED_DEVICE',
      source: 'acc_mule_14',
      target: 'dev_fingerprint_99',
      properties: { sessionsCount: 5, firstSeen: '2026-10-14' },
    },
    {
      id: 'e_f3',
      type: 'USED_IP',
      source: 'acc_mule_14',
      target: 'ip_vpn_nord',
      properties: { protocol: 'WireGuard' },
    },
    {
      id: 'e_f4',
      type: 'TRANSFERRED',
      source: 'acc_8891',
      target: 'acc_mule_14',
      properties: { amount: '$42,000', timestamp: '2026-10-18T04:12:00Z', memo: 'Consulting invoice' },
    },
    {
      id: 'e_f5',
      type: 'TRANSFERRED',
      source: 'acc_mule_14',
      target: 'acc_mule_22',
      properties: { amount: '$39,500', timestamp: '2026-10-18T04:19:00Z', feeRetained: '$2,500' },
    },
    {
      id: 'e_f6',
      type: 'TRANSFERRED',
      source: 'acc_mule_22',
      target: 'acc_8891',
      properties: { amount: '$38,000', timestamp: '2026-10-18T04:28:00Z', layeringCycle: true },
    },
    {
      id: 'e_f7',
      type: 'SIPHONED_TO',
      source: 'acc_mule_22',
      target: 'crypto_bridge_01',
      properties: { channel: 'USDT Trc20', amount: '$15,000' },
    },

    // ----------------------------------------------------
    // SECURITY LATERAL MOVEMENT EDGES
    // ----------------------------------------------------
    {
      id: 'e_s1',
      type: 'IMPACTED_BY',
      source: 'pod_public_api',
      target: 'cve_2026_4102',
      properties: { exploitVector: 'Header buffer overflow' },
    },
    {
      id: 'e_s2',
      type: 'ASSUMES_ROLE',
      source: 'pod_public_api',
      target: 'iam_instance_role',
      properties: { credentialMethod: 'IMDSv2 token bypass' },
    },
    {
      id: 'e_s3',
      type: 'GOVERNED_BY',
      source: 'iam_instance_role',
      target: 'k8s_secrets_vault',
      properties: { accessLevel: 'Read/Decrypt Master Secrets' },
    },
    {
      id: 'e_s4',
      type: 'ROUTED_THROUGH',
      source: 'pod_public_api',
      target: 'vpc_peering_prod',
      properties: { egressPort: 5432, protocol: 'PostgreSQL Wire' },
    },
    {
      id: 'e_s5',
      type: 'DEPENDS_ON',
      source: 'vpc_peering_prod',
      target: 'db_crown_jewel',
      properties: { targetRole: 'postgres-super-admin' },
    },

    // ----------------------------------------------------
    // CODEBASE DEADLOCK EDGES
    // ----------------------------------------------------
    {
      id: 'e_c1',
      type: 'AUTHOR_OF',
      source: 'pr_schema_change',
      target: 'service_billing',
      properties: { targetFile: 'src/billing/account_lock.go' },
    },
    {
      id: 'e_c2',
      type: 'DEPENDS_ON',
      source: 'service_checkout',
      target: 'service_billing',
      properties: { syncCall: 'DeductFunds()' },
    },
    {
      id: 'e_c3',
      type: 'DEPENDS_ON',
      source: 'service_billing',
      target: 'service_auth',
      properties: { syncCall: 'VerifySessionToken()' },
    },
    {
      id: 'e_c4',
      type: 'DEPENDS_ON',
      source: 'service_auth',
      target: 'service_checkout',
      properties: { syncCall: 'GetActiveCart()' }, // Circular dependency!
    },
  ];

  return { nodes, edges };
}
