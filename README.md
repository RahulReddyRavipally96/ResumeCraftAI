# ResumeCraft AI
A full-stack resume and cover letter generator built with React + Flask + OpenAI.

## Description

ResumeCraft AI helps users create tailored, ATS-friendly resumes and personalized cover letters based on job descriptions. Users can upload existing resumes, maintain a profile, and chat with an AI assistant to fine-tune their application materials.

---

## 🛠️ How to Run the App

### Step 1. **Clone the repository**
```bash
git clone https://github.com/your-username/ResumeCraftAI.git
cd ResumeCraftAI
```
### Step 2. **Add Your OpenAI API Key**
Open `app.py` and replace `line 30`:
```
client = OpenAI(api_key="YOUR_API_KEY_HERE")
```
### Step 3. **Run the Backend (Python Flask)**
```bash
# Create and activate a virtual environment
python -m venv venv

# On Windows:
   venv\Scripts\activate

# On macOS and Linux:
   source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# If you face proxy issues:
pip install httpx==0.27.2

# Start the Flask server
python app.py
```

### Step 4. Run the Frontend (React)

```bash
npm install
npm run dev
```
Your app will be live at:  
🌐 [http://localhost:8080](http://localhost:8080)

---

### 👨‍💻 How to use the App

Since this is a demo:

- **Username**: `user001`  
- **Password**: `pass001`

#### Steps:
1. Log in using the demo credentials.
2. Fill out your profile — add name, email, LinkedIn, education, work experience, and skills.
3. Head to the **Resume Generator** tab:
   - Paste your target job title and job description.
   - Upload an existing resume (docx) to include additional information.
4. Click **Generate Resume & Cover Letter**.
5. Edit or fine-tune the generated content directly or using the **Chat with AI Assistant**.
6. Download as **PDF** or **DOCX**, or **Save to your profile**.

---
### 📦 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS  
- **Backend**: Python + Flask + OpenAI API  
- **PDF & DOCX Generation**: ReportLab, python-docx  
- **State & Storage**: JSON files (can be extended to DB later)

---

### 📌 Notes
- All AI generations are based on **OpenAI's gpt-4o-mini**.
- Your profile and chat history are stored **locally in JSON format**.
---

### 🧠 Next Steps (Future Scope)

- [ ] Add user authentication and role-based access.
- [ ] Migrate from JSON files to a proper database (e.g., Firebase, PostgreSQL).
- [ ] Support multiple resume templates.
- [ ] Integrate AI-based feedback scoring for resumes and cover letters.
- [ ] Agent AI – Enable true automation beyond responses:
  - Let users give natural language commands like "Format my resume like my uploaded version."
  - Use custom backend code to parse and apply formatting (not handled by OpenAI).
  - Orchestrate multiple API calls based on inferred user intent.
---

### 📄 License
**MIT License** — feel free to use, modify, and contribute!

---

### 👥 Authors

- Sandoval Carpio, Adrian  
- Ravipally, Rahul Reddy  
- Mammadov, Shahbaba  
- Singh, Medha

