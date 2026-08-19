import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser for JSON with large payload support for base64 image data
app.use(express.json({ limit: '25mb' }));

// Lazy / Safe Gemini AI client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI-powered Image & Description Analysis
app.post('/api/analyze-item', async (req, res) => {
  try {
    const { imageBase64, mimeType, description, userHint } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback heuristics if API key is not available
      return res.json({
        fallback: true,
        title: userHint || 'Campus Item',
        category: 'other',
        brand: '',
        primaryColors: ['Black', 'Silver'],
        distinctiveFeatures: ['Standard campus item condition'],
        tags: ['campus', 'item'],
        description: description || 'No detailed description provided.',
        confidence: 60,
      });
    }

    const parts: any[] = [];

    // If image provided, attach inlineData
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are an expert AI campus property officer assisting in a university Lost & Found system.
Analyze the provided item image and/or user notes.
Identify:
1. A clear, descriptive title (e.g. "Apple AirPods Pro with Black Silicone Case", "Hydro Flask 32oz Pacific Blue", "Brown Timberland Bi-fold Wallet").
2. The best category from: "electronics", "wallets_ids", "keys", "bags_backpacks", "water_bottles", "apparel_accessories", "books_supplies", "jewelry_watches", "sports_gear", "other".
3. Brand or manufacturer if discernible (e.g. "Apple", "Hydro Flask", "Texas Instruments", "Nike", "Sony", "Herschel").
4. 1-3 primary colors.
5. 2-4 distinctive features or marks (scratches, stickers, engravings, keychains, damage, case type).
6. 4-6 searchable keywords/tags.
7. A refined 1-2 sentence description highlighting key visual identifiers.

User hints / notes: "${userHint || description || 'None provided'}".
`;
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: {
              type: Type.STRING,
              description: 'Must be one of: electronics, wallets_ids, keys, bags_backpacks, water_bottles, apparel_accessories, books_supplies, jewelry_watches, sports_gear, other',
            },
            brand: { type: Type.STRING },
            primaryColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            distinctiveFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: { type: Type.STRING },
            confidence: { type: Type.INTEGER, description: 'Confidence score 0-100' },
          },
          required: ['title', 'category', 'primaryColors', 'distinctiveFeatures', 'tags', 'description'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-item:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze item' });
  }
});

// Endpoint: AI Match Evaluator for Lost vs Found items
app.post('/api/match-items', async (req, res) => {
  try {
    const { targetItem, candidates } = req.body;
    const ai = getGeminiClient();

    if (!targetItem || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.json({ matches: [] });
    }

    if (!ai) {
      // Return empty so client uses robust local heuristic engine
      return res.json({ fallback: true, matches: [] });
    }

    const simplifiedCandidates = candidates.slice(0, 8).map((c: any) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      category: c.category,
      brand: c.brand,
      colors: c.colors,
      description: c.description,
      location: c.location?.name + ' (' + c.location?.zone + ')',
      specificLocationDetails: c.specificLocationDetails,
      dateOccurred: c.dateOccurred,
      distinctiveMarks: c.distinctiveMarks,
      tags: c.tags,
    }));

    const simplifiedTarget = {
      id: targetItem.id,
      title: targetItem.title,
      type: targetItem.type,
      category: targetItem.category,
      brand: targetItem.brand,
      colors: targetItem.colors,
      description: targetItem.description,
      location: targetItem.location?.name + ' (' + targetItem.location?.zone + ')',
      specificLocationDetails: targetItem.specificLocationDetails,
      dateOccurred: targetItem.dateOccurred,
      distinctiveMarks: targetItem.distinctiveMarks,
      tags: targetItem.tags,
    };

    const prompt = `
You are the intelligence engine of Campus Lost & Found.
Evaluate whether the target item matches any of the candidate items.
Note: A "lost" item matches a "found" item, and vice versa.

Target Item:
${JSON.stringify(simplifiedTarget, null, 2)}

Candidate Items:
${JSON.stringify(simplifiedCandidates, null, 2)}

For each candidate item:
- Compute a matchScore (0 to 100).
- Assign confidenceLevel: "High" (>=80), "Medium" (50-79), or "Low" (<50).
- Provide 2-3 specific reasons (e.g. "Matching brand and color", "Found in same building 1 hour after lost report", "Both mention sticker on case").
- Provide an overall assessment summary sentence.
- Suggest a verification question that the finder or campus desk can ask the claimant to safely verify ownership.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              candidateId: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              confidenceLevel: { type: Type.STRING, description: 'High, Medium, or Low' },
              overallAssessment: { type: Type.STRING },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              visualSimilarityScore: { type: Type.INTEGER },
              locationScore: { type: Type.INTEGER },
              timeScore: { type: Type.INTEGER },
              suggestedVerificationPrompt: { type: Type.STRING },
            },
            required: ['candidateId', 'matchScore', 'confidenceLevel', 'overallAssessment', 'reasons'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ matches: parsed });
  } catch (error: any) {
    console.error('Error in /api/match-items:', error);
    res.status(500).json({ error: error.message || 'Failed to match items' });
  }
});

async function startServer() {
  // Vite dev middleware vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Lost & Found Server running on http://localhost:${PORT}`);
  });
}

startServer();
