import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Replace the featured-side-list with scrolling news container
old_html = '''                <div id="featured-side-list"
                    class="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <!-- Side items injected here -->
                </div>'''

new_html = '''                <!-- Vertical Scrolling News -->
                <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div id="scrolling-news-container" class="relative h-48 overflow-hidden">
                        <div id="scrolling-news-list" class="scrolling-news-animation">
                            <!-- News items will be injected here -->
                        </div>
                    </div>
                </div>'''

if old_html in content:
    content = content.replace(old_html, new_html)
    print("HTML container change applied.")
else:
    print("HTML container target not found!")

# Change 2: Add CSS for scrolling animation (before </head>)
css_code = '''    <style>
        /* Vertical Scrolling News Animation */
        @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .scrolling-news-animation {
            animation: scrollUp 15s linear infinite;
        }
        #scrolling-news-container:hover .scrolling-news-animation {
            animation-play-state: paused;
        }
        .news-item {
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .news-item:hover {
            background-color: rgba(43, 140, 238, 0.05);
        }
        .dark .news-item {
            border-bottom-color: #374151;
        }
        .dark .news-item:hover {
            background-color: rgba(43, 140, 238, 0.1);
        }
        .news-category {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 4px;
        }
        .news-category.tin-tuc {
            background-color: #dbeafe;
            color: #1d4ed8;
        }
        .news-category.su-kien {
            background-color: #fee2e2;
            color: #dc2626;
        }
        .dark .news-category.tin-tuc {
            background-color: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }
        .dark .news-category.su-kien {
            background-color: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
    </style>
</head>'''

if '</head>' in content:
    content = content.replace('</head>', css_code)
    print("CSS styles added.")
else:
    print("</head> not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 1 changes applied!")
