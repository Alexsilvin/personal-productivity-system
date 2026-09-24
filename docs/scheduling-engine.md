# Scheduling Engine

## Inputs

- Task priority, effort, deadline, dependencies, and preferred context.
- Working hours, breaks, focus windows, and user energy preferences.
- Calendar commitments and existing locked blocks.
- Current time, completion state, and interruption history.

## Output

A schedule is an ordered set of time blocks. Each block identifies its source task, start and end time, confidence, and reason. Unscheduled work must remain visible with a reason such as insufficient availability or a missing estimate.

## Rules

1. Never place work over locked commitments.
2. Respect deadlines and task dependencies.
3. Preserve completed and in-progress work.
4. Schedule high-value work into compatible focus windows.
5. Reserve transition and recovery time where configured.
6. Minimize unnecessary movement of existing blocks.
7. Surface conflicts instead of silently discarding work.

## Replanning

Replanning is incremental. The engine starts at the earliest affected block, keeps unaffected history stable, and applies the smallest valid change. User-pinned blocks are constraints until explicitly released.

## Explainability

Every generated or moved block should expose the rules that influenced it, the alternatives considered at a high level, and any tradeoff made.
