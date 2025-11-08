export type DevicesType = {
    name: string
    number: string
    numero_impressora: string | null
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
    devices: DevicesType[]
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
    devices: DevicesType[]
    products: ProductsType[]
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