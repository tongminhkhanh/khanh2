/**
 * AI Content Generator Service
 * Chuyển đổi ghi chú thô thành bài viết chuẩn SEO cho website trường học
 */

const SCHOOL_CONTEXT = {
    name: 'Trường Tiểu học Ít Ong',
    location: 'Mường La, Sơn La',
    tone: 'trang trọng, ấm áp, chuẩn mực sư phạm',
    addressing: {
        school: 'Nhà trường',
        students: 'các em học sinh',
        parents: 'Quý phụ huynh'
    }
};

const SYSTEM_PROMPT = `Bạn là AI Content Editor chuyên nghiệp của ${SCHOOL_CONTEXT.name}. 
Nhiệm vụ của bạn là chuyển hóa các ghi chú thô sơ thành các bài báo cáo, tin tức trang trọng, ấm áp và chuẩn mực sư phạm.

QUY TẮC VIẾT BÀI:

1. TIÊU ĐỀ (Title):
   - Bắt đầu bằng động từ mạnh, hấp dẫn nhưng KHÔNG giật gân
   - Độ dài 10-15 từ
   - Ví dụ tốt: "Sôi nổi Hội thi Giai điệu Tuổi hồng: Lớp 5A xuất sắc giành giải Nhất"
   - Ví dụ xấu: "Thông báo về việc thi văn nghệ"

2. SAPO (Đoạn mở đầu):
   - Trả lời đầy đủ 5W1H: Ai, Cái gì, Ở đâu, Khi nào, Tại sao, Như thế nào
   - 2-3 câu, tóm tắt toàn bộ sự kiện
   - In đậm các thông tin quan trọng

3. NỘI DUNG (Body):
   - Cấu trúc: Diễn biến chi tiết → Ý nghĩa/Kết quả
   - Chia thành các đoạn ngắn, dễ đọc
   - Sử dụng HTML tags cơ bản: <p>, <strong>, <em>

4. VĂN PHONG:
   - Tiếng Việt trong sáng, phổ thông
   - Xưng hô: "Nhà trường", "các em học sinh", "Quý phụ huynh"
   - KHÔNG dùng từ lóng, tiếng Anh không cần thiết
   - Tone trang trọng nhưng ấm áp

5. DANH MỤC (Category):
   Chọn 1 trong các danh mục: Tin tức, Hoạt động, Thông báo, Thành tích, Sự kiện

6. TAGS:
   Tạo 3-5 tags phù hợp, viết thường, cách nhau bằng dấu phẩy

OUTPUT FORMAT (JSON):
{
  "title": "Tiêu đề bài viết",
  "sapo": "Đoạn mở đầu tóm tắt 5W1H",
  "content": "<p>Nội dung HTML...</p>",
  "category": "Hoạt động",
  "tags": ["tag1", "tag2", "tag3"]
}

CHỈ TRẢ VỀ JSON, KHÔNG THÊM TEXT KHÁC.`;

/**
 * Gọi Gemini API để sinh nội dung
 */
async function callGeminiAPI(prompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Gọi OpenAI API để sinh nội dung
 */
async function callOpenAIAPI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Gọi Perplexity API để sinh nội dung
 */
async function callPerplexityAPI(prompt, apiKey) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Perplexity API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================
// PERPLEXITY AI - TOPIC & TAG SUGGESTIONS
// ============================================

const TOPIC_SUGGESTION_PROMPT = `Bạn là chuyên gia content marketing cho website tin tức trường học tại Việt Nam.

NHIỆM VỤ: Dựa trên chủ đề được cung cấp, hãy đưa ra 5-7 ý tưởng bài viết phù hợp với trường tiểu học.

YÊU CẦU:
- Ý tưởng phải thực tế, có thể viết được
- Phù hợp với ngữ cảnh giáo dục tiểu học Việt Nam
- Có tính thời sự hoặc mùa vụ (lễ hội, năm học, etc.)
- Mỗi ý tưởng có tiêu đề hấp dẫn và mô tả ngắn

OUTPUT FORMAT (JSON):
{
  "suggestions": [
    {
      "title": "Tiêu đề bài viết gợi ý",
      "description": "Mô tả ngắn về nội dung bài viết (1-2 câu)",
      "category": "Hoạt động/Tin tức/Thông báo/Thành tích/Sự kiện"
    }
  ]
}

CHỈ TRẢ VỀ JSON.`;

const TAG_SUGGESTION_PROMPT = `Bạn là chuyên gia SEO cho website tin tức trường học.

NHIỆM VỤ: Dựa trên tiêu đề và nội dung bài viết, hãy đưa ra 5-8 tags phù hợp cho SEO.

YÊU CẦU TAGS:
- Viết thường, không dấu hoặc có dấu tiếng Việt
- Ngắn gọn (1-3 từ mỗi tag)
- Liên quan trực tiếp đến nội dung
- Có tính tìm kiếm cao (từ khóa phổ biến)
- Bao gồm: tên sự kiện, địa điểm, đối tượng, thời gian nếu có

OUTPUT FORMAT (JSON):
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

CHỈ TRẢ VỀ JSON.`;

/**
 * Gợi ý chủ đề bài viết sử dụng Perplexity Search
 * @param {string} topic - Chủ đề cần tìm kiếm
 * @param {string} context - Ngữ cảnh bổ sung (optional)
 * @param {object} options - { apiKey: string }
 */
async function suggestTopics(topic, context = '', options = {}) {
    const apiKey = options.apiKey || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error('Thiếu PERPLEXITY_API_KEY. Vui lòng cấu hình trong .env');
    }

    const userPrompt = `Chủ đề: ${topic}
${context ? `Ngữ cảnh: ${context}` : ''}
Trường: ${SCHOOL_CONTEXT.name}, ${SCHOOL_CONTEXT.location}

Hãy đưa ra các ý tưởng bài viết phù hợp.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [
                { role: 'system', content: TOPIC_SUGGESTION_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Perplexity API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = parseAIResponse(data.choices[0].message.content);

    return {
        suggestions: result.suggestions || [],
        sources: data.search_results || []
    };
}

/**
 * Gợi ý tags từ tiêu đề và nội dung bài viết
 * @param {string} title - Tiêu đề bài viết
 * @param {string} content - Nội dung bài viết (optional)
 * @param {object} options - { apiKey: string }
 */
async function suggestTags(title, content = '', options = {}) {
    const apiKey = options.apiKey || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error('Thiếu PERPLEXITY_API_KEY. Vui lòng cấu hình trong .env');
    }

    // Truncate content to avoid token limits
    const truncatedContent = content.length > 500
        ? content.substring(0, 500) + '...'
        : content;

    const userPrompt = `Tiêu đề: ${title}
${truncatedContent ? `Nội dung: ${truncatedContent}` : ''}

Hãy đưa ra các tags phù hợp cho SEO.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [
                { role: 'system', content: TAG_SUGGESTION_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Perplexity API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = parseAIResponse(data.choices[0].message.content);

    return {
        tags: result.tags || []
    };
}

// ============================================
// IMAGE ANALYSIS WITH GEMINI VISION
// ============================================

const IMAGE_ANALYSIS_PROMPT = `Bạn là chuyên gia đánh giá ảnh cho website trường học.

NHIỆM VỤ: Phân tích các ảnh được gửi và đánh giá chất lượng.

TIÊU CHÍ ĐÁNH GIÁ:
1. CHẤT LƯỢNG KỸ THUẬT (1-10): Độ nét, ánh sáng, góc chụp
2. NỘI DUNG PHÙ HỢP (1-10): Ảnh tập thể, hoạt động rõ ràng
3. TÍNH ĐẠI DIỆN (1-10): Thể hiện rõ hoạt động/sự kiện

OUTPUT FORMAT (JSON):
{
  "analysis": [{"imageIndex": 0, "totalScore": 24, "recommend": true, "caption": "Mô tả ảnh", "issues": []}],
  "selectedIndices": [0, 2],
  "rejectedIndices": [1],
  "summary": "Đã chọn 2/3 ảnh phù hợp"
}
CHỈ TRẢ VỀ JSON.`;

/**
 * Phân tích và đánh giá ảnh với Gemini Vision
 * @param {Array} imageBuffers - Mảng {buffer, mimeType, filename}
 */
async function analyzeImages(imageBuffers, options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY để phân tích ảnh');
    if (!imageBuffers || imageBuffers.length === 0) {
        return { analysis: [], selectedIndices: [], rejectedIndices: [], summary: 'Không có ảnh' };
    }

    const imagesToAnalyze = imageBuffers.slice(0, 10);
    const parts = [{ text: IMAGE_ANALYSIS_PROMPT }];

    imagesToAnalyze.forEach((img, index) => {
        parts.push({
            inlineData: { mimeType: img.mimeType || 'image/jpeg', data: img.buffer.toString('base64') }
        });
        parts.push({ text: `[Ảnh ${index + 1}]` });
    });
    parts.push({ text: `Phân tích ${imagesToAnalyze.length} ảnh và chọn ảnh phù hợp.` });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini Vision Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return parseAIResponse(data.candidates[0].content.parts[0].text);
}

/**
 * Tạo caption cho một ảnh
 */
async function generateImageCaption(imageBuffer, mimeType = 'image/jpeg', context = '', options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY');

    const prompt = `Tạo mô tả ngắn (alt-text) cho ảnh website trường học.${context ? ` Ngữ cảnh: ${context}` : ''} CHỈ TRẢ VỀ MÔ TẢ.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: imageBuffer.toString('base64') } }
                ]
            }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 256 }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Caption Error: ${error.error?.message || 'Unknown'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
}

// ============================================
// SAFETY GUARDRAILS (Nghị định 13/2023)
// ============================================

const SENSITIVE_PATTERNS = {
    phone: /(?:\+84|84|0)[\s.-]?(?:\d{2,3})[\s.-]?(?:\d{3})[\s.-]?(?:\d{3,4})/g,
    idCard: /\b\d{9}(?:\d{3})?\b/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    address: /(?:số\s*)?\d+[\s,]*(?:đường|phố|ngõ|hẻm|ngách)[^\n,]{5,50}/gi
};

const NEGATIVE_KEYWORDS = [
    'khiếu nại', 'tố cáo', 'kiện', 'phản đối', 'bức xúc', 'lừa đảo',
    'gian lận', 'bạo lực', 'đánh nhau', 'xúc phạm', 'tử vong', 'tai nạn nghiêm trọng'
];

/**
 * Quét thông tin nhạy cảm
 */
function scanSensitiveInfo(text) {
    const findings = [];
    const phones = text.match(SENSITIVE_PATTERNS.phone);
    if (phones) findings.push({ type: 'phone', matches: [...new Set(phones)], severity: 'warning', message: 'SĐT cá nhân' });

    const ids = text.match(SENSITIVE_PATTERNS.idCard);
    if (ids) {
        const realIds = ids.filter(id => id.length >= 9 && !id.startsWith('202') && !id.startsWith('201'));
        if (realIds.length) findings.push({ type: 'idCard', matches: [...new Set(realIds)], severity: 'critical', message: 'Số CCCD/CMND' });
    }

    const emails = text.match(SENSITIVE_PATTERNS.email);
    if (emails) findings.push({ type: 'email', matches: [...new Set(emails)], severity: 'info', message: 'Email' });

    const addresses = text.match(SENSITIVE_PATTERNS.address);
    if (addresses) findings.push({ type: 'address', matches: [...new Set(addresses)], severity: 'warning', message: 'Địa chỉ cụ thể' });

    return { hasSensitive: findings.length > 0, findings };
}

/**
 * Kiểm tra nội dung tiêu cực
 */
function validateContent(text) {
    const lowerText = text.toLowerCase();
    const found = NEGATIVE_KEYWORDS.filter(kw => lowerText.includes(kw.toLowerCase()));
    return {
        hasNegative: found.length > 0,
        keywords: found,
        severity: found.length > 0 ? 'block' : 'ok',
        message: found.length > 0 ? `Từ khóa nhạy cảm: ${found.join(', ')}` : 'OK'
    };
}

/**
 * Kiểm tra an toàn toàn bộ nội dung
 */
function performSafetyCheck(rawNote) {
    return {
        canProceed: true,
        warnings: [],
        blockers: [],
        summary: 'An toàn (Safety Check Disabled)'
    };

}

/**
 * Parse JSON từ response AI (xử lý markdown code blocks nếu có)
 */
function parseAIResponse(responseText) {
    // Loại bỏ markdown code blocks nếu có
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        throw new Error(`Không thể parse JSON từ AI response: ${e.message}`);
    }
}

/**
 * Validate article object
 */
function validateArticle(article) {
    const required = ['title', 'sapo', 'content', 'category'];
    const missing = required.filter(field => !article[field]);

    if (missing.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missing.join(', ')}`);
    }

    // Ensure tags is an array
    if (!Array.isArray(article.tags)) {
        article.tags = article.tags ? [article.tags] : [];
    }

    // Validate category
    const validCategories = ['Tin tức', 'Hoạt động', 'Thông báo', 'Thành tích', 'Sự kiện'];
    if (!validCategories.includes(article.category)) {
        article.category = 'Tin tức'; // Default
    }

    return article;
}

/**
 * Main function: Generate article from raw note
 * @param {string} rawNote - Ghi chú thô từ giáo viên
 * @param {object} options - { provider: 'gemini'|'openai', apiKey: string }
 * @returns {object} - { title, sapo, content, category, tags }
 */
async function generateArticle(rawNote, options = {}) {
    // Validate input
    if (!rawNote || typeof rawNote !== 'string' || rawNote.trim().length < 20) {
        throw new Error('Ghi chú quá ngắn. Vui lòng cung cấp ít nhất 20 ký tự.');
    }

    const provider = options.provider || process.env.AI_PROVIDER || 'gemini';
    console.log('[AI Service] Provider:', provider, '| AI_PROVIDER env:', process.env.AI_PROVIDER);

    // Get API key based on provider
    let apiKey = options.apiKey;
    if (!apiKey) {
        switch (provider) {
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY;
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY;
                break;
            case 'perplexity':
                apiKey = process.env.PERPLEXITY_API_KEY;
                break;
        }
    }

    if (!apiKey) {
        throw new Error(`Thiếu API key cho provider: ${provider}. Vui lòng cấu hình trong .env`);
    }

    // Build prompt
    const userPrompt = `Hãy viết bài tin tức từ ghi chú sau:

---
${rawNote.trim()}
---

Lưu ý: Đây là tin của ${SCHOOL_CONTEXT.name}, ${SCHOOL_CONTEXT.location}.
Hãy viết theo đúng format JSON đã hướng dẫn.`;

    // Call AI API
    let responseText;
    if (provider === 'gemini') {
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
        responseText = await callGeminiAPI(fullPrompt, apiKey);
    } else if (provider === 'openai') {
        responseText = await callOpenAIAPI(userPrompt, apiKey);
    } else if (provider === 'perplexity') {
        responseText = await callPerplexityAPI(userPrompt, apiKey);
    } else {
        throw new Error(`Provider không hỗ trợ: ${provider}. Các provider hỗ trợ: gemini, openai, perplexity`);
    }

    // Parse and validate
    const article = parseAIResponse(responseText);
    return validateArticle(article);
}

module.exports = {
    generateArticle,
    analyzeImages,
    generateImageCaption,
    scanSensitiveInfo,
    validateContent,
    performSafetyCheck,
    suggestTopics,
    suggestTags,
    SCHOOL_CONTEXT
};
