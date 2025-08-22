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
    dueTime: '',
    backgroundColor: '',
    backgroundImage: ''
  });
  const [currentBgColor, setCurrentBgColor] = useState('');

  console.log('🔥 CreateTaskModal - isOpen:', isOpen);
  console.log('🔥 CreateTaskModal - isSharedMode:', isSharedMode);

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
        dueDate: editTask.dueDate ? editTask.dueDate.toISOString().split('T')[0] : '',
        dueTime: editTask.dueTime || '',
        backgroundColor: (editTask as any).backgroundColor || '',
        backgroundImage: (editTask as any).backgroundImage || ''
      });
      setCurrentBgColor((editTask as any).backgroundColor || '');
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        backgroundColor: '',
        backgroundImage: ''
      });
      setCurrentBgColor('');
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔥 CreateTaskModal - handleSubmit chamado');
    console.log('🔥 CreateTaskModal - formData:', formData);
    
    const taskData: Partial<Task> = {
      title: formData.title.trim() || 'Nova Tarefa',
      description: formData.description.trim(),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      backgroundColor: formData.backgroundColor || undefined,
      backgroundImage: formData.backgroundImage || undefined,
      dueTime: formData.dueTime || undefined,
      priority: 'medium' as 'low' | 'medium' | 'high'
    };

    console.log('🔥 CreateTaskModal - taskData preparado:', taskData);
    console.log('🔥 CreateTaskModal - chamando onSave...');

    onSave(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      backgroundColor: '',
      backgroundImage: ''
    });
    setCurrentBgColor('');
    onClose();
  };

  const handleColorChange = (color: string) => {
    setCurrentBgColor(color);
    setFormData({ ...formData, backgroundColor: color });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 1MB para evitar problemas com Firestore)
      if (file.size > 1024 * 1024) {
        console.log('❌ CreateTaskModal - Arquivo muito grande:', file.size, 'bytes');
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 1MB.');
        return;
      }

      console.log('📸 CreateTaskModal - Processando imagem:', file.name, file.size, 'bytes');
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        console.log('📸 CreateTaskModal - Imagem carregada:', imageUrl.length, 'chars');
        setFormData({ ...formData, backgroundImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const getBackgroundStyle = () => {
    if (formData.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${formData.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    if (formData.backgroundColor) {
      return {
        backgroundColor: formData.backgroundColor
      };
    }
    return {};
  };

  // Get current date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="glass-modal max-w-md w-[95vw] sm:w-full overflow-y-auto"
        style={getBackgroundStyle()}
      >
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

          {/* Background Customization */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">🎨 Personalização Visual</Label>
            
            {/* Color Palette */}
            <div>
              <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
              <div className="flex gap-2 mt-2">
                {['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'].map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentBgColor === color 
                        ? 'border-primary scale-110' 
                        : 'border-muted-foreground/30 hover:border-primary/50'
                    }`}
                    style={{ 
                      backgroundColor: color || '#transparent',
                      background: !color ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
                      backgroundSize: !color ? '8px 8px' : undefined,
                      backgroundPosition: !color ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
                    }}
                    title={!color ? 'Sem cor de fundo' : `Cor de fundo: ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="backgroundImage" className="text-xs text-muted-foreground">Imagem de fundo</Label>
              <Input
                id="backgroundImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="glass-input mt-2"
              />
              {formData.backgroundImage && (
                <div className="mt-2">
                  <img 
                    src={formData.backgroundImage} 
                    alt="Preview" 
                    className="w-full h-20 object-cover rounded-lg border border-muted-foreground/20"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Remover imagem
                  </button>
                </div>
              )}
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