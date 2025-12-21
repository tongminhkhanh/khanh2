import os

file_path = r"d:\khanh2\admin.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Add checkbox to principal message form
old_form = '''                        <form id="principal-message-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tiêu đề</label>'''

new_form = '''                        <form id="principal-message-form" class="space-y-4">
                            <div class="flex items-center gap-4">
                                <label class="flex items-center">
                                    <input type="checkbox" id="principal-enabled"
                                        class="form-checkbox h-5 w-5 text-blue-600">
                                    <span class="ml-2 text-gray-700 font-bold">Hiển thị thông điệp</span>
                                </label>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tiêu đề</label>'''

if old_form in content:
    content = content.replace(old_form, new_form)
    print("HTML form change applied.")
else:
    print("HTML form target not found!")

# Change 2: Update fetchSettings to load isEnabled
old_fetch_principal = '''                // Principal Message
                const principalRes = await fetch(`${API_URL}/settings/principal_message`);
                const principalData = await principalRes.json();
                if (principalData.value) {
                    document.getElementById('principal-title').value = principalData.value.title || '';
                    document.getElementById('principal-content').value = principalData.value.content || '';
                }'''

new_fetch_principal = '''                // Principal Message
                const principalRes = await fetch(`${API_URL}/settings/principal_message`);
                const principalData = await principalRes.json();
                if (principalData.value) {
                    document.getElementById('principal-enabled').checked = principalData.value.isEnabled || false;
                    document.getElementById('principal-title').value = principalData.value.title || '';
                    document.getElementById('principal-content').value = principalData.value.content || '';
                }'''

if old_fetch_principal in content:
    content = content.replace(old_fetch_principal, new_fetch_principal)
    print("fetchSettings change applied.")
else:
    print("fetchSettings target not found!")

# Change 3: Update form submission to include isEnabled
old_submit = '''        document.getElementById('principal-message-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                title: document.getElementById('principal-title').value,
                content: document.getElementById('principal-content').value
            };'''

new_submit = '''        document.getElementById('principal-message-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                isEnabled: document.getElementById('principal-enabled').checked,
                title: document.getElementById('principal-title').value,
                content: document.getElementById('principal-content').value
            };'''

if old_submit in content:
    content = content.replace(old_submit, new_submit)
    print("Form submission change applied.")
else:
    print("Form submission target not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("All changes applied successfully!")
