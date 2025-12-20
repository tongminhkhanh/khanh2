# Fix mojibake in admin.html
$file = "d:\khanh2\admin.html"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace sidebar/tab mojibake with clean text
$replacements = @{
    # Sidebar
    'â‰¡Æ''Ã´Ã¨ Admin Panel' = 'Admin Panel'
    'â‰¡Æ''Ã´Â¥ Articles' = 'Articles'
    'â‰¡Æ''Ã„Â» Events' = 'Events'
    'â‰¡Æ''Ã»â•âˆ©â••Ã… Media Library' = 'Media Library'
    'â‰¡Æ''Ã´Ã¤ Static Pages' = 'Static Pages'
    'Î"ÃœÃ–âˆ©â••Ã… Settings' = 'Settings'
    
    # Header
    'â‰¡Æ''Ã¦Ã± Admin User' = 'Admin User'
    
    # Form sections
    'â‰¡Æ''Ã´Ã¯ Basic Information' = 'Basic Information'
    'Î"Â£Ã¬âˆ©â••Ã… Article Content' = 'Article Content'
    'â‰¡Æ''Ã¶Ã¬ SEO' = 'SEO'
    
    # Buttons
    'â‰¡Æ''Ã´Ã± Publish' = 'Publish'
    'Î"Ã…â–'' Schedule' = 'Schedule'
    'â‰¡Æ''Ã†â•› Save Draft' = 'Save Draft'
    'Î"Â£Ã² Cancel' = 'Cancel'
    'Î"â‚§Ã² Add Article' = 'Add Article'
    
    # Toolbar buttons
    'Î"Ã‡Ã³ List' = 'List'
    'Î"Â¥Â¥ Quote' = 'Quote'
    'â‰¡Æ''Ã¶Ã¹' = 'Link'
    'â‰¡Æ''Ã»Ã¬' = 'HL'
    'Î"Â£Ã²' = 'X'
    'Î"Ã¥â•¢' = 'Undo'
    'Î"Ã¥â•–' = 'Redo'
}

foreach ($key in $replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $replacements[$key]
}

Set-Content $file -Value $content -Encoding UTF8
Write-Host "Mojibake fix complete!"
