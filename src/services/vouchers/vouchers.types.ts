export type VoucherJobRequestType = {
    id_evento: number;
    id_produto: number;
    quantidade: number;
}

// Resposta ao CRIAR o pedido (POST)
export type VoucherJobResponseType = {
    status: 'success' | 'error';
    message?: string;
    job_id?: number | null;
}

// Resposta ao CONSULTAR o status (GET)
export type VoucherStatusDataType = {
    status_job: 'pendente' | 'processando' | 'concluido' | 'erro' | 'idle';
    processados: number;
    total: number;
    porcentagem: number;
}

export type VoucherStatusResponseType = {
    status: 'success' | 'error';
    message?: string;
    data: VoucherStatusDataType | null;
}