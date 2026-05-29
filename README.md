# AI Operations & Systems Assignment: EduOps Hub 🎓

Hey everyone! This is my project submission for the **AI Operations & Systems Assignment**. I have built a web dashboard called **EduOps Hub** to show how teachers can use AI and automation to save hours of manual grading and feedback work. 

The main goal is to show how we can take boring, repetitive tasks that teachers do every day and make them super fast using smart workflows.

---

## 🚀 What Does This Project Do?

I have divided the project into three main sections (which you can access using the tabs on the dashboard):

### 1. Workflow Studio (Task 1)
* **The Problem:** Traditionally, teachers spend hours grading paper sheets, filling Excel marks sheets, writing feedback notes by hand, and emailing parents. For 30 students, this takes almost **6.5 hours**!
* **The Solution:** An AI-powered loop. The student uploads their file online, Make.com triggers an AI model (like ChatGPT or Claude) to check the assignment against a rubric, logs the marks in Airtable automatically, and drafts a feedback email. The teacher just reviews it and clicks "Approve." This reduces the work to just **45 minutes**!
* **Flowchart:** I have added a neat, interactive system diagram inside this tab so you can see exactly how the webhook, Airtable, LLM, and Gmail connect.

### 2. EduOps Engine Simulator (Task 2)
* This is a live, working demo of the grading pipeline.
* You can select a sample student essay (or write your own) and click **"Start Grading Pipeline"**.
* You will see a black console log screen showing step-by-step progress (mimicking API requests to Airtable, LLM, and Gmail).
* Once it finishes, it generates:
  * A **Scorecard** showing marks out of 15 and detailed feedback.
  * A mock **Airtable Row** indicating what got saved to the database.
  * A pre-written **Gmail draft** ready to be sent to parents.

### 3. Rollercoaster Energy Lab (Task 3)
* A science learning resource designed for middle school kids (ages 11–14).
* **Interactive Physics Simulator:** Built a canvas-based rollercoaster simulation where students can change the hill height, friction, and gravity sliders. The cart moves based on actual physics, and bar graphs showing Potential Energy, Kinetic Energy, and Thermal Loss update in real-time.
* **Scaffolded Quiz:** Simple questions to check concepts, step-by-step math calculations with revealable hints, and a final essay question.
* **The Cool Connection:** If a student writes their essay on this page and clicks "Send to AI Grader", the app automatically copies the text, switches to the grading tab, and runs the AI pipeline!

---

## 🛠️ How to Run This Project on Your Laptop

Since I did not use any heavy frameworks like Node.js or React, you don't need to install anything! It runs on plain HTML, CSS, and JavaScript.

1. Download or clone this repository to your computer.
2. Open your terminal (Command Prompt or PowerShell).
3. Go into the project folder and run this simple Python command to start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open your web browser and go to:
   [http://localhost:8000](http://localhost:8000)

---

## 📂 Files in This Project

* `index.html` - The main dashboard page with all the tabs, forms, and layout.
* `styles.css` - Custom styles for the beautiful dark theme, glassmorphic cards, buttons, and responsive grid.
* `app.js` - Controls the tab switching, quiz checking, and the AI grading simulation log engine.
* `simulator.js` - The physics engine that calculates energy formulas and draws the rollercoaster cart on the canvas.
* `worksheet_printable.md` - A neat, printable version of the science worksheet that teachers can download or print for their class.

Hope you like this project! Please let me know if you have any questions. 😄
