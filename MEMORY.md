# MEMORY

## Stable context
- Repo now uses a two-project architecture similar to PlayHub:
  - `light-math-hub` (hub frontend)
  - `light-maths` (apps collection + host scripts)
- Production domain is `math.chat1.co`.
- Standard app path contract: `/apps/<id>/`.
- Deployment script is `scripts/deploy-math-chat1.sh`.
- Chinese base UI font stack is standardized to:
  - `"PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Roboto", "Droid Sans Fallback", "WenQuanYi Micro Hei", sans-serif`
- Hub and existing apps no longer depend on Google font imports for title text; title typography now uses the same local system stack to avoid runtime font swap.
- Hub app cards now use a single-layer icon presentation with larger icon sizing (no nested icon-within-icon framing).

## Initial app baseline
- First onboarded app: `fraction-lab`.
- Added density app: `density` (1L density-mass visualizer) and integrated into Hub registry.
- Added geometry app: `cube-surface-lab` (page 1: cube edge-cut unfolding lesson).
- `cube-surface-lab` now includes page 2 demo of all 11 cube nets with cut-edge lists and unfold animations.
- Page 2 unfold animation uses hinge-based 3D cube-to-net unfolding (not planar relayout).
- Page 2 now runs as a step-by-step scissor sequence (one edge per step) with door-style face opening; UI text is English.
- Page 2 interaction is manual exploration: click-to-cut one edge at a time; after three cuts, a selected face can be opened via door-angle control.
- Door opening is rendered on the original cube stage itself (same stage as cuts), not a separate mini-cube panel.
- Door opening geometry keeps hinge-edge points fixed so uncut hinge structure remains stable during face opening.
- Door controls now use per-face persistent angle sliders (no single-face switch reset).
- Page-2 cube stage now supports view yaw/pitch rotation controls and uses a larger canvas area for clearer observation.
- Page-2 view control now uses drag-to-rotate orbit (free 360-degree feel) with post-drag click suppression.
- Net face-letter mapping now seeds `F` from a center-reference/high-degree cell for more stable label placement.
- Hub registry source of truth: `light-math-hub/src/data/apps.json`.
- Deploy script only packages apps that are `enabled && listed` in Hub `apps.json`.
- Hub now supports i18n with default `zh-CN` and manual switch to `en-US`; language selection persists in `localStorage` (`light-math-hub.locale`), and app registry supports additive `i18n.en-US` metadata overrides.
- Root `SOUL.md` defines the project's teaching ethos: math as a creative world of ideas, with emphasis on curiosity, enjoyment, low-pressure learning, play-based exploration, going beyond textbooks, and AI as assistive rather than the source of human creativity.

## Ops notes
- `math.chat1.co` is now configured in nginx with Certbot-managed certificate.
- `stock.chat1.co` has been removed from active nginx includes and from `chat1.co` certificate SAN list.
- Deploy script now guards against existing directory at `$REMOTE_BASE/current` to avoid broken release symlink state.
- `cube-surface-lab` page-2 cube now uses true geometry-based 3D door rotation with perspective projection (not CSS pseudo-3D), including depth-sorted faces and projected edge/scissor paths.
- `cube-surface-lab` net orientation mapping now enforces expected letter orientation (`F` center reference, `U` above, `R` right) by corrected east/west fold direction.
- `algebra-balance` is now integrated into Hub (`apps.json`) and deployed on `math.chat1.co` at `/apps/algebra-balance/`.
- `bias-variance-range` is now integrated into Hub (`apps.json`) as a target-shooting demo for Bias vs Variance at `/apps/bias-variance-range/`.
- `allocation-expression-lab` is now integrated into Hub (`apps.json`) and available at `/apps/allocation-expression-lab/`.
- `allocation-expression-lab` teaches allocation word problems in two phases: concrete playback first, then abstraction to algebraic expressions; its optional AI scenario generation degrades gracefully when `OPENAI_API_KEY` is absent.
- Active pursuit app in Hub is now `cosmic-chase`; `speed-chase-lab` remains in the repo but is disabled/unlisted in Hub registry.
- Hub list cards now launch apps directly via `/run/:id`; the detail page is accessed from a hover/focus-only card button.
- Hub category tags are intentionally limited to one tag per app to keep the filter set compact.
