# HANDOFF: trg-catalog to thereefergarden-site

## Flow
1. The catalog bot commits the files to `handoff/<YYYY-MM-DD>-<name>/` in https://github.com/allsiterepos/trg-catalog (public on purpose: GitHub Pages serves the live catalog from it).
2. Richard pastes the prompt below into the TRG Grok Build chat.
3. The chat pulls this repo, copies the files byte-for-byte, and pushes to thereefergarden-site.
4. Richard presses Publish.
5. The catalog bot verifies the live md5 and bytes.

## Current handoff status
`handoff/2026-10-28-rename-allsiterepos/`, staged 2026-10-28: waiting for the GitHub account rename to `allsiterepos`. The only change is the GitHub Pages host in the two files the site keeps: `thereefergarden.github.io` becomes `allsiterepos.github.io`. Paste the prompt only AFTER the rename is done and `https://allsiterepos.github.io/trg-catalog/catalog.json` returns 200.

| File | md5 | bytes | Destination in thereefergarden-site | Status |
|---|---|---|---|---|
| `handoff/2026-10-28-rename-allsiterepos/catalog.json` | `e8572bd3902fded1b0b61407caadc943` | 965299 | `/catalog.json` | staged (rename only, same items as the live fallback) |
| `handoff/2026-10-28-rename-allsiterepos/preorder.js` | `86f3e54beafc7d6529350128b70c8fdc` | 49558 | `/preorder.js` | staged (3 URLs changed) |

Previous: `handoff/2026-10-28-test/` (same `/catalog.json`, old host, already used).

## Prompt for the TRG Grok Build chat
````markdown
Pull the latest main from https://github.com/allsiterepos/trg-catalog. Copy these files from handoff/2026-10-28-rename-allsiterepos/ into thereefergarden-site, byte-for-byte (no editing, merging, or regenerating): catalog.json -> /catalog.json; preorder.js -> /preorder.js. Confirm the md5 of each copied file matches: catalog.json: e8572bd3902fded1b0b61407caadc943 (965299 bytes); preorder.js: 86f3e54beafc7d6529350128b70c8fdc (49558 bytes). Commit and push to thereefergarden-site, then say 'ready to publish'.
````

## Rules
- Catalog data, filter chips, Details text and photos already go live through GitHub Pages from this repo (about 10 minutes after each push). They are not handoffs.
- Handoffs are only for files the site itself keeps a copy of, like the fallback `/catalog.json`.
- The catalog bot never pushes into thereefergarden-site. Its Grok Build chat owns it.
- Every file is listed with md5 and bytes. No secrets, supplier data or wholesale data in this repo.
