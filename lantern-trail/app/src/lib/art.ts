/* Illustrations: scene renderer, treasure gems and the hero trail. Ported from the prototypes.
   Scene code: "sky land extra,extra ; 🦁70,165,44 🌳310,152,64" (emoji x,y,size). "{child}" follows the child's gender. */
import type { Gender, Look } from "./model";

const SKY: Record<string, [string, string]> = {
  day: ["#78C3F0", "#D5EFFB"], dawn: ["#F4A07A", "#FDE5C1"], sunset: ["#E3667B", "#F8C778"],
  night: ["#07122C", "#253A70"], storm: ["#3C4658", "#8A95A6"],
};
const EMOJI_FONT = `'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;
let uid = 0;

function rnd(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function starPts(cx: number, cy: number, r1: number, r2: number) {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, r = i % 2 ? r2 : r1; p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`); }
  return p.join(" ");
}
const emoji = (e: string, x: number | string, y: number | string, size: number | string) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" font-family="${EMOJI_FONT}">${e}</text>`;

export function scene(code: string, seed: number, gender: Gender): string {
  const [head, pr = ""] = code.replace("{child}", gender === "girl" ? "👧" : "👦").split(";");
  const w = head.trim().split(/\s+/); const sky = w[0], land = w[1], ex = (w[2] || "").split(",");
  const id = "sky" + (uid++); const r = rnd(seed || 7); const [c1, c2] = SKY[sky] ?? SKY.day;
  let s = `<svg viewBox="0 0 400 180" role="img" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="180" fill="url(#${id})"/>`;
  if (sky === "night") {
    for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 100).toFixed(0)}" r="${(r() * 1.4 + .4).toFixed(1)}" fill="#FFF6D8" opacity="${(r() * .6 + .4).toFixed(2)}"/>`;
    if (!ex.includes("star")) s += `<circle cx="340" cy="38" r="15" fill="#FFF3C4"/><circle cx="347" cy="33" r="13" fill="${c1}"/>`;
  }
  if (sky === "day") s += `<circle cx="345" cy="38" r="22" fill="#FFD24A"/><circle cx="345" cy="38" r="32" fill="#FFD24A" opacity=".25"/>`;
  if (sky === "dawn") s += `<circle cx="70" cy="118" r="30" fill="#FFCD6A"/>`;
  if (sky === "sunset") s += `<circle cx="330" cy="112" r="32" fill="#FFB24C"/>`;
  if (sky === "storm") s += `<ellipse cx="90" cy="34" rx="90" ry="26" fill="#566174"/><ellipse cx="260" cy="26" rx="120" ry="28" fill="#4C576A"/><g stroke="#C9D3E0" stroke-width="1.5" opacity=".7">${Array.from({ length: 22 }, () => { const x = r() * 400, y = r() * 120 + 30; return `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 6).toFixed(0)}" y2="${(y + 14).toFixed(0)}"/>`; }).join("")}</g>`;
  if (ex.includes("star")) s += `<circle cx="300" cy="40" r="30" fill="#FFF3C4" opacity=".18"/><polygon points="${starPts(300, 40, 16, 6.5)}" fill="#FFE27A"/>`;
  if (ex.includes("rainbow")) ["#E85D5D", "#F2A33A", "#F5D547", "#5DBB63", "#4A90D9", "#8E6CCF"].forEach((c, i) => { const R = 150 - i * 8; s += `<path d="M${200 - R} 150 A${R} ${R} 0 0 1 ${200 + R} 150" fill="none" stroke="${c}" stroke-width="8" opacity=".85"/>`; });
  const waves = (ys: number[]) => ys.map((y, i) => `<path d="M0 ${y} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2" transform="translate(${i % 2 ? -25 : 0} 0)"/>`).join("");
  const L: Record<string, () => string> = {
    hills: () => `<ellipse cx="90" cy="182" rx="210" ry="62" fill="#86C98A"/><ellipse cx="330" cy="190" rx="230" ry="70" fill="#5AA866"/>`,
    sea: () => `<rect y="100" width="400" height="80" fill="${sky === "storm" ? "#2A4F74" : sky === "night" ? "#1D3C6B" : "#2F7FC1"}"/>` + waves([112, 128, 146, 164]),
    beach: () => `<rect y="96" width="400" height="84" fill="${sky === "storm" ? "#2A4F74" : "#3A8CCB"}"/>${waves([108])}<path d="M0 150 Q200 124 400 146 L400 180 L0 180Z" fill="#EBD08E"/>`,
    desert: () => `<ellipse cx="80" cy="188" rx="230" ry="62" fill="#E8C372"/><ellipse cx="340" cy="194" rx="230" ry="66" fill="#D7A754"/>`,
    mountain: () => `<polygon points="50,160 200,30 350,160" fill="#7B8699"/><polygon points="168,60 200,30 232,60 216,66 200,56 184,66" fill="#F1F4F8"/><rect y="150" width="400" height="30" fill="#6AA86F"/>`,
    river: () => `<ellipse cx="90" cy="182" rx="210" ry="62" fill="#86C98A"/><ellipse cx="330" cy="190" rx="230" ry="70" fill="#5AA866"/><path d="M0 150 Q100 136 200 146 T400 140 L400 162 Q300 168 200 166 T0 172Z" fill="#4A9BE0"/>`,
    town: () => `<rect y="148" width="400" height="32" fill="#D8B878"/>` + [[20, 108], [88, 118], [262, 112], [330, 104]].map(([x, y]) => `<rect x="${x}" y="${y}" width="56" height="${150 - y}" fill="#EEDFBE"/><rect x="${x + 21}" y="130" width="14" height="20" fill="#9A6B3F"/><rect x="${x + 6}" y="${y + 8}" width="10" height="9" fill="#9A6B3F"/>`).join("") + `<circle cx="116" cy="118" r="14" fill="#EEDFBE"/>`,
    cave: () => `<rect y="140" width="400" height="40" fill="#6B5A45"/><path d="M0 0 L130 0 Q95 80 70 180 L0 180Z" fill="#4A3C2F"/><path d="M400 0 L270 0 Q305 80 330 180 L400 180Z" fill="#4A3C2F"/>`,
    redsea: () => `<rect y="118" width="400" height="62" fill="#E5C88A"/><path d="M0 40 Q90 30 150 60 L160 180 L0 180Z" fill="#2F7FC1"/><path d="M150 60 L160 180" stroke="#BFE2FF" stroke-width="5"/><path d="M400 40 Q310 30 250 60 L240 180 L400 180Z" fill="#2F7FC1"/><path d="M250 60 L240 180" stroke="#BFE2FF" stroke-width="5"/>`,
    garden: () => `<ellipse cx="90" cy="182" rx="210" ry="62" fill="#8ACF84"/><ellipse cx="330" cy="190" rx="230" ry="70" fill="#5DAF62"/>` + Array.from({ length: 18 }, () => `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 30 + 148).toFixed(0)}" r="3" fill="${r() > .5 ? "#FF8FB1" : "#FFE066"}"/>`).join(""),
    campfire: () => `<path d="M0 120 L30 70 L60 120Z M40 125 L80 55 L120 125Z M300 120 L335 60 L370 120Z M350 125 L380 75 L410 125Z" fill="#183326"/><ellipse cx="200" cy="190" rx="300" ry="62" fill="#2E4C39"/><circle cx="200" cy="150" r="60" fill="#FFB347" opacity=".18"/><rect x="165" y="160" width="70" height="9" rx="4" fill="#7A4B2A" transform="rotate(12 200 165)"/><rect x="165" y="160" width="70" height="9" rx="4" fill="#8B5A33" transform="rotate(-12 200 165)"/>`,
  };
  s += L[land]?.() ?? "";
  const X: Record<string, () => string> = {
    pyramids: () => `<polygon points="250,140 300,80 350,140" fill="#C99A4B"/><polygon points="320,142 352,104 384,142" fill="#B98A3E"/>`,
    walls: () => `<rect x="80" y="92" width="240" height="58" fill="#C8A56A"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${80 + i * 20}" y="84" width="11" height="10" fill="#C8A56A"/>`).join("") + `<rect x="185" y="112" width="30" height="38" rx="15" fill="#7A5631"/>`,
    statue: () => `<rect x="185" y="62" width="30" height="90" fill="#E5B93C"/><circle cx="200" cy="52" r="14" fill="#E5B93C"/><rect x="175" y="148" width="50" height="10" fill="#B98A2A"/>`,
    ark: () => `<polygon points="100,112 300,112 278,140 122,140" fill="#8B5A33"/><rect x="150" y="90" width="100" height="24" fill="#A06A3D"/><polygon points="145,92 200,74 255,92" fill="#7A4B2A"/>`,
    stable: () => `<rect x="140" y="112" width="120" height="58" fill="#8B5A33"/><polygon points="128,114 200,78 272,114" fill="#6E4325"/><rect x="178" y="134" width="44" height="36" fill="#3A2416"/><rect x="180" y="158" width="40" height="8" fill="#E9C46A"/>`,
    cross: () => `<rect x="196" y="50" width="9" height="100" fill="#5B3A29"/><rect x="174" y="72" width="53" height="9" fill="#5B3A29"/>`,
    tomb: () => `<ellipse cx="200" cy="150" rx="100" ry="58" fill="#8D8A84"/><ellipse cx="190" cy="140" rx="22" ry="26" fill="#2B2622"/><circle cx="262" cy="148" r="24" fill="#A9A59E"/>`,
    tree: () => `<rect x="292" y="80" width="18" height="80" fill="#7A4B2A"/><circle cx="300" cy="72" r="46" fill="#3E8E4F"/><circle cx="270" cy="88" r="26" fill="#4A9C5A"/><circle cx="330" cy="88" r="26" fill="#4A9C5A"/>`,
    rock: () => `<polygon points="30,180 50,132 90,122 130,134 150,180" fill="#7C7A74"/>`,
    flakes: () => Array.from({ length: 40 }, () => `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 44 + 134).toFixed(0)}" r="2" fill="#FFFFFF"/>`).join(""),
  };
  ex.forEach(k => { s += X[k]?.() ?? ""; });
  if (sky === "night" && land !== "campfire") s += `<rect y="90" width="400" height="90" fill="#081430" opacity=".3"/>`;
  pr.trim().split(/\s+/).filter(Boolean).forEach(t => { const m = t.match(/^(.+?)(\d+),(\d+),(\d+)$/u); if (m) s += emoji(m[1], m[2], m[3], m[4]); });
  return s + "</svg>";
}

export function gem(color: string, size = 26): string {
  return `<svg class="gem" width="${size}" height="${size}" viewBox="0 0 26 26" aria-hidden="true"><polygon points="7,3 19,3 24,10 13,24 2,10" fill="${color}"/><polygon points="7,3 19,3 16,10 10,10" fill="#FFFFFF" opacity=".35"/><polygon points="2,10 10,10 13,24" fill="#000000" opacity=".12"/></svg>`;
}

export function compassMini(k: string): string {
  const a = ({ talk: 0, listen: 90, trust: 180, love: 270 } as Record<string, number>)[k] ?? 0;
  return `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/><g transform="rotate(${a} 20 20)"><polygon points="20,5 25,20 15,20" fill="currentColor"/><polygon points="20,35 25,20 15,20" fill="currentColor" opacity=".3"/></g></svg>`;
}

export function heroArt(look: Look, gender: Gender, seed = 11): string {
  let st = ""; const r = rnd(seed);
  for (let i = 0; i < 50; i++) st += `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 110).toFixed(0)}" r="${(r() * 1.5 + .4).toFixed(1)}" fill="#FFF6D8" opacity="${(r() * .6 + .3).toFixed(2)}"/>`;
  const pts = [[40, 170], [130, 150], [220, 162], [310, 140], [400, 152], [490, 132], [580, 146], [670, 124], [760, 134]];
  const lan = pts.map(([x, y], i) => `<circle cx="${x}" cy="${y - 2}" r="${i === 8 ? 16 : 7}" fill="#FFBC52" opacity="${i === 8 ? .35 : .9}"/>`).join("");
  const [h1, h2, moonCut] = look === "starlight" ? ["#4A2C62", "#3A2150", "#2B1A44"] : ["#1E3A3A", "#16302C", "#0F1D38"];
  const sparkle = look === "starlight" ? emoji("✨", 230, 70, 18) + emoji("✨", 520, 50, 14) : "";
  return `<svg class="hero-art" viewBox="0 0 800 200" aria-hidden="true" preserveAspectRatio="xMidYMax meet">${st}<circle cx="700" cy="40" r="16" fill="#FFF3C4"/><circle cx="707" cy="35" r="14" fill="${moonCut}"/><path d="M0 200 Q150 120 320 168 T640 140 T800 150 L800 200Z" fill="${h1}"/><path d="M0 200 Q200 150 420 182 T800 170 L800 200Z" fill="${h2}"/><path d="M40 170 Q130 140 220 162 T400 152 T580 146 T760 134" fill="none" stroke="#FFBC52" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" opacity=".8"/>${lan}${sparkle}${emoji("🏮", 760, 142, 26)}${emoji(gender === "girl" ? "👧" : "👦", 60, 168, 30)}</svg>`;
}
