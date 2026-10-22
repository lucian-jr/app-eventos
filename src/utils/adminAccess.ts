export function adminTokenFromSearch(search: string): string | null {
    const value = new URLSearchParams(search).get('admin')?.trim();
    return value ? value : null;
}

export function pathWithAdmin(path: string, adminToken: string | null): string {
    if (!adminToken) return path;
    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}admin=${encodeURIComponent(adminToken)}`;
}

export function adminQuery(adminToken?: string | null): string {
    if (!adminToken) return '';
    return `&admin=${encodeURIComponent(adminToken)}`;
}

// Cliente sem eventos. Sem login, a API ainda exige um usuário existente para honrar o token.
const ADMIN_STANDIN_USER_ID = 2;

export function adminRequestUserId(userId: number | undefined, adminToken: string | null): number {
    if (userId) return userId;
    if (adminToken) return ADMIN_STANDIN_USER_ID;
    return 0;
}
