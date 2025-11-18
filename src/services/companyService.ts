import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Company } from '../types';

export const getActiveCompanies = async (): Promise<Company[]> => {
  try {
    const response = await apiClient.get<Company[]>(
      `${API_ENDPOINTS.ADMIN.COMPANIES}/active`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active companies:', error);
    throw error;
  }
};

export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    const response = await apiClient.get<Company[]>(
      API_ENDPOINTS.ADMIN.COMPANIES
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};
