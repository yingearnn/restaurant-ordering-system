// ===== ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    fetchDashboardData();
});

// ===== LOAD CATEGORIES FOR FILTER =====
async function loadCategories() {
    try {
       const res = await fetch('/products/categories');
       const data = await res.json();

    if (!data.success || !data.categories) return;

        const categories = data.categories;
        const select     = document.getElementById('category');

        categories.forEach(cat => {
            const option       = document.createElement('option');
            option.value       = cat;
            option.textContent = cat;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ===== FETCH DASHBOARD DATA =====
async function fetchDashboardData(params = '') {
    const tbody          = document.getElementById('orders-tbody');
    const noOrders       = document.getElementById('no-orders');
    const tableContainer = document.getElementById('orders-table-container');

    tbody.innerHTML      = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    noOrders.style.display       = 'none';
    tableContainer.style.display = 'block';

    try {
        const res  = await fetch(`/dashboard/data${params}`);
        const data = await res.json();

        tbody.innerHTML = '';

        if (!res.ok) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-danger">${data.message || 'Failed to load data.'}</td></tr>`;
            return;
        }

        if (!data.orders || data.orders.length === 0) {
            tableContainer.style.display = 'none';
            noOrders.style.display       = 'block';
            return;
        }

        data.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.customer_name}</td>
                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>
                    <span class="badge ${getStatusBadge(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>${order.item_count}</td>
                <td>${order.products}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-danger">An error occurred while loading data.</td></tr>';
    }
}

// ===== GET STATUS BADGE COLOR =====
function getStatusBadge(status) {
    switch (status) {
        case 'COMPLETED': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        case 'PACKING':   return 'bg-warning';
        default:          return 'bg-secondary';
    }
}

// ===== APPLY FILTERS =====
document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const startDate = document.getElementById('start_date').value;
    const endDate   = document.getElementById('end_date').value;
    const category  = document.getElementById('category').value;
    const sortBy    = document.getElementById('sort_by').value;
    const sortOrder = document.getElementById('sort_order').value;

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate)   params.append('end_date',   endDate);
    if (category)  params.append('category',   category);
    if (sortBy)    params.append('sort_by',    sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    fetchDashboardData(queryString);
});

// ===== CLEAR FILTERS =====
function clearFilters() {
    document.getElementById('start_date').value  = '';
    document.getElementById('end_date').value    = '';
    document.getElementById('category').value    = '';
    document.getElementById('sort_by').value     = 'order_date';
    document.getElementById('sort_order').value  = 'DESC';
    fetchDashboardData();
}

function updateUserWelcome(user) {
    const welcomeElement = document.getElementById('user-welcome');
    if (welcomeElement && user) {
        welcomeElement.textContent = `Welcome, ${user.name}`;
    }
}