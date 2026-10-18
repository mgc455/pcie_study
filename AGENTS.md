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
2. First perform a self-review: identify factual contradictions, unclear terminology, shallow explanations, missing or stale sources, and broken navigation. Update `content/self-audit.json` with the actual checks and unresolved findings. Do not label unread content as verified.
3. Pick 2–3 related knowledge blocks, prioritizing factual corrections, missing primary sources and ambiguous normative references. Rotate across foundational protocol concepts, Gen1–Gen7 evolution, capabilities/registers and practical diagnostics; do not remain indefinitely within a single capability family.
3. Inspect relevant local standard pages or official primary sources. Preserve exact version/revision, section, printed page and PDF physical page separately.
4. Deepen mechanism, purpose, roles, requirements, negotiation/configuration, error handling and limitations. Keep examples small and directly connected to the function.
5. Replace broad chapter-background references with directly relevant rules/fields where verified. Never invent exact sections or silently reuse another version's page number.
6. Record what actually changed and unresolved questions; rotate the queue only after meaningful improvement.
7. Run `python scripts/build.py`, `python scripts/check.py`, and JavaScript syntax checks. Inspect the diff before publishing.
8. Publish through the GitHub connector to `mgc455/pcie_study` when authorized access remains available. Preserve remote changes and use a fast-forward update. Do not force-push, change repository visibility, or publish original documents. Report failure accurately while retaining useful local updates.

The scheduled AI task performs research and editing. GitHub Actions builds/checks content; it does not itself research or generate explanations.

## Scope and generation research

The site is a searchable PCIe reference and learning aid covering Gen1 through Gen7. Maintain `content/generations.json` for the generation comparison and learning path, alongside per-feature explanations. Expand the catalogue when a useful topic is missing, preserving all existing IDs. The initial 162 items are a starting index, not a claim of completeness.

For each generation distinguish signaling/rate, encoding and FLIT mode, training/equalization, data-link reliability, transaction/configuration changes, power, virtualization and security. Record first introduction, ECN or separate specification, later revisions, applicability and optional/mandatory status only when supported by the corresponding source. A feature present in a later Base specification was not necessarily first introduced there. Do not assign a feature to a Gen solely by maximum link speed.

Bandwidth must state decimal GB/s, lane count, single direction versus summed directions, and raw versus encoding-adjusted versus application payload. PAM4 already accounts for two bits per symbol in the advertised PCIe GT/s; never multiply by two again. Do not use 128b/130b efficiency for Gen6/Gen7 FLIT traffic. Official announcement/FAQ evidence is an overview; exact normative rules require reading the matching released document, not a draft or another revision's page numbers.

Every daily run should produce useful additions or corrections where reliable material is available, record what was actually checked, and keep unresolved questions visible. Never pad the changelog with cosmetic edits or promise exhaustive correctness. Preserve source and section provenance. Build and run checks, inspect changed public files, publish through the connector, then verify the public site's version and important navigation. Keep the public audit concise and keep private source paths under `.local/`.
