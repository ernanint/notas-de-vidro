import { History, Clock, User, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { SharedNote, ChangeHistory } from "../types/Note";
import { SharedTask } from "../types/Task";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SharedNote | SharedTask | null;
}

export const HistoryModal = ({ isOpen, onClose, item }: HistoryModalProps) => {
  if (!item) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return formatDate(date).split(' às ')[0]; // Apenas a data
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Criou')) return '🎉';
    if (action.includes('Alterou título')) return '📝';
    if (action.includes('Modificou') || action.includes('Adicionou texto')) return '✏️';
    if (action.includes('Mudou cor') || action.includes('imagem')) return '🎨';
    if (action.includes('Compartilhou')) return '👥';
    if (action.includes('Removeu')) return '🗑️';
    if (action.includes('Marcou como concluída')) return '✅';
    if (action.includes('Reabriu')) return '🔄';
    return '📄';
  };

  const itemType = 'title' in item && 'content' in item ? 'nota' : 'tarefa';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-popup max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de alterações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="p-4 rounded-lg bg-muted/10 border border-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="font-medium">{item.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {itemType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Proprietário: {item.owner} • 
              {item.sharedWith.length > 0 
                ? ` Compartilhado com ${item.sharedWith.length} pessoa${item.sharedWith.length > 1 ? 's' : ''}`
                : ' Não compartilhado'
              }
            </p>
          </div>

          {/* History List */}
          <ScrollArea className="h-96">
            {item.changeHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum histórico disponível</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {item.changeHistory.map((change, index) => (
                  <div key={change.id} className={`relative p-4 rounded-lg border transition-colors ${
                    index === 0 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/5 border-muted/10 hover:bg-muted/10'
                  }`}>
                    {/* Timeline connector */}
                    {index < item.changeHistory.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-muted/30"></div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Action Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-sm">
                        {getActionIcon(change.action)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        {/* Main action */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">
                            {change.action}
                          </h4>
                          {index === 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              Mais recente
                            </Badge>
                          )}
                        </div>
                        
                        {/* User and time */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{change.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(change.timestamp)}</span>
                          </div>
                        </div>
                        
                        {/* Details */}
                        {change.details && (
                          <p className="text-xs text-muted-foreground bg-muted/10 px-2 py-1 rounded">
                            {change.details}
                          </p>
                        )}
                        
                        {/* Full timestamp on hover */}
                        <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                          {formatDate(change.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-muted/20">
            <Button onClick={onClose} className="glass-button">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
