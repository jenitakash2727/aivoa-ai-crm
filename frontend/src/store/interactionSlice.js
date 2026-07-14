import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interactionAPI, hcpAPI, chatAPI } from '../api/agentAPI';

export const logInteraction = createAsyncThunk(
  'interactions/log',
  async (interactionData) => {
    const response = await interactionAPI.log(interactionData);
    return response;
  }
);

export const editInteraction = createAsyncThunk(
  'interactions/edit',
  async (editData) => {
    const response = await interactionAPI.edit(editData);
    return response;
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async ({ message, hcpId }) => {
    const response = await chatAPI.sendMessage(message, hcpId);
    return response;
  }
);

export const searchHCP = createAsyncThunk(
  'hcps/search',
  async (query) => {
    const response = await hcpAPI.search(query);
    return response;
  }
);

export const getHCPHistory = createAsyncThunk(
  'hcps/history',
  async (hcpId) => {
    const response = await hcpAPI.getHistory(hcpId);
    return response;
  }
);

export const getHCPList = createAsyncThunk(
  'hcps/list',
  async () => {
    const response = await hcpAPI.list();
    return response;
  }
);

export const getSuggestions = createAsyncThunk(
  'hcps/suggestions',
  async (hcpId) => {
    const response = await hcpAPI.getSuggestions(hcpId);
    return response;
  }
);

const initialState = {
  loading: false,
  error: null,
  interactions: [],
  chatMessages: [],
  hcpList: [],
  searchResults: [],
  currentHCP: null,
  hcpHistory: null,
  suggestions: [],
  followUp: null,
  currentInteraction: null,
};

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChat: (state) => {
      state.chatMessages = [];
    },
    setCurrentHCP: (state, action) => {
      state.currentHCP = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInteraction = action.payload;
        state.chatMessages.push({
          role: 'assistant',
          content: `✅ Interaction logged successfully! ID: ${action.payload.interaction_id}`
        });
      })
      .addCase(logInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(editInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessages.push({
          role: 'assistant',
          content: `✅ Interaction ${action.payload.interaction_id} updated successfully!`
        });
      })
      .addCase(editInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessages.push({
          role: 'assistant',
          content: action.payload.response || 'Response received!'
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(searchHCP.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchHCP.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchHCP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getHCPList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHCPList.fulfilled, (state, action) => {
        state.loading = false;
        state.hcpList = action.payload;
      })
      .addCase(getHCPList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getHCPHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHCPHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.hcpHistory = action.payload;
      })
      .addCase(getHCPHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.suggestions || [];
      })
      .addCase(getSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addChatMessage, clearChat, setCurrentHCP, clearError } = interactionSlice.actions;
export default interactionSlice.reducer;