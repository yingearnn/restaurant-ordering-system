const prisma = require('../config/prisma');

// Get (or lazily create) the single active cart for a member
async function getOrCreateCart(memberId) {
    let cart = await prisma.cart.findUnique({
        where: { memberId }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { memberId }
        });
    }

    return cart;
}

// CREATE - add an item to the member's cart.
// If the product is already in the cart, bump the quantity instead of duplicating the row.
module.exports.createCartItems = async (memberId, productId, quantity) => {
    const product = await prisma.product.findUnique({
        where: { productId }
    });

    if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
    }

    if (product.isAvailable === false) {
        const err = new Error('Product is not available');
        err.status = 400;
        throw err;
    }

    const cart = await getOrCreateCart(memberId);

    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.cartId,
                productId
            }
        }
    });

    if (existingItem) {
        return prisma.cartItem.update({
            where: { cartItemId: existingItem.cartItemId },
            data: { quantity: existingItem.quantity + quantity }
        });
    }

    return prisma.cartItem.create({
        data: {
            cartId: cart.cartId,
            productId,
            quantity
        }
    });
};

// READ - all items in the member's cart, with product details for display
module.exports.getCartItems = async (memberId) => {
    const cart = await getOrCreateCart(memberId);

    return prisma.cartItem.findMany({
        where: { cartId: cart.cartId },
        include: { product: true },
        orderBy: { addedAt: 'asc' }
    });
};

// READ - cart summary (total quantity, total checkout price), computed on the back-end
module.exports.getCartSummary = async (memberId) => {
    const items = await module.exports.getCartItems(memberId);

    const summary = items.reduce(
        (acc, item) => {
            const subtotal = Number(item.product.price) * item.quantity;
            acc.total_quantity += item.quantity;
            acc.total_checkout_price += subtotal;
            return acc;
        },
        { total_quantity: 0, total_checkout_price: 0 }
    );

    summary.total_checkout_price = Number(summary.total_checkout_price.toFixed(2));
    return summary;
};

// UPDATE - change quantity of a single cart item (must belong to the requesting member)
module.exports.updateCartItems = async (memberId, cartItemId, quantity) => {
    if (quantity <= 0) {
        const err = new Error('Quantity must be greater than 0');
        err.status = 400;
        throw err;
    }

    const cartItem = await prisma.cartItem.findUnique({
        where: { cartItemId },
        include: { cart: true }
    });

    if (!cartItem || cartItem.cart.memberId !== memberId) {
        const err = new Error('Cart item not found');
        err.status = 404;
        throw err;
    }

    return prisma.cartItem.update({
        where: { cartItemId },
        data: { quantity }
    });
};

// DELETE - remove a single item from the cart (must belong to the requesting member)
module.exports.deleteCartItems = async (memberId, cartItemId) => {
    const cartItem = await prisma.cartItem.findUnique({
        where: { cartItemId },
        include: { cart: true }
    });

    if (!cartItem || cartItem.cart.memberId !== memberId) {
        const err = new Error('Cart item not found');
        err.status = 404;
        throw err;
    }

    return prisma.cartItem.delete({
        where: { cartItemId }
    });
};