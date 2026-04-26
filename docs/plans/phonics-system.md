# Phoneme Learning System Spec

Target app: `light-learning-apps/apps/english-phonics-lab/`

## 1. Goal

Build a phoneme-based learning engine with two top-level modes:

1. Single phoneme learning
2. Review

The app must not force a D1-D30 course path. A learner can choose any IPA phoneme at any time, study it, and reset practice freely.

## 2. Scope

### Single phoneme learning

- Covers the full British-oriented English IPA set currently represented by 44 phonemes.
- Learner chooses any phoneme from grouped categories.
- Learner can mark or unmark any single phoneme as learned.
- Learned state is stored only in the current browser with `localStorage`.
- Each phoneme card renders:
  - Sound
  - Mouth
  - Pattern
  - Words
  - Contrast
- Practice is local to the selected phoneme.
- Remove day-completion controls and statistics:
  - No `Check day`
  - No `Viewed`
  - No `Exercises`
  - No `First try`
  - No locked next-day flow
- `Reset practice` restarts the current practice sequence.

### Learned record

- Storage key: `light-learning.english-phonics-lab.learned.v1`
- Shape: `Record<phonemeId, markedAtIsoString>`
- Marking is independent from practice score.
- The app shows a lightweight learned count, such as `8/44 learned`.
- Marked phonemes show a visual `Done` state in the phoneme picker and Review map.
- Unmarking removes the phoneme id from local storage.
- No backend user account or API sync is introduced in this version.

### Review

- Review is综合复习, centered on mixed exercises across the full IPA system.
- Review uses the same exercise kinds as single-phoneme practice:
  - Sound -> Word
  - Word -> Sound
  - Underline Match
  - Contrast Choice
- Review should expose the full IPA map so a learner can jump back into single-phoneme learning.
- Learned marks remain visible in Review.
- `Reset practice` restarts the review sequence.

## 3. IPA Inventory

The first complete inventory uses 44 British-oriented IPA phonemes.

### Vowels and diphthongs

- Short vowels: `/ɪ/`, `/e/`, `/æ/`, `/ʌ/`, `/ɒ/`, `/ʊ/`
- Long vowels: `/i:/`, `/u:/`, `/ɑ:/`, `/ɔ:/`, `/ɜ:/`
- Weak vowel: `/ə/`
- Diphthongs: `/eɪ/`, `/aɪ/`, `/ɔɪ/`, `/əʊ/`, `/aʊ/`, `/ɪə/`, `/eə/`, `/ʊə/`

### Consonants

- Stops: `/p/`, `/b/`, `/t/`, `/d/`, `/k/`, `/g/`
- Affricates: `/tʃ/`, `/dʒ/`
- Fricatives: `/f/`, `/v/`, `/θ/`, `/ð/`, `/s/`, `/z/`, `/ʃ/`, `/ʒ/`, `/h/`
- Nasals: `/m/`, `/n/`, `/ŋ/`
- Approximants and liquids: `/l/`, `/r/`, `/w/`, `/j/`

## 4. Data Model

Primary source:

- `light-learning-apps/apps/english-phonics-lab/src/data/phonemes.ts`

Each phoneme record includes:

- stable id
- IPA display
- category/type
- sound hint
- mouth hint and mouth steps
- spelling patterns
- example words
- confusable phonemes
- minimal pairs

The exercise bank is generated from this data in:

- `light-learning-apps/apps/english-phonics-lab/src/data/exercises.ts`

## 5. Interaction Model

### Single phoneme

1. Learner selects a category.
2. Learner selects any phoneme chip.
3. Card updates immediately.
4. Learner taps word chips to observe spelling patterns.
5. Learner practices generated questions for that phoneme.
6. Learner marks or unmarks the phoneme as learned.
7. Learner can reset practice at any time.

### Review

1. Learner opens Review.
2. App serves mixed exercises from the full generated exercise bank.
3. Learner answers one question at a time.
4. Feedback is immediate.
5. Learner can reset review practice at any time.
6. IPA map remains visible for jumping back to single-phoneme learning.

## 6. Acceptance Criteria

- App contains 44 IPA phoneme records.
- UI has only two top-level modes: `Single phoneme` and `Review`.
- No D1-D30 controls or daily completion model remain in the app source.
- `Check day`, `Viewed`, `Exercises`, and `First try` are not visible.
- Any phoneme can be selected directly.
- Any phoneme can be marked learned and unmarked again.
- Learned marks persist after page reload in the same browser.
- Single-phoneme practice uses only the active phoneme's generated exercises.
- Review uses mixed exercises across the whole IPA system.
- `Reset practice` works in both modes.
- `cd light-learning-apps/apps/english-phonics-lab && npm run build` passes.
- `cd light-learning-apps && npm run build:all` passes.
