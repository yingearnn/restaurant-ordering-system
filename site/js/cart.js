const addCartForm = document.getElementById('add-cart-form');
if (addCartForm) {
    addCartForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const product_id = document.getElementById('product_id').value;
        const quantity = document.getElementById('quantity').value;
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        errorEl.textContent = '';
        successEl.textContent = '';

        try {
            const res = await fetch('/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id, quantity })
            });
            const data = await res.json();

            if (!res.ok) {
                errorEl.textContent = data.message || 'Failed to add item to cart';
                return;
            }

            successEl.textContent = 'Item added to cart';
            addCartForm.reset();
        } catch (err) {
            errorEl.textContent = 'Something went wrong. Please try again.';
        }
    });
}

const cartTableBody = document.getElementById('cart-table-body');
if (cartTableBody) {
    loadCart();
    const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        window.location.href = demoPath('/checkout');
    });
}

    async function loadCart() {
        try {
            const [itemsRes, summaryRes] = await Promise.all([
                fetch('/cart'),
                fetch('/cart/summary')
            ]);
            const { items } = await itemsRes.json();
            const summary = await summaryRes.json();

            renderCartItems(items);
            renderSummary(summary);
        } catch (err) {
            document.getElementById('error-message').textContent = 'Failed to load cart';
        }
    }

    function renderCartItems(items) {
        cartTableBody.innerHTML = '';
        items.forEach((item) => {
            const subtotal = (Number(item.product.price) * item.quantity).toFixed(2);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product.name}</td>
                <td>${subtotal}</td>
                <td>${Number(item.product.price).toFixed(2)}</td>
                <td><input type="number" min="1" value="${item.quantity}" class="qty-input" data-id="${item.cartItemId}"></td>
                <td><button class="update-btn" data-id="${item.cartItemId}">Update</button></td>
                <td><button class="delete-btn" data-id="${item.cartItemId}">Delete</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        document.querySelectorAll('.update-btn').forEach((btn) => {
            btn.addEventListener('click', () => updateItem(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id));
        });
    }

    function renderSummary(summary) {
        document.getElementById('summary-quantity').textContent = summary.total_quantity;
        document.getElementById('summary-price').textContent = summary.total_checkout_price.toFixed(2);
    }

    async function updateItem(cartItemId) {
        const input = document.querySelector(`.qty-input[data-id="${cartItemId}"]`);
        const quantity = Number(input.value);
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = '';

        try {
            const res = await fetch(`/cart/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            const data = await res.json();
            if (!res.ok) {
                errorEl.textContent = data.message || 'Failed to update item';
                return;
            }
            loadCart();
        } catch (err) {
            errorEl.textContent = 'Something went wrong. Please try again.';
        }
    }

    async function deleteItem(cartItemId) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = '';

        try {
            const res = await fetch(`/cart/${cartItemId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                errorEl.textContent = data.message || 'Failed to delete item';
                return;
            }
            loadCart();
        } catch (err) {
            errorEl.textContent = 'Something went wrong. Please try again.';
        }
    }
}