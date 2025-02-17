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
    """Extract text content from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        print(f"Error extracting text from DOCX: {str(e)}")
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text content from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def parse_resume(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Parse a resume file and extract structured information using OpenAI's GPT model.
    
    Args:
        file_path: Path to the resume file
        file_type: MIME type of the file
        
    Returns:
        Dict containing parsed resume information or error details
    
    Raises:
        ValueError: If file type is unsupported or content is empty
        Exception: For other parsing or processing errors
    """
    text = ""
    parsed_content = None
    
    try:
        # Extract text based on file type
        try:
            if file_type == "application/pdf":
                text = extract_text_from_pdf(file_path)
            elif file_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                text = extract_text_from_docx(file_path)
            elif file_type == "text/plain":
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise ValueError(f"Failed to read resume file: {str(e)}")
        
        if not text.strip():
            raise ValueError("Empty resume content")
            
        # Use OpenAI to analyze the resume with more structured output
        prompt = (
            "Analyze the following resume and extract detailed information in JSON format "
            "with the following structure:\n"
            "{\n"
            '    "skills": {\n'
            '        "technical": ["skill1", "skill2", ...],\n'
            '        "soft": ["skill1", "skill2", ...],\n'
            '        "languages": ["language1", "language2", ...]\n'
            "    },\n"
            '    "experience": [\n'
            "        {\n"
            '            "company": "company name",\n'
            '            "title": "job title",\n'
            '            "duration": "duration in years",\n'
            '            "start_date": "YYYY-MM",\n'
            '            "end_date": "YYYY-MM or present",\n'
            '            "achievements": ["achievement1", "achievement2", ...],\n'
            '            "technologies": ["tech1", "tech2", ...]\n'
            "        }\n"
            "    ],\n"
            '    "education": [\n'
            "        {\n"
            '            "institution": "school name",\n'
            '            "degree": "degree type",\n'
            '            "field": "field of study",\n'
            '            "graduation_date": "YYYY-MM",\n'
            '            "gpa": "optional GPA"\n'
            "        }\n"
            "    ],\n"
            '    "certifications": [\n'
            "        {\n"
            '            "name": "certification name",\n'
            '            "issuer": "issuing organization",\n'
            '            "date": "YYYY-MM",\n'
            '            "expires": "YYYY-MM or never"\n'
            "        }\n"
            "    ],\n"
            '    "total_years_experience": "number",\n'
            '    "career_level": "entry|mid|senior|executive",\n'
            '    "suggested_roles": ["role1", "role2", ...],\n'
            '    "suggested_tags": ["tag1", "tag2", ...]\n'
            "}\n\n"
            f"Resume text:\n{text}"
        )
        
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
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse OpenAI response: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to process parsed content: {str(e)}")
            
    except ValueError as e:
        return {
            "error": str(e),
            "suggested_tags": ["needs_review"]
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}",
            "suggested_tags": ["needs_review"]
        }
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
