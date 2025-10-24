import axios from 'axios';
import { api } from '../api.ts'

import type { userRequestType, userResponseType } from './auth.types'

export const checkIsAuth = async () => {
    try {
        const response = await api.get(`check_is_auth?v=${Date.now()}`);

        const data:userResponseType = response.data

        return data;
    } catch(error) {
        console.log('auth.service/checkIsAuth error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao realizar a autênticação.'

        return {
            'status': 'error',
            'message': message,
            'user_data': null
        }
    }
}

export const authLogin = async ({login, password} : userRequestType) => {
    try {
        const response = await api.post(`auth_login?v=${Date.now()}`, {
            login,
            senha: password
        });

        const data:userResponseType = response.data

        return data;
    } catch(error) {
        console.log('auth.service/authLogin error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao realizar a autênticação.'

        return {
            'status': 'error',
            'message': message,
            'user_data': null
        }
    }
}