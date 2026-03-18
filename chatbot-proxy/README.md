# Ask Tanya AI — Backend Proxy

Proxies chat requests from the portfolio website to the Claude API, keeping the API key secure.

## Setup

1. `cd chatbot-proxy && npm install`
2. Set environment variables:
   - `ANTHROPIC_API_KEY` — your Claude API key
   - `ALLOWED_ORIGIN` — e.g. `https://tannybuoy.github.io` (optional, defaults to `*`)
3. `npm start`

## Deploy to Render

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `chatbot-proxy`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add environment variables: `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN`
6. Deploy — note the URL (e.g. `https://ask-tanya-ai.onrender.com`)
7. Update `CHATBOT_API_URL` in `js/chatbot.js` with your Render URL
