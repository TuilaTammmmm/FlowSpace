import { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_API } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();
export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects]           = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [toasts, setToasts]               = useState([]); // {id, title, desc, type}

    const showToast = (title, desc, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, desc, type }]);
        setTimeout(() => removeToast(id), 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const loadProjects = async () => {
        if (!user) return;
        setLoadingProjects(true);
        try {
            const data = await MOCK_API.getProjectsByUserId(user.id);
            setProjects(data);
            if (data.length > 0 && !activeProjectId) setActiveProjectId(data[0].id);
        } catch (err) {
            console.error('Failed to load projects:', err);
            setProjects([]);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        if (user) { loadProjects(); }
        else { setProjects([]); setActiveProjectId(null); }
    }, [user]);

    const changeActiveProject = (id) => setActiveProjectId(id);

    const addProject = async (name) => {
        if (!user) return;
        try {
            const newProj = await MOCK_API.createProject(user.id, name);
            setProjects(prev => [...prev, newProj]);
            setActiveProjectId(newProj.id);
            showToast('Thành công', `Đã tạo dự án "${name}"`);
            return newProj;
        } catch (err) {
            console.error('Failed to add project:', err);
            showToast('Lỗi', 'Không thể tạo dự án. Vui lòng thử lại.', 'error');
            throw err;
        }
    };

    const renameProject = async (id, newName) => {
        const updated = await MOCK_API.updateProject(id, newName);
        setProjects(prev => prev.map(p => p.id === id ? { ...p, name: updated.name } : p));
        showToast('Thành công', `Đã đổi tên dự án thành "${newName}"`);
    };

    const deleteProject = async (id) => {
        const projName = projects.find(p => p.id === id)?.name;
        await MOCK_API.deleteProject(id);
        const remaining = projects.filter(p => p.id !== id);
        setProjects(remaining);
        if (activeProjectId === id) {
            setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
        }
        showToast('Đã xóa', `Dự án "${projName}" và tất cả các thẻ đã bị xóa.`);
    };

    return (
        <ProjectContext.Provider value={{
            projects, activeProjectId, changeActiveProject,
            loadingProjects, loadProjects,
            addProject, renameProject, deleteProject,
            toasts, showToast, removeToast
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
