const Media = {
    selectCallback: null,
    selectInputId: null,

    // Initialize
    init() {
        this.setupUpload();
    },

    // Setup upload listener
    setupUpload() {
        const uploadInput = Utils.$('media-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', async (e) => {
                if (e.target.files[0]) {
                    try {
                        await API.uploadFile('/upload', e.target.files[0]);
                        this.fetch();
                        Utils.showSuccess('Image uploaded!');
                    } catch (err) {
                        Utils.showError('Error: ' + err.message);
                    }
                }
            });
        }
    },

    // Fetch media list
    async fetch() {
        const grid = Utils.$('media-grid');
        if (!grid) return;

        grid.innerHTML = Array(6).fill(0).map(() => `<div class="skeleton h-24 w-full rounded"></div>`).join('');

        try {
            const media = await API.get('/media');

            if (!media || media.length === 0) {
                grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500">No images found</div>`;
                return;
            }

            grid.innerHTML = media.map(m => `
                <div class="relative group">
                    <img src="${m.path}" class="w-full h-24 object-cover rounded cursor-pointer" onclick="Media.copyUrl('${m.path}')">
                    <button onclick="Media.delete('${m._id}')"
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                </div>
            `).join('');
        } catch (err) {
            Utils.error(err);
            grid.innerHTML = `<div class="col-span-full py-4 text-center text-red-500">Error loading images</div>`;
        }
    },

    // Copy URL to clipboard
    copyUrl(url) {
        navigator.clipboard.writeText(url);
        Utils.showSuccess('URL copied!');
    },

    // Delete media
    async delete(id) {
        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog({
                title: 'Delete Image?',
                message: 'This image will be permanently deleted and cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    await API.delete(`/media/${id}`);
                    this.fetch();
                    Utils.showSuccess('Image deleted!');
                }
            });
        } else if (confirm('Delete this image?')) {
            try {
                await API.delete(`/media/${id}`);
                this.fetch();
                Utils.showSuccess('Image deleted!');
            } catch (err) {
                Utils.showError('Error deleting image');
            }
        }
    },

    // Open media selector modal
    async openSelector(inputId, callback) {
        this.selectInputId = inputId;
        this.selectCallback = callback;

        const modal = Utils.$('media-modal');
        if (modal) modal.classList.remove('hidden');

        const grid = Utils.$('modal-media-grid');
        if (grid) {
            grid.innerHTML = Array(4).fill(0).map(() => `<div class="skeleton h-24 w-full rounded"></div>`).join('');

            try {
                const media = await API.get('/media');
                grid.innerHTML = media.map(m => `
                    <img src="${m.path}" class="w-full h-24 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                        onclick="Media.select('${m.path}')">
                `).join('');
            } catch (err) {
                Utils.error(err);
            }
        }
    },

    // Select media from modal
    select(url) {
        if (this.selectCallback) {
            this.selectCallback(url, { alt: 'Image' });
        } else if (this.selectInputId) {
            const input = Utils.$(this.selectInputId);
            if (input) {
                input.value = url;
                input.dispatchEvent(new Event('change'));
            }
        }
        this.closeModal();
    },

    // Close media modal
    closeModal() {
        const modal = Utils.$('media-modal');
        if (modal) modal.classList.add('hidden');
        this.selectCallback = null;
        this.selectInputId = null;
    }
};

// Expose to window
window.Media = Media;
window.openMediaSelector = (inputId, callback) => Media.openSelector(inputId, callback);
window.closeMediaModal = () => Media.closeModal();
