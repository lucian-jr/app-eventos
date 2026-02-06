import axios from 'axios'
import { api } from '../api' // Supondo que esteja em src/services/api
import type { 
    VoucherJobRequestType, 
    VoucherJobResponseType, 
    VoucherStatusResponseType 
} from './vouchers.types'

export const createVoucherGenerationJob = async (jobData: VoucherJobRequestType): Promise<VoucherJobResponseType> => {
    try {
        const response = await api.post(`criar_pedido_geracao?v=${Date.now()}`, jobData);
        
        const data: VoucherJobResponseType = response.data;

        return data;

    } catch (error) {
        console.log('vouchers.service/createVoucherGenerationJob error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao iniciar a geração de vouchers.';

        return {
            'status': 'error',
            'message': message,
            'job_id': null
        };
    }
}

export const getVoucherGenerationStatus = async (eventId?: number): Promise<VoucherStatusResponseType> => {
    try {
        const paramEvento = eventId ? `&id_evento=${eventId}` : '';
        
        const response = await api.get(`consultar_status_geracao?v=${Date.now()}${paramEvento}`);
        
        const data: VoucherStatusResponseType = response.data;

        return data;

    } catch (error) {
        console.log('vouchers.service/getVoucherGenerationStatus error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao consultar o status.';

        return {
            'status': 'error',
            'message': message,
            'data': null
        };
    }
}