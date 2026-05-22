# Security Policy

## Supported versions

Security fixes are applied to the latest release on npm for each `@graph-render/*` package.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security-sensitive reports.

Use GitHub private vulnerability reporting for this repository:

https://github.com/graph-render/graph-render/security/advisories/new

Include:

- A description of the issue and impact
- Steps to reproduce
- Affected package versions
- Any suggested mitigation

We aim to acknowledge reports within a few business days and will coordinate disclosure after a fix is available.

## Scope notes

Graph Render renders user-supplied graph data in SVG/DOM. Consumers are responsible for sanitizing untrusted labels and metadata before passing them into graph nodes. The library does not execute arbitrary HTML from graph props unless a consumer supplies a custom `vertexComponent` that does so.

Graph labels and metadata should be treated as untrusted application data when they originate from APIs, files, user input, or third-party systems. The default SVG string renderer escapes text content, but custom React renderers can render anything their implementation allows. Do not pass unsanitized HTML to custom components, and do not use `dangerouslySetInnerHTML` in custom vertex or edge components unless the HTML has been sanitized by the host application.

SVG export creates downloadable SVG documents from either the core string renderer or the rendered DOM. Consumers should review exported SVGs under their own content-security policy if graph data can contain external URLs, user-controlled labels, or custom renderer output. Applications with strict CSP or download restrictions should provide their own export/download workflow rather than relying on the default browser anchor download behavior.

The packages do not store tokens, secrets, or credentials. If a host application includes sensitive values in graph labels, metadata, renderer props, or exported SVG output, those values are considered application data and may be serialized by export features.
