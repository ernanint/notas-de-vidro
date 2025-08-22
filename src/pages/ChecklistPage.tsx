import { useState } from "react";
import { Plus, CheckCircle2, Circle, Users, MoreVertical, Edit3, Share2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useFirebaseChecklist } from "../hooks/useFirebaseChecklist";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { ShareModal } from "../components/ShareModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

export const ChecklistPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  
  const { getUserName } = useFirebaseAuth();
  const { 
    checklistItems, 
    loading, 
    createChecklistItem,
    toggleChecklistItem,
    shareItemWithUser, 
    removeUserFromItem,
    deleteChecklistItem
  } = useFirebaseChecklist();

  const handleCreateItem = () => {
    if (!newItemTitle.trim()) return;
    
    createChecklistItem({
      title: newItemTitle.trim(),
      backgroundColor: backgroundColor || undefined,
      backgroundImage: backgroundImage || undefined
    });
    
    setNewItemTitle("");
    setBackgroundColor("");
    setBackgroundImage("");
    setShowCreateModal(false);
  };

  const handleShareItem = (item: any) => {
    setSelectedItem(item);
    setShowShareModal(true);
  };

  const handleShareWithUser = (userName: string) => {
    if (selectedItem) {
      shareItemWithUser(selectedItem.id, userName);
    }
  };

  const handleRemoveUser = (userName: string) => {
    if (selectedItem) {
      removeUserFromItem(selectedItem.id, userName);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteChecklistItem(itemId);
  };

  const handleToggleItem = (itemId: string) => {
    toggleChecklistItem(itemId);
  };

  const handleColorChange = (color: string) => {
    setBackgroundColor(color);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setBackgroundImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
          ✅ Lista de Tarefas
        </h1>
        <p className="text-center text-muted-foreground">
          Organize suas tarefas diárias de forma simples
        </p>
      </div>

      {/* Progress Card */}
      <Card className="glass-card mb-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 animate-glass-fade">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Progresso</span>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>✅ Concluídas: {completedCount}</span>
            <span>📋 Total: {totalCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <Card className="glass-card mb-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg">➕ Adicionar Item Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Digite o item da lista..."
              className="glass-input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
            />
            <Button 
              onClick={handleCreateItem}
              disabled={!newItemTitle.trim()}
              className="glass-button shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="shrink-0"
              title="Opções avançadas"
            >
              🎨
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      {checklistItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto animate-glass-fade">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Lista vazia</h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando seus primeiros itens na lista!
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="glass-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-24">
          {checklistItems.map((item, index) => {
            // Preparar estilo do fundo do item
            const itemStyle: React.CSSProperties = {};
            if (item.backgroundImage) {
              itemStyle.backgroundImage = `url(${item.backgroundImage})`;
              itemStyle.backgroundSize = 'cover';
              itemStyle.backgroundPosition = 'center';
            } else if (item.backgroundColor) {
              itemStyle.backgroundColor = item.backgroundColor;
            }

            const hasBackground = item.backgroundImage || item.backgroundColor;

            return (
              <Card 
                key={item.id} 
                className={`relative overflow-hidden border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 animate-glass-fade glass-card ${
                  item.completed ? 'opacity-75' : ''
                }`}
                style={{ 
                  ...itemStyle,
                  animationDelay: `${index * 0.1}s`,
                  borderRadius: '16px'
                }}
              >
                {/* Overlay para melhorar legibilidade quando há fundo */}
                {hasBackground && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] rounded-2xl" />
                )}
                
                <div className="relative z-10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto shrink-0"
                        onClick={() => handleToggleItem(item.id!)}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400 animate-bounce" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <p className={`font-medium transition-all duration-300 ${
                          item.completed 
                            ? "line-through opacity-60" 
                            : hasBackground 
                              ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                              : ""
                        }`}>
                          {item.title}
                        </p>
                        
                        <div className={`flex items-center gap-2 text-xs mt-1 ${
                          hasBackground
                            ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            : "text-muted-foreground"
                        }`}>
                          <span>Por: {item.owner}</span>
                          {item.sharedWith.length > 0 && (
                            <span className={hasBackground ? "text-yellow-300" : "text-primary"}>
                              • {item.sharedWith.length} pessoa(s)
                            </span>
                          )}
                          
                          {/* Indicadores visuais */}
                          {item.backgroundColor && !item.backgroundImage && (
                            <div 
                              className="w-3 h-3 rounded-full border border-white/60 shadow-sm ml-2"
                              style={{ backgroundColor: item.backgroundColor }}
                              title={`Cor: ${item.backgroundColor}`}
                            />
                          )}
                          {item.backgroundImage && (
                            <div 
                              className="w-3 h-3 rounded border border-white/60 shadow-sm bg-cover bg-center ml-2"
                              style={{ backgroundImage: `url(${item.backgroundImage})` }}
                              title="Imagem de fundo"
                            />
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`p-1 h-auto shrink-0 ${
                              hasBackground 
                                ? "text-white hover:bg-white/20" 
                                : ""
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
                          <DropdownMenuItem onClick={() => handleShareItem(item)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartilhar
                          </DropdownMenuItem>
                          {item.owner === getUserName() && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item.id!)}
                                className="text-red-500 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          onClick={() => setShowCreateModal(true)}
          className="w-16 h-16 rounded-full glass-button shadow-2xl animate-glass-glow hover:scale-110 transition-all duration-300"
          title="Adicionar Item"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Create Item Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="glass-modal sm:max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>➕ Novo Item da Lista</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do item</Label>
              <Input
                id="title"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Ex: Comprar leite, Fazer exercícios..."
                className="glass-input"
              />
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
                        backgroundColor === color 
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
                {backgroundImage && (
                  <div className="mt-2">
                    <img 
                      src={backgroundImage} 
                      alt="Preview" 
                      className="w-full h-20 object-cover rounded-lg border border-muted-foreground/20"
                    />
                    <button
                      type="button"
                      onClick={() => setBackgroundImage('')}
                      className="text-xs text-red-400 hover:text-red-300 mt-1"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateItem}
                disabled={!newItemTitle.trim()}
                className="glass-button"
              >
                Criar Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={selectedItem}
        onShareWithUser={handleShareWithUser}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
};
