"use strict";

// ── CONFIG ─────────────────────────────────────────
const WHATSAPP_NUMBER = "2348067976904";

// ── PRODUCTS ───────────────────────────────────────
const products = [
  { id: 1, name: "iPhone 13pro Max - 128gb", price: 420000, image: "Images/iphone13promax.webp" },
  { id: 2, name: "iPhone 11 - 64gb", price: 250000, image: "Images/iphone11-1.webp" },
  { id: 3, name: "iPhone 16 - 256gb", price: 800000, image: "Images/OIP.webp" },
  { id: 4, name: "iPhone 14 - 128gb", price: 500000, image: "Images/iphone14.webp" },
  { id: 5, name: "iPhone 12 - 64gb", price: 290000, image: "Images/iphone12.jpeg" },
  { id: 6, name: "Samsung Galaxy S23 - 128gb", price: 450000, image: "Images/S23.jpg"},
  { id: 7, name: "Samsung Galaxy S24 - 256gb", price: 600000, image: "Images/s24.webp" },
  { id: 8, name: "Samsung Galaxy S25 Ultra - 256gb", price: 1200000, image: "Images/s25 ultra.webp" },
  { id: 9, name: "Google Pixel 9 Pro - 128gb", price: 750000, image: "Images/pixel9pro.webp" }
];

// ── CART STATE ─────────────────────────────────────
let cart = loadCart();

// 🔥 NEW: filtered products for search
let filteredProducts = [...products];

function loadCart() {
  try {
    const saved = localStorage.getItem("dripstore_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("dripstore_cart", JSON.stringify(cart));
  } catch {}
}

// ── HELPERS ────────────────────────────────────────
function formatNaira(amount) {
  return "₦" + amount.toLocaleString("en-NG");
}

function findCartItem(id) {
  return cart.find(item => item.id === id) || null;
}

function calcTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function calcTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ── CART FUNCTIONS ─────────────────────────────────
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = findCartItem(id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  showToast("✔ " + product.name + " added");
  updateAddButton(id, true);
}

function changeQty(id, delta) {
  const item = findCartItem(id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  updateAddButton(id, false);
}

function clearCart() {
  cart = [];
  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  products.forEach(p => updateAddButton(p.id, false));
}

// ── WHATSAPP ───────────────────────────────────────
function inquireOnWhatsApp() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  const lines = ["Hello, I want to inquire about:"];

  cart.forEach(item => {
    let line = "• " + item.name + " - " + formatNaira(item.price);
    if (item.qty > 1) line += " (x" + item.qty + ")";
    lines.push(line);
  });

  lines.push("");
  lines.push("Total: " + formatNaira(calcTotal()));

  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
  window.open(url, "_blank");
}

// ── RENDER PRODUCTS ────────────────────────────────
function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  if (filteredProducts.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">No products found</p>`;
    return;
  }

  filteredProducts.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = (index * 0.07) + "s";

    card.innerHTML =
      '<div class="card-image">' +
        '<img src="' + product.image + '" alt="' + product.name + '">' +
        '<button class="card-gradient-add" onclick="addToCart(' + product.id + ')">+ Quick Add</button>' +
      '</div>' +
      '<div class="card-body">' +
        '<button class="card-add-btn" id="addBtn-' + product.id + '" onclick="addToCart(' + product.id + ')">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
            '<path d="M12 5v14M5 12h14"/>' +
          '</svg>Add to Cart</button>' +
      '</div>' +
      '<div class="card-info">' +
        '<div class="card-name">' + product.name + '</div>' +
        '<div class="card-price">' + formatNaira(product.price) + '</div>' +
      '</div>';

    grid.appendChild(card);

    // 🔥 keep button state after search
    if (findCartItem(product.id)) {
      updateAddButton(product.id, true);
    }
  });
}

// ── SEARCH FUNCTION ────────────────────────────────
function handleSearch(value) {
  const query = value.toLowerCase().trim();

  filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  renderProducts();
}

// ── CART RENDER ────────────────────────────────────
function renderCartItems() {
  const container = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    footer.style.display = "none";
    return;
  }

  footer.style.display = "flex";

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div>${item.name}</div>
        <div>${formatNaira(item.price * item.qty)}</div>
      </div>
      <div>
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");

  document.getElementById("cartTotalPrice").textContent = formatNaira(calcTotal());
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  const qty = calcTotalQty();
  el.textContent = qty;
  el.classList.toggle("visible", qty > 0);
}

function updateBottomBar() {
  const bar = document.getElementById("bottomBar");
  const qty = calcTotalQty();

  if (!qty) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  document.getElementById("bottomCount").textContent = qty + " items";
  document.getElementById("bottomTotal").textContent = formatNaira(calcTotal());
}

function updateAddButton(id, added) {
  const btn = document.getElementById("addBtn-" + id);
  if (!btn) return;

  btn.classList.toggle("added", added);
  btn.innerHTML = added ? "✔ Added" : "Add to Cart";
}

// ── TOAST ─────────────────────────────────────────
let toastTimer;

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// ── EVENTS ─────────────────────────────────────────
document.getElementById("cartToggle").onclick = () => {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("open");
};

document.getElementById("cartClose").onclick =
document.getElementById("overlay").onclick = () => {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
};

document.getElementById("whatsappBtn").onclick = inquireOnWhatsApp;
document.getElementById("bottomWhatsapp").onclick = inquireOnWhatsApp;
document.getElementById("clearCart").onclick = clearCart;

// 🔥 SEARCH LISTENER
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    handleSearch(e.target.value);
  });
}

// ── INIT ──────────────────────────────────────────
renderProducts();
cart.forEach(item => updateAddButton(item.id, true));
renderCartItems();
updateCartCount();
updateBottomBar();