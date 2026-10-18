# PCIe Study maintenance

The user wants detailed explanations of individual PCIe functions, with versioned protocol chapter/page references. Examples may be short sections inside a function. Do not add a separate case-study area.

## User interaction boundary

Do not control the user's desktop, native Chrome, mouse or keyboard. Use connected APIs/connectors for GitHub. Codex's in-app browser is allowed for preview and web tasks, but routine publication should use the GitHub connector. Never request passwords or tokens in chat.

## Canonical content

- Edit `content/features.json` as the canonical public content. IDs must remain stable.
- Preserve `content/protocols.json`, versioned `protocolReferences`, evidence status, and any existing verified findings.
- `scripts/import_content.py` is an initial migration helper. Do not re-run it over manually improved content.
- Original PDFs/RTL and local paths stay outside Git and the site. `.local/` contains ignored local source pointers. Never upload those files, PDF bodies or manual dumps.
- File-name document indexing is not reading. TOC matching is not a full chapter audit. Mark each honestly.
- Public explanations must not turn one vendor's limitation into a universal protocol requirement.

## Daily improvement

1. Read `content/maintenance.json` and recent `content/changelog.json`.
2. Pick 2–3 related function blocks, prioritizing factual corrections, missing primary sources and ambiguous normative references.
3. Inspect relevant local standard pages or official primary sources. Preserve exact version/revision, section, printed page and PDF physical page separately.
4. Deepen mechanism, purpose, roles, requirements, negotiation/configuration, error handling and limitations. Keep examples small and directly connected to the function.
5. Replace broad chapter-background references with directly relevant rules/fields where verified. Never invent exact sections or silently reuse another version's page number.
6. Record what actually changed and unresolved questions; rotate the queue only after meaningful improvement.
7. Run `python scripts/build.py`, `python scripts/check.py`, and JavaScript syntax checks. Inspect the diff before publishing.
8. Publish through the GitHub connector to `mgc455/pcie_study` when authorized access remains available. Preserve remote changes and use a fast-forward update. Do not force-push, change repository visibility, or publish original documents. Report failure accurately while retaining useful local updates.

The scheduled AI task performs research and editing. GitHub Actions builds/checks content; it does not itself research or generate explanations.
