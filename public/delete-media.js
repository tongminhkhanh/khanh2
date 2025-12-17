// Delete Media Function
window.deleteMedia = async (id, filename) => {
    if (!confirm(`Ban co chac chan muon xoa anh "${filename}"?`)) return;

    const token = localStorage.getItem('admin-token');
    try {
        const res = await fetch(`/api/media/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            if (typeof fetchMedia === 'function') {
                fetchMedia();
            } else {
                location.reload();
            }
            alert('Xoa anh thanh cong!');
        } else {
            const data = await res.json();
            alert('Loi: ' + data.message);
        }
    } catch (err) {
        console.error('Error deleting media:', err);
        alert('Loi ket noi server');
    }
};

// Override fetchMedia to add delete buttons
const originalFetchMedia = window.fetchMedia || (async () => { });
window.fetchMediaWithDelete = async (forModal = false) => {
    const token = localStorage.getItem('admin-token');
    try {
        const res = await fetch('/api/media', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const media = await res.json();

        const container = forModal ? document.getElementById('modal-media-grid') : document.getElementById('media-grid');
        if (!container) return;

        container.innerHTML = '';

        media.forEach(item => {
            const div = document.createElement('div');
            div.className = 'relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border hover:border-blue-500';

            const img = document.createElement('img');
            img.src = item.path;
            img.className = 'w-full h-full object-cover';
            div.appendChild(img);

            if (forModal) {
                div.classList.add('cursor-pointer');
                div.onclick = () => {
                    if (typeof selectMedia === 'function') selectMedia(item.path);
                };
            } else {
                // Filename label
                const label = document.createElement('div');
                label.className = 'absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate';
                label.textContent = item.filename;
                div.appendChild(label);

                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg font-bold leading-none';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Xoa anh';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteMedia(item._id, item.filename);
                };
                div.appendChild(deleteBtn);
            }
            container.appendChild(div);
        });
    } catch (err) {
        console.error('Error fetching media:', err);
    }
};

// Auto-replace fetchMedia on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('media-grid')) {
        window.fetchMedia = window.fetchMediaWithDelete;
    }
});
