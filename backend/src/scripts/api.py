from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import time
import os
from pathlib import Path
from utils import GeminiClientWrapper, inject_page_markers_into_markdown, get_pdf_page_count
from markitdown import MarkItDown
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(
    title="RAG Parsing API",
    description="API for processing URLs and converting documents to markdown using MarkItDown",
    version="1.0.0",
)

gemini_api_key = os.getenv("GOOGLE_GENAI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_client = GeminiClientWrapper()
    md = MarkItDown(llm_client=gemini_client, llm_model="gemini-2.5-flash")
else:
    md = MarkItDown()
    print("⚠️ MarkItDown initialized without LLM (no GOOGLE_GENAI_API_KEY found)")


class FilePathRequest(BaseModel):
    file_path: str

    class Config:
        json_schema_extra = {"example": {"file_path": "/path/to/uploads/document.pdf"}}


class ProcessingResponse(BaseModel):
    success: bool
    file_path: str
    processing_time: float
    content_length: Optional[int] = None
    markdown_content: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "file_path": "/path/to/document.pdf",
                "processing_time": 2.5,
                "content_length": 15420,
                "markdown_content": "# Document Title\n\nDocument content...",
                "error_message": None,
            }
        }


@app.get("/")
async def root():
    return {
        "message": "RAG Parsing API",
        "description": "Process local files and convert documents to markdown",
        "endpoints": {
            "POST /process-file": "Process a local file and convert to markdown",
            "GET /health": "Health check endpoint",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": time.time(), "service": "rag-parsing-api"}


@app.post("/process-file", response_model=ProcessingResponse)
async def process_file_endpoint(request: FilePathRequest):
    file_path = request.file_path
    start_time = time.time()

    try:
        # Validate file exists
        if not os.path.exists(file_path):
            return ProcessingResponse(
                success=False,
                file_path=file_path,
                processing_time=time.time() - start_time,
                content_length=None,
                markdown_content=None,
                error_message=f"File not found: {file_path}",
            )

        # Check file size
        file_size = os.path.getsize(file_path)
        MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
        if file_size > MAX_FILE_SIZE:
            return ProcessingResponse(
                success=False,
                file_path=file_path,
                processing_time=time.time() - start_time,
                content_length=None,
                markdown_content=None,
                error_message=f"File too large: {file_size / (1024*1024):.2f}MB exceeds 100MB limit",
            )

        # Process file with MarkItDown
        print(f"🔄 Processing file: {file_path}")
        result = md.convert(file_path)
        markdown_content = result.text_content
        
        is_pdf = file_path.lower().endswith('.pdf')
        page_count = None
        
        if is_pdf:
            page_count = get_pdf_page_count(file_path)
            print(f"📄 PDF detected: {page_count} pages")
            
            if page_count and page_count > 0:
                before_length = len(markdown_content)
                markdown_content = inject_page_markers_into_markdown(markdown_content, file_path, page_count)
                after_length = len(markdown_content)
                marker_count = markdown_content.count('<!-- Page')
                print(f"✓ Page marker injection: {before_length} → {after_length} chars, {marker_count} markers added")
            else:
                print(f"⚠️ Could not get page count, skipping page markers")
        
        processing_time = time.time() - start_time
        content_length = len(markdown_content)

        print(f"✅ Successfully processed: {content_length:,} characters")

        return ProcessingResponse(
            success=True,
            file_path=file_path,
            processing_time=processing_time,
            content_length=content_length,
            markdown_content=markdown_content,
            error_message=None,
        )

    except Exception as e:
        processing_time = time.time() - start_time
        error_str = str(e)
        print(f"❌ Error processing file: {error_str}")
        
        if "GEMINI_RATE_LIMIT" in error_str:
            error_message = "Google Gemini API RateLimit Hit"
        elif "GEMINI_INTERNAL_ERROR" in error_str:
            error_message = "Google Gemini API Internal Server Error"
        elif "GEMINI_OVERLOADED" in error_str:
            error_message = "Google Gemini API Internal Server Overloaded"
        else:
            error_message = "Processing failed! The server might be overloaded, please try again later."
        
        return ProcessingResponse(
            success=False,
            file_path=file_path,
            processing_time=processing_time,
            content_length=None,
            markdown_content=None,
            error_message=error_message,
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3001)
