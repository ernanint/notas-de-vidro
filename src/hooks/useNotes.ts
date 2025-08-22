import { useState, useEffect } from 'react';
import { Note } from '../types/Note';
import { useToast } from './use-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load notes from localStorage on mount
    const savedNotes = localStorage.getItem('glassnotes_notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing notes:', error);
      }
    }
  }, []);

  const saveNotes = (notesToSave: Note[]) => {
    localStorage.setItem('glassnotes_notes', JSON.stringify(notesToSave));
    setNotes(notesToSave);
  };

  const createNote = (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteData.title || 'Nova Nota',
      content: noteData.content || '',
      password: noteData.password || undefined,
      backgroundColor: noteData.backgroundColor || undefined,
      backgroundImage: noteData.backgroundImage || undefined,
      isLocked: !!noteData.password,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);

    toast({
      title: "✅ Nota criada com sucesso",
      description: `"${newNote.title}" foi adicionada às suas notas`,
      duration: 3000,
    });

    return newNote;
  };

  const updateNote = (id: string, noteData: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? {
            ...note,
            ...noteData,
            updatedAt: new Date()
          }
        : note
    );

    saveNotes(updatedNotes);

    toast({
      title: "💾 Nota salva",
      description: "Suas alterações foram salvas com sucesso",
      duration: 2000,
    });
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);

    toast({
      title: "🗑️ Nota excluída",
      description: `"${noteToDelete?.title}" foi removida permanentemente`,
      duration: 3000,
    });
  };

  const validateNotePassword = (note: Note, inputPassword: string): boolean => {
    return note.password === inputPassword;
  };

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    validateNotePassword
  };
};