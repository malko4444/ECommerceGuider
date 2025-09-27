// server.js or app.js
import express from 'express';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {router as authRoutes} from "./routes/authRoutes.js";



 // Adjust the path as necessary
import connectDB from './config/db.js';
import Prompt from './models/Prompt.js';
import { protect } from './middleware/auth.js';
// import connectDB from "./config/db.js";



dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",  // frontend URL
  credentials: true                 // if you want to send cookies/auth headers
}));
connectDB();
app.use("/auth", authRoutes);

// Tavily instance
const tvly = tavily({ apiKey: process.env.TAVILY_KEY });

// Google GenAI instance
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const llm = genAI.getGenerativeModel({ model:"gemini-1.5-flash-latest" })


// 1. Business Type Selector
app.post('/api/roadmap',protect, async (req, res) => {
  console.log("Received request for roadmap generation");

  const { type } = req.body;
  const prompt = `Give a startup roadmap for a ${type} e-commerce business in Pakistan.`;
  const result = await llm.generateContent(prompt);
  const userId = req.user.id;  
  console.log("user id",userId);
  

  res.json({ roadmap: result.response.text() });
});

// 2. Budget Planner
app.post('/api/budget', async (req, res) => {
  const { budget } = req.body;
  const prompt = `Given a budget of PKR ${budget}, suggest feasible product types, quantities, packaging/marketing costs, and platform fees for online selling in Pakistan.`;
  const result = await llm.generateContent(prompt);
  res.json({ plan: result.response.text() });
});
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// 3. Trending Product Finder
app.post('/api/trending-products', async (req, res) => {
  const { keyword } = req.body;
  const data = await tvly.search(keyword);
  res.json({ results: data.results });
});

// 4. Competitor Analysis
app.post('/api/competitor', async (req, res) => {
  const { product } = req.body;

  const query = `
    Competitive pricing, product descriptions, customer reviews, and Shopify or eCommerce stores that are selling ${product} in Pakistan.
    List any known competitors, especially websites or Shopify stores actively selling these products.
  `;

  console.log(`Querying Tavily for competitor analysis on:\n${query}`);

  try {
    // Step 1: Search using Tavily
    const tavilyResponse = await tvly.search(query, {
      include_answer: true,
      include_sources: true,
    });

    const rawAnswer = tavilyResponse?.answer;
    const sources = tavilyResponse?.sources || [];
    console.log(`Tavily response: ${JSON.stringify(tavilyResponse, null, 2)}`);
    console.log(`Raw answer: ${rawAnswer}`);
    console.log(`Sources: ${JSON.stringify(sources, null, 2)}`);

    if (!rawAnswer) {
      return res.status(404).json({ error: 'No competitor data found.' });
    }

    // Step 2: Ask LLM to return structured JSON
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

    const llmResult = await llm.generateContent(llmPrompt);
    const responseText = llmResult.response.text();

    // Step 3: Try parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (jsonErr) {
      console.warn('Failed to parse JSON from LLM. Returning raw text instead.');
      return res.json({
        analysis: responseText,
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
app.post('/api/profit', async (req, res) => {
  const { cost, adBudget, sellingPrice } = req.body;
  const prompt = `Calculate ROI, break-even point, and ideal price if product cost is PKR ${cost}, ad budget is PKR ${adBudget}, and selling price is PKR ${sellingPrice}.`
  const result = await llm.generateContent(prompt);
  res.json({ result: result.response.text() });
});

// 6. Vendor Directory
app.get('/api/vendors', async (req, res) => {
  const query = 'Best local and AliExpress product suppliers for Pakistani eCommerce sellers';
  const data = await tvly.search(query);
  res.json({ vendors: data.results });
});

// 7. Platform Advisor
app.post('/api/platform', async (req, res) => {
  const { goal } = req.body;
  const prompt = `Suggest the best eCommerce platform for a beginner wanting to ${goal} (Daraz, Shopify, Instagram Shop).`;
  const result = await llm.generateContent(prompt);
  res.json({ advice: result.response.text() });
});

// 8. Step-by-step Guide
app.post('/api/guide', async (req, res) => {
  const { platform } = req.body;
  const prompt = `Create a step-by-step to-do checklist to launch a product on ${platform}.`;
  const result = await llm.generateContent(prompt);
  res.json({ guide: result.response.text() });
});

// 9. Learning Dashboard (Basic Tutorials
app.post('/api/tutorials', async (req, res) => {
  const { topic } = req.body;
  const prompt = `Write a beginner-friendly tutorial for ${topic} (e.g., Facebook ads, packaging, customer support).`;
  const result = await llm.generateContent(prompt);
  res.json({ tutorial: result.response.text() });
});

// 10. Mentor Chat (Basic LLM Reply)
app.post('/api/mentor-chat', async (req, res) => {
  const { question } = req.body;
  const result = await llm.generateContent(question);
  res.json({ response: result.response.text() });
});

// include the router and for base route then navigate to user routes 

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
