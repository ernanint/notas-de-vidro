import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Task } from "../types/Task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editTask?: Task;
  isSharedMode?: boolean;
}

export const CreateTaskModal = ({ isOpen, onClose, onSave, editTask, isSharedMode = false }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: ''
  });

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
        dueDate: editTask.dueDate ? editTask.dueDate.toISOString().split('T')[0] : '',
        dueTime: editTask.dueTime || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: ''
      });
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      title: formData.title.trim() || 'Nova Tarefa',
      description: formData.description.trim(),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      dueTime: formData.dueTime || undefined
    };

    onSave(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: ''
    });
    onClose();
  };

  // Get current date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-popup max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editTask ? 'Editar Tarefa' : (isSharedMode ? 'Nova Tarefa Compartilhada' : 'Nova Tarefa')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input"
              placeholder="Digite o título da tarefa..."
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input min-h-[100px] resize-none"
              placeholder="Descreva os detalhes da tarefa..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dueDate">Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="glass-input pl-10"
                  min={today}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueTime">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="glass-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Notification Info */}
          {formData.dueDate && formData.dueTime && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <span className="text-lg">🔔</span>
                Você receberá uma notificação no horário definido
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="glass-button flex-1">
              {editTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};