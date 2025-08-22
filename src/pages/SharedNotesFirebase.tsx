import { useState } from "react";
import { Plus, Users, CheckSquare, RefreshCw, Info, Loader2, MoreVertical, Edit3, Trash2, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useFirebaseSharedNotes } from "../hooks/useFirebaseSharedNotes";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { ShareModal } from "../components/ShareModal";
import { ViewNoteModal } from "../components/ViewNoteModal";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";

export const SharedNotesFirebase = () => {
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const { getUserName } = useFirebaseAuth();
  const { 
    sharedNotes, 
    loading, 
    createSharedNote, 
    updateSharedNote,
    shareNoteWithUser, 
    removeUserFromNote,
    deleteSharedNote
  } = useFirebaseSharedNotes();

  const handleCreateNote = (noteData: any) => {
    createSharedNote(noteData);
    setShowCreateNoteModal(false);
  };

  const handleViewNote = (note: any) => {
    setSelectedNote(note);
    setShowViewNoteModal(true);
  };

  const handleUpdateNote = (noteId: string, noteData: any) => {
    updateSharedNote(noteId, noteData);
  };

  const handleShareNote = (note: any) => {
    setSelectedNote(note);
    setShowShareModal(true);
  };

  const handleShareWithUser = (userName: string) => {
    if (selectedNote) {
      shareNoteWithUser(selectedNote.id, userName);
    }
  };

  const handleRemoveUser = (userName: string) => {
    if (selectedNote) {
      removeUserFromNote(selectedNote.id, userName);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (deleteSharedNote) {
      deleteSharedNote(noteId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Conectando com Firebase...</p>
          <p className="text-sm text-muted-foreground">Carregando suas notas compartilhadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          🔥 Firebase Notas Compartilhadas
        </h1>
        
        {/* Info Card */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">Colaboração em Tempo Real com Firebase</p>
                <p className="text-sm text-muted-foreground">
                  Notas sincronizadas instantaneamente entre dispositivos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                title="Reconectar Firebase"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Conectado ao Firebase" />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{sharedNotes.length}</div>
            <div className="text-sm text-muted-foreground">Notas no Firebase</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {sharedNotes.filter(note => note.owner === getUserName()).length}
            </div>
            <div className="text-sm text-muted-foreground">Suas Notas</div>
          </div>
        </div>

        {/* Debug Info */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Status Firebase
              </CardTitle>
              <Button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                variant="outline"
                size="sm"
              >
                {showDebugInfo ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </CardHeader>
          {showDebugInfo && (
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>✅ Status:</strong> Conectado ao Firebase</p>
                <p><strong>👤 Usuário atual:</strong> {getUserName()}</p>
                <p><strong>📊 Total de notas:</strong> {sharedNotes.length}</p>
                <p><strong>📝 Suas notas:</strong> {sharedNotes.filter(note => note.owner === getUserName()).length}</p>
                <p><strong>🤝 Compartilhadas com você:</strong> {sharedNotes.filter(note => note.owner !== getUserName()).length}</p>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    🎉 Firebase funcionando! Agora o compartilhamento funciona entre diferentes dispositivos!
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Shared Notes List */}
      {sharedNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma nota no Firebase ainda</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira nota compartilhada no Firebase!
            </p>
            <Button 
              onClick={() => setShowCreateNoteModal(true)}
              className="glass-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Nota
            </Button>
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {sharedNotes.map((note) => {
            // Preparar estilo do fundo da nota
            const noteStyle: React.CSSProperties = {};
            if (note.backgroundImage) {
              noteStyle.backgroundImage = `url(${note.backgroundImage})`;
              noteStyle.backgroundSize = 'cover';
              noteStyle.backgroundPosition = 'center';
            } else if (note.backgroundColor) {
              noteStyle.backgroundColor = note.backgroundColor;
            }

            return (
              <Card 
                key={note.id} 
                className="note-card relative overflow-hidden cursor-pointer border border-white/20"
                onClick={() => handleViewNote(note)}
                style={noteStyle}
              >
                {/* Overlay para melhorar legibilidade quando há fundo */}
                {(note.backgroundImage || note.backgroundColor) && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                )}
                
                <div className="relative z-10 card-content">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={`text-lg transition-colors ${
                          note.backgroundImage || note.backgroundColor 
                            ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                            : "hover:text-primary"
                        }`}>
                          {note.title}
                        </CardTitle>
                        <CardDescription className={`flex items-center gap-2 mt-1 ${
                          note.backgroundImage || note.backgroundColor
                            ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            : ""
                        }`}>
                          <span>Por: {note.owner}</span>
                          {note.sharedWith.length > 0 && (
                            <span className="text-yellow-300">• {note.sharedWith.length} colaborador(es)</span>
                          )}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={note.backgroundImage || note.backgroundColor ? "secondary" : "outline"}
                            size="sm"
                            className={`shrink-0 ${
                              note.backgroundImage || note.backgroundColor
                                ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                                : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewNote(note);
                          }}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleShareNote(note);
                          }}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartilhar
                          </DropdownMenuItem>
                          {note.owner === getUserName() && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
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
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <p className={`text-sm line-clamp-3 mb-3 ${
                      note.backgroundImage || note.backgroundColor
                        ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        : "text-muted-foreground"
                    }`}>
                      {note.content || (
                        <span className="italic">
                          {note.owner === getUserName() ? "Clique para adicionar conteúdo..." : "Nota vazia"}
                        </span>
                      )}
                    </p>
                    
                    {/* Indicador visual de cor/imagem */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        {note.backgroundColor && !note.backgroundImage && (
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
                            style={{ backgroundColor: note.backgroundColor }}
                            title={`Cor: ${note.backgroundColor}`}
                          />
                        )}
                        {note.backgroundImage && (
                          <div 
                            className="w-4 h-4 rounded border-2 border-white/50 shadow-sm bg-cover bg-center"
                            style={{ backgroundImage: `url(${note.backgroundImage})` }}
                            title="Imagem de fundo"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-xs ${
                      note.backgroundImage || note.backgroundColor
                        ? "text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        : "text-muted-foreground"
                    }`}>
                      <span>Criada: {note.createdAt.toLocaleDateString('pt-BR')}</span>
                      <span>Atualizada: {note.updatedAt.toLocaleDateString('pt-BR')}</span>
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
          onClick={() => setShowCreateNoteModal(true)}
          className="w-16 h-16 rounded-full glass-button shadow-2xl animate-glass-glow"
          title="Criar Nota no Firebase"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        onSave={handleCreateNote}
        isSharedMode={true}
      />

      <ViewNoteModal
        isOpen={showViewNoteModal}
        onClose={() => setShowViewNoteModal(false)}
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onShare={handleShareNote}
        onDelete={handleDeleteNote}
        currentUser={getUserName() || ""}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={selectedNote}
        onShareWithUser={handleShareWithUser}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
};
