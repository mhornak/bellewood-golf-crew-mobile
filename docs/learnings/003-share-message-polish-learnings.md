# Iteration 003 — Polish the Share Message Format — Learnings

## What Worked

1. **`AskUserQuestion` for design judgment calls.** The three-question
   pre-iteration checkpoint (maybe-list layout, celebration line,
   tag-line treatment) surfaced real preferences instead of guessing.
   Same pattern is worth reusing any time an iteration's scope hinges
   on subjective formatting decisions rather than technical ones.

2. **Bucketing into three arrays first, then rendering each section
   separately.** Cleaner than the old "single forEach with branching
   inside" approach. Each section's rendering rule (per-line for IN,
   comma-joined for the others) lives next to the array it consumes,
   so future format tweaks won't need to thread through one big loop.

3. **Mid-iteration refinement based on real-device feedback.** The
   first cut went all-text and felt sterile in iMessage. We caught
   that during the verification step rather than after committing,
   layered ⛳ and transport emojis back, and updated the iteration
   record to capture both as deliberate decisions. The compound-
   engineering loop's "verify before close-out" beat earned its keep.

## What Didn't Work

1. **Going to fully text-only on the first pass.** "Less emoji" was
   the user's stated preference, and we read it as "no emoji on
   player lines." The right reading was "fewer emojis, but keep the
   ones that carry information or identity." Should have presented a
   visual mockup before committing to the all-text version.

2. **The old `filteredResponses` local was unused.** The original
   function declared `const filteredResponses = ...` and never read
   it. The refactor dropped it silently, but we didn't go back and
   audit the file for other zombie locals. Worth a quick pass next
   time SessionCard.tsx gets touched.

## Patterns That Emerged

1. **Emoji rule of thumb for golf-buddy share messages**: keep emojis
   that carry information (🚶 / 🛺 / 🎯 / ⛳ / 🏌️) or signal identity
   at a single anchor (one ⛳ at the top). Drop emojis that decorate
   redundantly with text already saying the same thing (✅/❓/❌
   alongside `In`/`Maybe`/`Out` headers; 📊 alongside a number; 📱
   alongside a URL).

2. **For text-format design iterations, real-device verification
   should happen _during_ the iteration, not at the end.** Expo Go's
   hot reload makes this nearly free. Building a format only to find
   out post-commit that it feels off doubles the work.

3. **Keep render rules co-located with the data they consume.**
   `inUsers.forEach(... per-line ...)` next to `inUsers`, then
   `maybeUsers.join(', ')` next to `maybeUsers`. Easier to read and
   easier to change later than a single loop with internal branching.

## What We'd Do Differently

1. **Show 2–3 visual mockups before coding.** When the iteration is
   about how text reads, a markdown mockup of the proposed output is
   cheaper than a code edit and reveals "this feels off" sooner. Use
   `AskUserQuestion`'s preview-style options for this.

2. **Audit for unused locals when refactoring a function end-to-end.**
   The old `filteredResponses` was dead before iteration 003 and is
   gone now, but only because it happened to fall outside our edit
   range. A simple `grep` for declared-but-unused identifiers in the
   file would have caught it deliberately.

3. **Treat the rich link preview as part of the message design.**
   The iMessage view is _the_ artifact — text body + preview tile
   together. When designing format changes, consider both surfaces;
   they're produced from two repos but read as a single thing.
