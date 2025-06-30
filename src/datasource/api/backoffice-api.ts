import axios from 'axios';
import { config } from '../../config/env';


const BASE_URL = config.EXTERNAL_API_URL;

export const BackofficeAPI = {
    insertSale: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/sales/full`, data); // ← aquí estaba mal
        return response.data;
    },

    insertSaleDetail: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/sale-details`, data);
        return response.data;
    },

    insertClient: async (data: any) => {
        const response = await axios.post(`${BASE_URL}/clients`, data);
        return response.data;
    },

    getProducts: async () => {
        const response = await axios.get(`${BASE_URL}/products`);
        return response.data;
    },

    getUsers: async () => {
        const response = await axios.get(`${BASE_URL}/user_auth`);
        return response.data;
    }
};
