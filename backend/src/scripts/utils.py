from markitdown import MarkItDown
from dotenv import load_dotenv
import os
from pathlib import Path
from typing import Optional
import PyPDF2
import requests
import json
import base64
from PIL import Image
import io

load_dotenv(override=True)

class OllamaClientWrapper:
    
    def __init__(self, model_name: str = "mistral:7b-instruct-q4_K_M", base_url: Optional[str] = None):
        self.model_name = model_name
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        self.chat = self
        self.completions = self
    
    def create(self, messages, model=None, **kwargs):
        try:
            user_message = None
            image_data = None
            
            for msg in messages:
                if msg.get("role") == "user":
                    content = msg.get("content")
                    if isinstance(content, list):
                        for item in content:
                            if item.get("type") == "text":
                                user_message = item.get("text")
                            elif item.get("type") == "image_url":
                                image_url = item.get("image_url", {}).get("url", "")
                                if image_url.startswith("data:"):
                                    image_b64 = image_url.split(",", 1)[1]
                                    image_bytes = base64.b64decode(image_b64)
                                    image_data = Image.open(io.BytesIO(image_bytes))
                    elif isinstance(content, str):
                        user_message = content
            
            prompt = user_message or "Describe this image in detail."
            
            if image_data:
                image_b64 = self._image_to_base64(image_data)
                messages_for_ollama = [
                    {
                        "role": "user",
                        "content": prompt,
                        "images": [image_b64]
                    }
                ]
            else:
                messages_for_ollama = [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            
            url = f"{self.base_url.rstrip('/v1').rstrip('/')}/api/chat"
            payload = {
                "model": self.model_name,
                "messages": messages_for_ollama,
                "stream": False
            }
            
            response = requests.post(url, json=payload, timeout=300)
            response.raise_for_status()
            
            result = response.json()
            response_text = result.get("message", {}).get("content", "")
            
            class Choice:
                def __init__(self, text):
                    self.message = type('obj', (object,), {'content': text})
            
            class Response:
                def __init__(self, text):
                    self.choices = [Choice(text)]
            
            return Response(response_text)
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower() or "rate" in error_str.lower():
                raise Exception(f"OLLAMA_RATE_LIMIT: {error_str}")
            elif "500" in error_str or "internal" in error_str.lower():
                raise Exception(f"OLLAMA_INTERNAL_ERROR: {error_str}")
            elif "503" in error_str or "overload" in error_str.lower():
                raise Exception(f"OLLAMA_OVERLOADED: {error_str}")
            else:
                raise Exception(f"OLLAMA_ERROR: {error_str}")
    
    def _image_to_base64(self, image: Image.Image) -> str:
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        image_bytes = buffer.getvalue()
        return base64.b64encode(image_bytes).decode("utf-8")

def inject_page_markers_into_markdown(markdown_content: str, file_path: str, page_count: Optional[int] = None) -> str:
    """
    Inject page markers into PDF markdown content using proportional distribution.
    More efficient approach that doesn't re-extract PDF text.
    """
    if not file_path.lower().endswith('.pdf'):
        print(f"⚠️ Not a PDF file (extension check): {file_path}")
        return markdown_content
    
    if page_count is None:
        page_count = get_pdf_page_count(file_path)
    
    if page_count is None or page_count == 0:
        print(f"⚠️ Could not determine page count for {file_path}")
        return markdown_content
    
    print(f"📄 Injecting page markers for {page_count}-page PDF")
    
    if page_count == 1:
        print(f"ℹ️ Single-page PDF: marking entire document as page 1")
        return f"<!-- Page 1 -->\n{markdown_content}"
    
    content_length = len(markdown_content)
    chars_per_page = content_length / page_count
    
    page_markers = []
    for page_num in range(page_count):
        position = int(page_num * chars_per_page)
        page_markers.append((position, page_num + 1))
        print(f"✓ Page {page_num + 1} marker at position {position} (~{position/content_length*100:.1f}%)")
    
    result = []
    last_pos = 0
    
    for pos, page_num in page_markers:
        result.append(markdown_content[last_pos:pos])
        result.append(f"<!-- Page {page_num} -->\n")
        last_pos = pos
    
    result.append(markdown_content[last_pos:])
    
    final_content = ''.join(result)
    print(f"✅ Injected {len(page_markers)} page markers using proportional distribution")
    return final_content


def get_pdf_page_count(file_path: str) -> Optional[int]:
    try:
        with open(file_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            return len(pdf_reader.pages)
    except Exception as e:
        print(f"Could not determine PDF page count: {e}")
        return None
