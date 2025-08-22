import { useState } from "react";
import { Database, Users, Shield, Zap, Plus, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useFirebaseSharedNotes } from "../hooks/useFirebaseSharedNotes";
import { CreateNoteModal } from "../components/CreateNoteModal";

export const FirebaseHome = () => {
  const { currentUser } = useFirebaseAuth();
  const { sharedNotes, createSharedNote } = useFirebaseSharedNotes();
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);

  // DEBUG: Teste direto de criação de nota com imagem
  const testeDirectoNotaComImagem = () => {
    console.log('🚨 TESTE DIRETO - Criando nota com imagem via código...');
    const noteData = {
      title: 'Nota de Teste DEBUG',
      content: 'Criada pelo botão de debug',
      backgroundColor: '#EF4444',
      backgroundImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+REVCVUc8L3RleHQ+PC9zdmc+'
    };
    console.log('🚨 TESTE DIRETO - Dados da nota:', noteData);
    createSharedNote(noteData);
  };

  const handleCreateNote = (noteData: any) => {
    createSharedNote(noteData);
    setShowCreateNoteModal(false);
  };

  const myNotes = sharedNotes.filter(note => note.owner === currentUser);
  const sharedWithMe = sharedNotes.filter(note => note.owner !== currentUser);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          GlassNotes
        </h1>
        <p className="text-center text-muted-foreground">
          Bem-vindo de volta, <strong>{currentUser}</strong>! ☁️
        </p>
        

      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              Status da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Dados seguros na nuvem</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Sincronização automática</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Suas Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{myNotes.length}</div>
                <div className="text-xs text-muted-foreground">Suas Notas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{sharedWithMe.length}</div>
                <div className="text-xs text-muted-foreground">Compartilhadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Crie conteúdo diretamente na nuvem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowCreateNoteModal(true)}
              className="glass-button h-16 flex-col gap-2"
            >
              <Plus className="w-6 h-6" />
              Nova Nota na Nuvem
            </Button>
            <Button 
              className="glass-button h-16 flex-col gap-2"
              variant="outline"
            >
              <CheckSquare className="w-6 h-6" />
              Nova Tarefa na Nuvem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notes */}
      {sharedNotes.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Notas Recentes</CardTitle>
            <CardDescription>
              Suas últimas criações na nuvem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedNotes.slice(0, 3).map((note) => {
                const noteStyle: React.CSSProperties = {};
                if (note.backgroundImage) {
                  noteStyle.backgroundImage = `url(${note.backgroundImage})`;
                  noteStyle.backgroundSize = 'cover';
                  noteStyle.backgroundPosition = 'center';
                } else if (note.backgroundColor) {
                  noteStyle.backgroundColor = note.backgroundColor;
                }

                return (
                  <div 
                    key={note.id} 
                    className="relative p-3 rounded-lg bg-muted/10 border border-muted/20 cursor-pointer hover:bg-muted/20 transition-colors overflow-hidden"
                    style={noteStyle}
                  >
                    {(note.backgroundImage || note.backgroundColor) && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg" />
                    )}
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            note.backgroundImage || note.backgroundColor 
                              ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                              : ""
                          }`}>
                            {note.title}
                          </h4>
                          
                          {/* Indicadores visuais de cor/imagem */}
                          {note.backgroundColor && !note.backgroundImage && (
                            <div 
                              className="w-3 h-3 rounded-full border border-white/60 shadow-sm"
                              style={{ backgroundColor: note.backgroundColor }}
                              title={`Cor: ${note.backgroundColor}`}
                            />
                          )}
                          {note.backgroundImage && (
                            <div 
                              className="w-3 h-3 rounded border border-white/60 shadow-sm bg-cover bg-center"
                              style={{ backgroundImage: `url(${note.backgroundImage})` }}
                              title="Imagem de fundo"
                            />
                          )}
                        </div>
                        
                        <p className={`text-sm ${
                          note.backgroundImage || note.backgroundColor
                            ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            : "text-muted-foreground"
                        }`}>
                          Por: {note.owner} • {note.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      {note.sharedWith.length > 0 && (
                        <div className="flex items-center gap-1 ml-3">
                          <Users className={`w-4 h-4 ${
                            note.backgroundImage || note.backgroundColor ? "text-yellow-300" : "text-primary"
                          }`} />
                          <span className={`text-sm ${
                            note.backgroundImage || note.backgroundColor ? "text-yellow-300" : "text-primary"
                          }`}>
                            {note.sharedWith.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {sharedNotes.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    Ver todas as notas →
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sharedNotes.length === 0 && (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-2">Primeira vez no Firebase?</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira nota na nuvem e experimente o compartilhamento em tempo real!
            </p>
            <Button onClick={() => setShowCreateNoteModal(true)} className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Nota
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        onSave={handleCreateNote}
        isSharedMode={true}
      />
    </div>
  );
};
