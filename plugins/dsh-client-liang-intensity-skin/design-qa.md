# 滑动变祖 · Design QA

final result: passed

## Verified build

- DSH `0.1.0-rc.6`, isolated profile on `127.0.0.1:3081`
- Plugin client bundle loads and the dynamic reasoning slider is present
- 8/8 unit cases pass; production client bundle builds successfully

## Interaction checks

- Drag/input updates only the continuous local preview
- Tooltip is mounted only while pointer or keyboard interaction is active
- Tooltip label combines the continuous Liang rank with the nearest dynamic model effort, for example `梁祖 · Max`
- Release snaps to the nearest effort and performs one model-selection commit
- Two-, three-, and five-effort models derive their stops from provider metadata
- UI remains native-light through level 23 and switches to the black/gold theme at level 24 (`梁神`)
- Portrait frames switch directly; no crossfade is retained

## Visual checks

- Light state keeps native white composer, pale message bubble, readable dark text, and a visible half-body portrait
- Dark state keeps the portrait behind the usable conversation area and aligns controls, sidebar, borders, and accents to the charcoal/gold reference
- Sidebar and main canvas share a continuous tonal family
- Tooltip is compact, follows the thumb, and does not obscure model selection or send controls
- Tooltip may extend beyond the slider box at either endpoint so its center remains aligned with the thumb
- Tooltip now follows the active skin surface: light surface with dark text in the light shell, dark surface with light text in the dark shell
- Light mode retains Harness blue accents and a black badge with light lettering
- Dark mode uses the calibrator's `#c19a49` / `#d5b56e` gold for the badge, hero glow, effort label, and send action
- Slider thumb, rail, and ticks always use the subdued secondary text color; the send arrow is dark on gold
- Light mode slider, rail, and ticks use the secondary text color; the send arrow remains white on blue
- Portraits render without brightness, contrast, or saturation filters; source artwork supplies the intended tonal grade
- All 24 approved portrait anchors are registered by the host and selected by the client; no image crossfade is used
- The custom rail starts and ends at the endpoint ticks, producing terminal T caps instead of crossing past them
- Side-by-side reference comparison: `design-qa-comparison.png`
- Final implementation capture: `design-qa-final.png`

## Asset handoff

- 24/24 portrait sources are present at `assets/portrait-source-v2/`
- Final contact sheet: `assets/portrait-source-v2/references/contact-sheet-final-24.png`
- Generation/video handoff: `assets/portrait-source-v2/GENERATION-BRIEF.md`
