/* Fish preorder catalog. Prices come from catalog.json. Not a checkout. */
(function () {
  var STORE = {
    phoneDisplay: "(870) 761-8884",
    phoneSms: "+18707618884",
    email: "info@thereefergarden.com",
    address: "11131 Highway 49 N, Brookland, AR 72417"
  };
  var SIZE_LABEL = {
    Sml: "Small", Med: "Medium", Reg: "Regular", Lrg: "Large", Xlg: "XL", XXL: "XXL",
    Tny: "Tiny", Tiny: "Tiny", "M/S": "Medium/small", "M/L": "Medium/large",
    Pair: "Pair", Colony: "Colony", Frag: "Frag"
  };
  var SIZE_ORDER = ["Tiny", "Small", "Medium/small", "Regular", "Medium", "Medium/large", "Large", "XL", "XXL", "Pair", "Colony", "Frag"];
  var GROUPS = [
    { id: "plants", label: "Plants", dept: "Freshwater", match: /plant|bulb|moss|fern|anubias|java|crypt|sword|vallisneria|hornwort/i },
    { id: "community", label: "Community fish", dept: "Freshwater", match: /tetra|rasbora|danio|minnow|barb|rainbow|livebearer|guppy|molly|platy|swordtail|variatus|nano/i },
    { id: "cichlid", label: "Cichlids", dept: "Freshwater", match: /cichlid|angelfish|apistogramma|discus|malawi|tanganyika|neotropical|oscar/i },
    { id: "catfish", label: "Catfish & loaches", dept: "Freshwater", match: /catfish|cory|pleco|synodontis|botia|loach/i },
    { id: "bettas", label: "Bettas", dept: "Freshwater", match: /^Betta / },
    { id: "gourami", label: "Gouramis", dept: "Freshwater", match: /gourami|anabantoid/i },
    { id: "pond", label: "Goldfish & koi", dept: "Freshwater", match: /goldfish|koi/i },
    { id: "fw-invert", label: "Shrimp & snails", dept: "Freshwater", match: /crustacean|snail|shrimp/i },
    { id: "fw-other", label: "Oddballs & others", dept: "Freshwater", match: /./ },
    { id: "clown", label: "Clownfish", dept: "Saltwater", match: /clown/i },
    { id: "tang", label: "Tangs & angels", dept: "Saltwater", match: /tang|surgeon|angelfish|dwarf angel/i },
    { id: "butterfly", label: "Butterflyfish", dept: "Saltwater", match: /butterfly|heniochus/i },
    { id: "sw-fish", label: "Other marine fish", dept: "Saltwater", match: /wrasse|blenny|goby|cardinal|damsel|anthias|basslet|pseudochromis|trigger|puffer|eel|jawfish|hawk|grouper|filefish|hogfish|rabbitfish|lionfish|scorpion|dragonet|seahorse|pipefish|boxfish|cowfish|parrotfish|hamlet|sweetlips|flounder|toadfish|clingfish|squirrel|soldier|snapper/i },
    { id: "sharks", label: "Sharks & rays", dept: "Saltwater", match: /^Marine Shark & Ray / },
    { id: "live-rock", label: "Live rock", dept: "Saltwater", match: /^Live Rock / },
    { id: "coral", label: "Coral & anemones", dept: "Saltwater", match: /coral|anemone|mushroom|polyp|gorgonian|zoanthid/i },
    { id: "sw-invert", label: "Marine inverts", dept: "Saltwater", match: /shrimp|crab|lobster|snail|starfish|urchin|clam|cucumber|nudibranch|feather|octopus|cephalopod|sponge/i },
    { id: "sw-other", label: "Other saltwater", dept: "Saltwater", match: /./ }
  ];
  var FEATURED = ["plants", "community", "cichlid", "catfish", "bettas", "gourami", "pond", "clown", "tang", "butterfly", "sw-fish", "sharks", "live-rock", "coral", "sw-invert"];
  var LIST_KEY = "trgFishPreorder";
  var PAGE = 48;
  var FRESH_DAYS = 7;

  var items = [];
  var care = null;
  var DETAILS_BASE = "https://allsiterepos.github.io/trg-catalog/details/";
  var detailsFiles = {};
  var detailsTicket = 0;
  var dept = "all";
  var group = "all";
  var broad = "all";
  var FILTER_GROUPS_URL = "https://allsiterepos.github.io/trg-catalog/filter-groups.json";
  var filterGroups = null;
  var sort = "az";
  var stockMode = "all";
  var query = "";
  var shown = PAGE;
  var list = loadList();

  function money(n) {
    var cents = Math.round(n * 100);
    var sign = cents < 0 ? "-" : "";
    var abs = Math.abs(cents);
    return sign + "$" + Math.floor(abs / 100) + "." + String(abs % 100).padStart(2, "0");
  }
  function stripSize(name) {
    return name.replace(/\b(Sml|Med|Reg|Lrg|Xlg|XXL|Tny|Tiny|M\/S|M\/L|Pair|Colony|Frag)\s*$/i, "").replace(/\s+/g, " ").trim();
  }
  function sizeLabel(size, name) {
    if (size && SIZE_LABEL[size]) return SIZE_LABEL[size];
    var m = String(name).match(/\b(Sml|Med|Reg|Lrg|Xlg|XXL|Tny|Tiny|M\/S|M\/L|Pair|Colony|Frag)\s*$/i);
    if (!m) return size || "";
    return SIZE_LABEL[m[1]] || m[1];
  }
  function groupOf(item) {
    if (item.department === "Freshwater" && /^plants?$/i.test(String(item.category || ""))) return "plants";
    if (item.department === "Freshwater" && item.category === "Roots-in-Water Plants") return "fw-roots";
    if (item.department === "Saltwater" && item.category === "Marine Plant & Algae") return "sw-plants";
    if (item.department !== "Freshwater" && item.department !== "Saltwater") return "cat:" + (item.category || "Other");
    var hay = item.category + " " + item.name;
    var pool = GROUPS.filter(function (g) { return g.dept === item.department && g.id !== "plants"; });
    var hit = pool.find(function (g) { return !g.id.endsWith("other") && g.match.test(hay); });
    return (hit || pool[pool.length - 1] || GROUPS[0]).id;
  }
  var EXTRA_PHOTOS = {
    "803-0045-1": { image: "/img/extra/rotala-magenta.webp", credit: "Photo: Aquatic Motiv" },
    "438-0010-3": { image: "/img/extra/red-macro-algae.jpg", credit: "Photo: Aquaculture Nursery Farms" },
    "927-0225-5": { image: "/img/extra/sabawood.jpg", credit: "Photo: Aquariums West" },
    "927-0225-6": { image: "/img/extra/sabawood.jpg", credit: "Photo: Aquariums West" },
    "812-0047-1": { image: "/img/extra/arrowhead.jpg", credit: "Photo: Jeremyida002, CC BY-SA 4.0" },
    "963-0100-9": { image: "/img/extra/coco-disc.jpg", credit: "Photo: MatiasMiika, CC BY 3.0" }
  };
  function validDay(s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(s || "")) ? String(s) : "";
  }
  function storeToday() {
    var d = new Date();
    try {
      var parts = {};
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(d).forEach(function (p) { parts[p.type] = p.value; });
      if (parts.year && parts.month && parts.day) return parts.year + "-" + parts.month + "-" + parts.day;
    } catch (e) {}
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dayNumber(s) {
    var p = s.split("-");
    return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  function freshInfo(it, today) {
    if (!it.inStock) return null;
    var best = null;
    [["new", it.newSince], ["back", it.backInStockSince]].forEach(function (pair) {
      if (!pair[1]) return;
      if (today - dayNumber(pair[1]) > FRESH_DAYS - 1) return;
      if (!best || pair[1] > best.date) best = { kind: pair[0], date: pair[1] };
    });
    return best;
  }
  function groupFresh(variants) {
    var best = null;
    variants.forEach(function (v) {
      if (v.fresh && (!best || v.fresh.date > best.date)) best = v.fresh;
    });
    return best;
  }
  function publicCredit(credit) {
    var s = String(credit || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    if (/manufacturer/i.test(s)) return "Photo: manufacturer";
    if (/CC BY|creativecommons|iNaturalist|Wikimedia/i.test(s)) return s;
    return "";
  }
  function prepare(raw) {
    var today = dayNumber(storeToday());
    return raw.filter(function (it) {
      var name = String(it.name || "");
      if (/walk in aviary/i.test(name)) return false;
      if (/tee shirt/i.test(name)) return false;
      return true;
    }).map(function (it) {
      return {
        sku: it.sku,
        name: it.name,
        displayName: it.group || stripSize(it.name),
        size: it.size_label || sizeLabel(it.size, it.name),
        department: it.department,
        category: it.category,
        inStock: !!it.inStock,
        scientific: it.scientific || "",
        image: it.image || (EXTRA_PHOTOS[it.sku] && EXTRA_PHOTOS[it.sku].image) || "",
        price: typeof it.price === "number" ? it.price : null,
        careId: it.careId || "",
        photoCredit: publicCredit(it.photo_credit || (EXTRA_PHOTOS[it.sku] && EXTRA_PHOTOS[it.sku].credit) || ""),
        group: groupOf(it),
        newSince: validDay(it.newSince),
        backInStockSince: validDay(it.backInStockSince)
      };
    }).map(function (row) {
      row.fresh = freshInfo(row, today);
      return row;
    });
  }
  function loadList() {
    try {
      var saved = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
      var kept = saved.filter(function (row) {
        return row.sku !== "247-0050-1" && !/axolotl/i.test(row.name || "");
      });
      if (kept.length !== saved.length) localStorage.setItem(LIST_KEY, JSON.stringify(kept));
      return kept;
    }
    catch (e) { return []; }
  }
  function saveList() { localStorage.setItem(LIST_KEY, JSON.stringify(list)); }
  function digits(s) {
    var t = String(s || "").replace(/\D/g, "");
    if (t.length === 11 && t.charAt(0) === "1") t = t.slice(1);
    return t;
  }
  function formatPhone(s) {
    var t = digits(s);
    return t.length === 10 ? "(" + t.slice(0, 3) + ") " + t.slice(3, 6) + "-" + t.slice(6) : String(s || "").trim();
  }
  function labelOf(it) {
    if (!it.size || it.displayName.toLowerCase().indexOf(it.size.toLowerCase()) !== -1) return it.displayName;
    return it.displayName + " (" + it.size + ")";
  }
  function groupByName(rows) {
    var order = [];
    var map = {};
    rows.forEach(function (r) {
      var key = r.department + "\0" + r.displayName.toLowerCase();
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(r);
    });
    return order.map(function (key) {
      var variants = map[key].slice().sort(function (a, b) {
        var pa = a.price == null ? Infinity : a.price, pb = b.price == null ? Infinity : b.price;
        if (pa !== pb) return pa - pb;
        var ia = SIZE_ORDER.indexOf(a.size);
        var ib = SIZE_ORDER.indexOf(b.size);
        if (ia !== -1 && ib !== -1 && ia !== ib) return ia - ib;
        return a.size.localeCompare(b.size) || a.sku.localeCompare(b.sku);
      });
      return variants;
    });
  }
  function leadOf(variants) {
    return variants.find(function (v) { return v.inStock; }) || variants[0];
  }
  function plainSize(v, many) {
    var s = String(v.size || "").replace(/\s*Code\s+\S+\s*$/i, "").trim();
    if (!s && v.size) s = sizeLabel("", v.name);
    s = s.replace(/\b(Sml|Med|Reg|Lrg|Xlg|Tny|Shw)\b/g, function (w) { return w === "Shw" ? "Show" : SIZE_LABEL[w]; });
    return s || (many ? "Standard" : "");
  }
  function sizeText(v, variants) {
    var many = !!(variants && variants.length > 1);
    var s = plainSize(v, many);
    if (many && variants.some(function (x) { return x !== v && plainSize(x, true) === s; })) s += " (item " + v.sku + ")";
    return s;
  }
  function sortGroups(groups) {
    var list = groups.slice();
    list.sort(function (a, b) {
      if (stockMode === "new") {
        var af = groupFresh(a), bf = groupFresh(b);
        var ad = af ? af.date : "", bd = bf ? bf.date : "";
        if (ad !== bd) return ad < bd ? 1 : -1;
      }
      var an = a[0].displayName.toLowerCase();
      var bn = b[0].displayName.toLowerCase();
      var ap = leadOf(a).price == null ? Infinity : leadOf(a).price;
      var bp = leadOf(b).price == null ? Infinity : leadOf(b).price;
      if (sort === "za") return bn.localeCompare(an);
      if (sort === "lo") return ap - bp || an.localeCompare(bn);
      if (sort === "hi") return (bp === Infinity ? -1 : bp) - (ap === Infinity ? -1 : ap) || an.localeCompare(bn);
      return an.localeCompare(bn);
    });
    return list;
  }
  function isHeld(it) {
    if (!it) return false;
    if (it.department === "Freshwater" || it.department === "Saltwater" || it.department === "Dry Good") return true;
    var cat = String(it.category || "");
    var name = String(it.name || "");
    if (it.group === "plants" || it.group === "sw-plants") return true;
    if (/^plants?$/i.test(cat) || cat === "Marine Plant & Algae") return true;
    if (cat === "Bio-Active" && !/isopod|springtail/i.test(name)) return true;
    if (cat === "Insect - Feeder") return true;
    if (/frozen|fozen/i.test(cat + " " + name)) return true;
    return false;
  }
  function isWednesdayArrival(it) {
    if (!it || it.department === "Dry Good") return false;
    if (it.department === "Freshwater" || it.department === "Saltwater") return true;
    if (it.group === "plants" || it.group === "sw-plants") return true;
    var cat = String(it.category || "");
    return /^plants?$/i.test(cat) || cat === "Marine Plant & Algae";
  }
  function isDry(it) {
    return !!(it && it.department === "Dry Good");
  }
  function broadOf(it) {
    var list = filterGroups && filterGroups.departments ? filterGroups.departments[it.department] : null;
    if (!list) return "other";
    for (var i = 0; i < list.length; i++) {
      if ((list[i].categories || []).indexOf(it.category) !== -1) return list[i].id;
    }
    return "other";
  }
  function broadList(d) {
    if (!filterGroups || !filterGroups.departments || d === "all") return null;
    var list = filterGroups.departments[d];
    if (!list || list.length < 2) return null;
    return list;
  }
  function catLabel(d, c) {
    var labels = (filterGroups && filterGroups.labels) || {};
    return labels[d + "|" + c] || c;
  }
  function filtered(skipGroups) {
    var q = query.trim().toLowerCase();
    var twoLevel = !!broadList(dept);
    return items.filter(function (it) {
      if (stockMode === "in" && !it.inStock) return false;
      if (stockMode === "new" && !it.fresh) return false;
      if (dept !== "all" && it.department !== dept) return false;
      if (!skipGroups && twoLevel && broad !== "all" && broadOf(it) !== broad) return false;
      if (!skipGroups && twoLevel && group !== "all" && "cat:" + (it.category || "Other") !== group) return false;
      if (!skipGroups && !twoLevel && group !== "all" && it.group !== group) return false;
      if (!q) return true;
      return (it.displayName + " " + it.name + " " + it.scientific + " " + it.category + " " + it.sku).toLowerCase().indexOf(q) !== -1;
    });
  }
  function el(id) { return document.getElementById(id); }
  function status(msg) { el("status").textContent = msg || ""; }

  function subBox() {
    var sub = el("subgroups");
    if (!sub) {
      sub = document.createElement("div");
      sub.id = "subgroups";
      sub.className = "groups mt-2 flex gap-2 overflow-x-auto pb-1";
      el("groups").insertAdjacentElement("afterend", sub);
    }
    return sub;
  }
  function renderGroups() {
    var box = el("groups");
    box.innerHTML = "";
    var sub = subBox();
    sub.innerHTML = "";
    sub.classList.add("hidden");
    var bl = broadList(dept);
    if (bl) { renderTwoLevel(box, sub, bl); return; }
    function chip(id, label, on) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border " + (on ? "bg-orange-500 border-orange-500 text-slate-950" : "border-slate-600 text-slate-200");
      b.textContent = label;
      b.addEventListener("click", function () {
        group = id;
        shown = PAGE;
        renderGroups();
        renderGrid();
        showHoldNote();
      });
      box.appendChild(b);
    }
    var otherDept = dept !== "all" && dept !== "Freshwater" && dept !== "Saltwater";
    chip("all", dept === "Saltwater" ? "All saltwater" : dept === "Freshwater" ? "All freshwater" : otherDept ? "All " + deptLabel(dept).toLowerCase() : "All groups", group === "all");
    if (otherDept) {
      var cats = [];
      items.forEach(function (it) {
        if (it.department === dept && it.category && cats.indexOf(it.category) === -1) cats.push(it.category);
      });
      cats.sort(function (a, b) { return a.localeCompare(b); }).forEach(function (c) { chip("cat:" + c, c, group === "cat:" + c); });
      box.scrollLeft = 0;
      return;
    }
    var hasPlants = items.some(function (it) { return it.group === "plants"; });
    if (hasPlants && (dept === "Freshwater" || dept === "all")) chip("plants", "Aquarium Plants", group === "plants");
    var hasRoots = items.some(function (it) { return it.group === "fw-roots"; });
    if (hasRoots && (dept === "Freshwater" || dept === "all")) chip("fw-roots", "Roots-in-Water Plants", group === "fw-roots");
    var hasSwPlants = items.some(function (it) { return it.group === "sw-plants"; });
    if (hasSwPlants && dept === "Saltwater") chip("sw-plants", "Plants & Algae", group === "sw-plants");
    GROUPS.forEach(function (g) {
      if (g.id === "plants") return;
      if (dept !== "all" && g.dept !== dept) return;
      if (dept === "all" && FEATURED.indexOf(g.id) === -1) return;
      chip(g.id, g.label, group === g.id);
    });
    box.scrollLeft = 0;
  }
  function renderTwoLevel(box, sub, bl) {
    var base = filtered(true);
    var counts = { all: groupByName(base).length };
    var byBroad = {};
    base.forEach(function (it) {
      var b = broadOf(it);
      (byBroad[b] = byBroad[b] || []).push(it);
    });
    function pill(target, label, n, on, small, onClick) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "shrink-0 rounded-full border font-semibold " + (small ? "px-3 py-1.5 text-xs " : "px-4 py-2 text-sm ") +
        (on ? "bg-orange-500 border-orange-500 text-slate-950" : small ? "border-slate-700 text-slate-300" : "border-slate-600 text-slate-200");
      b.textContent = label + " (" + n + ")";
      b.setAttribute("data-count", String(n));
      b.addEventListener("click", function () {
        onClick();
        shown = PAGE;
        renderGroups();
        renderGrid();
        showHoldNote();
      });
      target.appendChild(b);
    }
    var allLabel = dept === "Saltwater" ? "All saltwater" : dept === "Freshwater" ? "All freshwater" : "All " + deptLabel(dept).toLowerCase();
    pill(box, allLabel, counts.all, broad === "all", false, function () { broad = "all"; group = "all"; });
    var groupsShown = bl.slice();
    if (byBroad.other && byBroad.other.length) groupsShown.push({ id: "other", label: (filterGroups.otherLabel || "Other"), categories: [] });
    groupsShown.forEach(function (g) {
      var hasAny = items.some(function (it) { return it.department === dept && broadOf(it) === g.id; });
      if (!hasAny) return;
      pill(box, g.label, groupByName(byBroad[g.id] || []).length, broad === g.id, false, function () { broad = g.id; group = "all"; });
    });
    var onTop = box.querySelector(".bg-orange-500");
    box.scrollLeft = onTop ? Math.max(0, onTop.offsetLeft - box.offsetLeft - 16) : 0;
    if (broad === "all") return;
    var cats = [];
    items.forEach(function (it) {
      if (it.department === dept && broadOf(it) === broad && cats.indexOf(it.category || "Other") === -1) cats.push(it.category || "Other");
    });
    if (cats.length < 2) return;
    var inBroad = byBroad[broad] || [];
    sub.classList.remove("hidden");
    pill(sub, "All " + (groupsShown.filter(function (g) { return g.id === broad; })[0] || { label: "" }).label.toLowerCase(), groupByName(inBroad).length, group === "all", true, function () { group = "all"; });
    cats.sort(function (a, b) { return catLabel(dept, a).localeCompare(catLabel(dept, b)); }).forEach(function (c) {
      var n = groupByName(inBroad.filter(function (it) { return (it.category || "Other") === c; })).length;
      pill(sub, catLabel(dept, c), n, group === "cat:" + c, true, function () { group = "cat:" + c; });
    });
    var onSub = sub.querySelector(".bg-orange-500");
    sub.scrollLeft = onSub ? Math.max(0, onSub.offsetLeft - sub.offsetLeft - 16) : 0;
  }
  function renderGrid() {
    var rows = filtered();
    var groups = sortGroups(groupByName(rows));
    var slice = groups.slice(0, shown);
    var grid = el("grid");
    grid.innerHTML = "";
    el("count").textContent = rows.length
      ? (query.trim() ? groups.length + " matches" : groups.length + (stockMode === "new" ? " new & back in stock" : " listings"))
      : (stockMode === "new" ? "" : "Nothing matches that search.");
    if (!rows.length && stockMode === "new") grid.appendChild(freshEmpty());
    slice.forEach(function (variants) { grid.appendChild(card(variants)); });
    refreshBagMarks();
    var more = el("more");
    if (groups.length > shown) {
      more.hidden = false;
      more.textContent = "Show more (" + (groups.length - shown) + " left)";
    } else more.hidden = true;
  }
  function freshEmpty() {
    var narrowed = query.trim() || dept !== "all" || group !== "all";
    var box = document.createElement("div");
    box.className = "rounded-3xl border border-white/15 bg-slate-900/80 p-6 text-center sm:col-span-2 lg:col-span-3";
    var t = document.createElement("p");
    t.className = "text-lg font-semibold text-white";
    t.textContent = narrowed ? "Nothing new or back in stock here this week." : "Nothing new or back in stock this week yet.";
    var s = document.createElement("p");
    s.className = "mt-2 text-sm text-slate-300";
    s.textContent = narrowed
      ? "Try another section or clear your search."
      : "We update this list every morning, so check back soon.";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "mt-4 min-h-11 rounded-2xl bg-purple-600 px-5 font-semibold text-white";
    b.textContent = "See everything in stock";
    b.addEventListener("click", function () {
      var tab = el("stock-mode").querySelector("button[data-stock=\"in\"]");
      if (tab) tab.click();
    });
    box.appendChild(t);
    box.appendChild(s);
    box.appendChild(b);
    return box;
  }
  var photoManifestPromise = null;
  var photoPackPromises = {};
  function fishPhotoUrl(path) {
    if (/^https:\/\//i.test(String(path || ""))) return Promise.resolve(String(path));
    if (String(path || "").indexOf("/img/extra/") === 0) return Promise.resolve(String(path));
    var name = String(path || "").split("/").pop();
    if (!name) return Promise.resolve("");
    if (!photoManifestPromise) {
      photoManifestPromise = fetch("/img/fish/manifest.json").then(function (r) {
        if (!r.ok) throw new Error("manifest");
        return r.json();
      });
    }
    return photoManifestPromise.then(function (man) {
      var spec = man[name];
      if (!spec) return "";
      var pack = spec[0];
      if (!photoPackPromises[pack]) {
        photoPackPromises[pack] = fetch("/img/fish/pack-" + pack + ".bin").then(function (r) {
          if (!r.ok) throw new Error("pack");
          return r.arrayBuffer();
        });
      }
      return photoPackPromises[pack].then(function (buf) {
        var bytes = buf.slice(spec[1], spec[1] + spec[2]);
        return URL.createObjectURL(new Blob([bytes], { type: "image/webp" }));
      });
    }).catch(function () { return ""; });
  }
  function card(variants) {
    var current = leadOf(variants);
    var anyIn = variants.some(function (v) { return v.inStock; });
    var wrap = document.createElement("article");
    wrap.className = "overflow-hidden rounded-3xl border border-white/15 bg-slate-900/80 shadow-xl" + (current.inStock ? "" : " opacity-70");
    var img = document.createElement("div");
    img.className = "aspect-[4/3] bg-slate-950";
    if (current.image) {
      var pic = document.createElement("img");
      pic.alt = current.displayName;
      pic.loading = "lazy";
      pic.className = "h-full w-full object-contain";
      fishPhotoUrl(current.image).then(function (url) {
        if (!url) {
          pic.remove();
          img.textContent = "No photo available";
          img.className += " grid place-items-center text-sm text-slate-400";
          return;
        }
        pic.src = url;
      });
      pic.addEventListener("error", function () { pic.remove(); img.textContent = "No photo available"; img.className += " grid place-items-center text-sm text-slate-400"; });
      img.appendChild(pic);
    } else {
      img.className += " grid place-items-center text-sm text-slate-400";
      img.textContent = "No photo available";
    }
    var body = document.createElement("div");
    body.className = "space-y-2 p-4";
    var fresh = groupFresh(variants);
    if (fresh) {
      var badge = document.createElement("span");
      badge.className = "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide " +
        (fresh.kind === "new" ? "bg-orange-500 text-slate-950" : "bg-emerald-400 text-slate-950");
      badge.textContent = fresh.kind === "new" ? "New" : "Back in stock";
      body.appendChild(badge);
    }
    var h = document.createElement("h3");
    h.className = "font-semibold text-white";
    h.textContent = current.displayName;
    body.appendChild(h);
    var price = document.createElement("p");
    price.className = "text-xl font-semibold text-orange-400";
    var stock = document.createElement("p");
    stock.className = "text-xs text-slate-400";
    var add = document.createElement("button");
    add.type = "button";
    function paint(it) {
      current = it;
      price.textContent = it.price == null ? "Price at quote" : money(it.price);
      price.className = "text-xl font-semibold " + (it.price == null ? "text-slate-300" : "text-orange-400");
      stock.textContent = it.inStock ? "In stock" : "Out of stock";
      stock.className = "text-xs font-semibold " + (it.inStock ? "text-emerald-300" : "text-amber-300");
      wrap.className = "overflow-hidden rounded-3xl border border-white/15 bg-slate-900/80 shadow-xl" + (it.inStock ? "" : " opacity-70");
      var blocked = !it.inStock && anyIn;
      add.disabled = blocked;
      add.textContent = blocked ? "Out of stock, pick another size" : "Add to bag";
      add.className = "min-h-11 flex-1 rounded-2xl font-semibold " + (blocked ? "cursor-not-allowed bg-slate-700 text-sm text-slate-300" : "bg-purple-600 text-white");
    }
    if (variants.length > 1) {
      var lab = document.createElement("label");
      lab.className = "block text-xs font-semibold tracking-wide text-slate-400 uppercase";
      lab.textContent = "Size";
      var sel = document.createElement("select");
      sel.className = "mt-1 min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-sm font-semibold normal-case tracking-normal text-slate-100";
      variants.forEach(function (v) {
        var o = document.createElement("option");
        o.value = v.sku;
        o.textContent = sizeText(v, variants) + " — " + (v.price == null ? "Price at quote" : money(v.price)) + (v.inStock ? "" : " — out of stock");
        if (v === current) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () {
        var next = variants.find(function (v) { return v.sku === sel.value; });
        paint(next);
      });
      lab.appendChild(sel);
      body.appendChild(lab);
    } else if (current.size) {
      var sz = document.createElement("p");
      sz.className = "text-xs uppercase tracking-wide text-slate-400";
      sz.textContent = sizeText(current);
      body.appendChild(sz);
    }
    paint(current);
    body.appendChild(price);
    body.appendChild(stock);
    if (current.department === "Freshwater" && current.category === "Betta") {
      var bettaNote = document.createElement("p");
      bettaNote.className = "text-xs text-amber-200";
      bettaNote.textContent = "Bettas arrive in cups and are held up to 3 days. Please pick up promptly.";
      body.appendChild(bettaNote);
    }
    var inBag = document.createElement("p");
    inBag.className = "text-sm font-semibold text-orange-300";
    inBag.setAttribute("data-bag-skus", variants.map(function (v) { return v.sku; }).join(","));
    body.appendChild(inBag);
    var row = document.createElement("div");
    row.className = "flex gap-2";
    var qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.value = "1";
    qty.setAttribute("aria-label", "How many");
    qty.className = "w-16 min-h-11 rounded-2xl border border-slate-700 bg-slate-950 text-center text-slate-100";
    add.addEventListener("click", function () {
      if (add.disabled) return;
      var n = Math.max(1, parseInt(qty.value, 10) || 1);
      var existing = list.find(function (x) { return x.sku === current.sku; });
      if (existing) existing.qty += n;
      else list.push({ sku: current.sku, name: labelOf(current), qty: n, price: current.price });
      saveList();
      renderList();
      status("Just added " + labelOf(current) + " to your bag");
    });
    row.appendChild(qty);
    row.appendChild(add);
    body.appendChild(row);
    var detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "min-h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 text-sm font-semibold text-purple-200";
    detailsBtn.textContent = "Details";
    detailsBtn.addEventListener("click", function () { openDetails(current); });
    body.appendChild(detailsBtn);
    wrap.appendChild(img);
    if (current.image && current.photoCredit) {
      var credit = document.createElement("p");
      credit.className = "px-4 pt-2 text-[11px] leading-tight text-slate-500";
      credit.textContent = current.photoCredit;
      wrap.appendChild(credit);
    }
    wrap.appendChild(body);
    return wrap;
  }
  function renderList() {
    var box = el("lines");
    box.innerHTML = "";
    var total = 0;
    var quote = false;
    if (!list.length) {
      box.innerHTML = "<p class=\"text-sm text-slate-400\">Nothing in your bag yet.</p>";
    }
    list.forEach(function (row, idx) {
      var line = document.createElement("div");
      line.className = "flex items-start justify-between gap-3 border-b border-white/10 py-2 text-sm";
      var each = row.price == null ? null : Math.round(row.price * 100);
      var text = row.qty + " × " + row.name + " — " + (each == null ? "Price at quote" : money(row.price) + " each");
      if (each == null) quote = true;
      else total += each * row.qty;
      var left = document.createElement("div");
      left.textContent = text;
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "text-slate-400";
      rm.textContent = "Remove";
      rm.addEventListener("click", function () { list.splice(idx, 1); saveList(); renderList(); });
      line.appendChild(left);
      line.appendChild(rm);
      box.appendChild(line);
    });
    el("total").textContent = "Bag total " + money(total / 100) + (quote ? " + items priced at quote" : "");
    var count = String(list.reduce(function (n, r) { return n + r.qty; }, 0));
    Array.prototype.forEach.call(document.querySelectorAll(".bag-count"), function (node) { node.textContent = count; });
    refreshBagMarks();
    showHoldNote();
  }
  function refreshBagMarks() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-bag-skus]"), function (node) {
      var skus = node.getAttribute("data-bag-skus").split(",");
      var n = 0;
      list.forEach(function (row) {
        if (skus.indexOf(row.sku) !== -1) n += row.qty;
      });
      node.textContent = n ? n + " in bag" : "";
    });
  }
  function customerName() {
    var first = el("cust-first").value.replace(/\s+/g, " ").trim();
    var last = el("cust-last").value.replace(/\s+/g, " ").trim();
    return (first + " " + last).trim();
  }
  function messageBody() {
    var name = customerName();
    var phone = formatPhone(el("cust-phone").value);
    var email = (el("cust-email").value || "").replace(/\s+/g, "").trim();
    var notes = el("cust-notes").value.replace(/\s+/g, " ").trim();
    var lines = [name + " " + phone];
    if (email) lines.push("Email: " + email);
    lines.push("The Reefer Garden fish request");
    var total = 0;
    list.forEach(function (row) {
      if (row.price == null) {
        lines.push(row.qty + " × " + row.name + " — Price at quote");
      } else {
        total += Math.round(row.price * 100) * row.qty;
        lines.push(row.qty + " × " + row.name + " — " + money(row.price) + " each");
      }
    });
    lines.push("List total " + money(total / 100));
    lines.push("", "Watch your email for the invoice. We do not order your items until that invoice is paid. If it is not paid, the items will not be ordered.");
    var pickup = list.some(function (row) {
      var it = items.find(function (x) { return x.sku === row.sku; });
      return it && !isHeld(it);
    });
    if (pickup) lines.push("", "Pickup the day it arrives. This bag includes a live reptile, bird, or small animal we cannot hold overnight. Plants, frozen food, and feeder insects can wait until you pick them up.");
    var bagItems = list.map(function (row) {
      return items.find(function (x) { return x.sku === row.sku; });
    });
    if (bagItems.some(isWednesdayArrival)) {
      lines.push("", "Fish, coral, and plants arrive on Wednesday after 11:00 AM. You can pick them up that day until 6:00 PM, or we can hold them for a later day. What is available can change by the minute. If our supplier will not ship a live animal because it is not healthy enough, we will refund that item.");
    }
    if (bagItems.some(isDry)) {
      lines.push("", "Dry goods do not arrive on a set day. We will contact you when yours is here.");
    }
    if (bagItems.some(function (it) { return it && it.department === "Freshwater" && it.category === "Betta"; })) {
      lines.push("", "Bettas arrive in cups and are held up to 3 days. Please pick up promptly.");
    }
    if (notes) lines.push("", "Notes: " + notes);
    return lines.join("\n");
  }
  function orderSubject() {
    return "Fish Preorder - " + customerName();
  }
  function requireContact() {
    if (!list.length) { status("Your bag is empty. Add something first."); return false; }
    var first = el("cust-first").value.trim();
    var last = el("cust-last").value.trim();
    var phoneOk = digits(el("cust-phone").value).length >= 10;
    var email = (el("cust-email").value || "").replace(/\s+/g, "").trim();
    var emailOk = email.indexOf("@") > 0 && email.indexOf(".", email.indexOf("@")) > email.indexOf("@");
    if (!first || !last || !phoneOk || !emailOk) {
      status("Add a first name, last name, a phone number with area code, and an email.");
      return false;
    }
    status("");
    return true;
  }
  function showCare(on) {
    var box = el("care");
    if (on) {
      box.classList.remove("hidden");
      box.classList.add("grid");
    } else {
      box.classList.add("hidden");
      box.classList.remove("grid");
    }
  }
  function openCare(id) {
    var go = function () {
      var c = care[id];
      var box = el("care");
      if (!c) {
        showCare(true);
        box.querySelector("[data-body]").textContent = "No care sheet for this one yet.";
        return;
      }
      showCare(true);
      box.querySelector("[data-body]").innerHTML =
        "<h3 class=\"text-2xl font-semibold text-white\">" + escapeHtml(c.name) + "</h3>" +
        "<p class=\"text-sm italic text-slate-400\">" + escapeHtml(c.sci || "") + "</p>" +
        "<ul class=\"mt-3 space-y-1 text-sm text-slate-200\">" +
        row("Adult size", c.size) + row("Tank", c.tank ? c.tank + " gal" : "") + row("Temp", c.temp) +
        row("pH", c.ph) + row("Water", c.water) + row("Care", c.care) + row("Temperament", c.temperament) +
        "</ul><p class=\"mt-3 text-sm text-slate-300\"><b>Diet.</b> " + escapeHtml(c.diet || "") + "</p>" +
        "<p class=\"mt-2 text-sm text-slate-300\">" + escapeHtml(c.tips || "") + "</p>";
    };
    if (care) go();
    else fetch("/care.json").then(function (r) { return r.json(); }).then(function (data) { care = data; go(); });
  }
  function slugPart(s) {
    return String(s || "other").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "other";
  }
  function loadDetails(it) {
    var url = DETAILS_BASE + slugPart(it.department) + "/" + slugPart(it.category) + ".json";
    if (!detailsFiles[url]) {
      detailsFiles[url] = fetch(url + "?v=" + Math.floor(Date.now() / 3600000)).then(function (r) {
        if (!r.ok) throw new Error("details");
        return r.json();
      }).catch(function () {
        delete detailsFiles[url];
        return null;
      });
    }
    return detailsFiles[url];
  }
  function loadCareData() {
    if (care) return Promise.resolve(care);
    return fetch("/care.json").then(function (r) {
      if (!r.ok) throw new Error("care");
      return r.json();
    }).then(function (data) {
      care = data;
      return care;
    }).catch(function () { return null; });
  }
  function openDetails(it) {
    var ticket = ++detailsTicket;
    var target = el("care").querySelector("[data-body]");
    target.innerHTML = "<p class=\"text-sm text-slate-300\">Loading details…</p>";
    showCare(true);
    Promise.all([loadDetails(it), it.careId ? loadCareData() : Promise.resolve(null)]).then(function (res) {
      if (ticket !== detailsTicket) return;
      var file = res[0];
      var id = file && file.index ? file.index[it.sku] : "";
      var d = id && file.entries ? file.entries[id] : null;
      var c = res[1] && it.careId ? res[1][it.careId] : null;
      target.innerHTML = d ? detailsHtml(d) : c ? careSheetHtml(c) : detailsFallbackHtml(it);
    });
  }
  function detailRow(k, v) {
    return "<li><span class=\"text-slate-400\">" + escapeHtml(String(k)) + ":</span> " + escapeHtml(String(v)) + "</li>";
  }
  function askLine() {
    return "<p class=\"mt-3 text-xs text-slate-400\">General guidance. Questions? Call or text " + escapeHtml(STORE.phoneDisplay) + ".</p>";
  }
  function detailsHtml(d) {
    var h = "<h3 class=\"text-2xl font-semibold text-white\">" + escapeHtml(d.title || "") + "</h3>";
    if (d.sci) h += "<p class=\"text-sm italic text-slate-400\">" + escapeHtml(d.sci) + "</p>";
    if (d.summary) h += "<p class=\"mt-3 text-sm text-slate-200\">" + escapeHtml(d.summary) + "</p>";
    (d.warn || []).forEach(function (w) {
      h += "<p class=\"mt-3 rounded-2xl bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-200\">" + escapeHtml(w) + "</p>";
    });
    var rows = (d.rows || []).filter(function (r) { return r && r[0] && r[1]; });
    if (rows.length) h += "<ul class=\"mt-3 space-y-1 text-sm text-slate-200\">" + rows.map(function (r) { return detailRow(r[0], r[1]); }).join("") + "</ul>";
    if (d.inBox && d.inBox.length) {
      h += "<p class=\"mt-3 text-sm font-semibold text-white\">In the box</p><ul class=\"mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300\">" +
        d.inBox.map(function (x) { return "<li>" + escapeHtml(x) + "</li>"; }).join("") + "</ul>";
    }
    (d.notes || []).forEach(function (n) {
      h += "<p class=\"mt-2 text-sm text-slate-300\">" + escapeHtml(n) + "</p>";
    });
    var src = (d.sources || []).filter(function (s) {
      var blob = ((s && s.name) || "") + " " + ((s && s.url) || "");
      return !/bulk reef supply|bulkreefsupply|liveaquaria|sun pet|sunpet|segrest|prestige reef|prestigereef|\baperture\b/i.test(blob);
    }).map(function (s) {
      if (!s || !s.name) return "";
      if (/^https:\/\//i.test(String(s.url || ""))) {
        return "<a href=\"" + escapeHtml(s.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline\">" + escapeHtml(s.name) + "</a>";
      }
      return escapeHtml(s.name);
    }).filter(Boolean);
    if (src.length) h += "<p class=\"mt-4 text-[11px] leading-snug text-slate-500\">Sources: " + src.join(", ") + (d.reviewed ? ". Checked " + escapeHtml(d.reviewed) + "." : ".") + "</p>";
    return h + askLine();
  }
  function careSheetHtml(c) {
    return "<h3 class=\"text-2xl font-semibold text-white\">" + escapeHtml(c.name) + "</h3>" +
      "<p class=\"text-sm italic text-slate-400\">" + escapeHtml(c.sci || "") + "</p>" +
      "<ul class=\"mt-3 space-y-1 text-sm text-slate-200\">" +
      row("Adult size", c.size) + row("Tank", c.tank ? c.tank + " gal" : "") + row("Temp", c.temp) +
      row("pH", c.ph) + row("Water", c.water) + row("Care", c.care) + row("Temperament", c.temperament) +
      "</ul><p class=\"mt-3 text-sm text-slate-300\"><b>Diet.</b> " + escapeHtml(c.diet || "") + "</p>" +
      "<p class=\"mt-2 text-sm text-slate-300\">" + escapeHtml(c.tips || "") + "</p>" + askLine();
  }
  function detailsFallbackHtml(it) {
    return "<h3 class=\"text-2xl font-semibold text-white\">" + escapeHtml(it.displayName) + "</h3>" +
      (it.scientific ? "<p class=\"text-sm italic text-slate-400\">" + escapeHtml(it.scientific) + "</p>" : "") +
      "<ul class=\"mt-3 space-y-1 text-sm text-slate-200\">" +
      detailRow("Section", deptLabel(it.department) + (it.category ? " › " + it.category : "")) +
      (it.size ? detailRow("Size", it.size) : "") +
      "</ul><p class=\"mt-3 text-sm text-slate-300\">We're still writing the full details for this one. Call or text " +
      escapeHtml(STORE.phoneDisplay) + " and we'll answer any questions about it.</p>";
  }
  function row(k, v) { return v ? "<li><span class=\"text-slate-400\">" + k + ":</span> " + escapeHtml(String(v)) + "</li>" : ""; }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      if (c === "&") return "&" + "amp;";
      if (c === "<") return "&" + "lt;";
      if (c === ">") return "&" + "gt;";
      return "&" + "quot;";
    });
  }

  function deptLabel(name) {
    return name === "Dry Good" ? "Dry Goods" : name;
  }
  function paintDept() {
    Array.prototype.forEach.call(el("dept").children, function (btn) {
      var on = btn.getAttribute("data-dept") === dept;
      btn.className = "rounded-full px-4 py-2 text-sm font-semibold " + (on ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-200");
    });
  }
  function renderDepts() {
    var box = el("dept");
    var seen = { all: true, Freshwater: true, Saltwater: true };
    items.forEach(function (it) {
      if (it.department && it.department !== "Plant") seen[it.department] = true;
    });
    var order = ["all", "Freshwater", "Saltwater"];
    ["Reptile", "Small Animal", "Bird", "Dry Good"].forEach(function (name) {
      if (seen[name] && order.indexOf(name) === -1) order.push(name);
    });
    Object.keys(seen).forEach(function (name) {
      if (order.indexOf(name) === -1) order.push(name);
    });
    box.innerHTML = "";
    order.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-dept", name);
      b.textContent = name === "all" ? "All" : deptLabel(name);
      box.appendChild(b);
    });
    paintDept();
    showHoldNote();
  }
  function showHoldNote() {
    var note = el("hold-note");
    if (!note) return;
    var inBag = list.some(function (row) {
      var it = items.find(function (x) { return x.sku === row.sku; });
      return it && !isHeld(it);
    });
    var other = inBag || (dept !== "all" && filtered().some(function (it) { return !isHeld(it); }));
    note.classList.toggle("hidden", !other);
    note.textContent = other
      ? "Pickup the day the order arrives for live reptiles, birds, and small animals. Plants, frozen food, and feeder insects can wait. We have no place to keep those live animals overnight."
      : "";
    showDryNote();
  }
  function showDryNote() {
    var note = el("dry-note");
    if (!note) return;
    var inBag = list.some(function (row) {
      var it = items.find(function (x) { return x.sku === row.sku; });
      return isDry(it);
    });
    var on = dept === "Dry Good" || inBag;
    note.classList.toggle("hidden", !on);
    note.textContent = on ? "Dry goods do not arrive on a set day. We will contact you when yours is here." : "";
  }

  el("dept").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-dept]");
    if (!b) return;
    dept = b.getAttribute("data-dept");
    group = "all";
    broad = "all";
    shown = PAGE;
    paintDept();
    showHoldNote();
    renderGroups();
    renderGrid();
  });
  el("stock-mode").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-stock]");
    if (!b) return;
    stockMode = b.getAttribute("data-stock");
    shown = PAGE;
    Array.prototype.forEach.call(el("stock-mode").children, function (btn) {
      var on = btn.getAttribute("data-stock") === stockMode;
      btn.className = "rounded-full px-4 py-2 text-sm font-semibold " + (on ? "bg-orange-500 text-slate-950" : "bg-slate-800 text-slate-200");
    });
    if (broadList(dept)) renderGroups();
    renderGrid();
  });
  el("q").addEventListener("input", function () { query = el("q").value; shown = PAGE; if (broadList(dept)) renderGroups(); renderGrid(); });
  el("sort").addEventListener("change", function () { sort = el("sort").value; shown = PAGE; renderGrid(); });
  el("more").addEventListener("click", function () { shown += PAGE; renderGrid(); });
  el("email-list").addEventListener("click", function () {
    if (!requireContact()) return;
    var button = el("email-list");
    button.disabled = true;
    status("Sending your bag to the store…");
    fetch("https://formsubmit.co/ajax/trg-fish-preorders@agentmail.to", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: orderSubject(),
        _template: "box",
        _captcha: "false",
        _url: "https://thereefergarden.com/fish-preorder",
        name: customerName(),
        phone: formatPhone(el("cust-phone").value),
        email: (el("cust-email").value || "").replace(/\s+/g, "").trim(),
        message: messageBody()
      })
    }).catch(function () {});
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: "17741d4b-20a8-4453-b123-d50255fdc717",
        subject: orderSubject(),
        from_name: "The Reefer Garden Preorder",
        botcheck: false,
        name: customerName(),
        phone: formatPhone(el("cust-phone").value),
        email: (el("cust-email").value || "").replace(/\s+/g, "").trim(),
        message: messageBody()
      })
    }).then(function (r) { return r.json(); }).then(function (data) {
      button.disabled = false;
      var note = String((data && data.message) || "");
      if (/activat/i.test(note)) {
        status("Almost ready. Open info@thereefergarden.com, find the activation email, and tap the link. Then press Email this bag one more time.");
        return;
      }
      if (data && (data.success === true || data.success === "true")) {
        status("Got it! Watch your email in the next 15 minutes for the invoice. We do not order your items until that invoice is paid. Nothing else is due at pickup. Questions? Call (870) 761-8884.");
        return;
      }
      status(note || "The bag did not send. Call (870) 761-8884 and we’ll take it by phone.");
    }).catch(function () {
      button.disabled = false;
      status("The bag did not send. Check your connection, or call (870) 761-8884.");
    });
  });
  el("copy-list").addEventListener("click", function () {
    if (!requireContact()) return;
    var text = messageBody();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { status("List copied"); }).catch(function () { status("Couldn’t copy"); });
    }
  });
  el("clear-list").addEventListener("click", function () { list = []; saveList(); renderList(); status("Bag cleared"); });
  el("care-close").addEventListener("click", function () { showCare(false); });
  el("care").addEventListener("click", function (e) { if (e.target.id === "care") showCare(false); });

  function startCatalog() {
    var gate = document.getElementById("gate");
    if (gate) gate.classList.add("hidden");
    var CATALOG_URL = "https://allsiterepos.github.io/trg-catalog/catalog.json";
    function getCatalog(url, wait) {
      var timer = new Promise(function (ok, fail) { setTimeout(function () { fail(new Error("timeout")); }, wait); });
      return Promise.race([fetch(url, { cache: "no-store" }), timer]).then(function (r) {
        if (!r.ok) throw new Error("catalog");
        return r.json();
      }).then(function (data) {
        if (!data || !data.items || !data.items.length) throw new Error("catalog");
        return data;
      });
    }
    var groupsReady = fetch(FILTER_GROUPS_URL + "?v=" + Math.floor(Date.now() / 600000)).then(function (r) {
      if (!r.ok) throw new Error("groups");
      return r.json();
    }).then(function (g) {
      if (g && g.departments) filterGroups = g;
    }).catch(function () {});
    getCatalog(CATALOG_URL + "?v=" + Math.floor(Date.now() / 600000), 8000).catch(function () {
      return getCatalog("/catalog.json", 60000);
    }).then(function (data) {
      return groupsReady.then(function () { return data; });
    }).then(function (data) {
      items = prepare(data.items || []);
      el("updated").textContent = data.pricesUpdated ? "Prices updated " + data.pricesUpdated : "";
      renderDepts();
      renderGroups();
      renderGrid();
      renderList();
    }).catch(function () {
      el("count").textContent = "The catalog didn’t load. Refresh the page.";
    });
  }

  startCatalog();
})();
