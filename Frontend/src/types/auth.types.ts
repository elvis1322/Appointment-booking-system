export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    gjinia?: string;
};

export type AuthResponse = {
    token: string;
    refreshToken: string;
    user: User;
};

export const AUTH_VERSION = '1.0';
