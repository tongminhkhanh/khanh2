"""
Final comprehensive fix for ALL remaining encoding issues
"""

with open(r'd:\khanh2\admin.html', 'rb') as f:
    content = f.read()

# All remaining patterns from viewing file
replacements = [
    # Form header (line 94)
    (b"Th\xc3\x83\xc2\xaam b\xc3\x83 i Articles m\xc3\xa1\xc2\xbb\xe2\x80\xban\x69", b"Add New Article"),
    (b"Th\xc3\x83\xc2\xaam b\xc3\x83 i Articles m\xc3\xa1\xc2\xbb\x9bi", b"Add New Article"),
    (b"Th\xc3\xaam b\xc3\xa0 i Articles m\xc3\xa1\xbb\x9bi", b"Add New Article"),
    (b"Th\xc3\xaam b\xc3\xa0i Articles m\xe1\xbb\x9bi", b"Add New Article"),
    (b"Th\xc3\xaam b\xc3\xa0i viet m\xc3\xa1\xbb\x9b\x69", b"Add New Article"),
    
    # Content label - various encodings
    (b"N\xc3\xa1\xbb\x99i dung", b"Content"),
    (b"N\xe1\xbb\x99i dung", b"Content"),
    
    # Login form
    (b"\xc3\x84\xc4\x83ng nh\xe1\xba\xadp Admin", b"Admin Login"),
    (b"\xc4\x90\xc4\x83ng nh\xe1\xba\xadp Admin", b"Admin Login"),
    (b"\xc4\x90\xc4\x83ng nh\xe1\xba\xadp", b"Login"),
    (b"T\xc3\xaan \xc4\x91\xc4\x83ng nh\xe1\xba\xadp", b"Username"),
    (b"M\xe1\xba\xadt kh\xe1\xba\xa9u", b"Password"),
    (b"\xc4\x90\xc4\x83ng xu\xe1\xba\xa5t", b"Logout"),
    
    # Page title in browser tab
    (b"Admin Panel - Tr\xc6\xb0\xe1\xbb\x9dng Ti\xe1\xbb\x83u h\xe1\xbb\x8dc \xc3\x8dt Ong", b"Admin Panel"),
    
    # Subscribers section
    (b"Danh s\xe1\xba\xa1ch email \xc4\x91\xc4\x83ng k\xc3\xbd nh\xe1\xba\xadn b\xe1\xba\xa3n tin", b"Email subscription list"),
    (b"Ng\xc3\xa0y \xc4\x91\xc4\x83ng k\xc3\xbd", b"Registered Date"),
    (b"H\xc3\xa0nh \xc4\x91\xe1\xbb\x99ng", b"Actions"),
    (b"Xu\xe1\xba\xa5t CSV", b"Export CSV"),
    
    # Event types
    (b"S\xe1\xbb\xb1 ki\xe1\xbb\x87n chung", b"Public Event"),
    (b"S\xe1\xbb\xb1 ki\xe1\xbb\x87n l\xe1\xbb\x9bp", b"Class Event"),
    (b"S\xe1\xbb\xb1 ki\xe1\xbb\x87n gi\xc3\xa1o vi\xc3\xaan", b"Teacher Event"),
    (b"Lo\xe1\xba\xa1i s\xe1\xbb\xb1 ki\xe1\xbb\x87n", b"Event Type"),
    (b"Ti\xc3\xaau \xc4\x91\xe1\xbb\x81 s\xe1\xbb\xb1 ki\xe1\xbb\x87n", b"Event Title"),
    (b"Danh m\xe1\xbb\xa5c s\xe1\xbb\xb1 ki\xe1\xbb\x87n", b"Event Category"),
    (b"Kh\xe1\xbb\x91i l\xe1\xbb\x9bp tham d\xe1\xbb\xb1", b"Target Grade"),
    (b"L\xe1\xbb\x9bp c\xe1\xbb\xa5 th\xe1\xbb\x83", b"Target Class"),
    (b"Ng\xc3\xa0y b\xe1\xba\xaft \xc4\x91\xe1\xba\xa7u", b"Start Date"),
    (b"Ng\xc3\xa0y k\xe1\xba\xbft th\xc3\xbac", b"End Date"),
    (b"\xc4\x90\xe1\xbb\x8ba \xc4\x91i\xe1\xbb\x83m", b"Location"),
    (b"M\xc3\xb4 t\xe1\xba\xa3", b"Description"),
    (b"T\xe1\xba\xa3i \xe1\xba\xa3nh l\xc3\xaan", b"Upload Image"),
    
    # Event categories
    (b"\xf0\x9f\x94\xb4 L\xe1\xbb\x8bch thi / Ki\xe1\xbb\x83m tra", b"Exam / Test"),
    (b"\xf0\x9f\x94\xb5 Ho\xe1\xba\xa1t \xc4\x91\xe1\xbb\x99ng ngo\xe1\xba\xa1i kh\xc3\xb3a / Ch\xc3\xa0o c\xe1\xbb\x9d", b"Extracurricular / Flag Ceremony"),
    (b"\xf0\x9f\x9f\xa2 L\xe1\xbb\x8bch ngh\xe1\xbb\x89 l\xe1\xbb\x85 / H\xe1\xbb\x8dp ph\xe1\xbb\xa5 huynh", b"Holiday / Parent Meeting"),
    (b"T\xe1\xba\xa5t c\xe1\xba\xa3 c\xc3\xa1c kh\xe1\xbb\x91i", b"All Grades"),
    (b"Kh\xe1\xbb\x91i 1", b"Grade 1"),
    (b"Kh\xe1\xbb\x91i 2", b"Grade 2"),
    (b"Kh\xe1\xbb\x91i 3", b"Grade 3"),
    (b"Kh\xe1\xbb\x91i 4", b"Grade 4"),
    (b"Kh\xe1\xbb\x91i 5", b"Grade 5"),
    
    # Settings section
    (b"C\xc3\xa0i \xc4\x91\xe1\xba\xb7t Thanh th\xc3\xb4ng b\xc3\xa1o", b"Ticker Settings"),
    (b"B\xe1\xba\xadt thanh th\xc3\xb4ng b\xc3\xa1o", b"Enable ticker"),
    (b"N\xe1\xbb\x99i dung hi\xe1\xbb\x83n th\xe1\xbb\x8b", b"Display content"),
    (b"Th\xc3\xb4ng b\xc3\xa1o kh\xe1\xba\xa9n", b"Urgent Notice"),
    (b"Th\xc3\xb4ng \xc4\x91i\xe1\xbb\x87p t\xe1\xbb\xab Hi\xe1\xbb\x87u Tr\xc6\xb0\xe1\xbb\x9fng", b"Principal Message"),
    (b"L\xc6\xb0u c\xc3\xa0i \xc4\x91\xe1\xba\xb7t", b"Save Settings"),
    (b"L\xc6\xb0u th\xc3\xb4ng \xc4\x91i\xe1\xbb\x87p", b"Save Message"),
    (b"L\xc6\xb0u trang", b"Save Page"),
    (b"L\xc6\xb0u s\xe1\xbb\xb1 ki\xe1\xbb\x87n", b"Save Event"),
    (b"L\xc6\xb0u b\xc3\xa0i vi\xe1\xba\xbft", b"Save Article"),
    
    # Buttons and actions
    (b"S\xe1\xbb\xada", b"Edit"),
    (b"X\xc3\xb3a", b"Delete"),
    (b"H\xe1\xbb\xa7y", b"Cancel"),
    (b"Ch\xe1\xbb\x8dn", b"Select"),
    
    # Messages
    (b"L\xe1\xbb\x97i k\xe1\xba\xbft n\xe1\xbb\x91i server", b"Server connection error"),
    (b"L\xe1\xbb\x97i: ", b"Error: "),
    (b"Th\xc3\xa0nh c\xc3\xb4ng", b"Success"),
    (b"\xc4\x90\xc3\xa3 l\xc6\xb0u", b"Saved"),
    (b"\xc4\x90\xc3\xa3 x\xc3\xb3a", b"Deleted"),
    (b"Ch\xc6\xb0a c\xc3\xb3 b\xc3\xa0i vi\xe1\xba\xbft n\xc3\xa0o", b"No articles yet"),
    (b"H\xc3\xa3y t\xe1\xba\xa1o b\xc3\xa0i vi\xe1\xba\xbft \xc4\x91\xe1\xba\xa7u ti\xc3\xaan c\xe1\xbb\xa7a b\xe1\xba\xa1n", b"Create your first article"),
    (b"Ch\xc6\xb0a c\xc3\xb3 s\xe1\xbb\xb1 ki\xe1\xbb\x87n n\xc3\xa0o", b"No events yet"),
    
    # AI buttons
    (b"\xf0\x9f\x92\xa1 G\xe1\xbb\xa3i \xc3\xbd ch\xe1\xbb\xa7 \xc4\x91\xe1\xbb\x81", b"Topic Suggestions"),
    (b"\xf0\x9f\x8f\xb7\xef\xb8\x8f G\xe1\xbb\xa3i \xc3\xbd tag", b"Tag Suggestions"),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f"Replaced: {old[:50]}... -> {new}")

print(f"\nTotal replacements: {count}")

with open(r'd:\khanh2\admin.html', 'wb') as f:
    f.write(content)

print("Done!")
