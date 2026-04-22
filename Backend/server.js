// server.js
import express from 'express';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import cors from 'cors';
import cookieParser from "cookie-parser";
import OpenAI from "openai";
import { router as authRoutes } from "./routes/authRoutes.js";
import connectDB from './config/db.js';
import Prompt from './models/Prompt.js';
import { protect } from './middleware/auth.js';
import vendorRouter from './routes/vendor.js';
import { adminRouter } from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(cookieParser());
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
app.use("/vendor", vendorRouter);
app.use("/admin", adminRouter);

const tvly = tavily({ apiKey: process.env.TAVILY_KEY });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ═══════════════════════════════════════════════════════
// HELPER: Call OpenAI with isolated system + user prompt
// ═══════════════════════════════════════════════════════
async function generateWithOpenAI(systemPrompt, userPrompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   }
    ]
  });
  return response.choices[0].message.content;
}

// ═══════════════════════════════════════════════════════
// SHARED INPUT VALIDATORS  (fast-fail, no AI token cost)
// ═══════════════════════════════════════════════════════

function isInvalidText(value) {
  if (!value || typeof value !== "string") return true;
  const trimmed = value.trim();
  if (trimmed.length < 2) return true;
  const hasVowel = /[aeiouAEIOU]/.test(trimmed);
  if (trimmed.length > 4 && !hasVowel) return true;
  return false;
}

function isInvalidAmount(value) {
  const num = Number(value);
  return isNaN(num) || num <= 0;
}

function isExcessiveAmount(value) {
  return Number(value) > 100_000_000;
}

// Catches "5000", "PKR 500", "500 Rs", "$500", "5,000.00"
function isPureNumberOrAmount(value) {
  if (!value || typeof value !== "string") return false;
  return /^(PKR\s*)?\d[\d,\.]*(\s*PKR|\s*Rs\.?|\s*\$|%)?$/i.test(value.trim());
}

// Curated list of common Pakistani, Arabic, and Western first names
const PERSON_NAMES = new Set([
  "nouman","noman","ali","ahmed","usman","hassan","hussain","muhammad","mohammad",
  "muhamad","bilal","hamza","omar","umar","zain","zaid","saad","talha","asad",
  "adnan","imran","kamran","shahid","farhan","waseem","waqas","rizwan","tariq",
  "naeem","naveed","ahsan","faisal","danish","rehan","omer","junaid","asim",
  "shoaib","arif","nasir","zahid","irfan","sajid","azam","akram","sohail",
  "aisha","fatima","zara","hira","sana","nadia","rabia","amna","maryam",
  "ayesha","kiran","sadia","uzma","saima","mahnoor","nimra","alina","dania",
  "john","jane","mike","david","james","robert","william","richard","thomas",
  "charles","mark","donald","george","kevin","brian","adam","andrew","peter",
  "paul","matthew","chris","daniel","michael","steven","gary","eric","jason",
  "mary","patricia","jennifer","linda","barbara","susan","jessica","karen",
  "lisa","nancy","betty","margaret","dorothy","sandra","emily","anna","sarah",
  "ayaan","aayan","ayan","taha","sohaib","suhaib","muneeb","moiz","musa",
  "yahya","ibrahim","ismail","idris","nawaz","nawab","zubair","athar","kashif",
]);

function looksLikePersonName(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim().toLowerCase();
  if (PERSON_NAMES.has(trimmed)) return true;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2 && PERSON_NAMES.has(parts[0]) && PERSON_NAMES.has(parts[1])) return true;
  if (parts.length === 3 && parts.every(p => PERSON_NAMES.has(p))) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 1 — Startup Roadmap  /api/roadmap
// Input  : type  (product name OR business type — text only)
// Output : roadmap (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/roadmap', async (req, res) => {
  console.log("Received request for roadmap generation");
  const { type } = req.body;
  console.log("2131321321321321");


  // Layer 1 — empty / gibberish
  if (isInvalidText(type)) {
    return res.status(400).json({
      roadmap: "⚠️ Please enter a product name or business type to generate your roadmap.\nExamples: 'women's clothing', 'mobile accessories', 'skincare products', 'electronics store'."
    });
  }
  console.log("2131321321321321");
  

  // Layer 2 — number or money amount entered by mistake
  if (isPureNumberOrAmount(type)) {
    return res.status(400).json({
      roadmap: "⚠️ You entered a number or amount here, but this field needs a product or business type — not a budget.\n👉 To plan your budget, go to the Budget Planner page."
    });
  }
  console.log("2131321321321321");


  // Layer 3 — person name entered by mistake
  if (looksLikePersonName(type)) {
    return res.status(400).json({
      roadmap: `⚠️ "${type}" looks like a person's name, not a product or business type.\nPlease enter what you want to sell — for example: "clothing", "handmade jewelry", "phone cases", or "beauty products".`
    });
  }
  console.log("2131321321321321");

  // Layer 4 — AI does final validation then generates the roadmap
  const systemPrompt = `
You are the ROADMAP GENERATOR for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to generate a step-by-step e-commerce startup roadmap based on the product or business type the user provides.
You do NOT give budget advice, profit calculations, vendor lists, competitor analysis, or platform comparisons here — those are separate tools on separate pages.

━━━ VALIDATION — Run these checks FIRST before generating anything ━━━

CHECK 1 — Is the input a person's name (e.g., "Nouman", "Ali", "Sara", "James", any Pakistani/Arabic/Western name)?
→ If YES, reply ONLY: "⚠️ This looks like a person's name. Please enter a product or business type instead — for example: 'clothing', 'electronics', 'food items', or 'beauty products'."

CHECK 2 — Is the input a number, amount, or currency value (e.g., "5000", "PKR 10000", "500$")?
→ If YES, reply ONLY: "⚠️ This field needs a product or business type, not a money amount. To plan your budget, please use the Budget Planner page."

CHECK 3 — Is the input a greeting, random phrase, or completely unrelated to any product or business (e.g., "hello", "salam", "I don't know", "cricket")?
→ If YES, reply ONLY: "⚠️ Please enter a product name or business type to get your roadmap — for example: 'shoes', 'skincare', 'food delivery', or 'handmade crafts'."

CHECK 4 — Is the input something that realistically CANNOT be sold online (e.g., "nuclear reactor", "government ministry", "military", "hospital")?
→ If YES, reply ONLY: "⚠️ That can't be sold through an online store. Please enter a sellable product or business type (e.g., 'clothing', 'gadgets', 'cosmetics', 'food products')."

━━━ OUTPUT — Only if input passes all checks ━━━

Generate the roadmap using this exact structure:

🏪 BUSINESS OVERVIEW
Brief description of this product/business type and its market potential in Pakistan.

⚙️ PHASE 1 — SETUP (Week 1–2)
Numbered steps: business registration, platform account, bank account, CNIC/NTN.

📦 PHASE 2 — SOURCING (Week 2–3)
Where and how to source this specific product in Pakistan (name specific local markets, AliExpress categories, or wholesalers relevant to this product).

📣 PHASE 3 — LAUNCH (Week 3–4)
How to list, price, and promote this product with platform-specific tips.

📈 PHASE 4 — GROWTH MILESTONES
- Month 1 goal
- Month 3 goal
- Month 6 goal

Keep advice practical, Pakistan-specific, and beginner-friendly. Use PKR for all costs.
`.trim();

  const userPrompt = `Generate a startup roadmap for selling "${type}" online in Pakistan.`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
  console.log("0000000");

    // console.log("user id", req.user.id);
    res.json({ roadmap: result });
  } catch (error) {
    console.error("Roadmap Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 2 — Budget Planner  /api/budget
// Input  : budget (number, PKR)
// Output : plan (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/budget', protect, async (req, res) => {
  const { budget } = req.body;
  console.log("Budget API hit:", budget);

  if (isInvalidAmount(budget)) {
    return res.status(400).json({
      plan: "⚠️ Please enter a valid budget amount greater than PKR 0.\nExample: Enter '15000' for a PKR 15,000 budget."
    });
  }
  if (isExcessiveAmount(budget)) {
    return res.status(400).json({
      plan: "⚠️ That amount seems too high. Please enter a realistic starting budget (up to PKR 1,00,00,000)."
    });
  }

  const systemPrompt = `
You are the BUDGET PLANNER tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to create a detailed, realistic budget breakdown for starting an online selling business in Pakistan based on the PKR amount the user provides.
You do NOT give roadmaps, platform advice, profit calculations, or competitor analysis here — those are separate tools on separate pages.

━━━ VALIDATION ━━━
If the input is not a valid positive number, reply ONLY: "⚠️ Please enter a valid budget amount in PKR (e.g., 10000, 25000, 50000)."
If the user asks about anything unrelated to budgeting or starting costs, reply ONLY: "⚠️ This is the Budget Planner. For other questions, please use the appropriate tool from the menu."

━━━ BUDGET TIERS ━━━
- PKR 1–4,999     → Micro: suggest digital products or dropshipping
- PKR 5,000–24,999  → Small: 1 product, minimal stock
- PKR 25,000–99,999 → Medium: proper inventory approach
- PKR 100,000+    → Large: multi-product with branding

━━━ OUTPUT FORMAT ━━━

💰 BUDGET SUMMARY
Total: PKR [amount] — [Tier] budget

📦 1. RECOMMENDED PRODUCT CATEGORIES
List 2–3 products best suited to this exact budget with estimated stock costs in PKR.

🧾 2. COST BREAKDOWN
- Stock / Inventory: PKR ___
- Packaging materials: PKR ___
- Platform fees: PKR ___
- Delivery / logistics: PKR ___
- Marketing / ads: PKR ___
- Contingency reserve (10%): PKR ___
- TOTAL ALLOCATED: PKR ___

📊 3. ESTIMATED FIRST MONTH REVENUE POTENTIAL
Realistic estimate with assumptions stated.

💡 4. MONEY-SAVING TIPS FOR PAKISTAN
2–3 tips specific to this budget tier (e.g., use COD to avoid payment gateway fees, Daraz free seller account, Hafeez Centre for bulk buying).

Always use PKR. Be specific — not generic.
`.trim();

  const userPrompt = `My starting budget is PKR ${budget}. Create a complete budget breakdown plan for my e-commerce business in Pakistan.`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ plan: result });
  } catch (error) {
    console.error("Budget Error:", error);
    res.status(500).json({ error: "Failed to generate budget plan." });
  }
});

app.get("/", (req, res) => res.send("Welcome to the API"));

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 3 — Trending Products  /api/trending-products
// Input  : keyword (text)
// Output : results (Tavily search array)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/trending-products', protect, async (req, res) => {
  const { keyword } = req.body;

  if (isInvalidText(keyword)) {
    return res.status(400).json({
      error: "⚠️ Please enter a product keyword to search for trends.\nExamples: 'skincare', 'phone accessories', 'baby products', 'fitness gear'."
    });
  }
  if (isPureNumberOrAmount(keyword)) {
    return res.status(400).json({
      error: "⚠️ Please enter a product keyword, not a number.\nTry 'clothing' or 'electronics' instead."
    });
  }

  try {
    const data = await tvly.search(`${keyword} trending products Pakistan ecommerce 2024`);
    res.json({ results: data.results });
  } catch (error) {
    console.error("Trending Products Error:", error);
    res.status(500).json({ error: "Failed to fetch trending products." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 4 — Competitor Analysis  /api/competitor
// Input  : product (text)
// Output : { analysis, competitors[] }
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/competitor', protect, async (req, res) => {
  const { product } = req.body;

  if (isInvalidText(product)) {
    return res.status(400).json({
      error: "⚠️ Please enter a product name to analyze its competitors.\nExamples: 'wireless earbuds', 'women\u2019s kurtis', 'phone cases'."
    });
  }
  if (isPureNumberOrAmount(product)) {
    return res.status(400).json({
      error: "⚠️ Please enter a product name, not a number.\nExample: 'bluetooth speaker' instead of '5000'."
    });
  }

  const query = `Competitive pricing, product descriptions, customer reviews, Shopify or eCommerce stores selling ${product} in Pakistan. List known competitors, websites or Shopify stores actively selling these products.`;
  console.log(`Querying Tavily for competitor analysis on:\n${query}`);

  try {
    const tavilyResponse = await tvly.search(query, {
      include_answer: true,
      include_sources: true,
    });

    const rawAnswer = tavilyResponse?.answer;
    if (!rawAnswer) {
      return res.status(404).json({ error: "No competitor data found. Try a more specific product name." });
    }

    const systemPrompt = `
You are the COMPETITOR ANALYSIS tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to analyze competitor data for a specific product being sold in Pakistan and return a structured JSON result.
You do NOT give roadmaps, budget plans, profit calculations, tutorials, or platform advice here — those are separate tools on separate pages.

━━━ OUTPUT — Strict JSON only ━━━
Return ONLY a valid JSON object. No markdown. No code blocks. No text outside the JSON.

{
  "analysis": "2–3 sentence summary of the competitive landscape for this product in Pakistan's online market.",
  "competitors": [
    {
      "name": "Real store or brand name",
      "website": "https://actual-url.com",
      "description": "What they sell and their pricing or strategy."
    }
  ]
}

RULES:
- Only include competitors with REAL, verifiable websites from the research data provided.
- Do NOT invent or hallucinate any name, URL, or statistic.
- If no real competitors are found in the data, set competitors to [] and explain in analysis.
- If the product cannot be sold online, set analysis to: "⚠️ This product is not applicable for e-commerce analysis." and return empty competitors.
`.trim();

    const userPrompt = `Product: "${product}"\n\nResearch Data:\n${rawAnswer}`;
    const llmResponse = await generateWithOpenAI(systemPrompt, userPrompt);

    let parsed;
    try {
      const cleaned = llmResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.json({ analysis: llmResponse, competitors: [], raw: true });
    }

    res.json(parsed);
  } catch (error) {
    console.error("Competitor Analysis Error:", error);
    res.status(500).json({ error: "Failed to generate competitor analysis." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 5 — Profit Calculator  /api/profit
// Input  : cost, adBudget, sellingPrice (all numbers, PKR)
// Output : result (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/profit', protect, async (req, res) => {
  const { cost, adBudget, sellingPrice } = req.body;
  console.log("the cost receive", cost, adBudget, sellingPrice);
  

  if (isInvalidAmount(cost)) {
    return res.status(400).json({ result: "⚠️ Please enter a valid product cost greater than PKR 0." });
  }
  console.log("the cost ", cost);

  if (isInvalidAmount(adBudget)) {
    return res.status(400).json({ result: "⚠️ Please enter a valid ad budget in PKR. Enter 1 if you have no ad spend." });
  }
  console.log("jksajdljlj");
  
  if (isInvalidAmount(sellingPrice)) {
    return res.status(400).json({ result: "⚠️ Please enter a valid selling price greater than PKR 0." });
  }
  console.log("jskka");
  
  if (Number(sellingPrice) <= Number(cost)) {
    return res.status(400).json({
      result: `⚠️ Your selling price (PKR ${sellingPrice}) is equal to or lower than your product cost (PKR ${cost}). You will not make a profit this way.\n💡 Try raising your selling price above PKR ${Number(cost) + 1}.`
    });
  }
  console.log( "asad");
  
  if (isExcessiveAmount(cost) || isExcessiveAmount(sellingPrice)) {
    return res.status(400).json({ result: "⚠️ One of your values seems too high. Please enter realistic PKR amounts." });
  }
  console.log("after accepting");
  

  const systemPrompt = `
You are the PROFIT CALCULATOR tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to calculate profit metrics for a product being sold online in Pakistan and present them clearly.
You do NOT give roadmaps, budget plans, sourcing advice, competitor data, or platform recommendations here — those are separate tools on separate pages.

━━━ VALIDATION ━━━
If any value is missing, zero, or negative, reply ONLY: "⚠️ Please enter valid positive amounts for all three fields: product cost, ad budget, and selling price."
If the user sends text or asks something unrelated to profit/ROI, reply ONLY: "⚠️ This is the Profit Calculator. Please enter your product cost, ad budget, and selling price as numbers."

━━━ OUTPUT FORMAT ━━━

📊 PROFIT CALCULATION RESULTS

🔢 Your Numbers:
- Product Cost: PKR ___
- Ad Budget: PKR ___
- Selling Price: PKR ___

📈 Calculated Results:
- Gross Profit per Unit: PKR ___ (Selling Price − Cost)
- Net Profit per Unit: PKR ___ (after ad spend per unit, assuming ___ units)
- Profit Margin: ___%
- Return on Investment (ROI): ___%
- Break-Even Point: ___ units to cover ad spend

✅ VERDICT
Profitable / Marginal / Loss-making — with a 1-sentence reason.

💡 RECOMMENDATION
One specific, actionable suggestion to improve margins for Pakistan's market.

Show all calculations step by step. Use PKR throughout.
`.trim();

  const userPrompt = `Product Cost: PKR ${cost}\nAd Budget: PKR ${adBudget}\nSelling Price: PKR ${sellingPrice}\n\nPlease calculate my profit, ROI, break-even point, and give a verdict.`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ result });
  } catch (error) {
    console.error("Profit Calculator Error:", error);
    res.status(500).json({ error: "Failed to calculate profit." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 6 — Vendor Directory  /api/vendors  (GET — no user input)
// Output : vendors (Tavily search array)
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/vendors', protect, async (req, res) => {
  try {
    const query = "Best local wholesale suppliers and AliExpress alternatives for Pakistani eCommerce sellers 2024";
    const data = await tvly.search(query);
    res.json({ vendors: data.results });
  } catch (error) {
    console.error("Vendor Directory Error:", error);
    res.status(500).json({ error: "Failed to fetch vendor directory." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 7 — Platform Advisor  /api/platform
// Input  : goal (text — what the user wants to sell/achieve)
// Output : advice (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/platform', protect, async (req, res) => {
  const { goal } = req.body;

  if (isInvalidText(goal)) {
    return res.status(400).json({
      advice: "⚠️ Please describe what you want to sell or achieve online.\nExamples: 'sell handmade jewelry', 'dropship phone accessories', 'build a clothing brand'."
    });
  }
  if (isPureNumberOrAmount(goal)) {
    return res.status(400).json({
      advice: "⚠️ Please describe your selling goal in words, not a number.\nExample: 'sell women's clothes on social media' instead of '5000'."
    });
  }

  const systemPrompt = `
You are the PLATFORM ADVISOR tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to recommend the best online selling platform(s) in Pakistan for the user's specific goal.
You do NOT give roadmaps, budget plans, profit calculations, tutorials, or competitor analysis here — those are separate tools on separate pages.

Platforms you can recommend: Daraz, Shopify, Instagram Shop, Facebook Marketplace, OLX, TikTok Shop Pakistan, WhatsApp Business Catalog.

━━━ VALIDATION ━━━
If the goal is unrelated to selling products or services online (e.g., "find a job", "meet people", "play games"), reply ONLY:
"⚠️ This tool helps you choose a selling platform. Please describe what product or service you want to sell online."

━━━ OUTPUT FORMAT ━━━

🏆 TOP RECOMMENDATION
Platform name + specific reason it fits this goal.

🥈 ALTERNATIVE OPTION
Platform name + when to choose this instead.

📊 QUICK COMPARISON
| Platform | Setup Ease | Fees | Best For |
|----------|-----------|------|----------|
(3–4 most relevant platforms only)

🚀 YOUR FIRST STEP TODAY
One specific action on the recommended platform the user can take right now.

Mention Pakistan-specific details: EasyPaisa/JazzCash support, COD availability, Daraz Seller Centre where relevant.
`.trim();

  const userPrompt = `My selling goal: "${goal}". Which platform should I use to sell in Pakistan?`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ advice: result });
  } catch (error) {
    console.error("Platform Advisor Error:", error);
    res.status(500).json({ error: "Failed to generate platform advice." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 8 — Launch Guide  /api/guide
// Input  : platform (text — e.g., "Daraz", "Shopify")
// Output : guide (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/guide', protect, async (req, res) => {
  const { platform } = req.body;

  if (isInvalidText(platform)) {
    return res.status(400).json({
      guide: "⚠️ Please enter a platform name to get your launch guide.\nExamples: 'Daraz', 'Shopify', 'Instagram', 'Facebook Marketplace'."
    });
  }
  if (isPureNumberOrAmount(platform)) {
    return res.status(400).json({
      guide: "⚠️ This field needs a platform name like 'Daraz' or 'Shopify', not a number."
    });
  }

  const systemPrompt = `
You are the LAUNCH GUIDE tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to provide a clear, step-by-step checklist to launch a product on a specific selling platform in Pakistan.
You do NOT give roadmaps, budget plans, profit calculations, competitor analysis, or tutorials here — those are separate tools on separate pages.

━━━ VALIDATION ━━━
If the input is not a real, recognized selling platform (e.g., "NASA", "random app", "my computer"), reply ONLY:
"⚠️ That doesn't seem like a selling platform. Please enter a real platform name — for example: 'Daraz', 'Shopify', 'Instagram', 'Facebook', or 'OLX'."

━━━ OUTPUT FORMAT ━━━
Create a numbered checklist in 5 phases, specific to the platform entered:

✅ PHASE 1 — ACCOUNT SETUP (Steps 1–4)
Registration, identity verification, CNIC/NTN, bank account linking on this platform.

✅ PHASE 2 — PRODUCT LISTING (Steps 5–8)
Photos, titles, descriptions, categories, pricing — platform-specific tips.

✅ PHASE 3 — PAYMENT & DELIVERY SETUP (Steps 9–11)
EasyPaisa/JazzCash/COD setup, courier integration for this platform.

✅ PHASE 4 — LAUNCH (Steps 12–15)
Going live, first promotion, initial traffic strategy.

✅ PHASE 5 — OPTIMIZATION (Steps 16–18)
Reviews, analytics, improving conversion on this platform.

Every step must be specific to the platform — not generic advice.
`.trim();

  const userPrompt = `Create a complete step-by-step launch guide for selling on ${platform} in Pakistan.`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ guide: result });
  } catch (error) {
    console.error("Guide Error:", error);
    res.status(500).json({ error: "Failed to generate launch guide." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 9 — Tutorials  /api/tutorials
// Input  : topic (text — e.g., "Facebook Ads", "packaging")
// Output : tutorial (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/tutorials', protect, async (req, res) => {
  const { topic } = req.body;

  if (isInvalidText(topic)) {
    return res.status(400).json({
      tutorial: "⚠️ Please enter a topic to get a tutorial.\nExamples: 'Facebook Ads', 'product photography', 'customer support', 'Daraz SEO'."
    });
  }

  const systemPrompt = `
You are the LEARNING TUTORIALS tool for an e-commerce coaching app focused on the Pakistani market.

YOUR ONLY JOB is to write a clear, beginner-friendly tutorial on an e-commerce or online business topic for Pakistani sellers.
You do NOT give roadmaps, budget plans, profit calculations, competitor analysis, or platform recommendations here — those are separate tools on separate pages.

━━━ VALIDATION ━━━
If the topic has NOTHING to do with e-commerce, online selling, digital marketing, business operations, or entrepreneurship (e.g., "how to cook biryani", "cricket rules", "car mechanics"), reply ONLY:
"⚠️ This tutorial section covers e-commerce topics only. Please ask about something like: Facebook Ads, product photography, customer support, Daraz SEO, packaging, or order management."

━━━ OUTPUT FORMAT ━━━

📘 WHAT IS [TOPIC]?
1–2 sentences defining it simply.

🎯 WHY IT MATTERS FOR YOUR PAKISTAN E-COMMERCE BUSINESS
Specific, concrete impact on sales, costs, or customer trust.

🛠️ STEP-BY-STEP GUIDE
Numbered steps (minimum 5), each with a clear action.

💡 PRO TIPS FOR PAKISTAN
2–3 tips specific to Pakistani market conditions.

⚠️ COMMON MISTAKES TO AVOID
2–3 mistakes beginners make on this specific topic.

📚 FREE RESOURCES TO LEARN MORE
Real, working YouTube channels, free tools, or websites only — do not invent resources.

Keep language simple, practical, and encouraging.
`.trim();

  const userPrompt = `Write a beginner-friendly e-commerce tutorial on: "${topic}" — for Pakistani sellers.`;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ tutorial: result });
  } catch (error) {
    console.error("Tutorial Error:", error);
    res.status(500).json({ error: "Failed to generate tutorial." });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ROUTE 10 — Mentor Chat  /api/mentor-chat
// Input  : question (any e-commerce question, conversational)
// Output : response (string)
// ═══════════════════════════════════════════════════════════════════════
app.post('/api/mentor-chat', protect, async (req, res) => {
  const { question } = req.body;

  if (isInvalidText(question)) {
    return res.status(400).json({
      response: "⚠️ Please type your question to chat with your mentor.\nExample: 'How do I get my first sale on Daraz?' or 'What products should I sell with PKR 10,000?'"
    });
  }

  const systemPrompt = `
You are MENTOR — a friendly, experienced e-commerce advisor built into a Pakistani seller coaching app.

YOUR JOB: Answer any question related to e-commerce, online selling, digital marketing, business, or entrepreneurship in the context of Pakistan. You are conversational and give real, actionable advice.

Unlike the other tools (Roadmap, Budget Planner, Profit Calculator etc.), you CAN answer broadly across all e-commerce topics — you are the free-form chat experience. However, you should still direct users to the right tool when a dedicated tool would serve them better (e.g., "For a detailed budget breakdown, check the Budget Planner page!").

━━━ YOUR PERSONALITY ━━━
- Talk like a knowledgeable older sibling who has built successful online businesses
- Warm, direct — no corporate fluff
- You can naturally use Urdu/English mix (e.g., "bhai", "yaar") but stay professional
- Give specific advice, not generic motivational speeches
- End every response with ONE specific action the person can take TODAY

━━━ BOUNDARIES ━━━
If the question is completely unrelated to business, selling, marketing, finance, or entrepreneurship (e.g., "tell me a joke", "what's the weather", "write a poem"), reply ONLY:
"Yaar, I'm your e-commerce mentor — I can only help with business topics! Ask me something like how to find products, run ads, handle returns, or grow your store. 😊"

If the question contains offensive or harmful content, reply ONLY:
"Let's keep things professional and focused on building your business. Ask me anything about selling online!"

━━━ RESPONSE STYLE ━━━
- Answer directly first — no long intro
- 150–250 words max unless a detailed breakdown is truly needed
- End with: "👉 Today's action: [one specific next step]"
`.trim();

  const userPrompt = question;

  try {
    const result = await generateWithOpenAI(systemPrompt, userPrompt);
    res.json({ response: result });
  } catch (error) {
    console.error("Mentor Chat Error:", error);
    res.status(500).json({ error: "Failed to get mentor response." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));