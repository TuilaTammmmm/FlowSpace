import { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_API } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check local session
        const storedUser = localStorage.getItem('flowspace_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('flowspace_user');
            }
        }

        // 2. Listen to Supabase Auth changes (for Google OAuth)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    // Sync with our public.users table
                    const { data: dbUser } = await supabase.from('users').select('*').eq('email', session.user.email).single();
                    if (dbUser) {
                        setUser(dbUser);
                        localStorage.setItem('flowspace_user', JSON.stringify(dbUser));
                    } else if (event === 'SIGNED_IN') {
                        // Create one if it doesn't exist (First time Google Login)
                        const { data: newUser } = await supabase.from('users').insert({
                            email: session.user.email,
                            name: session.user.user_metadata.full_name || 'Google User',
                            avatar_url: session.user.user_metadata.avatar_url || '',
                            password: '' // Nullable or empty for OAuth
                        }).select().single();
                        if (newUser) {
                            setUser(newUser);
                            localStorage.setItem('flowspace_user', JSON.stringify(newUser));
                        }
                    }
                }
            }
            if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('flowspace_user');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
