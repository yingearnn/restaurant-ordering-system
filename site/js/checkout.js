document.addEventListener('DOMContentLoaded', loadCheckout);

async function loadCheckout() {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = '';

    try {
        const res = await fetch('/checkout/summary');
        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Failed to load checkout';
            return;
        }

        renderCheckout(data);
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
    }
}

function renderCheckout(data) {
    const tbody = document.getElementById('checkout-table-body');
    tbody.innerHTML = '';

    data.items.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_price.toFixed(2)}</td>
            <td>${item.line_subtotal.toFixed(2)}</td>
            <td>${item.discount_percent_applied}% (-${item.line_discount_amount.toFixed(2)})</td>
            <td>${item.line_total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('items-subtotal').textContent = data.items_subtotal.toFixed(2);
    document.getElementById('product-discount').textContent = data.product_discount_total.toFixed(2);
    document.getElementById('cart-discount-pct').textContent = data.cart_value_discount_percent;
    document.getElementById('cart-discount').textContent = data.cart_value_discount_amount.toFixed(2);
    document.getElementById('delivery-fee').textContent = data.delivery_fee.toFixed(2);
    document.getElementById('final-total').textContent = data.final_total.toFixed(2);
}

const placeOrderBtn = document.getElementById('place-order-btn');
if (placeOrderBtn) {
   placeOrderBtn.addEventListener('click', async () => {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    errorEl.textContent = '';
    successEl.textContent = '';

    try {
        const res = await fetch('/orders/place', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Failed to place order';
            return;
        }

        successEl.textContent = data.message;
        setTimeout(() => {
            window.location.href = demoPath('/member/products');
        }, 1500);
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
    }
});
}