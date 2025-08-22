import { useState } from "react";
import { Users, Share, Plus, X, UserMinus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { SharedNote } from "../types/Note";
import { SharedTask } from "../types/Task";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SharedNote | SharedTask | null;
  onShareWithUser: (userName: string) => void;
  onRemoveUser: (userName: string) => void;
}

export const ShareModal = ({ isOpen, onClose, item, onShareWithUser, onRemoveUser }: ShareModalProps) => {
  const [newUserName, setNewUserName] = useState('');

  if (!item) return null;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUserName.trim()) {
      onShareWithUser(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleClose = () => {
    setNewUserName('');
    onClose();
  };

  const itemType = 'title' in item && 'content' in item ? 'nota' : 'tarefa';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-modal max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Share className="w-5 h-5 text-primary" />
            Compartilhar {itemType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="p-4 rounded-lg bg-muted/10 border border-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h3 className="font-medium">{item.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Proprietário: {item.owner}
            </p>
          </div>

          {/* Add New User */}
          <form onSubmit={handleAddUser} className="space-y-3">
            <Label htmlFor="userName">Compartilhar com usuário</Label>
            <div className="flex gap-2">
              <Input
                id="userName"
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="glass-input flex-1"
                placeholder="Digite o nome do usuário..."
                autoFocus
              />
              <Button type="submit" size="sm" className="glass-button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Current Shared Users */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Colaboradores ({item.sharedWith.length})
              </Label>
            </div>
            
            {item.sharedWith.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ainda não foi compartilhado com ninguém</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {item.sharedWith.map((userName) => (
                  <div key={userName} className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-muted/10">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {userName}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveUser(userName)}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <UserMinus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleClose} className="glass-button flex-1">
              Concluído
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
