import { useState } from "react";
import { Plus, Lock, Search, Trash2, Edit } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { NoteCard } from "../components/NoteCard";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { useNotes } from "../hooks/useNotes";
import { Note } from "../types/Note";

export const Notes = () => {
  const { notes, createNote, deleteNote, updateNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = (noteData: Partial<Note>) => {
    createNote(noteData);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Minhas Notas
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-12 text-lg"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma nota encontrada</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Tente buscar por outros termos" 
                : "Crie sua primeira nota para começar!"
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="glass-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira nota
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setSelectedNote}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full glass-button shadow-2xl z-40 animate-glass-glow"
      >
        <Plus className="w-8 h-8" />
      </Button>

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateNote}
      />

      {selectedNote && (
        <CreateNoteModal
          isOpen={true}
          onClose={() => setSelectedNote(null)}
          onSave={(noteData) => {
            updateNote(selectedNote.id, noteData);
            setSelectedNote(null);
          }}
          editNote={selectedNote}
        />
      )}
    </div>
  );
};