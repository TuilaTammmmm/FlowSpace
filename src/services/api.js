import { supabase, isSupabaseReady } from './supabase';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// SUPABASE API LAYER
// ============================================================
const sb = {
    // Auth
    login: async (email, password) => {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
        if (error || !data) throw new Error('Sai email hoặc mật khẩu');
        return { user: data, token: 'sb-jwt-' + data.id };
    },

    register: async (email, password, name) => {
        // Check if exists
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
        if (existing) throw new Error('Email đã tồn tại!');

        const { data, error } = await supabase.from('users').insert({
            email, password, name, department: '', bio: '', avatar_url: ''
        }).select().single();
        if (error) throw error;
        return { user: data, token: 'sb-jwt-' + data.id };
    },


    updateUserProfile: async (userId, updateData) => {
        const { data, error } = await supabase.from('users').update(updateData).eq('id', userId).select().single();
        if (error) throw error;
        return data;
    },

    // Projects
    getProjectsByUserId: async (userId) => {
        const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (error) throw error;
        return data.map(p => ({
            id: p.id, userId: p.user_id, name: p.name, isMuted: p.is_muted
        }));
    },

    createProject: async (userId, name) => {
        const { data, error } = await supabase.from('projects').insert({ user_id: userId, name }).select().single();
        if (error) throw error;
        return { id: data.id, userId: data.user_id, name: data.name, isMuted: data.is_muted };
    },

    updateProject: async (id, name) => {
        const { data, error } = await supabase.from('projects').update({ name }).eq('id', id).select().single();
        if (error) throw error;
        return { id: data.id, userId: data.user_id, name: data.name, isMuted: data.is_muted };
    },

    toggleMuteProject: async (id, isMuted) => {
        const { data, error } = await supabase.from('projects').update({ is_muted: isMuted }).eq('id', id).select().single();
        if (error) throw error;
        return { id: data.id, userId: data.user_id, name: data.name, isMuted: data.is_muted };
    },

    getEarliestProjectDate: async (userId) => {
        const { data, error } = await supabase.from('projects')
            .select('created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
        if (error) return null;
        return data ? data.created_at : null;
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
    getDailyStats: async (userId, projectId) => {
        let query = supabase.from('daily_stats').select('*').eq('user_id', userId).order('date', { ascending: true }).limit(60);
        if (projectId !== undefined) {
          if (projectId === null) query = query.is('project_id', null);
          else query = query.eq('project_id', projectId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data.map(d => ({
            id: d.id, userId: d.user_id, projectId: d.project_id, date: d.date,
            total: d.total_tasks, done: d.completed_tasks,
            active: d.active_tasks, overdue: d.overdue_tasks
        }));
    },

    saveDailyStats: async (userId, stats) => {
        const { data, error } = await supabase.from('daily_stats')
            .upsert({
                user_id: userId,
                project_id: stats.projectId || null,
                date: stats.date,
                total_tasks: stats.total,
                completed_tasks: stats.done,
                active_tasks: stats.active,
                overdue_tasks: stats.overdue
            }, { onConflict: 'user_id,project_id,date' })
            .select().single();
        if (error) throw error;
        return data;
    },

    resetUserData: async (userId) => {
        // Delete tasks, projects, stats in order
        await supabase.from('daily_stats').delete().eq('user_id', userId);
        const { data: projs } = await supabase.from('projects').select('id').eq('user_id', userId);
        const projIds = projs.map(p => p.id);
        if (projIds.length > 0) {
            await supabase.from('tasks').delete().in('project_id', projIds);
        }
        await supabase.from('projects').delete().eq('user_id', userId);
        return true;
    }
};

// ============================================================
// EXPORT UNIFIED API (No more localStorage mocks)
// ============================================================
export const MOCK_API = {
    login: sb.login,
    register: sb.register,
    updateUserProfile: sb.updateUserProfile,
    
    // Projects
    getProjectsByUserId: sb.getProjectsByUserId,
    createProject: sb.createProject,
    updateProject: sb.updateProject,
    deleteProject: sb.deleteProject,
    toggleMuteProject: sb.toggleMuteProject,

    // Tasks
    getTasksByProjectId: sb.getTasksByProjectId,
    getAllTasks: sb.getAllTasks,
    createTask: sb.createTask,
    updateTask: sb.updateTask,
    updateTaskStatus: async (taskId, status) => sb.updateTask(taskId, { status }),
    deleteTask: sb.deleteTask,

    // Stats
    getDailyStats: sb.getDailyStats,
    saveDailyStats: sb.saveDailyStats,
    
    // Auth OAuth
    signInWithGoogle: sb.signInWithGoogle,

    // Cleanup
    resetUserData: sb.resetUserData,
    clearData: async (userId) => {
        if (userId) await sb.resetUserData(userId);
        return true;
    },
};
