import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import { 
  Layers, 
  Cpu, 
  Database, 
  Globe, 
  Server, 
  ShieldCheck, 
  Workflow, 
  GitBranch, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  ArrowRight, 
  Terminal,
  Activity,
  CheckCircle2,
  RefreshCw,
  Info,
  Edit2,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  Link2,
  Unlink,
  X,
  Move,
  Save,
  Sliders
} from 'lucide-react';

export type NodeType = 'client' | 'gateway' | 'service' | 'queue' | 'database' | 'security' | 'cicd';

export interface ArchitectureNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  tech: string;
  protocol: string;
  notes: string;
}

export interface ArchitectureEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  category: 'Microservices' | 'Spring Boot' | 'Security / OAuth' | 'DevOps / K8s' | 'Custom';
  description: string;
  mermaidSyntax: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  isCustom?: boolean;
}

const INITIAL_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'microservices',
    name: 'Microservices Event-Driven Topology',
    category: 'Microservices',
    description: 'Resilient asynchronous architecture with API Gateway, Spring Boot services, Kafka message broker, and PostgreSQL shards.',
    mermaidSyntax: `graph LR
    Client[Web & Mobile Clients] --> Gateway[Spring Cloud API Gateway]
    Gateway --> Auth[Keycloak Auth Service]
    Gateway --> OrderSvc[Order Service]
    Gateway --> PaymentSvc[Payment Service]
    OrderSvc --> Kafka{Kafka Event Bus}
    PaymentSvc --> Kafka
    Kafka --> NotificationSvc[Notification Service]
    OrderSvc --> OrderDB[(PostgreSQL Primary)]
    PaymentSvc --> Redis[(Redis Cache)]`,
    nodes: [
      { id: 'client', label: 'Angular SPA & Mobile', type: 'client', x: 60, y: 160, tech: 'Angular 18, Vite', protocol: 'HTTPS / WSS', notes: 'Client layer consuming REST endpoints and WebSocket updates.' },
      { id: 'gateway', label: 'API Gateway', type: 'gateway', x: 260, y: 160, tech: 'Spring Cloud Gateway', protocol: 'HTTP/2', notes: 'Rate limiting, route forwarding, SSL termination, and CORS policy.' },
      { id: 'auth', label: 'Auth & OAuth Service', type: 'security', x: 480, y: 60, tech: 'Keycloak, Spring Security', protocol: 'OIDC / JWT', notes: 'Issues asymmetric RS256 signed JWT tokens and validates RBAC scopes.' },
      { id: 'orders', label: 'Order Microservice', type: 'service', x: 480, y: 160, tech: 'Spring Boot 3, Java 21', protocol: 'REST / gRPC', notes: 'Domain-driven order orchestration with optimistic locking.' },
      { id: 'payments', label: 'Payment Microservice', type: 'service', x: 480, y: 260, tech: 'Spring Boot 3, Stripe SDK', protocol: 'REST / Idempotent', notes: 'Handles transactions with distributed idempotency keys.' },
      { id: 'kafka', label: 'Kafka Event Broker', type: 'queue', x: 740, y: 210, tech: 'Apache Kafka 3.7', protocol: 'TCP / Binary', notes: 'Event topics: order-created, payment-processed, inventory-reserved.' },
      { id: 'order_db', label: 'Order PostgreSQL', type: 'database', x: 740, y: 100, tech: 'PostgreSQL 16 + HikariCP', protocol: 'JDBC / SQL', notes: 'Read-write replica topology with connection pooling.' },
      { id: 'cache', label: 'Distributed Cache', type: 'database', x: 960, y: 210, tech: 'Redis Cluster 7', protocol: 'RESP', notes: 'Cache-aside pattern for hot orders and rate limiter buckets.' },
    ],
    edges: [
      { id: 'e1', from: 'client', to: 'gateway', label: 'REST / HTTPS', animated: true },
      { id: 'e2', from: 'gateway', to: 'auth', label: 'JWT Verify' },
      { id: 'e3', from: 'gateway', to: 'orders', label: 'Proxy /orders', animated: true },
      { id: 'e4', from: 'gateway', to: 'payments', label: 'Proxy /payments' },
      { id: 'e5', from: 'orders', to: 'order_db', label: 'JPA SQL Query' },
      { id: 'e6', from: 'orders', to: 'kafka', label: 'Publish Event', animated: true },
      { id: 'e7', from: 'payments', to: 'kafka', label: 'Publish Event' },
      { id: 'e8', from: 'kafka', to: 'cache', label: 'Sync State', animated: true },
    ],
  },
  {
    id: 'springboot-layer',
    name: 'Spring Boot 3 Enterprise Multi-Tier',
    category: 'Spring Boot',
    description: 'Clean onion architecture showing HTTP dispatch, security filters, service transaction boundaries, and DB pool.',
    mermaidSyntax: `graph TD
    Client --> Dispatcher[DispatcherServlet]
    Dispatcher --> FilterChain[SecurityFilterChain JWT]
    FilterChain --> Controller[REST Controllers @RestController]
    Controller --> ServiceLayer[Transactional Service Layer @Transactional]
    ServiceLayer --> Repo[Spring Data JPA Repositories]
    Repo --> Pool[HikariCP Connection Pool (32 conn)]
    Pool --> Postgres[(PostgreSQL 16 Staging)]
    ServiceLayer --> Cache[(Redis Cache-Aside)]`,
    nodes: [
      { id: 'client', label: 'HTTP Request', type: 'client', x: 80, y: 160, tech: 'Web Browser / cURL', protocol: 'HTTPS', notes: 'Inbound API call with Bearer token header.' },
      { id: 'dispatcher', label: 'DispatcherServlet', type: 'gateway', x: 260, y: 160, tech: 'Spring MVC Web', protocol: 'Java NIO', notes: 'Front controller routing requests to handler mappings.' },
      { id: 'security', label: 'Security Filter Chain', type: 'security', x: 440, y: 160, tech: 'Spring Security 6.3', protocol: 'JWT Filter', notes: 'Validates claims, issuer, expiration, and SecurityContextHolder.' },
      { id: 'controller', label: 'REST Controllers', type: 'service', x: 620, y: 160, tech: '@RestController', protocol: 'DTO / JSON', notes: 'Input validation via @Valid and DTO mapping.' },
      { id: 'service', label: 'Service Layer', type: 'service', x: 800, y: 160, tech: '@Service @Transactional', protocol: 'Java Virtual Threads', notes: 'Business logic execution and transaction boundaries.' },
      { id: 'repo', label: 'Spring Data JPA', type: 'database', x: 980, y: 100, tech: 'Hibernate 6.5', protocol: 'EntityGraph / JPQL', notes: 'Zero N+1 query execution with prepared statements.' },
      { id: 'db', label: 'PostgreSQL Database', type: 'database', x: 980, y: 220, tech: 'PostgreSQL 16', protocol: 'TCP :5432', notes: 'ACID transactional persistence with MVCC concurrency.' },
    ],
    edges: [
      { id: 'e1', from: 'client', to: 'dispatcher', animated: true },
      { id: 'e2', from: 'dispatcher', to: 'security' },
      { id: 'e3', from: 'security', to: 'controller', animated: true },
      { id: 'e4', from: 'controller', to: 'service', animated: true },
      { id: 'e5', from: 'service', to: 'repo' },
      { id: 'e6', from: 'repo', to: 'db', animated: true },
    ],
  },
  {
    id: 'oauth2-pkce',
    name: 'OAuth 2.0 & OIDC Flow with PKCE',
    category: 'Security / OAuth',
    description: 'Modern authorization code exchange with Proof Key for Code Exchange (RFC 7636) for single page applications.',
    mermaidSyntax: `sequenceDiagram
    participant SPA as Angular SPA
    participant Auth as Auth Server (Keycloak/OIDC)
    participant API as Resource Server (Spring Boot)
    SPA->>Auth: 1. /authorize (code_challenge + S256)
    Auth-->>SPA: 2. Auth Code (Redirect)
    SPA->>Auth: 3. /token (Auth Code + code_verifier)
    Auth-->>SPA: 4. ID Token & Access JWT
    SPA->>API: 5. Bearer <Access JWT>
    API-->>SPA: 6. Protected JSON Data`,
    nodes: [
      { id: 'spa', label: 'Single Page App', type: 'client', x: 100, y: 140, tech: 'Angular / React SPA', protocol: 'Client-Side', notes: 'Generates random code_verifier and SHA-256 code_challenge.' },
      { id: 'auth_server', label: 'Identity Provider', type: 'security', x: 420, y: 80, tech: 'Keycloak / Okta', protocol: 'OIDC Endpoints', notes: 'Authenticates user, verifies challenge hash, and mints tokens.' },
      { id: 'resource_api', label: 'Resource Server', type: 'service', x: 740, y: 140, tech: 'Spring Boot Resource Server', protocol: 'Stateless JWT', notes: 'Validates asymmetric public key signature via JWKS.' },
    ],
    edges: [
      { id: 'e1', from: 'spa', to: 'auth_server', label: '1. /authorize (PKCE)', animated: true },
      { id: 'e2', from: 'auth_server', to: 'spa', label: '2. Code Exchange', animated: true },
      { id: 'e3', from: 'spa', to: 'resource_api', label: '3. Bearer Token', animated: true },
    ],
  },
  {
    id: 'gitops-k8s',
    name: 'CI/CD & GitOps Kubernetes Pipeline',
    category: 'DevOps / K8s',
    description: 'Continuous integration and deployment workflow from git push to production Kubernetes cluster with ArgoCD.',
    mermaidSyntax: `graph LR
    Dev[Developer Push] --> GitHub[GitHub Repository]
    GitHub --> GHA[GitHub Actions CI]
    GHA --> Trivy[Trivy Security Scan]
    GHA --> DockerBuild[Docker Multi-Stage Build]
    DockerBuild --> Registry[Container Registry GHCR]
    Registry --> ArgoCD[ArgoCD GitOps Sync]
    ArgoCD --> K8s[Kubernetes Staging/Prod Cluster]`,
    nodes: [
      { id: 'git', label: 'Git Commit', type: 'cicd', x: 80, y: 160, tech: 'Git / GitHub', protocol: 'SSH / HTTPS', notes: 'Pull request review and branch merge triggers automated CI.' },
      { id: 'ci', label: 'GitHub Actions CI', type: 'cicd', x: 280, y: 160, tech: 'GitHub Runners', protocol: 'Linux Container', notes: 'Runs unit tests, integration tests, and SonarQube quality gate.' },
      { id: 'security_scan', label: 'Trivy Scan', type: 'security', x: 480, y: 80, tech: 'Aqua Trivy', protocol: 'Static Analysis', notes: 'CVE vulnerability detection in dependencies and OS base images.' },
      { id: 'docker', label: 'Docker Multi-Stage', type: 'cicd', x: 480, y: 220, tech: 'Docker Buildx', protocol: 'OCI Container', notes: 'Produces distroless immutable image tagged with git SHA.' },
      { id: 'registry', label: 'Container Registry', type: 'gateway', x: 700, y: 160, tech: 'GHCR / AWS ECR', protocol: 'Docker Registry v2', notes: 'Stores cryptographically signed container manifests.' },
      { id: 'k8s', label: 'Kubernetes Pods', type: 'service', x: 920, y: 160, tech: 'K8s 1.30 / EKS', protocol: 'Internal Overlay Net', notes: 'Deployments with rolling zero-downtime updates & liveness probes.' },
    ],
    edges: [
      { id: 'e1', from: 'git', to: 'ci', animated: true },
      { id: 'e2', from: 'ci', to: 'security_scan' },
      { id: 'e3', from: 'ci', to: 'docker', animated: true },
      { id: 'e4', from: 'docker', to: 'registry' },
      { id: 'e5', from: 'registry', to: 'k8s', animated: true },
    ],
  },
];

export const ArchitectureStudio: React.FC = () => {
  // Diagrams state with LocalStorage persistence
  const [templates, setTemplates] = useState<DiagramTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_architecture_diagrams_v3');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('microservices');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('gateway');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedMermaid, setCopiedMermaid] = useState<boolean>(false);
  const [isMermaidDrawerOpen, setIsMermaidDrawerOpen] = useState<boolean>(false);
  const [editableMermaid, setEditableMermaid] = useState<string>('');

  // Modals for Editing and Adding Components
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddEdgeModalOpen, setIsAddEdgeModalOpen] = useState<boolean>(false);

  // Edit Node Form state
  const [editLabel, setEditLabel] = useState<string>('');
  const [editTech, setEditTech] = useState<string>('');
  const [editProtocol, setEditProtocol] = useState<string>('');
  const [editType, setEditType] = useState<NodeType>('service');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editX, setEditX] = useState<number>(100);
  const [editY, setEditY] = useState<number>(100);

  // New Node Form state
  const [newLabel, setNewLabel] = useState<string>('');
  const [newTech, setNewTech] = useState<string>('Spring Boot 3, Java 21');
  const [newProtocol, setNewProtocol] = useState<string>('HTTPS / REST');
  const [newType, setNewType] = useState<NodeType>('service');
  const [newNotes, setNewNotes] = useState<string>('');
  const [connectToNodeId, setConnectToNodeId] = useState<string>('');
  const [newEdgeLabel, setNewEdgeLabel] = useState<string>('REST API');

  // New Edge Form state
  const [edgeFromId, setEdgeFromId] = useState<string>('');
  const [edgeToId, setEdgeToId] = useState<string>('');
  const [edgeCustomLabel, setEdgeCustomLabel] = useState<string>('');
  const [edgeAnimated, setEdgeAnimated] = useState<boolean>(true);

  // Dragging support on canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Active diagram object
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0] || INITIAL_TEMPLATES[0];
  const selectedNode = activeTemplate.nodes.find((n) => n.id === selectedNodeId) || activeTemplate.nodes[0] || null;

  // Persist templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('devpulse_architecture_diagrams_v3', JSON.stringify(templates));
    } catch (e) {
      console.warn('Failed to save templates', e);
    }
  }, [templates]);

  // Sync Mermaid editor
  useEffect(() => {
    setEditableMermaid(activeTemplate.mermaidSyntax);
  }, [selectedTemplateId, activeTemplate.mermaidSyntax]);

  // Canvas Mouse Dragging Handlers
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDragNodeId(nodeId);
    setIsDragging(true);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !dragNodeId || !svgRef.current) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    // Constrain inside canvas (1140 x 380)
    const clampedX = Math.round(Math.max(10, Math.min(970, mouseX - 80)));
    const clampedY = Math.round(Math.max(10, Math.min(300, mouseY - 35)));

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          nodes: tmpl.nodes.map((n) => (n.id === dragNodeId ? { ...n, x: clampedX, y: clampedY } : n)),
        };
      })
    );
  };

  const handleSvgMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragNodeId(null);
    }
  };

  // Populate edit modal when opening
  const handleOpenEditModal = () => {
    if (!selectedNode) return;
    setEditLabel(selectedNode.label);
    setEditTech(selectedNode.tech);
    setEditProtocol(selectedNode.protocol);
    setEditType(selectedNode.type);
    setEditNotes(selectedNode.notes);
    setEditX(selectedNode.x);
    setEditY(selectedNode.y);
    setIsEditModalOpen(true);
    audioService.playBeep(850, 0.03);
  };

  // Save Node Edits
  const handleSaveNodeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId) return;

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          nodes: tmpl.nodes.map((node) => {
            if (node.id !== selectedNodeId) return node;
            return {
              ...node,
              label: editLabel.trim(),
              tech: editTech.trim(),
              protocol: editProtocol.trim(),
              type: editType,
              notes: editNotes.trim(),
              x: Number(editX),
              y: Number(editY),
            };
          }),
        };
      })
    );

    setIsEditModalOpen(false);
    audioService.playSuccessTone();
  };

  // Delete Component
  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    if (!confirm(`Delete component "${nodeName}" and remove all its connections?`)) return;

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        const remainingNodes = tmpl.nodes.filter((n) => n.id !== nodeId);
        const remainingEdges = tmpl.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
        return {
          ...tmpl,
          nodes: remainingNodes,
          edges: remainingEdges,
        };
      })
    );

    // Deselect if active
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }

    audioService.playBeep(450, 0.05);
  };

  // Add New Component
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newId = 'node-' + Date.now();
    // Default location staggered
    const nodeCount = activeTemplate.nodes.length;
    const defaultX = 100 + ((nodeCount * 140) % 800);
    const defaultY = 80 + ((nodeCount * 60) % 240);

    const newNode: ArchitectureNode = {
      id: newId,
      label: newLabel.trim(),
      tech: newTech.trim() || 'Java / Spring',
      protocol: newProtocol.trim() || 'HTTPS',
      type: newType,
      notes: newNotes.trim() || 'Newly created architecture component',
      x: defaultX,
      y: defaultY,
    };

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        const newEdges = [...tmpl.edges];
        if (connectToNodeId) {
          newEdges.push({
            id: 'edge-' + Date.now(),
            from: newId,
            to: connectToNodeId,
            label: newEdgeLabel || 'Connection',
            animated: true,
          });
        }
        return {
          ...tmpl,
          nodes: [...tmpl.nodes, newNode],
          edges: newEdges,
        };
      })
    );

    setSelectedNodeId(newId);
    setIsAddModalOpen(false);
    setNewLabel('');
    setNewNotes('');
    setConnectToNodeId('');
    audioService.playSuccessTone();
  };

  // Add Edge / Connection
  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeFromId || !edgeToId || edgeFromId === edgeToId) return;

    const newEdge: ArchitectureEdge = {
      id: 'edge-' + Date.now(),
      from: edgeFromId,
      to: edgeToId,
      label: edgeCustomLabel.trim() || undefined,
      animated: edgeAnimated,
    };

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          edges: [...tmpl.edges, newEdge],
        };
      })
    );

    setIsAddEdgeModalOpen(false);
    setEdgeCustomLabel('');
    audioService.playSuccessTone();
  };

  // Delete Edge / Connection
  const handleDeleteEdge = (edgeId: string) => {
    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          edges: tmpl.edges.filter((e) => e.id !== edgeId),
        };
      })
    );
    audioService.playBeep(450, 0.04);
  };

  // Reset Template to Defaults
  const handleResetCurrentTemplate = () => {
    if (!confirm(`Reset "${activeTemplate.name}" topology back to factory blueprint? Any edits to this diagram will be replaced.`)) return;

    const defaultTmpl = INITIAL_TEMPLATES.find((t) => t.id === activeTemplate.id);
    if (!defaultTmpl) return;

    setTemplates((prev) =>
      prev.map((tmpl) => (tmpl.id === activeTemplate.id ? JSON.parse(JSON.stringify(defaultTmpl)) : tmpl))
    );

    audioService.playSuccessTone();
  };

  // Clear Canvas (Empty Diagram)
  const handleClearCanvas = () => {
    if (!confirm('Clear all components and edges from this canvas? You can build a custom architecture from scratch.')) return;

    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          nodes: [],
          edges: [],
        };
      })
    );
    setSelectedNodeId(null);
    audioService.playBeep(450, 0.05);
  };

  // Apply Edited Mermaid Text
  const handleApplyMermaid = () => {
    setTemplates((prev) =>
      prev.map((tmpl) => {
        if (tmpl.id !== activeTemplate.id) return tmpl;
        return {
          ...tmpl,
          mermaidSyntax: editableMermaid,
        };
      })
    );
    audioService.playSuccessTone();
    alert('Mermaid syntax updated for this topology!');
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(activeTemplate.mermaidSyntax);
    setCopiedMermaid(true);
    audioService.playBeep(1100, 0.05);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  const handleDownloadSvg = () => {
    const svgElem = document.getElementById('architecture-canvas-svg');
    if (!svgElem) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTemplate.id}_architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    audioService.playSuccessTone();
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'client': return { stroke: '#38bdf8', bg: '#0369a1', glow: '#0284c7' };
      case 'gateway': return { stroke: '#06b6d4', bg: '#0e7490', glow: '#06b6d4' };
      case 'service': return { stroke: '#10b981', bg: '#047857', glow: '#10b981' };
      case 'queue': return { stroke: '#f59e0b', bg: '#b45309', glow: '#f59e0b' };
      case 'database': return { stroke: '#a855f7', bg: '#7e22ce', glow: '#a855f7' };
      case 'security': return { stroke: '#f43f5e', bg: '#be123c', glow: '#f43f5e' };
      case 'cicd': return { stroke: '#6366f1', bg: '#4338ca', glow: '#6366f1' };
      default: return { stroke: '#64748b', bg: '#334155', glow: '#64748b' };
    }
  };

  // Connected edges for the selected node
  const incomingEdges = activeTemplate.edges.filter((e) => selectedNode && e.to === selectedNode.id);
  const outgoingEdges = activeTemplate.edges.filter((e) => selectedNode && e.from === selectedNode.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider uppercase">SYSTEM ARCHITECTURE & FLOW STUDIO</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
              Fully Editable & Interactive
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Microservices, Topology & Flow Visualizer
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Live interactive topology canvas. Add, edit, or delete components, adjust connection protocols, inspect telemetry flows, and export Mermaid markdown.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Component Action */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Component</span>
          </button>

          {/* Add Connection Action */}
          <button
            onClick={() => {
              if (activeTemplate.nodes.length < 2) {
                alert('Add at least 2 components to establish connections.');
                return;
              }
              setEdgeFromId(activeTemplate.nodes[0]?.id || '');
              setEdgeToId(activeTemplate.nodes[1]?.id || '');
              setIsAddEdgeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Connect Nodes</span>
          </button>

          <button
            onClick={() => setIsMermaidDrawerOpen(!isMermaidDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isMermaidDrawerOpen ? 'Hide Mermaid' : 'Mermaid Code'}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
            title="Download vector SVG graphic"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* 2. TEMPLATE SELECTOR BUTTONS & CANVAS QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplateId(tmpl.id);
                setSelectedNodeId(tmpl.nodes[0]?.id || null);
                audioService.playBeep(850, 0.03);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 shrink-0 ${
                selectedTemplateId === tmpl.id
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Workflow className={`w-3.5 h-3.5 ${selectedTemplateId === tmpl.id ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>

        {/* Canvas Reset & Clear actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetCurrentTemplate}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
            title="Reset this diagram to default blueprint"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>Reset Blueprint</span>
          </button>

          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/70 text-slate-400 hover:text-rose-300 text-xs font-mono border border-slate-800 hover:border-rose-800/60 transition-colors cursor-pointer"
            title="Delete all nodes to build blank diagram"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN ARCHITECTURE CANVAS STAGE */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl relative">
        {/* Canvas Top Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Topology:</span>
            <span className="text-white font-bold">{activeTemplate.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">{activeTemplate.nodes.length} Components</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400">{activeTemplate.edges.length} Connections</span>
          </div>

          {/* Quick Component Control Bar */}
          <div className="flex items-center gap-2">
            {selectedNode && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Selected: <strong className="text-cyan-300">{selectedNode.label}</strong></span>
                <button
                  onClick={handleOpenEditModal}
                  className="p-1 rounded hover:bg-cyan-950 text-cyan-400 transition-colors cursor-pointer"
                  title="Edit selected component"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteNode(selectedNode.id, selectedNode.label)}
                  className="p-1 rounded hover:bg-rose-950 text-rose-400 transition-colors cursor-pointer"
                  title="Delete selected component"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-slate-400 w-10 text-center text-[11px]">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* SVG Interactive Canvas with drag handles & live editing (CSS Selector 2 target) */}
        <div className="w-full min-h-[480px] overflow-auto relative p-6 flex items-center justify-center bg-slate-950 bg-[radial-gradient(rgba(6,182,212,0.18)_1.2px,transparent_1.2px)] [background-size:26px_26px] shadow-[inset_0_2px_20px_rgba(0,0,0,0.85)] border-t border-slate-800/80 group/canvas">
          {/* Subtle Grid Corner Crosshair Overlays */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-500/40 pointer-events-none flex items-center gap-1.5 select-none">
            <span className="w-2 h-2 border-t-2 border-l-2 border-cyan-500/60 inline-block"></span>
            <span>TOPOLOGY MATRIX // 1140×380</span>
          </div>
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500/60 pointer-events-none flex items-center gap-2 select-none">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> TELEMETRY ACTIVE</span>
            <span className="w-2 h-2 border-t-2 border-r-2 border-cyan-500/60 inline-block"></span>
          </div>
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500/60 pointer-events-none flex items-center gap-1.5 select-none">
            <span className="w-2 h-2 border-b-2 border-l-2 border-cyan-500/60 inline-block"></span>
            <span>DRAG: REPOSITION • CLICK: INSPECT • DOUBLE-CLICK / ✎: EDIT • ✕: DELETE</span>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyan-500/40 pointer-events-none select-none">
            <span className="w-2 h-2 border-b-2 border-r-2 border-cyan-500/60 inline-block"></span>
          </div>

          {activeTemplate.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-16">
              <Layers className="w-12 h-12 text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Empty Architecture Canvas</h4>
                <p className="text-xs font-mono text-slate-400 max-w-sm">
                  Click the "+ Add Component" button above to place microservices, databases, or API gateways onto your topology.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Component</span>
              </button>
            </div>
          ) : (
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
              <svg
                id="architecture-canvas-svg"
                ref={svgRef}
                width="1140"
                height="380"
                viewBox="0 0 1140 380"
                className="select-none"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseUp}
              >
                <defs>
                  <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>

                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Connecting Edges */}
                {activeTemplate.edges.map((edge) => {
                  const sourceNode = activeTemplate.nodes.find((n) => n.id === edge.from);
                  const targetNode = activeTemplate.nodes.find((n) => n.id === edge.to);
                  if (!sourceNode || !targetNode) return null;

                  const startX = sourceNode.x + 80;
                  const startY = sourceNode.y + 35;
                  const endX = targetNode.x;
                  const endY = targetNode.y + 35;

                  // Bezier curve
                  const controlX1 = startX + (endX - startX) / 2;
                  const controlX2 = startX + (endX - startX) / 2;

                  return (
                    <g key={edge.id} className="group">
                      <path
                        d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="2"
                        strokeOpacity="0.5"
                      />
                      {edge.animated && (
                        <path
                          d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="2.5"
                          strokeDasharray="6 8"
                          className="animate-[dash_1s_linear_infinite]"
                        />
                      )}
                      {edge.label && (
                        <text
                          x={(startX + endX) / 2}
                          y={(startY + endY) / 2 - 8}
                          fontFamily="monospace"
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="middle"
                          className="bg-slate-900 pointer-events-none"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Architectural Nodes with Dragging & Edit/Delete Controls */}
                {activeTemplate.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isNodeDragged = dragNodeId === node.id;
                  const colors = getNodeColor(node.type);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        audioService.playBeep(950, 0.03);
                      }}
                      onDoubleClick={() => {
                        setSelectedNodeId(node.id);
                        handleOpenEditModal();
                      }}
                      className={`cursor-grab active:cursor-grabbing group ${isNodeDragged ? 'opacity-90' : ''}`}
                    >
                      {/* Outer Node Card */}
                      <rect
                        x="0"
                        y="0"
                        width="160"
                        height="70"
                        rx="12"
                        fill="#020617"
                        stroke={isSelected ? '#22d3ee' : colors.stroke}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        filter={isSelected ? 'url(#nodeGlow)' : undefined}
                      />

                      {/* Top Status Header in Card */}
                      <rect
                        x="0"
                        y="0"
                        width="160"
                        height="20"
                        rx="12"
                        fill={colors.bg}
                        fillOpacity="0.35"
                      />
                      <circle cx="12" cy="10" r="3.5" fill={colors.stroke} />
                      <text
                        x="22"
                        y="13"
                        fontFamily="monospace"
                        fontSize="8.5"
                        fontWeight="bold"
                        fill="#cbd5e1"
                        className="uppercase tracking-wider"
                      >
                        {node.type}
                      </text>

                      {/* Quick Node Delete Button on SVG card hover */}
                      <g
                        transform="translate(140, 4)"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id, node.label);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <circle cx="6" cy="6" r="6" fill="#991b1b" />
                        <text x="3.5" y="9" fontSize="9" fill="#ffffff" fontWeight="bold">✕</text>
                      </g>

                      {/* Quick Node Edit Button on SVG card hover */}
                      <g
                        transform="translate(122, 4)"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                          handleOpenEditModal();
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <circle cx="6" cy="6" r="6" fill="#0369a1" />
                        <text x="3.5" y="9" fontSize="8" fill="#ffffff" fontWeight="bold">✎</text>
                      </g>

                      {/* Node Main Title */}
                      <text
                        x="10"
                        y="38"
                        fontFamily="sans-serif"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        {node.label}
                      </text>

                      {/* Node Tech Subtitle */}
                      <text
                        x="10"
                        y="54"
                        fontFamily="monospace"
                        fontSize="9"
                        fill="#38bdf8"
                      >
                        {node.tech}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* 4. SELECTED COMPONENT INSPECTOR DRAWER (WITH FULL EDIT & DELETE BUTTONS) */}
        {selectedNode && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-800/60 text-cyan-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">{selectedNode.label}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 text-cyan-300 border border-slate-800">
                    {selectedNode.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    X: {selectedNode.x}, Y: {selectedNode.y}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">{selectedNode.notes}</p>
              </div>
            </div>

            {/* Component Stats + Direct Edit & Delete Buttons */}
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Tech Stack</span>
                  <span className="text-cyan-300 font-bold">{selectedNode.tech}</span>
                </div>
                <div className="border-l border-slate-800 pl-3">
                  <span className="text-slate-500 block text-[9px] uppercase">Protocol</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.protocol}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                  title="Edit component properties & position"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Component</span>
                </button>

                <button
                  onClick={() => handleDeleteNode(selectedNode.id, selectedNode.label)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                  title="Delete component from diagram"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Component</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. CONNECTIONS ROW FOR SELECTED NODE */}
        {selectedNode && (incomingEdges.length > 0 || outgoingEdges.length > 0) && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-slate-500 flex items-center gap-1">
              <Link2 className="w-3 h-3 text-cyan-400" />
              <span>Node Links:</span>
            </span>

            {outgoingEdges.map((edge) => {
              const target = activeTemplate.nodes.find((n) => n.id === edge.to);
              return (
                <div key={edge.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span>To: <strong>{target?.label || edge.to}</strong> {edge.label ? `(${edge.label})` : ''}</span>
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                    title="Delete connection"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {incomingEdges.map((edge) => {
              const source = activeTemplate.nodes.find((n) => n.id === edge.from);
              return (
                <div key={edge.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <span>From: <strong>{source?.label || edge.from}</strong></span>
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                    title="Delete connection"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MERMAID SYNTAX DRAWER (EDITABLE) */}
      {isMermaidDrawerOpen && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Mermaid.js Markdown Specification (Editable)</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMermaid}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                {copiedMermaid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMermaid ? 'Copied' : 'Copy Markdown'}</span>
              </button>
              <button
                onClick={handleApplyMermaid}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>Save Markdown Changes</span>
              </button>
            </div>
          </div>

          <textarea
            value={editableMermaid}
            onChange={(e) => setEditableMermaid(e.target.value)}
            rows={8}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 leading-relaxed focus:outline-none focus:border-cyan-500 resize-y scrollbar-thin"
          />
        </div>
      )}

      {/* EDIT COMPONENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveNodeEdit}
            className="w-full max-w-lg bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Edit Architecture Component</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Component Title / Label</label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Component Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as NodeType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="service">Service / Backend</option>
                    <option value="gateway">API Gateway / Proxy</option>
                    <option value="database">Database / Storage</option>
                    <option value="queue">Queue / Message Broker</option>
                    <option value="client">Client / Frontend SPA</option>
                    <option value="security">Security / Auth</option>
                    <option value="cicd">CI/CD / Pipeline</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Protocol</label>
                  <input
                    type="text"
                    value={editProtocol}
                    onChange={(e) => setEditProtocol(e.target.value)}
                    placeholder="e.g. HTTPS, gRPC, JDBC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={editTech}
                  onChange={(e) => setEditTech(e.target.value)}
                  placeholder="e.g. Spring Boot 3, Java 21, PostgreSQL 16"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Architectural Notes / Description</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Canvas X Position</label>
                  <input
                    type="number"
                    value={editX}
                    onChange={(e) => setEditX(Number(e.target.value))}
                    step={10}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Canvas Y Position</label>
                  <input
                    type="number"
                    value={editY}
                    onChange={(e) => setEditY(Number(e.target.value))}
                    step={10}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (selectedNode) handleDeleteNode(selectedNode.id, selectedNode.label);
                  setIsEditModalOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-mono cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ADD COMPONENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAddNode}
            className="w-full max-w-lg bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Add Architecture Component</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Component Name / Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Inventory Microservice"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Component Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as NodeType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="service">Service / Backend</option>
                    <option value="gateway">API Gateway / Proxy</option>
                    <option value="database">Database / Storage</option>
                    <option value="queue">Queue / Message Broker</option>
                    <option value="client">Client / Frontend SPA</option>
                    <option value="security">Security / Auth</option>
                    <option value="cicd">CI/CD / Pipeline</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Protocol</label>
                  <input
                    type="text"
                    value={newProtocol}
                    onChange={(e) => setNewProtocol(e.target.value)}
                    placeholder="e.g. HTTPS, gRPC, JDBC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="e.g. Spring Boot 3, Java 21, Kafka"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Purpose, responsibilities, and scaling notes..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Optional Connection to Existing Node */}
              {activeTemplate.nodes.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="text-xs font-mono text-slate-400 block">Link to Existing Node (Optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={connectToNodeId}
                      onChange={(e) => setConnectToNodeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">None (Stand-alone)</option>
                      {activeTemplate.nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          Connect to {n.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={newEdgeLabel}
                      onChange={(e) => setNewEdgeLabel(e.target.value)}
                      placeholder="Edge label (e.g. REST API)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Add to Canvas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD EDGE / CONNECTION MODAL */}
      {isAddEdgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAddEdge}
            className="w-full max-w-md bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Connect Components</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEdgeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Source Node (From)</label>
                <select
                  value={edgeFromId}
                  onChange={(e) => setEdgeFromId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                >
                  {activeTemplate.nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Target Node (To)</label>
                <select
                  value={edgeToId}
                  onChange={(e) => setEdgeToId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                >
                  {activeTemplate.nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Connection Label (Protocol / Action)</label>
                <input
                  type="text"
                  value={edgeCustomLabel}
                  onChange={(e) => setEdgeCustomLabel(e.target.value)}
                  placeholder="e.g. gRPC Call, SQL Query, Kafka Topic"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edge-anim"
                  checked={edgeAnimated}
                  onChange={(e) => setEdgeAnimated(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500"
                />
                <label htmlFor="edge-anim" className="text-xs font-mono text-slate-300 cursor-pointer">
                  Animate live telemetry pulse
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEdgeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!edgeFromId || !edgeToId || edgeFromId === edgeToId}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Create Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
