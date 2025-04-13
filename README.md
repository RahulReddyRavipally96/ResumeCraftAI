<<<<<<< HEAD
# ResumeCraft
=======

# ResumeCraft

This is a Flask API for generating resumes and cover letters based on user profiles and job descriptions.

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd resume-generator-api
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS and Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the API

Start the Flask development server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Generate Resume
- **URL**: `/api/resume/generate`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "jobTitle": "Software Engineer",
    "jobDescription": "Job description here...",
    "education": [...],
    "workExperience": [...],
    "skills": [...],
    "existingResumeFormat": "Optional existing resume for formatting"
  }
  ```
- **Response**: Generated resume and cover letter content

### Get User Profile
- **URL**: `/api/profile`
- **Method**: GET
- **Response**: User profile data including education, work experiences, skills, and saved documents

### Update User Profile
- **URL**: `/api/profile/update`
- **Method**: POST
- **Request Body**: Profile data to update
- **Response**: Success message

### Update Education Entry
- **URL**: `/api/profile/education/:id/update`
- **Method**: POST
- **Request Body**: Education data to update
- **Response**: Success message

### Update Work Experience Entry
- **URL**: `/api/profile/experience/:id/update`
- **Method**: POST
- **Request Body**: Experience data to update
- **Response**: Success message

### Download Document
- **URL**: `/api/document/download`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "content": "Document content in markdown format",
    "fileName": "FileName",
    "format": "pdf" or "docx"
  }
  ```
- **Response**: File download

## Features

- Generate professional resumes and cover letters
- Upload existing resumes to maintain formatting
- Edit generated documents before saving
- Download documents in PDF or Word format
- Store and edit multiple education and work experience entries

## Additional Python Dependencies

For document generation, the API requires:
- markdown
- xhtml2pdf
- python-docx

These packages will be automatically installed when running app.py, or you can install them manually:
```bash
pip install markdown xhtml2pdf python-docx
```

## Connecting to the React Frontend

The React frontend will connect to this API automatically through the ResumeService component.
>>>>>>> 755eb2c (Initial commit)
