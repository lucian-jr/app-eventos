export type userRequestType = {
    login: string
    password: string
};

export type userResponseType = {
    status: string
    message: string
    user_data: {
        id: number
        nome: string
        email: string
    };
};

export type userType = {
    id: number
    nome: string
    email: string
};