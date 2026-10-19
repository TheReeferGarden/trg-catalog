# trg-catalog

Preorder catalog for The Reefer Garden (https://thereefergarden.com/fish-preorder).

- `catalog.json` is the catalog the preorder page loads. The site's own `/catalog.json` is the fallback if this file can't be reached.
- Each item carries only customer-facing fields: `sku`, `name`, `group`, `size`, `size_label`, `department`, `category`, `price` (customer retail), `inStock`, `scientific`, `image`, `photo_credit`, `careId`, `newSince`, `backInStockSince`; plus top-level `pricesUpdated`.
- `details/<department>/<category>.json` holds the text behind each item's Details button.
- `filter-groups.json` holds the filter chips shown under each department tab.
- `img/` holds item photos. Put the full https URL in the item's `image` field.
- Changes are reviewed before they're pushed here. A push goes live on the page within about 10 minutes.

## Corals (2026-10-16)
Corals are off the preorder page until TRG has its own photos (Richard, Oct 16). Anemones and sponges stay, under Saltwater > Inverts in `filter-groups.json`.
