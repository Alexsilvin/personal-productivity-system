# Notification System

## Goals

Notifications should prompt useful action at an appropriate moment, remain understandable, and respect user attention settings.

## Notification types

- Upcoming focus block.
- Start, pause, and end reminders.
- Deadline risk or newly created conflict.
- Replan summary after an interruption.
- Daily planning and review prompts.

## Policy

- Respect quiet hours, focus modes, and per-type preferences.
- Group related schedule changes into one summary.
- Avoid repeating a notification without a meaningful state change.
- Make every notification actionable or dismissible.
- Use local scheduling when offline and reconcile after reconnecting.

## Delivery model

The notification planner creates intents from domain events. Platform adapters deliver those intents and report delivery, interaction, or failure. Delivery is best effort; the schedule remains authoritative.

## Privacy

Notification content should minimize sensitive project details on lock screens. Users can choose full, abbreviated, or hidden previews.
