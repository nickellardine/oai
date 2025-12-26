// api/index.js

export default async function handler(req, res) {
    // 1. 设置 CORS 头 (允许跨域)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 2. 处理预检请求 (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // 3. 处理模型列表 (GET /v1/models)
    // 只要 URL 里包含 /models 就返回列表
    if (req.method === 'GET' && req.url.includes('/models')) {
        const models = {
            object: "list",
            data: [
                { id: "gpt-3.5-turbo", object: "model", created: 1677610602, owned_by: "openai" },
                { id: "gpt-4", object: "model", created: 1687882411, owned_by: "openai" },
                { "id": "gpt-5.1", "object": "model", "created": 1735689600, "owned_by": "openai" },
                { "id": "claude-4.5-opus", "object": "model", "created": 1735689600, "owned_by": "anthropic" },
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
    // 只要是 POST 请求，我们都假设是 chat completions 并返回 Mock 数据
    if (req.method === 'POST') {
        // Vercel 会自动帮我们解析 body，所以不需要 req.on('data') 啦
        const headers = req.headers;
        const headersString = JSON.stringify(headers, null, 2);

        console.log(`收到请求: ${req.method} ${req.url}`);

        const responseData = {
            id: "chatcmpl-mock-" + Date.now(),
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "mock-gpt-model",
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
    } else {
        // 其他请求
        res.status(404).send('Not Found');
    }
}
