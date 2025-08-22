import { useState } from "react";
import { Lock, Edit, Trash2, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Note } from "../types/Note";
import { useNotes } from "../hooks/useNotes";
import { cn } from "../lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  const { validateNotePassword } = useNotes();
  const [isLocked, setIsLocked] = useState(note.isLocked);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNotePassword(note, passwordInput)) {
      setIsLocked(false);
      setPasswordInput("");
    } else {
      // Show error feedback
      setPasswordInput("");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be implemented with Supabase integration
    alert("Funcionalidade de compartilhamento será implementada quando conectar ao Supabase");
  };

  const getBackgroundStyle = () => {
    if (note.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${note.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {};
  };

  const getColorClass = () => {
    if (!note.backgroundColor) return '';
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/20 border-blue-500/30',
      green: 'bg-green-500/20 border-green-500/30', 
      purple: 'bg-purple-500/20 border-purple-500/30',
      pink: 'bg-pink-500/20 border-pink-500/30',
      yellow: 'bg-yellow-500/20 border-yellow-500/30',
      orange: 'bg-orange-500/20 border-orange-500/30'
    };
    return colorMap[note.backgroundColor] || '';
  };

  if (isLocked && note.password) {
    return (
      <div className="glass-card p-6 animate-glass-fade">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-semibold text-lg">{note.title}</h3>
          <p className="text-sm text-muted-foreground">Esta nota está protegida por senha</p>
          
          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha da nota"
                className="glass-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="glass-button w-full">
              <Lock className="w-4 h-4 mr-2" />
              Desbloquear
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "glass-card p-6 cursor-pointer group animate-glass-fade hover:scale-[1.02] transition-all duration-300",
        getColorClass()
      )}
      style={getBackgroundStyle()}
      onClick={() => onEdit(note)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="font-semibold text-lg line-clamp-1">{note.title}</h3>
          {note.isLocked && (
            <Lock className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="w-8 h-8 p-0 hover:bg-accent/20"
            title="Compartilhar nota"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="w-8 h-8 p-0 hover:bg-primary/20"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Tem certeza que deseja excluir a nota "${note.title}"?`)) {
                onDelete(note.id);
              }
            }}
            className="w-8 h-8 p-0 hover:bg-destructive/20 text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {note.content || 'Nota vazia...'}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
          <span>Criada em {formatDate(note.createdAt)}</span>
          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
            <span>Editada</span>
          )}
        </div>
      </div>
    </div>
  );
};