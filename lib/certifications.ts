export interface CertSegment {
  title: string;
  description: string;
  details?: string; // shown when the segment is expanded; falls back to description if omitted
  skills?: string[]; // shown as tags in the expanded view
}

export interface Certification {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  summary: string;
  segments: CertSegment[];
}

export const certifications: Certification[] = [
  {
    slug: "google-data-analytics",
    title: "Google Data Analytics Professional Certificate",
    image: "/certifications/google-data-analytics.png",
    tags: ["SQL", "Data Cleaning", "Visualization", "R"],
    summary:
      "A 9-course professional certificate covering the full data analytics lifecycle, from asking the right questions to communicating insights with real tools used by working analysts.",
    segments: [
      {
        title: "Foundations: Data, Data, Everywhere",
        description:
          "Introduction to the data analytics process: ask, prepare, process, analyze, share, act.",
        details:
          "Built a working mental model of how professional analysts approach ambiguous problems — mapping the full analytics lifecycle and applying it to real business scenarios from day one.",
        skills: ["Analytics Lifecycle", "Spreadsheet Basics", "Analytical Thinking", "Data Ecosystem"],
      },
      {
        title: "Ask Questions to Make Data-Driven Decisions",
        description:
          "Structured thinking, stakeholder communication, and problem definition.",
        details:
          "Practiced turning vague, high-level business requests into precise, answerable analytical questions — the same skill that separates junior analysts from ones stakeholders trust with ambiguous asks.",
        skills: ["Stakeholder Communication", "Problem Scoping", "Structured Thinking", "SMART Questions"],
      },
      {
        title: "Prepare Data for Exploration",
        description:
          "Data types, data bias, data ethics, and working with spreadsheets.",
        details:
          "Learned to critically evaluate a dataset before ever running an analysis — spotting sampling bias, privacy risk, and credibility issues that lead less-trained analysts to confidently wrong conclusions.",
        skills: ["Data Bias Detection", "Data Ethics", "Data Types", "Spreadsheet Organization"],
      },
      {
        title: "Process Data from Dirty to Clean",
        description:
          "SQL fundamentals, data cleaning techniques, and verification workflows.",
        details:
          "Wrote production-style SQL in BigQuery to clean, filter, and validate messy real-world datasets, and built repeatable verification workflows to catch errors before they reach a report.",
        skills: ["SQL", "BigQuery", "Data Cleaning", "Data Verification"],
      },
      {
        title: "Analyze Data to Answer Questions",
        description:
          "Organizing and formatting data, aggregating with SQL, and identifying trends.",
        details:
          "Used SQL joins, aggregations, and window-style logic to pull meaningful trends out of large tables, turning raw rows into insights ready for decision-makers.",
        skills: ["SQL Joins", "Aggregation", "Trend Analysis", "Data Organization"],
      },
      {
        title: "Share Data Through the Art of Visualization",
        description:
          "Data visualization principles, Tableau dashboards, and presenting findings.",
        details:
          "Designed interactive Tableau dashboards with an eye for clarity over decoration — applying core visualization principles to make findings land with non-technical stakeholders in seconds, not minutes.",
        skills: ["Tableau", "Dashboard Design", "Data Storytelling", "Visualization Principles"],
      },
      {
        title: "Data Analysis with R Programming",
        description:
          "R syntax, RStudio, tidyverse packages, and reproducible analysis.",
        details:
          "Programmed end-to-end analyses in R using the tidyverse (dplyr, ggplot2) inside RStudio, producing fully reproducible reports instead of one-off spreadsheet work.",
        skills: ["R", "RStudio", "Tidyverse", "Reproducible Analysis"],
      },
      {
        title: "Capstone: Complete a Case Study",
        description:
          "End-to-end analysis of a real-world dataset, from cleaning to final presentation.",
        details:
          "Independently owned a full case study start to finish — scoped the business task, cleaned and analyzed real data, and delivered a polished final presentation with actionable recommendations, now a live portfolio piece.",
        skills: ["End-to-End Analysis", "Case Study Design", "Portfolio Presentation", "Executive Reporting"],
      },
      {
        title: "Accelerate Your Job Search with AI",
        description:
          "Applying AI tools to resumes, elevator pitches, and job search strategy.",
        details:
          "Learned to use AI tools like Gemini strategically across the job search — sharpening a resume, drafting a compelling elevator pitch, and building a structured search plan aimed at data analytics roles.",
        skills: ["Prompt Engineering", "Resume Optimization", "AI-Assisted Search", "Career Strategy"],
      },
    ],
  },
];