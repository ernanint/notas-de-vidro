import { useState, useEffect } from "react";
import { X, Lock, Palette, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Note } from "../types/Note";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  editNote?: Note;
  isSharedMode?: boolean;
}

const backgroundColors = [
  { name: 'Padrão', value: '', class: 'bg-transparent' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-500/20' },
  { name: 'Verde', value: 'green', class: 'bg-green-500/20' },
  { name: 'Roxo', value: 'purple', class: 'bg-purple-500/20' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500/20' },
  { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-500/20' },
  { name: 'Laranja', value: 'orange', class: 'bg-orange-500/20' },
];

export const CreateNoteModal = ({ isOpen, onClose, onSave, editNote, isSharedMode = false }: CreateNoteModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    password: '',
    isLocked: false,
    backgroundColor: '',
    backgroundImage: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentBgColor, setCurrentBgColor] = useState('');

  useEffect(() => {
    if (editNote) {
      setFormData({
        title: editNote.title,
        content: editNote.content,
        password: editNote.password || '',
        isLocked: editNote.isLocked,
        backgroundColor: editNote.backgroundColor || '',
        backgroundImage: editNote.backgroundImage || ''
      });
      setCurrentBgColor(editNote.backgroundColor || '');
    } else {
      setFormData({
        title: '',
        content: '',
        password: '',
        isLocked: false,
        backgroundColor: '',
        backgroundImage: ''
      });
      setCurrentBgColor('');
    }
  }, [editNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData: Partial<Note> = {
      title: formData.title.trim() || 'Nova Nota',
      content: formData.content,
      isLocked: formData.isLocked && !!formData.password,
      password: formData.isLocked && formData.password ? formData.password : undefined,
      backgroundColor: formData.backgroundColor || undefined,
      backgroundImage: formData.backgroundImage || undefined,
    };

    onSave(noteData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      password: '',
      isLocked: false,
      backgroundColor: '',
      backgroundImage: ''
    });
    setCurrentBgColor('');
    setShowPassword(false);
    onClose();
  };

  const handleColorChange = (color: string) => {
    setCurrentBgColor(color);
    setFormData({ ...formData, backgroundColor: color });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
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
    if (currentBgColor) {
      const colorMap: Record<string, string> = {
        blue: 'rgba(59, 130, 246, 0.1)',
        green: 'rgba(34, 197, 94, 0.1)',
        purple: 'rgba(147, 51, 234, 0.1)',
        pink: 'rgba(236, 72, 153, 0.1)',
        yellow: 'rgba(234, 179, 8, 0.1)',
        orange: 'rgba(249, 115, 22, 0.1)'
      };
      return {
        backgroundColor: colorMap[currentBgColor] || 'transparent'
      };
    }
    return {};
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="glass-popup max-w-2xl max-h-[90vh] overflow-y-auto"
        style={getBackgroundStyle()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editNote ? 'Editar Nota' : (isSharedMode ? 'Nova Nota Compartilhada' : 'Nova Nota')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input"
              placeholder="Digite o título da nota..."
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="glass-input min-h-[200px] resize-none"
              placeholder="Digite o conteúdo da sua nota aqui..."
            />
          </div>

          {/* Security Section */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/10 border border-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security" className="text-base font-medium">
                  Proteção com Senha
                </Label>
                <p className="text-sm text-muted-foreground">
                  Proteja esta nota com uma senha
                </p>
              </div>
              <Switch
                id="security"
                checked={formData.isLocked}
                onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
              />
            </div>

            {formData.isLocked && (
              <div>
                <Label htmlFor="password">Senha da Nota</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass-input pl-10 pr-10"
                    placeholder="Digite a senha..."
                    required={formData.isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customization Section */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/10 border border-muted/20">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Personalização</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Personalize sua nota com cores e imagens
            </p>

            {/* Color Palette */}
            <div>
              <Label className="text-sm">Cor de Fundo</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentBgColor === color.value 
                        ? 'border-primary scale-110' 
                        : 'border-muted hover:scale-105'
                    } ${color.class}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <Label htmlFor="backgroundImage" className="text-sm">
                Imagem de Fundo
              </Label>
              <div className="mt-2">
                <input
                  id="backgroundImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('backgroundImage')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.backgroundImage ? 'Alterar Imagem' : 'Escolher Imagem'}
                </Button>
                {formData.backgroundImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                    className="mt-2 text-destructive"
                  >
                    Remover Imagem
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="glass-button flex-1">
              {editNote ? 'Salvar Alterações' : 'Criar Nota'}
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