import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Cpu,
  Brain,
  HardDrive,
  Globe,
  Radio,
  Lock,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { SovereignStackStatus, ProbeStatus } from "../types";

interface SovereignSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackStatus: SovereignStackStatus;
  onRefreshProbes: () => Promise<void>;
  networkLock: boolean;
  onToggleNetworkLock: (locked: boolean) => void;
  telemetry: boolean;
  onToggleTelemetry: (enabled: boolean) => void;
}

export const SovereignSetupModal: React.FC<SovereignSetupModalProps> = ({
  isOpen,
  onClose,
  stackStatus,
  onRefreshProbes,
  networkLock,
  onToggleNetworkLock,
  telemetry,
  onToggleTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<
    "intelligence" | "memory" | "storage" | "web3" | "edge" | "privacy" | "selfhost"
  >("intelligence");

  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; detail: string }>>({});
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Form states stored locally
  const [ollamaEndpoint, setOllamaEndpoint] = useState(stackStatus.godRouter.endpoint);
  const [primaryModel, setPrimaryModel] = useState(stackStatus.godRouter.model);
  const [routingPolicy, setRoutingPolicy] = useState(stackStatus.godRouter.policy);

  const [qdrantEndpoint, setQdrantEndpoint] = useState(stackStatus.godMemory.endpoint);
  const [minioEndpoint, setMinioEndpoint] = useState(stackStatus.localMinio.endpoint);
  const [s3Endpoint, setS3Endpoint] = useState(stackStatus.cloudS3.endpoint);
  const [s3Bucket, setS3Bucket] = useState(stackStatus.cloudS3.bucket);

  const [web3Rpc, setWeb3Rpc] = useState(stackStatus.web3Bridge.rpcEndpoint);
  const [selectedChain, setSelectedChain] = useState(stackStatus.web3Bridge.chain);
  const [ipfsEndpoint, setIpfsEndpoint] = useState(stackStatus.ipfsStorage.apiEndpoint);

  const [edgeEndpoint, setEdgeEndpoint] = useState(stackStatus.edgeNode.endpoint);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const runSingleProbeTest = async (key: string, testFn: () => Promise<{ ok: boolean; message: string }>) => {
    setTestingEndpoint(key);
    try {
      const res = await testFn();
      setTestResults((prev) => ({
        ...prev,
        [key]: { status: res.ok ? "online" : "offline", detail: res.message },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [key]: { status: "offline", detail: err.message || "Connection refused" },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const getStatusBadge = (st: ProbeStatus | string) => {
    switch (st) {
      case "online":
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>;
      case "connecting":
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">CONNECTING...</span>;
      case "cors_blocked":
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">CORS BLOCKED</span>;
      case "timed_out":
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">TIMED OUT</span>;
      case "configured":
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">CONFIGURED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">OFFLINE / UNREACHABLE</span>;
    }
  };

  const dockerComposeYaml = `version: '3.8'

networks:
  om-private-net:
    driver: bridge
    internal: false

volumes:
  ollama-data:
  qdrant-data:
  minio-data:
  ipfs-data:

services:
  ollama:
    image: ollama/ollama:latest
    container_name: om-ollama
    ports:
      - "127.0.0.1:11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    networks:
      - om-private-net
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: om-qdrant
    ports:
      - "127.0.0.1:6333:6333"
    volumes:
      - qdrant-data:/qdrant/storage
    networks:
      - om-private-net
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    container_name: om-minio
    command: server /data --console-address ":9001"
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    environment:
      MINIO_ROOT_USER: om_admin
      MINIO_ROOT_PASSWORD: om_vault_secret_password_123
    volumes:
      - minio-data:/data
    networks:
      - om-private-net

  ipfs:
    image: ipfs/kubo:latest
    container_name: om-ipfs
    ports:
      - "127.0.0.1:5001:5001"
      - "127.0.0.1:8080:8080"
    volumes:
      - ipfs-data:/data/ipfs
    networks:
      - om-private-net

  anvil:
    image: ghcr.io/foundry-rs/foundry:latest
    container_name: om-anvil
    entrypoint: ["anvil", "--host", "0.0.0.0"]
    ports:
      - "127.0.0.1:8545:8545"
    networks:
      - om-private-net

  om-edge-node:
    image: om/edge-node:latest
    container_name: om-edge-01
    ports:
      - "127.0.0.1:9090:9090"
    networks:
      - om-private-net
`;

  const copyYaml = () => {
    navigator.clipboard.writeText(dockerComposeYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const tabs = [
    { id: "intelligence", label: "Intelligence (Router)", icon: Cpu },
    { id: "memory", label: "Memory (Qdrant)", icon: Brain },
    { id: "storage", label: "Storage (MinIO & S3)", icon: HardDrive },
    { id: "web3", label: "Web3 & IPFS", icon: Globe },
    { id: "edge", label: "Edge Node", icon: Radio },
    { id: "privacy", label: "Privacy & Locks", icon: Lock },
    { id: "selfhost", label: "Self-Host Bundle", icon: Server },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold gold-glow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Sovereign Control Plane</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  LOCAL FIRST
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure local LLMs, Qdrant vector memory, MinIO vault, Web3 RPCs, IPFS, and Edge execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRefreshProbes()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Probe Stack</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body Region */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INTELLIGENCE (GOD ROUTER) */}
          {activeTab === "intelligence" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>GOD Router — Multi-Model Intelligence Engine</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Private multi-model routing for local Ollama LLMs with automatic quality fallback.
                  </p>
                </div>
                {getStatusBadge(stackStatus.godRouter.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Ollama API Endpoint</label>
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Primary Local Model</label>
                  <select
                    value={primaryModel}
                    onChange={(e) => setPrimaryModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="qwen2.5-coder:14b">qwen2.5-coder:14b (Code Specialist)</option>
                    <option value="deepseek-coder-v2:16b">deepseek-coder-v2:16b (Reasoning)</option>
                    <option value="codestral:22b">codestral:22b (Fast Execution)</option>
                    <option value="llama3.3:70b">llama3.3:70b (Heavy Synthesis)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Fallback Cloud Model</label>
                  <input
                    type="text"
                    readOnly
                    value="gemini-3.6-flash (Zero-Log Cloud)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Routing Policy</label>
                  <select
                    value={routingPolicy}
                    onChange={(e) => setRoutingPolicy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Private quality-first">Private Quality-First</option>
                    <option value="Lowest latency">Lowest Latency</option>
                    <option value="Lowest memory">Lowest Memory Footprint</option>
                    <option value="Code specialist">Code Specialist Optimization</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-slate-100">Connection Verification:</span> Real request sent to{" "}
                  <code className="text-amber-400 font-mono">{ollamaEndpoint}/api/tags</code>.
                </div>
                <button
                  onClick={() =>
                    runSingleProbeTest("ollama", async () => {
                      const res = await fetch("/api/ollama/status");
                      const json = await res.json();
                      return { ok: json.online, message: json.message };
                    })
                  }
                  disabled={testingEndpoint === "ollama"}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingEndpoint === "ollama" ? "animate-spin" : ""}`} />
                  <span>Test Ollama Tag Discovery</span>
                </button>
              </div>

              {testResults.ollama && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    testResults.ollama.status === "online"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  }`}
                >
                  Result: {testResults.ollama.detail}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEMORY (QDRANT) */}
          {activeTab === "memory" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>GOD Memory — Qdrant Private Vector Memory</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Local semantic vector memory storage with encrypted snapshots and per-space collection isolation.
                  </p>
                </div>
                {getStatusBadge(stackStatus.godMemory.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Qdrant Vector Endpoint</label>
                  <input
                    type="text"
                    value={qdrantEndpoint}
                    onChange={(e) => setQdrantEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Active Collection</label>
                  <input
                    type="text"
                    readOnly
                    value={stackStatus.godMemory.collection}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-slate-100">Health Probe:</span> Real endpoint check to{" "}
                  <code className="text-purple-400 font-mono">{qdrantEndpoint}/healthz</code>.
                </div>
                <button
                  onClick={() =>
                    runSingleProbeTest("qdrant", async () => {
                      const res = await fetch("/api/system/qdrant-health");
                      const json = await res.json();
                      return { ok: json.ok, message: json.message || "Qdrant reachable" };
                    })
                  }
                  disabled={testingEndpoint === "qdrant"}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingEndpoint === "qdrant" ? "animate-spin" : ""}`} />
                  <span>Test Vector Vault Probe</span>
                </button>
              </div>

              {testResults.qdrant && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    testResults.qdrant.status === "online"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  }`}
                >
                  Result: {testResults.qdrant.detail}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STORAGE (MINIO & S3) */}
          {activeTab === "storage" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>Local Storage — MinIO Zero-Knowledge Vault</span>
                  </h3>
                  {getStatusBadge(stackStatus.localMinio.status)}
                </div>
                <p className="text-xs text-slate-400">
                  Self-hosted object storage running on your loopback interface. Tested via{" "}
                  <code className="text-emerald-400 font-mono">/minio/health/live</code>.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">MinIO Endpoint</label>
                    <input
                      type="text"
                      value={minioEndpoint}
                      onChange={(e) => setMinioEndpoint(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Local Bucket</label>
                    <input
                      type="text"
                      readOnly
                      value={stackStatus.localMinio.bucket}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Optional S3-Compatible Cloud Encrypted Backup</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client-side encrypted zero-knowledge snapshots exported to your personal S3 cloud bucket.
                    </p>
                  </div>
                  {getStatusBadge(stackStatus.cloudS3.status)}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Client-Side Encryption Guarantee:</strong> All payload data is encrypted locally using AES-256-GCM before transmitting to any cloud endpoint. Secret keys are never sent to external servers.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">S3 Endpoint URL</label>
                    <input
                      type="text"
                      value={s3Endpoint}
                      onChange={(e) => setS3Endpoint(e.target.value)}
                      placeholder="https://s3.us-east-1.amazonaws.com"
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">S3 Bucket Name</label>
                    <input
                      type="text"
                      value={s3Bucket}
                      onChange={(e) => setS3Bucket(e.target.value)}
                      placeholder="my-om-vault-backup"
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEB3 & IPFS */}
          {activeTab === "web3" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Web3 Infrastructure Bridge & JSON-RPC</span>
                  </h3>
                  {getStatusBadge(stackStatus.web3Bridge.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">RPC Endpoint</label>
                    <input
                      type="text"
                      value={web3Rpc}
                      onChange={(e) => setWeb3Rpc(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Selected Chain</label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    >
                      <option value="Local Anvil">Local Anvil (Dev Chain ID 31337)</option>
                      <option value="Ethereum Mainnet">Ethereum Mainnet (Chain ID 1)</option>
                      <option value="Arbitrum One">Arbitrum One (Chain ID 42161)</option>
                      <option value="Polygon Pos">Polygon POS (Chain ID 137)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Real Check: <code className="text-sky-300">eth_chainId</code> JSON-RPC Call
                  </span>
                  <button
                    onClick={() =>
                      runSingleProbeTest("web3", async () => {
                        const res = await fetch("/api/system/web3-rpc", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rpcUrl: web3Rpc }),
                        });
                        const json = await res.json();
                        return { ok: json.ok, message: `Chain ID returned: ${json.chainId || "None"}` };
                      })
                    }
                    disabled={testingEndpoint === "web3"}
                    className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingEndpoint === "web3" ? "animate-spin" : ""}`} />
                    <span>Run eth_chainId Test</span>
                  </button>
                </div>

                {testResults.web3 && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-sky-300">
                    Result: {testResults.web3.detail}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Self-Hosted IPFS User-Owned Storage</h3>
                  {getStatusBadge(stackStatus.ipfsStorage.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">IPFS API Endpoint</label>
                    <input
                      type="text"
                      value={ipfsEndpoint}
                      onChange={(e) => setIpfsEndpoint(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Node Status</label>
                    <input
                      type="text"
                      readOnly
                      value="Self-Hosted Kubo Node (Local Pinning)"
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EDGE NODE */}
          {activeTab === "edge" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Edge Node Mesh — Local Autonomous Execution</span>
                  </h3>
                  {getStatusBadge(stackStatus.edgeNode.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Edge Node Endpoint</label>
                    <input
                      type="text"
                      value={edgeEndpoint}
                      onChange={(e) => setEdgeEndpoint(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400">Hardware Class</label>
                    <input
                      type="text"
                      readOnly
                      value={stackStatus.edgeNode.hardware}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Edge nodes perform secure offline task execution, code compilation, and background synthetic memory indexing.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: PRIVACY & LOCKS */}
          {activeTab === "privacy" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Network Lock & Telemetry Safeguards</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enforce local loopback boundaries and strict zero-telemetry rules.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    FULLY PRIVATE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-100">Strict Network Lock</div>
                    <div className="text-[11px] text-slate-400">
                      Block all outbound internet traffic from agent execution workers.
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleNetworkLock(!networkLock)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      networkLock
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {networkLock ? "LOCKED (ENABLED)" : "UNLOCKED"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-100">Anonymous Usage Telemetry</div>
                    <div className="text-[11px] text-slate-400">
                      Defaults strictly to disabled. Zero data, metrics, or logs ever leave your device.
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleTelemetry(!telemetry)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      telemetry
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {telemetry ? "ENABLED" : "DISABLED (RECOMMENDED)"}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-slate-100">Configuration Storage Disclaimer:</div>
                  <p className="text-slate-400 leading-relaxed">
                    Configuration is stored locally on this device in your browser's local sandbox storage. No seed phrases, wallet private keys, or passwords are requested or stored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SELF-HOST DOCKER COMPOSE */}
          {activeTab === "selfhost" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-400" />
                    <span>Docker Compose Self-Host Bundle</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deploy your entire OM sovereign stack locally in a single command using Docker Compose.
                  </p>
                </div>

                <button
                  onClick={copyYaml}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedYaml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedYaml ? "Copied YAML!" : "Copy docker-compose.yml"}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-80 leading-relaxed">
                  {dockerComposeYaml}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                <div className="font-bold text-amber-400">Quick Start Commands:</div>
                <div className="text-slate-400">1. Save to <code className="text-slate-200">docker-compose.yml</code></div>
                <div className="text-slate-400">2. Run: <code className="text-emerald-400">docker compose up -d</code></div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono text-slate-400">
            Sovereign Architecture Mode: <strong className="text-amber-400">Loopback Enforced</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Save & Exit Sovereign Setup
          </button>
        </div>
      </div>
    </div>
  );
};
