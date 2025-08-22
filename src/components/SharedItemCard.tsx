import { useState } from "react";
import { StickyNote, CheckSquare, Users, History, Share, MoreVertical, Edit3, Clock, Eye, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SharedNote } from "../types/Note";
import { SharedTask } from "../types/Task";
import { CreateNoteModal } from "./CreateNoteModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { ShareModal } from "./ShareModal";
import { HistoryModal } from "./HistoryModal";

interface SharedItemCardProps {
  item: SharedNote | SharedTask;
  onUpdate: (id: string, data: any) => void;
  onShare: (itemId: string, userName: string) => void;
  onRemoveUser: (itemId: string, userName: string) => void;
  onToggleTask?: (taskId: string) => void;
}

export const SharedItemCard = ({ item, onUpdate, onShare, onRemoveUser, onToggleTask }: SharedItemCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isNote = 'content' in item;
  const isTask = 'description' in item;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLatestChange = () => {
    if (item.changeHistory.length === 0) return null;
    return item.changeHistory[0];
  };

  const latestChange = getLatestChange();

  const handleTaskToggle = () => {
    if (isTask && onToggleTask) {
      onToggleTask(item.id);
    }
  };

  return (
    <>
      <div className="glass-card p-4 hover:scale-[1.02] transition-transform group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isNote ? (
              <StickyNote className="w-4 h-4 text-primary" />
            ) : (
              <CheckSquare className={`w-4 h-4 ${isTask && (item as SharedTask).completed ? 'text-green-500' : 'text-accent'}`} />
            )}
            <h3 className="font-medium text-foreground">{item.title}</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              Compartilhado
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-popup">
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                <Share className="w-4 h-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowHistoryModal(true)}>
                <History className="w-4 h-4 mr-2" />
                Ver histórico
              </DropdownMenuItem>
              {isTask && (
                <DropdownMenuItem onClick={handleTaskToggle}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {(item as SharedTask).completed ? 'Reabrir' : 'Concluir'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          {isNote && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {(item as SharedNote).content || 'Sem conteúdo'}
            </p>
          )}
          {isTask && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-1">
                {(item as SharedTask).description || 'Sem descrição'}
              </p>
              {(item as SharedTask).dueDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Vence em: {formatDate((item as SharedTask).dueDate!)}</span>
                  {(item as SharedTask).dueTime && (
                    <>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{(item as SharedTask).dueTime}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Proprietário: {item.owner}
            {item.sharedWith.length > 0 && ` • +${item.sharedWith.length} colaborador${item.sharedWith.length > 1 ? 'es' : ''}`}
          </span>
        </div>

        {/* Latest Activity */}
        {latestChange && (
          <div className="space-y-1 text-sm text-muted-foreground border-t border-muted/20 pt-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-3 h-3" />
              <span>Modificado por {latestChange.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{formatDate(latestChange.timestamp)}</span>
            </div>
            <div className="text-xs opacity-75">
              Ação: {latestChange.action}
            </div>
          </div>
        )}

        {/* Visual customization preview for notes */}
        {isNote && (item as SharedNote).backgroundColor && (
          <div className="mt-2 flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border border-muted/20"
              style={{ 
                backgroundColor: {
                  blue: 'rgba(59, 130, 246, 0.3)',
                  green: 'rgba(34, 197, 94, 0.3)',
                  purple: 'rgba(147, 51, 234, 0.3)',
                  pink: 'rgba(236, 72, 153, 0.3)',
                  yellow: 'rgba(234, 179, 8, 0.3)',
                  orange: 'rgba(249, 115, 22, 0.3)'
                }[(item as SharedNote).backgroundColor!] || 'transparent'
              }}
            />
            <span className="text-xs text-muted-foreground">Cor personalizada</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {isNote && (
        <CreateNoteModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editNote={item as SharedNote}
          onSave={(noteData) => {
            onUpdate(item.id, noteData);
            setShowEditModal(false);
          }}
        />
      )}

      {isTask && (
        <CreateTaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editTask={item as SharedTask}
          onSave={(taskData) => {
            onUpdate(item.id, taskData);
            setShowEditModal(false);
          }}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={item}
        onShareWithUser={(userName) => onShare(item.id, userName)}
        onRemoveUser={(userName) => onRemoveUser(item.id, userName)}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        item={item}
      />
    </>
  );
};
