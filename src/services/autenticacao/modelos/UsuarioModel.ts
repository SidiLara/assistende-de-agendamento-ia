export type Role = 'Admin' | 'Consultor';

export interface Usuario {
    id: string;
    email: string;
    // A senha não deve ser armazenada no estado do frontend após o login.
    // O backend a valida e retorna o objeto do usuário sem ela.
    role: Role;
}
