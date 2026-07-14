import React from 'react';
import './InteractionForm.css';

const InteractionForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSentimentChange = (sentiment) => {
    setFormData({
      ...formData,
      sentiment: sentiment,
    });
  };

  const handleAddMaterial = () => {
    const material = prompt("Enter material name:");
    if (material && material.trim()) {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials ? `${prev.materials}, ${material.trim()}` : material.trim()
      }));
    }
  };

  const handleAddSample = () => {
    const sample = prompt("Enter sample name:");
    if (sample && sample.trim()) {
      setFormData(prev => ({
        ...prev,
        samples: prev.samples ? `${prev.samples}, ${sample.trim()}` : sample.trim()
      }));
    }
  };

  const handleRemoveMaterial = (index) => {
    const items = formData.materials ? formData.materials.split(',').filter((_, i) => i !== index) : [];
    setFormData(prev => ({
      ...prev,
      materials: items.join(', ')
    }));
  };

  const handleRemoveSample = (index) => {
    const items = formData.samples ? formData.samples.split(',').filter((_, i) => i !== index) : [];
    setFormData(prev => ({
      ...prev,
      samples: items.join(', ')
    }));
  };

  const getMaterialsList = () => {
    if (!formData.materials) return [];
    return formData.materials.split(',').map(item => item.trim()).filter(item => item);
  };

  const getSamplesList = () => {
    if (!formData.samples) return [];
    return formData.samples.split(',').map(item => item.trim()).filter(item => item);
  };

  return (
    <div className="interaction-form">
      <div className="form-header">
        <h2>📋 Log HCP Interaction</h2>
      </div>

   
      <div className="form-section">
        <h3>Interaction Details</h3>
        
   
        <div className="form-row">
          <div className="form-group">
            <label>HCP Name</label>
            <input
              type="text"
              name="hcp_name"
              placeholder="Search or select HCP..."
              value={formData.hcp_name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Interaction Type</label>
            <select
              name="interaction_type"
              value={formData.interaction_type || 'meeting'}
              onChange={handleChange}
            >
              <option value="meeting">Meeting</option>
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="virtual">Virtual</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={formData.time || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>👥 Attendees</h3>
        <div className="form-group">
          <input
            type="text"
            name="attendees"
            placeholder="Enter names or search..."
            value={formData.attendees || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📝 Topics Discussed</h3>
        <div className="form-group">
          <textarea
            name="topics"
            rows="3"
            placeholder="Enter key discussion points..."
            value={formData.topics || ''}
            onChange={handleChange}
          />
        </div>
      </div>


      <div className="form-section">
        <h3>🎤 Summarize from Voice Note <span className="consent-badge">(Requires Consent)</span></h3>
        <div className="form-group">
          <textarea
            name="voice_note"
            rows="3"
            placeholder="Paste voice note transcription or upload audio file..."
            value={formData.voice_note || ''}
            onChange={handleChange}
          />
        </div>
      </div>


      <div className="form-section">
        <h3>📎 Materials Shared / Samples Distributed</h3>

        <div className="form-group">
          <label>Materials Shared</label>
          <div className="search-add-wrapper">
            <div className="search-add-input-wrapper">
              <span className="input-icon"></span>
              <input
                type="text"
                name="materials"
                placeholder="Search/Add"
                value={formData.materials || ''}
                onChange={handleChange}
                className="search-add-input"
              />
            </div>
            <button type="button" className="search-add-btn" onClick={handleAddMaterial}>
              🔍
            </button>
          </div>
        </div>
        

        {getMaterialsList().length > 0 && (
          <div className="materials-list">
            {getMaterialsList().map((item, index) => (
              <span key={index} className="material-chip">
                {item}
                <button 
                  type="button" 
                  className="chip-remove"
                  onClick={() => handleRemoveMaterial(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="no-materials">
          No materials added.
        </div>
      </div>


      <div className="form-section">
        <h3>📦 Samples Distributed</h3>
        
        <div className="form-group">
          <div className="search-add-wrapper">
            <div className="search-add-input-wrapper">
              <span className="input-icon"></span>
              <input
                type="text"
                name="samples"
                placeholder="Add sample..."
                value={formData.samples || ''}
                onChange={handleChange}
                className="search-add-input"
              />
            </div>
            <button type="button" className="search-add-btn" onClick={handleAddSample}>
              ➕
            </button>
          </div>
        </div>
        

        {getSamplesList().length > 0 && (
          <div className="materials-list">
            {getSamplesList().map((item, index) => (
              <span key={index} className="material-chip">
                {item}
                <button 
                  type="button" 
                  className="chip-remove"
                  onClick={() => handleRemoveSample(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="no-materials">
          No samples added.
        </div>
      </div>

 
      <div className="form-section">
        <h3>💬 Observed/Inferred HCP Sentiment</h3>
        <div className="sentiment-group">
          <label 
            className={`sentiment-option ${formData.sentiment === 'positive' ? 'selected selected-positive' : ''}`}
          >
            <input
              type="radio"
              name="sentiment"
              value="positive"
              checked={formData.sentiment === 'positive'}
              onChange={() => handleSentimentChange('positive')}
            />
            <span className="sentiment-emoji">😊</span> Positive
          </label>
          <label 
            className={`sentiment-option ${formData.sentiment === 'neutral' ? 'selected selected-neutral' : ''}`}
          >
            <input
              type="radio"
              name="sentiment"
              value="neutral"
              checked={formData.sentiment === 'neutral'}
              onChange={() => handleSentimentChange('neutral')}
            />
            <span className="sentiment-emoji">😐</span> Neutral
          </label>
          <label 
            className={`sentiment-option ${formData.sentiment === 'negative' ? 'selected selected-negative' : ''}`}
          >
            <input
              type="radio"
              name="sentiment"
              value="negative"
              checked={formData.sentiment === 'negative'}
              onChange={() => handleSentimentChange('negative')}
            />
            <span className="sentiment-emoji">😞</span> Negative
          </label>
        </div>
      </div>


      <div className="form-section">
        <h3>📌 Outcomes</h3>
        <div className="form-group">
          <textarea
            name="outcomes"
            rows="2"
            placeholder="Key outcomes or agreements..."
            value={formData.outcomes || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📅 Follow-up Actions</h3>
        <div className="form-group">
          <textarea
            name="follow_up"
            rows="2"
            placeholder="Enter next steps or tasks..."
            value={formData.follow_up || ''}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractionForm;