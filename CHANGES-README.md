# MCQ Lag Fix — What Changed and Why

This is a drop-in patch: replace the matching files in your repo with the
versions in this folder (same relative paths). No database migration,
no new collection, no data loss risk — every change is either additive
(new routes, kept old ones) or a targeted update to how the *existing*
`Section.mcqs` / `Test.mcqs` arrays get written to.

**Your "auto-share verbal/non-verbal to all 3 default categories" feature
is untouched.** That works by pointing Army/Navy/Air Force's `sectionRef`
at the *same* `Section` document — this patch only changes how that one
document's `mcqs` array gets updated, not the sharing mechanism itself.
Import once, it still applies to all three, exactly as today.

## The core problem in one sentence

Every keystroke while editing an MCQ was debounced (800ms) into a request
that resent the **entire** section's `mcqs` array — every question,
every option, already-saved and new — just to persist one character.
Cost scaled with total MCQs in the section, not with what changed.

## What changed, file by file

### Backend

- **`server/utils/incrementalMcqRoutes.js`** *(new)*
  A small factory that adds three routes per section type:
  - `PATCH .../:type/mcq/:testId` — save **one** MCQ by index (no other
    MCQ is read or rewritten)
  - `POST .../:type/mcq-batch/:testId` — append N blank MCQs via `$push`
    (doesn't touch existing ones)
  - `PATCH .../:type/mcq-truncate/:testId` — shrink to N MCQs via `$slice`

- **`server/routes/adminTests.js`** — wires the above in for the
  default categories (Army/Navy/Air Force), mounted under
  `/api/admin/sections/:type/...`. All existing routes are untouched.

- **`server/routes/adminFreeMockTests.js`** — same, for Free Mock Tests,
  mounted under `/api/admin/free-mock-tests/sections/:type/...`
  (`nonverbal` lowercase, matching your existing route naming there).

- **`server/controllers/customTestController.js`** — added
  `addMcqsBatch`, which appends only the *new* batch via `$push` instead
  of replacing the whole `test.mcqs` array. The old `addMcqs` (full
  replace) is kept as-is, still used by the JSON-import path.

- **`server/routes/testGroupRoutes.js`** — registers the new
  `POST /custom-tests/:testId/mcqs/batch` route alongside the existing one.

### Frontend

- **`MCQContainer.jsx`** — wrapped in `React.memo`. Its `onChange` prop
  contract changed from `onChange(updatedMcq)` to `onChange(index, updatedMcq)`
  so the parent can pass one stable function instead of a new closure per
  card (memoizing the component alone wouldn't have helped — a new inline
  arrow function every render defeats `memo` regardless).

- **`MCQList.jsx`** — `handleMCQChange` is now built with `useCallback` +
  refs so its identity **never changes** across renders — that's what
  actually lets `MCQContainer`'s memoization skip re-rendering the other
  199 cards when you type in one of them. Also added two new optional
  props: `onMcqEdit(index, mcq)` (fires per single-MCQ edit) and
  `onAddBatch(count)` (fires when "Add MCQs" is clicked), so the parent
  page can route those through the lightweight endpoints above.

- **`useSectionPage.js`** (shared hook for Verbal/Non-Verbal/Academic,
  both premium and Free Mock) — this had the actual lag bug:
  - `handleMcqsChange` no longer POSTs the whole array on every keystroke
    — it's local-state-only now (instant UI feedback, no network per key).
  - New `handleSingleMcqEdit(index, mcq)` debounces **per MCQ index**
    (so editing #5 then #40 saves both) and PATCHes just that one MCQ.
  - New `handleAddMcqBatch(count)` calls the `$push` batch-add endpoint.
  - `handleReduceConfirm` now calls the truncate endpoint instead of
    resending the shrunk array.
  - `flushAutoSave` (called right before final "Save Section") now also
    flushes any pending per-MCQ edits immediately, so a fast
    type-then-click-Save can't lose the last edit.
  - JSON import is untouched — it's already a single deliberate bulk
    action, not a per-keystroke one, so resending the full set there is
    fine (as you noted, that's the fallback you're comfortable with).

- **`AdminCustomTestPage.jsx`** (standalone/custom-category tests) —
  `handleSaveBatch` now sends only the new slice
  (`mcqs.slice(batchStart, batchEnd)`) to the new `/mcqs/batch` endpoint,
  instead of resending every previously-saved MCQ on every "Save Batch"
  click.

- **`VerbalSectionPage.jsx`, `NonVerbalSectionPage.jsx`,
  `AcademicSectionPage.jsx`, and their three Free Mock equivalents** —
  two-line wiring change each: pass `onMcqEdit={handleSingleMcqEdit}` and
  `onAddBatch={handleAddMcqBatch}` to `<MCQList>`.

## What this does NOT change (on purpose, for this pass)

- No new `Mcq` collection, no migration script, no schema change to
  `Section`/`Test`. Read paths (test-taking, scoring, review, admin
  dashboard counts) are untouched — they still read the same
  `Section.mcqs` / `Test.mcqs` arrays, just written to more cheaply now.
- The 512MB Atlas M0 storage ceiling and the "go to a dedicated `Mcq`
  collection for real 100k+/millions scale" work from the original plan
  is still worth doing later — this patch fixes the *lag you're feeling
  today* at your current scale (hundreds of MCQs per section), cheaply
  and with near-zero risk. Revisit the collection migration when you're
  actually approaching tens of thousands of MCQs per category.

## How to verify it worked

1. Open a Verbal/Non-Verbal/Academic section with 100+ MCQs already saved.
2. Open your browser's Network tab, type a character in MCQ #50's question.
3. After the 800ms debounce, you should see **one** small `PATCH .../mcq/<testId>`
   request with a single MCQ's payload — not a `POST .../draft` with a
   multi-hundred-KB body.
4. Click "Add MCQs" — you should see a `POST .../mcq-batch/<testId>` with
   just `{ count: 10, ... }`, not the full existing array.
5. For AdminCustomTestPage: save a batch, then check the request body only
   contains that batch's 10 MCQs, not all previously-saved ones.
