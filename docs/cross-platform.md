# Cross-Platform

## Target surfaces

- Web for planning, review, and administration.
- Mobile for capture, quick changes, and notifications.
- Desktop for focused work sessions and system-level reminders.

## Shared behavior

All clients use the same domain rules and serialized data model. Visual layouts may differ by platform, but task states, scheduling decisions, overrides, and notification preferences must have consistent meaning.

## Offline and sync

Each client maintains a local store and an operation queue. Sync exchanges versioned changes, resolves independent edits automatically, and surfaces conflicting user overrides rather than silently choosing one.

## Platform adapters

Adapters isolate calendar access, notification delivery, background execution, secure storage, and deep links. They must expose capability checks so unsupported features degrade clearly.

## Accessibility

Support keyboard navigation where applicable, semantic labels, scalable text, reduced motion, high contrast, and touch targets appropriate to each platform.
