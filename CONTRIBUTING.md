# Contributing

```bash
git clone https://github.com/KeWang0622/vibereceipt && cd vibereceipt
bash scripts/dev.sh install
bash scripts/dev.sh example   # produces assets/example.svg
bash scripts/dev.sh test
# open a PR
```

PRs welcome — keep the diff small. The fun ones to land:

- a new category of credit or debit
- a non-receipt visual style (boarding-pass, prescription, restaurant check)
- a real PNG rasterizer that doesn't pull in headless Chromium
