import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Calendar, Clock, Edit3, Save, Users, Copy, Share2, Trash2, MoreVertical } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";

export const ViewTaskModal = ({ isOpen, onClose, task, onUpdate, onToggle, onShare, onDelete, currentUser }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || "");
  const [editedDescription, setEditedDescription] = useState(task?.description || "");
  const [editedDueDate, setEditedDueDate] = useState("");
  const [editedPriority, setEditedPriority] = useState(task?.priority || "medium");
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description);
      setEditedDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
      setEditedPriority(task.priority || 'medium');
      setIsEditing(false); // Reset editing state when task changes
    }
  }, [task]);

  const copyToClipboard = () => {
    const taskText = `${task.title}\n\n${task.description}`;
    navigator.clipboard.writeText(taskText);
    toast({
      title: "📋 Texto copiado",
      description: "Conteúdo da tarefa copiado para a área de transferência",
      duration: 2000,
    });
  };

  const handleSave = () => {
    if (!editedTitle.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "O título da tarefa é obrigatório",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const updatedTask = {
      title: editedTitle.trim(),
      description: editedDescription.trim(),
      dueDate: editedDueDate ? new Date(editedDueDate) : undefined,
      priority: editedPriority
    };

    onUpdate(task.id, updatedTask);
    setIsEditing(false);
    
    toast({
      title: "✅ Tarefa salva",
      description: "Alterações salvas com sucesso",
      duration: 2000,
    });
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setEditedPriority(task.priority || 'medium');
    setIsEditing(false);
  };

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

  if (!task) return null;

  const isOwner = task.owner === currentUser;

  // Preparar estilo do fundo da tarefa no modal
  const modalStyle: React.CSSProperties = {};
  if (task?.backgroundImage) {
    modalStyle.backgroundImage = `url(${task.backgroundImage})`;
    modalStyle.backgroundSize = 'cover';
    modalStyle.backgroundPosition = 'center';
  } else if (task?.backgroundColor) {
    modalStyle.backgroundColor = task.backgroundColor;
  }

  const hasBackground = task?.backgroundImage || task?.backgroundColor;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="glass-modal sm:max-w-2xl w-[95vw] sm:w-full overflow-hidden flex flex-col relative p-6"
        style={modalStyle}
      >
        {/* Overlay para melhorar legibilidade quando há fundo */}
        {hasBackground && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg" />
        )}
        
        <div className="relative z-10 flex flex-col h-full">
          <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 mr-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto mt-1"
                onClick={() => onToggle(task.id)}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                )}
              </Button>
              
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className={`text-lg font-semibold ${
                      hasBackground 
                        ? "glass-input bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70" 
                        : "glass-input"
                    }`}
                    placeholder="Título da tarefa"
                  />
                ) : (
                  <DialogTitle className={`text-xl ${
                    task.completed 
                      ? "line-through opacity-60" 
                      : hasBackground 
                        ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                        : ""
                  }`}>
                    {task.title}
                  </DialogTitle>
                )}
                
                <div className={`mt-2 flex items-center gap-2 flex-wrap ${
                  hasBackground
                    ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    : ""
                }`}>
                  <DialogDescription className={hasBackground ? "text-white/80" : ""}>
                    Por: <strong>{task.owner}</strong>
                  </DialogDescription>
                  
                  {isEditing ? (
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value)}
                      className={`text-sm rounded px-2 py-1 ${
                        hasBackground 
                          ? "bg-white/20 backdrop-blur-sm border-white/30 text-white"
                          : "bg-background border"
                      }`}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  ) : (
                    <Badge 
                      variant="outline"
                      className={`${getPriorityColor(task.priority)} ${
                        hasBackground ? "border-white/30" : ""
                      }`}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  )}

                  {task.sharedWith.length > 0 && (
                    <span className={`text-sm ${
                      hasBackground ? "text-yellow-300" : "text-primary"
                    }`}>
                      • {task.sharedWith.length} colaborador(es)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Menu de opções */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={hasBackground ? "secondary" : "outline"}
                    size="sm"
                    className={hasBackground 
                      ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                      : ""
                    }
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card">
                  <DropdownMenuItem onClick={() => onShare(task)}>
                    <Users className="w-4 h-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Texto
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(task.id)} 
                        className="text-red-500 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Tarefa
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex-1 overflow-y-auto pr-2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label 
                      htmlFor="description"
                      className={hasBackground 
                        ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                        : ""
                      }
                    >
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className={hasBackground 
                        ? "glass-input bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 min-h-[200px] resize-none"
                        : "glass-input min-h-[200px] resize-none"
                      }
                      placeholder="Descreva os detalhes da tarefa..."
                    />
                  </div>
                  
                  <div>
                    <Label 
                      htmlFor="dueDate"
                      className={hasBackground 
                        ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                        : ""
                      }
                    >
                      Data limite
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={editedDueDate}
                      onChange={(e) => setEditedDueDate(e.target.value)}
                      className={hasBackground 
                        ? "glass-input bg-white/20 backdrop-blur-sm border-white/30 text-white"
                        : "glass-input"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div 
                    className={`prose prose-sm max-w-none dark:prose-invert p-4 rounded-lg cursor-text min-h-[200px] whitespace-pre-wrap ${
                      hasBackground
                        ? "bg-black/20 backdrop-blur-sm border border-white/20 text-white"
                        : "bg-muted/5"
                    }`}
                    onClick={() => isOwner && setIsEditing(true)}
                    title={isOwner ? "Clique para editar" : "Somente leitura"}
                  >
                    {task.description || (
                      <span className={`italic ${
                        hasBackground 
                          ? "text-white/70" 
                          : "text-muted-foreground"
                      }`}>
                        {isOwner ? "Clique aqui para adicionar descrição..." : "Sem descrição"}
                      </span>
                    )}
                  </div>
                  
                  {task.dueDate && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      hasBackground
                        ? "bg-black/20 backdrop-blur-sm border border-white/20"
                        : "bg-muted/10 border"
                    }`}>
                      <div className={`flex items-center gap-2 text-sm ${
                        hasBackground 
                          ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                          : "text-muted-foreground"
                      }`}>
                        <Calendar className="w-4 h-4" />
                        <span>Prazo: {task.dueDate.toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className={`shrink-0 pt-4 ${
              hasBackground 
                ? "border-t border-white/20" 
                : "border-t border-muted/20"
            }`}>
              {isEditing ? (
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant={hasBackground ? "secondary" : "outline"}
                      onClick={handleCancelEdit}
                      className={hasBackground 
                        ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                        : ""
                      }
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className={hasBackground 
                        ? "bg-white/30 backdrop-blur-sm border-white/30 text-white hover:bg-white/40" 
                        : "glass-button"
                      }
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className={`text-xs space-y-1 ${
                    hasBackground 
                      ? "text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                      : "text-muted-foreground"
                  }`}>
                    <div>Criada: {task.createdAt.toLocaleString('pt-BR')}</div>
                    <div>Atualizada: {task.updatedAt.toLocaleString('pt-BR')}</div>
                  </div>
                  
                  {isOwner && (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className={hasBackground 
                        ? "bg-white/30 backdrop-blur-sm border-white/30 text-white hover:bg-white/40" 
                        : "glass-button"
                      }
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
