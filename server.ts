import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint 1: Stock deep analysis with news & recommendations
app.post('/api/stocks/analyze', async (req, res) => {
  try {
    const { ticker, companyName, currency = 'KES' } = req.body;
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required.' });
    }

    const prompt = `You are a senior quantitative stock analyst and wealth advisor specializing in both the Nairobi Securities Exchange (NSE) and Global Equities (NYSE, NASDAQ, LSE).
Analyze the following stock thoroughly:
Stock Ticker: "${ticker}" (${companyName || ''})
User Currency: ${currency}

Provide a comprehensive, up-to-date investment report including:
1. Recommendation: Must be one of ["Strong Buy", "Buy", "Hold", "Watchlist", "Trim"]
2. Target Price (realistic 12-month horizon in the stock's native currency)
3. Projected Upside percentage string (e.g. "+18.5%")
4. Risk Rating: ["Low", "Moderate", "High"]
5. Investment Thesis (2-3 concise bullet points explaining why to buy/hold, competitive moat, and growth catalysts)
6. Potential Risks / Headwinds (2 bullet points)
7. Fundamental Metrics: Estimated P/E Ratio, Dividend Yield %, Return on Equity (ROE) %, Market Cap
8. 3-4 Recent Real-world News Headlines & Events with source names (e.g. Business Daily, Bloomberg, Reuters, Capital FM), date, takeaway summary, and sentiment ("Bullish", "Neutral", "Bearish")
9. Key Trading Range / Technical levels: Support, Resistance, 52-week High, 52-week Low

Respond strictly in valid JSON format:
{
  "ticker": "${ticker}",
  "companyName": "${companyName || ticker}",
  "recommendation": "Buy",
  "targetPrice": 22.50,
  "projectedUpside": "+18.4%",
  "riskRating": "Moderate",
  "thesis": ["...", "..."],
  "risks": ["...", "..."],
  "metrics": {
    "peRatio": "11.2x",
    "dividendYield": "7.2%",
    "roe": "44.5%",
    "marketCap": "KES 720B",
    "support": "KES 16.50",
    "resistance": "KES 19.80",
    "range52w": "KES 13.50 - 20.10"
  },
  "news": [
    {
      "headline": "...",
      "source": "Business Daily Africa",
      "date": "Recent",
      "sentiment": "Bullish",
      "summary": "..."
    }
  ]
}`;

    let resultText = '';
    // Prefer gemini-3.1-flash-lite / gemini-3.8-flash for speed & reliability
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      resultText = response.text || '';
    } catch (err: any) {
      console.warn('Primary model failed, trying fallback:', err?.status || err?.message);
      const fallback = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      resultText = fallback.text || '';
    }

    const clean = resultText.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(clean);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/stocks/analyze:', error);
    return res.status(500).json({
      error: 'Failed to analyze stock. ' + (error?.message || ''),
    });
  }
});

// Endpoint 2: Ask Stock AI conversational question
app.post('/api/stocks/ask', async (req, res) => {
  try {
    const { question, contextStock } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const prompt = `You are MullahTracker's AI Stock Market Specialist.
${contextStock ? `Currently viewing stock: ${contextStock}` : ''}
User Question: "${question}"

Provide a crisp, actionable, financial analysis with real numbers, valuation context, and risk warnings. Keep it under 150 words.`;

    let text = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
      });
      text = response.text || '';
    } catch {
      const fallback = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      text = fallback.text || '';
    }

    return res.json({ answer: text });
  } catch (error: any) {
    console.error('Error in /api/stocks/ask:', error);
    return res.status(500).json({ error: 'AI consultation failed.' });
  }
});

// Vite Middleware for development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
