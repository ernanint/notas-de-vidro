import { useState } from "react";
import { Users, RefreshCw, Info, MoreVertical, Edit3, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useFirebaseSharedNotes } from "../hooks/useFirebaseSharedNotes";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { ShareModal } from "../components/ShareModal";
import { ViewNoteModal } from "../components/ViewNoteModal";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const SharedWithMeNotes = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const { getUserName } = useFirebaseAuth();
  const { 
    sharedNotes, 
    loading, 
    updateSharedNote,
    shareNoteWithUser, 
    removeUserFromNote,
    deleteSharedNote
  } = useFirebaseSharedNotes();

  // Filtrar apenas notas compartilhadas comigo (não minhas)
  const currentUser = getUserName();
  const notesSharedWithMe = sharedNotes.filter(note => 
    note.owner !== currentUser && note.sharedWith.includes(currentUser || "")
  );

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

  const refreshNotes = () => {
    window.dispatchEvent(new CustomEvent('glassnotes_auth_change'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando notas compartilhadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          👥 Compartilhadas Comigo
        </h1>
        <p className="text-center text-muted-foreground">
          Notas que outros usuários compartilharam com você
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Debug Info
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={refreshNotes}
                  variant="outline"
                  size="sm"
                  title="Atualizar notas"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Switch
                  checked={showDebugInfo}
                  onCheckedChange={setShowDebugInfo}
                />
                <Label htmlFor="debug-switch">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    {showDebugInfo ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </Label>
              </div>
            </div>
          </CardHeader>
          {showDebugInfo && (
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>👤 Usuário atual:</strong> {currentUser}</p>
                <p><strong>📊 Total de notas no sistema:</strong> {sharedNotes.length}</p>
                <p><strong>📝 Suas notas próprias:</strong> {sharedNotes.filter(note => note.owner === currentUser).length}</p>
                <p><strong>🤝 Compartilhadas com você:</strong> {notesSharedWithMe.length}</p>
                
                {notesSharedWithMe.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-xs">
                      <strong>📋 Detalhes das notas compartilhadas:</strong>
                    </p>
                    {notesSharedWithMe.map((note, index) => (
                      <div key={note.id} className="text-green-700 dark:text-green-300 text-xs mt-1">
                        {index + 1}. "{note.title}" por {note.owner}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Shared Notes List */}
      {notesSharedWithMe.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma nota compartilhada</h3>
            <p className="text-muted-foreground mb-6">
              Ainda não há notas compartilhadas com você. Peça para outros usuários compartilharem suas notas!
            </p>
            <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg">
              <p><strong>💡 Como funciona:</strong></p>
              <p className="mt-2">1. Outro usuário cria uma nota</p>
              <p>2. Ele clica no botão 👥 "Compartilhar"</p>
              <p>3. Adiciona seu nome de usuário: <strong>{currentUser}</strong></p>
              <p>4. A nota aparecerá aqui automaticamente!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {notesSharedWithMe.map((note) => {
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
                          <span>📤 Compartilhado por: <strong>{note.owner}</strong></span>
                          <span className="text-yellow-300">• {note.sharedWith.length} colaborador(es)</span>
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
                            Ver Colaboradores
                          </DropdownMenuItem>
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
                        <span className="italic">Nota sem conteúdo</span>
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

      {/* Modals */}
      <ViewNoteModal
        isOpen={showViewNoteModal}
        onClose={() => setShowViewNoteModal(false)}
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onShare={handleShareNote}
        onDelete={handleDeleteNote}
        currentUser={currentUser || ""}
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
