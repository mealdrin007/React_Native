import React, { createContext, ReactNode } from 'react';
import { useAsyncStorage } from '../components/useAsyncStorage';

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [token, setToken, loading] = useAsyncStorage('auth_Token', null)
    const [role, setRole] = useAsyncStorage('role_Id', null)
    const [name, setName] = useAsyncStorage('name', null)

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ token, role, name, setToken, setRole, setName }}>
            {children}
        </AuthContext.Provider>
    );
};