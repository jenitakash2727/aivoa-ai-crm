import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHCPList, searchHCP, getHCPHistory, getSuggestions, editInteraction } from '../store/interactionSlice';
import './InteractionList.css';

const InteractionList = () => {
  const dispatch = useDispatch();
  const { hcpList, searchResults, loading, hcpHistory, suggestions } = useSelector(
    (state) => state.interactions
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHCP, setSelectedHCP] = useState(null);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    new_notes: '',
    new_type: 'meeting',
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(getHCPList());
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchHCP(searchQuery));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectHCP = (hcp) => {
    setSelectedHCP(hcp);
    dispatch(getHCPHistory(hcp.id));
    dispatch(getSuggestions(hcp.id));
  };

  const handleEditClick = (interaction) => {
    setEditingInteraction(interaction);
    setEditFormData({
      new_notes: interaction.summary || '',
      new_type: interaction.type || 'meeting',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      await dispatch(editInteraction({
        interaction_id: editingInteraction.id,
        new_notes: editFormData.new_notes,
        new_type: editFormData.new_type,
      })).unwrap();
      
      if (selectedHCP) {
        dispatch(getHCPHistory(selectedHCP.id));
        dispatch(getSuggestions(selectedHCP.id));
      }
      
      setShowEditModal(false);
      setEditingInteraction(null);
      alert('✅ Interaction updated successfully!');
    } catch (error) {
      alert('❌ Error updating interaction: ' + error.message);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'sentiment-positive';
      case 'negative': return 'sentiment-negative';
      default: return 'sentiment-neutral';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  const displayedHCPs = searchResults.length > 0 ? searchResults : hcpList;

  return (
    <div className="interaction-list">
      <div className="search-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search HCPs by name, specialty, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
        <button className="refresh-btn" onClick={() => dispatch(getHCPList())}>
          🔄
        </button>
      </div>

      {loading && (
        <div className="list-loading">
          <div className="loading-spinner-small"></div>
          <span>Loading...</span>
        </div>
      )}

      <div className="table-container">
        <table className="hcp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Hospital</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedHCPs.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No HCPs found. Add some via Admin Panel.</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedHCPs.map((hcp) => (
                <tr
                  key={hcp.id}
                  className={selectedHCP?.id === hcp.id ? 'selected' : ''}
                  onClick={() => handleSelectHCP(hcp)}
                >
                  <td className="hcp-name">{hcp.name}</td>
                  <td>{hcp.specialty || '—'}</td>
                  <td>{hcp.hospital || '—'}</td>
                  <td>
                    <button className="view-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHCP(hcp);
                    }}>
                      📊 View History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedHCP && hcpHistory && (
        <div className="history-section">
          <div className="history-header">
            <h4>📋 History for {selectedHCP.name}</h4>
            <span className="history-count">{hcpHistory.history?.length || 0} interactions</span>
          </div>

          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Summary</th>
                  <th>Sentiment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hcpHistory.history?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No interactions found
                    </td>
                  </tr>
                ) : (
                  hcpHistory.history?.map((interaction, index) => (
                    <tr key={index}>
                      <td className="history-date">{interaction.date}</td>
                      <td>
                        <span className="type-badge">{interaction.type}</span>
                      </td>
                      <td className="history-summary">{interaction.summary}</td>
                      <td>
                        <span className={`sentiment-badge ${getSentimentColor(interaction.sentiment)}`}>
                          {getSentimentEmoji(interaction.sentiment)} {interaction.sentiment || 'neutral'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(interaction);
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {suggestions && suggestions.length > 0 && (
            <div className="suggestions-card">
              <div className="suggestions-header">
                <span className="suggestions-icon">💡</span>
                <h5>AI Suggested Next Steps</h5>
              </div>
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <span className="suggestion-number">{index + 1}.</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showEditModal && editingInteraction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Edit Interaction</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Interaction Type</label>
                <select
                  value={editFormData.new_type}
                  onChange={(e) => setEditFormData({ ...editFormData, new_type: e.target.value })}
                >
                  <option value="meeting">Meeting</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="virtual">Virtual</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="5"
                  value={editFormData.new_notes}
                  onChange={(e) => setEditFormData({ ...editFormData, new_notes: e.target.value })}
                  placeholder="Update interaction notes..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleEditSubmit}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionList;