import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Add navigation arrows to featured-main section
old_featured = '''            <!-- Main Featured Article -->
            <div id="featured-main"
                class="w-full lg:w-3/5 relative group cursor-pointer overflow-hidden rounded-lg aspect-video lg:aspect-auto min-h-[300px]"
                onclick="">
                <img id="featured-main-bg" src="" alt="Featured Article"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-6 flex flex-col gap-2">
                    <span id="featured-main-category"
                        class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold w-fit mb-2">
                        Tiêu điểm
                    </span>
                    <h1 id="featured-main-title"
                        class="text-white text-2xl lg:text-3xl font-bold leading-tight drop-shadow-md">
                        <!-- Title -->
                    </h1>
                </div>
            </div>'''

new_featured = '''            <!-- Main Featured Article with Slider -->
            <div id="featured-main"
                class="w-full lg:w-3/5 relative group cursor-pointer overflow-hidden rounded-lg aspect-video lg:aspect-auto min-h-[300px]">
                <img id="featured-main-bg" src="" alt="Featured Article"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <!-- Navigation Arrows -->
                <button id="featured-prev" 
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button id="featured-next" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
                
                <!-- Slide Indicators -->
                <div id="featured-indicators" class="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    <!-- Dots will be injected here -->
                </div>
                
                <div class="absolute bottom-0 left-0 p-6 flex flex-col gap-2">
                    <span id="featured-main-category"
                        class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold w-fit mb-2">
                        Tiêu điểm
                    </span>
                    <h1 id="featured-main-title"
                        class="text-white text-2xl lg:text-3xl font-bold leading-tight drop-shadow-md">
                        <!-- Title -->
                    </h1>
                </div>
            </div>'''

if old_featured in content:
    content = content.replace(old_featured, new_featured)
    print("Navigation arrows added to HTML.")
else:
    print("Featured section target not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 1 done!")
