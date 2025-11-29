// server.js or app.js
import express from 'express';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import cors from 'cors';
import cookieParser from "cookie-parser";
import OpenAI from "openai";
import {router as authRoutes} from "./routes/authRoutes.js";

import connectDB from './config/db.js';
import Prompt from './models/Prompt.js';
import { protect } from './middleware/auth.js';

dotenv.config();
const app = express();
app.use(cookieParser())
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming cookies:", req.cookies);
  next();
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

connectDB();
app.use("/auth", authRoutes);

// Tavily instance
const tvly = tavily({ apiKey: process.env.TAVILY_KEY });

// ⬇️⬇️ REPLACED GEMINI WITH OPENAI — NOTHING ELSE CHANGED ⬇️⬇️
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to replace llm.generateContent()
async function generateWithOpenAI(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",   // you can change to gpt-4.1 or gpt-4o
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}
// ⬆️⬆️ ONLY THIS PART IS ADDED — NO OTHER CODE TOUCHED ⬆️⬆️


// 1. Business Type Selector
app.post('/api/roadmap', protect, async (req, res) => {
  console.log("Received request for roadmap generation");

  const { type } = req.body;
  const prompt = `Give a startup roadmap for a ${type} e-commerce business in Pakistan.`;
  
  const result = await generateWithOpenAI(prompt);

  const userId = req.user.id;  
  console.log("user id",userId);

  res.json({ roadmap: result });
});

// 2. Budget Planner
app.post('/api/budget', protect, async (req, res) => {
  const { budget } = req.body;
  console.log("the api hit", budget);
  
  const prompt = `Given a budget of PKR ${budget}, suggest feasible product types, quantities, packaging/marketing costs, and platform fees for online selling in Pakistan.`;
  
  const result = await generateWithOpenAI(prompt);

  res.json({ plan: result });
});

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// 3. Trending Product Finder
app.post('/api/trending-products', protect, async (req, res) => {
  const { keyword } = req.body;
  const data = await tvly.search(keyword);
  res.json({ results: data.results });
});

// 4. Competitor Analysis
app.post('/api/competitor', protect, async (req, res) => {
  const { product } = req.body;

  const query = `
    Competitive pricing, product descriptions, customer reviews, and Shopify or eCommerce stores that are selling ${product} in Pakistan.
    List any known competitors, especially websites or Shopify stores actively selling these products.
  `;

  console.log(`Querying Tavily for competitor analysis on:\n${query}`);

  try {
    const tavilyResponse = await tvly.search(query, {
      include_answer: true,
      include_sources: true,
    });

    const rawAnswer = tavilyResponse?.answer;

    if (!rawAnswer) {
      return res.status(404).json({ error: 'No competitor data found.' });
    }

    const llmPrompt = `
You are a helpful market research assistant. Based on the content below, return a competitor analysis in the following strict JSON format:

{
  "analysis": "Short summary of competition in this niche.",
  "competitors": [
    {
      "name": "Competitor name",
      "website": "https://example.com",
      "description": "Short description of their product and strategy."
    }
  ]
}

Only return the JSON response. Do not add explanations, markdown, or code formatting.

Content:
${rawAnswer}
    `;

    const llmResponse = await generateWithOpenAI(llmPrompt);

    let parsed;
    try {
      parsed = JSON.parse(llmResponse);
    } catch {
      return res.json({
        analysis: llmResponse,
        competitors: [],
        raw: true
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error('Competitor Analysis Error:', error);
    res.status(500).json({ error: 'Failed to generate competitor analysis.' });
  }
});

// 5. Profit Calculator
app.post('/api/profit', protect, async (req, res) => {
  const { cost, adBudget, sellingPrice } = req.body;
  const prompt = `Calculate ROI, break-even point, and ideal price if product cost is PKR ${cost}, ad budget is PKR ${adBudget}, and selling price is PKR ${sellingPrice}.`;

  const result = await generateWithOpenAI(prompt);

  res.json({ result });
});

// 6. Vendor Directory
app.get('/api/vendors', protect, async (req, res) => {
  const query = 'Best local and AliExpress product suppliers for Pakistani eCommerce sellers';
  const data = await tvly.search(query);
  res.json({ vendors: data.results });
});

// 7. Platform Advisor
app.post('/api/platform', protect, async (req, res) => {
  const { goal } = req.body;
  const prompt = `Suggest the best eCommerce platform for a beginner wanting to ${goal} (Daraz, Shopify, Instagram Shop).`;

  const result = await generateWithOpenAI(prompt);

  res.json({ advice: result });
});

// 8. Step-by-step Guide
app.post('/api/guide', protect, async (req, res) => {
  const { platform } = req.body;
  const prompt = `Create a step-by-step to-do checklist to launch a product on ${platform}.`;

  const result = await generateWithOpenAI(prompt);

  res.json({ guide: result });
});

// 9. Learning Dashboard (Basic Tutorials)
app.post('/api/tutorials', protect, async (req, res) => {
  const { topic } = req.body;
  const prompt = `Write a beginner-friendly tutorial for ${topic} (e.g., Facebook ads, packaging, customer support).`;

  const result = await generateWithOpenAI(prompt);

  res.json({ tutorial: result });
});

// 10. Mentor Chat (Basic LLM Reply)
app.post('/api/mentor-chat', protect, async (req, res) => {
  const { question } = req.body;

  const result = await generateWithOpenAI(question);

  res.json({ response: result });
});

// include the router and for base route then navigate to user routes
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
