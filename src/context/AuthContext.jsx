import { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_API } from '../services/api';
import { supabase } from '../services/supabase';

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
        if (supabase) {
            // Safety timeout: ensure loading ends eventually
            const timeout = setTimeout(() => setLoading(false), 2000);

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                try {
                    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        if (session?.user) {
                            const { data: dbUser } = await supabase.from('users').select('*').eq('email', session.user.email).single();
                            if (dbUser) {
                                setUser(dbUser);
                                localStorage.setItem('flowspace_user', JSON.stringify(dbUser));
                            }
                        }
                    }
                    if (event === 'SIGNED_OUT') {
                        setUser(null);
                        localStorage.removeItem('flowspace_user');
                    }
                } catch (err) {
                    console.error('Auth sync error:', err);
                } finally {
                    setLoading(false);
                    clearTimeout(timeout);
                }
            });

            return () => {
              subscription.unsubscribe();
              clearTimeout(timeout);
            };
        } else {
            setLoading(false);
        }
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

    const loginWithGoogle = async () => {
        if (!supabase) throw new Error('Supabase chưa được cấu hình');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/',
            },
        });
        if (error) throw error;
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        localStorage.removeItem('flowspace_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loginWithGoogle, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
