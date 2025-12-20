const Events = {
    // Initialize
    init() {
        this.setupForm();
    },

    // Setup form listeners
    setupForm() {
        const form = Utils.$('event-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.save();
            });
        }

        const cancelBtn = Utils.$('cancel-event-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }

        const typeSelect = Utils.$('event-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => this.toggleTargetFields());
        }

        const categorySelect = Utils.$('event-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.updateColor());
        }
    },

    // Toggle target fields based on event type
    toggleTargetFields() {
        const eventType = Utils.$('event-type')?.value;
        const container = Utils.$('event-target-container');
        if (container) {
            container.style.display = eventType === 'class' ? 'grid' : 'none';
        }
    },

    // Update color based on category
    updateColor() {
        const select = Utils.$('event-category');
        if (select) {
            const color = select.options[select.selectedIndex].getAttribute('data-color');
            Utils.$('event-color').value = color;
        }
    },

    // Set category by color
    setCategoryByColor(color) {
        const select = Utils.$('event-category');
        const colorMap = {
            '#dc2626': 'exam',
            '#2563eb': 'activity',
            '#16a34a': 'holiday',
            '#6b7280': 'other'
        };
        if (select) {
            select.value = colorMap[color] || 'other';
        }
    },

    // Fetch events list
    async fetch() {
        const tbody = Utils.$('events-list');
        if (!tbody) return;

        tbody.innerHTML = Array(5).fill(0).map(() => `
            <tr class="skeleton-row">
                <td class="px-6 py-4"><div class="skeleton h-4 w-3/4 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/2 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/2 rounded"></div></td>
                <td class="px-6 py-4"><div class="skeleton h-4 w-1/4 rounded"></div></td>
                <td class="px-6 py-4 text-right"><div class="skeleton h-8 w-16 rounded ml-auto"></div></td>
            </tr>
        `).join('');

        try {
            const events = await API.get('/admin/events');

            if (!events || events.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">No events found</td></tr>`;
                return;
            }

            tbody.innerHTML = events.map(e => `
                <tr>
                    <td class="px-6 py-4 font-medium">${Utils.escapeHtml(e.title)}</td>
                    <td class="px-6 py-4 text-gray-500">${Utils.formatDate(e.startDate)}</td>
                    <td class="px-6 py-4 text-gray-500">${e.location || '-'}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full ${e.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${e.isPublished ? 'Published' : 'Draft'}</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="Events.edit('${e._id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                        <button onclick="Events.delete('${e._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            Utils.error(err);
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading data</td></tr>`;
        }
    },

    // Save event
    async save() {
        const id = Utils.$('event-id')?.value;
        const eventType = Utils.$('event-type')?.value;

        const event = {
            title: Utils.$('event-title')?.value,
            description: Utils.$('event-description')?.value,
            startDate: Utils.$('event-start')?.value,
            endDate: Utils.$('event-end')?.value,
            type: eventType,
            location: Utils.$('event-location')?.value,
            color: Utils.$('event-color')?.value,
            isPublished: Utils.$('event-published')?.checked,
            targetGrade: eventType === 'class' ? Utils.$('event-target-grade')?.value : null,
            targetClass: eventType === 'class' ? Utils.$('event-target-class')?.value : null
        };

        const endpoint = id ? `/events/${id}` : '/events';

        try {
            if (id) {
                await API.put(endpoint, event);
            } else {
                await API.post(endpoint, event);
            }
            this.resetForm();
            this.fetch();
            Utils.showSuccess('Event saved!');
        } catch (err) {
            Utils.showError('Error: ' + err.message);
        }
    },

    // Edit event
    async edit(id) {
        try {
            const events = await API.get('/admin/events');
            const event = events.find(x => x._id === id);

            if (event) {
                Utils.$('event-id').value = event._id;
                Utils.$('event-title').value = event.title;
                Utils.$('event-description').value = event.description || '';
                Utils.$('event-start').value = Utils.formatDateTime(event.startDate);
                Utils.$('event-end').value = Utils.formatDateTime(event.endDate);
                Utils.$('event-type').value = event.type || 'public';
                Utils.$('event-location').value = event.location || '';
                this.setCategoryByColor(event.color || '#dc2626');
                Utils.$('event-color').value = event.color || '#dc2626';
                Utils.$('event-published').checked = event.isPublished;
                Utils.$('event-target-grade').value = event.targetGrade || '';
                Utils.$('event-target-class').value = event.targetClass || '';
                this.toggleTargetFields();
                Utils.$('cancel-event-edit').classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        } catch (err) {
            Utils.showError('Error loading event');
        }
    },

    // Delete event
    async delete(id) {
        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog({
                title: 'Delete Event?',
                message: 'This event will be permanently deleted and cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    await API.delete(`/events/${id}`);
                    this.fetch();
                    Utils.showSuccess('Event deleted!');
                }
            });
        } else if (confirm('Delete this event?')) {
            try {
                await API.delete(`/events/${id}`);
                this.fetch();
                Utils.showSuccess('Event deleted!');
            } catch (err) {
                Utils.showError('Error deleting event');
            }
        }
    },

    // Reset form
    resetForm() {
        const form = Utils.$('event-form');
        if (form) form.reset();

        Utils.$('event-id').value = '';
        Utils.$('event-category').value = 'exam';
        Utils.$('event-color').value = '#dc2626';
        Utils.$('event-target-grade').value = '';
        Utils.$('event-target-class').value = '';
        Utils.$('event-target-container').style.display = 'none';
        Utils.$('cancel-event-edit').classList.add('hidden');
    }
};

// Expose to window for onclick handlers
window.Events = Events;
