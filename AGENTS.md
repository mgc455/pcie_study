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
4. Inspect relevant local standard pages or official primary sources. Preserve exact version/revision, section, printed page and PDF physical page separately.
5. Deepen mechanism, purpose, roles, requirements, negotiation/configuration, error handling and limitations. Keep examples small and directly connected to the function.
6. Replace broad chapter-background references with directly relevant rules/fields where verified. Never invent exact sections or silently reuse another version's page number.
7. Record what actually changed and unresolved questions; rotate the queue only after meaningful improvement.
8. Run `python scripts/build.py`, `python scripts/check.py`, and JavaScript syntax checks. Inspect the diff before publishing.
9. Publish through the GitHub connector to `mgc455/pcie_study` when authorized access remains available. Preserve remote changes and use a fast-forward update. Do not force-push, change repository visibility, or publish original documents. Report failure accurately while retaining useful local updates.

The scheduled AI task performs research and editing. GitHub Actions builds/checks content; it does not itself research or generate explanations.

## PHY and SerDes track

The user added local Gen5/Gen6 PHY material and wants PHY/SerDes as a first-class part of the knowledge system. Maintain `content/phy.json` and the appended `PHY与SerDes` feature group as well as protocol topics. Use the supplied Gen5/Gen6 materials through private local source metadata; do not publish source directory names or locations. Their source code, CDL, firmware, circuit diagrams and extracted manual text stay local; publish only authored learning explanations and locator metadata.

Cover MAC/PIPE boundaries, Original versus SerDes architecture, uPCS, product-specific Raw PCS/PMD management, PMA/common/TX/RX, PLL/CDR, TX/RX equalization, clock/reset/bring-up, firmware/memory, power/rate handshakes, PRBS/loopback/BER, signal integrity and model/netlist boundaries. Rotate these topics with existing protocol work each day. Do not silently equate product module names with standard-required partitions. Mark preliminary manuals and product versions. Do not transplant old timing constraints into newer products or assume PIPE version equals PCIe generation.

CDL inspection is read-only unless explicitly requested otherwise. Structural counts are not transistor counts, functional proof, LVS or analog signoff. Do not execute vendor scripts or modify the supplied `fixed` netlist based on its name. Keep detailed source/module inventories, implementation-specific signals, model limitations and evidence under `.local/`. Public content must not reproduce private RTL, netlist fragments, circuit schematics or vendor register dumps.

## Scope and generation research

The site is a searchable PCIe reference and learning aid covering Gen1 through Gen7. Maintain `content/generations.json` for the generation comparison and learning path, alongside per-feature explanations. Expand the catalogue when a useful topic is missing, preserving all existing IDs. The initial 162 items are a starting index, not a claim of completeness.

The reference depth target is individual substates, entry actions, normal and exceptional transition conditions, sequence counts, timers and tolerances, role/encoding/mode limits, field and credit tables, and verified version differences. Use authored Chinese explanations with per-block `referenceIndices` pointing to the feature's versioned references. Preserve stable detail IDs and deep links. Document availability and unread evidence are different: do not call an unread local specification missing. If an official document is truly missing, give its exact name/revision and the question it would resolve. Do not reproduce whole specification chapters or screenshots publicly.

Maintain `content/coverage.json` to follow each Base revision from its main chapters through appendices. Chapter opening locators are an index, not a completed chapter audit. A reviewed block must point to an existing stable detail ID and explicit source indices for that revision/chapter. Do not infer a coverage percentage from reference counts or mark a chapter complete without auditing its clauses, tables, figures and exceptions. Independent specifications and ECNs need their own future coverage records. Manual improvement rounds should grow modestly relative to the previous round and remain publishable; the user will tune the workload from results. Do not pad the number of sections to claim a larger round.

For each generation distinguish signaling/rate, encoding and FLIT mode, training/equalization, data-link reliability, transaction/configuration changes, power, virtualization and security. Record first introduction, ECN or separate specification, later revisions, applicability and optional/mandatory status only when supported by the corresponding source. A feature present in a later Base specification was not necessarily first introduced there. Do not assign a feature to a Gen solely by maximum link speed.

Bandwidth must state decimal GB/s, lane count, single direction versus summed directions, and raw versus encoding-adjusted versus application payload. PAM4 already accounts for two bits per symbol in the advertised PCIe GT/s; never multiply by two again. Do not use 128b/130b efficiency for Gen6/Gen7 FLIT traffic. Official announcement/FAQ evidence is an overview; exact normative rules require reading the matching released document, not a draft or another revision's page numbers.

Every daily run should produce useful additions or corrections where reliable material is available, record what was actually checked, and keep unresolved questions visible. Never pad the changelog with cosmetic edits or promise exhaustive correctness. Preserve source and section provenance. Build and run checks, inspect changed public files, publish through the connector, then verify the public site's version and important navigation. Keep the public audit concise and keep private source paths under `.local/`.

## Current user priority and periodic review (R59 onward)

Follow maintenance.priorityPlan: NFM replay and Data Link initialization first, then INTx/MSI/MSI-X, then AXI/iATU/TLP/DMA; interleave L0p, DOE/TDISP, earlier revisions and PHY. Preserve unresolved branches. Every 4 substantive normal rounds (manual or daily), summarize completed work, remaining gaps and next priorities with reasons. Maintain reviewCadence; retries and targeted fixes do not count twice. R59 starts the first four-round window, with the first review expected around R62. Do not infer full protocol coverage from detail counts.

## V1 finite completion plan (R91 onward; current user direction)

Follow maintenance.releasePlan before older rotating research queues. Scope is the existing 183 feature IDs, with shared explanations reused and version differences explicit. Target R91-R138 (48 planned rounds), reviewed every four substantive rounds, next R94. Do not increase per-round detail counts or grow scope automatically. R91 establishes the ledger; R92 must triage the 117 historical unresolved records into actionable required gaps, supported reuse, validation boundaries and optional later work. Preserve history.

Each feature must satisfy the applicable eight acceptance criteria with concrete evidence. Pending or blocked is not accepted. Mark a criterion not applicable only with an explicit reviewed reason. Merge explanations only with stable target links and preserved unique semantics; preserve old IDs. Never close items from detail/reference counts. Whole-document coverage is not the V1 denominator. Protocol/role/version contradictions and absent required evidence remain blockers; hardware simulation, analog signoff and complete related protocols are outside V1. Missing supplied documents must be distinguished from unread documents.

Update releasePlan.roundLedger, criterion reviews, required gaps and remaining rounds on each substantive round. Report accepted/reopened/remaining units and schedule deviations at R94, R98 and each four-round window. Budget exhaustion is not completion: explicitly report unresolved acceptance blockers, do not silently extend the target or lower requirements. After all required acceptance checks pass, switch to review/fixes; no compulsory new content or research for its own sake. Keep daily automation state and schedule unless the user requests changing them.

R92 baseline triage is complete: follow releasePlan.requiredTasks (21 functional partitions plus 3 shared checks), conflictRegister and legacyTriage. Keep the 117 original audit records unchanged. No feature or conflict was accepted merely by classification. Start R93 with nextExecution (LTR/PME within task 10); R94 review reports task/unit closures, actual remaining gaps and budget variance. The 37 corroboration questions are subproblems of existing tasks, not 37 extra rounds. Do not repeat R91/R92 planning or expand mandatory hardware work.

R93 progressed task10 with LTR core fields/mechanism and retained PME content: 8 criterion reviews passed, zero complete feature units. Follow nextExecution for R94 power dependencies and the required R91-R94 four-round summary. The new LTR ECN bit question is within existing tasks23/10; preserve the original37 plus question38 and do not add a round. Daily automation remains paused by user request.

R94 closed the R91-R94 review window:23 criterion reviews passed cumulatively, zero complete features/tasks;48-round target is not a validated effort forecast. Next reviewR98. Follow nextExecution for R95 enumeration/configuration/BAR batch acceptance. Prioritize checking/reusing mature content; do not require a new calculator or expanding already deep topics per round. Keep38 existing source questions and117 original historical records. Daily automation remains paused.

R95 batch-reviewed enumeration/configuration/BAR:30 new criteria passed,53 cumulative;ECAM48 accepted after seven formal revision body checks. Conflict14 resolved by explicit6.0/7.0 context; preserve all38 records and117 legacy notes. Remaining43 planned rounds; nextR96 PHY163/165/166/167/168, reviewR98. Do not reopen accepted ECAM merely to generate new content; future contradictions may reopen with evidence. Daily automation stays paused.

R96:34 new criteria passed,87 cumulative;166/167 product-partition topics accepted with explicit Gen5/Gen6 scope,3/183 accepted total. Do not reinterpret vendor internal names as Gen1-Gen7 mandatory structure. Added relatedDetails links must resolve to stable existing IDs. NextR97 interrupt partition per nextExecution; reviewR98,42 planned rounds remain. Daily automation stays paused.

R97:34 new criteria passed,121 cumulative;55 MSI-X Capability/Table/PBA/Mask accepted with seven-revision source map and 2003 ECNs. Official Base4.0 Errata2019-08-19 B42 resolves conflict33 (Control+02h), B38 corrects omitted EMD drawing fields; keep old detail IDs and117 legacy records.4/183 accepted,41 planned rounds remain. NextR98 remaining interrupt versions/consistency and R95-R98 review. Daily automation stays paused.

R98 review completed:52/53/54/56 accepted after seven-Base/independent-ECN and SR-IOV1.0/1.1 interrupt checks;8 new criteria,129 cumulative,8/183 accepted. R95-R98 closed8 features and106 criteria;175 features and24 tasks remain (0 grouped tasks closed),38 source questions retained with2 resolved/36 pending.40 planned rounds remain; observed2 accepted features/round versus4.375 required, so R138 is at risk, not promised or silently extended. NextR99 batch review57/58/60/61 Message/VDM/DRS/FRS; next four-round reviewR102. Reuse mature source/diagrams/tools; add only actual gaps, keep fixed scope and old IDs. Daily automation stays paused.

R99 actual IDs corrected:60 is ERR messages,61 combines DRS/FRS/RTR (R98 nextExecution labels were wrong);58/60/61 had only summaries, so reused mature AER/reset material and added their unique fields.57/58/60 accepted;61 core6 criteria passed, versions/consistency pending, so task06 remains open.28 new criteria,157 cumulative;11/183 accepted,172 remain,39 planned rounds. RTR6.0 p1265 formula Value*32^Scale ns conflicts with80Ah example10.240ms (formula10.48576ms); do not silently correct, verify7.0/errata next. Source docs3.1/3.1a/4/5/6/7 already local, not missing. NextR100:61 first, then87/88/89 mature power version/consistency; reviewR102. No new mandatory scope; daily automation stays paused.

R100:87/88 accepted after L1SS ECN/3.1/4/5 and existing6/7 version/consistency review;6 new criteria,163 cumulative,13/183 accepted,170 remain,38 planned rounds.61/89 version criteria passed; each retains consistency blocker.3.1a Errata B235 p17 changes40Ah to80Ah but retains10.240ms example inconsistent with32^Scale ns;7.0 p1438 still shows it. Do not call this resolved or repeatedly rewrite RN. LTR2025 ECN bit0 versus formal7.0 bit1 remains open. NextR10184/85/86/90 mature power batch, verify actual IDs; R102 four-round review. Keep fixed scope and daily automation paused.

R101:84/85/86/90 accepted after seven formal Base selected power bodies plus2009 ASPM Optionality/OBFF ECNs and3.1a B234.30 new criteria,193 cumulative,17/183 accepted,166 remain,37 planned rounds. Corrected D3Hot default10ms text: applicable FRS/valid RTR/platform mechanisms can permit earlier access; no D2 RTR field, no event substitution.2009 ASPM Optionality makes L0s support optional and actual entry recommended; Base3.0 history confirms incorporation.12h OBFF Message Code differs from4bit OBFF Code.61 RTR numeric and89 ECN bit source conflicts stay open. NextR10293/94/95 reset group and mandatory R99-R102 review; no added scope or automatic target extension, daily remains paused.

R102 review:93/94/95 accepted, first functional task11 closed.24 new criteria,217 cumulative,20/183 accepted,163 remain;23 grouped/shared tasks open and36 planned rounds. R99-R102 closed12 features/88 criteria; observed3 units/round versus163/36 needed, mechanical55-round extrapolation is risk only, not new commitment. R101 repair commit9dc2a66792d14404274ea414a85b9bb538be3d24 passed CI/Pages. Reset limits differ:1.0a80ms, formal2/3/4/5 Detect20ms,6/7 capability-dependent20/100ms; system100ms/config readiness is different. FLR PF/VF mandatory exception and PF FLR disabling VFs/7.0 SDIs now explicit; read0 trigger is not completion.5.0 ARI/L1SS/LTR/PTM preservation recommendation versus6/7 MUST@FLIT kept.61/89 source conflicts remain. NextR10341/47/163/165/168 core-ready units, later mature error/transaction batches; R106 review. Do not grow fixed scope or silently extend target, daily stays paused.

R103: accepted[41, 47, 163, 165, 168], new criteria10, cumulative25/183 and227 criteria;158 units/35 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR104[97, 98, 105]; R106 review, daily paused. User authorized two rounds103/104, independent content/check records, combined final publicationR104.

R104: accepted[97, 98, 105], new criteria24, cumulative28/183 and251 criteria;155 units/34 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR105[42, 43, 44, 45, 46]; R106 review, daily paused. User authorized two rounds103/104, independent content/check records, combined final publicationR104.

R105: accepted[42, 44, 45], new criteria24, cumulative31/183 and275 criteria;152 units/33 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR106[43, 46]; R106 review, daily paused. User authorized two rounds105/106, independent content/check records, combined final publicationR106.

R106: accepted[43, 46], new criteria12, cumulative33/183 and287 criteria;150 units/32 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR107[36, 38, 39, 37, 40]; R106 review, daily paused. User authorized two rounds105/106, independent content/check records, combined final publicationR106.

R106 review complete: R103-R106 accepted13 units/70 criteria, cumulative33/183 and287;150 units/32 budget rounds remain,23 tasks open. Observed3.25/round vs4.6875 required; mechanical47-round extrapolation is risk only. NextR107 mature36/38/39/37/40; next reviewR110, daily paused. Original117 history/38 questions retained.

R107: accepted[36, 37, 38, 39, 40], new criteria34, cumulative38/183 and321 criteria;145 units/31 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR108[49, 50, 51]; R110 review, daily paused. Manual R107; daily paused, next review R110.

R108: accepted[49, 50], new criteria16, cumulative40/183 and337 criteria;143 units/30 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR109[51]; R110 review, daily paused. User authorized R108/R109; independent checks, combined final R109 publication; repair unpublished R107 from its remote baseline.

R109: accepted[51], new criteria8, cumulative41/183 and345 criteria;142 units/29 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR110[63, 64, 65]; R110 review, daily paused. User authorized R108/R109; independent checks, combined final R109 publication; repair unpublished R107 from its remote baseline.

R109: task05 closed after all16 units accepted and its conflicts resolved;22 grouped/shared tasks remain. Cumulative41/183,345 criteria;142 units/29budget rounds. R110 next ARI63/SRIOV64/VF65 and mandatory R107-R110 summary. Repair unpublishedR107 together withR108/R109 from round107_before remote baseline; upload retry is not a round. Daily paused.

R110: accepted[63, 64, 65], new criteria24, cumulative44/183 and369 criteria;139 units/28 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR111[62, 66, 67]; R114 review, daily paused. User authorized R110/R111; independent content checks, combined final R111 publication; R110 includes four-round summary.

R110 review completed: R107-R110 accepted11 units/82 criteria; task05 closed,22 tasks remain. Cumulative44/183,369 criteria;139 units/28 budget rounds. Observed2.75 vs4.964 required;51-round extrapolation is risk only. NextR111 62/66/67; next reviewR114. Daily paused;117 historical and38 source records retained.

R111: accepted[62, 66, 67], new criteria24, cumulative47/183 and393 criteria;136 units/27 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR112[68, 69, 70, 71]; R114 review, daily paused. User authorized R110/R111; independent content checks, combined final R111 publication; R110 includes four-round summary.

R112: accepted[68, 69], new criteria16, cumulative49/183 and409 criteria;134 units/26 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR113[70, 71]; R114 review, daily paused. User authorized R112/R113; independent checks, combinedR113 publication repairsR110/R111.

R113: accepted[70, 71], new criteria16, cumulative51/183 and425 criteria;132 units/25 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR114[72, 73, 83]; R114 review, daily paused. User authorized R112/R113; independent checks, combinedR113 publication repairsR110/R111.

R114: accepted[72, 73, 83], new criteria24, cumulative54/183 and449 criteria;129 units/24 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR115[74, 75, 76]; R118 review, daily paused. User authorized R114/R115 after successful R113 repair; independent checks, combined R115 publication.

R114 review: R111-R114 accepted10 units/80 criteria; tasks07/08 closed,20 tasks remain. Cumulative54/183 and449 criteria;129 units/24budget rounds, observed2.5/round vs5.375 required;52-round extrapolation risk only. NextR11574/75/76; nextsummaryR118; daily paused. R113 repair707a7ab CI/Pages success/index byte match; full-data HTTP timed out/approval-review-service failed, no bypass.

R115: accepted[74, 76], new criteria22, cumulative56/183 and471 criteria;127 units/23 budget rounds remain. Scope/roles per new detail blocks,61/89 unresolved sources retained. NextR116[77, 78, 79, 80, 81, 82, 108]; R118 review, daily paused. User authorized R114/R115 after successful R113 repair; independent checks, combined R115 publication.
