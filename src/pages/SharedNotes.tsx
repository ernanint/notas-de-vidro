import { useState } from "react";
import { Plus, Users, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { SharedItemCard } from "../components/SharedItemCard";
import { useSharedNotes } from "../hooks/useSharedNotes";
import { useSharedTasks } from "../hooks/useSharedTasks";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

export const SharedNotes = () => {
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(true);

  const { 
    sharedNotes, 
    createSharedNote, 
    updateSharedNote, 
    shareNoteWithUser, 
    removeUserFromNote 
  } = useSharedNotes();
  
  const { 
    sharedTasks, 
    createSharedTask, 
    updateSharedTask, 
    toggleSharedTask,
    shareTaskWithUser, 
    removeUserFromTask 
  } = useSharedTasks();

  // Combina notas e tarefas compartilhadas e ordena por data de modificação
  const allSharedItems = [
    ...sharedNotes.map(note => ({ ...note, type: 'note' as const })),
    ...sharedTasks.map(task => ({ ...task, type: 'task' as const }))
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const handleCreateNote = (noteData: any) => {
    if (isSharedMode) {
      createSharedNote(noteData);
    }
    setShowCreateNoteModal(false);
  };

  const handleCreateTask = (taskData: any) => {
    if (isSharedMode) {
      createSharedTask(taskData);
    }
    setShowCreateTaskModal(false);
  };

  const handleUpdateItem = (id: string, data: any) => {
    const item = allSharedItems.find(item => item.id === id);
    if (!item) return;

    if (item.type === 'note') {
      updateSharedNote(id, data);
    } else {
      updateSharedTask(id, data);
    }
  };

  const handleShareItem = (itemId: string, userName: string) => {
    const item = allSharedItems.find(item => item.id === itemId);
    if (!item) return;

    if (item.type === 'note') {
      shareNoteWithUser(itemId, userName);
    } else {
      shareTaskWithUser(itemId, userName);
    }
  };

  const handleRemoveUser = (itemId: string, userName: string) => {
    const item = allSharedItems.find(item => item.id === itemId);
    if (!item) return;

    if (item.type === 'note') {
      removeUserFromNote(itemId, userName);
    } else {
      removeUserFromTask(itemId, userName);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Notas Compartilhadas
        </h1>
        
        {/* Info Card */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">Colaboração em Tempo Real</p>
                <p className="text-sm text-muted-foreground">
                  Compartilhe notas e tarefas com outros usuários
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="shared-mode" className="text-sm">
                Modo compartilhado
              </Label>
              <Switch
                id="shared-mode"
                checked={isSharedMode}
                onCheckedChange={setIsSharedMode}
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{sharedNotes.length}</div>
            <div className="text-sm text-muted-foreground">Notas Compartilhadas</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">{sharedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Tarefas Compartilhadas</div>
          </div>
        </div>
      </div>

      {/* Shared Items List */}
      {allSharedItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum item compartilhado</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira nota ou tarefa compartilhada para começar a colaborar!
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => setShowCreateNoteModal(true)}
                className="glass-button"
                disabled={!isSharedMode}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Nota
              </Button>
              <Button 
                onClick={() => setShowCreateTaskModal(true)}
                className="glass-button"
                disabled={!isSharedMode}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Criar Tarefa
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-24">
          {allSharedItems.map((item) => (
            <SharedItemCard
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
              onShare={handleShareItem}
              onRemoveUser={handleRemoveUser}
              onToggleTask={item.type === 'task' ? toggleSharedTask : undefined}
            />
          ))}
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <Button
          onClick={() => setShowCreateTaskModal(true)}
          className="w-14 h-14 rounded-full glass-button shadow-2xl"
          title="Criar Tarefa Compartilhada"
          disabled={!isSharedMode}
        >
          <CheckSquare className="w-6 h-6" />
        </Button>
        <Button
          onClick={() => setShowCreateNoteModal(true)}
          className="w-16 h-16 rounded-full glass-button shadow-2xl animate-glass-glow"
          title="Criar Nota Compartilhada"
          disabled={!isSharedMode}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        onSave={handleCreateNote}
        isSharedMode={isSharedMode}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSave={handleCreateTask}
        isSharedMode={isSharedMode}
      />
    </div>
  );
};