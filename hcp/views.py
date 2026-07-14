from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import HCP, Interaction
from .serializers import HCPSerializer, InteractionSerializer
from .tools import *
import json
import re


@api_view(['POST'])
def chat(request):
    """Chat endpoint with full support for all 5 tools"""
    try:
        message = request.data.get('message', '')
        hcp_id = request.data.get('hcp_id')
        
        print(f"📥 Chat received: {message[:100]}...")
        
  
        if any(word in message.lower() for word in ['met with', 'meeting', 'discussed', 'shared', 'called']):
            print("🔍 Detected LOG INTERACTION")
            
            
            name_match = re.search(r'Dr\.?\s*([A-Z][a-z]+)', message, re.IGNORECASE)
            if name_match:
                hcp_name = f"Dr. {name_match.group(1)}"
                
           
                result = log_interaction(
                    hcp_name=hcp_name,
                    interaction_type='meeting',
                    notes=message,
                    date=None
                )
                
                if result.get('status') == 'success':
                    return Response({
                        "response": f"✅ Interaction logged successfully! ID: {result['interaction_id']}\n\n📊 Sentiment: {result['sentiment']}\n📝 Key Points: {', '.join(result['summary'])}",
                        "form_data": {
                            "hcp_name": result['hcp_name'],
                            "topics": ', '.join(result['summary']),
                            "sentiment": result['sentiment'],
                            "outcomes": result['next_steps']
                        }
                    })
                else:
                    return Response({
                        "response": f"❌ Error: {result.get('message')}",
                        "form_data": {}
                    })
      
        if 'edit' in message.lower() or 'update' in message.lower() or 'change' in message.lower():
            print(f"🔍 Detected EDIT command")
            
            clean_msg = re.sub(r'\s*(?:type|to|call|email|virtual|interaction|notes).*$', '', message, flags=re.IGNORECASE)
            hcp_name_match = re.search(r'dr\.?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', clean_msg, re.IGNORECASE)
            
            if hcp_name_match:
                hcp_name = f"Dr. {hcp_name_match.group(1)}"
                print(f"✅ Extracted HCP name: {hcp_name}")
                
                try:
                    hcp = HCP.objects.filter(name__icontains=hcp_name).first()
                    if hcp:
                        latest_interaction = Interaction.objects.filter(hcp=hcp).order_by('-created_at').first()
                        if latest_interaction:
                            if 'to call' in message.lower():
                                latest_interaction.type = 'call'
                                latest_interaction.save()
                                return Response({
                                    "response": f"✅ Interaction type updated to call!",
                                    "form_data": {"hcp_name": hcp.name}
                                })
                            elif 'to email' in message.lower():
                                latest_interaction.type = 'email'
                                latest_interaction.save()
                                return Response({
                                    "response": f"✅ Interaction type updated to email!",
                                    "form_data": {"hcp_name": hcp.name}
                                })
                            
                            if 'notes to' in message.lower() or 'notes:' in message.lower():
                                notes_match = re.search(r'(?:notes to|notes:)\s*(.+)', message, re.IGNORECASE)
                                if notes_match:
                                    new_notes = notes_match.group(1).strip()
                                    latest_interaction.summary = new_notes
                                    latest_interaction.save()
                                    return Response({
                                        "response": f"✅ Interaction updated!\n📝 New Notes: {new_notes}",
                                        "form_data": {"hcp_name": hcp.name}
                                    })
                            
                            return Response({
                                "response": f"❌ Please specify. Example: 'Change {hcp_name} type to call'",
                                "form_data": {"hcp_name": hcp.name}
                            })
                        else:
                            return Response({
                                "response": f"❌ No interactions found for {hcp_name}.",
                                "form_data": {}
                            })
                    else:
                        return Response({
                            "response": f"❌ HCP '{hcp_name}' not found.",
                            "form_data": {}
                        })
                except Exception as e:
                    return Response({
                        "response": f"❌ Error: {str(e)}",
                        "form_data": {}
                    })
            else:
                return Response({
                    "response": "❌ Please specify HCP name. Example: 'Change Dr. Rajesh type to call'",
                    "form_data": {}
                })
      
        if 'search' in message.lower() or 'find' in message.lower() or 'who is' in message.lower():
            print(f"🔍 Detected SEARCH command")
            name_match = re.search(r'dr\.?\s*([A-Z][a-z]+)', message, re.IGNORECASE)
            if name_match:
                hcp_name = f"Dr. {name_match.group(1)}"
                try:
                    hcp = HCP.objects.filter(name__icontains=hcp_name).first()
                    if hcp:
                        interaction_count = Interaction.objects.filter(hcp=hcp).count()
                        return Response({
                            "response": f"""🔍 Found {hcp_name}

📋 Profile:
• Name: {hcp.name}
• Specialty: {hcp.specialty or 'N/A'}
• Hospital: {hcp.hospital or 'N/A'}
• Email: {hcp.email or 'N/A'}
• Phone: {hcp.phone or 'N/A'}

📊 Total Interactions: {interaction_count}""",
                            "form_data": {"hcp_name": hcp.name}
                        })
                    else:
                        return Response({
                            "response": f"❌ HCP '{hcp_name}' not found.",
                            "form_data": {}
                        })
                except Exception as e:
                    return Response({
                        "response": f"❌ Error: {str(e)}",
                        "form_data": {}
                    })
            else:
                return Response({
                    "response": "❌ Please specify HCP name. Example: 'Search for Dr. Rajesh'",
                    "form_data": {}
                })
        
      
        if 'history' in message.lower() or 'show me' in message.lower():
            print(f"🔍 Detected HISTORY command")
            name_match = re.search(r'dr\.?\s*([A-Z][a-z]+)', message, re.IGNORECASE)
            if name_match:
                hcp_name = f"Dr. {name_match.group(1)}"
                try:
                    hcp = HCP.objects.filter(name__icontains=hcp_name).first()
                    if hcp:
                        history = get_hcp_history(hcp.id)
                        if history.get('history'):
                            history_text = "\n".join([
                                f"• {h['date']} - {h['type']} - {h['summary'][:150]}... ({h['sentiment']})"
                                for h in history['history'][:5]
                            ])
                            return Response({
                                "response": f"📋 History for {hcp_name}:\n\n{history_text}\n\n📊 Total: {history['total_interactions']} interactions",
                                "form_data": {"hcp_name": hcp.name}
                            })
                        else:
                            return Response({
                                "response": f"📋 No interactions found for {hcp_name}.",
                                "form_data": {}
                            })
                    else:
                        return Response({
                            "response": f"❌ HCP '{hcp_name}' not found.",
                            "form_data": {}
                        })
                except Exception as e:
                    return Response({
                        "response": f"❌ Error: {str(e)}",
                        "form_data": {}
                    })
            else:
                return Response({
                    "response": "❌ Please specify HCP name. Example: 'Show me Dr. Rajesh history'",
                    "form_data": {}
                })
        
  
        if 'suggest' in message.lower() or 'next steps' in message.lower() or 'what should' in message.lower():
            print(f"🔍 Detected SUGGEST command")
            name_match = re.search(r'dr\.?\s*([A-Z][a-z]+)', message, re.IGNORECASE)
            if name_match:
                hcp_name = f"Dr. {name_match.group(1)}"
                try:
                    hcp = HCP.objects.filter(name__icontains=hcp_name).first()
                    if hcp:
                        suggestions = suggest_next_steps(hcp.id)
                        suggestions_text = "\n".join([f"{i+1}. {s}" for i, s in enumerate(suggestions)])
                        return Response({
                            "response": f"💡 Suggested Next Steps for {hcp_name}:\n\n{suggestions_text}",
                            "form_data": {"hcp_name": hcp.name, "follow_up": suggestions_text}
                        })
                    else:
                        return Response({
                            "response": f"❌ HCP '{hcp_name}' not found.",
                            "form_data": {}
                        })
                except Exception as e:
                    return Response({
                        "response": f"❌ Error: {str(e)}",
                        "form_data": {}
                    })
            else:
                return Response({
                    "response": "❌ Please specify HCP name. Example: 'What should I do with Dr. Rajesh?'",
                    "form_data": {}
                })
        
       
        return Response({
            "response": "I'm here to help with HCP interactions. Try:\n\n1. Log: 'On 14-07-2026, I met with Dr. Rajesh...'\n2. Search: 'Search for Dr. Rajesh'\n3. History: 'Show me Dr. Rajesh history'\n4. Suggest: 'What should I do with Dr. Rajesh?'\n5. Edit: 'Change Dr. Rajesh type to call'",
            "form_data": {}
        })
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def log_interaction_endpoint(request):
    """Log interaction via structured form"""
    try:
        data = request.data
        result = log_interaction(
            hcp_name=data.get('hcp_name'),
            interaction_type=data.get('interaction_type'),
            notes=data.get('notes'),
            date=data.get('date')
        )
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def edit_interaction_endpoint(request):
    """Edit an existing interaction"""
    try:
        data = request.data
        result = edit_interaction(
            interaction_id=data.get('interaction_id'),
            new_notes=data.get('new_notes'),
            new_type=data.get('new_type')
        )
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_hcp_endpoint(request):
    """Search HCPs"""
    query = request.query_params.get('query', '')
    if not query:
        return Response({"error": "Query parameter required"}, status=status.HTTP_400_BAD_REQUEST)
    result = search_hcp(query)
    return Response(result)


@api_view(['GET'])
def get_hcp_history_endpoint(request, hcp_id):
    """Get HCP interaction history"""
    try:
        result = get_hcp_history(hcp_id=int(hcp_id))
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_hcps(request):
    """List all HCPs"""
    try:
        hcps = HCP.objects.all()
        serializer = HCPSerializer(hcps, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def suggest_next_steps_endpoint(request, hcp_id):
    """Get suggested next steps for an HCP"""
    try:
        result = suggest_next_steps(hcp_id=int(hcp_id))
        return Response({"suggestions": result})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def generate_follow_up_endpoint(request):
    """Generate follow-up message"""
    try:
        hcp_id = request.data.get('hcp_id')
        topic = request.data.get('topic', '')
        result = generate_follow_up(hcp_id=int(hcp_id), topic=topic)
        return Response({"follow_up": result})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)