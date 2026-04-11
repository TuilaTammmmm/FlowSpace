import { supabase, isSupabaseReady } from './supabase';

// ============================================================
// INITIAL DATA (fallback khi chưa có Supabase)
// ============================================================
const INITIAL_DB = {
    users: [
        { id: 1, email: 'dragonkiller2k5@gmail.com', password: '123', name: 'Đào Duy Tâm' }
    ],
    projects: [
        { id: 'p1', userId: 1, name: 'Dự án chính' },
        { id: 'p2', userId: 1, name: 'Đồ án 1' }
    ],
    tasks: [
        { id: 1, projectId: 'p1', title: 'Thiết kế logo', status: 'todo', tag: 'High', deadline: '2026-04-01', priority: 'Quan trọng', description: 'Logo đỏ gradient', tags: ['Design', 'UI'], createdAt: new Date().toISOString() },
        { id: 2, projectId: 'p1', title: 'Nghiên cứu React Context', status: 'in-progress', tag: 'Medium', deadline: '2026-04-03', priority: 'Trung bình', description: '', tags: ['Code'], createdAt: new Date().toISOString() }
    ]
};

const getDB = () => JSON.parse(localStorage.getItem('flowspace_db') || '{}');
const saveDB = (db) => localStorage.setItem('flowspace_db', JSON.stringify(db));

const initDB = () => {
    if (!localStorage.getItem('flowspace_db')) {
        localStorage.setItem('flowspace_db', JSON.stringify(INITIAL_DB));
        return;
    }
    const db = getDB();
    let changed = false;
    db.tasks = (db.tasks || []).map(t => {
        if (!Array.isArray(t.tags)) { t.tags = []; changed = true; }
        return t;
    });
    if (changed) saveDB(db);
};
initDB();

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// SUPABASE HELPERS
// ============================================================
const sb = {
    // Projects
    getProjectsByUserId: async (userId) => {
        const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (error) throw error;
        return data.map(p => ({ id: p.id, userId: p.user_id, name: p.name }));
    },

    createProject: async (userId, name) => {
        const { data, error } = await supabase.from('projects').insert({ user_id: userId, name }).select().single();
        if (error) throw error;
        return { id: data.id, userId: data.user_id, name: data.name };
    },

    updateProject: async (id, name) => {
        const { data, error } = await supabase.from('projects').update({ name }).eq('id', id).select().single();
        if (error) throw error;
        return { id: data.id, userId: data.user_id, name: data.name };
    },

    deleteProject: async (id) => {
        // Delete all tasks first
        await supabase.from('tasks').delete().eq('project_id', id);
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Tasks
    getTasksByProjectId: async (projectId) => {
        const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
        if (error) throw error;
        return data.map(t => ({
            id: t.id, projectId: t.project_id, title: t.title, description: t.description || '',
            status: t.status, tag: t.tag, priority: t.priority, deadline: t.deadline,
            tags: t.tags || [], createdAt: t.created_at
        }));
    },

    getAllTasks: async (userId) => {
        const { data: projects } = await supabase.from('projects').select('id').eq('user_id', userId);
        const ids = projects.map(p => p.id);
        if (ids.length === 0) return [];
        const { data, error } = await supabase.from('tasks').select('*').in('project_id', ids);
        if (error) throw error;
        return data.map(t => ({
            id: t.id, projectId: t.project_id, title: t.title, description: t.description || '',
            status: t.status, tag: t.tag, priority: t.priority, deadline: t.deadline,
            tags: t.tags || [], createdAt: t.created_at
        }));
    },

    createTask: async (taskData) => {
        const { data, error } = await supabase.from('tasks').insert({
            project_id: taskData.projectId, title: taskData.title, description: taskData.description || '',
            status: taskData.status || 'todo', tag: taskData.tag || 'Low',
            priority: taskData.priority || 'Thấp', deadline: taskData.deadline || null,
            tags: taskData.tags || []
        }).select().single();
        if (error) throw error;
        return { id: data.id, projectId: data.project_id, title: data.title, description: data.description, status: data.status, tag: data.tag, priority: data.priority, deadline: data.deadline, tags: data.tags || [], createdAt: data.created_at };
    },

    updateTask: async (taskId, updatedData) => {
        const patch = {};
        if (updatedData.title !== undefined) patch.title = updatedData.title;
        if (updatedData.description !== undefined) patch.description = updatedData.description;
        if (updatedData.status !== undefined) patch.status = updatedData.status;
        if (updatedData.tag !== undefined) patch.tag = updatedData.tag;
        if (updatedData.priority !== undefined) patch.priority = updatedData.priority;
        if (updatedData.deadline !== undefined) patch.deadline = updatedData.deadline || null;
        if (updatedData.tags !== undefined) patch.tags = updatedData.tags;
        const { data, error } = await supabase.from('tasks').update(patch).eq('id', taskId).select().single();
        if (error) throw error;
        return { id: data.id, projectId: data.project_id, title: data.title, description: data.description, status: data.status, tag: data.tag, priority: data.priority, deadline: data.deadline, tags: data.tags || [], createdAt: data.created_at };
    },

    deleteTask: async (taskId) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw error;
        return true;
    },

    // Daily Stats
    getDailyStats: async (userId) => {
        const { data, error } = await supabase.from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })
            .limit(30);
        if (error) throw error;
        return data.map(d => ({
            id: d.id, userId: d.user_id, date: d.date,
            total: d.total_tasks, done: d.completed_tasks,
            active: d.active_tasks, overdue: d.overdue_tasks
        }));
    },

    saveDailyStats: async (userId, stats) => {
        const { data, error } = await supabase.from('daily_stats')
            .upsert({
                user_id: userId,
                date: stats.date,
                total_tasks: stats.total,
                completed_tasks: stats.done,
                active_tasks: stats.active,
                overdue_tasks: stats.overdue
            }, { onConflict: 'user_id,date' })
            .select().single();
        if (error) throw error;
        return data;
    }
};

// ============================================================
// MOCK API (localStorage fallback)
// ============================================================
const local = {
    getProjectsByUserId: async (userId) => {
        await delay(80);
        return getDB().projects.filter(p => p.userId === userId);
    },

    createProject: async (userId, name) => {
        await delay(80);
        const db = getDB();
        const newProject = { id: 'p' + Date.now(), userId, name };
        db.projects.push(newProject);
        saveDB(db);
        return newProject;
    },

    updateProject: async (id, name) => {
        await delay(80);
        const db = getDB();
        const idx = db.projects.findIndex(p => p.id === id);
        if (idx > -1) { db.projects[idx].name = name; saveDB(db); return db.projects[idx]; }
        throw new Error('Project not found');
    },

    deleteProject: async (id) => {
        await delay(80);
        const db = getDB();
        db.projects = db.projects.filter(p => p.id !== id);
        db.tasks = db.tasks.filter(t => t.projectId !== id);
        saveDB(db);
        return true;
    },

    getTasksByProjectId: async (projectId) => {
        await delay(80);
        return getDB().tasks.filter(t => t.projectId === projectId);
    },

    getAllTasks: async () => {
        await delay(80);
        return getDB().tasks;
    },

    createTask: async (taskData) => {
        await delay(80);
        const db = getDB();
        const newTask = { ...taskData, id: Date.now(), tags: taskData.tags || [], createdAt: new Date().toISOString() };
        db.tasks.push(newTask);
        saveDB(db);
        return newTask;
    },

    updateTask: async (taskId, updatedData) => {
        await delay(80);
        const db = getDB();
        const idx = db.tasks.findIndex(t => t.id === taskId);
        if (idx > -1) {
            db.tasks[idx] = { ...db.tasks[idx], ...updatedData };
            saveDB(db);
            return db.tasks[idx];
        }
        throw new Error('Task not found');
    },

    deleteTask: async (taskId) => {
        await delay(80);
        const db = getDB();
        db.tasks = db.tasks.filter(t => t.id !== taskId);
        saveDB(db);
        return true;
    },

    login: async (email, password) => {
        await delay(200);
        const db = getDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Sai email hoặc mật khẩu');
        return { user, token: 'mock-jwt-' + user.id };
    },

    register: async (email, password, name) => {
        await delay(200);
        const db = getDB();
        if (db.users.some(u => u.email === email)) throw new Error('Email đã tồn tại!');
        const newUser = { id: Date.now(), email, password, name };
        db.users.push(newUser);
        saveDB(db);
        return { user: newUser, token: 'mock-jwt-' + newUser.id };
    },

    updateUserProfile: async (userId, data) => {
        await delay(80);
        const db = getDB();
        const idx = db.users.findIndex(u => u.id === userId);
        if (idx > -1) {
            db.users[idx] = { ...db.users[idx], ...data };
            saveDB(db);
            return db.users[idx];
        }
        throw new Error('User not found');
    },

    clearData: () => {
        localStorage.removeItem('flowspace_db');
        localStorage.removeItem('flowspace_stats');
        initDB();
        return true;
    },

    getDailyStats: async (userId) => {
        await delay(80);
        const stats = JSON.parse(localStorage.getItem('flowspace_stats') || '[]');
        return stats.filter(s => s.userId === userId);
    },

    saveDailyStats: async (userId, stats) => {
        await delay(80);
        const dbStats = JSON.parse(localStorage.getItem('flowspace_stats') || '[]');
        const idx = dbStats.findIndex(s => s.userId === userId && s.date === stats.date);
        const newEntry = { ...stats, userId };
        if (idx > -1) dbStats[idx] = newEntry;
        else dbStats.push(newEntry);
        localStorage.setItem('flowspace_stats', JSON.stringify(dbStats));
        return newEntry;
    }
};

// ============================================================
// UNIFIED MOCK_API — uses Supabase if ready, else localStorage
// ============================================================
export const MOCK_API = {
    // Auth always uses localStorage (no Supabase auth yet)
    login: local.login,
    register: local.register,
    updateUserProfile: local.updateUserProfile,
    clearData: local.clearData,

    // Projects
    getProjectsByUserId: async (userId) => isSupabaseReady() ? sb.getProjectsByUserId(userId) : local.getProjectsByUserId(userId),
    createProject: async (userId, name) => isSupabaseReady() ? sb.createProject(userId, name) : local.createProject(userId, name),
    updateProject: async (id, name) => isSupabaseReady() ? sb.updateProject(id, name) : local.updateProject(id, name),
    deleteProject: async (id) => isSupabaseReady() ? sb.deleteProject(id) : local.deleteProject(id),

    // Tasks
    getTasksByProjectId: async (projectId) => isSupabaseReady() ? sb.getTasksByProjectId(projectId) : local.getTasksByProjectId(projectId),
    getAllTasks: async (userId) => isSupabaseReady() && userId ? sb.getAllTasks(userId) : local.getAllTasks(),
    createTask: async (taskData) => isSupabaseReady() ? sb.createTask(taskData) : local.createTask(taskData),
    updateTask: async (taskId, data) => isSupabaseReady() ? sb.updateTask(taskId, data) : local.updateTask(taskId, data),
    updateTaskStatus: async (taskId, status) => isSupabaseReady() ? sb.updateTask(taskId, { status }) : local.updateTask(taskId, { status }),
    deleteTask: async (taskId) => isSupabaseReady() ? sb.deleteTask(taskId) : local.deleteTask(taskId),

    // Stats
    getDailyStats: async (userId) => isSupabaseReady() && userId ? sb.getDailyStats(userId) : local.getDailyStats(userId),
    saveDailyStats: async (userId, stats) => isSupabaseReady() && userId ? sb.saveDailyStats(userId, stats) : local.saveDailyStats(userId, stats),
};
