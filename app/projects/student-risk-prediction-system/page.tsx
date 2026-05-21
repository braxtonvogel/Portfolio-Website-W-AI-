"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

export default function StudentRiskProject() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-black dark:text-white">

      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-black dark:bg-white transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK */}
      <Section>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </Section>

      {/* TITLE */}
      <Section delay={50}>
        <h1 className="text-4xl font-bold mt-6">
          Student Risk Prediction System (AI + ML Web Application)
        </h1>
        <p className="text-zinc-500 mt-2">
          Python • Scikit-learn • Streamlit • SHAP • LLM (Nova / Llama 3)
        </p>
      </Section>

      {/* GITHUB */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/student-risk-prediction-system"
          target="_blank"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* VIDEO + BACKUP BUTTON */}
      <Section delay={150}>
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Project Walkthrough
            </h2>

            <button
              onClick={() => setBackupOpen(true)}
              className="px-4 py-1 text-sm border rounded-full hover:bg-black hover:text-white transition"
            >
              Backup Video
            </button>
          </div>

          {/* YOUTUBE VIDEO */}
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/yIHErA5ikZk"
              className="w-full h-full rounded-xl border"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* BACKUP MODAL */}
      {backupOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white rounded-xl w-[90%] max-w-4xl p-4 relative">
            <button
              onClick={() => setBackupOpen(false)}
              className="absolute top-2 right-3 text-white text-xl"
            >
              ✕
            </button>

            <iframe
              src="https://drive.google.com/file/d/1nk6YAe6c4RHJKvJMVi_PR-dPCcMNP3f5/preview"
              className="w-full h-[500px] rounded-lg"
              allow="autoplay"
            />
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">Overview</h2>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          This project is a full-stack machine learning system that predicts student academic risk using behavioral and academic data from the Open University Learning Analytics Dataset (OULAD).
        </p>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          It outputs risk scores, generates intervention recommendations, and provides explainability using SHAP.
        </p>
      </Section>

      {/* VISUALS */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          Model Explainability & Interface
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <h3 className="text-lg mb-2">SHAP Interaction Analysis</h3>
            <Image
              src="/shap_interaction.png"
              alt="SHAP Plot"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>

          <div>
            <h3 className="text-lg mb-2">Web Application Interface</h3>
            <Image
              src="/websiteex.png"
              alt="Streamlit App"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>

        </div>
      </Section>

      {/* PROJECT STRUCTURE */}
      <Section delay={280}>
        <h2 className="text-2xl font-semibold mt-10 mb-4">
          Project Structure
        </h2>

        <pre className="text-xs bg-zinc-900 text-zinc-200 p-4 rounded-xl overflow-x-auto border">
{`Student Risk Prediction System/
│
├── data/
│   └── studentInfo.csv
│
├── src/
│   ├── app.py
│   ├── model.py
│   └── pipeline.py
│
├── notebooks/
│   └── 01_exploration.ipynb
│
├── requirements.txt
├── README.md
└── .gitignore`}
        </pre>
      </Section>

      {/* HOW TO RUN */}
      <Section delay={320}>
        <h2 className="text-2xl font-semibold mt-10">
          How to Run the Project
        </h2>

        <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-300">

          <p><b>1. Clone repository</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
git clone https://github.com/braxtonvogel/student-risk-prediction-system.git
cd student-risk-prediction-system
          </pre>

          <p><b>2. Create virtual environment</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
python -m venv venv
venv\Scripts\activate
          </pre>

          <p><b>3. Install dependencies</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
pip install -r requirements.txt
          </pre>

          <p><b>4. Install Ollama</b></p>
          <p>https://ollama.com/download</p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
ollama run llama3
          </pre>

          <p><b>5. Run app</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
streamlit run src/app.py
          </pre>

          <p>Open: http://localhost:8501</p>
        </div>
      </Section>

      {/* KEY FEATURES */}
      <Section delay={360}>
        <h2 className="text-2xl font-semibold mt-10">Key Features</h2>

        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-300 mt-3">
          <li>Random Forest-based prediction model</li>
          <li>Risk probability scoring system</li>
          <li>SHAP explainability analysis</li>
          <li>AI-powered intervention suggestions</li>
          <li>Streamlit dashboard interface</li>
          <li>LLM assistant (Nova / Llama 3)</li>
          <li>CSV upload + live predictions</li>
        </ul>
      </Section>

      {/* SKILLS GAINED (FULL RESTORED) */}
      <Section delay={400}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold">Skills Gained</h2>

          <div className="grid sm:grid-cols-2 gap-6 mt-4 text-zinc-600 dark:text-zinc-300">

            <div>
              <h3 className="font-semibold mb-2">Machine Learning & Data Science</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Random Forest classification models</li>
                <li>Feature engineering & dataset analysis</li>
                <li>Risk probability prediction systems</li>
                <li>Real-world dataset handling (OULAD)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI & Explainability</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>SHAP model interpretability</li>
                <li>Feature importance analysis</li>
                <li>LLM integration (Nova / Llama 3)</li>
                <li>AI-driven insight generation</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Software Engineering</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Python project architecture</li>
                <li>ML pipeline design</li>
                <li>Modular backend structure</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Web Development</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Streamlit dashboards</li>
                <li>Interactive ML web apps</li>
                <li>Real-time prediction UI</li>
              </ul>
            </div>

          </div>
        </div>
      </Section>

    </main>
  );
}