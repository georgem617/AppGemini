import { supabase } from '../config/supabase';

/**
 * Query completa de tareas con todas las relaciones
 */
export async function getTasksWithRelations() {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      project:projects (
        id,
        name,
        client:clients (id, name)
      ),
      task_assignments (
        user:team (id, name, role)
      ),
      subtasks (
        *,
        subtask_assignments (
          user:team (id, name)
        )
      )
    `)
        .order('createdAt', { ascending: false });

    if (error) throw error;

    // Transformar a formato compatible con código existente
    return data.map(task => ({
        ...task,
        // Mantener compatibilidad: array de IDs
        assignees: task.task_assignments?.map(a => a.user.id) || [],
        // Nuevo: objetos completos de usuarios
        assignedUsers: task.task_assignments?.map(a => a.user) || [],
        // Subtareas con sus asignaciones
        subtasks: (task.subtasks || []).map(st => ({
            ...st,
            dueDate: st.due_date, // Mapear snake_case a camelCase
            assignees: st.subtask_assignments?.map(a => a.user.id) || [],
            assignedUsers: st.subtask_assignments?.map(a => a.user) || []
        }))
    }));
}

/**
 * Crear tarea con asignaciones
 */
export async function createTaskWithAssignments(taskData, assigneeIds = []) {
    try {
        // 1. Crear tarea
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert([{
                title: taskData.title,
                status: taskData.status || 'backlog',
                priority: taskData.priority || 'media',
                projectId: taskData.projectId,
                plannedDay: taskData.plannedDay || 'backlog',
                dueDate: taskData.dueDate || '',
                notes: taskData.notes || '',
                recurrence: taskData.recurrence || 'none'
            }])
            .select()
            .single();

        if (taskError) throw taskError;

        // 2. Crear asignaciones si hay usuarios
        if (assigneeIds.length > 0) {
            const assignments = assigneeIds.map(userId => ({
                task_id: task.id,
                user_id: userId
            }));

            const { error: assignError } = await supabase
                .from('task_assignments')
                .insert(assignments);

            if (assignError) throw assignError;
        }

        return task;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

/**
 * Actualizar subtasks de una tarea
 */
export async function updateSubtasks(taskId, subtasks) {
    try {
        // 1. Obtener subtasks existentes
        const { data: existing } = await supabase
            .from('subtasks')
            .select('id')
            .eq('task_id', taskId);

        const existingIds = existing?.map(s => s.id) || [];
        const newIds = subtasks.map(s => s.id);

        // 2. Eliminar subtasks que ya no existen
        const toDelete = existingIds.filter(id => !newIds.includes(id));
        if (toDelete.length > 0) {
            await supabase.from('subtasks').delete().in('id', toDelete);
        }

        // 3. Upsert subtasks
        for (const subtask of subtasks) {
            const { data: st, error: stError } = await supabase
                .from('subtasks')
                .upsert({
                    id: subtask.id,
                    task_id: taskId,
                    title: subtask.title,
                    completed: subtask.completed,
                    due_date: subtask.dueDate || null
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (stError) throw stError;

            // 4. Actualizar asignaciones de subtask
            if (subtask.assignees) {
                // Eliminar asignaciones existentes
                await supabase
                    .from('subtask_assignments')
                    .delete()
                    .eq('subtask_id', st.id);

                // Insertar nuevas asignaciones
                if (subtask.assignees.length > 0) {
                    const assignments = subtask.assignees.map(userId => ({
                        subtask_id: st.id,
                        user_id: userId
                    }));

                    const { error: assignError } = await supabase
                        .from('subtask_assignments')
                        .insert(assignments);

                    if (assignError) throw assignError;
                }
            }
        }
    } catch (error) {
        console.error('Error updating subtasks:', error);
        throw error;
    }
}

/**
 * Actualizar asignaciones de una tarea
 */
export async function updateTaskAssignments(taskId, assigneeIds) {
    try {
        // 1. Eliminar asignaciones existentes
        await supabase
            .from('task_assignments')
            .delete()
            .eq('task_id', taskId);

        // 2. Insertar nuevas asignaciones
        if (assigneeIds.length > 0) {
            const assignments = assigneeIds.map(userId => ({
                task_id: taskId,
                user_id: userId
            }));

            const { error } = await supabase
                .from('task_assignments')
                .insert(assignments);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Error updating task assignments:', error);
        throw error;
    }
}

/**
 * Obtener proyectos con relaciones completas
 */
export async function getProjectsWithRelations() {
    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      client:clients (id, name),
      tasks (
        id,
        status,
        subtasks (id, completed)
      )
    `)
        .order('createdAt', { ascending: false });

    if (error) throw error;
    return data;
}
