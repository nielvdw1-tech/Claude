# pdf-lib (vendored)

- `pdf-lib.min.js` — pdf-lib 1.17.1 by Andrew Dillon, MIT licence (see `LICENSE.md`). Adds the control stamp to downloaded documents. Loaded only when a stamped copy is downloaded.
- The 44 non-ASCII characters in the published file were rewritten as `\uXXXX` escapes (same meaning in JavaScript) so the file is plain ASCII. Nothing else was changed.
