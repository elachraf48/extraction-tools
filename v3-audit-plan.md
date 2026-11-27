# V3 Full Audit & Optimization Plan

## Top-Level Overview

Full audit of `v3/` covering critical bug fixes, HTML head cleanup, accessibility, performance, CSS deduplication, and new feature additions. All changes are scoped to `v3/index.html`, `v3/js/script.js`, `v3/js/navigation.js`, `v3/css/dark-mode.css`, and new additions to `v3/js/script.js`.

Work is broken into 5 phases, each independently executable and reviewable.

---

## Phase 1 — Critical Bug Fixes (JS)

**Intent:** Fix broken JavaScript that causes runtime errors and silently wrong behavior.

**Expected Outcomes:**
- `encodeToBase64()` works without syntax error
- All generator functions are globally callable (not trapped inside another function)
- Each of the 3 duplicate function names has exactly one definition that covers all callers

**Todo List:**
1. Fix `encodeToBase64()` split — the function body was split at line 235 by inserting generator code mid-function. Move the orphaned body (`const text = …` through closing `}` at lines 629–636) back into the function at line 235–237, right after `const textarea = …`
2. Remove duplicate `removeDuplicates(emails)` at line 2713 — rename it to `_dedupeEmailsUI(emails)` and update its one caller (the email extraction functions that use it for display side-effects). Keep the pure `removeDuplicates(array)` at line 2048 as the canonical version. Remove the identical copy at line 2955.
3. Remove duplicate `downloadResult(text, file)` at line 2277 — this is the simpler/correct version. The first version (lines 1921–1955) adds alert UI when content is empty; merge its empty-content guard into the line-2277 version, then remove the first version. Update all callers.
4. Remove duplicate `checkinputText(dialogueContent)` at line 2186 — this is a weaker version (only sets innerHTML). Keep the first version (lines 1873–1894) which creates a proper Bootstrap alert. Remove the second definition at line 2186.

**Relevant Context:**
- `encodeToBase64` opens at `v3/js/script.js:235`, orphaned body at lines 629–636
- Generator block injected at lines 238–626 (all currently nested inside `encodeToBase64`)
- `removeDuplicates` at lines 2048, 2713, 2955
- `downloadResult` at lines 1921, 2277
- `checkinputText` at lines 1873, 2186

**Status:** [ ] pending

---

## Phase 2 — HTML Head Cleanup

**Intent:** Fix duplicate/conflicting meta tags, add missing essentials, remove unused CDN dependency, fix typo.

**Expected Outcomes:**
- Exactly one `og:title`, one `twitter:title`, one `description`, one `keywords`, one `author` meta tag
- `<meta charset="UTF-8">` present as first tag in `<head>`
- Axios CDN `<script>` removed
- Navbar "Notpade" typo fixed to "Notepad"
- Duplicate `.dark-mode` and `.dark-mode .navbar` CSS rules merged

**Todo List:**
1. In `index.html` lines 46–88: collapse all duplicate meta tags into one clean set:
   - Single `og:title`: "Extraction Tools — IP, Email & Text Utilities"
   - Single `twitter:title`: same
   - Single `og:description`: best combined description
   - Single `description`: same content
   - Single `keywords`: combined unique keywords
   - Single `author`: "achraf48"
   - Keep `og:image`, `og:locale`, `og:type`, `og:site_name`, `twitter:card`, `twitter:description`
2. Add `<meta charset="UTF-8">` as very first tag inside `<head>` (before line 5)
3. Remove axios script tag at `index.html` line 1100: `<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>`
4. Fix typo at `index.html` line 139: "Notpade" → "Notepad"
5. In `v3/css/dark-mode.css`: merge the two `.dark-mode` rules (lines 2–12) into one, merge the two `.dark-mode .navbar` rules (lines 14–23) into one keeping the stronger gradient version

**Relevant Context:**
- Duplicate metas at `index.html` lines 46–88
- Axios at `index.html` line 1100
- Typo at `index.html` line 139
- Duplicate CSS rules at `dark-mode.css` lines 2–23

**Status:** [ ] pending

---

## Phase 3 — Accessibility

**Intent:** Make icon-only buttons screen-reader accessible and fix missing/empty alt text.

**Expected Outcomes:**
- Every button that contains only an `<i>` icon has an `aria-label` describing its action
- All `<img>` tags have meaningful (non-empty) `alt` attributes
- Key textareas have `aria-label` or associated `<label>`

**Todo List:**
1. Add `aria-label` to these icon-only buttons in `index.html`:
   - Dark mode toggle button (line ~158): `aria-label="Toggle dark mode"`
   - Shuffle button `#sufull` (line ~433): `aria-label="Shuffle lines"`
   - Extract Gmail button (line ~437): `aria-label="Extract Gmail addresses"`
   - Remove duplicate button (line ~513): `aria-label="Remove duplicates"`
   - Shuffle lines button (line ~524): `aria-label="Shuffle lines"`
   - Copy button (line ~547): `aria-label="Copy result"`
   - Download button (line ~550): `aria-label="Download result"`
   - Sort button (line ~527): `aria-label="Sort results"`
   - Format text button (line ~811): `aria-label="Format text"`
   - Clear text button (line ~814): `aria-label="Clear text"`
   - Copy output button (line ~871): `aria-label="Copy output"`
2. Fix `alt` attributes:
   - Navbar brand image (line ~96): `alt="Extraction Tools logo"`
   - Telegram icon in contact modal (line ~183): `alt="Telegram"`
   - Email icon in contact modal (line ~186): `alt="Email"`
   - About section image (line ~356): `alt="Achraf — creator of Extraction Tools"`

**Relevant Context:**
- Icon buttons scattered across `index.html` extraction section (lines 430–555) and fixage section (lines 808–872)
- Images at lines 96, 183, 186, 356

**Status:** [ ] pending

---

## Phase 4 — Performance Optimizations

**Intent:** Reduce render-blocking, eliminate unused payload, clean unused CSS.

**Expected Outcomes:**
- Bootstrap and jQuery no longer block first paint
- No unused script tags remain
- `index.css` removed from filesystem (not linked so harmless, but tidy)
- All local `<script>` tags at bottom of body use `defer` where applicable

**Todo List:**
1. Add `defer` attribute to Bootstrap JS and jQuery in `<head>` (lines 20–21 of `index.html`) — OR move them to just before `</body>` where the other scripts are. Moving to bottom is safer since Bootstrap and jQuery are used throughout.
2. Confirm axios removal was done in Phase 2 (cross-check)
3. Add `defer` to all local JS script tags at bottom of body (`js/utils.js`, `js/navigation.js`, `js/notepad.js`, `js/ui-fixes.js`, `js/script.js`, `js/menu.js`, `js/alerts.js`) — these are already at bottom of body so `defer` is optional but add it for consistency
4. Remove `v3/index.css` file (it is not linked in `index.html` and appears to be a leftover)

**Relevant Context:**
- Bootstrap/jQuery sync loads at `index.html` lines 20–21
- Local scripts at `index.html` lines ~1097–1108
- `v3/index.css` exists but not referenced

**Status:** [ ] pending

---

## Phase 5 — New Features

**Intent:** Add 5 high-value features that improve usability across the whole app.

**Expected Outcomes:**
- All `alert()` calls in script.js replaced with Bootstrap toasts
- Live line/char counter on main extraction textarea and split textarea
- "Export as JSON" button added to extraction results
- Keyboard shortcuts working for most-used actions
- Drag-and-drop file input on file upload areas

### Sub-feature 5A — Replace `alert()` with Toast Notifications

**Todo List:**
1. Create a shared `showToast(message, type)` function in `script.js` (type = 'success'|'danger'|'warning'|'info')
2. Search `script.js` for all bare `alert(` calls — replace each with `showToast()`
3. The fixage section already uses Bootstrap toasts as a pattern — reuse that exact pattern

**Relevant Context:**
- Existing toast pattern at `script.js` lines ~284–302 (fixage generate button)
- Raw `alert()` calls found throughout extractor functions

### Sub-feature 5B — Live Line Counter on Textareas

**Todo List:**
1. Add a small `<span class="live-counter text-muted">` beneath the main `#text` textarea (extraction) and `#input-text` textarea (split)
2. Wire them to `input` events that update `Lines: N | Chars: N` in real time
3. Style with a small utility CSS rule in `utilities.css`

**Relevant Context:**
- `#text` textarea at `index.html` line ~555
- `#input-text` textarea at `index.html` line ~429
- Existing `countLines()` and `countLiness()` functions already fire on input (lines 1858–1872 of `script.js`) — just need visible counter spans

### Sub-feature 5C — Export Extraction Results as JSON

**Todo List:**
1. Add a "JSON" button to the extraction toolbar (next to the existing download button)
2. Create `downloadAsJson()` function: reads `#text` textarea, splits by newline, produces `{"results": [...]}` JSON, downloads as `.json` file
3. Add to the toolbar dropdown next to the existing sort dropdown

**Relevant Context:**
- Extraction toolbar at `index.html` lines ~506–555
- Existing `download()` function in `script.js` for reference on how download is done

### Sub-feature 5D — Keyboard Shortcuts

**Todo List:**
1. Add a `keydown` listener in `script.js` (DOMContentLoaded) for:
   - `Ctrl+Shift+C` → copy active section's output textarea
   - `Ctrl+Shift+D` → download active section's output
   - `Ctrl+Shift+X` → clear active textarea
   - `Escape` → close any open modal/offcanvas
2. Show a small keyboard shortcut legend at the bottom of each active section (collapsible)

**Relevant Context:**
- Existing `keydown` listener in `script.js` at line ~2630 (for Escape on notepad) — extend it
- `showSection()` in `navigation.js` tracks active section

### Sub-feature 5E — Drag and Drop File Input

**Todo List:**
1. Add drag-and-drop zone styling around the existing `<input type="file" id="inputGroupFile01">` in the extraction section
2. Wire `dragover`, `dragleave`, `drop` events: on drop, extract `event.dataTransfer.files[0]` and assign to the file input, then trigger the existing file processing logic
3. Add `drop-zone` CSS class with dashed border + hover highlight in `utilities.css`
4. Apply same pattern to the split section file input (`#fileInputsw50`)

**Relevant Context:**
- File input at `index.html` line ~509
- Split file input at `index.html` line ~302
- No existing drag-drop code — needs to be written fresh

**Status:** [ ] pending (all sub-features)

---

## Implementation Order

```
Phase 1 (critical bugs) → Phase 2 (HTML cleanup) → Phase 3 (accessibility)
→ Phase 4 (performance) → Phase 5A (toasts) → Phase 5B (counters)
→ Phase 5C (JSON export) → Phase 5D (shortcuts) → Phase 5E (drag-drop)
```

Each phase is implemented and reviewed independently before the next begins.
