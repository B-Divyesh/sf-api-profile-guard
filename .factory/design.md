# API Profile Guard — visual thesis

## Direction: the preflight pressroom

API Profile Guard uses a dithered/halftone print system inspired by safety cards,
registration marks, and the physical approval stamps used before a high-risk job
goes to press. The texture is explanatory: a coarse cyan field means a request is
still being inspected; a dense vermilion overprint means production needs a human
acknowledgement. It feels local, inspectable, and deliberately unlike a cloud API
dashboard.

The visual metaphor is a three-stage press: **resolve profile → inspect policy →
release request**. A hand-drawn signal gate turns a loose stream of request marks
into one checked line. Nothing resembles a generic gradient hero or framework card
grid.

## Palette

This is intentionally a single light, paper-like mode. Painting the warm paper
background explicitly is part of the print thesis and avoids pretending the
product has a dark terminal theme.

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F4EFD9` | warm uncoated stock / page background |
| `ink` | `#17211D` | primary type and rules |
| `ink-muted` | `#46534D` | secondary copy; 6.9:1 on paper |
| `cyan` | `#006D77` | active checks and links; 5.3:1 on paper |
| `cyan-deep` | `#004D54` | pressed/focus states |
| `vermilion` | `#B62D1F` | block/production warning; 5.5:1 on paper |
| `mustard` | `#D9A21B` | caution fields, never text alone |
| `green` | `#245D3C` | allowed state; 6.5:1 on paper |
| `white` | `#FFFDF5` | raised specimen surfaces |

Status always includes a word and symbol, never color alone. Rules and controls
meet a minimum 3:1 UI contrast; text meets 4.5:1.

## Type

- Display: **Arial Black**, then `Arial Narrow`, system sans. Its compressed,
  ink-heavy capitals resemble equipment labels without adding a font download.
- Reading/code: **ui-monospace**, `SFMono-Regular`, Consolas, monospace. The site is
  a technical field guide, so values, commands, and annotations share one crisp
  utility voice.
- Scale: 16px body; 14px labels; 20px lead; 28px section title; fluid 44–76px h1.
  Body measure stays below 70 characters with 1.55 leading and tabular numerals.

No external fonts are requested. This deliberately keeps the initial font budget
at 0 KB and lets the printed identity come from composition, weight, and texture.

## Spacing and structure

The base rhythm is 4px, with working intervals of 8, 12, 16, 24, 32, 48, 64,
and 96px. Content sits on a 12-column registration grid up to 1200px. Sections are
separated by editorial whitespace and heavy rules, not a pile of rounded cards.
Independent specimens (the interactive preflight and config excerpt) use square
paper panels with a 1px rule and 6px offset shadow. Controls are at least 44px.

At 390px, the masthead collapses, secondary nav labels are dropped, stages stack,
and the terminal specimen becomes horizontally scrollable. The preflight keeps its
full labels and puts one action per row.

## Interaction grammar

- Hover: a 2px registration offset and cyan underprint appears.
- Focus: a 3px cyan outline plus 3px paper gap, visibly distinct on every control.
- Press: an element moves 2px toward its offset shadow.
- State change: the result sheet slides 8px upward and its `ALLOWED` or `BLOCKED`
  stamp resolves from a coarse dot mask.
- Copy actions confirm inline for two seconds; the simulator result is an assertive
  live region only when blocked and polite when allowed.

## Motion policy

Only state changes move, over 180–240ms, using transform and opacity. The gate
illustration has no looping animation. Under `prefers-reduced-motion: reduce`, all
transforms and smooth scrolling become instant opacity/state swaps. Nothing flashes
or auto-plays.

## Original asset plan and provenance

- `site/public/preflight-gate.webp`: original raster hero showing three request
  streams entering a mechanical inspection gate, rendered as a two-ink halftone
  editorial print with generous negative space and no text. Generated specifically
  for this product with the factory `factory-image` deployment, then resized and
  converted locally to WebP. Intended display size: 720 × 520; budget: ≤300 KB.
- UI marks, check symbols, arrows, dotted fields, and registration cross are drawn
  in CSS/inline SVG by this project and contain no third-party artwork.

Generation prompt (verbatim):

> Use case: stylized-concept. Asset type: landing page hero editorial illustration.
> Scene/backdrop: warm uncoated paper with wide clean margins. Subject: three narrow
> streams of abstract API request tokens entering a sturdy mechanical inspection
> gate; only one orderly stream exits, while a vermilion stop paddle blocks a risky
> branch. Style/medium: original 1960s technical safety-manual screen print, coarse
> halftone and stipple, imperfect ink registration, two-color cyan and vermilion with
> deep black linework. Composition/framing: landscape, strong diagonal flow, readable
> silhouette, no UI mockup. Lighting/mood: flat editorial print, vigilant and calm.
> Color palette: warm paper #F4EFD9, cyan #006D77, vermilion #B62D1F, ink #17211D.
> Constraints: no words, no letters, no logos, no gradients, no photorealism, no
> watermark, no tiny decorative clutter.

The image is generated under the product's MIT project provenance; the generation
metadata sidecar records the deployment and prompt.
