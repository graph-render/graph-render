# Feature 15: Localization and Schedule Metadata

## Description

International tournaments need translated labels and scheduled match times. Current hardcoded English labels limit adoption.

## Requirements

- Add `scheduledAt`, `timezone`, and `venue` fields.
- Add locale prop.
- Add custom round/status label maps.
- Use `Intl.DateTimeFormat` for display.
- Keep generated labels overridable.

## Acceptance Criteria

- Round labels can be customized.
- Date/time display respects locale and timezone.
- Upcoming matches can show scheduled time and venue.
- Docs include non-English label example.
