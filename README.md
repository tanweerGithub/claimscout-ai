# ClaimScout AI 🚀
### *Smart Patent Intelligence & Technology Alignment Assistant*

ClaimScout AI is an interactive, client-side intelligence dashboard designed for founders, intellectual property (IP) strategists, and product managers. It automates the process of analyzing startup product summaries against patent databases, competitor websites, and technical references to ensure product defensibility and map market opportunities.

---

## 💡 Why ClaimScout AI? (The Use Case)
When launching a new technology or product, founders and researchers face two major challenges:
1. **Patent Infringement Risks**: Accidentally duplicating prior claims, leading to expensive legal disputes.
2. **Market Defensibility**: Finding "white spaces" (unoccupied technical opportunities) where they can build proprietary, patentable value.

ClaimScout AI processes complex, unstructured legal filings and technical datasheets using Google Gemini 2.5 Flash, turning them into a visual, interactive technology map, structured risk matrix, slides, SWOT grids, and a conversational research workspace.

---

## 🛠️ Exploring the Workspace Tabs

### 1. 🗺️ Tech Landscape Map
A 2D cluster map mapping existing competitors and patents to identify patent white spaces.
* **X-Axis (Horizontal)**: *Technical Focus* (Hardware & Systems on the left ↔ Software, Algorithms & Services on the right).
* **Y-Axis (Vertical)**: *Market Focus* (Consumer & Product-level targets on the bottom ↔ Enterprise, Industrial & Infrastructure scope on the top).
* **Nodes**: Mapped entities (Purple: Patents, Amber: Competitors, Blue: Your Core Project). Closer nodes represent higher technical similarity and overlap.
* **GAP Bubbles (Cyan)**: Positioned in unoccupied regions where there are no existing nodes. These represent **patent white spaces** (unexplored product-market niches) which your startup can target to avoid head-to-head competition.
* **Details Drawer**: Clicking any bubble slides up a full-width bottom drawer containing direct claim connections, coordinate locations, and opportunity analysis.

### 2. 🛡️ Patent Claims (Risk Assessment)
Extracts claims and analyzes patent risks.
* Groups identified claims into **High**, **Medium**, and **Low** risk categories.
* Compares your technology description directly to active prior art claims, providing legal risk explanations and suggesting defensive workarounds.

### 3. 📊 Pitch & PRD Generator
Converts patent and technical research into business assets:
* **Pitch Deck**: A presentation deck highlighting your technical value proposition, competitive advantages, and market defensibility.
* **PRD (Product Requirements Document)**: A structured roadmap outlining specifications, technical constraints, and system boundaries designed to bypass identified patent conflicts.

### 4. 📐 SWOT Canvas
A matrix detailing the **Strengths, Weaknesses, Opportunities, and Threats** of your technology stack, backed by an AI-generated technical viability score and strategic roadmap recommendations.

---

## 🤖 Chat Intelligence Personas
The right-hand pane provides an interactive chat helper which acts on your uploaded documents. You can switch between two distinct personas:

### 1. 🧭 ClaimScout Co-Pilot (Your Research Partner)
* **What it means**: An assistive AI agent that acts as a collaborative patent research partner.
* **How to use it**: Use it to summarize long patent texts, draft patent claims for your startup, write software/hardware workarounds, or find specific references in your library.

### 2. ⚖️ VC Critic (The Skeptical Auditor)
* **What it means**: A strict, skeptical Venture Capital technical auditor who evaluates your defensibility.
* **How to use it**: Use it to stress-test your startup concept. The VC Critic will actively grill your technical summary, point out competitor advantages, expose potential patent infringement overlaps, and challenge your product-market fit.

---

## 🚀 Getting Started & How to Use the Demos

### Step 1: Provide an API Key
Click **API Settings** (Key icon, top-right) and enter a Google Gemini API key from Google AI Studio. 
* *Supported Formats*: Traditional AI Studio keys (starting with `AIzaSy`) and GCP-associated keys (starting with `AQ.`).

### Step 2: Try the Demos (Upload from Scratch)
You can try out the application immediately using the pre-packaged demo documents in the [demo_docs](file:///Users/Tanweer/Documents/Me/wksp/antigravity/gfg-doc-assistant/demo_docs/) folder:

1. **BurgerBot (Consumer & Robotic Fast-Food Vending)**:
   * Location: [demo_docs/burgerbot](file:///Users/Tanweer/Documents/Me/wksp/antigravity/gfg-doc-assistant/demo_docs/burgerbot/)
   * Files: Upload `burgerbot_patents.txt` (patents on automated cooking) and `burgerbot_competitors.txt` (competitor robotic kiosk specs).
   * Enter a concept like: *"An automated burger vending kiosk that grinds beef, cooks patties using smart induction, assembles toppings, and dispenses burgers in under 2 minutes."*
   * Click **Save & Update**, then click **Regenerate Landscape** to watch the workspace sync!

2. **AeroShield (LiDAR & Drone Collision Avoidance)**:
   * Location: [demo_docs/aeroshield](file:///Users/Tanweer/Documents/Me/wksp/antigravity/gfg-doc-assistant/demo_docs/aeroshield/)
   * Files: Upload LiDAR patent claims and technical datasheets.
   * Enter a concept like: *"A solid-state LiDAR sensor array for micro-UAV collision avoidance using neural network distance predictions."*

---

## 💻 Local Development & Deployment

### Run Locally
```bash
# Install dependencies
npm install

# Start Vite local development server (runs on http://localhost:5173)
npm run dev
```

### Production Build
```bash
# Compiles code into highly optimized static assets under the /dist folder
npm run build
```

### Vercel Serverless Function Proxy
To prevent browser CORS preflight blocks when using GCP-associated keys, the production deployment routes all client-side calls through a Vercel Serverless Function (`api/proxy.js`). 
* In production, requests go to `/api/proxy`.
* Locally, the app automatically falls back to direct browser-to-Google API calls, ensuring a zero-configuration local setup.
