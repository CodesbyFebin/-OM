import React, { useState, useEffect } from "react";
import { SidebarNav } from "./components/SidebarNav";
import { CommandCenter } from "./components/CommandCenter";
import { DailyBriefingModal } from "./components/DailyBriefingModal";
import { BrowserWorkspace } from "./components/BrowserWorkspace";
import { SpacesManager } from "./components/SpacesManager";
import { MemoryVault } from "./components/MemoryVault";
import { DeveloperUniverse } from "./components/DeveloperUniverse";
import { AgentApprovals } from "./components/AgentApprovals";
import { ControlPlane } from "./components/ControlPlane";
import { MissionsTasks } from "./components/MissionsTasks";
import { UniversalSearchModal } from "./components/UniversalSearchModal";
import { PersonalTutor } from "./components/PersonalTutor";
import { HabitDashboard } from "./components/HabitDashboard";
import { QuickCaptureModal } from "./components/QuickCaptureModal";

import { ContextEngine } from "./core/context/ContextEngine";
import { globalModelRouter } from "./packages/ai/ModelRouter";
import omCosmicBg from "./assets/images/om_cosmic_bg_1786400452986.jpg";

import {
  initialSpaces,
  initialMissions,
  initialMemory,
  initialTabs,
  initialNotes,
  initialTasks,
  initialHabits,
  initialCalendarEvents,
  initialDailyGoals,
  initialFiles,
  initialActions,
  initialAuditEvents,
  initialModelRoutes,
  initialEdgeNodes,
  initialContainers,
} from "./lib/initialData";

import {
  Space,
  Mission,
  MemoryItem,
  TabItem,
  NoteItem,
  TaskItem,
  HabitItem,
  CalendarEvent,
  DailyGoal,
  FileItem,
  AgentAction,
  AuditEvent,
  DailyBriefing,
} from "./types";

export default function App() {
  // State Initialization from LocalStorage or Defaults
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem("om_spaces");
    return saved ? JSON.parse(saved) : initialSpaces;
  });

  const [activeSpaceId, setActiveSpaceId] = useState<string>(() => {
    return ContextEngine.getInitialActiveSpaceId("space-dev");
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem("om_missions");
    return saved ? JSON.parse(saved) : initialMissions;
  });

  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem("om_memory");
    return saved ? JSON.parse(saved) : initialMemory;
  });

  const [tabs, setTabs] = useState<TabItem[]>(() => {
    const saved = localStorage.getItem("om_tabs");
    return saved ? JSON.parse(saved) : initialTabs;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem("om_notes");
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("om_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem("om_habits");
    return saved ? JSON.parse(saved) : initialHabits;
  });

  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("om_theme") as "dark" | "light") || "dark"
  );

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("om_calendar_events");
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    const saved = localStorage.getItem("om_daily_goals");
    return saved ? JSON.parse(saved) : initialDailyGoals;
  });

  const [files] = useState<FileItem[]>(initialFiles);
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents);
  const [modelRoutes] = useState(initialModelRoutes);
  const [edgeNodes] = useState(initialEdgeNodes);
  const [containers] = useState(initialContainers);

  // UI View States
  const [currentView, setCurrentView] = useState<string>("command");
  const [briefing, setBriefing] = useState<DailyBriefing | null>({
    greeting: "Good morning, Febin.",
    summary:
      "Your private AI operating universe is online and synced. Context engine & ModelRouter active.",
    priorities: [
      "Review OM Production deployment logs & Express server on port 3000",
      "Complete architectural review of Space Context restoration engine",
      "Sync local vector memory with personal project notes",
    ],
    contextToResume: "OM Development Space",
    securityNotice: "All system nodes 100% secure. Zero-knowledge vault sealed.",
  });

  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state to LocalStorage and Capture Context Snapshots
  useEffect(() => {
    localStorage.setItem("om_spaces", JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem("om_active_space", activeSpaceId);
  }, [activeSpaceId]);

  useEffect(() => {
    localStorage.setItem("om_memory", JSON.stringify(memoryItems));
  }, [memoryItems]);

  useEffect(() => {
    localStorage.setItem("om_tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("om_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("om_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("om_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("om_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("om_calendar_events", JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem("om_daily_goals", JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // ContextEngine snapshot capture
  useEffect(() => {
    ContextEngine.captureSnapshot({
      activeSpaceId,
      spaces,
      tasks,
      notes,
      memoryItems,
      missions,
      tabs,
      actions,
    });
  }, [activeSpaceId, spaces, tasks, notes, memoryItems, missions, tabs, actions]);

  const handleToggleGoal = (goalId: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleAddGoal = (newGoalData: Omit<DailyGoal, "id">) => {
    const newGoal: DailyGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
    };
    setDailyGoals((prev) => [...prev, newGoal]);
  };

  const handleAddEvent = (newEventData: Omit<CalendarEvent, "id">) => {
    const newEvt: CalendarEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
    };
    setCalendarEvents((prev) => [newEvt, ...prev]);
  };

  const handleToggleHabit = (habitId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const isDoneNow = !h.completedToday;
        const newStreak = isDoneNow ? h.streak + 1 : Math.max(0, h.streak - 1);
        const newBest = Math.max(h.bestStreak, newStreak);
        const newHistory = { ...h.history, [todayStr]: isDoneNow };

        return {
          ...h,
          completedToday: isDoneNow,
          streak: newStreak,
          bestStreak: newBest,
          history: newHistory,
        };
      })
    );
  };

  const handleAddHabit = (newHabitData: Omit<HabitItem, "id" | "createdAt">) => {
    const habit: HabitItem = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setHabits((prev) => [habit, ...prev]);
  };

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

  // Actions & Space Selection
  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setSpaces((prev) =>
      prev.map((s) => ({
        ...s,
        active: s.id === spaceId,
      }))
    );
  };

  const handleResumeUniverse = () => {
    const outcome = ContextEngine.restoreUniverseContext(activeSpaceId || "space-dev");
    handleSelectSpace(outcome.targetSpaceId);
    setBriefing((prev) =>
      prev
        ? { ...prev, summary: outcome.summary }
        : {
            greeting: "Good morning, Febin.",
            summary: outcome.summary,
            priorities: ["Resume active workspace missions and review pending agent approvals"],
            systemStatus: "Zero-Knowledge Context Restored",
          }
    );
    setCurrentView("command");
  };

  // API Call Handlers
  const handleFetchBriefing = async () => {
    try {
      const spaceTasks = tasks.filter((t) => t.spaceId === activeSpaceId && !t.completed);
      const res = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeSpace: activeSpace.name,
          tasks: spaceTasks.map((t) => t.title),
          calendar: ["09:30 AM — OM Architecture Sync", "02:00 PM — Sovereign Cloud Deployment Review"],
          securityStatus: "Vault Zero-Knowledge Active",
        }),
      });
      const data = await res.json();
      setBriefing(data);
    } catch (err) {
      console.error("Briefing error:", err);
    }
  };

  const handleUniversalSearch = async (query: string, useWeb: boolean) => {
    const res = await fetch("/api/ai/universal-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        useWebSearch: useWeb,
        spaceContext: activeSpace.name,
      }),
    });
    return await res.json();
  };

  const handleAskPage = async (tab: TabItem, question: string) => {
    const res = await fetch("/api/ai/ask-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: tab.url,
        title: tab.title,
        pageContent: tab.contentSnippet,
        question,
      }),
    });
    return await res.json();
  };

  const handleRunAgentTask = async (agentType: string, instruction: string) => {
    let routerMeta;
    try {
      routerMeta = await globalModelRouter.complete({
        prompt: instruction,
        spaceContext: activeSpace.name,
        messages: [
          { role: "system", content: `You are OM ${agentType} agent operating inside workspace context ${activeSpace.name}.` },
          { role: "user", content: instruction },
        ],
      });
    } catch (err) {
      console.warn("[App] ModelRouter agent execution notice:", err);
    }

    const res = await fetch("/api/ai/agent-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentType,
        instruction,
        spaceContext: activeSpace.name,
        modelUsed: routerMeta?.modelUsed || "gemini-3.6-flash",
        privacyLevel: routerMeta?.privacyLevel || "cloud",
      }),
    });
    const data = await res.json();

    // If actions were proposed, add them to pending actions queue
    if (data.proposedActions && data.proposedActions.length > 0) {
      const newActions: AgentAction[] = data.proposedActions.map((pa: any, i: number) => ({
        id: `act_${Date.now()}_${i}`,
        agentName: agentType,
        title: pa.title,
        type: pa.type || "terminal",
        riskLevel: pa.riskLevel || "ASK",
        command: pa.command,
        details: `${pa.details || "Action drafted by agent."}${
          routerMeta ? ` [Routed via ${routerMeta.provider.toUpperCase()} (${routerMeta.modelUsed})]` : ""
        }`,
        status: "pending",
        timestamp: "Just now",
        spaceId: activeSpaceId,
      }));
      setActions((prev) => [...newActions, ...prev]);
    }

    return { ...data, routerMeta };
  };

  const handleDiagnoseLog = async (logText: string) => {
    const res = await fetch("/api/ai/diagnose-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logOutput: logText }),
    });
    return await res.json();
  };

  const handleCheckOllamaStatus = async () => {
    const res = await fetch("/api/ollama/status");
    return await res.json();
  };

  // Agent Approvals
  const handleApproveAction = (actionId: string) => {
    const targetAction = actions.find((a) => a.id === actionId);
    if (!targetAction) return;

    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "approved" } : a))
    );

    // Record Audit Event
    const newAudit: AuditEvent = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actor: "Febin (Owner)",
      agent: targetAction.agentName,
      tool: targetAction.type,
      action: `Approved: ${targetAction.title}`,
      target: targetAction.command || targetAction.title,
      result: "success",
      riskLevel: targetAction.riskLevel,
    };
    setAuditEvents((prev) => [newAudit, ...prev]);
  };

  const handleRejectAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "rejected" } : a))
    );
  };

  // Tab operations
  const handleAddTab = (url: string, title: string) => {
    const newTab: TabItem = {
      id: `tab_${Date.now()}`,
      spaceId: activeSpaceId,
      title,
      url,
      isActive: true,
      pinned: false,
      summary: `Web page opened in ${activeSpace.name}. Synergized into OM Memory context.`,
      contentSnippet: `Document at ${url} loaded into OM private session.`,
    };

    setTabs((prev) =>
      prev.map((t) => (t.spaceId === activeSpaceId ? { ...t, isActive: false } : t)).concat(newTab)
    );
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
  };

  const handleSelectTab = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === tabId,
      }))
    );
  };

  // Memory operations
  const handleAddMemory = (
    content: string,
    entityTags: string[],
    scope: "private" | "space" | "session",
    decisionFlag: boolean
  ) => {
    const newMem: MemoryItem = {
      id: `mem_${Date.now()}`,
      content,
      entityTags,
      confidence: 0.99,
      source: "User Input",
      scope,
      spaceId: activeSpaceId,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      userEditable: true,
      decisionFlag,
    };
    setMemoryItems((prev) => [newMem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemoryItems((prev) => prev.filter((m) => m.id !== id));
  };

  // Task operations
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (
    title: string,
    priority: "p1" | "p2" | "p3",
    category: string,
    dependencies?: string[]
  ) => {
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      spaceId: activeSpaceId,
      title,
      completed: false,
      priority,
      dueDate: new Date().toISOString().split("T")[0],
      category,
      dependencies,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTaskDependencies = (taskId: string, dependencies: string[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dependencies } : t))
    );
  };

  // Note operations
  const handleAddNote = (title: string, content: string, tags: string[]) => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      spaceId: activeSpaceId,
      title,
      content,
      tags,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Space Creation
  const handleCreateSpace = (name: string, description: string) => {
    const newSpace: Space = {
      id: `space_${Date.now()}`,
      name,
      icon: "Layers",
      color: "#8b5cf6", // Purple
      description,
      active: false,
      securityPolicy: "standard",
      tabsCount: 1,
      notesCount: 0,
      tasksCount: 0,
      memoryCount: 0,
      lastActiveTime: "Just created",
    };
    setSpaces((prev) => [...prev, newSpace]);
    handleSelectSpace(newSpace.id);
  };

  const pendingActions = actions.filter((a) => a.status === "pending");

  return (
    <div
      className={`relative flex h-screen font-sans antialiased overflow-hidden selection:bg-amber-500 selection:text-white transition-colors duration-300 ${
        theme === "light" ? "light-theme bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Background Sacred Geometry Cosmic Backdrop */}
      {theme === "dark" && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={omCosmicBg}
            alt="OM Cosmic Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/95 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Main Glassmorphic Layout Wrapper */}
      <div className="relative z-10 flex w-full h-full">
        {/* Left Sidebar Navigation */}
        <SidebarNav
          currentView={currentView}
          onNavigate={setCurrentView}
          spaces={spaces}
          activeSpace={activeSpace}
          onSelectSpace={handleSelectSpace}
          pendingActions={pendingActions}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {currentView === "command" && (
          <CommandCenter
            activeSpace={activeSpace}
            spaces={spaces}
            onSelectSpace={handleSelectSpace}
            onOpenBriefing={() => setBriefingModalOpen(true)}
            onOpenSearch={(q) => {
              setSearchQuery(q);
              setUniversalSearchOpen(true);
            }}
            pendingActions={pendingActions}
            onOpenApprovals={() => setCurrentView("approvals")}
            onNavigateToView={setCurrentView}
            briefing={briefing}
            habits={habits}
            tasks={tasks}
            calendarEvents={calendarEvents}
            dailyGoals={dailyGoals}
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            onAddEvent={handleAddEvent}
          />
        )}

        {currentView === "spaces" && (
          <SpacesManager
            spaces={spaces}
            activeSpace={activeSpace}
            onSelectSpace={handleSelectSpace}
            onCreateSpace={handleCreateSpace}
            missions={missions}
          />
        )}

        {currentView === "browser" && (
          <BrowserWorkspace
            activeSpace={activeSpace}
            tabs={tabs.filter((t) => t.spaceId === activeSpaceId)}
            onAddTab={handleAddTab}
            onCloseTab={handleCloseTab}
            onSelectTab={handleSelectTab}
            onAskPage={handleAskPage}
          />
        )}

        {currentView === "tutor" && (
          <PersonalTutor
            activeSpace={activeSpace}
            onAddNote={handleAddNote}
            onAddMemory={handleAddMemory}
          />
        )}

        {currentView === "memory" && (
          <MemoryVault
            memoryItems={memoryItems}
            activeSpace={activeSpace}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {currentView === "developer" && (
          <DeveloperUniverse
            activeSpace={activeSpace}
            containers={containers}
            onDiagnoseLog={handleDiagnoseLog}
          />
        )}

        {currentView === "tasks" && (
          <MissionsTasks
            activeSpace={activeSpace}
            tasks={tasks}
            notes={notes}
            missions={missions}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onUpdateTaskDependencies={handleUpdateTaskDependencies}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {currentView === "habits" && (
          <HabitDashboard
            activeSpace={activeSpace}
            habits={habits}
            tasks={tasks}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onToggleTask={handleToggleTask}
            onAddNote={handleAddNote}
          />
        )}

        {currentView === "approvals" && (
          <AgentApprovals
            actions={actions}
            auditEvents={auditEvents}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            onRunAgentTask={handleRunAgentTask}
          />
        )}

        {currentView === "control" && (
          <ControlPlane
            modelRoutes={modelRoutes}
            edgeNodes={edgeNodes}
            onCheckOllamaStatus={handleCheckOllamaStatus}
            theme={theme}
            onToggleTheme={setTheme}
          />
        )}
      </main>

      {/* Modals */}
      <DailyBriefingModal
        isOpen={briefingModalOpen}
        onClose={() => setBriefingModalOpen(false)}
        activeSpace={activeSpace}
        briefing={briefing}
        onRefreshBriefing={handleFetchBriefing}
        onResumeUniverse={handleResumeUniverse}
      />

      <UniversalSearchModal
        isOpen={universalSearchOpen}
        onClose={() => setUniversalSearchOpen(false)}
        initialQuery={searchQuery}
        activeSpace={activeSpace}
        onUniversalSearch={handleUniversalSearch}
        memoryItems={memoryItems}
        notes={notes}
        tasks={tasks}
        tabs={tabs}
        files={files}
      />

      {/* Quick Capture Floating Action Button & Modal */}
      <QuickCaptureModal
        activeSpace={activeSpace}
        spaces={spaces}
        onAddTask={handleAddTask}
        onAddNote={handleAddNote}
        onAddMemory={handleAddMemory}
      />
      </div>
    </div>
  );
}
