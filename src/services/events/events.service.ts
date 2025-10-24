import axios from 'axios'
import { api } from '../api'
import type { eventsGetResponseType } from './events.types'

export const getEvents = async (user_id  : number ) => {
    try {
        const response = await api.get(`get_user_events/${user_id}?v=${Date.now()}`);
        
        const data: eventsGetResponseType = response.data;

        return data;

    } catch (error) {
        console.log('auth.service/getEvents error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar os eventos.'

        return {
            'status': 'error',
            'message': message,
            'events_data': null
        }
    }
} 