import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location after principal message fetch and before articles fetch
# Add scrolling news population code

old_js = '''            try {
                const response = await fetch('/api/articles');
                const articles = await response.json();

                if (articles.length > 0) {
                    // Populate Featured Section'''

new_js = '''            // Fetch and Populate Scrolling News
            try {
                const scrollingResponse = await fetch('/api/articles');
                const scrollingArticles = await scrollingResponse.json();
                const scrollingList = document.getElementById('scrolling-news-list');
                
                if (scrollingArticles.length > 0 && scrollingList) {
                    // Take first 6 articles for scrolling
                    const newsItems = scrollingArticles.slice(0, 6);
                    
                    // Create items twice for seamless loop
                    const createNewsItem = (article) => {
                        const categoryClass = article.category === 'su-kien' ? 'su-kien' : 'tin-tuc';
                        const categoryText = article.category === 'su-kien' ? 'Sự kiện' : 'Tin tức';
                        return `
                            <div class="news-item" onclick="window.location.href='/tin-tuc/${article.slug}'">
                                <span class="news-category ${categoryClass}">${categoryText}</span>
                                <h4 class="text-sm font-semibold text-text-main dark:text-white line-clamp-2">${article.title}</h4>
                            </div>
                        `;
                    };
                    
                    // Duplicate items for seamless scrolling
                    const itemsHtml = newsItems.map(createNewsItem).join('');
                    scrollingList.innerHTML = itemsHtml + itemsHtml;
                }
            } catch (error) {
                console.error('Error fetching scrolling news:', error);
            }

            try {
                const response = await fetch('/api/articles');
                const articles = await response.json();

                if (articles.length > 0) {
                    // Populate Featured Section'''

if old_js in content:
    content = content.replace(old_js, new_js)
    print("JavaScript for scrolling news added.")
else:
    print("JavaScript target not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 2 changes applied!")
