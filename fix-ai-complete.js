const fs = require('fs');

let content = fs.readFileSync('admin.html', 'utf8');

// 1. Add AI buttons to header (Topic suggestion button)
content = content.replace(
    /<h2 class="text-xl font-bold mb-4">Thêm bài viết mới<\/h2>/,
    `<div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold">Thêm bài viết mới</h2>
                            <button type="button" id="btn-ai-topic-suggest" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                <span>🤖</span> Gợi ý chủ đề (AI)
                            </button>
                        </div>`
);

// 2. Add AI button next to Tags input
content = content.replace(
    /<div>\s*\r?\n\s*<label class="block text-sm font-medium text-gray-700">Tags<\/label>\s*\r?\n\s*<input type="text" id="tags"\s*\r?\n\s*class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"\s*\r?\n\s*placeholder="tag1, tag2">\s*\r?\n\s*<\/div>/,
    `<div>
                                    <label class="block text-sm font-medium text-gray-700">Tags</label>
                                    <div class="flex gap-2">
                                        <input type="text" id="tags"
                                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            placeholder="tag1, tag2">
                                        <button type="button" id="btn-ai-tag-suggest" class="mt-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors">
                                            🤖 Gợi ý
                                        </button>
                                    </div>
                                </div>`
);

// 3. Add Topic Suggestions Modal (before Media Modal)
const modalHtml = `    <!-- Topic Suggestions Modal -->
    <div id="topic-suggestions-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-900">🤖 Gợi ý chủ đề bài viết (AI)</h3>
                <button onclick="closeTopicSuggestionsModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div class="flex gap-2 mb-4">
                <input type="text" id="topic-search-input" 
                    class="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập chủ đề (VD: an toàn giao thông, Tết Nguyên đán...)">
                <button id="search-topics-btn" onclick="searchTopicSuggestions()" 
                    class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <span id="search-topics-spinner" class="hidden">
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                    <span id="search-topics-text">Tìm kiếm</span>
                </button>
            </div>
            <div id="topic-suggestions-loading" class="hidden py-8 text-center">
                <div class="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-gray-600">Đang tìm gợi ý từ AI...</p>
            </div>
            <div id="topic-suggestions-empty" class="py-8 text-center text-gray-500">
                <p>Nhập chủ đề và nhấn "Tìm kiếm" để nhận gợi ý từ AI</p>
            </div>
            <div id="topic-suggestions-error" class="hidden py-4">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-600" id="topic-suggestions-error-text">Có lỗi xảy ra</p>
                </div>
            </div>
            <div id="topic-suggestions-results" class="flex-1 overflow-y-auto space-y-3">
            </div>
        </div>
    </div>

`;

content = content.replace(
    '    <!-- Media Modal -->',
    modalHtml + '    <!-- Media Modal -->'
);

// 4. Add ai-suggestions.js import
content = content.replace(
    '<script src="/public/js/api.js"></script>',
    '<script src="/public/js/api.js"></script>\n    <script src="/public/js/ai-suggestions.js"></script>'
);

// 5. Add event handlers before </body>
const eventHandlers = `
    <!-- AI Suggestion Button Handlers -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Topic suggestion button
            const topicBtn = document.getElementById('btn-ai-topic-suggest');
            if (topicBtn) {
                topicBtn.addEventListener('click', function() {
                    if (typeof openTopicSuggestions === 'function') {
                        openTopicSuggestions();
                    } else {
                        alert('Module AI chưa được tải. Vui lòng refresh trang.');
                    }
                });
            }

            // Tag suggestion button
            const tagBtn = document.getElementById('btn-ai-tag-suggest');
            if (tagBtn) {
                tagBtn.addEventListener('click', function() {
                    if (typeof suggestTagsFromTitle === 'function') {
                        suggestTagsFromTitle();
                    } else {
                        alert('Module AI chưa được tải. Vui lòng refresh trang.');
                    }
                });
            }
        });
    </script>
`;

content = content.replace(
    '</body>',
    eventHandlers + '</body>'
);

fs.writeFileSync('admin.html', content);

// Verify changes
const updated = fs.readFileSync('admin.html', 'utf8');
console.log('✅ Changes applied:');
console.log('1. AI Topic button:', updated.includes('btn-ai-topic-suggest') ? '✓' : '✗');
console.log('2. AI Tag button:', updated.includes('btn-ai-tag-suggest') ? '✓' : '✗');
console.log('3. Topic modal:', updated.includes('topic-suggestions-modal') ? '✓' : '✗');
console.log('4. ai-suggestions.js:', updated.includes('ai-suggestions.js') ? '✓' : '✗');
console.log('5. Event handlers:', updated.includes('openTopicSuggestions') ? '✓' : '✗');
