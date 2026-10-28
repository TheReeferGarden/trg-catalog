# HANDOFF: trg-catalog to thereefergarden-site

This repo is public on purpose. GitHub Pages serves it at https://thereefergarden.github.io/trg-catalog/ and the live preorder page loads it from there. Do not make it private, or the page loses its catalog. It holds only customer-safe data (checked by a leak scan before every push).

## What goes live without any Publish
These load straight from this repo, so a push here shows up on the preorder page within about 10 minutes. No Grok Build step is needed.

- `catalog.json`: items, prices, stock, photos (only in-stock sizes appear)
- `filter-groups.json`: filter chips
- `details/<department>/<category>.json`: text behind the Details buttons
- `img/`: item photos

## What the site repo (thereefergarden-site) keeps as its own copy
`preorder.js` falls back to the site's own `/catalog.json` if this repo can't be reached, and uses `/care.json` for care info. Those two copies are not updated by this repo's pushes, so they go stale. As of Oct 27 2026 the site's `/catalog.json` is the Oct 18 version (4,349 items, 1,852 of them out of stock), which customers must never see.

| File in this repo | Where it goes in thereefergarden-site | Note |
|---|---|---|
| `catalog.json` | `/catalog.json` | replace the whole file |
| `details/` (whole folder) | `/details/` | replace the whole folder |
| `filter-groups.json` | not used by the site copy | nothing to do |

Do not change `preorder.js`, `preorder.html`, `care.json` or anything else for this refresh.

## Prompt to paste into the TRG Grok Build chat
```
Refresh the fallback catalog copies in this site from the public repo https://github.com/TheReeferGarden/trg-catalog (branch main). Replace /catalog.json with that repo's catalog.json, and replace the whole /details/ folder with that repo's details/ folder. Do not change preorder.js, preorder.html, care.json, or any other file. After the change, confirm /catalog.json has no items with inStock false, then push to thereefergarden-site as usual. I will press Publish.
```

## Rules for this repo
- Never commit secrets, supplier or wholesale data, or markup. The pre-commit hook blocks leaks.
- The TRG catalog desk pushes here after every catalog change with a plain commit message.
- Do not push into thereefergarden-site from here. Its Grok Build chat owns it.
