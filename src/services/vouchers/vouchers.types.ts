// src/services/vouchers/vouchers.types.ts

export type VoucherJobRequestType = {
    id_evento: number;
    id_produto: number;
    quantidade: number;
}

export type VoucherJobResponseType = {
    status: 'success' | 'error';
    message?: string;
    job_id?: number | null;
}

// Novo tipo para o detalhe de cada produto
export type VoucherJobDetailType = {
    id_produto: number;
    nome_produto: string;
    processados: number;
    total: number;
    status: string;
}

// Atualizamos o tipo principal para incluir o array opcional 'detalhes'
export type VoucherStatusDataType = {
    status_job: 'pendente' | 'processando' | 'concluido' | 'erro' | 'idle';
    processados: number;
    total: number;
    porcentagem: number;
    detalhes?: VoucherJobDetailType[]; // <--- NOVO CAMPO
}

export type VoucherStatusResponseType = {
    status: 'success' | 'error';
    message?: string;
    data: VoucherStatusDataType | null;
}