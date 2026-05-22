export type Project = {
  title: string;
  href: string;
  type: string;
  tech: string[];   // 👈 FIXED
  skills: string[];
};

export const projects: Project[] = [
  {
    title: "Student Risk Prediction System (AI + ML + WEB APP)",
    type: "Personal Project",
    href: "/projects/student-risk-prediction-system",
    tech: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "Streamlit",
      "LLM (Nova / Llama 3)"
    ],
    skills: [
      "Python",
      "Machine Learning",
      "Random Forest",
      "Data Analysis",
      "Feature Engineering",
      "Streamlit",
    ],
  },
  {
    title: "D&D Character Builder",
    type: "Group Project",
    href: "/projects/dnd-builder",
    tech: ["Python", "Spring Boot", "SQL", "Database Design"],
    skills: [
      "Python",
      "Spring Boot",
      "SQL",
      "Database Design",
      "MVC Architecture",
    ],
  },
  {
    title: "Stateful Browser Automation Engine",
    type: "Personal Project",
    href: "/projects/stateful-browser-automation-engine",
    tech: ["Python", "Playwright", "Chromium", "Session Automation"],
    skills: [
      "Python",
      "Playwright",
      "Chromium Automation",
      "Process Automation",
    ],
  },
  {
    title: "Chat Server",
    type: "Personal Project",
    href: "/projects/chat-server",
    tech: ["Java", "Sockets", "Networking"],
    skills: [
      "Java",
      "Sockets",
      "Client-Server Architecture",
      "Networking",
      "System Debugging",
    ],
  },
  {
    title: "File Manager UI",
    type: "Partnership Project",
    href: "/projects/file-manager-ui",
    tech: ["HTML", "React", "UI/UX", "Frontend Design"],
    skills: [
      "React",
      "UI/UX",
      "Frontend Development",
      "Full-Stack Integration",
    ],
  },
];