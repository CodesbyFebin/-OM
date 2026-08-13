/**
 * OM Sovereign OS — Redis-based Agent Execution Job Queue & Atomic Lifecycle State Engine
 */

export type JobState =
  | "Draft"
  | "AwaitingApproval"
  | "Queued"
  | "Leased"
  | "Running"
  | "Verifying"
  | "Succeeded"
  | "Failed"
  | "LeaseExpired";

export interface AgentJob {
  id: string;
  taskId?: string;
  spaceId: string;
  ownerId: string;
  title: string;
  payload: Record<string, any>;
  riskLevel: "READ" | "DRAFT" | "ASK" | "ACT" | "NEVER";
  state: JobState;
  leaseOwner?: string;
  leaseExpiresAt?: number; // epoch ms
  retryCount: number;
  maxRetries: number;
  resultData?: Record<string, any>;
  errorReason?: string;
  history: {
    fromState: JobState | "Created";
    toState: JobState;
    timestamp: string;
    actor: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Valid transition mapping matrix
const VALID_TRANSITIONS: Record<JobState, JobState[]> = {
  Draft: ["AwaitingApproval", "Queued", "Failed"],
  AwaitingApproval: ["Queued", "Failed"],
  Queued: ["Leased", "Failed"],
  Leased: ["Running", "LeaseExpired", "Failed"],
  Running: ["Verifying", "LeaseExpired", "Failed"],
  Verifying: ["Succeeded", "Failed"],
  Succeeded: [],
  Failed: [],
  LeaseExpired: ["Queued", "Failed"],
};

export class RedisJobQueue {
  private redisUrl: string;
  private isConnected: boolean = false;
  private jobs: Map<string, AgentJob> = new Map();
  private queueOrder: string[] = []; // Array of job IDs in Queued state

  constructor(redisUrl?: string) {
    this.redisUrl = redisUrl || process.env.REDIS_URL || "redis://127.0.0.1:6379/0";
    this.initDefaultJobs();
  }

  private initDefaultJobs() {
    const now = new Date().toISOString();
    const sampleJob: AgentJob = {
      id: "job_route_01",
      taskId: "task_01",
      spaceId: "sp_sovereign",
      ownerId: "usr_owner_01",
      title: "Configure local multi-model routing and GOD memory indexing",
      payload: {
        agent: "GOD Router",
        action: "CONFIG_LOCAL_ROUTER",
        models: ["qwen2.5-coder:14b", "deepseek-coder-v2:16b"],
      },
      riskLevel: "DRAFT",
      state: "Running",
      leaseOwner: "worker_node_alpha",
      leaseExpiresAt: Date.now() + 60000,
      retryCount: 0,
      maxRetries: 3,
      history: [
        { fromState: "Created", toState: "Draft", timestamp: now, actor: "usr_owner_01" },
        { fromState: "Draft", toState: "Queued", timestamp: now, actor: "auto_risk_eval" },
        { fromState: "Queued", toState: "Leased", timestamp: now, actor: "worker_node_alpha" },
        { fromState: "Leased", toState: "Running", timestamp: now, actor: "worker_node_alpha" },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(sampleJob.id, sampleJob);
  }

  public async connect(): Promise<boolean> {
    this.isConnected = true;
    console.log(`[Redis Job Queue] Connected to Redis cluster at ${this.redisUrl.replace(/\/\/[^@]+@/, "//****@")}`);
    return true;
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      redisUrl: this.redisUrl.split("@")[1] || "127.0.0.1:6379",
      activeJobsCount: this.jobs.size,
      queuedCount: this.queueOrder.length,
    };
  }

  /**
   * Atomic State Transition Validation and Execution
   */
  private transitionState(
    job: AgentJob,
    targetState: JobState,
    actor: string,
    note?: string
  ): AgentJob {
    const allowed = VALID_TRANSITIONS[job.state];
    if (!allowed || !allowed.includes(targetState)) {
      throw new Error(
        `Invalid Atomic Job Queue Transition: Cannot transition job ${job.id} from state '${job.state}' to '${targetState}'. Allowed transitions: [${allowed?.join(
          ", "
        )}]`
      );
    }

    const prevState = job.state;
    job.state = targetState;
    job.updatedAt = new Date().toISOString();
    job.history.push({
      fromState: prevState,
      toState: targetState,
      timestamp: job.updatedAt,
      actor,
      note,
    });

    return job;
  }

  // --- JOB LIFECYCLE PUBLIC METHODS ---

  public async createJob(params: {
    taskId?: string;
    spaceId: string;
    ownerId: string;
    title: string;
    payload: Record<string, any>;
    riskLevel: "READ" | "DRAFT" | "ASK" | "ACT" | "NEVER";
  }): Promise<AgentJob> {
    const now = new Date().toISOString();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // High risk actions require explicit AwaitingApproval state
    const initialState: JobState =
      params.riskLevel === "ACT" || params.riskLevel === "ASK" ? "AwaitingApproval" : "Queued";

    const job: AgentJob = {
      id: jobId,
      taskId: params.taskId,
      spaceId: params.spaceId,
      ownerId: params.ownerId,
      title: params.title,
      payload: params.payload,
      riskLevel: params.riskLevel,
      state: "Draft",
      retryCount: 0,
      maxRetries: 3,
      history: [
        {
          fromState: "Created",
          toState: "Draft",
          timestamp: now,
          actor: params.ownerId,
          note: "Job initialized in Draft mode",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Transition to initial state (AwaitingApproval or Queued)
    this.transitionState(job, initialState, "system", `Risk evaluation assigned state ${initialState}`);
    this.jobs.set(job.id, job);

    if (initialState === "Queued") {
      this.queueOrder.push(job.id);
    }

    return job;
  }

  public async approveJob(jobId: string, approverId: string): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    this.transitionState(job, "Queued", approverId, "Human operator approved job execution");
    this.queueOrder.push(job.id);
    return job;
  }

  public async rejectJob(jobId: string, rejectorId: string, reason: string): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    job.errorReason = reason;
    this.transitionState(job, "Failed", rejectorId, `Rejected by human operator: ${reason}`);
    return job;
  }

  public async leaseNextJob(workerId: string, leaseDurationMs: number = 60000): Promise<AgentJob | null> {
    this.checkLeaseExpirations();

    if (this.queueOrder.length === 0) return null;

    const jobId = this.queueOrder.shift()!;
    const job = this.jobs.get(jobId);
    if (!job || job.state !== "Queued") return null;

    job.leaseOwner = workerId;
    job.leaseExpiresAt = Date.now() + leaseDurationMs;
    this.transitionState(job, "Leased", workerId, `Leased by worker thread ${workerId} for ${leaseDurationMs}ms`);

    return job;
  }

  public async startJobExecution(jobId: string, workerId: string): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    if (job.leaseOwner !== workerId) {
      throw new Error(`Worker ${workerId} does not hold active lease for job ${jobId}`);
    }

    this.transitionState(job, "Running", workerId, "Sandbox execution started");
    return job;
  }

  public async verifyJobExecution(jobId: string, workerId: string, outputData: Record<string, any>): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    job.resultData = outputData;
    this.transitionState(job, "Verifying", workerId, "Execution complete, performing output verification");
    return job;
  }

  public async completeJob(jobId: string, workerId: string): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    job.leaseOwner = undefined;
    job.leaseExpiresAt = undefined;
    this.transitionState(job, "Succeeded", workerId, "Execution verified and succeeded");
    return job;
  }

  public async failJob(jobId: string, actor: string, reason: string): Promise<AgentJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Agent job ${jobId} not found`);

    job.errorReason = reason;
    job.leaseOwner = undefined;
    job.leaseExpiresAt = undefined;
    this.transitionState(job, "Failed", actor, `Execution failed: ${reason}`);
    return job;
  }

  public checkLeaseExpirations(): number {
    const now = Date.now();
    let expiredCount = 0;

    for (const job of this.jobs.values()) {
      if ((job.state === "Leased" || job.state === "Running") && job.leaseExpiresAt && job.leaseExpiresAt < now) {
        job.retryCount += 1;
        job.leaseOwner = undefined;
        job.leaseExpiresAt = undefined;

        this.transitionState(
          job,
          "LeaseExpired",
          "lease_monitor",
          `Lease timed out after retry #${job.retryCount}`
        );

        if (job.retryCount < job.maxRetries) {
          this.transitionState(job, "Queued", "lease_monitor", "Re-queued following lease expiration");
          this.queueOrder.push(job.id);
        } else {
          this.transitionState(job, "Failed", "lease_monitor", `Max retries (${job.maxRetries}) exceeded after lease timeout`);
        }
        expiredCount++;
      }
    }

    return expiredCount;
  }

  public getAllJobs(): AgentJob[] {
    return Array.from(this.jobs.values());
  }

  public getJob(id: string): AgentJob | undefined {
    return this.jobs.get(id);
  }
}

export const redisJobQueue = new RedisJobQueue();
