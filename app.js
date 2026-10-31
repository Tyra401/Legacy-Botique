
(function () {
"use strict";

var KEYS = ["shoes", "cosmetics"];
var META = {
  shoes: { title: "Shoes", sub: "Ladies' footwear", cos: false, add: "Add a shoe" },
  cosmetics: { title: "Cosmetics", sub: "Makeup and skincare", cos: true, add: "Add a cosmetic item" }
};
var LOW = 3;
var STD = ["35", "36", "37", "38", "39", "40", "41", "42"];
var COL_STD = ["Black", "Brown", "Beige", "Nude", "Tan", "Gold", "Silver", "White", "Red", "Pink", "Navy", "Blue"];
var DOT = {
  black: "#1a1a1a", brown: "#6b4226", chocolate: "#4a2a1a", beige: "#d8c3a0", nude: "#e0b99a", tan: "#b98a56",
  camel: "#b58450", gold: "#c9a55c", silver: "#bfc3c7", white: "#ffffff", cream: "#f3ead2", red: "#b3262e",
  burgundy: "#6e1423", wine: "#6e1423", pink: "#e58fb0", rose: "#d98aa0", "rose gold": "#c99a8a", navy: "#1f2a55",
  blue: "#2f5fa8", green: "#2f6b45", olive: "#6b6a2f", grey: "#8a8a8a", gray: "#8a8a8a", orange: "#d9772b",
  yellow: "#e3c13a", purple: "#6a3f8f"
};
function dotHtml(name) {
  var c = DOT[String(name).toLowerCase()];
  return c ? '<i class="dot" aria-hidden="true" style="background:' + c + '"></i>' : "";
}
var FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap";

function $(s, r) { return (r || document).querySelector(s); }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function uid() { return "i" + Math.random().toString(36).slice(2, 9); }
function sortSizes(a) {
  return a.slice().sort(function (x, y) {
    var nx = parseFloat(x), ny = parseFloat(y), ax = isFinite(nx), ay = isFinite(ny);
    if (ax && ay) return nx - ny || (x < y ? -1 : x > y ? 1 : 0);
    if (ax) return -1;
    if (ay) return 1;
    return x < y ? -1 : x > y ? 1 : 0;
  });
}
function cleanSizes(a) {
  var seen = {}, out = [];
  (Array.isArray(a) ? a : []).forEach(function (s) {
    s = String(s).trim().slice(0, 8);
    if (s && !seen[s]) { seen[s] = 1; out.push(s); }
  });
  return sortSizes(out);
}
function cleanColours(a) {
  var seen = {}, out = [];
  (Array.isArray(a) ? a : []).forEach(function (s) {
    s = String(s).trim().slice(0, 24);
    if (!s) return;
    s = s.charAt(0).toUpperCase() + s.slice(1);
    var k = s.toLowerCase();
    if (!seen[k]) { seen[k] = 1; out.push(s); }
  });
  var std = COL_STD.filter(function (c) { return out.indexOf(c) >= 0; });
  return std.concat(out.filter(function (c) { return COL_STD.indexOf(c) < 0; }));
}
function setColourExtras(it, val) {
  var std = (it.colours || []).filter(function (c) { return COL_STD.indexOf(c) >= 0; });
  it.colours = cleanColours(std.concat(val.split(",")));
}
function setExtras(it, val) {
  var std = (it.sizes || []).filter(function (s) { return STD.indexOf(s) >= 0; });
  it.sizes = cleanSizes(std.concat(val.split(",")));
}
function fmt(n, cur) { return cur + " " + Number(n || 0).toLocaleString("en-KE"); }
function status(stock) {
  stock = Number(stock) || 0;
  if (stock <= 0) return { cls: "s-out", label: "Sold out", out: true };
  if (stock <= LOW) return { cls: "s-low", label: "Only " + stock + " left", out: false };
  return { cls: "s-in", label: "In stock", out: false };
}

var saved = { shop: {}, sections: { shoes: [], cosmetics: [] } };
function prep(d) {
  d.shop = d.shop || {};
  d.sections = d.sections || {};
  KEYS.forEach(function (k) { if (!Array.isArray(d.sections[k])) d.sections[k] = []; });
  d.sections.shoes.forEach(function (p) {
    if (!Array.isArray(p.sizes)) p.sizes = [];
    if (!Array.isArray(p.colours)) p.colours = [];
    if (!p.colourImages || typeof p.colourImages !== "object" || Array.isArray(p.colourImages)) p.colourImages = {};
  });
  if (!d.shop.sizeLabel) d.shop.sizeLabel = "Sizes";
  return d;
}
var onlyIn = { shoes: false, cosmetics: false };

/* ---------- Storefront ---------- */
function sizesHtml(p, key) {
  if (key !== "shoes" || !p.sizes || !p.sizes.length) return "";
  return '<div class="sizes"><span class="sz-label">' + esc(saved.shop.sizeLabel || "Sizes") + '</span><ul class="sz-list" aria-label="Available sizes">' +
    p.sizes.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
}
function colourImg(p, name) {
  var u = p && p.colourImages && p.colourImages[name];
  return typeof u === "string" && /^(data:image\/|https?:\/\/|images\/)/.test(u) ? u : "";
}
function coloursHtml(p, key) {
  if (key !== "shoes" || !p.colours || !p.colours.length) return "";
  return '<div class="colours"><span class="sz-label">Also comes in</span><ul class="cl-list" aria-label="Other colours available">' +
    p.colours.map(function (c) {
      var img = colourImg(p, c);
      if (img) {
        return '<li class="has-photo"><button type="button" class="cl-photo" data-view="' + esc(p.id) + '" data-colour="' + esc(c) +
          '" aria-label="View ' + esc(c) + ' photo"><img src="' + esc(img) + '" alt="" loading="lazy"><span>' + esc(c) + "</span></button></li>";
      }
      return "<li>" + dotHtml(c) + esc(c) + "</li>";
    }).join("") + "</ul></div>";
}
function card(p, key) {
  var s = status(p.stock), cur = saved.shop.currency, wa = saved.shop.whatsapp;
  var pic = p.image
    ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
    : '<span class="ph" aria-hidden="true">' + esc((p.name || "?").charAt(0).toUpperCase()) + "</span>";
  var order = "";
  if (wa) {
    var msg = encodeURIComponent("Hello Legacy Boutique, I would like to order the " + p.name + " (" + fmt(p.price, cur) + ").");
    order = '<a class="order" target="_blank" rel="noopener" href="https://wa.me/' + esc(wa) + "?text=" + msg + '"' +
      (s.out ? ' aria-disabled="true" tabindex="-1"' : "") + ">" + (s.out ? "Unavailable" : "Order on WhatsApp") + "</a>";
  }
  return '<article class="item' + (s.out ? " out" : "") + '">' +
    '<div class="pic' + (META[key].cos ? " cos" : "") + '">' + pic + (s.out ? '<span class="tag">Sold out</span>' : "") + "</div>" +
    '<div class="info"><div class="name">' + esc(p.name) + "</div>" +
    '<div class="desc">' + esc(p.desc) + "</div>" + sizesHtml(p, key) + coloursHtml(p, key) +
    '<div class="row"><span class="price">' + fmt(p.price, cur) + '</span><span class="stock ' + s.cls + '">' + s.label + "</span></div>" +
    order + "</div></article>";
}
function renderGrid(key) {
  var all = saved.sections[key];
  var list = all.filter(function (p) { return !onlyIn[key] || Number(p.stock) > 0; });
  $("#grid-" + key).innerHTML = list.length
    ? list.map(function (p) { return card(p, key); }).join("")
    : '<p class="empty">' + (all.length ? "Nothing in stock right now. Check back soon." : "Items will appear here soon.") + "</p>";
}
function sectionHtml(key) {
  var m = META[key];
  return '<section class="shop" id="' + key + '"><div class="wrap"><div class="shead"><div><h2>' + m.title + "</h2><p>" + m.sub +
    '</p></div><label class="toggle"><input type="checkbox" data-filter="' + key + '"> In stock only</label></div>' +
    '<div class="grid" id="grid-' + key + '"></div></div></section>';
}
function shell() {
  var s = saved.shop;
  var contact = "";
  if (s.whatsapp) contact += '<p>Order on WhatsApp: <a target="_blank" rel="noopener" href="https://wa.me/' + esc(s.whatsapp) + '">+' + esc(s.whatsapp) + "</a></p>";
  if (s.address) contact += "<p>" + esc(s.address) + "</p>";
  if (s.hours) contact += "<p>" + esc(s.hours) + "</p>";
  return '<header><div class="wrap bar"><a class="logo" href="#top">Legacy Boutique</a><nav aria-label="Main">' +
    '<a href="#shoes">Shoes</a><a href="#cosmetics">Cosmetics</a><a href="#contact">Contact</a>' +
    '<button type="button" class="btn small" id="manage" hidden>Manage shop</button></nav></div></header>' +
    '<main><div class="band"><div class="wrap"><div class="hero" id="top"><h1>' + esc(s.tagline) + "</h1><p>" + esc(s.intro) +
    '</p><a class="btn" href="#shoes">Shop shoes</a></div></div></div>' + sectionHtml("shoes") + sectionHtml("cosmetics") + "</main>" +
    '<footer id="contact"><div class="wrap"><h3>Visit or message us</h3>' + contact +
    '<p class="fine">&copy; ' + new Date().getFullYear() + ' Legacy Boutique &middot; <button type="button" class="linkbtn" id="owner-link">Owner login</button></p></div></footer>';
}

function normalize(d) {
  var s = d.shop;
  s.tagline = String(s.tagline || "").trim();
  s.intro = String(s.intro || "").trim();
  s.whatsapp = String(s.whatsapp || "").replace(/\D/g, "");
  s.currency = String(s.currency || "").trim() || "KES";
  s.address = String(s.address || "").trim();
  s.hours = String(s.hours || "").trim();
  s.sizeLabel = String(s.sizeLabel || "").trim() || "Sizes";
  KEYS.forEach(function (k) {
    d.sections[k].forEach(function (p) {
      if (k === "shoes") {
        p.sizes = cleanSizes(p.sizes);
        p.colours = cleanColours(p.colours);
        var ci = {};
        p.colours.forEach(function (c) { var u = colourImg(p, c); if (u) ci[c] = u; });
        p.colourImages = ci;
      }
      p.name = String(p.name || "").trim();
      p.desc = String(p.desc || "").trim();
      p.price = Math.max(0, Math.round((Number(p.price) || 0) * 100) / 100);
      p.stock = Math.max(0, Math.floor(Number(p.stock) || 0));
    });
  });
  return d;
}

/* ---------- Owner panel ---------- */
var draft = null, panel = null, tab = "shoes";
var closeArmed = false, removeArmed = null, busy = false, statusTimer = 0;

function findItem(id) {
  for (var i = 0; i < KEYS.length; i++) {
    var list = draft.sections[KEYS[i]];
    for (var j = 0; j < list.length; j++) if (list[j].id === id) return list[j];
  }
  return null;
}
function isDirty() { return JSON.stringify(draft) !== JSON.stringify(saved); }

function note(msg, kind) {
  var n = $("#ed-note", panel);
  if (!n) return;
  if (!msg) { n.hidden = true; return; }
  n.textContent = msg;
  n.className = "note" + (kind === "error" ? " error" : "");
  n.hidden = false;
}
function disarmClose() {
  if (!closeArmed) return;
  closeArmed = false;
  var b = $('[data-act="close"]', panel);
  if (b) { b.textContent = "Close"; b.classList.remove("danger"); }
}
function updateStatus() {
  clearTimeout(statusTimer);
  statusTimer = setTimeout(function () {
    if (!panel) return;
    var d = isDirty();
    $("#ed-status", panel).textContent = d ? "Unsaved changes" : "All changes saved";
    $("#save-btn", panel).disabled = busy || !d;
  }, 120);
}
function refreshStatus(id) {
  var it = findItem(id), el = $("#st-" + id, panel);
  if (!it || !el) return;
  var s = status(it.stock);
  el.className = "stock " + s.cls;
  el.textContent = s.label;
}

function sizesEditor(p) {
  var id = p.id, have = p.sizes || [];
  var extras = have.filter(function (s) { return STD.indexOf(s) < 0; }).join(", ");
  return '<div class="fld"><span class="lbl" id="sz-' + id + '">Sizes available</span><div class="chips" role="group" aria-labelledby="sz-' + id + '">' +
    STD.map(function (s) {
      return '<button type="button" class="chip" data-act="size" data-id="' + id + '" data-size="' + s + '" aria-pressed="' + (have.indexOf(s) >= 0) + '">' + s + "</button>";
    }).join("") + "</div></div>" +
    '<div class="fld"><label for="f-' + id + '-xsizes">Other sizes</label><input class="in" type="text" id="f-' + id + '-xsizes" data-id="' + id + '" data-field="xsizes" value="' + esc(extras) + '" placeholder="Example: 43, 44" autocomplete="off">' +
    '<p class="hint">Separate with commas. Leave empty if there are none.</p></div>';
}
function colourPhotosInner(p) {
  var cs = p.colours || [], id = p.id;
  if (!cs.length) return "";
  return '<div class="fld"><span class="lbl">Colour photos</span><p class="hint">Add a photo of each colour so customers can see it. Customers tap a colour photo to enlarge it.</p><div class="cp-list">' +
    cs.map(function (c) {
      var img = colourImg(p, c);
      return '<div class="cp-row"><div class="cp-thumb">' + (img ? '<img src="' + esc(img) + '" alt="">' : dotHtml(c)) + "</div>" +
        '<span class="cp-name">' + esc(c) + '</span><span class="cp-actions"><label class="linkbtn">' + (img ? "Change photo" : "Add photo") +
        '<input class="sr" type="file" accept="image/*" data-cphoto="' + id + '" data-colour="' + esc(c) + '"></label>' +
        (img ? '<button type="button" class="linkbtn" data-act="cphoto-clear" data-id="' + id + '" data-colour="' + esc(c) + '">Remove photo</button>' : "") +
        "</span></div>";
    }).join("") + "</div></div>";
}
function refreshColourPhotos(id) {
  var it = findItem(id), box = panel && $("#cp-" + id, panel);
  if (it && box) box.innerHTML = colourPhotosInner(it);
}
function setColourPhoto(id, colour, url) {
  var it = findItem(id);
  if (!it || !panel) return;
  it.colourImages = it.colourImages || {};
  it.colourImages[colour] = url;
  note(""); disarmClose();
  refreshColourPhotos(id); updateStatus();
}
function coloursEditor(p) {
  var id = p.id, have = p.colours || [];
  var extras = have.filter(function (c) { return COL_STD.indexOf(c) < 0; }).join(", ");
  return '<div class="fld"><span class="lbl" id="cl-' + id + '">Other colours it comes in</span><div class="chips" role="group" aria-labelledby="cl-' + id + '">' +
    COL_STD.map(function (c) {
      return '<button type="button" class="chip" data-act="colour" data-id="' + id + '" data-colour="' + c + '" aria-pressed="' + (have.indexOf(c) >= 0) + '">' + c + "</button>";
    }).join("") + "</div></div>" +
    '<div class="fld"><label for="f-' + id + '-xcolours">Other colours not listed</label><input class="in" type="text" id="f-' + id + '-xcolours" data-id="' + id + '" data-field="xcolours" value="' + esc(extras) + '" placeholder="Example: Rose gold, Leopard" autocomplete="off">' +
    '<p class="hint">Separate with commas. Leave empty if there are none.</p></div>';
}
function adminItem(p, key) {
  var id = p.id, s = status(p.stock), cur = esc(draft.shop.currency);
  var thumb = p.image
    ? '<img src="' + esc(p.image) + '" alt="Photo of ' + esc(p.name || "this item") + '">'
    : '<span class="ph" aria-hidden="true">' + esc((p.name || "?").charAt(0).toUpperCase()) + "</span>";
  var foot = removeArmed === id
    ? '<span class="confirm">Remove ' + esc(p.name || "this item") + '? <button type="button" class="linkbtn bad" data-act="remove-yes" data-id="' + id + '">Yes, remove</button>' +
      '<button type="button" class="linkbtn" data-act="remove-no" data-id="' + id + '">Keep it</button></span>'
    : '<button type="button" class="linkbtn bad" data-act="remove" data-id="' + id + '">Remove item</button>';
  return '<article class="ed-item" data-id="' + id + '">' +
    '<div class="ed-photo"><div class="ed-thumb' + (META[key].cos ? " cos" : "") + '">' + thumb + "</div>" +
    '<label class="linkbtn">' + (p.image ? "Change photo" : "Add photo") + '<input class="sr" type="file" accept="image/*" data-photo="' + id + '"></label>' +
    (p.image ? '<button type="button" class="linkbtn" data-act="photo-clear" data-id="' + id + '">Remove photo</button>' : "") + "</div>" +
    '<div class="ed-fields">' +
    '<div class="fld"><label for="f-' + id + '-name">Name</label><input class="in" type="text" id="f-' + id + '-name" data-id="' + id + '" data-field="name" value="' + esc(p.name) + '" autocomplete="off"></div>' +
    '<div class="fld"><label for="f-' + id + '-desc">Description</label><input class="in" type="text" id="f-' + id + '-desc" data-id="' + id + '" data-field="desc" value="' + esc(p.desc) + '" autocomplete="off"></div>' +
    '<div class="fld2"><div class="fld"><label for="f-' + id + '-price">Price (' + cur + ')</label><input class="in" type="number" inputmode="decimal" min="0" step="any" id="f-' + id + '-price" data-id="' + id + '" data-field="price" value="' + esc(p.price) + '"></div>' +
    '<div class="fld"><label for="f-' + id + '-stock">Number in stock</label><div class="stepper">' +
    '<button type="button" data-act="dec" data-id="' + id + '" aria-label="One fewer">&minus;</button>' +
    '<input class="in" type="number" inputmode="numeric" min="0" step="1" id="f-' + id + '-stock" data-id="' + id + '" data-field="stock" value="' + esc(p.stock) + '">' +
    '<button type="button" data-act="inc" data-id="' + id + '" aria-label="One more">+</button></div></div></div>' + (key === "shoes" ? sizesEditor(p) + coloursEditor(p) + '<div id="cp-' + p.id + '" class="cp">' + colourPhotosInner(p) + "</div>" : "") + "</div>" +
    '<div class="ed-foot"><span class="stock ' + s.cls + '" id="st-' + id + '">' + s.label + "</span>" + foot + "</div></article>";
}
function detailsHtml() {
  var s = draft.shop;
  function f(field, label, hint, val) {
    return '<div class="fld"><label for="d-' + field + '">' + label + '</label><input class="in" type="text" id="d-' + field + '" data-shop="1" data-field="' + field + '" value="' + esc(val) + '" autocomplete="off">' +
      (hint ? '<p class="hint">' + hint + "</p>" : "") + "</div>";
  }
  return '<div class="details">' +
    f("whatsapp", "WhatsApp number", "Digits only, with the country code and no plus sign. Example: 254712345678", s.whatsapp) +
    f("tagline", "Headline on the home page", "", s.tagline) +
    f("intro", "Line under the headline", "", s.intro) +
    f("currency", "Currency shown with prices", "", s.currency) +
    f("address", "Shop address", "Shown at the bottom of the page. Leave empty to hide it.", s.address) +
    f("hours", "Opening hours", "Shown at the bottom of the page. Leave empty to hide it.", s.hours) +
    f("sizeLabel", "Label above shoe sizes", "For example: Sizes (EU) or Sizes (UK).", s.sizeLabel || "Sizes") + "</div>";
}
function renderContent() {
  var box = $("#ed-content", panel);
  if (tab === "details") { box.innerHTML = detailsHtml(); return; }
  var list = draft.sections[tab];
  var out = list.filter(function (p) { return (Number(p.stock) || 0) <= 0; }).length;
  box.innerHTML = '<div class="tools"><p>' + list.length + (list.length === 1 ? " item" : " items") + ", " + out + " sold out</p>" +
    '<button type="button" class="btn small" data-act="add">' + META[tab].add + "</button></div>" +
    '<div class="ed-list">' + (list.length ? list.map(function (p) { return adminItem(p, tab); }).join("") :
      '<p class="note">Nothing here yet. Choose "' + META[tab].add + '" to put the first item on the shelf.</p>') + "</div>";
}
function renderTabs() {
  $("#ed-tabs", panel).innerHTML = [["shoes", "Shoes"], ["cosmetics", "Cosmetics"], ["details", "Shop details"]].map(function (t) {
    return '<button type="button" class="tab" data-act="tab" data-tab="' + t[0] + '" aria-pressed="' + (tab === t[0]) + '">' + t[1] + "</button>";
  }).join("");
}
function openAdmin(restoredDraft, msg) {
  if (panel) return;
  draft = restoredDraft || clone(saved);
  tab = "shoes"; closeArmed = false; removeArmed = null;
  panel = document.createElement("div");
  panel.className = "panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Manage shop");
  panel.tabIndex = -1;
  panel.innerHTML = '<div class="p-head"><div class="wrap p-bar"><h2>Manage shop</h2><div class="p-actions">' +
    '<span class="p-status" id="ed-status" role="status"></span>' +
    '<button type="button" class="btn small" data-act="close">Close</button>' +
    '<button type="button" class="btn small primary" id="save-btn" data-act="save">Save changes</button></div></div></div>' +
    '<div class="wrap p-body"><p id="ed-note" class="note" hidden></p><div class="tabs" id="ed-tabs" role="group" aria-label="What to edit"></div>' +
    '<div id="ed-content"></div></div>';
  document.body.appendChild(panel);
  $("#app").inert = true;
  document.documentElement.classList.add("locked");
  bindPanel();
  renderTabs(); renderContent(); updateStatus();
  if (msg) note(msg);
  panel.focus();
}
function closePanel() {
  if (!panel) return;
  panel.remove(); panel = null; draft = null;
  $("#app").inert = false;
  document.documentElement.classList.remove("locked");
  try { sessionStorage.removeItem("lb-draft"); } catch (e) {}
  var m = $("#manage"); if (m) m.focus();
}
function requestClose() {
  if (busy) return;
  if (isDirty() && !closeArmed) {
    closeArmed = true;
    var b = $('[data-act="close"]', panel);
    b.textContent = "Discard changes"; b.classList.add("danger");
    note("You have unsaved changes. Choose Discard changes to close without saving, or Save changes to keep them.", "error");
    return;
  }
  closePanel();
}

function readFile(file) {
  return new Promise(function (resolve, reject) {
    var fr = new FileReader();
    fr.onload = function () { resolve(fr.result); };
    fr.onerror = function () { reject(new Error("read")); };
    fr.readAsDataURL(file);
  });
}
function toJpeg(file, max) {
  return readFile(file).then(function (url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var r = Math.min(1, (max || 900) / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * r));
        c.height = Math.max(1, Math.round(img.height * r));
        var x = c.getContext("2d");
        x.fillStyle = "#ffffff"; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = function () { reject(new Error("decode")); };
      img.src = url;
    });
  });
}

function bindPanel() {
  panel.addEventListener("input", function (e) {
    var t = e.target, f = t.dataset && t.dataset.field;
    if (!f) return;
    note(""); disarmClose();
    if (t.dataset.shop) {
      draft.shop[f] = f === "whatsapp" ? t.value.replace(/\D/g, "") : t.value;
    } else {
      var it = findItem(t.dataset.id);
      if (!it) return;
      if (f === "price") { var v = parseFloat(t.value); it.price = isFinite(v) && v >= 0 ? v : 0; }
      else if (f === "stock") { var n = parseInt(t.value, 10); it.stock = isFinite(n) && n >= 0 ? n : 0; refreshStatus(it.id); }
      else if (f === "xsizes") setExtras(it, t.value);
      else if (f === "xcolours") { setColourExtras(it, t.value); refreshColourPhotos(it.id); }
      else it[f] = t.value;
    }
    updateStatus();
  });
  panel.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.dataset || !(t.dataset.photo || t.dataset.cphoto)) return;
    var file = t.files && t.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { note("Choose a photo file, such as a JPG or PNG.", "error"); return; }
    toJpeg(file, t.dataset.cphoto ? 640 : 900).then(function (url) {
      if (t.dataset.cphoto) { setColourPhoto(t.dataset.cphoto, t.dataset.colour, url); return; }
      var it = findItem(t.dataset.photo);
      if (!it || !panel) return;
      it.image = url; note(""); disarmClose();
      renderContent(); updateStatus();
    }, function () { note("That photo could not be read. Try a JPG or PNG.", "error"); });
  });
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b || busy) return;
    var act = b.dataset.act, id = b.dataset.id, it;
    if (act === "close") return requestClose();
    if (act === "save") return save();
    if (act !== "close") { note(""); disarmClose(); }
    if (act === "tab") { tab = b.dataset.tab; removeArmed = null; renderTabs(); renderContent(); return; }
    if (act === "add") {
      var item = { id: uid(), name: "", desc: "", price: 0, stock: 1, image: "" };
      if (tab === "shoes") { item.sizes = []; item.colours = []; }
      draft.sections[tab].unshift(item);
      renderContent(); updateStatus();
      var first = $("#f-" + item.id + "-name", panel);
      if (first) { first.focus(); first.scrollIntoView({ block: "center" }); }
      return;
    }
    it = id && findItem(id);
    if (!it) return;
    if (act === "inc" || act === "dec") {
      it.stock = Math.max(0, (Number(it.stock) || 0) + (act === "inc" ? 1 : -1));
      $("#f-" + id + "-stock", panel).value = it.stock;
      refreshStatus(id); updateStatus();
    } else if (act === "size") {
      var sz = b.dataset.size, at = (it.sizes || []).indexOf(sz);
      it.sizes = it.sizes || [];
      if (at >= 0) it.sizes.splice(at, 1); else it.sizes.push(sz);
      it.sizes = sortSizes(it.sizes);
      b.setAttribute("aria-pressed", String(at < 0));
      updateStatus();
    } else if (act === "colour") {
      var cl = b.dataset.colour, cat = (it.colours || []).indexOf(cl);
      it.colours = it.colours || [];
      if (cat >= 0) it.colours.splice(cat, 1); else it.colours.push(cl);
      it.colours = cleanColours(it.colours);
      refreshColourPhotos(id);
      b.setAttribute("aria-pressed", String(cat < 0));
      updateStatus();
    } else if (act === "cphoto-clear") {
      if (it.colourImages) delete it.colourImages[b.dataset.colour];
      refreshColourPhotos(id); updateStatus();
    } else if (act === "photo-clear") {
      it.image = ""; renderContent(); updateStatus();
    } else if (act === "remove") {
      removeArmed = id; renderContent();
      var y = $('[data-act="remove-yes"][data-id="' + id + '"]', panel); if (y) y.focus();
    } else if (act === "remove-no") {
      removeArmed = null; renderContent();
    } else if (act === "remove-yes") {
      KEYS.forEach(function (k) { draft.sections[k] = draft.sections[k].filter(function (p) { return p.id !== id; }); });
      removeArmed = null; renderContent(); updateStatus();
    }
  });
}

function firstInvalid() {
  for (var i = 0; i < KEYS.length; i++) {
    var list = draft.sections[KEYS[i]];
    for (var j = 0; j < list.length; j++) if (!String(list[j].name).trim()) return { key: KEYS[i], id: list[j].id };
  }
  return null;
}
function save() {
  if (busy || !isDirty()) return;
  normalize(draft);
  var bad = firstInvalid();
  if (bad) {
    tab = bad.key; renderTabs(); renderContent();
    note("Give every item a name before saving.", "error");
    var f = $("#f-" + bad.id + "-name", panel); if (f) f.focus();
    return;
  }
  busy = true;
  $("#save-btn", panel).textContent = "Saving";
  $("#save-btn", panel).disabled = true;
  note("Saving. Photos can take a moment to upload.", "");
  persist(draft).then(function () {
    try { sessionStorage.setItem("lb-saved", "1"); } catch (e) {}
    location.reload();
  }, function (err) {
    busy = false;
    if (!panel) return;
    $("#save-btn", panel).textContent = "Save changes";
    var msg = err && err.code === "auth" ? "You are signed out. Sign in again, then save." :
      err && err.code === "setup" ? "The online database is not set up yet. Follow the setup steps in the README." :
      "Your changes were not saved. Check your connection and save again.";
    note(msg, "error");
    updateStatus();
  });
}

function toast(msg) {
  var t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = '<span role="status">' + esc(msg) + "</span>";
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 4000);
}

/* ---------- Colour photo viewer ---------- */
var lightbox = null, lbTrigger = null;
function openLightbox(btn) {
  var shoe = null;
  saved.sections.shoes.forEach(function (p) { if (p.id === btn.dataset.view) shoe = p; });
  var colour = btn.dataset.colour, img = shoe && colourImg(shoe, colour);
  if (!img) return;
  closeLightbox(true);
  lbTrigger = btn;
  lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", shoe.name + " in " + colour);
  lightbox.innerHTML = '<div class="lb-card"><img src="' + esc(img) + '" alt="' + esc(shoe.name) + " in " + esc(colour) + '">' +
    '<div class="lb-cap"><span>' + esc(shoe.name) + " in " + esc(colour) + '</span><button type="button" class="btn small" data-lb="close">Close</button></div></div>';
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.closest("[data-lb]")) closeLightbox();
  });
  document.body.appendChild(lightbox);
  $("#app").inert = true;
  document.documentElement.classList.add("locked");
  $('[data-lb="close"]', lightbox).focus();
}
function closeLightbox(quiet) {
  if (!lightbox) return;
  lightbox.remove(); lightbox = null;
  $("#app").inert = false;
  document.documentElement.classList.remove("locked");
  if (!quiet && lbTrigger && document.contains(lbTrigger)) lbTrigger.focus();
  lbTrigger = null;
}

/* ---------- Online storage and owner login ---------- */
var CFG = window.SHOP_CONFIG || {};
var SB = null, owner = false;
function configured() { return CFG.url && CFG.anonKey && CFG.url.indexOf("YOUR-") < 0 && CFG.anonKey.indexOf("YOUR-") < 0; }
function loadLib() {
  return new Promise(function (res, rej) {
    if (window.supabase) return res(window.supabase);
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4";
    s.onload = function () { res(window.supabase); };
    s.onerror = function () { rej({ code: "network" }); };
    document.head.appendChild(s);
  });
}
function client() {
  if (!configured()) return Promise.reject({ code: "setup" });
  return loadLib().then(function (lib) {
    if (!SB) SB = lib.createClient(CFG.url, CFG.anonKey);
    return SB;
  });
}
function fetchJson(url, opts) {
  return fetch(url, opts).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
}
function loadData() {
  var seed = function () { return fetchJson("seed-data.json"); };
  if (!configured()) return seed();
  return fetchJson(CFG.url + "/rest/v1/shop_data?id=eq.1&select=data", { headers: { apikey: CFG.anonKey, Authorization: "Bearer " + CFG.anonKey } })
    .then(function (rows) { return rows && rows[0] && rows[0].data && rows[0].data.sections ? rows[0].data : seed(); }, seed);
}
function dataUrlToBlob(u) {
  var p = u.split(","), mime = /data:([^;]+)/.exec(p[0])[1], bin = atob(p[1]), a = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type: mime });
}
function uploadPhoto(sb, u) {
  var name = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
  return sb.storage.from("photos").upload(name, dataUrlToBlob(u), { contentType: "image/jpeg", cacheControl: "31536000" }).then(function (r) {
    if (r.error) throw { code: /jwt|auth|policy|permission/i.test(r.error.message || "") ? "auth" : "net" };
    return sb.storage.from("photos").getPublicUrl(name).data.publicUrl;
  });
}
function persist(d) {
  return client().then(function (sb) {
    return sb.auth.getSession().then(function (r) {
      if (!r.data.session) throw { code: "auth" };
      var jobs = [];
      KEYS.forEach(function (k) {
        d.sections[k].forEach(function (p) {
          if (/^data:image\//.test(p.image || "")) jobs.push(uploadPhoto(sb, p.image).then(function (u) { p.image = u; }));
          Object.keys(p.colourImages || {}).forEach(function (c) {
            if (/^data:image\//.test(p.colourImages[c])) jobs.push(uploadPhoto(sb, p.colourImages[c]).then(function (u) { p.colourImages[c] = u; }));
          });
        });
      });
      return Promise.all(jobs).then(function () {
        return sb.from("shop_data").upsert({ id: 1, data: d, updated_at: new Date().toISOString() });
      }).then(function (r2) {
        if (r2.error) throw { code: /row-level|jwt|permission/i.test(r2.error.message || "") ? "auth" : (/relation|schema/i.test(r2.error.message || "") ? "setup" : "net") };
      });
    });
  });
}

var loginBox = null;
function closeLogin() {
  if (!loginBox) return;
  loginBox.remove(); loginBox = null;
  $("#app").inert = false;
  document.documentElement.classList.remove("locked");
}
function openLogin() {
  closeLogin();
  loginBox = document.createElement("div");
  loginBox.className = "lightbox";
  loginBox.setAttribute("role", "dialog");
  loginBox.setAttribute("aria-modal", "true");
  loginBox.setAttribute("aria-label", "Owner login");
  loginBox.innerHTML = '<form class="lb-card login-card" novalidate><h2>Owner login</h2>' +
    '<label for="lg-email">Email</label><input class="in" id="lg-email" type="email" autocomplete="username" required>' +
    '<label for="lg-pass">Password</label><input class="in" id="lg-pass" type="password" autocomplete="current-password" required>' +
    '<p class="note error" id="lg-note" role="alert" hidden></p>' +
    '<div class="lg-actions"><button type="button" class="btn small" data-lg="cancel">Cancel</button><button type="submit" class="btn small primary" id="lg-go">Sign in</button></div></form>';
  document.body.appendChild(loginBox);
  $("#app").inert = true;
  document.documentElement.classList.add("locked");
  var form = $("form", loginBox), note = $("#lg-note", loginBox);
  $("#lg-email", loginBox).focus();
  loginBox.addEventListener("click", function (e) { if (e.target === loginBox || e.target.closest('[data-lg="cancel"]')) closeLogin(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var em = $("#lg-email", loginBox).value.trim(), pw = $("#lg-pass", loginBox).value;
    if (!em || !pw) { note.textContent = "Enter your email and password."; note.hidden = false; return; }
    $("#lg-go", loginBox).disabled = true;
    note.hidden = true;
    client().then(function (sb) { return sb.auth.signInWithPassword({ email: em, password: pw }); }).then(function (r) {
      if (r.error) throw { code: "creds" };
      closeLogin();
      setOwner(true);
      openAdmin();
    }).catch(function (err) {
      var b = $("#lg-go", loginBox); if (b) b.disabled = false;
      note.textContent = err && err.code === "creds" ? "That email or password is not right." :
        err && err.code === "setup" ? "Login is not set up yet. See the README." : "Could not reach the login service. Check your connection.";
      note.hidden = false;
    });
  });
}
function setOwner(on) {
  owner = on;
  var m = $("#manage"), l = $("#owner-link");
  m.hidden = !on;
  l.textContent = on ? "Sign out" : "Owner login";
}
function signOut() {
  client().then(function (sb) { return sb.auth.signOut(); }).then(function () { location.reload(); }, function () { location.reload(); });
}
function hasStoredSession() {
  try {
    for (var i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true;
  } catch (e) {}
  return false;
}

/* ---------- Start ---------- */
function boot() {
  $("#app").innerHTML = shell();
  KEYS.forEach(function (k) {
    renderGrid(k);
    $('[data-filter="' + k + '"]').addEventListener("change", function (e) { onlyIn[k] = e.target.checked; renderGrid(k); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (lightbox) closeLightbox(); else if (loginBox) closeLogin(); else if (panel) requestClose();
  });
  $("#app").addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b) openLightbox(b);
  });
  $("#manage").addEventListener("click", function () { openAdmin(); });
  $("#owner-link").addEventListener("click", function () { if (owner) signOut(); else openLogin(); });

  var justSaved = false;
  try { justSaved = sessionStorage.getItem("lb-saved") === "1"; sessionStorage.removeItem("lb-saved"); } catch (e) {}
  if (configured() && hasStoredSession()) {
    client().then(function (sb) { return sb.auth.getSession(); }).then(function (r) {
      if (!r.data.session) return;
      setOwner(true);
      if (justSaved) toast("Changes saved");
    }).catch(function () {});
  }
}
document.getElementById("app").innerHTML = '<p class="load-msg">Loading the shop</p>';
loadData().then(function (d) {
  saved = prep(d);
  boot();
}, function () {
  $("#app").innerHTML = '<p class="load-msg">The shop could not load. Please refresh the page.</p>';
});
})();
