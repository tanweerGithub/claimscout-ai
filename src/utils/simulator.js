/**
 * ClaimScout AI - Local Workspace Simulator
 * Enables fully reactive demo mode without requiring an active Gemini API key.
 */

export function simulateLandscape(documents, currentIdea) {
  const nodes = [
    { id: "core", label: currentIdea.title || "My Project", type: "core", x: 400, y: 250, r: 24, group: "center" }
  ];
  const links = [];
  const whiteSpaces = [
    {
      id: "ws1",
      title: "Custom Edge AI Optimization",
      description: `Opportunity to run lightweight offline models optimized for ${currentIdea.title || "the project"}, bypassing complex server-dependent competitors.`,
      x: 400,
      y: 370
    },
    {
      id: "ws2",
      title: "Niche Specialized Application",
      description: `Tailoring the technology specifically for the ${currentIdea.title || "project"} domain, bypassing general-purpose alternatives.`,
      x: 400,
      y: 130
    }
  ];

  // Distribute other nodes in a circle around core (reduced radius to avoid boundaries)
  documents.forEach((doc, idx) => {
    const angle = (idx * 2 * Math.PI) / documents.length;
    const x = Math.round(400 + 175 * Math.cos(angle));
    const y = Math.round(250 + 130 * Math.sin(angle));
    
    const nodeType = doc.type || "patent";
    const groupName = doc.author ? doc.author.toLowerCase().replace(/[^a-z0-9]/g, "") : "general";

    nodes.push({
      id: doc.id,
      label: doc.title.length > 30 ? doc.title.slice(0, 27) + "..." : doc.title,
      type: nodeType,
      x: x,
      y: y,
      r: nodeType === "patent" ? 16 : 18,
      group: groupName
    });

    links.push({
      source: "core",
      target: doc.id,
      relation: nodeType === "patent" ? "Claim overlap (Low)" : "Competitor Alternative",
      type: nodeType === "patent" ? "low-risk" : "competitor"
    });
  });

  // Add subtech connections if there are nodes
  if (nodes.length > 2) {
    // Add 2 tech cluster nodes on outer borders
    nodes.push({ id: "tech_sim_1", label: "Core Algorithms", type: "tech", x: 140, y: 90, r: 10, group: "tech" });
    nodes.push({ id: "tech_sim_2", label: "Integrated Interfaces", type: "tech", x: 660, y: 410, r: 10, group: "tech" });

    links.push({ source: nodes[1].id, target: "tech_sim_1", relation: "Implements", type: "tech" });
    links.push({ source: nodes[2].id, target: "tech_sim_2", relation: "Implements", type: "tech" });
  }

  return { nodes, links, whiteSpaces };
}

export function simulateRisks(documents, currentIdea) {
  if (documents.length === 0) return [];
  
  return documents.map((doc, idx) => {
    const isPatent = doc.type === 'patent';
    const severity = idx % 3 === 0 ? 'medium' : (idx % 3 === 1 ? 'low' : 'high');
    const overlapPercent = severity === 'high' ? 75 : (severity === 'medium' ? 45 : 15);
    const docShortTitle = doc.title.split(':')[0] || doc.title;
    
    return {
      id: `sim_risk_${doc.id}`,
      documentId: doc.id,
      documentTitle: doc.title,
      claimText: isPatent 
        ? `Claim 1: A method and apparatus for implementing ${docShortTitle} using localized sensor inputs.`
        : `Product feature: Competitor implementation of high-performance processing pipelines.`,
      ourImplementation: `"${currentIdea.title || "My Project"}" implements a customized visual software pipeline running locally, which avoids standard hardware traps.`,
      overlapStatus: isPatent 
        ? (severity === 'high' ? 'Warning / Potential Overlap' : 'Safe / Low Overlap')
        : 'Direct Competitor (Alternative approach)',
      overlapPercent: overlapPercent,
      severity: severity,
      mitigation: isPatent 
        ? `Architect around this by explicitly decoupling local data storage and using proprietary mathematical transforms.`
        : `Differentiate by focusing on cost efficiency, ease of deployment, and open-source API standards.`
    };
  });
}

export function simulateSwot(documents, currentIdea) {
  const title = currentIdea.title || "My Project";
  
  return {
    strengths: [
      `Innovative approach targeting: "${title}"`,
      "Low capital requirement compared to established players",
      "Software-driven architecture enabling rapid upgrades"
    ],
    weaknesses: [
      "Early-stage product roadmap requiring extensive field testing",
      "Lack of existing patent defenses compared to large corporations",
      "Needs specialized optimization for edge deployment"
    ],
    opportunities: [
      "Untapped markets looking for affordable open integrations",
      "Partnerships with research universities and developer communities",
      "Licensing software components directly to industrial partners"
    ],
    threats: [
      "Fast-moving competitors cloning core software functions",
      "Established incumbents filing aggressive broad patents",
      "Market adoption delays due to trust in legacy hardware brands"
    ],
    feasibility: [
      { category: "Technical Viability", score: 8.2, notes: "Highly feasible using modern software libraries, though optimization is required." },
      { category: "Legal & IP Safety", score: 7.5, notes: "Requires clean documentation to verify software workarounds." },
      { category: "Market Potential", score: 8.0, notes: "Fills a significant cost gap in the current landscape." },
      { category: "Operational Feasibility", score: 8.5, notes: "Uses off-the-shelf development tools; deployment is fully automated." }
    ]
  };
}

export function simulateSlides(documents, currentIdea) {
  const title = currentIdea.title || "My Project";
  const desc = currentIdea.description || "An innovative technology solution.";
  
  return [
    {
      id: 1,
      title: title,
      subtitle: "Revolutionizing Tech Landscapes",
      bullets: [
        "A proprietary software-first approach to solving critical industry bottlenecks.",
        "Unlocking performance without expensive specialized hardware.",
        "Designed from the ground up for seamless compatibility."
      ]
    },
    {
      id: 2,
      title: "The Problem",
      subtitle: "High Costs & Complex Patents",
      bullets: [
        "Current market solutions are prohibitively expensive and hard to integrate.",
        "Incumbents lock developers in with restrictive proprietary patents.",
        "General-purpose products fail to meet localized niche needs."
      ]
    },
    {
      id: 3,
      title: "Our Solution",
      subtitle: `Introducing ${title}`,
      bullets: [
        desc.length > 100 ? desc.slice(0, 100) + "..." : desc,
        "Fuses low-cost components with advanced software-defined algorithms.",
        "Fully auditable codebase ensuring maximum IP safety and independence."
      ]
    },
    {
      id: 4,
      title: "Market Opportunity",
      subtitle: "Capturing Unserved Segments",
      bullets: [
        "Initial focus on research teams, startups, and mid-sized enterprises.",
        "Providing an entry-level tier that scales dynamically with enterprise growth.",
        "Licensing opportunities across aerospace, logistics, and consumer tech."
      ]
    },
    {
      id: 5,
      title: "IP Strategy",
      subtitle: "Bypassing Incumbent Patents",
      bullets: [
        "Systematic claim audits conducted against major industry filings.",
        "Clear documentation of design workarounds to protect customer integrations.",
        "Proactive filing of core software algorithms as defensive trade secrets."
      ]
    },
    {
      id: 6,
      title: "Product Roadmap",
      subtitle: "Next Steps & Launch Plan",
      bullets: [
        "Q3: Developer beta release and sandbox API testing.",
        "Q4: Core algorithm validation and third-party security audit.",
        "Q1: Launch of production-grade commercial tiers."
      ]
    }
  ];
}

export function simulatePrd(documents, currentIdea) {
  const title = currentIdea.title || "My Project";
  const desc = currentIdea.description || "";
  
  return `# Product Requirement Document (PRD) - ${title}

## 1. Executive Summary
This document specifies the technical requirements for ${title}. The goal is to build an independent, cost-effective tech solution satisfying:
- Description: ${desc}
- Platform: Cross-platform deployment.

## 2. Competitive Alignment
Based on our landscape audit, ${title} will distinguish itself by:
- Pure software execution to bypass hardware patents.
- Utilizing edge-AI optimizations for low latency.

## 3. Technical Requirements
### 3.1 Core Architecture
The system must compile as a modular React/Vite web application and integrate lightweight client-side processing.
### 3.2 Security & Data
All reference materials are audited locally. Custom API keys are encrypted at-rest using browser localStorage.

## 4. Release Criteria
- Code must pass 100% build checks.
- Visual canvas maps must render edge-to-edge with no overlap.`;
}
