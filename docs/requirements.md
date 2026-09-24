# System Requirements

## 1. Purpose

This document defines the functional and non-functional requirements for the Personal Productivity System.

The purpose of these requirements is to transform the project's vision into a set of concrete capabilities that can later be:

* designed;
* implemented;
* tested;
* measured;
* prioritized.

The requirements are intentionally technology-independent.

The system should first be defined by **what it must accomplish**, not by which software or framework will accomplish it.

---

# 2. Requirement Classification

Requirements are grouped into the following categories:

1. Goal Management
2. Area and Project Management
3. Task Management
4. Deadline Management
5. Calendar and Availability
6. Planning
7. Scheduling
8. Energy Management
9. Interruption Handling
10. Accountability
11. Notifications
12. Replanning
13. Progress Tracking
14. Reviews and Analytics
15. Automation
16. AI Assistance
17. Cross-Platform Access
18. Data and Synchronization
19. Security and Privacy
20. Reliability
21. Extensibility
22. Usability

---

# 3. Priority Levels

Each requirement should eventually be assigned an implementation priority.

| Priority | Meaning                                        |
| -------- | ---------------------------------------------- |
| P0       | Fundamental; system cannot function without it |
| P1       | Important for the first usable version         |
| P2       | Valuable but can be introduced later           |
| P3       | Optional / future enhancement                  |

The priority may change as the system evolves.

---

# 4. Goal Management

## REQ-GOAL-001 — Create Goals

The system shall allow the user to create long-term goals.

A goal should support at least:

* title;
* description;
* category/area;
* target date;
* status;
* priority;
* measurable outcome where applicable.

**Priority:** P1

---

## REQ-GOAL-002 — Edit Goals

The user shall be able to modify existing goals.

**Priority:** P1

---

## REQ-GOAL-003 — Archive Goals

The system shall allow completed or abandoned goals to be archived without deleting their historical data.

**Priority:** P2

---

## REQ-GOAL-004 — Goal Progress

The system should allow progress toward a goal to be represented and reviewed.

**Priority:** P2

---

## REQ-GOAL-005 — Goal-to-Task Relationship

Tasks should be linkable to goals either directly or through projects/objectives.

Example:

```text
Goal
 ↓
Objective
 ↓
Project
 ↓
Task
```

**Priority:** P1

---

# 5. Area and Project Management

## REQ-PROJ-001 — Areas

The system shall support areas of responsibility.

Examples:

* University;
* Career;
* Programming;
* Personal;
* Music;
* Health;
* Administration.

**Priority:** P1

---

## REQ-PROJ-002 — Projects

The system shall allow multiple projects to exist within an area.

**Priority:** P1

---

## REQ-PROJ-003 — Project Status

Projects should support statuses such as:

* active;
* paused;
* completed;
* archived.

**Priority:** P1

---

## REQ-PROJ-004 — Project Tasks

Tasks shall be assignable to projects.

**Priority:** P0

---

## REQ-PROJ-005 — Project Progress

The system should be able to calculate or represent project progress.

**Priority:** P2

---

# 6. Academic Structure

Because academic performance is the primary objective, academic information should have first-class support.

## REQ-ACAD-001 — Courses

The system shall support university courses.

A course may contain:

* course name;
* code;
* lecturer;
* semester;
* schedule;
* importance;
* associated projects/tasks.

**Priority:** P1

---

## REQ-ACAD-002 — Academic Tasks

Assignments, revision sessions, projects, exercises and other academic work shall be representable as tasks.

**Priority:** P0

---

## REQ-ACAD-003 — Academic Deadlines

Academic deadlines shall be distinguishable from ordinary deadlines.

**Priority:** P1

---

## REQ-ACAD-004 — Academic Priority

Academic tasks shall be capable of receiving priority based on academic importance and deadline pressure.

**Priority:** P1

---

# 7. Task Management

## REQ-TASK-001 — Create Tasks

The system shall allow the user to create tasks.

A task should support:

* title;
* description;
* status;
* priority;
* estimated duration;
* deadline;
* project;
* area;
* course where applicable;
* energy requirement;
* dependencies;
* recurrence;
* notes.

**Priority:** P0

---

## REQ-TASK-002 — Edit Tasks

The user shall be able to modify task properties.

**Priority:** P0

---

## REQ-TASK-003 — Complete Tasks

The user shall be able to mark tasks as completed.

The system shall record:

* completion timestamp;
* planned duration;
* actual duration where available.

**Priority:** P0

---

## REQ-TASK-004 — Postpone Tasks

The user shall be able to postpone a task.

The system should record:

* previous planned time;
* new planned time;
* postponement timestamp;
* postponement count;
* optional reason.

**Priority:** P0

---

## REQ-TASK-005 — Cancel Tasks

The user shall be able to cancel or abandon a task without deleting its historical record.

**Priority:** P1

---

## REQ-TASK-006 — Task Dependencies

Tasks should be able to depend on other tasks.

Example:

```text
Research topic
      ↓
Write outline
      ↓
Create presentation
      ↓
Practice presentation
```

The scheduling engine should consider dependencies.

**Priority:** P2

---

## REQ-TASK-007 — Recurring Tasks

The system should support recurring tasks.

Examples:

* weekly revision;
* daily review;
* monthly administrative tasks.

**Priority:** P2

---

# 8. Deadline Management

## REQ-DEAD-001 — Deadlines

Tasks shall support deadlines.

**Priority:** P0

---

## REQ-DEAD-002 — Deadline Urgency

The system shall calculate or represent increasing urgency as a deadline approaches.

**Priority:** P0

---

## REQ-DEAD-003 — Overdue Detection

The system shall detect when a task passes its deadline without completion.

**Priority:** P0

---

## REQ-DEAD-004 — Deadline Protection

The planning engine shall prioritize critical upcoming deadlines when generating or modifying plans.

**Priority:** P0

---

## REQ-DEAD-005 — Deadline Notifications

The system shall be capable of notifying the user when important deadlines approach.

**Priority:** P1

---

# 9. Calendar and Availability

## REQ-CAL-001 — Fixed Commitments

The system shall recognize fixed calendar commitments.

Examples:

* classes;
* meetings;
* appointments;
* events.

**Priority:** P1

---

## REQ-CAL-002 — Available Time

The system shall determine available planning windows from calendar information and other constraints.

**Priority:** P1

---

## REQ-CAL-003 — Scheduling Conflicts

The system shall detect when planned work conflicts with fixed commitments.

**Priority:** P1

---

## REQ-CAL-004 — Calendar Synchronization

The system should synchronize with an external calendar system.

**Priority:** P1

---

## REQ-CAL-005 — Calendar Changes

Changes to relevant calendar events should be capable of triggering replanning.

**Priority:** P2

---

# 10. Planning

## REQ-PLAN-001 — Daily Plan

The system shall be capable of generating a daily plan.

The plan should consider:

* priorities;
* deadlines;
* available time;
* fixed commitments;
* task duration;
* energy;
* dependencies;
* unfinished work.

**Priority:** P0

---

## REQ-PLAN-002 — Next Action

The system shall be capable of identifying a current next action.

The next action should be concrete enough to begin without additional planning whenever possible.

**Priority:** P0

---

## REQ-PLAN-003 — Prioritization

The planning system shall prioritize work using multiple factors rather than a single priority field.

At minimum:

* deadline urgency;
* importance;
* available time;
* effort.

**Priority:** P0

---

## REQ-PLAN-004 — Capacity Awareness

The system shall avoid intentionally scheduling more work than the available capacity can reasonably support.

**Priority:** P1

---

## REQ-PLAN-005 — Buffer Time

The planning system should reserve some capacity for:

* transitions;
* unexpected events;
* breaks;
* overruns.

**Priority:** P1

---

## REQ-PLAN-006 — Flexible Scheduling

The system should distinguish between:

* fixed events;
* preferred blocks;
* flexible tasks.

**Priority:** P1

---

# 11. Scheduling Engine

## REQ-SCHED-001 — Task Selection

The scheduling engine shall select tasks based on the current system state.

**Priority:** P0

---

## REQ-SCHED-002 — Deadline Pressure

Tasks with approaching deadlines should receive increased scheduling priority.

**Priority:** P0

---

## REQ-SCHED-003 — Academic Importance

Academic importance should influence scheduling.

**Priority:** P0

---

## REQ-SCHED-004 — Effort Matching

The scheduler should consider whether a task fits within the available time window.

**Priority:** P1

---

## REQ-SCHED-005 — Energy Matching

The scheduler should prefer tasks compatible with current energy.

**Priority:** P1

---

## REQ-SCHED-006 — Postponement History

Repeated postponement should influence planning.

**Priority:** P2

---

## REQ-SCHED-007 — One Next Action

When possible, the system should present one recommended immediate action rather than requiring the user to choose from a large list.

**Priority:** P1

---

# 12. Energy Management

## REQ-ENERGY-001 — Energy State

The system shall support an energy state.

Minimum states:

```text
HIGH
NORMAL
LOW
EXHAUSTED
```

**Priority:** P1

---

## REQ-ENERGY-002 — Energy Check-In

The user should be able to provide their current energy state quickly.

**Priority:** P1

---

## REQ-ENERGY-003 — Energy-Aware Scheduling

The planning engine should use energy state when selecting tasks.

**Priority:** P1

---

## REQ-ENERGY-004 — Minimum Viable Actions

The system should be able to generate smaller versions of tasks when available capacity is insufficient for the full task.

**Priority:** P1

---

## REQ-ENERGY-005 — Energy History

The system should optionally store historical energy information for later analysis.

**Priority:** P3

---

# 13. Interruption Handling

## REQ-INT-001 — Start Interruption

The user shall be able to indicate that an unexpected interruption has started.

**Priority:** P0

---

## REQ-INT-002 — End Interruption

The user shall be able to indicate when the interruption has ended.

**Priority:** P0

---

## REQ-INT-003 — Interruption Duration

The system shall record interruption duration when possible.

**Priority:** P1

---

## REQ-INT-004 — Interruption Reason

The user should optionally be able to specify the reason.

Examples:

* family;
* university;
* personal;
* technical;
* transport;
* emergency;
* other.

**Priority:** P2

---

## REQ-INT-005 — Automatic Replanning

Ending a significant interruption should be capable of triggering a replanning process.

**Priority:** P0

---

## REQ-INT-006 — Deadline Protection After Interruption

Replanning shall preserve critical deadlines whenever reasonably possible.

**Priority:** P0

---

## REQ-INT-007 — Flexible Work Movement

Flexible tasks should be moved before fixed commitments whenever possible.

**Priority:** P0

---

## REQ-INT-008 — No Silent Deletion

Replanning shall not silently delete planned work.

Moved or removed work should remain visible.

**Priority:** P1

---

# 14. Accountability

## REQ-ACC-001 — Start Reminder

The system shall be capable of notifying the user when a planned work block is about to begin.

**Priority:** P1

---

## REQ-ACC-002 — Missed Task Detection

The system shall detect when a scheduled task was not started or completed within the expected period.

**Priority:** P1

---

## REQ-ACC-003 — Drift Detection

The system should detect extended inactivity or failure to start an important task.

**Priority:** P2

---

## REQ-ACC-004 — Escalation

Accountability interventions should escalate according to repeated non-execution.

Example:

```text
Reminder
   ↓
Action prompt
   ↓
Minimum viable action
   ↓
Explicit reschedule
   ↓
Review
```

**Priority:** P1

---

## REQ-ACC-005 — Repeated Postponement

The system should identify tasks repeatedly postponed.

**Priority:** P1

---

## REQ-ACC-006 — Blocker Detection

The system should allow the user to indicate why a task is repeatedly not being completed.

**Priority:** P2

---

# 15. Notification System

## REQ-NOTIF-001 — Notification Categories

The system should support at least:

* morning mission;
* task start;
* deadline warning;
* overdue;
* accountability;
* interruption;
* replanning;
* completion;
* evening review.

**Priority:** P1

---

## REQ-NOTIF-002 — Cross-Device Notifications

Notifications should be capable of reaching the user's supported devices.

**Priority:** P1

---

## REQ-NOTIF-003 — Notification Priority

Critical notifications should be distinguishable from informational notifications.

**Priority:** P1

---

## REQ-NOTIF-004 — Notification Fatigue Control

The system shall avoid repeatedly sending unnecessary notifications.

**Priority:** P1

---

## REQ-NOTIF-005 — Notification History

Important system notifications should optionally be recorded.

**Priority:** P2

---

# 16. Replanning

## REQ-REPLAN-001 — Trigger Events

Replanning should be triggerable by events such as:

* interruption;
* task completion;
* task postponement;
* missed task;
* calendar change;
* deadline approaching;
* energy change;
* unexpected availability change.

**Priority:** P0

---

## REQ-REPLAN-002 — Remaining Capacity

The replanning engine shall calculate remaining usable capacity.

**Priority:** P0

---

## REQ-REPLAN-003 — Protect Critical Work

Replanning shall protect high-priority work and important deadlines.

**Priority:** P0

---

## REQ-REPLAN-004 — Remove Optional Work First

When capacity is insufficient, lower-priority work should generally be moved before critical work.

**Priority:** P1

---

## REQ-REPLAN-005 — Split Tasks

Large tasks should be capable of being divided into smaller work units.

**Priority:** P1

---

## REQ-REPLAN-006 — Explain Changes

The system should explain significant changes to the user's plan.

Example:

> “Your database assignment was moved to 16:00 because your 14:00–15:30 window was lost to an interruption.”

**Priority:** P2

---

## REQ-REPLAN-007 — Updated Next Action

After replanning, the system shall provide a new next action.

**Priority:** P0

---

# 17. Progress Tracking

## REQ-PROG-001 — Completion History

The system shall record completed tasks.

**Priority:** P0

---

## REQ-PROG-002 — Actual Duration

The system should record actual task duration when available.

**Priority:** P2

---

## REQ-PROG-003 — Planned vs Actual

The system should eventually compare estimated and actual durations.

**Priority:** P2

---

## REQ-PROG-004 — Academic Progress

The system should provide a way to evaluate progress toward academic objectives.

**Priority:** P1

---

# 18. Reviews

## REQ-REV-001 — Daily Review

The system shall support an end-of-day review.

The review should compare:

* planned work;
* completed work;
* postponed work;
* interruptions;
* important unfinished tasks.

**Priority:** P1

---

## REQ-REV-002 — Weekly Review

The system should support a weekly review.

Potential information:

* completion rate;
* important work completed;
* missed deadlines;
* repeated postponements;
* academic progress;
* major interruptions;
* upcoming deadlines.

**Priority:** P2

---

## REQ-REV-003 — Planning Feedback

Review information should be usable to improve future planning.

**Priority:** P2

---

# 19. Automation

## REQ-AUTO-001 — Event-Based Automation

The system shall support event-driven workflows.

Example events:

```text
task.created
task.started
task.completed
task.postponed
task.overdue
deadline.approaching
interruption.started
interruption.ended
energy.changed
calendar.changed
daily.plan.created
```

**Priority:** P1

---

## REQ-AUTO-002 — Webhooks

The system should support incoming and/or outgoing webhooks where appropriate.

**Priority:** P1

---

## REQ-AUTO-003 — Automated Reactions

Events should be capable of triggering actions.

Example:

```text
task.completed
      ↓
Update progress
      ↓
Recalculate plan
      ↓
Identify next action
      ↓
Notify user
```

**Priority:** P1

---

## REQ-AUTO-004 — Automation Reliability

Failed automation workflows should be detectable and recoverable.

**Priority:** P2

---

# 20. AI Assistance

## REQ-AI-001 — Task Decomposition

AI should be capable of breaking large tasks into actionable steps.

**Priority:** P2

---

## REQ-AI-002 — Planning Assistance

AI should be capable of generating plans using structured system data.

**Priority:** P2

---

## REQ-AI-003 — Replanning Assistance

AI should be capable of proposing revised plans after interruptions or changes.

**Priority:** P2

---

## REQ-AI-004 — Natural Language Input

The user should eventually be able to interact with the system using natural language.

Examples:

> “I have two hours free. What should I work on?”

> “I couldn't do my assignment this morning.”

> “Move everything except my exam preparation.”

**Priority:** P2

---

## REQ-AI-005 — Context Awareness

AI recommendations should use relevant structured context rather than relying solely on the user's message.

**Priority:** P2

---

## REQ-AI-006 — Explainability

Important AI-generated planning decisions should have understandable explanations.

**Priority:** P2

---

## REQ-AI-007 — Human Override

The user shall be able to override AI recommendations.

**Priority:** P1

---

# 21. Cross-Platform Access

## REQ-PLAT-001 — iPhone Access

The user shall be able to view and modify relevant system data from an iPhone.

**Priority:** P1

---

## REQ-PLAT-002 — Windows Access

The user shall be able to view and modify relevant system data from a Windows PC.

**Priority:** P1

---

## REQ-PLAT-003 — Consistent State

Changes made on one device should become available on other connected devices.

**Priority:** P0

---

## REQ-PLAT-004 — Responsive Interface

The primary interface should work across different screen sizes where technically appropriate.

**Priority:** P1

---

# 22. Data and Synchronization

## REQ-DATA-001 — Cloud Source of Truth

Essential system state shall be stored in a cloud-accessible data layer.

**Priority:** P0

---

## REQ-DATA-002 — Synchronization

Changes should synchronize across supported clients.

**Priority:** P0

---

## REQ-DATA-003 — Data Export

The system should provide a way to export important user data.

**Priority:** P2

---

## REQ-DATA-004 — Historical Data

Important historical events should not be lost merely because the current state changes.

**Priority:** P1

---

## REQ-DATA-005 — Event History

The system should maintain sufficient event history to understand major planning changes.

**Priority:** P2

---

# 23. Security and Privacy

## REQ-SEC-001 — Authentication

The system shall authenticate users before accessing private productivity data.

**Priority:** P0

---

## REQ-SEC-002 — Authorization

Users shall only be able to access their own private productivity data unless explicitly shared.

**Priority:** P0

---

## REQ-SEC-003 — Secure Communication

Data transmitted between clients and backend services should use secure communication.

**Priority:** P0

---

## REQ-SEC-004 — Secret Protection

API keys, authentication credentials and other secrets shall not be stored directly in client-side source code.

**Priority:** P0

---

## REQ-SEC-005 — AI Data Handling

The system should minimize unnecessary transmission of private personal data to external AI services.

**Priority:** P1

---

## REQ-SEC-006 — User Control

The user should be able to understand which external services have access to their data.

**Priority:** P2

---

# 24. Reliability

## REQ-REL-001 — Failure Detection

Important integrations should expose failures rather than silently failing.

**Priority:** P1

---

## REQ-REL-002 — Retry

Recoverable automation failures should support retry behavior.

**Priority:** P2

---

## REQ-REL-003 — Graceful Degradation

Temporary failure of an external service should not destroy the user's existing productivity data.

**Priority:** P1

---

## REQ-REL-004 — Offline Resilience

Where technically possible, clients should retain limited functionality during temporary connectivity loss.

**Priority:** P2

---

# 25. Usability

## REQ-UX-001 — Fast Capture

Creating a task should require minimal interaction.

**Priority:** P1

---

## REQ-UX-002 — Clear Next Action

The current recommended action should be easy to identify.

**Priority:** P0

---

## REQ-UX-003 — Low Cognitive Load

The system should minimize unnecessary choices during execution.

**Priority:** P1

---

## REQ-UX-004 — Quick Interruption

Starting and ending an interruption should require minimal interaction.

**Priority:** P1

---

## REQ-UX-005 — Quick Energy Check

Changing energy state should be possible quickly.

**Priority:** P1

---

## REQ-UX-006 — Explainable Changes

Significant schedule changes should be understandable.

**Priority:** P2

---

# 26. Extensibility

## REQ-EXT-001 — Modular Integrations

External services should be replaceable where practical.

**Priority:** P1

---

## REQ-EXT-002 — API-First Design

Core system functionality should eventually be accessible through APIs.

**Priority:** P2

---

## REQ-EXT-003 — Event-Driven Architecture

Major state changes should be representable as events where appropriate.

**Priority:** P1

---

## REQ-EXT-004 — Vendor Independence

The architecture should avoid unnecessary dependence on a single external provider.

**Priority:** P2

---

# 27. Initial Scope

The first usable version should **not** attempt to implement every requirement.

The initial system should focus on the smallest set of capabilities required to validate the core hypothesis.

### Minimum viable system

```text
Goals
  ↓
Projects / Courses
  ↓
Tasks
  ↓
Deadlines
  ↓
Daily Plan
  ↓
Next Action
  ↓
Completion / Postponement
  ↓
Replanning
  ↓
Notifications
```

The first version should prove that this loop improves execution.

---

# 28. Out of Scope for Initial Version

The following should not be required for the first implementation:

* complex gamification;
* advanced analytics;
* autonomous AI decision-making;
* custom native applications;
* sophisticated machine learning;
* social features;
* public profiles;
* elaborate dashboards;
* excessive integrations.

These may be evaluated later if they solve demonstrated problems.

---

# 29. Requirement Traceability

Future implementation work should be traceable to these requirements.

A feature should ideally map to:

```text
Requirement
     ↓
Design
     ↓
Implementation
     ↓
Test
     ↓
Measurement
```

This helps prevent the project from accumulating features without a clear purpose.

---

# 30. Core Requirement

All other requirements ultimately support one central requirement:

> **REQ-CORE-001 — The system shall help the user determine and execute the most valuable feasible next action given the user's current goals, priorities, deadlines, available capacity, energy, commitments and real-world circumstances.**

**Priority:** P0

This is the central functional requirement of the entire system.

If the system cannot meaningfully support this requirement, additional features should not be considered a substitute for fixing the core execution loop.
