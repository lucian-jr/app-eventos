import axios from 'axios'
import { api } from '../api'
import type { DashboardGetResponseType } from './dashboard.types'

export const getDashboardData = async (id_evento: number) => {
    try {
        const response = await api.get(`get_dashboard_data/${id_evento}?v=${Date.now()}`);
        
        const data: DashboardGetResponseType = response.data;

        return data;

    } catch (error) {
        console.log('dashboard.service/getDashboardData error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar os eventos.';

        return {
            'status': 'error',
            'message': message,
            'dashboard_data': null
        };
    }
}