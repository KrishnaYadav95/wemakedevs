import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GraphNode, GraphEdge, NodeLabel } from '../lib/falkordb/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Eye,
  Layers,
  Search,
  X,
  Check,
  ArrowRight,
  Download,
  Target,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { ExportGraphModal } from './ExportGraphModal';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  onSelectNode?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  initialFocusedNodeId?: string | null;
}

const LABEL_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Person: { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd', glow: 'rgba(59, 130, 246, 0.4)' },
  System: { bg: '#064e3b', border: '#10b981', text: '#6ee7b7', glow: 'rgba(16, 185, 129, 0.4)' },
  Policy: { bg: '#881337', border: '#f43f5e', text: '#fda4af', glow: 'rgba(244, 63, 94, 0.4)' },
  Incident: { bg: '#78350f', border: '#f59e0b', text: '#fde68a', glow: 'rgba(245, 158, 11, 0.4)' },
  Decision: { bg: '#581c87', border: '#a855f7', text: '#d8b4fe', glow: 'rgba(168, 85, 247, 0.4)' },
  Memory: { bg: '#164e63', border: '#06b6d4', text: '#67e8f9', glow: 'rgba(6, 182, 212, 0.4)' },
  Agent: { bg: '#312e81', border: '#6366f1', text: '#a5b4fc', glow: 'rgba(99, 102, 241, 0.4)' },
  Observation: { bg: '#1e293b', border: '#64748b', text: '#cbd5e1', glow: 'rgba(100, 116, 139, 0.4)' },
};

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  onSelectNode,
  selectedNodeId,
  initialFocusedNodeId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transform state (pan / zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.9 });
  const [activeLabelFilter, setActiveLabelFilter] = useState<string>('All');
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Global Real-time Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Focus Mode State (Isolates 1st and 2nd degree neighborhood and hides unrelated nodes)
  const [isFocusModeEnabled, setIsFocusModeEnabled] = useState<boolean>(true);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(initialFocusedNodeId);
  const [focusHops, setFocusHops] = useState<1 | 2>(2);

  // Simulation nodes with stable coordinates
  const simNodesRef = useRef<SimNode[]>([]);

  // Compute 1st and 2nd degree neighborhood when a node is focused
  const neighborhoodData = useMemo(() => {
    if (!focusedNodeId) {
      return {
        isActive: false,
        focalNodeId: null,
        firstDegree: new Set<string>(),
        secondDegree: new Set<string>(),
        allVisible: new Set<string>(),
        unrelatedCount: 0,
      };
    }

    const first = new Set<string>();
    const second = new Set<string>();

    // 1st degree: direct neighbors of focusedNodeId (incoming or outgoing)
    for (const edge of edges) {
      if (edge.source === focusedNodeId && edge.target !== focusedNodeId) {
        first.add(edge.target);
      } else if (edge.target === focusedNodeId && edge.source !== focusedNodeId) {
        first.add(edge.source);
      }
    }

    // 2nd degree: neighbors of 1st-degree nodes (excluding focal center and 1st-degree nodes)
    if (focusHops >= 2) {
      for (const firstId of first) {
        for (const edge of edges) {
          if (edge.source === firstId && edge.target !== focusedNodeId && !first.has(edge.target)) {
            second.add(edge.target);
          } else if (edge.target === firstId && edge.source !== focusedNodeId && !first.has(edge.source)) {
            second.add(edge.source);
          }
        }
      }
    }

    const all = new Set<string>([focusedNodeId, ...first, ...second]);
    const unrelatedCount = nodes.filter((n) => !all.has(n.id)).length;

    return {
      isActive: true,
      focalNodeId: focusedNodeId,
      firstDegree: first,
      secondDegree: second,
      allVisible: all,
      unrelatedCount,
    };
  }, [focusedNodeId, edges, nodes, focusHops]);

  // Real-time matched node IDs based on search query
  const matchingNodeIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return new Set<string>();

    const matches = new Set<string>();
    for (const node of nodes) {
      if (node.id.toLowerCase().includes(q)) {
        matches.add(node.id);
        continue;
      }

      if (node.labels.some((l) => l.toLowerCase().includes(q))) {
        matches.add(node.id);
        continue;
      }

      const hasPropMatch = Object.entries(node.properties).some(([k, v]) => {
        if (k.toLowerCase().includes(q)) return true;
        if (v === null || v === undefined) return false;
        const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return strVal.toLowerCase().includes(q);
      });

      if (hasPropMatch) {
        matches.add(node.id);
      }
    }
    return matches;
  }, [nodes, searchQuery]);

  const matchedNodesList = useMemo(() => {
    return Array.from(matchingNodeIds).map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as GraphNode[];
  }, [matchingNodeIds, nodes]);

  // Center/focus on a node
  const focusNode = (targetNodeId: string, shouldSetNeighborhoodFocus = false) => {
    const targetSim = simNodesRef.current.find((n) => n.id === targetNodeId);
    if (!targetSim || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 600;
    const targetScale = 1.15;

    setTransform({
      x: width / 2 - targetSim.x * targetScale,
      y: height / 2 - targetSim.y * targetScale,
      scale: targetScale,
    });

    const fullNode = nodes.find((n) => n.id === targetNodeId);
    if (fullNode && onSelectNode) {
      onSelectNode(fullNode);
    }

    if (shouldSetNeighborhoodFocus || isFocusModeEnabled) {
      setFocusedNodeId(targetNodeId);
    }
  };

  // Handle enter key in search input to cycle through matches
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matchedNodesList.length > 0) {
      e.preventDefault();
      const nextIdx = (activeMatchIndex + 1) % matchedNodesList.length;
      setActiveMatchIndex(nextIdx);
      focusNode(matchedNodesList[nextIdx].id, isFocusModeEnabled);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  // Initialize or update simulation nodes
  useEffect(() => {
    const existingMap = new Map(simNodesRef.current.map((n) => [n.id, n]));
    const width = containerRef.current?.clientWidth || 900;
    const height = containerRef.current?.clientHeight || 600;
    const cx = width / 2;
    const cy = height / 2;

    simNodesRef.current = nodes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      if (existing) {
        return { ...existing, labels: n.labels, properties: n.properties };
      }
      const angle = (idx / nodes.length) * 2 * Math.PI;
      const dist = 180 + (idx % 3) * 70;
      return {
        ...n,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: n.labels.includes('System') || n.labels.includes('Person') ? 24 : 20,
      };
    });
  }, [nodes]);

  // Force simulation tick loop
  useEffect(() => {
    let animId: number;
    let iteration = 0;

    const tick = () => {
      iteration++;
      const simNodes = simNodesRef.current;
      const nodeCount = simNodes.length;
      if (nodeCount === 0) return;

      const width = containerRef.current?.clientWidth || 900;
      const height = containerRef.current?.clientHeight || 600;
      const cx = width / 2;
      const cy = height / 2;

      // In Focus Mode: focus on centering the isolated active nodes
      const isNodeActive = (id: string) => {
        if (!neighborhoodData.isActive) return true;
        return neighborhoodData.allVisible.has(id);
      };

      // Repulsion between nodes
      for (let i = 0; i < nodeCount; i++) {
        const n1 = simNodes[i];
        if (!isNodeActive(n1.id)) continue;

        // Center gravity
        n1.vx += (cx - n1.x) * 0.0003;
        n1.vy += (cy - n1.y) * 0.0003;

        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = simNodes[j];
          if (!isNodeActive(n2.id)) continue;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const minDist = n1.radius + n2.radius + (neighborhoodData.isActive ? 85 : 60);

          if (dist < minDist) {
            const force = ((minDist - dist) / dist) * 0.4;
            const fx = dx * force;
            const fy = dy * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Attraction along edges
      const nodeIndexMap = new Map(simNodes.map((n, i) => [n.id, i]));
      for (const edge of edges) {
        if (neighborhoodData.isActive) {
          if (!neighborhoodData.allVisible.has(edge.source) || !neighborhoodData.allVisible.has(edge.target)) {
            continue;
          }
        }

        const idx1 = nodeIndexMap.get(edge.source);
        const idx2 = nodeIndexMap.get(edge.target);
        if (idx1 !== undefined && idx2 !== undefined) {
          const n1 = simNodes[idx1];
          const n2 = simNodes[idx2];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = neighborhoodData.isActive ? 125 : 110;
          const springForce = (dist - targetDist) * 0.003;

          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;

          n1.vx += fx;
          n1.vy += fy;
          n2.vx -= fx;
          n2.vy -= fy;
        }
      }

      // Apply velocities with damping
      for (let i = 0; i < nodeCount; i++) {
        if (draggedNodeIndex === i) continue;
        const n = simNodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.88;
        n.vy *= 0.88;
      }

      renderCanvas();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [
    edges,
    transform,
    draggedNodeIndex,
    highlightedNodeIds,
    highlightedEdgeIds,
    activeLabelFilter,
    selectedNodeId,
    matchingNodeIds,
    searchQuery,
    neighborhoodData,
  ]);

  // Main canvas rendering
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Background grid dots
    ctx.save();
    ctx.fillStyle = 'rgba(51, 65, 85, 0.15)';
    const gridStep = 32 * transform.scale;
    const offsetX = ((transform.x % gridStep) + gridStep) % gridStep;
    const offsetY = ((transform.y % gridStep) + gridStep) % gridStep;
    for (let x = offsetX; x < rect.width; x += gridStep) {
      for (let y = offsetY; y < rect.height; y += gridStep) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    ctx.restore();

    // Apply transform for graph elements
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const simNodes = simNodesRef.current;
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const isFiltered = (label: string) => activeLabelFilter === 'All' || activeLabelFilter === label;
    const isSearchActive = searchQuery.trim().length > 0;
    const isFocusActive = neighborhoodData.isActive;

    // 1. Draw Edges
    for (const edge of edges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) continue;

      // In Focus Mode: HIDE UNRELATED EDGES!
      if (isFocusActive) {
        if (!neighborhoodData.allVisible.has(src.id) || !neighborhoodData.allVisible.has(tgt.id)) {
          continue; // completely hide edges connecting to hidden nodes
        }
      }

      const isEdgeHighlighted = highlightedEdgeIds.includes(edge.id);
      const isSrcVisible = isFiltered(src.labels[0]);
      const isTgtVisible = isFiltered(tgt.labels[0]);

      // Focus Mode edge styling: check if directly connected to focal node
      const isFocalEdge = isFocusActive && (src.id === neighborhoodData.focalNodeId || tgt.id === neighborhoodData.focalNodeId);

      // Search match status for endpoints
      const isSrcSearchMatch = !isSearchActive || matchingNodeIds.has(src.id);
      const isTgtSearchMatch = !isSearchActive || matchingNodeIds.has(tgt.id);
      const isBothSearchMatch = isSearchActive && isSrcSearchMatch && isTgtSearchMatch;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);

      if (isFocalEdge) {
        // Direct 1st-degree connection from focal center node
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
      } else if (isFocusActive) {
        // 2nd-degree connection between neighbors
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
      } else if (isBothSearchMatch) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
      } else if (isEdgeHighlighted) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
      } else {
        const baseAlpha = isSearchActive ? (isSrcSearchMatch || isTgtSearchMatch ? 0.2 : 0.04) : 0.35;
        ctx.strokeStyle =
          isSrcVisible && isTgtVisible
            ? `rgba(71, 85, 105, ${baseAlpha})`
            : 'rgba(71, 85, 105, 0.05)';
        ctx.lineWidth = 1.2;
      }
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const arrowDist = tgt.radius + 6;
      const arrowX = tgt.x - Math.cos(angle) * arrowDist;
      const arrowY = tgt.y - Math.sin(angle) * arrowDist;
      const arrowSize = isFocalEdge || isBothSearchMatch ? 6 : isEdgeHighlighted ? 7 : 5;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = isFocalEdge
        ? '#06b6d4'
        : isBothSearchMatch
        ? '#22d3ee'
        : isEdgeHighlighted
        ? '#10b981'
        : isSearchActive
        ? 'rgba(100, 116, 139, 0.2)'
        : 'rgba(100, 116, 139, 0.5)';
      ctx.fill();

      // Draw edge label
      if (isFocalEdge || isBothSearchMatch || isEdgeHighlighted) {
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        ctx.font = '600 10px JetBrains Mono, monospace';
        ctx.fillStyle = isFocalEdge ? '#67e8f9' : isBothSearchMatch ? '#67e8f9' : '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText(edge.type, midX, midY - 6);
      }

      ctx.restore();
    }

    // 2. Draw Nodes
    for (const node of simNodes) {
      // In Focus Mode: HIDE UNRELATED NODES!
      if (isFocusActive) {
        if (!neighborhoodData.allVisible.has(node.id)) {
          continue; // completely hide unrelated node
        }
      }

      const primaryLabel = node.labels[0] || 'Observation';
      const colors = LABEL_COLORS[primaryLabel] || LABEL_COLORS.Observation;
      const isNodeHighlighted = highlightedNodeIds.includes(node.id);
      const isNodeSelected = selectedNodeId === node.id;
      const isVisible = isFiltered(primaryLabel);

      // Focus Mode Degree Roles
      const isFocalCenter = isFocusActive && node.id === neighborhoodData.focalNodeId;
      const isFirstDegree = isFocusActive && neighborhoodData.firstDegree.has(node.id);
      const isSecondDegree = isFocusActive && neighborhoodData.secondDegree.has(node.id);

      const isSearchMatch = isSearchActive && matchingNodeIds.has(node.id);
      const isSearchDimmed = isSearchActive && !isSearchMatch;

      ctx.save();

      // Outer focus glow ripple
      if (isFocalCenter) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 9, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isFirstDegree) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else if (isSearchMatch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      if (isFocalCenter) {
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#0369a1';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
      } else if (isFirstDegree) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 16;
        ctx.fillStyle = colors.bg;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
      } else if (isSecondDegree) {
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fillStyle = colors.bg;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.2;
      } else if (isSearchMatch) {
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#164e63';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3.5;
      } else if (isNodeHighlighted) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
      } else if (isNodeSelected) {
        ctx.shadowColor = colors.border;
        ctx.shadowBlur = 14;
        ctx.fillStyle = colors.bg;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
      } else if (isSearchDimmed) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = isVisible ? colors.bg : 'rgba(30, 41, 59, 0.2)';
        ctx.strokeStyle = isVisible ? colors.border : 'rgba(71, 85, 105, 0.2)';
        ctx.lineWidth = 1.8;
      }
      ctx.fill();
      ctx.stroke();

      // Node Label Text
      const name =
        node.properties.name ||
        node.properties.title ||
        node.properties.code ||
        node.properties.topic ||
        node.id;

      ctx.font = isFocalCenter || isSearchMatch || isNodeHighlighted
        ? '700 11px Plus Jakarta Sans, sans-serif'
        : '500 10px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = isFocalCenter
        ? '#ffffff'
        : isFirstDegree
        ? '#6ee7b7'
        : isSecondDegree
        ? '#e9d5ff'
        : isSearchMatch
        ? '#a5f3fc'
        : isSearchDimmed
        ? 'rgba(100, 116, 139, 0.3)'
        : isVisible
        ? isNodeHighlighted
          ? '#6ee7b7'
          : colors.text
        : 'rgba(148, 163, 184, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Badge inside node circle: in focus mode, indicate degree!
      let badgeText = primaryLabel.substring(0, 3).toUpperCase();
      if (isFocalCenter) {
        badgeText = '★ 0°';
      } else if (isFirstDegree) {
        badgeText = '1°';
      } else if (isSecondDegree) {
        badgeText = '2°';
      }
      ctx.fillText(badgeText, node.x, node.y);

      // Node label text underneath
      ctx.font = isFocalCenter || isFirstDegree
        ? '700 11px Plus Jakarta Sans, sans-serif'
        : '500 11px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = isFocalCenter
        ? '#38bdf8'
        : isFirstDegree
        ? '#6ee7b7'
        : isSecondDegree
        ? '#d8b4fe'
        : isSearchMatch
        ? '#ffffff'
        : isSearchDimmed
        ? 'rgba(100, 116, 139, 0.35)'
        : isVisible
        ? '#f1f5f9'
        : 'rgba(148, 163, 184, 0.3)';
      const truncatedName = name.length > 22 ? name.substring(0, 20) + '...' : name;
      ctx.fillText(truncatedName, node.x, node.y + node.radius + 14);

      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  };

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;

    // Check if clicked a node
    const clickedNodeIndex = simNodesRef.current.findIndex((n) => {
      // In focus mode, ignore clicks on hidden nodes
      if (neighborhoodData.isActive && !neighborhoodData.allVisible.has(n.id)) {
        return false;
      }
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNodeIndex !== -1) {
      const clicked = simNodesRef.current[clickedNodeIndex];
      setDraggedNodeIndex(clickedNodeIndex);
      if (onSelectNode) {
        onSelectNode(clicked);
      }

      // If Focus Mode is enabled: clicking a node automatically isolates its 1st & 2nd degree neighborhood!
      if (isFocusModeEnabled) {
        setFocusedNodeId(clicked.id);
      }
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeIndex !== null) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
      const node = simNodesRef.current[draggedNodeIndex];
      node.x = mouseX;
      node.y = mouseY;
      node.vx = 0;
      node.vy = 0;
    } else if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeIndex(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.3, Math.min(2.5, prev.scale * zoomFactor)),
    }));
  };

  const handleResetZoom = () => {
    setTransform({ x: 0, y: 0, scale: 0.9 });
  };

  const uniqueLabels = useMemo(() => {
    const set = new Set<string>();
    nodes.forEach((n) => n.labels.forEach((l) => set.add(l)));
    return ['All', ...Array.from(set)];
  }, [nodes]);

  const focusedNodeObject = useMemo(() => {
    if (!focusedNodeId) return null;
    return nodes.find((n) => n.id === focusedNodeId) || null;
  }, [focusedNodeId, nodes]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[560px] bg-[#0c1220] rounded-xl border border-slate-800 overflow-hidden flex flex-col"
    >
      {/* Top Search & Filter Bar */}
      <div className="absolute top-4 left-4 right-20 sm:right-auto z-10 flex flex-wrap items-center gap-2">
        {/* Real-time Global Search Input */}
        <div className="flex items-center bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 min-w-[280px] sm:min-w-[340px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveMatchIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search nodes by label or property (e.g. Elena, Tier-1, CVE)..."
            className="w-full text-xs text-white placeholder-slate-400 bg-transparent focus:outline-none"
          />

          {searchQuery && (
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 whitespace-nowrap">
                {matchingNodeIds.size} match{matchingNodeIds.size === 1 ? '' : 'es'}
              </span>
              {matchingNodeIds.size > 0 && (
                <button
                  onClick={() => {
                    const nextIdx = (activeMatchIndex + 1) % matchedNodesList.length;
                    setActiveMatchIndex(nextIdx);
                    focusNode(matchedNodesList[nextIdx].id, isFocusModeEnabled);
                  }}
                  className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Cycle to next matching node"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Focus Mode Toggle Control */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
          <button
            onClick={() => {
              const nextState = !isFocusModeEnabled;
              setIsFocusModeEnabled(nextState);
              if (!nextState) {
                setFocusedNodeId(null);
              } else if (selectedNodeId) {
                setFocusedNodeId(selectedNodeId);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              isFocusModeEnabled
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="When active, clicking any node hides unrelated nodes and isolates its 1st & 2nd degree neighborhood"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus Mode: {isFocusModeEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Label Filters */}
        {!neighborhoodData.isActive && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
            <div className="flex items-center gap-1 px-1.5 text-xs text-slate-400 font-medium">
              <Filter className="w-3 h-3 text-slate-500" />
            </div>
            {uniqueLabels.map((lbl) => (
              <button
                key={lbl}
                onClick={() => setActiveLabelFilter(lbl)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  activeLabelFilter === lbl
                    ? 'bg-slate-700 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Active Focus Banner when a node is isolated */}
      {neighborhoodData.isActive && focusedNodeObject && (
        <div className="absolute top-16 left-4 z-10 flex flex-wrap items-center gap-2.5 bg-sky-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-sky-500/40 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              Isolating Neighborhood of:{' '}
              <span className="text-sky-300">
                {focusedNodeObject.properties.name || focusedNodeObject.properties.title || focusedNodeObject.id}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 pl-2 border-l border-sky-800/80">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              1°: {neighborhoodData.firstDegree.size}
            </span>
            {focusHops >= 2 && (
              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                2°: {neighborhoodData.secondDegree.size}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Hidden: {neighborhoodData.unrelatedCount}
            </span>
          </div>

          {/* Depth Selector: 1-Hop vs 2-Hops */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setFocusHops(1)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                focusHops === 1 ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1° Only
            </button>
            <button
              onClick={() => setFocusHops(2)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                focusHops === 2 ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1° & 2°
            </button>
          </div>

          <button
            onClick={() => setFocusedNodeId(null)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-sky-300 hover:text-white rounded bg-sky-900/40 hover:bg-sky-800/60 border border-sky-700/60 transition-colors ml-1"
            title="Exit Focus Mode and show full graph"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show All Nodes</span>
          </button>
        </div>
      )}

      {/* Floating Zoom & Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded transition-colors whitespace-nowrap"
          title="Export graph as JSON or Cypher dump file"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

        <button
          onClick={() => setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale * 1.15) }))}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale * 0.85) }))}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title="Reset Viewport"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend pill strip at bottom left */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
        {neighborhoodData.isActive ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>0° Focal Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>1° Immediate Neighbors</span>
            </div>
            {focusHops >= 2 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>2° Extended Neighbors</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Person</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>System</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Policy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Incident</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Decision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Memory</span>
            </div>
          </>
        )}
      </div>

      {/* The Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Export Graph Modal */}
      <ExportGraphModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredNodeIds={
          neighborhoodData.isActive
            ? Array.from(neighborhoodData.allVisible)
            : searchQuery.trim()
            ? Array.from(matchingNodeIds)
            : highlightedNodeIds
        }
        searchQuery={searchQuery}
      />
    </div>
  );
};
