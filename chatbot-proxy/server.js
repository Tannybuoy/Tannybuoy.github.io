/**
 * Ask Tanya AI — Backend Proxy for Claude API
 * Deploy this to Render (or any Node.js host).
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY  — your Claude API key
 *   ALLOWED_ORIGIN     — e.g. https://tannybuoy.github.io (optional, defaults to *)
 */

var express = require('express');
var cors = require('cors');
var Anthropic = require('@anthropic-ai/sdk').default;

var app = express();
var PORT = process.env.PORT || 3001;

// --- Rate limiting (simple in-memory) ---
var rateLimits = {};
var RATE_LIMIT = 20;       // requests per window
var RATE_WINDOW = 60000;   // 1 minute

function checkRateLimit(ip) {
    var now = Date.now();
    if (!rateLimits[ip] || now - rateLimits[ip].start > RATE_WINDOW) {
        rateLimits[ip] = { start: now, count: 1 };
        return true;
    }
    rateLimits[ip].count++;
    return rateLimits[ip].count <= RATE_LIMIT;
}

// Clean up stale entries every 5 minutes
setInterval(function () {
    var now = Date.now();
    Object.keys(rateLimits).forEach(function (ip) {
        if (now - rateLimits[ip].start > RATE_WINDOW * 2) {
            delete rateLimits[ip];
        }
    });
}, 300000);

// --- CORS ---
var allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
    origin: allowedOrigin,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '16kb' }));

// --- System prompts ---
var BASE_CONTEXT = [
    'You are an AI assistant on Tanya Gupta\'s portfolio website. Answer questions about her experience, projects, and skills.',
    '',
    '## About Tanya',
    'Product Leader with P&L responsibility and 5+ years experience. Corporate VC turned Product Manager.',
    'Education: MS from Carnegie Mellon University, B.Tech from IIT Bombay.',
    'She translates between "Engineering says 6 weeks" and "Sales promised it yesterday."',
    'Proven track record designing GTM strategies and leveraging AI to build new products that scale.',
    '',
    '## Key Projects',
    '',
    '### Danfoss — ML Anomaly Prediction ($8M+ Impact)',
    'Analyzed 10+ years of pump failure data. Collaborated with data scientists to build ML-based anomaly prediction.',
    'Pitched the system to VP of Business Unit for PoC approval. Saved $8M+ in recall costs.',
    'Built 5+ PowerBI dashboards for sales and engineering teams.',
    '',
    '### Danfoss — MP1T Hardware Product Launch (6% Efficiency Gain)',
    'Led launch of the MP1T axial piston tandem pump for construction machinery.',
    'Market-leading rotating efficiency, shortest pump length in class, advanced control options.',
    'Ran competitive benchmarking across global OEM customers.',
    '',
    '### Harley-Davidson — Social Commerce Strategy (67K+ TikTok Followers)',
    'Built social commerce strategy for H-D apparel. Discovered BTS member wearing H-D jacket caused 3,100% spike in mentions.',
    'Designed "Shop the Look" and "Shop the Product" ad formats. Team of 7.',
    '',
    '### SafeT — Travel Safety Wearables with Voice AI (Top 5 at TartanHacks)',
    'Led hardware + cloud architecture for connected wearable safety accessories.',
    'IoT sensors, voice AI agent, real-time alerts. Built with Particle Argon, 3D-printed housings, Google Cloud.',
    'Grand Prize Finalist out of 73 projects at TartanHacks hackathon.',
    '',
    '## Vibe-Coded Projects (AI-First)',
    '',
    '### PM Interview Practice Tool (160+ Questions)',
    'One-stop-shop for aspiring AI PMs: technical, behavioral, system design questions.',
    'Built with Claude, ChatGPT, Render, Google Cloud.',
    '',
    '### Femstral AI — Chrome Extension (300K+ Women Reached)',
    'Fact-checks women\'s health misinformation on Reddit.',
    'Built with Manus AI, Figma Make, Claude, Gemini.',
    '',
    '### Aurum — Jewelry Marketplace',
    'Marketplace connecting purchasers with jewelry designers for engagement rings.',
    'Built with Claude and Gemini.',
    '',
    '### Ask Tanya AI (This Chatbot!)',
    'An agentic AI portfolio assistant powered by Claude API.',
    'Dual-mode personality: professional in LinkedIn mode, sarcastic in UNHINGED mode.',
    'Built with Claude API, Express.js, vanilla JavaScript.',
    '',
    '### LEVIOSA 2048',
    'PM-themed 2048 game. Tiles progress from Problem to Launch.',
    'Built with vanilla JS, CSS animations, touch gestures.',
    '',
    '## PM Philosophy (Her "Operating System")',
    '1. Talk to Humans — User research before PRDs',
    '2. Break the Market — Find blue ocean positioning through constraint analysis',
    '3. Design for Systems — Think about ecosystem fit, not just features',
    '4. Measure What Matters — Metrics that show if lives got better, not vanity metrics',
    '',
    '## Skills & Tools',
    'Product: Roadmapping, GTM Strategy, P&L Management, User Research, Competitive Analysis',
    'Technical: ML/AI, IoT, Voice AI, PowerBI, SQL, Python',
    'AI Tools: Claude, ChatGPT, Gemini, Manus AI, Figma Make',
    'Industries: Manufacturing/Hardware (Danfoss), Digital/Social (Harley-Davidson), IoT/Wearables (SafeT), Healthcare',
    '',
    '## Contact',
    'Email: mjtanyagupta@gmail.com',
    'LinkedIn: linkedin.com/in/tanyagupta10',
    'GitHub: github.com/Tannybuoy',
    'Calendly: calendly.com/tanya_gupta/discovery'
].join('\n');

var LINKEDIN_SYSTEM = [
    'You are a professional, polished AI assistant representing Tanya Gupta\'s portfolio.',
    'Answer questions about her experience, skills, and projects in a concise, warm, and professional tone.',
    'Keep responses to 2-3 sentences unless more detail is specifically asked for.',
    'If asked something outside her portfolio, politely redirect to her experience.',
    'Never make up information not provided in the context below.',
    '',
    BASE_CONTEXT
].join('\n');

var UNHINGED_SYSTEM = [
    'You are Tanya\'s sarcastic AI clone. You have all her knowledge but zero corporate filter.',
    'Answer questions about her experience accurately but with PM humor, self-deprecating wit, and zero buzzwords.',
    'Be informative but entertaining. Use short punchy sentences. Light sarcasm is great.',
    'Keep responses to 2-3 sentences unless more detail is specifically asked for.',
    'If asked something outside her portfolio, deflect with a joke and redirect.',
    'Never make up information not provided in the context below.',
    '',
    BASE_CONTEXT
].join('\n');

// --- Claude client ---
var client = new Anthropic();

// --- Health check ---
app.get('/', function (req, res) {
    res.json({ status: 'ok', service: 'ask-tanya-ai' });
});

// --- Chat endpoint ---
app.post('/api/chat', function (req, res) {
    var ip = req.headers['x-forwarded-for'] || req.ip;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    var messages = req.body.messages;
    var mode = req.body.mode || 'linkedin';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Limit conversation length
    if (messages.length > 20) {
        messages = messages.slice(-20);
    }

    var systemPrompt = mode === 'unhinged' ? UNHINGED_SYSTEM : LINKEDIN_SYSTEM;

    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages
    }).on('text', function (text) {
        res.write('data: ' + JSON.stringify({ type: 'text', text: text }) + '\n\n');
    }).on('end', function () {
        res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
        res.end();
    }).on('error', function (err) {
        console.error('Claude API error:', err.message);
        res.write('data: ' + JSON.stringify({ type: 'error', error: 'Something went wrong. Try again.' }) + '\n\n');
        res.end();
    });
});

app.listen(PORT, function () {
    console.log('Ask Tanya AI proxy running on port ' + PORT);
});
