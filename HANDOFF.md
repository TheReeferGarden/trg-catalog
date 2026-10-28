# HANDOFF: trg-catalog to thereefergarden-site

## Flow
1. The catalog bot commits the files to `handoff/<YYYY-MM-DD>-<name>/` in https://github.com/TheReeferGarden/trg-catalog (public on purpose: GitHub Pages serves the live catalog from it).
2. Richard pastes the prompt below into the TRG Grok Build chat.
3. The chat pulls this repo, copies the files byte-for-byte, and pushes to thereefergarden-site.
4. Richard presses Publish.
5. The catalog bot verifies the live md5 and bytes.

## Current handoff status
`handoff/2026-10-28-catalog-refresh/`, built 2026-10-28: waiting for Richard to paste the prompt. Replaces the stale Oct 18 `/catalog.json` in the site (4,349 items, 1,852 of them out of stock).

| File | md5 | bytes | Destination in thereefergarden-site | Status |
|---|---|---|---|---|
| `handoff/2026-10-28-catalog-refresh/catalog.json` | `6cabb754f05d53c67c9ba49ecd2cdcba` | 970162 | `/catalog.json` | pending (2538 items, none out of stock) |

## Prompt for the TRG Grok Build chat
````markdown
Pull the latest main from https://github.com/TheReeferGarden/trg-catalog. Copy these files from handoff/2026-10-28-catalog-refresh/ into thereefergarden-site, byte-for-byte (no editing, merging, or regenerating): catalog.json -> /catalog.json. Confirm the md5 of each copied file matches: catalog.json: 6cabb754f05d53c67c9ba49ecd2cdcba (970162 bytes). Commit and push to thereefergarden-site, then say 'ready to publish'.
````

## Rules
- Catalog data, filter chips, Details text and photos already go live through GitHub Pages from this repo (about 10 minutes after each push). They are not handoffs.
- Handoffs are only for files the site itself keeps a copy of, like the fallback `/catalog.json`.
- The catalog bot never pushes into thereefergarden-site. Its Grok Build chat owns it.
- Every file is listed with md5 and bytes. No secrets, supplier data or wholesale data in this repo.
