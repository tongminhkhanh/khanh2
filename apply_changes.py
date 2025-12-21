import os

file_path = r"d:\khanh2\code.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Add ID to container
old_html = '                <div>\n                    <h2 id="principal-message-title"'
new_html = '                <div id="principal-message-container">\n                    <h2 id="principal-message-title"'

if old_html in content:
    content = content.replace(old_html, new_html)
    print("HTML change applied.")
else:
    print("HTML target not found!")

# Change 2: Update JS
old_js = """            // Fetch Principal Message
            try {
                const response = await fetch('/api/settings/principal_message');
                if (response.ok) {
                    const setting = await response.json();
                    const data = setting.value || {};
                    if (data.title) document.getElementById('principal-message-title').innerText = data.title;
                    if (data.content) document.getElementById('principal-message-content').innerText = data.content;
                }
            } catch (error) {
                console.error('Error fetching principal message:', error);
            }"""

new_js = """            // Fetch Principal Message
            try {
                const response = await fetch('/api/settings/principal_message');
                if (response.ok) {
                    const setting = await response.json();
                    const data = setting.value || {};
                    const container = document.getElementById('principal-message-container');

                    if (data && data.isEnabled) {
                        if (container) container.classList.remove('hidden');
                        if (data.title) document.getElementById('principal-message-title').innerText = data.title;
                        if (data.content) document.getElementById('principal-message-content').innerText = data.content;
                    } else {
                        if (container) container.classList.add('hidden');
                    }
                }
            } catch (error) {
                console.error('Error fetching principal message:', error);
            }"""

if old_js in content:
    content = content.replace(old_js, new_js)
    print("JS change applied.")
else:
    print("JS target not found!")
    # Debug: print surrounding content if not found
    start_marker = "// Fetch Principal Message"
    if start_marker in content:
        idx = content.find(start_marker)
        print(f"Found marker at {idx}. Content around marker:")
        print(content[idx:idx+500])

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
