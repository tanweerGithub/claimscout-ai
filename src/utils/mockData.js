export const mockIdea = {
  title: "Project AeroShield",
  description: "An autonomous drone navigation and collision avoidance system designed to operate in GPS-denied environments (e.g. underground tunnels, dense urban forests) using edge AI, optical flow, and low-latency LiDAR sensor fusion."
};

export const mockDocuments = [
  {
    id: "doc1",
    type: "patent",
    title: "US-1049283-B2: Ultrasonic Obstacle Avoidance for Micro-UAVs",
    author: "Shenzhen Aero-Tech",
    year: "2021",
    summary: "A patent covering ultrasonic sensor arrays arranged radially around a micro-UAV to measure proximity to walls and generate avoidance vectors. Focuses on low-cost hardware and threshold-based triggers in indoor environments.",
    content: "Claim 1: A system for micro-UAV stabilization comprising: an array of at least 8 ultrasonic transceivers mounted radially around the perimeter of a vehicle chassis; a microcontroller configured to query each sensor at a frequency of at least 40Hz; and a feedback loop that overrides user roll and pitch commands when a distance reading falls below 1.5 meters..."
  },
  {
    id: "doc2",
    type: "patent",
    title: "US-1182734-A1: Multi-Agent Drone Swarm Coordination via UWB",
    author: "MIT Robotics Lab",
    year: "2023",
    summary: "Describes an ultra-wideband (UWB) relative positioning system where multiple UAVs calculate mutual distances dynamically to maintain a flocking formation without centralized GPS coordinates. Focuses on collaborative mapping.",
    content: "Claim 1: A method for relative spatial coordination among a plurality of unmanned aerial vehicles (UAVs) comprising: transmitting ultra-wideband pulses between at least three nodes in a swarm; calculating time-of-flight ranges; and applying a decentralized virtual-spring force model to dynamically recalculate collision-free trajectory vectors..."
  },
  {
    id: "doc3",
    type: "competitor",
    title: "SkyAvoid Inc. (Product Specification & Datasheet)",
    author: "SkyAvoid Corp",
    year: "2024",
    summary: "SkyAvoid sells the 'SA-Pulse 2', a commercial hardware plug-in for drones. It uses a spinning solid-state LiDAR (20m range) and a proprietary onboard algorithm that runs on a custom FPGA. Extremely expensive ($3,200 per unit).",
    content: "Product Description: SA-Pulse 2 provides a plug-and-play collision avoidance kit. Weight: 140g. Sensor: Solid-state LiDAR, 360-degree horizontal field-of-view, 15-degree vertical field-of-view. Power: 12W. Integration: Pixhawk autopilot via CAN bus. Uses a custom FPGA module running spatial clustering algorithms to identify trees, walls, and human obstacles."
  },
  {
    id: "doc4",
    type: "competitor",
    title: "GeoNav Technologies (Press Release & Patent filings)",
    author: "GeoNav Labs",
    year: "2023",
    summary: "GeoNav develops software-only visual SLAM (Simultaneous Localization and Mapping) utilizing dual stereo cameras. It maps environments in real-time but struggles in low-light, fog, or dust-filled tunnels.",
    content: "Technology Summary: GeoNav SLAM Core v4 offers real-time visual-inertial odometry (VIO) using dual stereoscopic cameras and an IMU. Computes sparse point clouds to navigate unknown layouts. Requires active illumination (>50 lux) and high-power processors (Jetson Orin Nano). Fails to resolve thin obstacles like power lines or wire meshes."
  }
];

export const mockLandscapeData = {
  nodes: [
    // Core Focus Nodes
    { id: "core", label: "AeroShield (Our Project)", type: "core", x: 250, y: 200, r: 24, group: "center" },
    
    // Patent Nodes
    { id: "pat1", label: "US-1049283-B2 (Ultrasonic Array)", type: "patent", x: 120, y: 120, r: 16, group: "ultrasonic" },
    { id: "pat2", label: "US-1182734-A1 (UWB Swarms)", type: "patent", x: 380, y: 120, r: 16, group: "swarm" },
    
    // Competitor Nodes
    { id: "comp1", label: "SkyAvoid SA-Pulse (LiDAR FPGA)", type: "competitor", x: 120, y: 280, r: 18, group: "lidar" },
    { id: "comp2", label: "GeoNav SLAM (Stereo Vision)", type: "competitor", x: 380, y: 280, r: 18, group: "vision" },
    
    // Tech Area Clusters (represented as smaller auxiliary nodes)
    { id: "tech_ultrasonic", label: "Ultrasonic Proximity", type: "tech", x: 50, y: 70, r: 10, group: "ultrasonic" },
    { id: "tech_uwb", label: "UWB Ranging", type: "tech", x: 450, y: 70, r: 10, group: "swarm" },
    { id: "tech_lidar", label: "LiDAR Point Clouds", type: "tech", x: 50, y: 330, r: 10, group: "lidar" },
    { id: "tech_vision", label: "Visual SLAM", type: "tech", x: 450, y: 330, r: 10, group: "vision" }
  ],
  links: [
    { source: "core", target: "pat1", relation: "Claim overlap (Low)", type: "low-risk" },
    { source: "core", target: "pat2", relation: "Architectural alignment (Low)", type: "low-risk" },
    { source: "core", target: "comp1", relation: "Hardware alternative", type: "competitor" },
    { source: "core", target: "comp2", relation: "Sensor fusion complement", type: "competitor" },
    { source: "pat1", target: "tech_ultrasonic", relation: "Uses", type: "tech" },
    { source: "pat2", target: "tech_uwb", relation: "Uses", type: "tech" },
    { source: "comp1", target: "tech_lidar", relation: "Uses", type: "tech" },
    { source: "comp2", target: "tech_vision", relation: "Uses", type: "tech" }
  ],
  whiteSpaces: [
    {
      id: "ws1",
      title: "Low-Light / Dust Active Sensor Fusion",
      description: "Combining solid-state LiDAR with optical flow navigation. None of the competitors function in high-dust/dark mining tunnels or emergency scenarios where cameras fail and high-cost LiDAR is prohibitive. AeroShield fills this by fusing cheap solid-state LiDAR (under $200) with infrared-illuminated optical flow.",
      x: 250,
      y: 350
    },
    {
      id: "ws2",
      title: "Edge-AI Onboard Claim Bypass",
      description: "Running lightweight CNN-based obstacle segmentation models directly on STM32 or low-end Raspberry Pi microprocessors, bypassing patented expensive hardware (like SkyAvoid's custom FPGA or GeoNav's Jetson Orin Nano).",
      x: 250,
      y: 60
    }
  ]
};

export const mockRiskAssessment = [
  {
    id: "risk1",
    documentId: "doc1",
    documentTitle: "US-1049283-B2 (Ultrasonic Array)",
    claimText: "Claim 1: Radial array of 8+ ultrasonic transceivers querying at 40Hz+ for roll/pitch override.",
    ourImplementation: "AeroShield uses front/back solid-state micro-LiDAR (2 sensors) and an infrared camera, running an optical flow algorithm. No ultrasonic sensors are deployed.",
    overlapStatus: "Safe / Low Overlap",
    overlapPercent: 10,
    severity: "low",
    mitigation: "Ensure product descriptions explicitly state the absence of ultrasonic ranging devices and emphasize reliance on optical-flow and optical LiDAR."
  },
  {
    id: "risk2",
    documentId: "doc2",
    documentTitle: "US-1182734-A1 (UWB Swarms)",
    claimText: "Claim 1: Decentrailzed virtual-spring coordination among multiple drones utilizing UWB ranging.",
    ourImplementation: "AeroShield is a single-drone navigation system and does not implement multi-agent swarm networking. (Future versions might run multi-agent coordination).",
    overlapStatus: "Safe / Low Overlap",
    overlapPercent: 5,
    severity: "low",
    mitigation: "Clarify that AeroShield acts as an autonomous localized pilot. If swarming features are added, use WiFi-based RSSI or visual tracking rather than UWB pulses to dodge the patent claims."
  },
  {
    id: "risk3",
    documentId: "doc3",
    documentTitle: "SkyAvoid Inc. (LiDAR FPGA)",
    claimText: "Competitor Tech: Solid-state 360-degree LiDAR running spatial clustering on onboard FPGA ($3,200).",
    ourImplementation: "AeroShield uses an ultra-cheap micro-LiDAR sensor fused with an optical flow camera. Processing is done via software on a lightweight microcontroller (ARM Cortex), not an FPGA.",
    overlapStatus: "Direct Competitor (Medium Risk)",
    overlapPercent: 65,
    severity: "medium",
    mitigation: "Patent claims on FPGAs do not cover microprocessor-based software. Document our software-based spatial clustering algorithms as proprietary open-source or trade-secret, distinct from hardware FPGAs."
  }
];

export const mockSwot = {
  strengths: [
    "Cheap sensor bill of materials (BOM under $150 compared to SkyAvoid's $3,200)",
    "Fuses optical flow + solid-state LiDAR for cross-condition reliability (darkness, dust, glass)",
    "Pure software implementation running on standard low-power microcontrollers"
  ],
  weaknesses: [
    "Lower field of view compared to spinning 360-degree LiDAR systems",
    "Requires high computational efficiency on low-end CPUs",
    "Requires calibration of optical flow sensors based on ground textures"
  ],
  opportunities: [
    "Unexplored market in mining shafts, search & rescue, and indoor warehouse mapping",
    "Partner with search-and-rescue UAV operators who need low-cost sacrificial drones",
    "Licensing the sensor-fusion software stack directly to enterprise drone manufacturers"
  ],
  threats: [
    "Competitors lowering the cost of LiDAR hardware",
    "Emergence of high-performance event-based neuromorphic cameras",
    "Rapid filing of software SLAM patents by large aerospace corporations"
  ],
  feasibility: [
    { category: "Technical Viability", score: 8.5, notes: "Requires optimization of point-cloud clustering on microcontrollers, but prototype matches specs." },
    { category: "Legal & IP Safety", score: 9.0, notes: "Avoids major hardware patent claims by relying on custom software pipelines rather than FPGAs or ultrasonic sensor grids." },
    { category: "Market Potential", score: 7.8, notes: "Fills a significant cost gap, though enterprise clients might favor established brands initially." },
    { category: "Operational Feasibility", score: 8.0, notes: "Uses off-the-shelf components; assembly and calibration are easily scriptable." }
  ]
};

export const mockSlides = [
  {
    id: 1,
    title: "Project AeroShield",
    subtitle: "Next-Gen Autonomous GPS-Denied Drone Navigation",
    bullets: [
      "GPS-denied environments (caves, warehouses, urban jungles) pose a critical navigation challenge.",
      "Existing solutions are either too expensive ($3k+) or fail in low-light and high-dust scenarios.",
      "AeroShield introduces an affordable, sensor-fused software suite for reliable collision avoidance."
    ]
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "High Cost & Sensor Failures",
    bullets: [
      "LiDAR systems (SkyAvoid) are highly accurate but prohibitively expensive and bulky.",
      "Visual SLAM systems (GeoNav) fail in low-light, dust, or smoke (fire/rescue missions).",
      "Ultrasonic arrays (US-1049283-B2) have extremely short range and high noise interference."
    ]
  },
  {
    id: 3,
    title: "The Solution",
    subtitle: "Low-Cost, Dust-Resistant Sensor Fusion",
    bullets: [
      "Fused Optical Flow & Solid-State Micro-LiDAR running proprietary clustering algorithms.",
      "Infrared active illumination enables navigation in complete darkness.",
      "Lightweight software architecture that runs directly on cheap ARM Cortex processors."
    ]
  },
  {
    id: 4,
    title: "Technology Stack",
    subtitle: "Hardware-Agnostic Software Architecture",
    bullets: [
      "Sensors: 1x PMW3901 Optical Flow, 2x VL53L1X micro-LiDAR modules ($30 total cost).",
      "Core Algorithm: EKF (Extended Kalman Filter) state estimator and radial clustering.",
      "Framework: Built on FreeRTOS for microsecond hardware scheduling."
    ]
  },
  {
    id: 5,
    title: "Competitive Landscape",
    subtitle: "Defining the White Spaces",
    bullets: [
      "SkyAvoid: Costly ($3,200), hardware-locked (FPGA), fails in narrow corridors.",
      "GeoNav SLAM: Poor in dark/dust environments, requires heavy processing (Jetson Orin).",
      "AeroShield: Sub-$150 BOM, works in darkness and dust, lightweight software."
    ]
  },
  {
    id: 6,
    title: "Intellectual Property Strategy",
    subtitle: "Bypassing Competitor Patents",
    bullets: [
      "Avoids ultrasonic patents by utilizing infrared camera flows.",
      "Maintains software-only claims (trade secret or copyright) to avoid hardware FPGA patent overlap.",
      "Creates novel claim space for 'low-cost infrared optical flow sensor-fusion tracking'."
    ]
  },
  {
    id: 7,
    title: "Product Requirement Document (PRD) Summary",
    subtitle: "Key Specifications & Constraints",
    bullets: [
      "Weight: Sensor payload must be under 40 grams.",
      "Power consumption: Less than 1.5 Watts (maximizing drone flight time).",
      "Avoidance accuracy: Detect wire mesh and tree branches at a distance of 3.5 meters."
    ]
  }
];
