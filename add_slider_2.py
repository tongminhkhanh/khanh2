import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location to add slider JS - after the featured section population
old_js = '''                    if (mainArticle) {
                        featuredSection.classList.remove('hidden');
                        document.getElementById('featured-main-bg').src = mainArticle.image || 'https://via.placeholder.com/800x400';
                        document.getElementById('featured-main-title').innerText = mainArticle.title;
                        document.getElementById('featured-main-category').innerText = mainArticle.category || 'Tiêu điểm';
                        document.getElementById('featured-main').onclick = () => window.location.href = `/bai-viet/${mainArticle.slug || mainArticle._id}`;
                    }

                    // Side list replaced by scrolling news - no action needed here'''

new_js = '''                    // Featured Slider Setup
                    const featuredArticles = articles.slice(0, 5); // Use first 5 for slider
                    let currentSlide = 0;
                    
                    function showSlide(index) {
                        if (index < 0) index = featuredArticles.length - 1;
                        if (index >= featuredArticles.length) index = 0;
                        currentSlide = index;
                        
                        const article = featuredArticles[currentSlide];
                        document.getElementById('featured-main-bg').src = article.image || 'https://via.placeholder.com/800x400';
                        document.getElementById('featured-main-title').innerText = article.title;
                        document.getElementById('featured-main-category').innerText = article.category || 'Tiêu điểm';
                        document.getElementById('featured-main').onclick = () => window.location.href = `/bai-viet/${article.slug || article._id}`;
                        
                        // Update indicators
                        document.querySelectorAll('#featured-indicators button').forEach((dot, i) => {
                            dot.classList.toggle('bg-white', i === currentSlide);
                            dot.classList.toggle('bg-white/50', i !== currentSlide);
                        });
                    }
                    
                    if (featuredArticles.length > 0) {
                        featuredSection.classList.remove('hidden');
                        
                        // Create indicators
                        const indicators = document.getElementById('featured-indicators');
                        indicators.innerHTML = featuredArticles.map((_, i) => 
                            `<button class="w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'} hover:bg-white transition-colors" onclick="event.stopPropagation()"></button>`
                        ).join('');
                        
                        // Add click handlers to indicators
                        indicators.querySelectorAll('button').forEach((dot, i) => {
                            dot.onclick = (e) => { e.stopPropagation(); showSlide(i); };
                        });
                        
                        // Navigation buttons
                        document.getElementById('featured-prev').onclick = (e) => { e.stopPropagation(); showSlide(currentSlide - 1); };
                        document.getElementById('featured-next').onclick = (e) => { e.stopPropagation(); showSlide(currentSlide + 1); };
                        
                        // Show first slide
                        showSlide(0);
                        
                        // Auto-slide every 5 seconds
                        setInterval(() => showSlide(currentSlide + 1), 5000);
                    }

                    // Side list replaced by scrolling news - no action needed here'''

if old_js in content:
    content = content.replace(old_js, new_js)
    print("Slider JavaScript added.")
else:
    print("JavaScript target not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 2 done!")
