from django.conf import settings
from .tools import call_groq

def process_message(message: str) -> str:
    """Process user message with AI"""
    prompt = f"""
    You are an AI assistant for a CRM system. 
    Help users with HCP (Healthcare Professional) interactions.
    
    User message: {message}
    
    Provide a helpful, professional response.
    """
    return call_groq(prompt)