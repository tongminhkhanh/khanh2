import re

# Read the file
with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace TinyMCE CDN with TinyMCE Cloud CDN (with API key placeholder)
old_cdn = '<script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js" defer></script>'
new_cdn = '<script src="https://cdn.tiny.cloud/1/TINYMCE_API_KEY/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>'

content = content.replace(old_cdn, new_cdn)

# 2. Update TinyMCE init with more plugins and image upload
old_init = """// TinyMCE Init
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof tinymce !== 'undefined') {
                tinymce.init({
                    selector: '#content, #page-content-editor',
                    height: 400,
                    menubar: false,
                    plugins: 'lists link image code',
                    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
                    file_picker_callback: function (cb) { openMediaSelector(null, cb); }
                });
            }
        });"""

new_init = """// TinyMCE Init
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof tinymce !== 'undefined') {
                tinymce.init({
                    selector: '#content, #page-content-editor',
                    height: 400,
                    menubar: true,
                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                    file_picker_callback: function (cb) { openMediaSelector(null, cb); },
                    image_title: true,
                    automatic_uploads: true,
                    images_upload_handler: function (blobInfo, progress) {
                        return new Promise((resolve, reject) => {
                            const formData = new FormData();
                            formData.append('file', blobInfo.blob(), blobInfo.filename());
                            fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Authorization': 'Bearer ' + token },
                                body: formData
                            })
                            .then(res => res.json())
                            .then(data => resolve(data.url))
                            .catch(err => reject('Upload failed: ' + err.message));
                        });
                    }
                });
            }
        });"""

content = content.replace(old_init, new_init)

# Write the modified content back
with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! TinyMCE CDN updated and enhanced configuration applied.")
print("NOTE: You need to replace TINYMCE_API_KEY with your actual API key on Vercel.")
