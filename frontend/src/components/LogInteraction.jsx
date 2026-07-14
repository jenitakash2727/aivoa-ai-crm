import React, { useState } from 'react';
import InteractionForm from './InteractionForm';
import AIAssistant from './AIAssistant';
import './LogInteraction.css';

const LogInteraction = () => {
  const [formData, setFormData] = useState({
    hcp_name: '',
    interaction_type: 'meeting',
    date: '',
    time: '',
    attendees: '',
    topics: '',
    voice_note: '',
    materials: '',
    samples: '',
    sentiment: '',
    outcomes: '',
    follow_up: '',
  });
  const [chatMessages, setChatMessages] = useState([]);

  return (
    <div className="log-interaction-wrapper">
      <div className="split-container">
  
        <div className="split-left-panel">
          <InteractionForm 
            formData={formData}
            setFormData={setFormData}
          />
        </div>
        
     
        <div className="split-right-panel">
          <AIAssistant 
            formData={formData}
            setFormData={setFormData}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
          />
        </div>
      </div>
    </div>
  );
};

export default LogInteraction;