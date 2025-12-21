import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the incorrect route
old_route = "window.location.href='/tin-tuc/${article.slug}'"
new_route = "window.location.href='/bai-viet/${article.slug || article._id}'"

if old_route in content:
    content = content.replace(old_route, new_route)
    print("Route fixed: /tin-tuc/ -> /bai-viet/")
else:
    print("Route target not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
