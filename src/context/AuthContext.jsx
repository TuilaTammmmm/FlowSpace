import { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_API } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('flowspace_user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await MOCK_API.login(email, password);
        setUser(data.user);
        localStorage.setItem('flowspace_user', JSON.stringify(data.user));
    };

    const register = async (email, password, name) => {
        const data = await MOCK_API.register(email, password, name);
        setUser(data.user);
        localStorage.setItem('flowspace_user', JSON.stringify(data.user));
    };

    const updateUserProfile = async (data) => {
        if (!user) return;
        const updatedUser = await MOCK_API.updateUserProfile(user.id, data);
        setUser(updatedUser);
        localStorage.setItem('flowspace_user', JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('flowspace_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
