export type DashboardProductsType = {
    id: number
    nome: string
    total_resgates: number
    total_devolucoes: number
    porcentagem_resgates: number
    porcentagem_devolucoes: number
}

export type DashboardDevicesType = {
    id: number;
    nome: string;
    number: string;
    codigo_impressora: string | null;
    login: string | null;
    senha: string | null;
    operador: string | null;
    vouchers_produto: Record<number, number>;
};

export type DashboardUserType = {
    login: string;
    senha: string;
};

export type DashboardDataType = {
    user: DashboardUserType
    products_data: DashboardProductsType[]
    devices_data: DashboardDevicesType[]
}

export type DashboardGetResponseType = {
    status: string
    message: string
    dashboard_data: DashboardDataType
}