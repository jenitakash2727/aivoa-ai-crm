import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { sendChatMessage, logInteraction } from '../store/interactionSlice';
import './AIAssistant.css';

const AIAssistant = ({ formData, setFormData, chatMessages, setChatMessages }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const extractFormData = (text) => {
    const data = {};
    
    console.log("🔍 Extracting from:", text);

    
    const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
    if (dateMatch) {
      data.date = dateMatch[1];
    } else {
      const today = new Date();
      data.date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    }
    console.log("✅ Date:", data.date);

    const timeMatch = text.match(/(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)/);
    if (timeMatch) {
      data.time = timeMatch[1];
    } else {
      data.time = "10:30 AM";
    }
    console.log("✅ Time:", data.time);

    const hcpMatch = text.match(/Dr\.?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (hcpMatch) {
      data.hcp_name = `Dr. ${hcpMatch[1]}`;
    }
    console.log("✅ HCP:", data.hcp_name);

    if (text.toLowerCase().includes('call')) {
      data.interaction_type = 'call';
    } else if (text.toLowerCase().includes('email')) {
      data.interaction_type = 'email';
    } else {
      data.interaction_type = 'meeting';
    }
    console.log("✅ Type:", data.interaction_type);

    const attendeeMatch = text.match(/(?:Attendees?:?\s*|with\s+)([^.]+?)(?:\.|$)/i);
    if (attendeeMatch) {
      let attendees = attendeeMatch[1].trim();
      if (data.hcp_name && attendees.includes(data.hcp_name)) {
        attendees = attendees.replace(data.hcp_name, '').replace(/[,;]\s*/, '').trim();
      }
      if (attendees && attendees.length > 2) {
        data.attendees = attendees;
      }
    }
    if (!data.attendees) {
      const common = text.match(/(Sales Representative|Medical Affairs|Research Team|Clinical Team)/i);
      data.attendees = common ? common[1] : "Sales Representative";
    }
    console.log("✅ Attendees:", data.attendees);

    const topicMatch = text.match(/(?:discussed|about)\s+([^.]+?)(?:\.|$|,)/i);
    if (topicMatch) {
      data.topics = topicMatch[1].trim();
    } else {
      data.topics = "General discussion";
    }
    console.log("✅ Topics:", data.topics);


    const materialMatch = text.match(/(?:shared|provided|gave)\s+([^.]+?)(?:\.|$|,)/i);
    if (materialMatch) {
      let materials = materialMatch[1].trim();
      materials = materials.replace(/^(the\s+)/i, '');
      if (materials && !materials.toLowerCase().includes('sample')) {
        data.materials = materials;
      }
    }
    if (!data.materials) {
      const common = text.match(/(brochures|data|reports|documents|clinical data|case studies)/i);
      data.materials = common ? common[1] : "Clinical data";
    }
    console.log("✅ Materials:", data.materials);

    const sampleMatch = text.match(/(?:samples?|product samples?)\s+(?:distributed|of\s+)?([^.]+?)(?:\.|$|,)/i);
    if (sampleMatch) {
      data.samples = sampleMatch[1].trim();
    }
    if (!data.samples) {
      const fallback = text.match(/samples?\s+([^.]+?)(?:\.|$|,)/i);
      data.samples = fallback ? fallback[1].trim() : "Product samples";
    }
    console.log("✅ Samples:", data.samples);

 
    const sentimentText = text.toLowerCase();
    if (sentimentText.includes('positive') || sentimentText.includes('good') || sentimentText.includes('impressed')) {
      data.sentiment = 'positive';
    } else if (sentimentText.includes('negative') || sentimentText.includes('bad') || sentimentText.includes('concerned')) {
      data.sentiment = 'negative';
    } else if (sentimentText.includes('neutral') || sentimentText.includes('okay')) {
      data.sentiment = 'neutral';
    } else {
      data.sentiment = sentimentText.includes('agreed') ? 'positive' : 'neutral';
    }
    console.log("✅ Sentiment:", data.sentiment);


    const outcomeMatch = text.match(/(?:agreed|decided|outcome|result)\s+([^.]+?)(?:\.|$|,)/i);
    if (outcomeMatch) {
      data.outcomes = outcomeMatch[1].trim();
    } else {
      const fallback = text.match(/agreed\s+to\s+([^.]+?)\./i);
      data.outcomes = fallback ? fallback[1].trim() : "Review data and schedule follow-up";
    }
    console.log("✅ Outcomes:", data.outcomes);

    const followPatterns = [
      /(?:follow[- ]up|next steps|action items?)\s*:?\s*([^.]+?)(?:\.|$|,)/i,
      /(?:send|arrange|schedule|confirm|prepare)\s+([^.]+?)(?:\.|$|,)/i,
      /Next\s+steps\s*:?\s*([^.]+?)\./i
    ];
    let followFound = false;
    for (const pattern of followPatterns) {
      const match = text.match(pattern);
      if (match) {
        let followUp = match[1].trim();
        if (followUp && followUp.length > 5) {
          data.follow_up = followUp;
          followFound = true;
          break;
        }
      }
    }
    if (!followFound) {
      data.follow_up = "Send additional data and arrange follow-up meeting";
    }
    console.log("✅ Follow-up:", data.follow_up);

    return data;
  };


  const handleSend = async () => {
    if (!message.trim() || isLoading) return;


    const extractedData = extractFormData(message);
    console.log("📋 Extracted Data:", extractedData);
    

    if (Object.keys(extractedData).length > 0) {
      setFormData(prev => {
        const newData = { ...prev, ...extractedData };
        
      
        if (!newData.date) {
          const today = new Date();
          newData.date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        }
        if (!newData.time) newData.time = "10:30 AM";
        if (!newData.follow_up) newData.follow_up = "Send additional data and arrange follow-up meeting";
        if (!newData.attendees) newData.attendees = "Sales Representative";
        if (!newData.materials) newData.materials = "Clinical data and brochures";
        if (!newData.samples) newData.samples = "Product samples";
        if (!newData.outcomes) newData.outcomes = "Review data and schedule follow-up";
        
        console.log("✅ Final Form Data:", newData);
        return newData;
      });
    }

    const userMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    const userMessageText = message;
    setMessage('');
    setIsLoading(true);

    try {
      const response = await dispatch(sendChatMessage({
        message: userMessageText,
        hcpId: null,
      })).unwrap();

      if (response.form_data) {
        setFormData(prev => ({ ...prev, ...response.form_data }));
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response || 'Response received!'
      }]);

    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: ' + (error.message || 'Failed to get response')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLog = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const notes = `
HCP: ${formData.hcp_name || 'Unknown'}
Date: ${formData.date || 'N/A'}
Time: ${formData.time || 'N/A'}
Type: ${formData.interaction_type || 'meeting'}
Attendees: ${formData.attendees || 'N/A'}
Topics: ${formData.topics || 'N/A'}
Materials: ${formData.materials || 'N/A'}
Samples: ${formData.samples || 'N/A'}
Sentiment: ${formData.sentiment || 'N/A'}
Outcomes: ${formData.outcomes || 'N/A'}
Follow-up: ${formData.follow_up || 'N/A'}
      `.trim();

      const result = await dispatch(logInteraction({
        hcp_name: formData.hcp_name || 'Unknown HCP',
        interaction_type: formData.interaction_type || 'meeting',
        notes: notes,
        date: formData.date || null,
      })).unwrap();

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Interaction logged successfully! ID: ${result.interaction_id}\n\n📊 Sentiment: ${result.sentiment || 'neutral'}\n📝 Key Points: ${result.summary?.join(', ') || 'None'}`
      }]);

    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error logging interaction: ' + (error.message || 'Unknown error')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "On 14-07-2026 at 10:30 AM, I met with Dr. Rajesh Kumar at Apollo Hospital. We discussed CardioMax clinical trial results showing 30% improvement. The sentiment was positive. I shared the clinical data and product samples. Dr. Kumar agreed to review the data and schedule a follow-up meeting next week. Next steps: Send additional patient data and arrange a site visit. Attendees: Sales Representative, Medical Affairs."
  ];

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>🤖 AI Assistant</h3>
        <span className="ai-status">● Online</span>
      </div>

      <div className="ai-messages">
        {chatMessages.length === 0 ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">💬</div>
            <p>Log interaction details here we chat</p>
            <p className="ai-hint">💡 Type a message and watch the form auto-fill!</p>
            <div className="ai-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => {
                    setMessage(suggestion);
                    const extracted = extractFormData(suggestion);
                    if (Object.keys(extracted).length > 0) {
                      setFormData(prev => ({ ...prev, ...extracted }));
                    }
                  }}
                >
                  {suggestion.length > 100 ? suggestion.substring(0, 100) + '...' : suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input">
        <textarea
          className="ai-textarea"
          rows="2"
          placeholder="Describe Interaction..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="ai-send-btn" 
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          title="Send message"
        >
          📤
        </button>
      </div>

      <div className="ai-actions">
        <button 
          className="ai-log-btn"
          onClick={handleLog}
          disabled={isLoading}
        >
          📋 Log Interaction
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;