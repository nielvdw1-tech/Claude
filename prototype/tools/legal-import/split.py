"""Split extracted regulation text into numbered regulations without changing any wording.

Only page furniture is removed (gazette running headers and footers, page numbers, cover-page
printing notices, publisher copyright footers). Line wraps are joined; a new paragraph starts at
a subregulation "(1)", a paragraph "(a)", a definition opening quote or a numbered item.
Usage: python3 -I split.py <text-with-@@PAGE-markers> <out.json>
"""
import json, re, sys
from collections import Counter

NOISE = [r'This gazette is also available free online', r'^\s*(STAATSKOERANT|GOVERNMENT GAZETTE)\b', r'GOVERNMENT GAZETTE,\s+\d', r'STAATSKOERANT,\s+\d',
         r'©.*LABOUR GUIDE', r'LABOUR GUIDE PART', r'^\s*\d{1,3}\s*$', r'ISSN \d', r'AIDS HELPLINE', r'Printing Works', r'Hard Copies', r'Electronic Files',
         r'submitted for publication', r'^\s*Vol\.\s*\d+', r'Regulation Gazette', r'Regulasiekoerant', r'^\s*REPUBLI[CE]', r'^\s*(\d\s){6,}', r'not be held responsible',
         r'^\s*No\.?\s*\d{5}\s*\d*\s*$', r'^\s*\d+\s+No\.?\s*\d{5}', r'^\s*(November|Desember|December|Maart|March|Julie|July|Mei|May|Junie|June|Augustus|August|Februarie|February|Januarie|January|Oktober|October|September|April)\s*$',
         r'^\s*N\.B\.', r'GovernmenT PrinTinG', r'no fuTure queries', r'IMPORTANT NOTICE', r'mi[gG]h[tT] occur due', r'submission of incomplete', r'^\s*Contents\s*$', r'Page\s+No\.\s+Gazette', r'^\s*(Page|Gazette|No\.)\s*$', r'fax machine', r'OK.{0,3} slip', r'documents were received', r'respon-?\s*sibility to phone', r'amendments which have not been done', r'CONTENTS\s*[-•]\s*INHOUD', r'^\s*@@PAGE']
NOISE_RE = [re.compile(p, re.I) for p in NOISE]
PARA = re.compile(r'^\s*(\((?:\d{1,3}[A-Za-z]?|[a-z]{1,2}|[ivxlc]{1,6})\)|["“”]|\d{1,2}\.\s|[A-Z]\.\s)')

def load(path):
    pages, cur = [], None
    for line in open(path, encoding='utf-8', errors='replace').read().replace('­', '').replace('\f', '\n').split('\n'):
        m = re.match(r'@@PAGE (\d+)', line)
        if m: cur = int(m.group(1)); continue
        pages.append((cur or 1, line.rstrip()))
    return pages

def clean(pages):
    # running headers: short lines repeated on many pages
    cnt = Counter(l.strip() for _, l in pages if 3 < len(l.strip()) < 70)
    npages = len(set(p for p, _ in pages)) or 1
    repeated = {s for s, c in cnt.items() if c >= max(4, npages // 3) and not re.match(r'^\(?\w{1,3}[).]', s)}
    out = []
    for p, l in pages:
        s = l.strip()
        if not s or any(r.search(s) for r in NOISE_RE) or s in repeated: continue
        if re.search(r'\.{5,}\s*\d*\s*$', s): continue   # contents-page lines with dot leaders
        out.append((p, s))
    return out

def contents(lines):
    """Read a contents list ("1. Definitions", "2. Scope of application", ...) if there is one."""
    for i, (_, s) in enumerate(lines[:400]):
        if re.match(r'^(contents|table of contents|arrangement of regulations|index)$', s, re.I):
            titles, j = [], i + 1
            while j < len(lines):
                m = re.match(r'^(\d{1,3}[A-Z]?)\.?\s+([A-Z][^.]{2,120})$', lines[j][1])
                if m and (not titles or m.group(1) != '1'): titles.append((m.group(1), m.group(2).strip())); j += 1; continue
                if re.match(r'^(ANNEXURE|SCHEDULE|PART\b|CHAPTER\b)', lines[j][1], re.I) and titles: j += 1; continue
                break
            if len(titles) >= 3: return titles, j
    return None, 0

def num_val(n):
    m = re.match(r'(\d+)([A-Z]?)', n); return int(m.group(1)), m.group(2)

HAS_SHORT = False
OCR_MODE = len(sys.argv) > 3 and sys.argv[3] == 'ocr'

def split(lines):
    titles, start = contents(lines)
    items, cur = [], {'ref': 'Notice', 'title': 'Notice and preamble', 'lines': [], 'page': lines[0][0] if lines else 1}
    expected = 1
    done_regs = False
    global HAS_SHORT
    HAS_SHORT = any(re.match(r'^short title', x, re.I) for _, x in lines)
    tset = {n: t for n, t in (titles or [])}
    i = start
    for k in range(0, start): cur['lines'].append(lines[k])
    while i < len(lines):
        p, s = lines[i]
        m = re.match(r'^(\d{1,3}[A-Z]?)[.,]\s*[|=©_]?\s*(.*)$', s) if OCR_MODE else re.match(r'^(\d{1,3}[A-Z]?)\.\s*(.*)$', s)
        ann = re.match(r'^(ANNEXURE|ANNEXTURE|SCHEDULE)\s+([A-Z0-9]+)\b(.*)$', s) if len(s) < 120 else None
        is_reg = False
        if m:
            n, rest = m.group(1), m.group(2)
            v, letter = num_val(n)
            gap_ok = OCR_MODE and expected < v <= expected + 2 and (rest.startswith('(') or (cur['lines'] and len(cur['lines'][-1][1].split()) <= 8 and not re.search(r'[.;:,]$', cur['lines'][-1][1])))
            if (v == expected or gap_ok or (letter and v == expected - 1)) and not done_regs:
                if titles is None or n in tset or v == expected: is_reg = True
        if is_reg:
            n, rest = m.group(1), m.group(2)
            title = tset.get(n, '')
            body_first = rest
            if title and cur['lines'] and cur['lines'][-1][1].strip().lower().rstrip('.') == title.lower().rstrip('.'): cur['lines'].pop()
            if title and rest.lower().startswith(title.lower()[:20]): body_first = rest[len(title):].strip(' .–-')
            elif not title:
                def looks_title(t):
                    t = t.strip(); w = t.split()
                    return bool(t) and len(w) <= 9 and t[:1].isupper() and not re.search(r'[,;:"“”()]|[.–-]$', t) and not re.match(r'^(In|The|An?|Every|No|Any|If|Where|Subject|Notwithstanding|Whenever|When)\b', t)
                if looks_title(rest):
                    title, body_first = rest.strip(), ''
                elif cur['lines'] and looks_title(cur['lines'][-1][1]):
                    title = cur['lines'].pop()[1]
            items.append(cur)
            cur = {'ref': 'Regulation ' + n, 'num': n, 'title': title, 'lines': [(p, body_first)] if body_first else [], 'page': p}
            if re.match(r'^short title', title or '', re.I): done_regs = True
            expected = num_val(n)[0] + 1 if not num_val(n)[1] else num_val(n)[0] + 1
            i += 1; continue
        if ann and len(items) > 2 and (done_regs or not HAS_SHORT):
            items.append(cur)
            cur = {'ref': ann.group(1).title().replace('Annexture', 'Annexure') + ' ' + ann.group(2), 'title': ann.group(3).strip(' :–-'), 'lines': [], 'page': p}
            i += 1; continue
        cur['lines'].append((p, s)); i += 1
    items.append(cur)
    out = []
    for it in items:
        paras = []
        for _, s in it['lines']:
            if not paras or PARA.match(s): paras.append(s)
            else:
                paras[-1] = (paras[-1] + s) if paras[-1].endswith('-') and not paras[-1].endswith(' -') else (paras[-1] + ' ' + s)
        text = '\n'.join(paras).strip()
        if not text and it['ref'] == 'Notice': continue
        out.append({'ref': it['ref'], 'title': it.get('title', ''), 'page': it['page'], 'text': text})
    return out, bool(titles)

def split_amendment(lines):
    """Amendment notices headed "Regulation 13H: Housekeeping" (no running numbering)."""
    items, cur = [], {'ref': 'Notice', 'title': 'Notice and preamble', 'lines': [], 'page': lines[0][0] if lines else 1}
    for p, s in lines:
        m = re.match(r'^Regulations?\s+(\d{1,3}[A-Z]?)\s*[:.]\s*(.*?)[;.]?$', s)
        if m: items.append(cur); cur = {'ref': 'Regulation ' + m.group(1), 'num': m.group(1), 'title': m.group(2).strip(), 'lines': [], 'page': p}; continue
        cur['lines'].append((p, s))
    items.append(cur)
    return items

if __name__ == '__main__':
    pages = load(sys.argv[1])
    lines = clean(pages)
    items, had = split(lines)
    if len(items) <= 2 and sum(1 for _, s in lines if re.match(r'^Regulations?\s+\d{1,3}[A-Z]?\s*[:.]', s)) >= 2:
        raw = split_amendment(lines); items = []
        for it in raw:
            paras = []
            for _, s in it['lines']:
                if not paras or PARA.match(s): paras.append(s)
                else: paras[-1] = (paras[-1] + s) if paras[-1].endswith('-') and not paras[-1].endswith(' -') else (paras[-1] + ' ' + s)
            items.append({'ref': it['ref'], 'title': it['title'], 'page': it['page'], 'text': '\n'.join(paras).strip()})
    json.dump({'items': items, 'contents': had}, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
    print(f'{len(items)} items (contents list: {had}); refs: ' + ', '.join(x["ref"].replace("Regulation ", "") for x in items[:60]))
