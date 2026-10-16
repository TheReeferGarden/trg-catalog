# trg-catalog

Fish preorder catalog for The Reefer Garden (https://thereefergarden.com/fish-preorder).

- `catalog.json` is the catalog the preorder page loads. The site's own `/catalog.json` is the fallback if this file can't be reached.
- `img/` (optional) holds photos for new fish. Put the full https URL in the item's `image` field.
- Changes are reviewed before they're pushed here. A push goes live on the page within about 10 minutes.

## Corals (2026-10-16)
Corals are off the preorder page until TRG has its own photos (Richard, Oct 16). `excluded.json` keys `blockedSunPetPrefixes` (Sun Pet groups 447/450/453/459/460) and `blockedCategories` (Saltwater Stony Coral, Stony Coral Frags, Polyp, Mushroom Coral, Sea Fan & Gorgonian) make the Sun Pet daily sync skip them. Anemones and sponges stay, under Saltwater > Inverts in `filter-groups.json`. See /workspace/sunpet/daily/RUN_NOTES.md to reverse.
