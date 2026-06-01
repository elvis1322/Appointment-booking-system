import type { AuthResponse, User } from '../types/auth.types';

/** Përgjigje nga .NET (camelCase ose PascalCase) → format i brendshëm për UI dhe localStorage */
export function mapUserResponseToAuth(data: unknown): AuthResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Përgjigje e pavlefshme nga serveri.');
    }
    const d = data as Record<string, unknown>;

    const pickStr = (camel: string, pascal: string): string => {
        const v = d[camel] ?? d[pascal];
        return v == null ? '' : String(v);
    };

    const token = pickStr('token', 'Token');
    const refreshToken = pickStr('refreshToken', 'RefreshToken');
    const id = pickStr('id', 'Id');
    const email = pickStr('email', 'Email');
    const firstName = pickStr('firstName', 'FirstName');
    const lastName = pickStr('lastName', 'LastName');
    const role = pickStr('role', 'Role');
    const gjinia = pickStr('gjinia', 'Gjinia');
    if (!token) {
        throw new Error('Token mungon në përgjigje.');
    }

    const roles = role ? [role] : ['Client'];

    const user: User = {
        id,
        email,
        firstName,
        lastName,
        roles,
     gjinia: gjinia || undefined, 
    };

    return { token, refreshToken, user };
}
