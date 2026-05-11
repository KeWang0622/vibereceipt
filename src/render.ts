import { createHash } from "node:crypto";
import type { ReceiptData } from "./pricing.js";

const W = 600;
const PAD = 32;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(amount: number): string {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(amount).toFixed(2).padStart(6, " ")}`;
}

function row(y: number, label: string, amount: number): string {
  const labelX = PAD;
  const amountX = W - PAD;
  // Debits get a slightly redder ink — same monospace, just darker red — so the
  // joke (DOOMSCROLL 14h −$21) is legible at thumbnail size.
  const fill = amount < 0 ? "#7f1d1d" : "#111";
  return `
    <text x="${labelX}" y="${y}" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="20" fill="${fill}">${esc(label)}</text>
    <text x="${amountX}" y="${y}" text-anchor="end" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="20" fill="${fill}">${esc(fmt(amount))}</text>`;
}

function divider(y: number): string {
  let d = "";
  for (let x = PAD; x < W - PAD; x += 12) {
    d += `<line x1="${x}" y1="${y}" x2="${x + 6}" y2="${y}" stroke="#111" stroke-width="1"/>`;
  }
  return d;
}

function stars(rating: number): string {
  const filled = "★".repeat(rating);
  const empty  = "☆".repeat(5 - rating);
  return `${filled}${empty}`;
}

function barcode(seed: string): string {
  // 64 lines of varying width derived from sha256(seed). Deterministic.
  const hash = createHash("sha256").update(seed).digest("hex");
  const startX = PAD;
  const endX = W - PAD;
  const width = endX - startX;
  const bars = 64;
  let x = startX;
  let parts = "";
  for (let i = 0; i < bars; i++) {
    const nibble = parseInt(hash[i % hash.length] ?? "0", 16);
    const bw = 2 + (nibble % 4);  // 2-5px wide
    const gap = 1 + ((nibble >> 2) % 2);
    if ((nibble & 1) === 1) {
      parts += `<rect x="${x.toFixed(2)}" y="0" width="${bw}" height="44" fill="#111"/>`;
    }
    x += bw + gap;
    if (x > endX) break;
  }
  // Scale to fit
  const usedWidth = x - startX;
  const scale = usedWidth > width ? width / usedWidth : 1;
  return `<g transform="translate(0,0) scale(${scale.toFixed(4)}, 1)">${parts}</g>`;
}

export function renderReceipt(d: ReceiptData): string {
  const credits = d.credits;
  const debits = d.debits;
  const lineCount = credits.length + debits.length + (d.bonus ? 1 : 0);

  // Layout
  let y = 70;
  const headerH = 90;
  const lineH = 30;
  const sectionGap = 22;
  const footerH = 220;

  let body = "";
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="32" font-weight="700" fill="#111">VIBE MART</text>
  `;
  y += 28;
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="16" fill="#444">${esc(d.date_label)} · YOUR WEEK, ITEMIZED</text>
  `;
  y += 28;
  body += divider(y);
  y += 24;

  for (const c of credits) {
    body += row(y, c.label, c.amount);
    y += lineH;
  }
  if (credits.length && debits.length) {
    y += 4;
    body += divider(y);
    y += 24;
  }
  for (const dbt of debits) {
    body += row(y, dbt.label, dbt.amount);
    y += lineH;
  }
  y += 6;
  body += divider(y);
  y += 24;
  body += row(y, "SUBTOTAL", d.subtotal);
  y += lineH;

  if (d.bonus) {
    body += row(y, d.bonus.label, d.bonus.amount);
    y += lineH;
  }
  y += 6;
  // double divider for total
  body += divider(y);
  y += 4;
  body += divider(y);
  y += 30;
  body += `
    <text x="${PAD}" y="${y}" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="24" font-weight="700" fill="#111">TOTAL VIBE</text>
    <text x="${W - PAD}" y="${y}" text-anchor="end" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="24" font-weight="700" fill="#111">${esc(fmt(d.total))}</text>
  `;
  y += lineH + 10;
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="22" fill="#111">${stars(d.stars)}</text>
  `;
  y += 30;
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="14" fill="#444">THANK YOU FOR EXISTING TODAY</text>
  `;
  y += 22;
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="11" fill="#777">self-reported, no judgment</text>
  `;
  y += 40;
  // barcode
  body += `<g transform="translate(0,${y})">${barcode(d.date_label + ":" + d.total.toFixed(2))}</g>`;
  y += 50;
  body += `
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" font-size="10" fill="#999">vibereceipt</text>
  `;
  y += 30;
  const H = y;

  // tear-edges (zigzag at top + bottom)
  const teeth = (yy: number, dir: number): string => {
    let path = `M 0 ${yy}`;
    for (let x = 0; x <= W; x += 12) {
      path += ` L ${x + 6} ${yy + dir * 6} L ${x + 12} ${yy}`;
    }
    return `<path d="${path}" fill="#fff"/>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="vibereceipt for ${esc(d.date_label)}">
  <rect width="${W}" height="${H}" fill="#fafaf7"/>
  ${teeth(0, 1)}
  ${teeth(H, -1)}
  ${body}
</svg>
`;
}
