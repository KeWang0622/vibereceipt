# Launch checklist (manual, in order)

- [ ] Upload social preview at https://github.com/KeWang0622/vibereceipt/settings  
      (use `assets/example.png` cropped/letterboxed to 1280×640 — Figma or `qlmanage -t -s 1280 -o /tmp assets/example.svg && magick /tmp/example.svg.png -gravity center -background "#fafaf7" -extent 1280x640 social.png`)
- [ ] Verify the README hero image renders inline on https://github.com/KeWang0622/vibereceipt
- [ ] Run from a clean shell, verify the public repo works:
      `git clone https://github.com/KeWang0622/vibereceipt tmp && cd tmp && bash scripts/dev.sh install && bash scripts/dev.sh example`
- [ ] Review LAUNCH/hn.md — pick a Tue–Thu 14:00–16:00 UTC slot before submitting
- [ ] Review LAUNCH/x.md (already drafted from Gate 0 — your typed tweet)
- [ ] Review LAUNCH/reddit.md — submit to r/coolgithubprojects first (lower stakes), then r/QuantifiedSelf and r/ClaudeAI based on response
- [ ] Confirm DISTRIBUTION.md numbers are still accurate (39 GitHub followers as of 2026-05-11)
- [ ] Optional: `npm publish vibereceipt@0.1.0` so the install line drops the `github:` prefix
