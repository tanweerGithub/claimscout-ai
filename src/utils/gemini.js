// Gemini API direct REST integration helper
// Uses client-side fetch to ensure no server costs and easy client-side configuration.

const GEMINI_API_URL = "https://generativeai.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Call the Gemini REST API with the given contents and configuration
 */
export async function callGemini(apiKey, contents, responseJson = false, systemInstruction = null) {
  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  
  const body = {
    contents,
    generationConfig: {}
  };

  if (responseJson) {
    body.generationConfig.responseMimeType = "application/json";
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      if (responseJson) {
        // Parse JSON response
        try {
          return JSON.parse(responseText.trim());
        } catch (e) {
          console.error("Failed to parse JSON response from Gemini. Raw text:", responseText);
          throw new Error("Gemini returned invalid JSON formatting. Try again.");
        }
      }
      return responseText;
    } else {
      throw new Error("No output candidate returned from Gemini.");
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

/**
 * Compile a system-level context string summarizing uploaded documents
 */
function compileDocsContext(documents) {
  if (!documents || documents.length === 0) {
    return "No reference documents have been uploaded.";
  }
  return documents.map(doc => {
    return `[DOCUMENT ID: ${doc.id}]\nType: ${doc.type}\nTitle: ${doc.title}\nAuthor/Source: ${doc.author} (${doc.year})\nSummary: ${doc.summary}\nFull/Extract Content:\n${doc.content}\n----------------------------`;
  }).join("\n\n");
}

/**
 * Handles the Dual-Persona chat.
 * Toggles between Co-Pilot (strategic assistant) and Griller (VC / Patent Examiner).
 */
export async function askAgent(apiKey, messageHistory, documents, currentIdea, persona) {
  const docsContext = compileDocsContext(documents);
  
  let systemInstruction = "";
  if (persona === "griller") {
    systemInstruction = `You are "The Griller", a sharp Venture Capitalist and strict Patent Examiner.
Your job is to interrogate the user's startup/technology idea based on the uploaded competitor documents and patents.
Be skeptical. Point out:
1. Direct infringements or architectural overlaps with existing patents.
2. Competitive hurdles where existing products (competitors) are cheaper, faster, or have better distribution.
3. Market feasibility issues.
Keep your answers direct, demanding, and highly analytical. Ask tough questions that make the founder think.
Always cite specific Document IDs (e.g. [doc1]) when referencing the literature.

Reference Information:
User's Current Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents & Patents:
${docsContext}`;
  } else {
    // Co-pilot
    systemInstruction = `You are "ClaimScout Co-Pilot", a strategic technology architect and IP consultant.
Your job is to help the user build their startup idea, design around competitor patents, and expand on their technical details.
Be collaborative, constructive, and highly technical. Propose:
1. Technical workarounds to bypass specific patent claims in the uploaded docs.
2. Architecture designs integrating open-source layers.
3. Solutions to fill the market "white spaces" highlighted in the documents.
Always cite specific Document IDs (e.g. [doc2]) when explaining technical relations.

Reference Information:
User's Current Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents & Patents:
${docsContext}`;
  }

  // Map react chat history state to Gemini contents format
  const contents = messageHistory.map(msg => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));

  return await callGemini(apiKey, contents, false, systemInstruction);
}

/**
 * Regenerates the 2D Landscape Node Graph and White Space details
 */
export async function generateLandscape(apiKey, documents, currentIdea) {
  const docsContext = compileDocsContext(documents);
  const prompt = `You are a tech landscape data generator. Analyze the user's startup idea against the uploaded patents and competitors, and generate a JSON mapping to represent a 2D network diagram.
  
User's Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents:
${docsContext}

Your output must be a single JSON object matching this structure EXACTLY (do not include any additional keys or markdown wrappers outside the JSON):
{
  "nodes": [
    { "id": "core", "label": "[User's Project Name]", "type": "core", "x": 400, "y": 250, "r": 24, "group": "center" },
    // Add nodes for each patent and competitor document. Match coordinates to form clear visual groupings (e.g. cluster ultrasonic patents in one area, LiDAR in another).
    // Node attributes: 
    // - id: unique string (e.g. "pat1", "comp1")
    // - label: short title (e.g. "US-1049283-B2 (Ultrasonic)")
    // - type: "patent" | "competitor" | "tech"
    // - x: number between 130 and 670
    // - y: number between 80 and 420
    // - r: radius (14-20)
    // - group: category name (e.g. "ultrasonic", "lidar")
    { "id": "pat1", "label": "...", "type": "patent", "x": 280, "y": 160, "r": 16, "group": "..." }
  ],
  "links": [
    // Create links between your core node and patents/competitor nodes, plus links to tech nodes.
    // - source: node id
    // - target: node id
    // - relation: description (e.g. "Uses", "High Overlap", "Clean bypass")
    // - type: "high-risk" | "medium-risk" | "low-risk" | "competitor" | "tech"
    { "source": "core", "target": "pat1", "relation": "...", "type": "low-risk" }
  ],
  "whiteSpaces": [
    // Identify 2-3 specific technical "White Spaces" (unexplored opportunities or patent gaps) that the user's idea addresses.
    // Provide coordinates that place them in clear open spaces on the canvas.
    {
      "id": "ws1",
      "title": "[Title of White Space Opportunity]",
      "description": "[Detailed explanation of why this is an opportunity and how user's idea leverages it to dodge competitor patents/products]",
      "x": 250,
      "y": 370
    }
  ]
}`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  return await callGemini(apiKey, contents, true);
}

/**
 * Evaluates patent claims side-by-side and returns a risk table
 */
export async function generateRiskAssessment(apiKey, documents, currentIdea) {
  const docsContext = compileDocsContext(documents);
  const prompt = `Analyze the user's startup idea against the uploaded documents (specifically patents). 
For each patent, extract the main overlapping claims, evaluate how they compare to the user's proposed implementation, assign a risk severity (low, medium, high), and suggest technical/architectural design workarounds to avoid infringement.

User's Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents:
${docsContext}

Return a JSON array of objects matching this format EXACTLY:
[
  {
    "id": "unique-id",
    "documentId": "ID of document (e.g. doc1)",
    "documentTitle": "Title of the document",
    "claimText": "Snippet of key claim or feature in that document",
    "ourImplementation": "How the user's idea compares or solves this problem",
    "overlapStatus": "Description of overlap (e.g. Safe / Low Overlap or Direct Infringement Risk)",
    "overlapPercent": 25, // number from 0 to 100
    "severity": "low" | "medium" | "high",
    "mitigation": "Clear, actionable technical workaround to design around the patent"
  }
]`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  return await callGemini(apiKey, contents, true);
}

/**
 * Conducts SWOT & computes category feasibility scores
 */
export async function generateSwotAndFeasibility(apiKey, documents, currentIdea) {
  const docsContext = compileDocsContext(documents);
  const prompt = `Perform a comprehensive SWOT analysis and feasibility check for the user's startup idea, synthesizing all uploaded competitor and patent materials.

User's Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents:
${docsContext}

Return a JSON object matching this structure EXACTLY:
{
  "strengths": ["Strength 1...", "Strength 2...", "Strength 3..."],
  "weaknesses": ["Weakness 1...", "Weakness 2...", "Weakness 3..."],
  "opportunities": ["Opportunity 1...", "Opportunity 2...", "Opportunity 3..."],
  "threats": ["Threat 1...", "Threat 2...", "Threat 3..."],
  "feasibility": [
    { "category": "Technical Viability", "score": 8.2, "notes": "notes explaining the score..." },
    { "category": "Legal & IP Safety", "score": 7.5, "notes": "notes explaining risk and how user's idea navigates it..." },
    { "category": "Market Potential", "score": 8.0, "notes": "notes on competition and market gaps..." },
    { "category": "Operational Feasibility", "score": 8.5, "notes": "notes on execution complexity..." }
  ]
}`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  return await callGemini(apiKey, contents, true);
}

/**
 * Generates an 8-slide Pitch Deck and a full Product Requirement Document (PRD)
 */
export async function generatePitchAndPrd(apiKey, documents, currentIdea) {
  const docsContext = compileDocsContext(documents);
  const prompt = `Based on the user's startup idea and the uploaded competitive analysis documents, generate a complete 7-slide Pitch Deck and a detailed Product Requirement Document (PRD).

User's Idea:
Title: ${currentIdea.title}
Description: ${currentIdea.description}

Uploaded Documents:
${docsContext}

Your response must be a JSON object matching this structure EXACTLY:
{
  "slides": [
    {
      "id": 1,
      "title": "[Slide 1 Title, e.g. Project AeroShield]",
      "subtitle": "[Slide 1 Subtitle, e.g. Autonomous Navigation for GPS-Denied UAVs]",
      "bullets": [
        "Bullet point 1 detailing value prop...",
        "Bullet point 2...",
        "Bullet point 3..."
      ]
    },
    // Generate exactly 7 slides: 
    // Slide 1: Cover/Vision
    // Slide 2: The Problem (citing competitor limits)
    // Slide 3: The Solution (your technology approach)
    // Slide 4: Target Market & Opportunity (citing white spaces)
    // Slide 5: Competitor Mapping & Technical Edge (why you win)
    // Slide 6: Intellectual Property (IP) Strategy (bypassing patent risks)
    // Slide 7: Product Requirements (core specs & goals)
  ],
  "prd": "# Product Requirement Document (PRD) - ${currentIdea.title}\\n\\n## 1. Executive Summary\\n[Detailed synthesis of the project and market positioning...]\\n\\n## 2. Product Objectives & Target Audience\\n[Objectives...]\\n\\n## 3. Core Features & Technical Specification\\n[Detailed sensor configurations, data flow charts, edge processing logic, etc...]\\n\\n## 4. Competitive Workarounds & Patent Compliance\\n[Direct architectural details of how this project works around competitor patents to remain compliant...]\\n\\n## 5. Success Metrics & Deployment\\n[Hardware and software validation metrics...]"
}`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  return await callGemini(apiKey, contents, true);
}
