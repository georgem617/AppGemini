import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft } from 'lucide-react';

// Config
import { supabase } from './config/supabase';

// Components
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import DashboardView from './components/DashboardView';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorMessage from './components/ui/ErrorMessage';

// Modals
import TaskModal from './components/modals/TaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';
import ProjectModal from './components/modals/ProjectModal';
import ClientModal from './components/modals/ClientModal';
import UserModal from './components/modals/UserModal';

// Utils
import { validateTaskTitle } from './utils/validation';

export default function AppGemini() {
  // View State
  const [currentView, setCurrentView] = useState('dashboard');
  const [filterUser, setFilterUser] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Data State
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Loading & Error State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  // Edit State
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '', status: 'backlog', priority: 'media', projectId: '', projectName: '',
    plannedDay: 'backlog', recurrence: 'none', dueDate: '', assignees: [], subtasks: []
  });
  const [newProject, setNewProject] = useState({ name: '', clientId: '', lead: '' });
  const [newClient, setNewClient] = useState({ name: '', contactPerson: '', email: '' });
  const [newUser, setNewUser] = useState({ name: '', role: '', email: '' });
  const [tempSubtask, setTempSubtask] = useState('');

  // Data Fetching with error handling
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: t, error: tErr } = await supabase.from('tasks').select('*');
      const { data: p, error: pErr } = await supabase.from('projects').select('*');
      const { data: c, error: cErr } = await supabase.from('clients').select('*');
      const { data: tm, error: tmErr } = await supabase.from('team').select('*');

      if (tErr) throw new Error(`Error al cargar tareas: ${tErr.message}`);
      if (pErr) throw new Error(`Error al cargar proyectos: ${pErr.message}`);
      if (cErr) throw new Error(`Error al cargar clientes: ${cErr.message}`);
      if (tmErr) throw new Error(`Error al cargar equipo: ${tmErr.message}`);

      if (t) setTasks(t);
      if (p) setProjects(p);
      if (c) setClients(c);
      if (tm) setTeamMembers(tm);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Handlers with error handling
  const handleAddTask = async () => {
    try {
      // Validate
      const validation = validateTaskTitle(newTask.title);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      setIsLoading(true);
      setError(null);

      let finalProjectName = newTask.projectName;
      if (newTask.projectId) {
        const p = projects.find(proj => proj.id === newTask.projectId);
        if (p) finalProjectName = p.name;
      }

      const { error: insertError } = await supabase.from('tasks').insert([{
        ...newTask,
        projectName: finalProjectName,
        createdAt: new Date().toISOString()
      }]);

      if (insertError) throw new Error(insertError.message);

      await fetchData();
      setTaskModalOpen(false);
      setNewTask({
        title: '', status: 'backlog', priority: 'media', projectId: '', projectName: '',
        plannedDay: 'backlog', recurrence: 'none', dueDate: '', assignees: [], subtasks: []
      });
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Error al crear tarea: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingTask) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase.from('tasks').update({
        title: editingTask.title,
        status: editingTask.status,
        priority: editingTask.priority,
        assignees: editingTask.assignees,
        subtasks: editingTask.subtasks,
        notes: editingTask.notes,
        dueDate: editingTask.dueDate
      }).eq('id', editingTask.id);

      if (updateError) throw new Error(updateError.message);

      await fetchData();
      setDetailModalOpen(false);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Error al guardar cambios: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error: updateError } = await supabase.from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (updateError) throw new Error(updateError.message);

      await fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Error al actualizar estado de tarea');
    }
  };

  const handleConvertSubtaskToTask = async (subId) => {
    const subtask = editingTask.subtasks.find(s => s.id === subId);
    if (!subtask) return;

    if (!confirm(`¿Crear tarea nueva a partir de "${subtask.title}"?`)) return;

    const updatedSubtasks = editingTask.subtasks.filter(s => s.id !== subId);
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });

    await supabase.from('tasks').update({ subtasks: updatedSubtasks }).eq('id', editingTask.id);
    await supabase.from('tasks').insert([{
      title: subtask.title,
      status: 'todo',
      priority: editingTask.priority,
      projectId: editingTask.projectId || '',
      projectName: editingTask.projectName || '',
      plannedDay: 'backlog',
      assignees: subtask.assignees || [],
      dueDate: '',
      subtasks: [],
      createdAt: new Date().toISOString()
    }]);

    fetchData();
    alert("✅ Subtarea convertida correctamente.");
  };

  const handleDeleteTask = async () => {
    if (confirm("¿Eliminar permanentemente?")) {
      await supabase.from('tasks').delete().eq('id', editingTask.id);
      fetchData();
      setDetailModalOpen(false);
    }
  };

  const handleSubtaskAdd = () => {
    if (tempSubtask.trim()) {
      setEditingTask({
        ...editingTask,
        subtasks: [
          ...(editingTask.subtasks || []),
          { id: crypto.randomUUID(), title: tempSubtask, completed: false, assignees: [] }
        ]
      });
      setTempSubtask('');
    }
  };

  // Filtered Data
  const getFilteredTasks = () => {
    if (filterUser === 'all') return tasks;
    return tasks.filter(t =>
      t.assignees?.includes(filterUser) || t.subtasks?.some(s => s.assignees?.includes(filterUser))
    );
  };

  const getFilteredProjects = () => {
    if (filterUser === 'all') return projects;
    return projects.filter(p => p.lead === filterUser);
  };

  // View Handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedProjectId(null);
    setSelectedClientId(null);
  };

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('projects');
  };

  const handleTaskClick = (task) => {
    setEditingTask(JSON.parse(JSON.stringify(task)));
    setDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Error Message */}
      <ErrorMessage message={error} onClose={() => setError(null)} />

      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter size={16} />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
            >
              <option value="all">Todo el Equipo</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setNewTask({
                title: '', status: 'backlog', priority: 'media', projectId: '',
                projectName: '', plannedDay: 'backlog', recurrence: 'none',
                dueDate: '', assignees: [], subtasks: []
              });
              setTaskModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Nueva Tarea
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950/50 flex items-center justify-center z-40">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-zinc-400">Cargando...</p>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <DashboardView
              filteredProjects={getFilteredProjects()}
              filteredTasks={getFilteredTasks()}
              tasks={tasks}
              onProjectClick={handleProjectClick}
            />
          )}

          {/* Projects List */}
          {currentView === 'projects' && !selectedProjectId && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Proyectos</h2>
                <button
                  onClick={() => setProjectModalOpen(true)}
                  className="text-indigo-400 text-sm"
                >
                  + Nuevo
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {getFilteredProjects().map(p => (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:border-indigo-500"
                    onClick={() => handleProjectClick(p.id)}
                  >
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-xs text-zinc-500">{p.clientName}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Project Detail */}
          {currentView === 'projects' && selectedProjectId && (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setSelectedProjectId(null)}>
                  <ArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">
                  {projects.find(p => p.id === selectedProjectId)?.name}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {getFilteredTasks()
                  .filter(t => t.projectId === selectedProjectId && t.status !== 'done')
                  .map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onTaskClick={handleTaskClick}
                      onStatusToggle={handleUpdateTaskStatus}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Tasks View */}
          {currentView === 'tasks' && (
            <div className="grid grid-cols-2 gap-6 h-full">
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-800 font-bold text-zinc-300">
                  Pendientes
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {getFilteredTasks()
                    .filter(t => t.status !== 'done')
                    .map(t => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onTaskClick={handleTaskClick}
                        onStatusToggle={handleUpdateTaskStatus}
                      />
                    ))}
                </div>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-800 font-bold text-zinc-500">
                  Finalizadas
                </div>
                <div className="flex-1 overflow-y-auto p-3 opacity-50">
                  {getFilteredTasks()
                    .filter(t => t.status === 'done')
                    .map(t => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onTaskClick={handleTaskClick}
                        onStatusToggle={handleUpdateTaskStatus}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Clients List */}
          {currentView === 'clients' && !selectedClientId && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Clientes</h2>
                <button
                  onClick={() => setClientModalOpen(true)}
                  className="text-indigo-400 text-sm"
                >
                  + Nuevo
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {clients.map(c => (
                  <Card
                    key={c.id}
                    className="cursor-pointer hover:border-emerald-500"
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setCurrentView('clients');
                    }}
                  >
                    <h3 className="font-bold">{c.name}</h3>
                    <Badge color={c.status === 'activo' ? 'green' : 'gray'}>
                      {c.status}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Client Detail */}
          {currentView === 'clients' && selectedClientId && (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full"
                >
                  <ArrowLeft />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">
                    {clients.find(c => c.id === selectedClientId)?.name}
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    {clients.find(c => c.id === selectedClientId)?.contactPerson}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-zinc-300">
                    Proyectos Asociados
                  </h3>
                  <button
                    onClick={() => {
                      setNewProject({ name: '', clientId: selectedClientId, lead: '' });
                      setProjectModalOpen(true);
                    }}
                    className="text-indigo-400 text-sm hover:underline"
                  >
                    + Conectar Nuevo Proyecto
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {projects
                    .filter(p => p.clientId === selectedClientId)
                    .map(p => (
                      <Card
                        key={p.id}
                        className="cursor-pointer hover:border-indigo-500"
                        onClick={() => handleProjectClick(p.id)}
                      >
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-xs text-zinc-500">Click para ver tareas</p>
                      </Card>
                    ))}
                  {projects.filter(p => p.clientId === selectedClientId).length === 0 && (
                    <div className="col-span-3 text-zinc-600 italic py-4">
                      No hay proyectos conectados aún.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team View */}
          {currentView === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Equipo</h2>
                <button
                  onClick={() => setUserModalOpen(true)}
                  className="text-indigo-400 text-sm"
                >
                  + Nuevo
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {teamMembers.map(m => (
                  <Card key={m.id}>
                    <h3 className="font-bold">{m.name}</h3>
                    <p className="text-sm text-zinc-500">{m.role}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        newTask={newTask}
        projects={projects}
        teamMembers={teamMembers}
        onClose={() => setTaskModalOpen(false)}
        onChange={setNewTask}
        onSubmit={handleAddTask}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        editingTask={editingTask}
        tempSubtask={tempSubtask}
        onClose={() => setDetailModalOpen(false)}
        onChange={setEditingTask}
        onSubtaskChange={setTempSubtask}
        onSubtaskAdd={handleSubtaskAdd}
        onConvertSubtaskToTask={handleConvertSubtaskToTask}
        onSave={handleSaveChanges}
        onDelete={handleDeleteTask}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        newProject={newProject}
        clients={clients}
        onChange={setNewProject}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={async () => {
          await supabase.from('projects').insert([{
            ...newProject,
            status: 'activo',
            createdAt: new Date().toISOString()
          }]);
          fetchData();
          setProjectModalOpen(false);
          setNewProject({ name: '', clientId: '', lead: '' });
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        newClient={newClient}
        onChange={setNewClient}
        onClose={() => setClientModalOpen(false)}
        onSubmit={async () => {
          await supabase.from('clients').insert([{
            ...newClient,
            status: 'activo',
            createdAt: new Date().toISOString()
          }]);
          fetchData();
          setClientModalOpen(false);
          setNewClient({ name: '', contactPerson: '', email: '' });
        }}
      />

      <UserModal
        isOpen={isUserModalOpen}
        newUser={newUser}
        onChange={setNewUser}
        onClose={() => setUserModalOpen(false)}
        onSubmit={async () => {
          await supabase.from('team').insert([{
            ...newUser,
            createdAt: new Date().toISOString()
          }]);
          fetchData();
          setUserModalOpen(false);
          setNewUser({ name: '', role: '', email: '' });
        }}
      />
    </div>
  );
}