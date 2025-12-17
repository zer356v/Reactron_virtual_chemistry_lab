import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

// Utility: clean JSON from markdown or text
function cleanJSON(str) {
  return str
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export const runReaction = async (req, res) => {
  try {
    const { chemicalA, chemicalB, volumeA = 0, volumeB = 0 } = req.body;

    if (!chemicalA || !chemicalB) {
      return res.status(400).json({ error: "Both chemicals required" });
    }

    const prompt = `
    You are a real-world chemistry reaction engine.
    You MUST predict reactions using correct chemistry rules.

    When two chemicals are mixed, ALWAYS return:
    - Whether a reaction occurs
    - All products formed
    - Final mixture color
    - Final temperature
    - Gas or precipitate
    - Whether mixture is safe or dangerous

    IMPORTANT:
    Return ONLY a VALID JSON object with EXACTLY this structure:

    {
      "reactionName": "",
      "equation": "",
      "description": "",
      "type": "",
      "reacts": true,

      "products": [
        { "name": "", "state": "", "color": "" }
      ],

      "outputChemical": "",
      "outputVolume": 0,

      "finalColor": "",
      "finalTemperature": 0,

      "gas": "",
      "precipitate": "",
      "danger": "",
      "safetyLevel": "",

      "energy": 0
    }

    If no reaction occurs:
    - Set "reacts": false
    - Set "reactionName": "No Reaction"
    - Leave products empty
    `;

    const ai = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = ai.data.choices[0].message.content;
    raw = cleanJSON(raw);

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.log("❌ DeepSeek JSON error:", raw);
      return res.status(500).json({ error: "Invalid JSON from AI", raw });
    }

    return res.json(json);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
