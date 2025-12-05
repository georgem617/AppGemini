import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

// Views
import TasksView from './views/TasksView';
import ProjectsView from './views/ProjectsView';
import ClientsView from './views/ClientsView';
import TeamView from './views/TeamView';

// Modals
import TaskModal from './components/modals/TaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';
import ProjectModal from './components/modals/ProjectModal';
import ClientModal from './components/modals/ClientModal';
import UserModal from './components/modals/UserModal';

// Utils
import { validateTaskTitle } from './utils/validation';
import { getTasksWithRelations, createTaskWithAssignments, updateSubtasks, updateTaskAssignments } from './utils/dbQueries';

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

  // Data Fetching with error handling
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Usar nueva query con relaciones
      const tasksData = await getTasksWithRelations();
      setTasks(tasksData);

      const { data: p, error: pErr } = await supabase.from('projects').select('*');
      const { data: c, error: cErr } = await supabase.from('clients').select('*');
      const { data: tm, error: tmErr } = await supabase.from('team').select('*');

      if (pErr) throw new Error(`Error al cargar proyectos: ${pErr.message}`);
      if (cErr) throw new Error(`Error al cargar clientes: ${cErr.message}`);
      if (tmErr) throw new Error(`Error al cargar equipo: ${tmErr.message}`);


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
      const validation = validateTaskTitle(newTask.title);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      setIsLoading(true);

      // Usar nueva función con asignaciones
      await createTaskWithAssignments(
        {
          title: newTask.title,
          projectId: newTask.projectId ? newTask.projectId : null,
          status: 'backlog',
          priority: 'media',
          planned_day: 'backlog'
        },
        newTask.assignees || []
      );

      await fetchData();
      setTaskModalOpen(false);
      // Reset state, keeping minimal defaults
      setNewTask({
        title: '',
        status: 'backlog',
        priority: 'media',
        projectId: '',
        plannedDay: 'backlog',
        recurrence: 'none',
        dueDate: '',
        assignees: [],
        subtasks: []
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

      // 1. Actualizar tarea principal
      const { error: updateError } = await supabase.from('tasks').update({
        title: editingTask.title,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        notes: editingTask.notes
      }).eq('id', editingTask.id);

      if (updateError) throw new Error(updateError.message);

      // 2. Actualizar asignaciones de tarea
      await updateTaskAssignments(editingTask.id, editingTask.assignees || []);

      // 3. Actualizar subtasks
      if (editingTask.subtasks) {
        await updateSubtasks(editingTask.id, editingTask.subtasks);
      }



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

  const handleDeleteTask = async () => {
    if (confirm("¿Eliminar permanentemente?")) {
      await supabase.from('tasks').delete().eq('id', editingTask.id);
      fetchData();
      setDetailModalOpen(false);
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

          {/* Main Content Area with Transitions */}

          <AnimatePresence mode="wait">
            {/* Dashboard View */}
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DashboardView
                  filteredProjects={getFilteredProjects()}
                  filteredTasks={getFilteredTasks()}
                  tasks={tasks}
                  onProjectClick={handleProjectClick}
                />
              </motion.div>
            )}

            {/* Projects View */}
            {currentView === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ProjectsView
                  projects={getFilteredProjects()}
                  tasks={getFilteredTasks()}
                  selectedProjectId={selectedProjectId}
                  onProjectClick={handleProjectClick}
                  onBack={() => setSelectedProjectId(null)}
                  onNewProject={() => setProjectModalOpen(true)}
                  onTaskClick={handleTaskClick}
                  onStatusToggle={handleUpdateTaskStatus}
                />
              </motion.div>
            )}

            {/* Tasks View */}
            {currentView === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TasksView
                  tasks={getFilteredTasks()}
                  onTaskClick={handleTaskClick}
                  onStatusToggle={handleUpdateTaskStatus}
                />
              </motion.div>
            )}

            {/* Clients View */}
            {currentView === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ClientsView
                  clients={clients}
                  projects={projects}
                  selectedClientId={selectedClientId}
                  onClientClick={(id) => {
                    setSelectedClientId(id);
                    setCurrentView('clients');
                  }}
                  onBack={() => setSelectedClientId(null)}
                  onNewClient={() => setClientModalOpen(true)}
                  onNewProject={() => {
                    setNewProject({ name: '', clientId: selectedClientId, lead: '' });
                    setProjectModalOpen(true);
                  }}
                  onProjectClick={handleProjectClick}
                />
              </motion.div>
            )}

            {/* Team View */}
            {currentView === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TeamView
                  teamMembers={teamMembers}
                  onNewUser={() => setUserModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
        teamMembers={teamMembers}
        onClose={() => setDetailModalOpen(false)}
        onChange={setEditingTask}
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