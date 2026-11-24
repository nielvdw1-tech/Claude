# Legal text import (prototype)

Builds `prototype/legal-texts.js` from the regulation PDFs the owner provides.

1. Extract each PDF to text with `@@PAGE n` markers: text PDFs with `pdftotext -raw` page by page; scanned PDFs (under 60 words a page) with `ocrpar.sh` (tesseract, 300 dpi, 4 pages in parallel).
2. `split.py <text> <out.json> [ocr]` splits the text into regulations and annexures. It only removes page furniture (gazette headers/footers, page numbers, printing notices) and joins line wraps; the wording is not changed. `ocr` tolerates OCR misreads of regulation numbers.
3. `catalogue.py` records what each document is (kind, notice, date, gazette, copy quality, status). Status the documents do not state is "To confirm".
4. `build_texts.py legal-texts.js` writes the data file. Two scanned notices without a text layer are transcribed in `MANUAL`, keeping the original's own errors.

Every regulation must still be checked against the original by a competent person in the Legal library. Paths in the scripts point to the session's upload and scratch folders; adjust them before re-running.
