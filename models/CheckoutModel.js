const prisma = require('../config/prisma');
const cartModel = require('./CartModel');

async function getBestProductDiscount(productId, quantity) {
    const rules = await prisma.productDiscount.findMany({
        where: {
            isActive: true,
            minQuantity: { lte: quantity },
            OR: [{ productId }, { productId: null }]
        },
        orderBy: { discountPercent: 'desc' }
    });
    return rules[0] || null; // pick the highest qualifying tier
}

async function getBestCartValueDiscount(cartSubtotal) {
    const rules = await prisma.cartValueDiscount.findMany({
        where: { isActive: true, minCartValue: { lte: cartSubtotal } },
        orderBy: { discountPercent: 'desc' }
    });
    return rules[0] || null;
}

async function getDeliveryFee(orderValue) {
    const tier = await prisma.deliveryFeeTier.findFirst({
        where: {
            isActive: true,
            minOrderValue: { lte: orderValue },
            OR: [{ maxOrderValue: null }, { maxOrderValue: { gte: orderValue } }]
        },
        orderBy: { minOrderValue: 'desc' }
    });
    return tier ? Number(tier.deliveryFee) : 0;
}

// Combines product discounts (per line) + cart value discount (stacked on top) + delivery fee tier.
// All computed server-side; front-end only displays the result.
module.exports.getCheckoutSummary = async (memberId) => {
    const items = await cartModel.getCartItems(memberId);

    if (items.length === 0) {
        const err = new Error('Cart is empty');
        err.status = 400;
        throw err;
    }

    let itemsSubtotal = 0;
    let productDiscountTotal = 0;
    const lineItems = [];

    for (const item of items) {
        const unitPrice = Number(item.product.price);
        const lineSubtotal = unitPrice * item.quantity;
        itemsSubtotal += lineSubtotal;

        const discountRule = await getBestProductDiscount(item.productId, item.quantity);
        let lineDiscount = 0;
        if (discountRule) {
            lineDiscount = lineSubtotal * (Number(discountRule.discountPercent) / 100);
            productDiscountTotal += lineDiscount;
        }

        lineItems.push({
            cart_item_id: item.cartItemId,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: unitPrice,
            line_subtotal: Number(lineSubtotal.toFixed(2)),
            discount_percent_applied: discountRule ? Number(discountRule.discountPercent) : 0,
            line_discount_amount: Number(lineDiscount.toFixed(2)),
            line_total: Number((lineSubtotal - lineDiscount).toFixed(2))
        });
    }

    const afterProductDiscount = itemsSubtotal - productDiscountTotal;

    const cartValueRule = await getBestCartValueDiscount(afterProductDiscount);
    const cartValueDiscountAmount = cartValueRule
        ? afterProductDiscount * (Number(cartValueRule.discountPercent) / 100)
        : 0;

    const afterAllDiscounts = afterProductDiscount - cartValueDiscountAmount;

    const deliveryFee = await getDeliveryFee(afterAllDiscounts);
    const finalTotal = afterAllDiscounts + deliveryFee;

    return {
        items: lineItems,
        items_subtotal: Number(itemsSubtotal.toFixed(2)),
        product_discount_total: Number(productDiscountTotal.toFixed(2)),
        cart_value_discount_percent: cartValueRule ? Number(cartValueRule.discountPercent) : 0,
        cart_value_discount_amount: Number(cartValueDiscountAmount.toFixed(2)),
        delivery_fee: Number(deliveryFee.toFixed(2)),
        final_total: Number(finalTotal.toFixed(2))
    };
};