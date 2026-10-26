# Restaurant Ordering System — ST0525 Database Systems CA2

## Project Overview

This project is developed for **ST0525 Database Systems CA2**.

It builds on the Restaurant Ordering System developed in CA1 and introduces additional database and application features for:

* Shopping cart management using Prisma ORM
* Checkout and discount calculation
* Delivery fee calculation
* Order placement using a PostgreSQL stored procedure
* Manufacturer database query-performance improvement using indexes

The application uses a Model-View-Controller (MVC) structure with Node.js, Express.js, PostgreSQL and Prisma ORM.

---

## Technologies Used

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* `@prisma/client`
* `pg`
* `express-session`
* `bcryptjs`
* `dotenv`
* HTML
* CSS
* JavaScript
* Bootstrap

---

## Prerequisites

Before running the project, ensure the following are installed:

* Node.js
* PostgreSQL
* pgAdmin 4
* Git
* npm

---

## Installation

1. Extract or clone the project.

2. Open the project folder in Visual Studio Code.

3. Open a terminal in the project directory.

4. Install the required packages:

```bash
npm install
```

5. Generate the Prisma client:

```bash
npx prisma generate
```

---

## Restaurant Database Setup

1. Open PostgreSQL or pgAdmin.

2. Create the restaurant database:

```text
restaurant_db
```

3. Restore the provided final restaurant database backup.

The project also contains:

```text
database/restaurant_db_restore.sql
```

4. The exported user-defined functions and stored procedures are provided separately in:

```text
functions_&_stored_procedures.sql
```

This includes the CA2 `place_orders` stored procedure used for order placement.

---

## Environment Configuration

Create/update the `.env` file with the PostgreSQL database configuration.

Example:

```text
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=restaurant_db
DB_PORT=5432

SESSION_SECRET=your-secret-key

PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/restaurant_db?schema=public"
```

Ensure that the credentials in `DB_PASSWORD` and `DATABASE_URL` match your local PostgreSQL configuration.

---

## Running the Application

Start the application with:

```bash
npm start
```

Alternatively, for development using nodemon:

```bash
npm run dev
```

The application runs by default at:

```text
http://localhost:3000
```

---

# CA2 Features

## 1. Database Design and Prisma ORM

Prisma ORM is integrated into the Restaurant Ordering System.

The CA2 database design introduces the following models:

* `cart`
* `cartItem`
* `productDiscount`
* `cartValueDiscount`
* `deliveryFeeTier`

The Prisma schema is located at:

```text
prisma/schema.prisma
```

### Important Design Decisions

* Each member can have one active cart.
* `memberId` is unique in the `cart` model.
* The combination of `cartId` and `productId` is unique in `cartItem`.
* Adding the same product again increases its quantity instead of creating another cart-item record.
* Discount and delivery-fee rules are stored in database tables instead of being hardcoded in the application.
* Discount and delivery rules can be activated or deactivated using `isActive`.

---

## 2. Cart Management

Cart management is implemented using Prisma ORM.

Members can:

* Add products to their cart
* Retrieve all cart items
* Update item quantities
* Delete individual cart items
* View a server-side calculated cart summary
* Proceed from the cart to checkout

Relevant files include:

```text
models/CartModel.js
controllers/cartController.js
routes/cartRoutes.js
views/cart/create.html
views/cart/retrieve-all.html
public/js/cart.js
views/products.html
```

### Main Cart Functions

```text
getOrCreateCart
createCartItems
getCartItems
getCartSummary
updateCartItems
deleteCartItems
```

Backend validation is used to check conditions such as:

* Valid product
* Product availability
* Valid quantity
* Cart-item ownership

A member can only update or delete items belonging to his/her own cart.

---

## 3. Checkout Management

Checkout calculation is implemented in:

```text
models/CheckoutModel.js
controllers/checkoutController.js
routes/checkoutRoutes.js
views/checkout.html
public/js/checkout.js
```

The checkout process supports:

### Product Quantity Discounts

Example:

```text
Buy 3 → 10% discount
```

### Cart Value Discounts

Example:

```text
Spend $100 → 5% discount
```

### Delivery Fee Tiers

The implemented delivery-fee rules support:

```text
Order value below $50       → $8 delivery fee
Order value $50 to $99.99   → $5 delivery fee
Order value $100 and above  → Free delivery
```

### Discount Stacking

Product discounts are calculated first.

A qualifying cart-value discount can then be applied to the value after product discounts.

The appropriate delivery-fee tier is subsequently selected.

All checkout calculations are performed on the backend.

---

## 4. Flexible and Extensible Discount Rules

Discount and delivery-fee rules are stored in:

```text
productDiscount
cartValueDiscount
deliveryFeeTier
```

The checkout logic queries these tables for active qualifying rules.

This means new rules can be introduced without rewriting the checkout calculation logic.

For example, a new rule such as:

```text
Buy 5 Product A → 15% discount
```

can be introduced by inserting a new discount record.

Existing rules can also be disabled using:

```text
isActive = false
```

without deleting the rule.

---

## 5. Transaction Management and Order Placement

Order placement is implemented using the PostgreSQL stored procedure:

```text
place_orders
```

Application files involved are:

```text
models/OrderModel.js
controllers/orderController.js
routes/orderRoutes.js
views/checkout.html
public/js/checkout.js
```

The application invokes the stored procedure using:

```sql
CALL place_orders($1, NULL);
```

through:

```text
POST /orders/place
```

### Order Processing Behaviour

The procedure processes cart items individually.

If a product is available:

* A sale order with status `PACKING` is created when required.
* A corresponding sale-order item is created.
* The processed item is removed from the cart.
* Processing continues with the remaining cart items.

If a product is unavailable:

* The item is not processed into the sale order.
* The item remains in the cart.
* Previously processed available items are not rolled back.
* Processing continues with the remaining cart items.

If no available items can be processed, no sale order is created.

---

## 6. Manufacturer Database Indexing

The CA2 assignment also includes improving query performance on the separate `manufacturer` database.

Six queries were evaluated using PostgreSQL `EXPLAIN ANALYZE`, with before-and-after performance comparisons.

Indexes implemented include:

```sql
CREATE INDEX idx_manufacturer_origin
ON manufacturer (origin);
```

```sql
CREATE INDEX idx_manufacturer_product_category
ON manufacturer (product_category);
```

```sql
CREATE INDEX idx_manufacturer_operational_employees
ON manufacturer (is_operational, employee_count);
```

```sql
CREATE INDEX idx_manufacturer_founded_since
ON manufacturer (founded_since);
```

```sql
CREATE INDEX idx_manufacturer_firm_name
ON manufacturer (firm_name varchar_pattern_ops);
```

```sql
CREATE INDEX idx_manufacturer_origin_category
ON manufacturer (origin, product_category);
```

The manufacturer database is used for the indexing exercise only and is not integrated into the Restaurant Ordering System application.

---

# Existing Application Features

The project also retains functionality developed previously, including:

## Member Features

* Member registration and login
* Browse restaurant products
* View product details
* Submit feedback
* View personal feedback
* Update feedback
* Delete feedback
* Feedback responses

## Administrator Features

* Administrator authentication
* Restaurant management dashboard
* Sales-summary information
* Filtering and sorting
* Aggregated sales statistics

---

# Project Structure

```text
config/
    database.js
    prisma.js

controllers/
    authController.js
    cartController.js
    checkoutController.js
    dashboardController.js
    FeedbackController.js
    orderController.js

database/
    restaurant_db_restore.sql

middleware/
    auth.js

models/
    CartModel.js
    CheckoutModel.js
    OrderModel.js
    FeedbackModel.js
    Member.js
    Product.js
    dashboardModel.js

prisma/
    schema.prisma

public/
    css/
    js/

routes/
    api.js
    auth.js
    cartRoutes.js
    checkoutRoutes.js
    dashboard.js
    feedbackRoutes.js
    orderRoutes.js
    products.js
    productsPage.js

views/
    cart/
    checkout.html
    dashboard.html
    login.html
    my-feedback.html
    product-detail.html
    products.html
    register.html

functions_&_stored_procedures.sql
server.js
package.json
readme.txt
```

---

## Important Submission Notes

* `node_modules` is not included in the source-code submission.
* Run `npm install` after extracting the project.
* Run `npx prisma generate` before starting the application.
* Ensure the restaurant database has been restored before running the application.
* Ensure the `.env` database credentials match the local PostgreSQL configuration.
* The `manufacturer` database is separate from the Restaurant Ordering System and is only used for the indexing component of CA2.
