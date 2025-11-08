import axios from 'axios'
import { api } from '../api'
import type { EventsGetResponseType, EventGetResponseType, PostEventType, EventPostResponseType } from './events.types'

export const getEvents = async (user_id: number) => {
    try {
        const response = await api.get(`get_user_events/${user_id}?v=${Date.now()}`);
        
        const data: EventsGetResponseType = response.data;

        return data;

    } catch (error) {
        console.log('events.service/getEvents error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar os eventos.';

        return {
            'status': 'error',
            'message': message,
            'events_data': null
        };
    }
}

export const getEvent = async (id: number, user_id: number) => {
    try {
        const response = await api.get(`get_user_event/${id}/${user_id}?v=${Date.now()}`);
        
        const data: EventGetResponseType = response.data;

        return data;

    } catch (error) {
        console.log('events.service/getEvent error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar os eventos.';

        return {
            'status': 'error',
            'message': message,
            'event_data': null
        };
    }
}

export const postEvent = async (eventData: PostEventType) => {
    try {
        const response = await api.post(`post_event?v=${Date.now()}`, eventData);
        
        const data: EventPostResponseType = response.data;

        return data;

    } catch (error) {
        console.log('events.service/postEvent error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao criar o evento';

        return {
            'status': 'error',
            'message': message,
            'event_id': null
        };
    }
}