import { useState } from "react";
import { Plus, CheckSquare, Circle, CheckCircle2, Calendar, Clock, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useFirebaseSharedTasks } from "../hooks/useFirebaseSharedTasks";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { ShareModal } from "../components/ShareModal";
import { ViewTaskModal } from "../components/ViewTaskModal";
import { Badge } from "../components/ui/badge";

export const TasksFirebase = () => {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  console.log('🔥 TasksFirebase - Componente carregado');
  console.log('🔥 TasksFirebase - showCreateTaskModal:', showCreateTaskModal);
  
  const { getUserName } = useFirebaseAuth();
  
  // DEBUG: Teste direto de criação de tarefa
  const testeDirectoTarefa = () => {
    console.log('🚨 TESTE DIRETO - Criando tarefa via código...');
    const taskData = {
      title: 'Tarefa de Teste DEBUG',
      description: 'Criada pelo botão de debug',
      priority: 'medium' as const
    };
    console.log('🚨 TESTE DIRETO - Dados da tarefa:', taskData);
    createSharedTask(taskData);
  };

  // DEBUG: Teste de acesso direto ao Firebase
  const testeAcessoFirebase = async () => {
    console.log('🚨 TESTE FIREBASE - Verificando acesso à collection shared_tasks...');
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      const currentUser = getUserName();
      console.log('👤 TESTE FIREBASE - Usuário atual:', currentUser);
      
      // Teste geral da collection
      const querySnapshot = await getDocs(collection(db, 'shared_tasks'));
      console.log('✅ TESTE FIREBASE - Acesso OK! Total de documentos:', querySnapshot.size);
      
      // Listar todas as tarefas para debug
      console.log('📋 TESTE FIREBASE - Listando todas as tarefas:');
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Tarefa ${index + 1}:`, {
          id: doc.id,
          title: data.title,
          owner: data.owner,
          sharedWith: data.sharedWith
        });
      });
      
      // Teste específico para o usuário atual
      if (currentUser) {
        const userTasksQuery = query(
          collection(db, 'shared_tasks'),
          where('owner', '==', currentUser)
        );
        
        const userSnapshot = await getDocs(userTasksQuery);
        console.log(`✅ TESTE FIREBASE - Tarefas do usuário "${currentUser}":`, userSnapshot.size);
        
        userSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📄 Tarefa do usuário ${index + 1}:`, {
            id: doc.id,
            title: data.title,
            createdAt: data.createdAt?.toDate?.() || 'sem data'
          });
        });
      }
      
    } catch (error: any) {
      console.error('❌ TESTE FIREBASE - Erro de acesso:', error);
      console.error('❌ TESTE FIREBASE - Código do erro:', error.code);
      console.error('❌ TESTE FIREBASE - Mensagem:', error.message);
      
      if (error.code === 'permission-denied') {
        console.error('🚨 PROBLEMA IDENTIFICADO: Regras do Firebase não permitem acesso à collection shared_tasks!');
      }
    }
  };

  // DEBUG: Forçar recarregamento das tarefas
  const testeRecarregarTarefas = () => {
    console.log('🔄 TESTE RECARREGAR - Forçando recarregamento das tarefas...');
    console.log('🔄 TESTE RECARREGAR - Tarefas atuais no estado:', sharedTasks.length);
    console.log('🔄 TESTE RECARREGAR - Lista atual:', sharedTasks);
    
    // Força o useEffect a executar novamente mudando uma dependência fake
    window.location.reload();
  };
  const { 
    sharedTasks, 
    loading, 
    createSharedTask,
    updateSharedTask,
    toggleSharedTask,
    shareTaskWithUser, 
    removeUserFromTask,
    deleteSharedTask
  } = useFirebaseSharedTasks();

  const handleCreateTask = (taskData: any) => {
    console.log('🔥 TasksFirebase - handleCreateTask chamado com:', taskData);
    createSharedTask(taskData);
    setShowCreateTaskModal(false);
  };

  const handleShareTask = (task: any) => {
    setSelectedTask(task);
    setShowShareModal(true);
  };

  const handleShareWithUser = (userName: string) => {
    if (selectedTask) {
      shareTaskWithUser(selectedTask.id, userName);
    }
  };

  const handleRemoveUser = (userName: string) => {
    if (selectedTask) {
      removeUserFromTask(selectedTask.id, userName);
    }
  };

  const handleToggleTask = (taskId: string) => {
    toggleSharedTask(taskId);
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setShowViewTaskModal(true);
  };

  const handleUpdateTask = (taskId: string, taskData: any) => {
    updateSharedTask(taskId, taskData);
  };

  const handleDeleteTask = (taskId: string) => {
    if (deleteSharedTask) {
      deleteSharedTask(taskId);
    }
  };

  const filteredTasks = sharedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && !task.completed;
    if (filter === 'completed') return matchesSearch && task.completed;
    return matchesSearch;
  });

  const pendingCount = sharedTasks.filter(task => !task.completed).length;
  const completedCount = sharedTasks.filter(task => task.completed).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          📋 Minhas Tarefas
        </h1>
        <p className="text-center text-muted-foreground">
          Organize e compartilhe suas tarefas na nuvem
        </p>
        

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sharedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input flex-1"
            />
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                >
                  {filterType === 'all' && 'Todas'}
                  {filterType === 'pending' && 'Pendentes'}
                  {filterType === 'completed' && 'Concluídas'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📋</div>
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
                onClick={() => setShowCreateTaskModal(true)}
                className="glass-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira tarefa
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredTasks.map((task) => {
            // Preparar estilo do fundo da tarefa
            const taskStyle: React.CSSProperties = {};
            if (task.backgroundImage) {
              taskStyle.backgroundImage = `url(${task.backgroundImage})`;
              taskStyle.backgroundSize = 'cover';
              taskStyle.backgroundPosition = 'center';
            } else if (task.backgroundColor) {
              taskStyle.backgroundColor = task.backgroundColor;
            }

            const hasBackground = task.backgroundImage || task.backgroundColor;

            return (
              <Card 
                key={task.id} 
                className="task-card relative overflow-hidden border border-white/20 cursor-pointer"
                onClick={() => handleViewTask(task)}
                style={taskStyle}
              >
                {/* Overlay para melhorar legibilidade quando há fundo */}
                {hasBackground && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                )}
                
                <div className="relative z-10 card-content">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id!);
                          }}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <CardTitle className={`text-lg ${
                            task.completed 
                              ? "line-through opacity-60" 
                              : hasBackground 
                                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                                : ""
                          }`}>
                            {task.title}
                          </CardTitle>
                          <CardDescription className={`mt-1 ${
                            hasBackground
                              ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                              : ""
                          }`}>
                            Por: {task.owner} • 
                            {task.sharedWith.length > 0 && (
                              <span className={`ml-1 ${
                                hasBackground ? "text-yellow-300" : "text-primary"
                              }`}>
                                {task.sharedWith.length} colaborador(es)
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge 
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareTask(task);
                          }}
                          variant={hasBackground ? "secondary" : "outline"}
                          size="sm"
                          className={hasBackground 
                            ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                            : ""
                          }
                          title="Compartilhar tarefa"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-hidden">
                    <p className={`text-sm line-clamp-2 mb-3 ${
                      task.completed 
                        ? "line-through opacity-60" 
                        : hasBackground 
                          ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                          : "text-muted-foreground"
                    }`}>
                      {task.description || "Sem descrição"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${
                          hasBackground 
                            ? "text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                            : "text-muted-foreground"
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>Prazo: {task.dueDate.toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      
                      <div className={`text-xs ${
                        hasBackground 
                          ? "text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                          : "text-muted-foreground"
                      }`}>
                        Atualizada: {task.updatedAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <Button
          onClick={() => {
            console.log('🔥 TasksFirebase - Botão + clicado, abrindo modal');
            setShowCreateTaskModal(true);
          }}
          className="w-16 h-16 rounded-full glass-button shadow-2xl animate-glass-glow"
          title="Criar Nova Tarefa"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSave={handleCreateTask}
        isSharedMode={true}
      />

      <ViewTaskModal
        isOpen={showViewTaskModal}
        onClose={() => setShowViewTaskModal(false)}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onToggle={handleToggleTask}
        onShare={handleShareTask}
        onDelete={handleDeleteTask}
        currentUser={getUserName() || ""}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={selectedTask}
        onShareWithUser={handleShareWithUser}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
};
