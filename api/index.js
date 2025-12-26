// api/index.js
export default async function handler(req, res) {
    // 1. 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // 2. 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    
    // 3. 处理模型列表
    if (req.method === 'GET' && req.url.includes('/models')) {
        const models = {
            object: "list",
            data: [
                { id: "gpt-3.5-turbo", object: "model", created: 1677610602, owned_by: "openai" },
                { id: "gpt-4", object: "model", created: 1687882411, owned_by: "openai" },
                { id: "gpt-5.1", object: "model", created: 1735689600, owned_by: "openai" },
                { id: "claude-4.5-opus", object: "model", created: 1735689600, owned_by: "anthropic" },
                { id: "mock-gpt-model", object: "model", created: Math.floor(Date.now() / 1000), owned_by: "mock-server" },
                { id: "DeepSeek-V3.2", object: "model", created: 1700000000, owned_by: "DeepSeek" },
                { id: "GLM-4.6", object: "model", created: 1700000000, owned_by: "Zhipu AI" },
                { id: "Gemini-3-Pro-preview", object: "model", created: 1700000000, owned_by: "Google / DeepMind" },
                { id: "Apertus-70B", object: "model", created: 1700000000, owned_by: "Swiss-AI consortium" },
                { id: "Gemma-3", object: "model", created: 1710144000, owned_by: "Google DeepMind" }
            ]
        };
        res.status(200).json(models);
        return;
    }
    
    // 4. 处理对话请求 (POST)
    if (req.method === 'POST') {
        const body = req.body || {};
        const isStream = body.stream === true;
        
        const headers = req.headers;
        const headersString = JSON.stringify(headers, null, 2);
        console.log(`收到请求: ${req.method} ${req.url}, stream: ${isStream}`);
        
        // 流式响应
        if (isStream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const chatId = "chatcmpl-mock-" + Date.now();
            const created = Math.floor(Date.now() / 1000);
            const fullMessage = `收到流式请求！(来自 Vercel)\n以下是您的请求头信息：\n${headersString}`;
            
            // 模拟逐字输出
            const words = fullMessage.split('');
            
            for (let i = 0; i < words.length; i++) {
                const chunk = {
                    id: chatId,
                    object: "chat.completion.chunk",
                    created: created,
                    model: body.model || "mock-gpt-model",
                    choices: [{
                        index: 0,
                        delta: i === 0 
                            ? { role: "assistant", content: words[i] }
                            : { content: words[i] },
                        finish_reason: null
                    }]
                };
                
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                
                // 模拟延迟 (可选，让流式效果更明显)
                await new Promise(resolve => setTimeout(resolve, 20));
            }
            
            // 发送结束标记
            const finalChunk = {
                id: chatId,
                object: "chat.completion.chunk",
                created: created,
                model: body.model || "mock-gpt-model",
                choices: [{
                    index: 0,
                    delta: {},
                    finish_reason: "stop"
                }]
            };
            res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            
        } else {
            // 非流式响应 (原来的逻辑)
            const responseData = {
                id: "chatcmpl-mock-" + Date.now(),
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: body.model || "mock-gpt-model",
                choices: [{
                    index: 0,
                    message: {
                        role: "assistant",
                        content: `收到请求！(来自 Vercel)\n以下是您的请求头信息：\n${headersString}`
                    },
                    finish_reason: "stop"
                }],
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0
                }
            };
            res.status(200).json(responseData);
        }
    } else {
        res.status(404).send('Not Found');
    }
}
