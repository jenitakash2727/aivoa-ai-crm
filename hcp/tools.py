from typing import Dict, List
from datetime import datetime
from django.conf import settings
from .models import HCP, Interaction
import json
import groq
import re

client = groq.Client(api_key=settings.GROQ_API_KEY)


def call_groq(prompt: str) -> str:
    """Helper function to call Groq API"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "{}"


def extract_form_data_from_text(text: str) -> Dict:
    """Extract form data from natural language text"""
    data = {}
    
  
    clean_text = text
    command_patterns = [
        r'show me\s+',
        r'search for\s+',
        r'find\s+',
        r'who is\s+',
        r'history\s+of\s+',
        r'history\s*$',
        r'suggest\s+',
        r'next steps\s+',
        r'edit\s+',
        r'update\s+',
        r'what should I do with\s+',
        r'recommend\s+',
    ]
    for pattern in command_patterns:
        clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r'\s*history\s*$', '', clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r'\s*history\s+', ' ', clean_text, flags=re.IGNORECASE)
    
    print(f"🧹 Cleaned text: {clean_text}")
    
  
    hcp_patterns = [
        r'(?:with|for|meeting with|call with)\s+(Dr\.?\s*[A-Za-z]+)',
        r'Dr\.?\s*([A-Z][a-z]+)'
    ]
    for pattern in hcp_patterns:
        match = re.search(pattern, clean_text, re.IGNORECASE)
        if match:
            hcp_name = match.group(1).strip()
            hcp_name = re.sub(r'\s+at\s+.*$', '', hcp_name, flags=re.IGNORECASE)
            hcp_name = re.sub(r'\s+about\s+.*$', '', hcp_name, flags=re.IGNORECASE)
            hcp_name = re.sub(r'\s+we\s+.*$', '', hcp_name, flags=re.IGNORECASE)
            if not hcp_name.startswith('Dr'):
                data['hcp_name'] = f"Dr. {hcp_name}"
            else:
                data['hcp_name'] = hcp_name
            print(f"✅ Extracted HCP: {data['hcp_name']}")
            break

    
    specialty_match = re.search(r'(?:specialty|specialist|is a|is an|a)\s+([A-Z][a-z]+(?:[A-Za-z\s]*)?)', clean_text, re.IGNORECASE)
    if specialty_match:
        data['hcp_specialty'] = specialty_match.group(1).strip()
        print(f"✅ Extracted Specialty: {data['hcp_specialty']}")

    
    hospital_match = re.search(r'(?:at|hospital|clinic)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:Hospital|Clinic)?)', clean_text, re.IGNORECASE)
    if hospital_match:
        data['hcp_hospital'] = hospital_match.group(1).strip()
        print(f"✅ Extracted Hospital: {data['hcp_hospital']}")

  
    topic_match = re.search(r'about\s+([^.]+)', clean_text, re.IGNORECASE)
    if topic_match:
        data['topics'] = topic_match.group(1).strip()
        print(f"✅ Extracted Topics: {data['topics']}")

    
    date_match = re.search(r'(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})', clean_text)
    if date_match:
        data['date'] = date_match.group(1)
        print(f"✅ Extracted Date: {data['date']}")

    
    time_match = re.search(r'(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)', clean_text)
    if time_match:
        data['time'] = time_match.group(1)
        print(f"✅ Extracted Time: {data['time']}")

   
    if re.search(r'\bcall\b', clean_text, re.IGNORECASE):
        data['interaction_type'] = 'call'
    elif re.search(r'\bemail\b', clean_text, re.IGNORECASE):
        data['interaction_type'] = 'email'
    elif re.search(r'\bvirtual\b', clean_text, re.IGNORECASE):
        data['interaction_type'] = 'virtual'
    elif re.search(r'\bmeeting\b', clean_text, re.IGNORECASE):
        data['interaction_type'] = 'meeting'
    print(f"✅ Extracted Type: {data.get('interaction_type', 'meeting')}")

  
    if re.search(r'\bpositive\b|\bgood\b|\bexcellent\b|\bimpressed\b', clean_text, re.IGNORECASE):
        data['sentiment'] = 'positive'
    elif re.search(r'\bnegative\b|\bbad\b|\bpoor\b|\bconcerned\b', clean_text, re.IGNORECASE):
        data['sentiment'] = 'negative'
    elif re.search(r'\bneutral\b', clean_text, re.IGNORECASE):
        data['sentiment'] = 'neutral'
    print(f"✅ Extracted Sentiment: {data.get('sentiment', 'neutral')}")

    
    attendee_match = re.search(r'Attendees?:?\s*([^.]+)', clean_text, re.IGNORECASE)
    if attendee_match:
        data['attendees'] = attendee_match.group(1).strip()
        print(f"✅ Extracted Attendees: {data['attendees']}")

    
    material_match = re.search(r'(?:shared|provided|gave)\s+([^.]+)', clean_text, re.IGNORECASE)
    if material_match:
        data['materials'] = material_match.group(1).strip()
        print(f"✅ Extracted Materials: {data['materials']}")

   
    sample_match = re.search(r'(?:samples?|product samples?)\s+(?:distributed|of\s+)?([^.]+)', clean_text, re.IGNORECASE)
    if sample_match:
        data['samples'] = sample_match.group(1).strip()
        print(f"✅ Extracted Samples: {data['samples']}")

    outcome_match = re.search(r'(?:agreed|decided|outcome|result)\s+([^.]+)', clean_text, re.IGNORECASE)
    if outcome_match:
        data['outcomes'] = outcome_match.group(1).strip()
        print(f"✅ Extracted Outcomes: {data['outcomes']}")

  
    follow_match = re.search(r'(?:follow[- ]up|next steps|action)\s+([^.]+)', clean_text, re.IGNORECASE)
    if follow_match:
        data['follow_up'] = follow_match.group(1).strip()
        print(f"✅ Extracted Follow-up: {data['follow_up']}")

    return data


def log_interaction(hcp_name: str, interaction_type: str, notes: str, date: str = None) -> Dict:
    """Log a new interaction with an HCP using AI summarization"""
    try:
        import re
        
        
        name_match = re.search(r'Dr\.?\s*([A-Z][a-z]+)', notes, re.IGNORECASE)
        if name_match:
            hcp_name = f"Dr. {name_match.group(1)}"
        else:
            hcp_name = "Unknown HCP"
        
        print(f"✅ FINAL HCP NAME: {hcp_name}")
        
       
        specialty = ""
        specialty_match = re.search(r'(?:cardiologist|oncologist|neurologist|dermatologist)', notes, re.IGNORECASE)
        if specialty_match:
            specialty = specialty_match.group(0).capitalize()
        
       
        hospital = ""
        hospital_match = re.search(r'(?:at|hospital)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', notes, re.IGNORECASE)
        if hospital_match:
            hospital = hospital_match.group(1).strip()
        
        print(f"✅ Creating/Updating HCP: {hcp_name}, Specialty: {specialty}, Hospital: {hospital}")
        
     
        hcp, created = HCP.objects.get_or_create(
            name=hcp_name,
            defaults={
                'specialty': specialty,
                'hospital': hospital,
            }
        )
        
        if not created:
            if specialty:
                hcp.specialty = specialty
            if hospital:
                hcp.hospital = hospital
            hcp.save()
            print(f"✅ Updated existing HCP: {hcp.name}")
        else:
            print(f"✅ Created new HCP: {hcp.name}")
        
      
        prompt = f"""
        Analyze this interaction note and extract:
        1. Key discussion points (3-5 points as a list)
        2. Sentiment (positive/neutral/negative)
        3. Next steps to take
        
        Note: {notes}
        
        Return ONLY valid JSON with keys: key_points, sentiment, next_steps
        """
        
        response_text = call_groq(prompt)
        
        try:
            analysis = json.loads(response_text)
            if not isinstance(analysis.get("key_points"), list):
                analysis["key_points"] = ["Discussion about product", "Addressed concerns"]
            if not analysis.get("sentiment"):
                analysis["sentiment"] = "neutral"
            if not analysis.get("next_steps"):
                analysis["next_steps"] = "Schedule follow-up"
        except:
            analysis = {
                "key_points": ["Discussion about product", "Addressed concerns", "Follow-up scheduled"],
                "sentiment": "positive",
                "next_steps": "Schedule follow-up meeting"
            }
        
      
        interaction = Interaction.objects.create(
            hcp=hcp,
            type=interaction_type,
            summary=notes,
            key_points=json.dumps(analysis.get("key_points", [])),
            sentiment=analysis.get("sentiment", "neutral"),
            next_steps=analysis.get("next_steps", ""),
            created_by="field_rep"
        )
        
        return {
            "status": "success",
            "interaction_id": interaction.id,
            "hcp_id": hcp.id,
            "hcp_name": hcp.name,
            "specialty": hcp.specialty,
            "hospital": hcp.hospital,
            "summary": analysis.get("key_points", []),
            "sentiment": analysis.get("sentiment", "neutral"),
            "next_steps": analysis.get("next_steps", "")
        }
    except Exception as e:
        print(f"❌ Error in log_interaction: {str(e)}")
        return {"status": "error", "message": str(e)}


def edit_interaction(interaction_id: int, new_notes: str = None, new_type: str = None) -> Dict:
    """Edit an existing interaction"""
    try:
        interaction = Interaction.objects.get(id=interaction_id)
        updated_fields = []
        
        if new_notes:
            prompt = f"""
            Re-analyze this updated interaction note:
            {new_notes}
            
            Extract key points, sentiment, and next steps.
            Return ONLY valid JSON with keys: key_points, sentiment, next_steps
            """
            response_text = call_groq(prompt)
            
            try:
                analysis = json.loads(response_text)
            except:
                analysis = {
                    "key_points": ["Updated discussion points"],
                    "sentiment": "positive",
                    "next_steps": "Continue follow-up"
                }
            
            interaction.summary = new_notes
            interaction.key_points = json.dumps(analysis.get("key_points", []))
            interaction.sentiment = analysis.get("sentiment", "neutral")
            interaction.next_steps = analysis.get("next_steps", "")
            updated_fields.extend(["notes", "key_points", "sentiment", "next_steps"])
            
        if new_type:
            interaction.type = new_type
            updated_fields.append("type")
        
        interaction.save()
        
        return {
            "status": "success",
            "interaction_id": interaction.id,
            "updated_fields": updated_fields
        }
    except Interaction.DoesNotExist:
        return {"status": "error", "message": "Interaction not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def search_hcp(query: str) -> List[Dict]:
    """Search for HCPs"""
    try:
        hcps = HCP.objects.filter(
            name__icontains=query
        ) | HCP.objects.filter(
            specialty__icontains=query
        ) | HCP.objects.filter(
            hospital__icontains=query
        )
        
        return [{
            "id": h.id,
            "name": h.name,
            "specialty": h.specialty,
            "hospital": h.hospital,
            "email": h.email,
            "phone": h.phone
        } for h in hcps[:10]]
    except Exception as e:
        return [{"error": str(e)}]


def get_hcp_history(hcp_id: int, limit: int = 5) -> Dict:
    """Get HCP interaction history"""
    try:
        interactions = Interaction.objects.filter(
            hcp_id=hcp_id
        ).order_by('-interaction_date')[:limit]
        
        try:
            hcp = HCP.objects.get(id=hcp_id)
            hcp_name = hcp.name
        except:
            hcp_name = "Unknown"
        
        history_list = []
        for i in interactions:
            try:
                key_points = json.loads(i.key_points) if i.key_points else []
            except:
                key_points = []
            
            history_list.append({
                "id": i.id,
                "date": i.interaction_date.strftime("%Y-%m-%d %H:%M"),
                "type": i.type,
                "summary": i.summary[:200] + "..." if len(i.summary) > 200 else i.summary,
                "sentiment": i.sentiment,
                "key_points": key_points,
                "next_steps": i.next_steps
            })
        
        return {
            "hcp_id": hcp_id,
            "hcp_name": hcp_name,
            "total_interactions": len(history_list),
            "history": history_list
        }
    except Exception as e:
        return {"error": str(e)}


def suggest_next_steps(hcp_id: int) -> List[str]:
    """Generate AI-powered suggested next steps"""
    try:
        interactions = Interaction.objects.filter(
            hcp_id=hcp_id
        ).order_by('-interaction_date')[:3]
        
        try:
            hcp = HCP.objects.get(id=hcp_id)
            hcp_name = hcp.name
            hcp_specialty = hcp.specialty or "General Practice"
        except:
            hcp_name = "HCP"
            hcp_specialty = "General Practice"
        
        if not interactions:
            return [
                f"Schedule initial meeting with {hcp_name}",
                "Send introductory materials",
                f"Research {hcp_specialty} to understand their practice"
            ]
        
        context = "\n".join([
            f"- {i.interaction_date.strftime('%Y-%m-%d')}: {i.type} - {i.summary[:150]}"
            for i in interactions
        ])
        
        prompt = f"""
        Based on these recent interactions with an HCP:
        
        HCP: {hcp_name}
        Specialty: {hcp_specialty}
        
        Recent Interactions:
        {context}
        
        Suggest 3 specific next steps for the field representative.
        Make them actionable, personalized, and specific.
        Return as a simple numbered list.
        """
        
        response_text = call_groq(prompt)
        suggestions = response_text.split("\n")
        
        cleaned = []
        for s in suggestions:
            s = s.strip()
            if s and len(s) > 10:
                if s[0].isdigit() and '.' in s[:3]:
                    s = s[s.index('.') + 1:].strip()
                if s.startswith('•') or s.startswith('-'):
                    s = s[1:].strip()
                cleaned.append(s)
        
        if len(cleaned) < 3:
            default_suggestions = [
                f"Schedule follow-up meeting with {hcp_name}",
                f"Share clinical data relevant to {hcp_specialty}",
                "Discuss new product features and benefits"
            ]
            cleaned.extend(default_suggestions[:3 - len(cleaned)])
        
        return cleaned[:3]
    except Exception as e:
        return [
            "Schedule follow-up meeting",
            "Share relevant clinical data",
            "Discuss new products"
        ]


def generate_follow_up(hcp_id: int, topic: str = "") -> str:
    """Generate personalized follow-up message"""
    try:
        hcp = HCP.objects.get(id=hcp_id)
        recent_interaction = Interaction.objects.filter(
            hcp_id=hcp_id
        ).order_by('-interaction_date').first()
        
        prompt = f"""
        Generate a professional follow-up email for:
        
        HCP Details:
        - Name: {hcp.name}
        - Specialty: {hcp.specialty or "General Practice"}
        - Hospital: {hcp.hospital or "N/A"}
        
        Topic: {topic or "General follow-up"}
        
        Recent Interaction:
        {recent_interaction.summary if recent_interaction else "No previous interactions"}
        
        Format as a professional email with:
        1. Professional greeting
        2. Reference to recent discussion
        3. Key takeaways
        4. Clear call to action
        5. Professional closing
        """
        
        response_text = call_groq(prompt)
        return response_text
    except HCP.DoesNotExist:
        return "Error: HCP not found. Please provide a valid HCP ID."
    except Exception as e:
        return f"Error generating follow-up: {str(e)}"