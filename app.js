const productGrid = document.getElementById("productGrid");
const productCards = [...productGrid.querySelectorAll(".product-card")];
const productSearch = document.getElementById("productSearch");
const categoryButtons = [...document.querySelectorAll(".category-button")];
const sortProducts = document.getElementById("sortProducts");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartSummary = document.getElementById("cartSummary");
const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("shopToast"), { delay: 2200 });
const cart = new Map();
let activeFilter = "all";

function updateProducts() {
  const searchTerm = productSearch.value.trim().toLowerCase();
  const visibleCards = productCards.filter((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
    const matchesSearch = card.dataset.name.includes(searchTerm);
    card.classList.toggle("d-none", !(matchesCategory && matchesSearch));
    return matchesCategory && matchesSearch;
  });

  const sortedCards = [...visibleCards].sort((first, second) => {
    if (sortProducts.value === "price-low") return Number(first.dataset.price) - Number(second.dataset.price);
    if (sortProducts.value === "price-high") return Number(second.dataset.price) - Number(first.dataset.price);
    return productCards.indexOf(first) - productCards.indexOf(second);
  });
  sortedCards.forEach((card) => productGrid.append(card));
  emptyState.classList.toggle("d-none", visibleCards.length > 0);
}

function showToast(message) {
  document.getElementById("toastMessage").textContent = message;
  toast.show();
}

function renderCart() {
  const items = [...cart.values()];
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalQuantity;
  document.getElementById("cartItemLabel").textContent = `(${totalQuantity})`;
  cartEmpty.classList.toggle("d-none", items.length > 0);
  cartSummary.classList.toggle("d-none", items.length === 0);
  document.getElementById("cartSubtotal").textContent = `$${subtotal.toLocaleString("en-US")}`;
  cartItems.innerHTML = items.map((item) => `
    <div class="cart-line" data-cart-item="${item.name}">
      <img src="${item.image}" alt="">
      <div>
        <h3>${item.name}</h3>
        <span class="line-price">$${item.price.toLocaleString("en-US")}</span>
        <div class="quantity-control" aria-label="Quantity for ${item.name}">
          <button type="button" data-quantity="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove aria-label="Remove ${item.name}"><i class="bi bi-trash3"></i></button>
    </div>
  `).join("");
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    categoryButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateProducts();
  });
});

productSearch.addEventListener("input", updateProducts);
sortProducts.addEventListener("change", updateProducts);

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    productSearch.focus();
  }
});

document.querySelectorAll(".quick-add").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.product;
    const existingItem = cart.get(name);
    cart.set(name, {
      name,
      price: Number(button.dataset.price),
      image: button.dataset.image,
      quantity: existingItem ? existingItem.quantity + 1 : 1
    });
    renderCart();
    showToast(`${name} added to your bag`);
  });
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isFavorite = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isFavorite));
    showToast(isFavorite ? "Removed from favorites" : "Saved to your favorites");
  });
});

cartItems.addEventListener("click", (event) => {
  const line = event.target.closest(".cart-line");
  if (!line) return;
  const item = cart.get(line.dataset.cartItem);
  if (!item) return;

  if (event.target.closest("[data-remove]")) {
    cart.delete(item.name);
  } else {
    const quantityChange = event.target.closest("[data-quantity]");
    if (!quantityChange) return;
    item.quantity += Number(quantityChange.dataset.quantity);
    if (item.quantity <= 0) cart.delete(item.name);
  }
  renderCart();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  showToast("Checkout is not connected yet");
});

renderCart();