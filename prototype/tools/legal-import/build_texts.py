"""Build prototype/legal-texts.js from the catalogue and the split texts.
The wording is copied as extracted; nothing is paraphrased. Items carry their page number in the source file."""
import json, glob, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from catalogue import C

J = os.path.join(os.path.dirname(__file__), 'regs', 'json')
OCR = set(open(os.path.join(os.path.dirname(__file__), 'regs', 'pages', 'OCR_FILES')).read().split()) if os.path.exists(os.path.join(os.path.dirname(__file__), 'regs', 'pages', 'OCR_FILES')) else set()
U = '/root/.claude/uploads/7d4f6c8e-b914-5666-8fd6-2efd4bb672a3'

# Transcribed word for word from the scanned pages (they have no text layer). Errors in the original are kept.
MANUAL = {
 'LT-ASB-AM2024': [
  {'ref': 'Notice', 'title': 'Notice and preamble', 'page': 1, 'text': 'DEPARTMENT OF EMPLOYMENT AND LABOUR\nNO. R. 5042 12 July 2024\nOCCUPATIONAL HEALTH AND SAFETY ACT, 1993 (ACT NO. 85 OF 1993)\nASBESTOS ABATEMENT REGULATIONS, 2020 AS AMENDED.\nI, Thembelani W Nxesi, Minister of Employment and Labour has, under section 43 of the Occupational Health and Safety Act, 1993 (Act No. 85 of 1993), and after consultation with the Advisory Council for Occupational Health and Safety, to made the following amendments to the Asbestos Abatement Regulations in the Schedule as published in Notice No 1196, in Gazette No 43893, published on 10 November 202 as follows:'},
  {'ref': 'Regulation 24', 'title': 'Prohibitions', 'page': 1, 'amends': 'Regulation 24', 'text': 'No person may -\n(f) use electrical power tools, such as angle grinders, or any other fast-moving equipment to cut, grind or drill asbestos-containing material; Provided that slow moving tools may only be used where the activity is part of asbestos containing material removal for final disposal;\n(j) make any installation or fitting on or onto asbestos containing materials.\n• Underlined text was added\n[In the Gazette the added text is underlined: "Provided that slow moving tools may only be used where the activity is part of asbestos containing material removal for final disposal;" and paragraph (j).]'}],
 'LT-MHI-CORR': [
  {'ref': 'Notice', 'title': 'Correction notice', 'page': 3, 'text': 'DEPARTMENT OF EMPLOYMENT AND LABOUR\nNO. R. 3420 19 May 2023\nI, Mr Thembelani Waltermade Nxesi, Minister of Employment and Labour, hereby: issue this statement to correct an error made in the General Notice gazetted on Government Gazette Notice No. 11536 of 2023 which was published in Gazette No. 47970 on 31 January 2023.\nThe Notice stated that "MAJOR HAZARD INSTALLATION REGULATIONS 20XX", on page 4.\nThe correct statement should read as follows: "MAJOR HAZARD INSTALLATION REGULATIONS, 2022".\nFurthermore, the Department of Employment and Labour seeks to advise that the MAJOR HAZARD INSTALLATION REGULATIONS, 2022, came into force on the 31 January 2023.'}],
}
COPY = {'gazette': 'Government Gazette copy', 'gazette-ocr': 'Government Gazette copy — scanned; text read by OCR', 'reproduction': 'Publisher reproduction of the Gazette (not the Gazette itself)', 'unofficial': 'Unofficial retyped copy — not a Government Gazette', 'department': 'Department of Labour publication', 'international': 'International publication'}

def slug(s): return re.sub(r'[^A-Za-z0-9]+', '', s)

out, report = {}, []
files = {os.path.basename(p).split('-')[0]: p for p in glob.glob(J + '/*.json')}
srcs = {os.path.basename(p).split('-')[0]: os.path.basename(p) for p in glob.glob(U + '/*.pdf')}
for key, m in C.items():
    base = key.split('#')[0]
    meta = {k: v for k, v in m.items() if k not in ('pages_skip', 'manual', 'notext')}
    meta['copyNote'] = COPY[m['copy']]
    meta['file'] = re.sub(r'^[0-9a-f]{8}-', '', srcs.get(base, ''))
    meta['ocr'] = m['copy'] == 'gazette-ocr' or any(base in o for o in OCR)
    items = []
    if m['id'] in MANUAL: items = MANUAL[m['id']]; meta['transcribed'] = True
    elif not m.get('notext') and base in files:
        items = json.load(open(files[base]))['items']
    if m['id'] == 'LT-CR':   # OCR lost the number of regulation 4: split it at its heading
        for k, it in enumerate(items):
            if it['ref'] == 'Regulation 3' and 'Notification of construction work\n' in it['text']:
                a, b = it['text'].split('Notification of construction work\n', 1)
                it['text'] = a.strip(); items.insert(k + 1, {'ref': 'Regulation 4', 'title': 'Notification of construction work', 'page': it['page'], 'text': b.strip(), 'note': 'The number of this regulation was not recognised by OCR; it was separated at its heading. Check it against the scanned page.'}); break
    for it in items:   # symbols the PDF does not map to text (e.g. equations) are shown as a box
        if '\ufffd' in it['text']: it['text'] = it['text'].replace('\ufffd', '\u25a1'); it['note'] = 'Some symbols (e.g. equations) could not be read from the PDF and are shown as \u25a1. See page ' + str(it['page']) + ' of the original.'
    for it in items: it['id'] = m['id'] + '-' + slug(it['ref'])
    seen = {}
    for it in items:
        if it['id'] in seen: seen[it['id']] += 1; it['id'] += '-' + str(seen[it['id']])
        else: seen[it['id']] = 1
    meta['items'] = items
    meta['words'] = sum(len(i['text'].split()) for i in items)
    out[m['id']] = meta
    report.append(f"{m['id']:18} {m['kind']:22} items {len(items):3}  words {meta['words']:6}  {'OCR' if meta['ocr'] else ''} {'' if items or m.get('notext') else 'NO TEXT YET'}")
js = '/* Legal texts loaded from the documents the owner provided (Nov 2026).\n   The wording is as extracted from each document — not paraphrased. Page furniture (gazette headers and footers) is removed and line wraps are joined.\n   Every regulation must be checked against the original by a competent person before use (see the Legal library). */\n"use strict";\nconst LEGAL_TEXTS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(sys.argv[1], 'w').write(js)
print('\n'.join(report)); print('entries', len(out), 'size', round(len(js) / 1024), 'KB')
