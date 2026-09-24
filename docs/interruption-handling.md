# Interruption Handling

## Interruption types

- **Planned:** calendar event or user-created block.
- **Reactive:** urgent request, unexpected meeting, or support issue.
- **Personal:** break, appointment, health, or availability change.
- **System:** device offline, missed notification, or synchronization conflict.

## Recovery flow

1. Capture the interruption and its time range.
2. Mark affected schedule blocks as interrupted, completed, or still pending.
3. Ask for the smallest amount of missing information, such as whether the interruption is urgent.
4. Replan only the affected horizon.
5. Present a short summary of changes and unresolved conflicts.

## User controls

Users can resume a task, move it, split remaining effort, defer it, or protect it from automatic movement. The system should preserve the original estimate and record actual time separately.

## Safety rules

Do not automatically delete tasks, shorten hard deadlines, or override locked blocks. When no valid recovery exists, leave work unscheduled and explain why.
