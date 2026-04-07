const CONFIG = {
    BASE_URL: "https://9router.vuhai.io.vn/v1",
    MODEL: "ces-chatbot-gpt-5.4",
    API_KEY: "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
    WELCOME_MSG: "Xin chào! Tôi là trợ lý chuyên gia của **Nguyễn Văn A**. Tôi có thể giúp gì cho bạn về giải pháp MCP Server, N8N hay khóa học **Agentic AI K89**?"
};

let messages = [
    { 
        role: "system", 
        content: `Bạn là AI trợ lý độc quyền cho chuyên gia Nguyễn Văn A.
        Thông tin chuyên gia:
        - Định vị: Chuyên gia AI & Tự động hóa
        - Giải pháp: MCP server, N8N AI, đào tạo AI branding
        - Khóa học: K89 - Agentic AI (12 buổi, Online Zoom)
        - Liên hệ: a@example.com | Zalo 0123456789
        
        Quy tắc trả lời:
        - Chỉ trả lời dựa trên kiến thức trên.
        - Trả lời bằng Markdown đẹp (p, strong, code, li, blockquote).
        - Luôn chào thân thiện và trả lời rõ ràng.
        - Kết thúc bằng lời mời hỏi thêm hoặc gợi ý liên hệ Zalo nếu cần tư vấn sâu.
        - Nếu ngoài phạm vi kiến thức, từ chối nhẹ nhàng và đề xuất liên hệ Zalo 0123456789.`
    }
];

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');

// Toggle Chat
function toggleChat() { chatWindow.classList.toggle('active'); }

// Close Chat
function closeChat() { chatWindow.classList.remove('active'); }

// Initial Welcome
window.addEventListener('DOMContentLoaded', () => {
    appendMessage('assistant', CONFIG.WELCOME_MSG);
});

// Refresh Logic
function refreshChat() {
    const icon = document.querySelector('.refresh-icon');
    icon.classList.add('spinning');
    setTimeout(() => {
        chatMessages.innerHTML = '';
        messages = [messages[0]]; // Reset components except system prompt
        appendMessage('assistant', CONFIG.WELCOME_MSG);
        icon.classList.remove('spinning');
    }, 500);
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    if (role === 'assistant') {
        const markdownDiv = document.createElement('div');
        markdownDiv.className = 'chat-markdown';
        markdownDiv.innerHTML = marked.parse(text);
        msgDiv.appendChild(markdownDiv);
    } else {
        msgDiv.textContent = text;
    }
    
    chatMessages.appendChild(msgDiv);
    // Auto scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message bot-msg typing-dots';
    typingDiv.innerHTML = 'Đang nhập...<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendMessage('user', text);
    messages.push({ role: "user", content: text });

    showTyping();

    try {
        const response = await fetch(`${CONFIG.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) throw new Error("API Request Failed");

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        
        const loader = document.getElementById('typing-indicator');
        if (loader) loader.remove();
        
        appendMessage('assistant', aiMessage);
        messages.push({ role: "assistant", content: aiMessage });

    } catch (error) {
        console.error("Lỗi API:", error);
        const loader = document.getElementById('typing-indicator');
        if (loader) loader.innerHTML = "Có lỗi xảy ra khi kết nối với bộ não AI. Vui lòng thử lại sau.";
    }
}

// Enter to send
chatInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') sendMessage(); 
});
