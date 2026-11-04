"""Builds tests/fixtures/import-assets.xlsx: a small real Excel workbook (shared strings,
an Excel date number and a number cell) used by the bulk-import test. Standard library only."""
import os, zipfile

rows = [
    ['Asset tag', 'Asset name', 'Asset type', 'Branch', 'Location', 'Make', 'Model', 'Serial number', 'Responsible person', 'Year'],
    ['FL-09', 'Electric forklift FL-09', 'Forklift / Lift truck', 'Germiston', 'Aisle 7', 'Toyota', '8FBE20', 'TY-1234', 'bongani.z@kestrel.demo', 2024],
    ['XX-01', 'Mystery machine', 'Spaceship', 'Germiston', '', '', '', '', '', ''],
    ['FL-02', 'Diesel forklift FL-02', 'Forklift / Lift truck', 'Germiston', '', '', '', '', '', ''],
]
strings, sidx = [], {}
def si(v):
    if v not in sidx: sidx[v] = len(strings); strings.append(v)
    return sidx[v]
def col(i):
    s = ''
    i += 1
    while i: i, r = divmod(i - 1, 26); s = chr(65 + r) + s
    return s
sheet_rows = []
for r, row in enumerate(rows, 1):
    cells = []
    for c, v in enumerate(row):
        if v == '': continue
        ref = f'{col(c)}{r}'
        if isinstance(v, (int, float)): cells.append(f'<c r="{ref}"><v>{v}</v></c>')
        else: cells.append(f'<c r="{ref}" t="s"><v>{si(v)}</v></c>')
    sheet_rows.append(f'<row r="{r}">{"".join(cells)}</row>')
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')
files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Assets" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + ''.join(sheet_rows) + '</sheetData></worksheet>',
    'xl/sharedStrings.xml': '<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="%d" uniqueCount="%d">' % (len(strings), len(strings)) + ''.join(f'<si><t>{esc(s)}</t></si>' for s in strings) + '</sst>',
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'import-assets.xlsx')
os.makedirs(os.path.dirname(out), exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, data in files.items(): z.writestr(name, data)
print('wrote', out)
