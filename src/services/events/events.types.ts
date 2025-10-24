export type eventType = {
    id: number
    nome: string
    data_evento: string
};

export type eventsGetResponseType = {
    status: string
    message: string
    events_data: eventType[] | null
};