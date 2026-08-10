import { AgentAction, RiskLevel, Space } from '../../types';

export interface PolicyRule {
  id: string;
  name: string;
  actionType: AgentAction['type'] | '*';
  minRiskLevel: RiskLevel;
  maxRiskLevel: RiskLevel;
  spaceSecurityPolicy?: Space['securityPolicy'] | '*';
  defaultDecision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  reason: string;
}

export interface PermissionCheckRequest {
  agentName: string;
  actionType: AgentAction['type'];
  riskLevel: RiskLevel;
  command?: string;
  details: string;
  spaceId?: string;
  spaceSecurityPolicy?: Space['securityPolicy'];
}

export interface PermissionCheckResult {
  allowed: boolean;
  requiresUserApproval: boolean;
  decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  reason: string;
  ruleMatched?: PolicyRule;
  evaluatedAt: string;
}

const RISK_HIERARCHY: Record<RiskLevel, number> = {
  READ: 1,
  DRAFT: 2,
  ASK: 3,
  ACT: 4,
  NEVER: 5,
};

export class PermissionEngine {
  private static defaultRules: PolicyRule[] = [
    {
      id: 'rule-never-blocked',
      name: 'Block Unsafe Actions',
      actionType: '*',
      minRiskLevel: 'NEVER',
      maxRiskLevel: 'NEVER',
      defaultDecision: 'DENY',
      reason: 'Actions categorized as NEVER are permanently forbidden by global safety policy.',
    },
    {
      id: 'rule-isolated-space-strict',
      name: 'Isolated Space Strict Policy',
      actionType: '*',
      minRiskLevel: 'ASK',
      maxRiskLevel: 'ACT',
      spaceSecurityPolicy: 'isolated',
      defaultDecision: 'REQUIRE_APPROVAL',
      reason: 'Isolated spaces require human confirmation for all state-changing or executable actions.',
    },
    {
      id: 'rule-read-auto-allow',
      name: 'Read Operations Auto-Allowed',
      actionType: '*',
      minRiskLevel: 'READ',
      maxRiskLevel: 'READ',
      defaultDecision: 'ALLOW',
      reason: 'Read-only context analysis operations pose zero state side-effects.',
    },
    {
      id: 'rule-draft-auto-allow',
      name: 'Draft Operations Auto-Allowed',
      actionType: '*',
      minRiskLevel: 'DRAFT',
      maxRiskLevel: 'DRAFT',
      defaultDecision: 'ALLOW',
      reason: 'Drafting suggestions or staging actions does not execute system commands directly.',
    },
    {
      id: 'rule-terminal-ask',
      name: 'Terminal Execution Confirmation',
      actionType: 'terminal',
      minRiskLevel: 'ASK',
      maxRiskLevel: 'ACT',
      defaultDecision: 'REQUIRE_APPROVAL',
      reason: 'Terminal shell commands and script executions require user approval before running.',
    },
    {
      id: 'rule-deployment-ask',
      name: 'Deployment Gate',
      actionType: 'deployment',
      minRiskLevel: 'ASK',
      maxRiskLevel: 'ACT',
      defaultDecision: 'REQUIRE_APPROVAL',
      reason: 'Deploying infrastructure or cloud services requires user authorization.',
    },
    {
      id: 'rule-default-fallback',
      name: 'Default Approval Gate',
      actionType: '*',
      minRiskLevel: 'ASK',
      maxRiskLevel: 'ACT',
      defaultDecision: 'REQUIRE_APPROVAL',
      reason: 'Action involves external mutations or executions and requires human approval.',
    },
  ];

  private static customRules: PolicyRule[] = [];

  /**
   * Evaluates an agent action against configured policy rules.
   */
  public static evaluate(request: PermissionCheckRequest): PermissionCheckResult {
    const spacePolicy = request.spaceSecurityPolicy || 'standard';
    const riskNum = RISK_HIERARCHY[request.riskLevel] || 3;

    // Strict safety check for NEVER risk level
    if (request.riskLevel === 'NEVER') {
      return {
        allowed: false,
        requiresUserApproval: false,
        decision: 'DENY',
        reason: 'Action carries NEVER risk tier and cannot be authorized under any circumstances.',
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Evaluate rules in order: custom rules first, then defaults
    const rulesToTest = [...this.customRules, ...this.defaultRules];

    for (const rule of rulesToTest) {
      if (this.matchesRule(rule, request, spacePolicy, riskNum)) {
        return {
          allowed: rule.defaultDecision !== 'DENY',
          requiresUserApproval: rule.defaultDecision === 'REQUIRE_APPROVAL',
          decision: rule.defaultDecision,
          reason: rule.reason,
          ruleMatched: rule,
          evaluatedAt: new Date().toISOString(),
        };
      }
    }

    // Default fallback
    return {
      allowed: true,
      requiresUserApproval: true,
      decision: 'REQUIRE_APPROVAL',
      reason: 'No explicit rule matched; falling back to mandatory human approval gate.',
      evaluatedAt: new Date().toISOString(),
    };
  }

  private static matchesRule(
    rule: PolicyRule,
    request: PermissionCheckRequest,
    spacePolicy: Space['securityPolicy'],
    riskNum: number
  ): boolean {
    // Action type match
    if (rule.actionType !== '*' && rule.actionType !== request.actionType) {
      return false;
    }

    // Space security policy match
    if (
      rule.spaceSecurityPolicy &&
      rule.spaceSecurityPolicy !== '*' &&
      rule.spaceSecurityPolicy !== spacePolicy
    ) {
      return false;
    }

    // Risk level range match
    const minNum = RISK_HIERARCHY[rule.minRiskLevel];
    const maxNum = RISK_HIERARCHY[rule.maxRiskLevel];

    if (riskNum < minNum || riskNum > maxNum) {
      return false;
    }

    return true;
  }

  /**
   * Adds a user-defined custom policy rule.
   */
  public static addRule(rule: PolicyRule): void {
    this.customRules.unshift(rule);
  }

  /**
   * Retrieves all current policy rules.
   */
  public static getActiveRules(): PolicyRule[] {
    return [...this.customRules, ...this.defaultRules];
  }
}
