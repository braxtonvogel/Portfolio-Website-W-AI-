export interface Project {
  title: string;
  short: string;
  type: string;
  href: string;
  tech: string;
  category: "personal" | "class";
}

export const projects: Project[] = [
  {
    title: "SammyOS - Context Aware AI Productivity Platform",
    short: "SammyOS",
    type: "Personal Project",
    href: "/projects/sammyos",
    tech: "Tauri • Next.js • Rust • Zustand • Redis (Upstash) • Multi-LLM Routing",
    category: "personal",
  },
  {
    title: "Student Risk Prediction System (AI + ML + WEB APP)",
    short: "Student Risk Prediction System",
    type: "Personal Project",
    href: "/projects/student-risk-prediction-system",
    tech: "Python • Scikit-learn • Pandas • SHAP • Streamlit • LLM (Nova / Llama 3)",
    category: "personal",
  },
  {
    title: "D&D Character Builder",
    short: "D&D Character Builder",
    type: "Group Project",
    href: "/projects/dnd-builder",
    tech: "Python • Spring Boot • SQL • Database Design",
    category: "class",
  },
  {
    title: "Stateful Browser Automation Engine",
    short: "Browser Automation Engine",
    type: "Personal Project",
    href: "/projects/stateful-browser-automation-engine",
    tech: "Python • Playwright • Chromium • Session Automation",
    category: "personal",
  },
  {
    title: "Chat Server",
    short: "Chat Server",
    type: "Solo Class Project",
    href: "/projects/chat-server",
    tech: "Java • Sockets • Networking",
    category: "class",
  },
  {
    title: "File Manager UI",
    short: "File Manager UI",
    type: "Partnership Project",
    href: "/projects/file-manager-ui",
    tech: "HTML • CSS • JavaScript • UI/UX Design",
    category: "class",
  },
];

export interface Skill {
  name: string;
  href: string;
}

export const skills: { technical: Skill[]; interpersonal: Skill[]; professional: Skill[] } = {
  technical: [
    { name: "Python", href: "/projects/student-risk-prediction-system" },
    { name: "Java", href: "/projects/chat-server" },
    { name: "SQL & Relational Databases", href: "/projects/dnd-builder" },
    { name: "Client-Server Architecture", href: "/projects/chat-server" },
    { name: "Networking & Socket Programming", href: "/projects/chat-server" },
    { name: "Machine Learning (Random Forest)", href: "/projects/student-risk-prediction-system" },
    { name: "Feature Engineering", href: "/projects/student-risk-prediction-system" },
    { name: "Model Explainability (SHAP)", href: "/projects/student-risk-prediction-system" },
    { name: "Streamlit Web Apps", href: "/projects/student-risk-prediction-system" },
    { name: "Browser Automation (Playwright / Chromium)", href: "/projects/stateful-browser-automation-engine" },
    { name: "Vanilla JavaScript & DOM", href: "/projects/file-manager-ui" },
    { name: "React & Next.js Development", href: "/projects/sammyos" },
    { name: "Rust (Systems Programming)", href: "/projects/sammyos" },
    { name: "Tauri Desktop App Development", href: "/projects/sammyos" },
    { name: "Applied Cryptography & Auth Security", href: "/projects/sammyos" },
    { name: "Redis / Upstash (Caching & Rate Limiting)", href: "/projects/sammyos" },
    { name: "Multi-LLM Integration & Provider Routing", href: "/projects/sammyos" },
    { name: "Database Design", href: "/projects/dnd-builder" },
    { name: "Data Visualization (Tableau)", href: "/certifications/google-data-analytics" },
    { name: "Software Architecture", href: "/projects/dnd-builder" },
  ],
  interpersonal: [
    { name: "Teamwork & Collaboration", href: "/projects/dnd-builder" },
    { name: "Clear Technical Communication", href: "/projects/chat-server" },
    { name: "Critical Thinking", href: "/projects/student-risk-prediction-system" },
    { name: "Problem Solving & Innovation", href: "/projects/stateful-browser-automation-engine" },
    { name: "Research & Documentation", href: "/projects/student-risk-prediction-system" },
    { name: "Creative Thinking", href: "/projects/file-manager-ui" },
    { name: "Data-Driven Decision Making", href: "/projects/student-risk-prediction-system" },
    { name: "Self-Directed Project Ownership", href: "/projects/sammyos" },
    { name: "Stakeholder Communication", href: "/certifications/google-data-analytics" },
  ],
  professional: [
    { name: "GitHub Workflow", href: "/projects/stateful-browser-automation-engine" },
    { name: "System Debugging", href: "/projects/chat-server" },
    { name: "Project Documentation", href: "/projects/student-risk-prediction-system" },
    { name: "Process Automation", href: "/projects/stateful-browser-automation-engine" },
    { name: "Strategic Planning", href: "/projects/dnd-builder" },
    { name: "Report Generation", href: "/projects/student-risk-prediction-system" },
    { name: "Workflow Optimization", href: "/projects/stateful-browser-automation-engine" },
    { name: "Full-Stack Integration", href: "/projects/file-manager-ui" },
    { name: "MVC Architecture", href: "/projects/dnd-builder" },
    { name: "Security-Conscious Engineering", href: "/projects/sammyos" },
    { name: "Production Deployment & Monitoring", href: "/projects/sammyos" },
  ],
};

export const phrases = [
  "Intelligent Software Systems",
  "AI-powered Tools",
  "Modern Engineering Experiences",
  "Full-Stack Applications",
  "Automation Systems",
  "Data Science Pipelines",
];
