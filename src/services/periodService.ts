import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Period } from '../types';

export const getActivePeriods = async (): Promise<Period[]> => {
  try {
    const response = await apiClient.get<Period[]>(
      `${API_ENDPOINTS.ADMIN.PERIODS}/open`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active periods:', error);
    throw error;
  }
};

export const getAllPeriods = async (): Promise<Period[]> => {
  try {
    const response = await apiClient.get<Period[]>(
      API_ENDPOINTS.ADMIN.PERIODS
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching periods:', error);
    throw error;
  }
};

export const getCurrentPeriod = async (): Promise<Period> => {
  try {
    const response = await apiClient.get<Period>(
      `${API_ENDPOINTS.ADMIN.PERIODS}/current`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current period:', error);
    throw error;
  }
};
