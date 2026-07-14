export type DevicesType = {
    name: string
    number: string
    numero_impressora: string | null
    operador?: string | null
}

export type EventDeviceType = DevicesType & {
    id?: number
    id_usuario?: number | null
}

export type ProductsType = {
    name: string
    value: string
    quantity: number | null
}

export type EventType = {
    id: number
    nome: string
    data_evento: string
    data_fim?: string | null
    login_evento?: string | null
    senha_evento?: string | null
    devices: EventDeviceType[]
    products: ProductsType[]
};

export type EventsGetResponseType = {
    status: string
    message: string
    events_data: EventType[] | null
};

export type PostEventType = {
    user_id: number | undefined
    nome: string
    data_evento: string
    data_fim: string
    login_evento: string
    senha_evento: string
    devices: DevicesType[]
    products: ProductsType[]
}

export type PutEventType = {
    user_id: number | undefined
    id: number
    nome: string
    data_evento: string
    data_fim: string
    login_evento: string
    senha_evento: string
    new_devices: DevicesType[]
    operadores_update: Array<{
        id_usuario: number
        operador: string | null
    }>
}

export type EventGetResponseType = {
    status: string
    message: string
    event_data: EventType | null
};


export type EventPostResponseType = {
    status: string
    message: string
    event_id: number
};

export type EventPutResponseType = {
    status: string
    message: string
};
