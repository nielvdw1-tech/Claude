# Prototype tools

- `build_services.py` generates the three service pages from one template. The page text lives in `pages_content.py`. After editing it, run this from the `prototype/` folder:
  `python3 tools/build_services.py .`
- `build_preview.py` builds the self-contained copy used for the private preview link:
  `python3 tools/build_preview.py . <output-folder>`

The homepage (`index.html`) and the landing page (`free-assessment.html`) are edited directly.
- `check_layout.js` opens every page at 20 screen widths, from 320px phones to 2560px monitors, and reports sideways scrolling, elements past the screen edge, clipped text and header overlaps. Run it from the `prototype/` folder after layout changes:
  `node tools/check_layout.js "$PWD"`
