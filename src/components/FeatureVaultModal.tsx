import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  X,
  Layers,
  Cpu,
  Shield,
  Brain,
  Radio,
  Activity,
  HardDrive,
  Database,
  Lock,
  Code2,
  Globe,
  Terminal,
  Sparkles,
  Zap,
  Check,
  Info,
  Sliders,
} from "lucide-react";

export interface FeatureItem {
  id: string;
  number: number;
  title: string;
  category: "AI & Router" | "Privacy & Tor" | "Storage & Web3" | "Dev & Agents" | "Knowledge & Notes" | "Media & Productivity";
  status: "Deployed" | "Ready" | "Connected" | "External";
  description: string;
  docSnippet: string;
  setupAction: string;
  iconName: string;
  tags: string[];
}

export const featureList50: FeatureItem[] = [
  {
    id: "f1",
    number: 1,
    title: "GOD Router Multi-Model Intelligence",
    category: "AI & Router",
    status: "Deployed",
    description: "Sovereign local routing engine with primary Ollama fallback to DeepSeek R1 and Gemini 3.6 Flash.",
    docSnippet: "Routes prompts dynamically based on privacy policy, context length, and required model capability.",
    setupAction: "Test Policy Route",
    iconName: "Cpu",
    tags: ["ollama", "gemini", "routing", "local-llm"],
  },
  {
    id: "f2",
    number: 2,
    title: "Qdrant Vector GOD Memory Engine",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "High-density vector embeddings index for persistent zero-knowledge session & project memory.",
    docSnippet: "Ingests developer notes, codebase ASTs, and chat logs with 1536-dim semantic similarity search.",
    setupAction: "Inspect Collections",
    iconName: "Brain",
    tags: ["vector-db", "qdrant", "memory", "embeddings"],
  },
  {
    id: "f3",
    number: 3,
    title: "Tor Onion Multi-Hop Circuit Tunnel",
    category: "Privacy & Tor",
    status: "Connected",
    description: "Anonymous multi-hop onion routing layer masking external API requests and telemetry.",
    docSnippet: "Rotates exit nodes every 10 minutes; automatically wraps external web search requests.",
    setupAction: "Rotate Tor Circuit",
    iconName: "Lock",
    tags: ["tor", "onion", "privacy", "anonymity"],
  },
  {
    id: "f4",
    number: 4,
    title: "Private WireGuard Sovereign VPN",
    category: "Privacy & Tor",
    status: "Connected",
    description: "Encrypted peer-to-peer WireGuard mesh connecting homelab edge nodes and mobile devices.",
    docSnippet: "Enables zero-trust remote access to local Ollama and Qdrant endpoints over 10.8.0.0/24.",
    setupAction: "View Peers",
    iconName: "Shield",
    tags: ["vpn", "wireguard", "mesh", "security"],
  },
  {
    id: "f5",
    number: 5,
    title: "MinIO Local Object Storage Vault",
    category: "Storage & Web3",
    status: "Deployed",
    description: "S3-compatible local bucket for encrypted documents, workspace snapshots, and audio clips.",
    docSnippet: "AES-256-GCM client-side encrypted storage running directly on local hardware on port 9000.",
    setupAction: "Browse Buckets",
    iconName: "HardDrive",
    tags: ["minio", "s3", "storage", "encryption"],
  },
  {
    id: "f6",
    number: 6,
    title: "Self-Hosted Gitea Code Server",
    category: "Dev & Agents",
    status: "Ready",
    description: "Private Git repository hosting with automated sub-agent webhooks and code review triggers.",
    docSnippet: "Full local version control suite running offline without GitHub dependencies.",
    setupAction: "Launch Gitea",
    iconName: "Code2",
    tags: ["git", "gitea", "dev", "version-control"],
  },
  {
    id: "f7",
    number: 7,
    title: "Embedded VS Code / Web IDE",
    category: "Dev & Agents",
    status: "Ready",
    description: "Web-based VS Code environment with live OM AI extensions and terminal execution.",
    docSnippet: "Runs code server in isolated sandbox with direct access to local project files.",
    setupAction: "Open Web IDE",
    iconName: "Terminal",
    tags: ["ide", "vscode", "editor", "code"],
  },
  {
    id: "f8",
    number: 8,
    title: "Local NotebookLM RAG Engine",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Document ingestion workspace generating audio summaries and citation-backed answer graphs.",
    docSnippet: "Parse PDFs, Markdown, and web clippings with instant RAG retrieval.",
    setupAction: "Ingest Docs",
    iconName: "BookOpen",
    tags: ["rag", "notebooklm", "docs", "citations"],
  },
  {
    id: "f9",
    number: 9,
    title: "Web3 Anvil RPC & Smart Contract Bridge",
    category: "Storage & Web3",
    status: "Connected",
    description: "Local Ethereum blockchain testnet node for smart contract execution and wallet verification.",
    docSnippet: "Simulates zero-gas local transactions and Web3 signature verification on chain ID 31337.",
    setupAction: "Check Anvil RPC",
    iconName: "Database",
    tags: ["web3", "ethereum", "anvil", "blockchain"],
  },
  {
    id: "f10",
    number: 10,
    title: "IPFS Decentralized File Pinning Node",
    category: "Storage & Web3",
    status: "Connected",
    description: "Peer-to-peer content addressing engine for immutable memory archiving and dataset distribution.",
    docSnippet: "Pins encrypted memory snapshots to local Kubo IPFS daemon on port 5001.",
    setupAction: "View Pinned CIDs",
    iconName: "Globe",
    tags: ["ipfs", "p2p", "decentralized", "storage"],
  },
  {
    id: "f11",
    number: 11,
    title: "Zero-Knowledge Encryption Vault",
    category: "Privacy & Tor",
    status: "Deployed",
    description: "Client-side master key derivation (PBKDF2 + AES-256) sealing private notes & passwords.",
    docSnippet: "Secrets never touch disk unencrypted; unlocked strictly in browser memory.",
    setupAction: "Lock Vault",
    iconName: "Lock",
    tags: ["crypto", "encryption", "zero-knowledge", "privacy"],
  },
  {
    id: "f12",
    number: 12,
    title: "Air-Gapped Network Lock Switch",
    category: "Privacy & Tor",
    status: "Deployed",
    description: "Hardware-level software toggle severing all outbound WAN calls for strict local operations.",
    docSnippet: "Forces 100% offline inference through local Ollama and local vector DB.",
    setupAction: "Toggle Lock",
    iconName: "Shield",
    tags: ["airgap", "offline", "security", "network-lock"],
  },
  {
    id: "f13",
    number: 13,
    title: "Sub-Agent Auto-Kanban Engine",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Autonomous sub-agents advancing backlog tasks through testing, refactoring, and completion.",
    docSnippet: "Evaluates dependency trees and auto-promotes tasks based on rule-matching heuristics.",
    setupAction: "Trigger Sub-Agent",
    iconName: "Zap",
    tags: ["kanban", "agents", "automation", "tasks"],
  },
  {
    id: "f14",
    number: 14,
    title: "Real-Time Sub-Agent Decision Feed",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Live audit feed explaining why sub-agents advanced tasks, created code, or flagged risks.",
    docSnippet: "Logs exact rule IDs, confidence metrics, and code AST analysis steps.",
    setupAction: "View Decision Feed",
    iconName: "Activity",
    tags: ["audit", "decisions", "logs", "transparency"],
  },
  {
    id: "f15",
    number: 15,
    title: "Sovereign Ambient Audio & Radio Station",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Embedded audio player with radio mode (ambient focus, synthwave, local MP3/FLAC streams).",
    docSnippet: "Features playlist queueing, visualizer waveforms, and binaural focus audio.",
    setupAction: "Launch Audio Player",
    iconName: "Radio",
    tags: ["audio", "radio", "music", "focus"],
  },
  {
    id: "f16",
    number: 16,
    title: "Sovereign Health Monitor & VRAM Allocation",
    category: "AI & Router",
    status: "Deployed",
    description: "Real-time hardware dashboard tracking GPU VRAM, system RAM, Qdrant vectors, and Web3 status.",
    docSnippet: "Monitors context window KV cache and edge server workload pressure.",
    setupAction: "Open Health Panel",
    iconName: "Activity",
    tags: ["vram", "hardware", "monitoring", "health"],
  },
  {
    id: "f17",
    number: 17,
    title: "PermissionEngine Risk Level Gating",
    category: "Privacy & Tor",
    status: "Deployed",
    description: "Five-tier security policy (READ, DRAFT, ASK, ACT, NEVER) controlling agent actions.",
    docSnippet: "Requires explicit owner signature approval for high-risk terminal/file modifications.",
    setupAction: "Configure Policies",
    iconName: "Shield",
    tags: ["permissions", "security", "approval-gates"],
  },
  {
    id: "f18",
    number: 18,
    title: "Local Ollama LLM Engine Runtime",
    category: "AI & Router",
    status: "Connected",
    description: "Native Ollama integration serving quantized open-weights models (Qwen, DeepSeek, Llama).",
    docSnippet: "Direct REST bridge to http://127.0.0.1:11434 with zero external telemetry.",
    setupAction: "Check Ollama Status",
    iconName: "Cpu",
    tags: ["ollama", "local-llm", "inference"],
  },
  {
    id: "f19",
    number: 19,
    title: "DeepSeek R1 & Qwen 2.5 Coder Models",
    category: "AI & Router",
    status: "Deployed",
    description: "Fine-tuned local reasoning and coding models providing sub-second code generation.",
    docSnippet: "Configured as primary coding agent inside GOD Router policy suite.",
    setupAction: "Test Coding Model",
    iconName: "Code2",
    tags: ["deepseek", "qwen", "coding", "models"],
  },
  {
    id: "f20",
    number: 20,
    title: "ContextEngine Universe Snapshot Engine",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Zero-knowledge workspace context serialization capturing active tabs, notes, and tasks.",
    docSnippet: "Allows 1-click restoration of exact developer context across reboot sessions.",
    setupAction: "Restore Context",
    iconName: "Layers",
    tags: ["context", "snapshot", "state-restoration"],
  },
  {
    id: "f21",
    number: 21,
    title: "Multi-Space Isolated Workspaces",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Architectural separation of spaces (Dev, Personal, Research, Security) with distinct policies.",
    docSnippet: "Prevents memory leakage between sensitive security research and daily task notes.",
    setupAction: "Manage Spaces",
    iconName: "Layers",
    tags: ["spaces", "isolation", "workspaces"],
  },
  {
    id: "f22",
    number: 22,
    title: "Multi-Tab Privacy Browser Sandbox",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Isolated Web browser workspace with instant AI page summarizer and Ask-Page chat.",
    docSnippet: "Includes reader mode, sleep tab memory saver, and context injection.",
    setupAction: "Open Browser",
    iconName: "Globe",
    tags: ["browser", "tabs", "reader-mode"],
  },
  {
    id: "f23",
    number: 23,
    title: "Universal Semantic & Web Search",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Hybrid search engine querying local Qdrant vectors and optionally web grounding.",
    docSnippet: "Press Cmd+K / Ctrl+K to trigger search across all notes, files, tabs, and memories.",
    setupAction: "Launch Search",
    iconName: "Search",
    tags: ["search", "rag", "universal-search"],
  },
  {
    id: "f24",
    number: 24,
    title: "Interactive AI Personal Tutor",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Socratic learning workspace generating custom quizzes, flashcards, and concept maps.",
    docSnippet: "Helps master complex systems, algorithms, and cryptography principles.",
    setupAction: "Start Tutor Session",
    iconName: "Sparkles",
    tags: ["tutor", "learning", "education"],
  },
  {
    id: "f25",
    number: 25,
    title: "Habit Tracking & Streak Matrix",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Daily habit tracker with streak analytics, streak records, and linked task milestones.",
    docSnippet: "Builds discipline through visual streak grids and automatic daily check-ins.",
    setupAction: "View Habits",
    iconName: "CheckCircle2",
    tags: ["habits", "productivity", "streaks"],
  },
  {
    id: "f26",
    number: 26,
    title: "Daily Goal Impact Matrix",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Categorized priority goals (High Impact, Mission Milestones, Personal Growth).",
    docSnippet: "Focuses daily energy on high-value leverage tasks over low-priority noise.",
    setupAction: "View Goals",
    iconName: "Zap",
    tags: ["goals", "matrix", "priorities"],
  },
  {
    id: "f27",
    number: 27,
    title: "Executive Daily Briefing Generator",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Morning AI briefing summarization detailing priorities, security status, and calendar events.",
    docSnippet: "Generates tailored greeting and recommended focus areas upon system login.",
    setupAction: "Generate Briefing",
    iconName: "BookOpen",
    tags: ["briefing", "summary", "morning"],
  },
  {
    id: "f28",
    number: 28,
    title: "Audit Trail & Real-time Event Bus",
    category: "Privacy & Tor",
    status: "Deployed",
    description: "PubSub event bus logging every sub-agent action, tool call, and owner permission decision.",
    docSnippet: "Immutable audit trail with timestamp, actor ID, and risk level tagging.",
    setupAction: "Inspect Audit Log",
    iconName: "Activity",
    tags: ["audit", "eventbus", "security-log"],
  },
  {
    id: "f29",
    number: 29,
    title: "Docker Runtime Container Management",
    category: "Dev & Agents",
    status: "Connected",
    description: "Live dashboard tracking running Docker containers, CPU/Memory metrics, and ports.",
    docSnippet: "Restart or inspect containers like Ollama, Qdrant, MinIO, and Gitea.",
    setupAction: "Inspect Containers",
    iconName: "HardDrive",
    tags: ["docker", "containers", "runtime"],
  },
  {
    id: "f30",
    number: 30,
    title: "Local Speech & Audio Transcription",
    category: "Media & Productivity",
    status: "Ready",
    description: "Offline Whisper voice transcription converting vocal notes into structured memories.",
    docSnippet: "Supports 'OM' wake-word detection and local voice command processing.",
    setupAction: "Test Microphone",
    iconName: "Radio",
    tags: ["whisper", "voice", "audio-transcribe"],
  },
  {
    id: "f31",
    number: 31,
    title: "Local SDXL Image Generation Node",
    category: "Media & Productivity",
    status: "Ready",
    description: "Offline Stable Diffusion node for private visual asset and diagram generation.",
    docSnippet: "Generates UI wireframes, icons, and artwork without cloud API keys.",
    setupAction: "Generate Asset",
    iconName: "Sparkles",
    tags: ["sdxl", "image-gen", "diffusion"],
  },
  {
    id: "f32",
    number: 32,
    title: "Automated Dependency Gate",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Prevents unauthorized package installations without explicit owner signature.",
    docSnippet: "Inspects package.json changes before executing npm/yarn/pnpm install.",
    setupAction: "Check Gate Rules",
    iconName: "Shield",
    tags: ["dependencies", "npm", "security"],
  },
  {
    id: "f33",
    number: 33,
    title: "Shell Execution Terminal & Diagnostics",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Sandboxed terminal emulator for running local diagnostics, scripts, and build tasks.",
    docSnippet: "Captures stdout/stderr with real-time error parsing and AI auto-fixes.",
    setupAction: "Open Terminal",
    iconName: "Terminal",
    tags: ["terminal", "bash", "diagnostics"],
  },
  {
    id: "f34",
    number: 34,
    title: "Log Error Auto-Diagnostic Parser",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Analyzes build logs, stack traces, and compiler errors to suggest immediate code fixes.",
    docSnippet: "Identifies missing dependencies, syntax typos, and broken import paths automatically.",
    setupAction: "Diagnose Log",
    iconName: "Code2",
    tags: ["diagnostics", "logs", "error-fixing"],
  },
  {
    id: "f35",
    number: 35,
    title: "Local S3 Sync & Encrypted Backups",
    category: "Storage & Web3",
    status: "Connected",
    description: "Automatic background backup sync encrypting memory vaults to remote or local S3.",
    docSnippet: "Uses AES-256 client-side keys before transmitting payload over WireGuard.",
    setupAction: "Trigger Backup",
    iconName: "HardDrive",
    tags: ["s3", "backup", "encryption"],
  },
  {
    id: "f36",
    number: 36,
    title: "Homelab Edge Hardware Node Cluster",
    category: "AI & Router",
    status: "Connected",
    description: "Distributed compute cluster offloading heavy reasoning workloads across local machines.",
    docSnippet: "Connects M2 MacBook, Linux GPU server, and NAS edge node into unified pool.",
    setupAction: "View Cluster Status",
    iconName: "Cpu",
    tags: ["homelab", "cluster", "edge"],
  },
  {
    id: "f37",
    number: 37,
    title: "Web3 Wallet Bridge & Signature Auth",
    category: "Storage & Web3",
    status: "Connected",
    description: "EIP-712 cryptographic signature authentication for owner identity verification.",
    docSnippet: "Replaces traditional passwords with hardware wallet sign-in capabilities.",
    setupAction: "Verify Wallet",
    iconName: "Database",
    tags: ["wallet", "metamask", "eip712"],
  },
  {
    id: "f38",
    number: 38,
    title: "Encrypted Note Scratchpad & Tagging",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Markdown note editor with automated entity tag extraction and space categorization.",
    docSnippet: "Instant search and inline code highlight rendering.",
    setupAction: "New Note",
    iconName: "BookOpen",
    tags: ["notes", "markdown", "editor"],
  },
  {
    id: "f39",
    number: 39,
    title: "Quick-Capture Global Scratchpad Modal",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Press Shift+Space or floating FAB to instantly capture thoughts, tasks, or memories.",
    docSnippet: "Auto-routes captured items to active space context without interrupting workflow.",
    setupAction: "Open Quick Capture",
    iconName: "Sparkles",
    tags: ["quick-capture", "modal", "scratchpad"],
  },
  {
    id: "f40",
    number: 40,
    title: "Sacred Geometry Cosmic Themes",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Three themes: Cosmic Gold, Neon Astral, and Calm Light with custom background artwork.",
    docSnippet: "Matches sacred geometry wallpapers and ambient color palette tokens.",
    setupAction: "Switch Theme",
    iconName: "Sparkles",
    tags: ["themes", "design", "ui"],
  },
  {
    id: "f41",
    number: 41,
    title: "WCAG AA Compliant CSS System",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Standardized tokenized variables mapping contrast ratio > 4.5:1 across all themes.",
    docSnippet: "Ensures dark mode and light mode readability for prolonged developer sessions.",
    setupAction: "Inspect Tokens",
    iconName: "Sliders",
    tags: ["wcag", "accessibility", "css"],
  },
  {
    id: "f42",
    number: 42,
    title: "Framer Motion Living ॐ Symbol Core",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Dynamic living symbol reacting with aura glow, particle orbits, and geometry rings.",
    docSnippet: "Reflects system status (resting, waking, ready, thinking) with reduced-motion support.",
    setupAction: "Trigger Living Symbol",
    iconName: "Sparkles",
    tags: ["om-symbol", "animation", "motion"],
  },
  {
    id: "f43",
    number: 43,
    title: "Sub-Agent Autonomous Rule Suite",
    category: "Dev & Agents",
    status: "Deployed",
    description: "Declarative rule engine for sub-agent behavior (e.g. Rule #101: Auto-refactor on test fail).",
    docSnippet: "Configurable threshold settings and confidence score gating.",
    setupAction: "View Agent Rules",
    iconName: "Zap",
    tags: ["rules", "agents", "policy"],
  },
  {
    id: "f44",
    number: 44,
    title: "Local Calendar & Meeting Quick-View",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Calendar widget displaying upcoming meetings, join links, and space association.",
    docSnippet: "Includes 1-click meeting join and AI agenda pre-briefing generation.",
    setupAction: "View Calendar",
    iconName: "BookOpen",
    tags: ["calendar", "meetings", "events"],
  },
  {
    id: "f45",
    number: 45,
    title: "Memory Confidence & Disambiguation",
    category: "Knowledge & Notes",
    status: "Deployed",
    description: "Scores extracted memories with confidence metrics and resolves entity conflicts.",
    docSnippet: "Allows owner to edit, correct, or delete AI-extracted memories.",
    setupAction: "Review Memory Vault",
    iconName: "Brain",
    tags: ["memory", "confidence", "entities"],
  },
  {
    id: "f46",
    number: 46,
    title: "Reader Mode & Page Summarizer",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Distraction-free article reader stripping ads and extracting key keypoints.",
    docSnippet: "Generates bullet point takeaways directly into space notes.",
    setupAction: "Open Reader Mode",
    iconName: "Globe",
    tags: ["reader-mode", "summary", "web"],
  },
  {
    id: "f47",
    number: 47,
    title: "Hardware VRAM & KV Cache Inspector",
    category: "AI & Router",
    status: "Deployed",
    description: "Monitors memory allocation across active local models and context windows.",
    docSnippet: "Warns when model context approaches GPU memory boundaries.",
    setupAction: "Check VRAM Usage",
    iconName: "Activity",
    tags: ["vram", "gpu", "kv-cache"],
  },
  {
    id: "f48",
    number: 48,
    title: "Edge Node Workload Auto-Balancer",
    category: "AI & Router",
    status: "Connected",
    description: "Routes heavy batch jobs to idle homelab nodes based on network latency and thermal state.",
    docSnippet: "Prevents dev laptop overheating during long code generation or indexing.",
    setupAction: "Balance Workload",
    iconName: "Cpu",
    tags: ["load-balancer", "edge", "cluster"],
  },
  {
    id: "f49",
    number: 49,
    title: "Zero-Knowledge Shredder & File Export",
    category: "Privacy & Tor",
    status: "Deployed",
    description: "Cryptographically wipes deleted files and exports workspace data as encrypted ZIP.",
    docSnippet: "Overwrites file memory blocks before unlinking from local storage.",
    setupAction: "Export Workspace",
    iconName: "Lock",
    tags: ["shredder", "export", "zero-knowledge"],
  },
  {
    id: "f50",
    number: 50,
    title: "Universal Command Palette & Shortcuts",
    category: "Media & Productivity",
    status: "Deployed",
    description: "Cmd+K keyboard command menu for fast view switching, prompt dispatch, and tools.",
    docSnippet: "Accessible globally across all workspaces and modal dialogs.",
    setupAction: "Open Command Palette",
    iconName: "Terminal",
    tags: ["keyboard", "command-palette", "shortcuts"],
  },
];

interface FeatureVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
}

export const FeatureVaultModal: React.FC<FeatureVaultModalProps> = ({
  isOpen,
  onClose,
  onNavigateView,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeFeature, setActiveFeature] = useState<FeatureItem | null>(null);

  if (!isOpen) return null;

  const categories = [
    "All",
    "AI & Router",
    "Privacy & Tor",
    "Storage & Web3",
    "Dev & Agents",
    "Knowledge & Notes",
    "Media & Productivity",
  ];

  const statuses = ["All", "Deployed", "Ready", "Connected", "External"];

  const filteredFeatures = featureList50.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: FeatureItem["status"]) => {
    switch (status) {
      case "Deployed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Connected":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30";
      case "Ready":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const getCategoryIcon = (cat: FeatureItem["category"]) => {
    switch (cat) {
      case "AI & Router":
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case "Privacy & Tor":
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case "Storage & Web3":
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case "Dev & Agents":
        return <Code2 className="w-3.5 h-3.5 text-sky-400" />;
      case "Knowledge & Notes":
        return <Brain className="w-3.5 h-3.5 text-amber-300" />;
      default:
        return <Radio className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 gold-glow">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-xl text-amber-400 font-bold gold-glow">
              🕉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-100">
                  OM 50-Feature Sovereign Vault
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold uppercase">
                  50 Capabilities
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore every privacy feature, local model router, sub-agent engine, and Web3 connection.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50 features or tags..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Grid Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((f) => (
            <div
              key={f.id}
              onClick={() => setActiveFeature(f)}
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    #{f.number.toString().padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      {getCategoryIcon(f.category)}
                      <span>{f.category}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(
                        f.status
                      )}`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition">
                  {f.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                <div className="flex flex-wrap gap-1">
                  {f.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[9px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <span className="text-amber-400 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}

          {filteredFeatures.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 font-mono text-xs">
              No features match your query "{searchQuery}" under category "{selectedCategory}".
            </div>
          )}
        </div>

        {/* Feature Detail Drawer / Modal Overlay */}
        {activeFeature && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 p-6 flex items-center justify-center">
            <div className="max-w-xl w-full p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-2xl gold-glow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Feature #{activeFeature.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(
                      activeFeature.status
                    )}`}
                  >
                    {activeFeature.status}
                  </span>
                </div>
                <button
                  onClick={() => setActiveFeature(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{activeFeature.title}</h3>
                <p className="text-xs font-mono text-amber-400/80 mt-0.5">{activeFeature.category}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Overview</div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeFeature.description}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Documentation & Architecture Note</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{activeFeature.docSnippet}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1">
                  {activeFeature.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveFeature(null);
                    onClose();
                    if (onNavigateView) {
                      if (activeFeature.category === "AI & Router") onNavigateView("control");
                      else if (activeFeature.category === "Dev & Agents") onNavigateView("tasks");
                      else if (activeFeature.category === "Knowledge & Notes") onNavigateView("memory");
                      else onNavigateView("command");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow"
                >
                  <span>{activeFeature.setupAction}</span>
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-xs font-mono text-slate-400 flex items-center justify-between shrink-0">
          <span>Showing {filteredFeatures.length} of 50 sovereign features</span>
          <span className="text-emerald-400">100% Zero-Cloud Telemetry Active</span>
        </div>
      </div>
    </div>
  );
};
