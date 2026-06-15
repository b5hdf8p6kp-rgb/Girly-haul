// Lightweight site script: loads products, renders grids, and manages cart in localStorage
const PRODUCTS_URL = "products.json";

let products = [];
let cart = JSON.parse(localStorage.getItem("gh_cart") || "{}");

function setYears(){
  const y = new Date().getFullYear();
  ["year","year-2","year-3","year-4"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });
}
setYears();

async function loadProducts(){
  try{
    const res = await fetch(PRODUCTS_URL);
    products = await res.json();
    renderFeatured();
    renderProductsGrid();
    renderProductDetailIfNeeded();
    updateCartCount();
  }catch(e){
    console.error("Failed to load products", e);
  }
}

function renderCard(p){
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="card-body">
      <div class="title">${p.name}</div>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div style="margin-top:0.6rem">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn ghost" style="margin-left:0.5rem" onclick="addToCart('${p.id}')">Add</button>
      </div>
    </div>
  `;
  return div;
}

function renderFeatured(){
  const container = document.getElementById("featured-grid");
  if(!container) return;
  container.innerHTML="";
  products.slice(0,4).forEach(p => container.appendChild(renderCard(p)));
}

function renderProductsGrid(){
  const container = document.getElementById("products-grid");
  if(!container) return;
  container.innerHTML="";
  products.forEach(p => container.appendChild(renderCard(p)));
}

function renderProductDetailIfNeeded(){
  const detail = document.getElementById("product-detail");
  if(!detail) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = products.find(x=>x.id===id) || products[0];
  detail.innerHTML = `
    <div>
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div>
      <h2>${p.name}</h2>
      <div class="price">$${p.price.toFixed(2)}</div>
      <p class="muted">${p.description}</p>
      <div class="product-actions">
        <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </div>
  `;
}

function addToCart(id){
  cart[id] = (cart[id]||0) + 1;
  saveCart();
  updateCartCount();
  alert("Added to cart");
}

function saveCart(){
  localStorage.setItem("gh_cart", JSON.stringify(cart));
}

function updateCartCount(){
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const els = [document.getElementById("cart-count"), document.getElementById("cart-count-2")];
  els.forEach(el=>{ if(el) el.textContent = count; });
  renderCartModalIfOpen();
}

function getCartItems(){
  return Object.entries(cart).map(([id,qty])=>{
    const p = products.find(x=>x.id===id);
    return {...p, qty};
  });
}

function renderCartModalIfOpen(){
  // render for both modals (index and shop)
  const items = getCartItems();
  const render = (rootId, totalId) => {
    const root = document.getElementById(rootId);
    if(!root) return;
    root.innerHTML = items.length ? items.map(it=>`
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:center">
        <img src="${it.image}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
        <div style="flex:1">
          <div style="font-weight:600">${it.name}</div>
          <div class="muted">$${it.price.toFixed(2)} × ${it.qty}</div>
        </div>
        <div style="text-align:right">
          <button onclick="decreaseQty('${it.id}')">−</button>
          <button onclick="increaseQty('${it.id}')" style="margin-left:6px">+</button>
        </div>
      </div>
    `).join("") : "<p>Your cart is empty.</p>";
    const total = items.reduce((s,it)=>s + it.price*it.qty,0);
    const totalEl = document.getElementById(totalId);
    if(totalEl) totalEl.textContent = "Total: $" + total.toFixed(2);
  };
  render("cart-items","cart-total");
  render("cart-items-2","cart-total-2");
}

function increaseQty(id){ cart[id]=(cart[id]||0)+1; saveCart(); updateCartCount(); }
function decreaseQty(id){ if(!cart[id]) return; cart[id]--; if(cart[id]<=0) delete cart[id]; saveCart(); updateCartCount(); }
function clearCart(){ cart = {}; saveCart(); updateCartCount(); }

function openModal(id){ document.getElementById(id).classList.remove("hidden") }
function closeModal(id){ document.getElementById(id).classList.add("hidden") }

document.addEventListener("click", (e)=>{
  // Cart open buttons
  if(e.target && e.target.id === "cart-button") openModal("cart-modal");
  if(e.target && e.target.id === "cart-button-2") openModal("cart-modal-2");
  if(e.target && e.target.id === "close-cart") closeModal("cart-modal");
  if(e.target && e.target.id === "close-cart-2") closeModal("cart-modal-2");
  if(e.target && e.target.id === "clear-cart") { clearCart(); closeModal("cart-modal"); }
  if(e.target && e.target.id === "clear-cart-2") { clearCart(); closeModal("cart-modal-2"); }
  if(e.target && e.target.id === "checkout-btn") { alert("Demo checkout — replace with payment integration."); clearCart(); closeModal("cart-modal"); }
  if(e.target && e.target.id === "checkout-btn-2") { alert("Demo checkout — replace with payment integration."); clearCart(); closeModal("cart-modal-2"); }
});

loadProducts();

// expose for buttons in HTML
window.addToCart = addToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.clearCart = clearCart;
