# TODO: Component-based releases and incremental upload

**Project:** LOTRO Log Book, website only
**Status as of:** 17 November 2026
**Status:** local implementation present; full live acceptance and
publication approval still open
**Intended project path:** `lotro-log-book/docs/todos/release-komponenten.md`

Plugin, personal character data and game installation stay untouched.

The local implementation consists of `tools/release_components.py`, the extended
`tools/build_release.py` and the manifest-based path in `upload.py`.
A real upload or a hosting change is not approved by it.

## 1. Goal

Detect and publish program, data and asset updates separately.
A CSS update must neither run through all terrain tiles locally nor have to
list their directories recursively via FTPS.

The complete release stays checkable and reproducible. Partial uploads
confirm exclusively the components actually published.
Manual „Assets geändert“ or „Daten geändert“ flags are not needed.

## 2. Checked starting point

- `tools/build_release.py` creates a complete release folder.
  It copies web files, maps, terrain, PHP, libraries and `phpdata`,
  creates previews, tracking and an empty progress file.
- `upload.py` has a SHA-256 comparison and a local upload state under
  `~/.config/mql-upload-state.json`.
- The previous comparison reads the remote state recursively via `LIST`.
  `--nur` and `--ohne` filter local files by top path segment,
  but so far do not automatically limit this complete remote inventory.
- `phpdata/manifest.json` describes the data format, languages and catalogue kinds,
  not the complete published file set.
- The terrain manifest has its own domain version. This is retained.
- Data is not automatically exported completely anew just because a
  release is built.
- In the check on 16.11. a release had around 97.780 selected files;
  a complete pre-comparison reported 4.300 changes and 223,6 MB.
- A later stocktaking additionally showed nested folders
  `release-2026-11-16` and `release-2026-11-17` in the release target. Clarify origin and
  current use before further work; do not delete unchecked.
- Sizes and file counts are dated observations, not fixed target values.

### Runtime stays unchanged

An item URL is resolved by PHP. `Data::page()` reads the matching
JSON shard, `Page::render()` passes the model to Twig. There is not
a separate PHP file for every item. The change concerns build and publication,
not this rendering model.

## 3. Scope

Included:

- central file classification;
- deterministic build manifest;
- server-side confirmed deployment state;
- selection and upload of changed files without a global FTP inventory;
- error handling, resumption, lock, versioning;
- tests, operational documentation and migration.

Not included:

- switch to a database or other hosting;
- merging the JSON shards;
- new DAT export;
- automatic deletion of old server files;
- atomic switchover of the whole website;
- unrequested upload or change of the current publication;
- early changes to the plugin.

## 4. Central component rules

One shared Python module is used by builder and uploader.
It classifies relative publication paths explicitly.
No lists that differ from each other in several tools.

### Program

- PHP code, Twig templates and deployable entry point;
- Composer runtime libraries under `vendor/`;
- CSS and actually executable application JavaScript code;
- page shell, error page, legal texts, tracking and `robots.txt`.

### Data

- `phpdata/` including the domain data manifest;
- generated catalogue, search, recipe, reputation, area and instance data;
- generated compact map data and language catalogues, insofar as they are data;
- `vorkommen/`, `notizen/` and their generated entry scripts.

### Assets

- `bild/`, item icons, social previews;
- `karten/` including preview images;
- `gelaende/` including domain terrain manifests.

### Special rules

- `*.js` is not a sufficient program rule: `app.js` is code,
  `daten-de.js` is data.
- UI translations belong versioned together with the associated program code;
  domain translated catalogues belong to data.
- The empty `fortschritt.js` is a defined program stub.
- Domain manifests remain part of their component.
- The new release manifest is not counted into its own content versions.
- Runtime cache, statistics files, credentials, upload journals, personal
  progress, tests and old release copies are not delivered.
- Every permitted release path belongs to exactly one component.
- Unknown or ambiguous paths block the build with a concrete message.
- Inventory all current root files before implementation. The preceding groups
  are domain rules, not an already complete technical allowlist.

## 5. Build manifest and version formation

New file in the build: `release-manifest.json`.

Content:

- manifest format version;
- build identifier and UTC creation time as metadata;
- per component content version and count/bytes;
- per file normalised relative path, component, size, SHA-256;
- explicit data format/compatibility requirements;
- where needed, explicit required publication paths.

Example structure, fix the exact serialisation at implementation:

```json
{
  "schema": 1,
  "build": "2026-11-17T120000Z",
  "components": {
    "programm": {"version": "<sha256>"},
    "daten": {"version": "<sha256>"},
    "assets": {"version": "<sha256>"}
  },
  "files": {
    "gemeinsam.css": {
      "component": "programm",
      "size": 12345,
      "sha256": "<sha256>"
    }
  },
  "compatibility": {}
}
```

Version = SHA-256 of a canonically serialised list of path, size and file hash
of a component, sorted by path. Timestamps, build identifier,
absolute paths and file system order do not influence the version.
Store complete hashes, use short prefixes for displays.

The builder hashes files, the uploader takes over these hashes. Before sending,
verify that the selected file still matches the manifest.
A build changed during the upload must not be confirmed.

## 6. Published server state

Store deployment metadata in a separate private directory.
Preferably outside the document root, if the FTPS access permits this.
Alternatively a path in the document root explicitly protected by hosting configuration.
Verify the concrete path against the hosting, do not assume it.

Store:

- metadata format version and revision of the deployment state;
- last completely confirmed version per component;
- file hashes of the confirmed stock;
- build origin and confirmation time per component;
- incomplete upload with transaction identifier and progress.

A partial release can combine components of different builds. The
server state must express that; not declare an old overall build as current.

Writing mode: upload new metadata under a temporary name and rename after checking.
Test the behaviour of the host on rename/replace. The last valid
state must be retained on a write error. The metadata confirmation is
no assurance of an atomic update of the whole website.

## 7. Change detection and CLI

Proposed interface:

```bash
python3 upload.py --quelle <release> --gruppe programm --dry-run
python3 upload.py --quelle <release> --gruppe daten
python3 upload.py --quelle <release> --gruppe assets
python3 upload.py --quelle <release> --gruppe programm,daten
python3 upload.py --quelle <release> --gruppe alle
```

Without a group selection: offer all changed components of the checked build.
An unchanged component hash ends the comparison of this component.
On changes, compare only manifest file entries, no complete
remote directory listing.

The preview shows:

- selected, unchanged and excluded components;
- file changes, new files and transfer bytes;
- dependencies and blocking conflicts;
- dropped paths as a message, without deletion;
- a note about incomplete or otherwise changed server states.

`--nur`/`--ohne` retain or replace in a controlled way. Do not evaluate
combinations with `--gruppe` silently ambiguously. A single file upload
marks a component as complete only if its entire target stock
has demonstrably been reached; otherwise record it as a partial state.

`--dry-run` must change neither remote state nor locks or local confirmed
version states.

## 8. Dependencies and publication order

No blanket assumption „Programm kann immer alleine hochgeladen werden“.

- Data format contract: program declares supported schema versions;
  data declares its format.
- New referenced asset/data paths: prove existence in the confirmed server stock
  or in the same upload selection.
- Name all affected components of a change explicitly in the preview plan.
- The automatic path check only knows recorded dependencies. It replaces
  neither tests nor an acceptance; dynamic JavaScript references are not
  completely provable by searching arbitrary text.

Publish new dependencies before their consumers:

1. required new images/tiles/data blocks;
2. indices, programs and templates referring to them;
3. activating manifests, insofar as the existing application supports that;
4. deployment confirmation after completion and check.

Publish the domain terrain manifest only after its referenced tiles.
New referenced item icons before the associated data.
On cyclic or incompatible schema changes, abort and require a separate
backward-compatible migration procedure.

## 9. Upload, errors and resumption

Acquire an exclusive server-side upload lock before write operations.
Check a suitable FTPS operation and its exclusivity on the host
(e.g. directory creation). Do not lock only locally.

The lock contains identifier, start time and intended components, no secrets.
A parallel upload is rejected. Remove orphaned locks only after express
checking/approval; no automatic forceful takeover.

For changed files:

- where supported, upload temporarily in the target directory and rename;
- check successful FTPS response and final remote size;
- record the result in the resumption journal;
- do not confirm a new group version after errors.

File transfer has failed overall on thread errors. Exceptions
from workers must arrive in the main process and force an exit code not equal to zero.
No mere success message after a failed background worker.

On abort the confirmed previous version is retained, but the state
is reported as partly changed/incomplete. The server can
already contain mixed files. Resumption verifies journal entries
at least against remote size and intended hash state; do not skip blindly.

Claim remote SHA-256 only if the host offers a reliably checked
hash function. FTPS success plus size is no complete independent
remote content check. Additionally HTTP checks and optional download comparison.

## 10. Meaning of „synchronisiert“

A component is synchronised when its complete built target stock
has been published and checked successfully and its version is confirmed.

That does not say:

- that source data was freshly exported from the game;
- that excluded components are also current;
- that unmanaged old files were deleted;
- that nobody changed server files manually afterwards.

Example display:

```text
Programm: synchronisiert, Version …
Daten: unverändert, Version …
Assets: nicht ausgewählt; bestätigte Version …
Upload: erfolgreich, 1 Datei übertragen
```

Never present a missing component confirmation as „alles aktuell“.

## 11. Migration and full control run

- Preserve and back up the existing local upload history.
- Do not replace existing domain manifests by the deployment manifest.
- If the server manifest is missing, run an initial stock comparison explicitly.
- A local hash plus equal remote size does not prove identical
  remote content. For a reliable first confirmation, verify files
  (download/hash) or deliberately transfer them anew. Taking trust from the
  previous history only as an expressly marked weaker option.
- A damaged or unknown manifest version blocks the fast upload.
  No silent fallback to „synchronisiert“.
- Separate audit mode for manual server changes: inventory and, as
  needed, content comparison, with a note on effort.
- Partial updates delete nothing. Orphan check only from the complete
  target stock; deletion remains its own expressly approved operation.
- Fallback: keep old deployment metadata and matching release sources.
  A real rollback requires retransferring old files, not merely
  resetting a version number.

## 12. Build strategy and safety

Stage 1 keeps the complete build and its checks. Fast upload
and fast build are separate goals.

Check beforehand:

- use only dedicated, dispensable build targets;
- reject source/target/subdirectory conflicts before the previous `rmtree`;
- do not include old release copies, cache and runtime data recursively;
- check the complete release before creating the manifest;
- create the manifest only after completion of all content generators.

No deletion of unknown stocks as part of this work order.

Stage 2 only after measurement: incremental assembly of unchanged assets
and reliable hash caching. Always retain a complete preview/check stock;
do not use three incomplete websites as a test basis.

## 13. Test concept

### Unit tests: classification and manifest

- [x] Every permitted path belongs to exactly one component.
- [x] Program JavaScript and generated data JavaScripts correctly separated.
- [x] Resource occurrences/map notes data; images and terrain manifest assets.
- [x] Unknown and ambiguous paths are rejected.
- [x] Identical content yields the same version despite different order/timestamps.
- [x] A change of only one component changes only its version.
- [x] New and dropped path change the matching version.
- [x] Manifest has no self-reference; canonical serialisation stable.
- [x] Reject absolute paths, `..`, symlinks outside the build and private data.
- [x] Nested release copies and runtime cache are not delivered.
- [x] A build file changed during the upload is detected.

### Integration: simulated FTPS server

Tests must run without production credentials and without live write access.
An instrumented fake checks calls; a local FTP/FTPS test server
checks in particular rename, error responses and resumption realistically.

- [x] Unchanged release: zero file transfers.
- [x] One CSS change: only one program file plus necessary deployment metadata.
- [x] Item change: only actually changed data files.
- [ ] New item icon before the data state referring to it.
- [x] Timestamp change alone: zero file transfers.
- [x] Program update calls no recursive asset inventory.
- [x] Partial update retains the version states of all other components.
- [ ] Single file upload does not claim a complete component state.
- [x] Network abort, wrong remote size and rename errors prevent confirmation.
- [x] Worker errors lead to an error exit code and no false success.
- [x] Resumption sends missing files and checks existing journal entries.
- [x] A server state changed during an upload is detected as a conflict.
- [x] A parallel lock is rejected; an orphaned lock is not removed automatically.
- [x] Missing/damaged manifest requires migration or error handling.
- [x] An interrupted metadata confirmation leaves the last valid state retained.
- [x] Partial updates delete no remote files.
- [x] Dry-run writes neither lock nor journal/confirmation.
- [x] Missing declared dependencies block the upload.
- [ ] The domain terrain manifest is only activated after its tiles.

### Existing website tests

- [ ] Continue existing Python/Node/PHP tests unchanged.
- [ ] Extend the builder check by manifest, exclusions and component coverage.
- [ ] Check the complete built release locally in DE/EN/FR.
- [ ] Sample item, quest, search, quest finder, adventure and crafting.
- [ ] On visible changes check desktop/mobile and relevant import states.
- [ ] Neither overwrite personal character progress nor take it into artefacts.

### First approved live acceptance

- [ ] Check the protection of the deployment metadata via HTTP, without exposing contents.
- [ ] Exclusive lock and atomic metadata replacement verified on the host.
- [ ] Pure program update: load CSS/PHP/JS; no missing assets.
- [ ] Data update: item and quest including references, DE/EN/FR.
- [ ] Asset update: icon, game map and terrain including the new manifest.
- [ ] On Twig changes, clear the cache after upload and check pages again.
- [ ] Compare the success status against the server manifest and selected files.

### Performance measurement

- [ ] Log build time separately from comparison, network and transfer.
- [ ] Record the number of `LIST`, `SIZE`, `STOR` and metadata operations.
- [ ] Compare the unchanged, CSS, data and asset case with the same stock.
- [ ] Prove for program updates: no operations on unchanged
      asset file trees; effort does not depend on their file count.
- [ ] Do not promise a concrete speedup before measured values exist.

## 14. Implementation phases

1. **Inventory:** check current source files, build/release paths, data kinds and
   existing tests; preserve foreign changes.
2. **Contract:** define component rules, manifest formats and compatibility fields;
   write unit tests.
3. **Builder:** create and manifest the complete release safely.
4. **Planning:** manifest comparison, group options and pure preview.
5. **Upload:** limited file transfer, journals, lock and error propagation.
6. **Confirmation:** integrate the protected server state and verification.
7. **Migration/audit:** adopt the existing stock and document the fallback.
8. **Acceptance:** tests, measurements, local overall check; live operation only on
   express publication order.
9. **Documentation:** update README, AGENTS.md and this project TODO with actual
   commands, check results and operational rules.

Presumably affected: `upload.py`, `tools/build_release.py`, a new
shared release module, `tests/test_upload.py`, additional manifest/
release/integration tests and the release documentation. Determine concrete names only
after checking existing patterns.

## 15. Acceptance criteria

The work order is only done when:

- automatic content versions replace manual change flags;
- all release files are classified unambiguously and private data is excluded;
- a program update does not inventory unchanged asset directories;
- successful partial updates confirm exclusively their actual state;
- aborted uploads are resumable and expressly incomplete;
- no new version is confirmed after transfer, worker or check errors;
- dependencies, limits of the FTP verification and non-atomic overall updates
  are handled and documented truthfully;
- migration and a full control run are available;
- all new automated tests and relevant website checks pass;
- no deletion, publication or hosting change happens without approval.
