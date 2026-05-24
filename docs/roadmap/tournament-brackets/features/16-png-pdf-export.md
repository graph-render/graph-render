# Feature 16: PNG/PDF Export

## Description

SVG export is a strong start, but tournament admins often need PNG for sharing and PDF for printing/archiving.

## Requirements

- Convert SVG output to PNG client-side.
- Provide optional PDF export path.
- Keep PDF dependency optional.
- Surface export errors clearly.
- Document browser limitations around fonts and images.

## Acceptance Criteria

- User can export SVG and PNG from the toolbar.
- PDF export works when optional dependency is installed.
- Missing optional dependency gives clear error.
- Exported images include match cards and connector lines.
