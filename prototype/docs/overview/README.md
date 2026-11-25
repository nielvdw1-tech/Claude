# Product overview (client brochure)

- `overview.html` is the source; `render.js` makes `../VDW_Compliance_Control_System_Product_Overview.pdf` (12 A4 pages).
- To refresh the screenshots: `node shots.js`, `node shots_detail.js`, `node shot_portal.js`, then `python3 crop.py`, then `node render.js`.
- All screens show fictional demonstration data. Legal text claims must stay true to the system (official wording loaded from official documents; system interpretation separate).
- The earlier 7-page overview is kept in `../brochure/`.
