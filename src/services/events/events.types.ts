export type DevicesType = {
    name: string
    number: string
    numero_impressora: string | null
    operador?: string | null
}

export type EventDeviceType = DevicesType & {
    id?: number
    id_usuario?: number | null
    id_notebook?: number | null
    login?: string | null
    senha?: string | null
}

export type NotebookReaderType = {
    number: string
}

export type NotebookPayloadType = {
    login: string
    senha: string
    leitores: NotebookReaderType[]
}

export type ProductsType = {
    name: string
    value: string
    quantity: number | null
}

export type EventType = {
    id: number
    nome: string
    id_pedido?: string | number | null
    data_evento: string
    data_fim?: string | null
    login_evento?: string | null
    senha_evento?: string | null
    tem_vouchers?: boolean
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
    id_pedido: string | null
    data_evento: string
    data_fim: string
    login_evento: string
    senha_evento: string
    notebooks: NotebookPayloadType[]
    devices: DevicesType[]
    products: ProductsType[]
}

export type PutEventType = {
    user_id: number | undefined
    id: number
    nome: string
    id_pedido: string | null
    data_evento: string
    data_fim: string
    login_evento: string
    senha_evento: string
    new_devices: DevicesType[]
    operadores_update: Array<{
        id_usuario: number
        operador: string | null
    }>
    notebooks_update: Array<{
        id_usuario: number
        login: string
        senha: string
    }>
    new_readers: Array<{
        id_notebook: number
        number: string
    }>
    new_notebooks: NotebookPayloadType[]
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
