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

export const getVoucherGenerationStatus = async (): Promise<VoucherStatusResponseType> => {
    try {
        const response = await api.get(`consultar_status_geracao?v=${Date.now()}`);
        
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