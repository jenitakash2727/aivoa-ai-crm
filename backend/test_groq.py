import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.conf import settings
import groq

print("=" * 50)
print("🔍 Testing Groq API Connection")
print("=" * 50)

if not settings.GROQ_API_KEY:
    print("❌ GROQ_API_KEY not found in .env!")
    print("Please add: GROQ_API_KEY=your_api_key_here")
    exit()

print(f"✅ API Key found: {settings.GROQ_API_KEY[:15]}...")

try:
    client = groq.Client(api_key=settings.GROQ_API_KEY)
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Say 'Hello! Groq is working!' in exactly 5 words"}
        ],
        temperature=0.5,
        max_tokens=50
    )
    
    print(f"✅ Response: {response.choices[0].message.content}")
    print("=" * 50)
    print("🎉 Groq API is working perfectly!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Please check your API key and internet connection.")