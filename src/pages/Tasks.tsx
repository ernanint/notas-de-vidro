import { useState } from "react";
import { Plus, Calendar, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TaskCard } from "../components/TaskCard";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { useTasks } from "../hooks/useTasks";
import { Task } from "../types/Task";

export const Tasks = () => {
  const { tasks, createTask, deleteTask, updateTask, toggleTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && !task.completed;
    if (filter === 'completed') return matchesSearch && task.completed;
    return matchesSearch;
  });

  const handleCreateTask = (taskData: Partial<Task>) => {
    createTask(taskData);
    setShowCreateModal(false);
  };

  const pendingCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Minhas Tarefas
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <Circle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </div>
          <div className="glass-card p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Concluídas</div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              Todas
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="flex-1"
            >
              Pendentes
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="flex-1"
            >
              Concluídas
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery 
                ? "Nenhuma tarefa encontrada" 
                : filter === 'completed'
                  ? "Nenhuma tarefa concluída"
                  : "Nenhuma tarefa cadastrada"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Tente buscar por outros termos" 
                : "Crie sua primeira tarefa para se organizar!"
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="glass-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira tarefa
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-24">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setSelectedTask}
              onDelete={deleteTask}
              onToggle={toggleTask}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full glass-button shadow-2xl z-40 animate-glass-glow"
      >
        <Plus className="w-8 h-8" />
      </Button>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTask}
      />

      {selectedTask && (
        <CreateTaskModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onSave={(taskData) => {
            updateTask(selectedTask.id, taskData);
            setSelectedTask(null);
          }}
          editTask={selectedTask}
        />
      )}
    </div>
  );
};