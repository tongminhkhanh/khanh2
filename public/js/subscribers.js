// Subscribers Management Functions
let subscribersData = [];

async function fetchSubscribers() {
    const tbody = document.getElementById('subscribers-list');
    const token = localStorage.getItem('admin-token');

    // Skeleton loading
    tbody.innerHTML = Array(3).fill(0).map(() => `
        <tr><td class="px-6 py-4" colspan="4"><div class="animate-pulse bg-gray-200 h-4 rounded"></div></td></tr>
    `).join('');

    try {
        const res = await fetch('/api/subscriptions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subscriptions = await res.json();
        subscribersData = subscriptions;

        // Update count badge
        const countEl = document.getElementById('subscriber-count');
        if (countEl) countEl.textContent = `${subscriptions.length} subscribers`;

        if (!subscriptions || subscriptions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">No subscribers yet</td></tr>`;
            return;
        }

        tbody.innerHTML = subscriptions.map((s, idx) => `
            <tr>
                <td class="px-6 py-4 text-gray-500">${idx + 1}</td>
                <td class="px-6 py-4 font-medium">${s.email}</td>
                <td class="px-6 py-4 text-gray-500">${new Date(s.createdAt).toLocaleDateString('en-US')}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteSubscriber('${s._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error fetching subscribers:', err);
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading data</td></tr>`;
    }
}

window.deleteSubscriber = async (id) => {
    if (!confirm('Remove this subscriber from the list?')) return;

    const token = localStorage.getItem('admin-token');
    try {
        const res = await fetch(`/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            fetchSubscribers();
            if (typeof showToast === 'function') {
                showToast('success', 'Subscriber deleted!');
            } else {
                alert('Subscriber deleted!');
            }
        } else {
            alert('Error deleting subscriber');
        }
    } catch (err) {
        console.error('Error deleting subscriber:', err);
        alert('Error deleting subscriber');
    }
};

window.exportSubscribersCSV = () => {
    if (!subscribersData || subscribersData.length === 0) {
        alert('No data to export!');
        return;
    }

    // Create CSV content with headers
    const headers = ['No.', 'Email', 'Registered Date'];
    const rows = subscribersData.map((s, idx) => [
        idx + 1,
        s.email,
        new Date(s.createdAt).toLocaleDateString('en-US')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Create and download file with BOM for Excel compatibility
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    if (typeof showToast === 'function') {
        showToast('success', 'CSV file exported!');
    } else {
        alert('CSV file exported!');
    }
};
