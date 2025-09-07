import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { botService } from './botService';

const BotContext = createContext();

const initialState = {
  bots: [],
  loading: false,
  error: null,
  selectedBot: null,
  stats: {
    totalBots: 0,
    activeBots: 0,
    totalMessages: 0,
    totalUsers: 0
  }
};

const botReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_BOTS':
      return {
        ...state,
        bots: action.payload,
        loading: false,
        stats: {
          totalBots: action.payload.length,
          activeBots: action.payload.filter(bot => bot.status === 'online').length,
          totalMessages: action.payload.reduce((sum, bot) => sum + bot.messages, 0),
          totalUsers: action.payload.reduce((sum, bot) => sum + bot.users, 0)
        }
      };

    case 'ADD_BOT':
      return {
        ...state,
        bots: [...state.bots, action.payload],
        stats: {
          ...state.stats,
          totalBots: state.stats.totalBots + 1,
          activeBots: action.payload.status === 'online' ? state.stats.activeBots + 1 : state.stats.activeBots
        }
      };

    case 'UPDATE_BOT':
      return {
        ...state,
        bots: state.bots.map(bot =>
          bot.id === action.payload.id ? { ...bot, ...action.payload } : bot
        )
      };

    case 'DELETE_BOT':
      return {
        ...state,
        bots: state.bots.filter(bot => bot.id !== action.payload),
        stats: {
          ...state.stats,
          totalBots: state.stats.totalBots - 1
        }
      };

    case 'SELECT_BOT':
      return { ...state, selectedBot: action.payload };

    default:
      return state;
  }
};

export const BotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(botReducer, initialState);

  // Load bots on component mount
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const bots = await botService.getBots();
      dispatch({ type: 'SET_BOTS', payload: bots });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addBot = async (botData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newBot = await botService.createBot(botData);
      dispatch({ type: 'ADD_BOT', payload: newBot });
      return newBot;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateBot = async (botId, updates) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedBot = await botService.updateBot(botId, updates);
      dispatch({ type: 'UPDATE_BOT', payload: updatedBot });
      return updatedBot;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteBot = async (botId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await botService.deleteBot(botId);
      dispatch({ type: 'DELETE_BOT', payload: botId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const startBot = async (botId) => {
    try {
      await botService.startBot(botId);
      dispatch({ type: 'UPDATE_BOT', payload: { id: botId, status: 'online' } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const stopBot = async (botId) => {
    try {
      await botService.stopBot(botId);
      dispatch({ type: 'UPDATE_BOT', payload: { id: botId, status: 'offline' } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const selectBot = (bot) => {
    dispatch({ type: 'SELECT_BOT', payload: bot });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    loadBots,
    addBot,
    updateBot,
    deleteBot,
    startBot,
    stopBot,
    selectBot,
    clearError
  };

  return (
    <BotContext.Provider value={value}>
      {children}
    </BotContext.Provider>
  );
};

export const useBots = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBots must be used within a BotProvider');
  }
  return context;
};
