// Node.js script to fix all encoding issues to English
const fs = require('fs');

let content = fs.readFileSync('d:/khanh2/admin.html', 'utf8');

// All replacements: broken encoding -> English
const replacements = [
    // Sidebar navigation
    ['BÃ i viáº¿t', 'Articles'],
    ['Sá»± kiá»‡n', 'Events'],
    ['ThÆ° viá»‡n áº£nh', 'Media Library'],
    ['Trang tÄ©nh', 'Static Pages'],
    ['CÃ i Ä'áº·t', 'Settings'],

    // Page titles
    ['Quáº£n lÃ½ BÃ i viáº¿t', 'Manage Articles'],
        ['Quáº£n lÃ½ Sá»± kiá»‡n', 'Manage Events'],
        ['Quáº£n lÃ½ Subscribers', 'Manage Subscribers'],
        ['ThÆ° viá»‡n áº¢nh', 'Media Library'],
        ['CÃ i Ä'áº·t chung', 'Settings'],

        // Form headers
        ['ThÃªm bÃ i viáº¿t má»›i', 'Add New Article'],
            ['TiÃªu Ä'á»', 'Title'],
            ['Danh má»¥c', 'Category'],
                ['Tráº¡ng thÃ¡i', 'Status'],
                ['Ná»™i dung', 'Content'],
                ['HÃ¬nh áº£nh', 'Image'],

                // Status options
                ['NhÃ¡p', 'Draft'],
                ['Chá» duyá»‡t', 'Pending'],
                ['ÄÃ£ xuáº¥t báº£n', 'Published'],
                ['Xuáº¥t báº£n ngay', 'Publish now'],

                // Category options
                ['Tin tá»©c', 'News'],
                ['Hoáº¡t Ä'á»™ng', 'Activities'],
                ['ThÃ´ng bÃ¡o', 'Announcement'],
                    ['ThÃ nh tÃ­ch', 'Achievements'],

                    // Buttons
                    ['LÆ°u bÃ i viáº¿t', 'Save Article'],
                    ['LÆ°u sá»± kiá»‡n', 'Save Event'],
                    ['LÆ°u trang', 'Save Page'],
                    ['LÆ°u cÃ i Ä'áº·t', 'Save Settings'],
                    ['LÆ°u thÃ´ng Ä'iá»‡p', 'Save Message'],
                        ['Luu bai viet', 'Save Article'],
                        ['Luu su kien', 'Save Event'],
                        ['Chá»n', 'Select'],
                        ['Há»§y', 'Cancel'],
                        ['Sá»­a', 'Edit'],
                        ['XÃ³a', 'Delete'],
                        ['Xuáº¥t CSV', 'Export CSV'],

                        // Login form
                        ['ÄÄƒng nháº­p Admin', 'Admin Login'],
                        ['ÄÄƒng nháº­p', 'Login'],
                        ['ÄÄƒng xuáº¥t', 'Logout'],
                        ['TÃªn Ä'Äƒng nháº­p', 'Username'],
                        ['Máº­t kháº©u', 'Password'],

                            // Subscribers section
                            ['Danh sÃ¡ch email Ä'Äƒng kÃ½ nháº­n báº£n tin', 'Email subscription list'],
                            ['NgÃ y Ä'Äƒng kÃ½', 'Registered Date'],
                                ['HÃ nh Ä'á»™ng', 'Actions'],
                                ['ChÆ°a cÃ³ ai Ä'Äƒng kÃ½ newsletter', 'No subscribers yet'],

                                // Event section
                                ['TiÃªu Ä'á» sá»± kiá»‡n', 'Event Title'],
                                ['Loáº¡i sá»± kiá»‡n', 'Event Type'],
                                ['Danh má»¥c sá»± kiá»‡n', 'Event Category'],
                                ['Sá»± kiá»‡n chung', 'Public Event'],
                                ['Sá»± kiá»‡n lá»›p', 'Class Event'],
                                ['Sá»± kiá»‡n giÃ¡o viÃªn', 'Teacher Event'],
                                ['Khá»'i lá»›p tham dá»±', 'Target Grade'],
                                ['Lá»›p cá»¥ thá»ƒ', 'Target Class'],
                                    ['NgÃ y báº¯t Ä'áº§u', 'Start Date'],
                                    ['NgÃ y káº¿t thÃºc', 'End Date'],
                                        ['Äá»‹a Ä'iá»ƒm', 'Location'],
                                        ['MÃ´ táº£', 'Description'],
                                            ['Táº¥t cáº£ cÃ¡c khá»'i', 'All Grades'],
                                            ['Khá»'i 1', 'Grade 1'],
                                                ['Khá»'i 2', 'Grade 2'],
                                                ['Khá»'i 3', 'Grade 3'],
                                                ['Khá»'i 4', 'Grade 4'],
                                                ['Khá»'i 5', 'Grade 5'],

                                                // Event categories
                                                ['KhÃ¡c', 'Other'],
                                                ['Lá»‹ch thi / Kiá»ƒm tra', 'Exam / Test'],
                                                ['Hoáº¡t Ä'á»™ng ngoáº¡i khÃ³a', 'Extracurricular'],
                                                ['ChÃ o cá»', 'Flag Ceremony'],
                                                    ['Lá»‹ch nghá»‰ lá»…', 'Holiday'],
                                                    ['Há»p phá»¥ huynh', 'Parent Meeting'],

                                                    // Settings page
                                                    ['CÃ i Ä'áº·t Thanh thÃ´ng bÃ¡o', 'Ticker Settings'],
                                                    ['Báº­t thanh thÃ´ng bÃ¡o', 'Enable ticker'],
                                                        ['Ná»™i dung hiá»ƒn thá»‹', 'Display content'],
                                                        ['ThÃ´ng bÃ¡o kháº©n', 'Urgent Notice'],
                                                        ['ThÃ´ng Ä'iá»‡p tá»« Hiá»‡u TrÆ°á»Ÿng', 'Principal Message'],
                                                        ['ÄÆ°á»ng dáº«n', 'URL'],
                                                            ['tÃ¹y chá»n', 'optional'],

                                                            // Static pages
                                                            ['Quáº£n lÃ½ Trang tÄ©nh', 'Manage Static Pages'],
                                                            ['ThÃªm trang má»›i', 'Add New Page'],

                                                            // Media
                                                            ['Táº£i áº£nh lÃªn', 'Upload Image'],
                                                            ['ChÆ°a cÃ³ áº£nh nÃ o', 'No images yet'],

                                                            // Messages and errors
                                                            ['Lá»—i káº¿t ná»'i server', 'Server connection error'],
                                                            ['ThÃ nh cÃ´ng', 'Success'],
                                                                ['Lá»—i: ', 'Error: '],
                                                                ['ÄÃ£ lÆ°u', 'Saved'],
                                                                ['ÄÃ£ xÃ³a', 'Deleted'],
                                                                ['ChÆ°a cÃ³ bÃ i viáº¿t nÃ o', 'No articles yet'],
                                                                ['HÃ£y táº¡o bÃ i viáº¿t Ä'áº§u tiÃªn cá»§a báº¡n', 'Create your first article'],
                                                                ['ChÆ°a cÃ³ sá»± kiá»‡n nÃ o', 'No events yet'],
                                                                    ['HÃ£y táº¡o sá»± kiá»‡n Ä'áº§u tiÃªn cá»§a báº¡n', 'Create your first event'],

                                                                    // Page title
                                                                    ['TrÆ°á»ng Tiá»ƒu há»c Ãt Ong', 'School'],

                                                                        // Table headers (ASCII only)
                                                                        ['Hinh', 'Image'],
                                                                        ['Tieu de', 'Title'],
                                                                        ['Danh muc', 'Category'],
                                                                        ['Trang thai', 'Status'],
                                                                        ['Hanh dong', 'Actions'],
                                                                        ['Thoi gian', 'Time'],
                                                                        ['Dia diem', 'Location'],
                                                                    ];

let count = 0;
for (const [old, newText] of replacements) {
    if (content.includes(old)) {
        content = content.split(old).join(newText);
        count++;
        console.log(`Replaced: ${old} -> ${newText}`);
    }
}

console.log(`\nTotal replacements: ${count}`);

fs.writeFileSync('d:/khanh2/admin.html', content, 'utf8');

console.log('Done!');
