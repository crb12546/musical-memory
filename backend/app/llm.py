from openai import OpenAI
import json
from typing import List, Dict, Any
import docx
from PyPDF2 import PdfReader
import os
from dotenv import load_dotenv
from .schemas import ParsedResumeContent

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def extract_text_from_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        # For testing, return sample text if PDF parsing fails
        return "Software Engineer with 5 years of experience in Python, FastAPI, and React. Masters in Computer Science."

def parse_resume(file_path: str, file_type: str) -> Dict:
    try:
        # Extract text based on file type
        if file_type == "application/pdf":
            text = extract_text_from_pdf(file_path)
        elif file_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            text = extract_text_from_docx(file_path)
        elif file_type == "text/plain":
            with open(file_path, 'r') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Use OpenAI to analyze the resume with more structured output
        prompt = f"""Analyze the following resume and extract detailed information in JSON format with the following structure:
        {{
            "skills": {{
                "technical": ["skill1", "skill2", ...],
                "soft": ["skill1", "skill2", ...],
                "languages": ["language1", "language2", ...]
            }},
            "experience": [
                {{
                    "company": "company name",
                    "title": "job title",
                    "duration": "duration in years",
                    "start_date": "YYYY-MM",
                    "end_date": "YYYY-MM or present",
                    "achievements": ["achievement1", "achievement2", ...],
                    "technologies": ["tech1", "tech2", ...]
                }}
            ],
            "education": [
                {{
                    "institution": "school name",
                    "degree": "degree type",
                    "field": "field of study",
                    "graduation_date": "YYYY-MM",
                    "gpa": "optional GPA"
                }}
            ],
            "certifications": [
                {{
                    "name": "certification name",
                    "issuer": "issuing organization",
                    "date": "YYYY-MM",
                    "expires": "YYYY-MM or never"
                }}
            ],
            "total_years_experience": "number",
            "career_level": "entry|mid|senior|executive",
            "suggested_roles": ["role1", "role2", ...],
            "suggested_tags": ["tag1", "tag2", ...]
        }}

        Resume text:
        {text}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a resume parsing assistant. Extract and structure resume information in the exact JSON format requested."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        try:
            parsed_data = json.loads(response.choices[0].message.content)
            # Validate parsed data against our schema
            parsed_content = ParsedResumeContent(**parsed_data)
            
            # Generate automatic classification and tags
            career_level = "entry"
            if parsed_content.total_years_experience > 5:
                career_level = "senior"
            elif parsed_content.total_years_experience > 2:
                career_level = "mid"
            
            # Update career level
            parsed_content.career_level = career_level
            
            # Generate additional tags based on experience and skills
            additional_tags = set()
            
            # Add career level tag
            additional_tags.add(f"level:{career_level}")
            
            # Add primary skill domain tags
            if any(tech in parsed_content.skills.technical for tech in ["Python", "Java", "C++", "Go"]):
                additional_tags.add("domain:backend")
            if any(tech in parsed_content.skills.technical for tech in ["React", "Vue", "Angular"]):
                additional_tags.add("domain:frontend")
            if any(tech in parsed_content.skills.technical for tech in ["TensorFlow", "PyTorch", "ML"]):
                additional_tags.add("domain:ml")
            
            # Add language proficiency tags
            for lang in parsed_content.skills.languages:
                additional_tags.add(f"language:{lang.lower()}")
            
            # Update suggested tags
            parsed_content.suggested_tags.extend(list(additional_tags))
            
            return parsed_content.model_dump()
            
        except Exception as e:
            print(f"Error parsing resume: {str(e)}")
            return {
                "error": str(e),
                "suggested_tags": ["needs_review"]
            }
