import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the old featured-side-list code that's causing the error
old_code = '''                    const sideList = document.getElementById('featured-side-list');
                    sideList.innerHTML = '';
                    sideArticles.forEach(article => {
                        const html = `
                            <div class="flex items-center gap-3 group cursor-pointer" onclick="window.location.href='/bai-viet/${article.slug || article._id}'">
                                <img src="${article.image || 'https://via.placeholder.com/100x100'}" alt="${article.title}" class="w-20 h-14 rounded-md object-cover shrink-0" loading="lazy">
                                <div>
                                    <p class="text-xs text-primary font-semibold mb-1">${article.category || 'Tin tức'}</p>
                                    <h3 class="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                        ${article.title}
                                    </h3>
                                </div>
                            </div>
                        `;
                        sideList.innerHTML += html;
                    });'''

new_code = '''                    // Side list replaced by scrolling news - no action needed here'''

if old_code in content:
    content = content.replace(old_code, new_code)
    print("Removed old featured-side-list code.")
else:
    print("Target code not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
