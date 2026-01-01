/**
 * AI Suggestions Module for Admin Panel
 * Uses Perplexity AI for topic and tag suggestions
 */

(function () {
    'use strict';

    const API_URL = '/api';

    // ============================================
    // TOPIC SUGGESTIONS
    // ============================================

    window.openTopicSuggestions = function () {
        const modal = document.getElementById('topic-suggestions-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('topic-search-input').focus();
            // Clear previous results
            document.getElementById('topic-suggestions-results').innerHTML = '';
            document.getElementById('topic-suggestions-empty').classList.remove('hidden');
            document.getElementById('topic-suggestions-error').classList.add('hidden');
        }
    };

    window.closeTopicSuggestionsModal = function () {
        const modal = document.getElementById('topic-suggestions-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    window.searchTopicSuggestions = async function () {
        const topic = document.getElementById('topic-search-input').value.trim();
        if (!topic || topic.length < 2) {
            alert('Vui lòng nhập chủ đề (ít nhất 2 ký tự)');
            return;
        }

        const token = localStorage.getItem('admin-token');
        const btnText = document.getElementById('search-topics-text');
        const spinner = document.getElementById('search-topics-spinner');
        const btn = document.getElementById('search-topics-btn');
        const loadingEl = document.getElementById('topic-suggestions-loading');
        const resultsEl = document.getElementById('topic-suggestions-results');
        const errorEl = document.getElementById('topic-suggestions-error');
        const emptyEl = document.getElementById('topic-suggestions-empty');

        // Show loading state
        btnText.textContent = 'Đang tìm...';
        spinner.classList.remove('hidden');
        btn.disabled = true;
        loadingEl.classList.remove('hidden');
        resultsEl.innerHTML = '';
        errorEl.classList.add('hidden');
        emptyEl.classList.add('hidden');

        try {
            const res = await fetch(`${API_URL}/ai/suggest-topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });

            const data = await res.json();

            if (data.success && data.suggestions && data.suggestions.length > 0) {
                renderTopicSuggestions(data.suggestions);
            } else {
                errorEl.classList.remove('hidden');
                document.getElementById('topic-suggestions-error-text').textContent =
                    data.message || 'Không tìm thấy gợi ý nào. Thử từ khóa khác.';
            }
        } catch (err) {
            console.error('Topic suggestion error:', err);
            errorEl.classList.remove('hidden');
            document.getElementById('topic-suggestions-error-text').textContent =
                'Lỗi kết nối. Vui lòng kiểm tra PERPLEXITY_API_KEY trong .env';
        } finally {
            btnText.textContent = 'Tìm kiếm';
            spinner.classList.add('hidden');
            btn.disabled = false;
            loadingEl.classList.add('hidden');
        }
    };

    function renderTopicSuggestions(suggestions) {
        const resultsEl = document.getElementById('topic-suggestions-results');
        resultsEl.innerHTML = suggestions.map((s, i) => `
            <div class="p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-md transition cursor-pointer bg-white"
                 onclick="selectTopicSuggestion(${i})">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">${escapeHtml(s.title)}</h4>
                        <p class="text-sm text-gray-600 mt-1">${escapeHtml(s.description || '')}</p>
                    </div>
                    <span class="ml-3 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                        ${escapeHtml(s.category || 'Tin tức')}
                    </span>
                </div>
            </div>
        `).join('');

        // Store suggestions for selection
        window._topicSuggestions = suggestions;
    }

    window.selectTopicSuggestion = function (index) {
        const suggestion = window._topicSuggestions[index];
        if (!suggestion) return;

        // Fill form fields
        document.getElementById('title').value = suggestion.title;

        // Map category if possible
        const categorySelect = document.getElementById('category');
        const categoryMap = {
            'Hoạt động': 'Hoat dong',
            'Tin tức': 'Tin tuc',
            'Thông báo': 'Thong bao',
            'Thành tích': 'Thanh tich',
            'Sự kiện': 'Sự kiện'
        };
        if (suggestion.category && categoryMap[suggestion.category]) {
            categorySelect.value = categoryMap[suggestion.category];
        }

        // Close modal
        closeTopicSuggestionsModal();

        // Focus on title for editing
        document.getElementById('title').focus();
    };

    // ============================================
    // TAG SUGGESTIONS
    // ============================================

    window.suggestTagsFromTitle = async function () {
        const title = document.getElementById('title').value.trim();
        if (!title || title.length < 5) {
            alert('Vui lòng nhập tiêu đề bài viết trước (ít nhất 5 ký tự)');
            return;
        }

        const token = localStorage.getItem('admin-token');
        const btn = document.getElementById('suggest-tags-btn');
        const content = window.articleEditor ? window.articleEditor.getHTML() : '';

        // Show loading state
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<div class="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/ai/suggest-tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            const data = await res.json();

            if (data.success && data.tags && data.tags.length > 0) {
                // Get existing tags
                const tagsInput = document.getElementById('tags');
                const existingTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);

                // Merge with new tags (no duplicates)
                const allTags = [...new Set([...existingTags, ...data.tags])];
                tagsInput.value = allTags.join(', ');

                // Flash success effect
                tagsInput.classList.add('ring-2', 'ring-green-500');
                setTimeout(() => tagsInput.classList.remove('ring-2', 'ring-green-500'), 2000);
            } else {
                alert(data.message || 'Không thể gợi ý tags. Thử lại sau.');
            }
        } catch (err) {
            console.error('Tag suggestion error:', err);
            alert('Lỗi kết nối. Vui lòng kiểm tra PERPLEXITY_API_KEY trong .env');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    };

    // ============================================
    // UTILITIES
    // ============================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Allow Enter key to search in topic modal
    document.addEventListener('DOMContentLoaded', function () {
        const topicInput = document.getElementById('topic-search-input');
        if (topicInput) {
            topicInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchTopicSuggestions();
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeTopicSuggestionsModal();
            }
        });

        // Close modal on backdrop click
        const modal = document.getElementById('topic-suggestions-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeTopicSuggestionsModal();
                }
            });
        }
    });

})();
