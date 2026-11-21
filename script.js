const BOT_TOKEN = "9191569091:AAEkmlW3ci4_nDcihUwLLutyVFWkavfVm7k";
const CHAT_ID = "1192284548";
document.addEventListener("DOMContentLoaded", () => {
  const catalogBtn = document.querySelector(".btn-main");
const catalogSection = document.getElementById("catalog");

if (catalogBtn && catalogSection) {
  catalogBtn.addEventListener("click", (e) => {
    e.preventDefault();
    catalogSection.scrollIntoView({ behavior: "smooth" });
  });
}
  const buyButtons = document.querySelectorAll(".btn-buy");
  const modal = document.getElementById("orderModal");
  const closeModalBtn = document.getElementById("closeModal");
  const openCartBtn = document.getElementById("openCartBtn");
  const cartCountEl = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItemsList");
  const emptyCartHint = document.getElementById("emptyCartHint");
  const orderForm = document.getElementById("orderForm");
  const orderStatus = document.getElementById("orderStatus");

  let cart = [];

  function updateCartUI() {
    if (cartCountEl) {
      cartCountEl.textContent = String(cart.length);
    }

    if (openCartBtn) {
      openCartBtn.style.display = cart.length > 0 ? "block" : "none";
    }

    if (!cartItemsList) return;
    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
      if (emptyCartHint) emptyCartHint.style.display = "block";
      return;
    }

    if (emptyCartHint) emptyCartHint.style.display = "none";

    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <span>${index + 1}. <strong>${item.title}</strong> — Розмір: ${item.size}</span>
        <button type="button" class="cart-remove-btn" data-index="${index}">✕</button>
      `;
      cartItemsList.appendChild(row);
    });

    cartItemsList.querySelectorAll(".cart-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  buyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      if (!card) return;

      const titleEl = card.querySelector("h3");
      const selectEl = card.querySelector("select");

      const title = titleEl ? titleEl.firstChild.textContent.trim() : "Товар";
      const size = selectEl ? selectEl.value : "—";

      cart.push({ title, size });
      if (orderStatus) orderStatus.textContent = "";
      updateCartUI();

      const oldText = button.textContent;
      button.textContent = "Додано ✓";
      setTimeout(() => {
        button.textContent = oldText;
      }, 800);
    });
  });

  if (openCartBtn && modal) {
    openCartBtn.addEventListener("click", () => {
      updateCartUI();
      modal.style.display = "flex";
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (cart.length === 0) {
        if (orderStatus) {
          orderStatus.style.color = "#ff6b6b";
          orderStatus.textContent = "Кошик порожній — додай хоча б один товар.";
        }
        return;
      }

      const name = document.getElementById("customerName")?.value.trim() || "";
      const contact = document.getElementById("customerContact")?.value.trim() || "";
      const payment = document.getElementById("paymentMethod")?.value || "";

      const itemsText = cart
        .map((item, i) => `${i + 1}) ${item.title} (Розмір: ${item.size})`)
        .join("\n");

      const message = [
        "🛍 Нове замовлення з сайту!",
        "Товари:",
        itemsText,
        `Клієнт: ${name}`,
        `Контакт: ${contact}`,
        `Оплата: ${payment}`
      ].join("\n");

      if (orderStatus) {
        orderStatus.style.color = "#aaaaaa";
        orderStatus.textContent = "Відправляємо заявку...";
      }

      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
          })
        });

        const data = await response.json();

        if (data.ok) {
          if (orderStatus) {
            orderStatus.style.color = "#7ee787";
            orderStatus.textContent = "Заявку надіслано! Незабаром зв'яжемось.";
          }
          cart = [];
          updateCartUI();
          orderForm.reset();
        } else {
          if (orderStatus) {
            orderStatus.style.color = "#ff6b6b";
            orderStatus.textContent = "Помилка відправки в Telegram. Перевір токен або chat_id.";
          }
          console.error("Telegram API error:", data);
        }
      } catch (error) {
        if (orderStatus) {
          orderStatus.style.color = "#ff6b6b";
          orderStatus.textContent = "Немає з'єднання або сталася помилка мережі.";
        }
        console.error("Fetch error:", error);
      }
    });
  }
});
