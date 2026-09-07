import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PadNote, PadTag } from '../types/pad';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

interface PadContextType {
  notes: PadNote[];
  tags: PadTag[];
  isLoading: boolean;

  // CRUD
  addNote: (note: Omit<PadNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<PadNote>) => void;
  deleteNote: (id: string) => void;

  // Tags
  addTag: (tag: Omit<PadTag, 'id' | 'createdAt'>) => void;
  deleteTag: (id: string) => void;

  // Filtros
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;

  // Modal Note
  isModalOpen: boolean;
  activeNoteId: string | null;
  openNewNote: () => void;
  openEditNote: (id: string) => void;
  closeNoteModal: () => void;

  // Modal Tag Manager
  isTagManagerOpen: boolean;
  openTagManager: () => void;
  closeTagManager: () => void;
}

const PadContext = createContext<PadContextType | undefined>(undefined);

export const usePad = () => {
  const context = useContext(PadContext);
  if (!context) throw new Error('usePad deve ser usado dentro de PadProvider');
  return context;
};

const STORAGE_KEY = 'vitapad-data';

// Filtra notas vazias/fantasmas geradas acidentalmente
const filterGhostNotes = (notesList: PadNote[]) => {
  return (notesList || []).filter(
    (n) =>
      !(
        (n.title === 'Nova Anotação' || n.title === '' || !n.title) &&
        (!n.content || n.content.trim() === '') &&
        (!n.checklist || n.checklist.length === 0)
      )
  );
};

export const PadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PadNote[]>([]);
  const [tags, setTags] = useState<PadTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  const openNewNote = useCallback(() => {
    setActiveNoteId(null);
    setIsModalOpen(true);
  }, []);

  const openEditNote = useCallback((id: string) => {
    setActiveNoteId(id);
    setIsModalOpen(true);
  }, []);

  const closeNoteModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveNoteId(null);
  }, []);

  const openTagManager = useCallback(() => {
    setIsTagManagerOpen(true);
  }, []);

  const closeTagManager = useCallback(() => {
    setIsTagManagerOpen(false);
  }, []);

  // Carregar dados iniciais (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanedNotes = filterGhostNotes(parsed.notes);
        setNotes(cleanedNotes);
        setTags(parsed.tags || []);
      } catch (e) {
        console.error('Erro ao ler localStorage do VitaPad:', e);
      }
    }
  }, []);

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, tags }));
  }, [notes, tags]);

  // Sincronização Supabase
  useEffect(() => {
    if (user && supabase) {
      setIsLoading(true);
      Promise.all([
        supabase.from('pad_notes').select('*').eq('user_id', user.id),
        supabase.from('pad_tags').select('*').eq('user_id', user.id),
      ])
        .then(([notesRes, tagsRes]) => {
          if (notesRes.data) {
            const cleanedNotes = filterGhostNotes(notesRes.data);
            setNotes(cleanedNotes);
          }
          if (tagsRes.data) setTags(tagsRes.data);
        })
        .catch((err) => {
          console.error('Erro ao buscar dados Supabase VitaPad:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const addNote = useCallback(
    (noteData: Omit<PadNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNote: PadNote = {
        ...noteData,
        id: `pad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      if (user && supabase) {
        supabase
          .from('pad_notes')
          .insert({
            id: newNote.id,
            user_id: user.id,
            title: newNote.title,
            content: newNote.content,
            color: newNote.color,
            is_pinned: newNote.isPinned,
            is_archived: newNote.isArchived,
            is_favorite: newNote.isFavorite,
            tags: newNote.tags,
            checklist: newNote.checklist,
            order_index: newNote.orderIndex,
          })
          .then();
      }
    },
    [user]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<PadNote>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n
        )
      );
      if (user && supabase) {
        const mappedUpdates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) mappedUpdates.title = updates.title;
        if (updates.content !== undefined) mappedUpdates.content = updates.content;
        if (updates.color !== undefined) mappedUpdates.color = updates.color;
        if (updates.isPinned !== undefined) mappedUpdates.is_pinned = updates.isPinned;
        if (updates.isArchived !== undefined) mappedUpdates.is_archived = updates.isArchived;
        if (updates.isFavorite !== undefined) mappedUpdates.is_favorite = updates.isFavorite;
        if (updates.tags !== undefined) mappedUpdates.tags = updates.tags;
        if (updates.checklist !== undefined) mappedUpdates.checklist = updates.checklist;
        if (updates.orderIndex !== undefined) mappedUpdates.order_index = updates.orderIndex;

        supabase.from('pad_notes').update(mappedUpdates).eq('id', id).then();
      }
    },
    [user]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (user && supabase) {
        supabase.from('pad_notes').delete().eq('id', id).then();
      }
    },
    [user]
  );

  const addTag = useCallback(
    (tag: Omit<PadTag, 'id' | 'createdAt'>) => {
      const newTag = {
        ...tag,
        id: `tag-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTags((prev) => [...prev, newTag]);
      if (user && supabase) {
        supabase
          .from('pad_tags')
          .insert({
            id: newTag.id,
            user_id: user.id,
            name: newTag.name,
            color: newTag.color,
          })
          .then();
      }
    },
    [user]
  );

  const deleteTag = useCallback(
    (id: string) => {
      setTags((prev) => prev.filter((t) => t.id !== id));
      if (user && supabase) {
        supabase.from('pad_tags').delete().eq('id', id).then();
      }
    },
    [user]
  );

  return (
    <PadContext.Provider
      value={{
        notes,
        tags,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        addTag,
        deleteTag,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        isModalOpen,
        activeNoteId,
        openNewNote,
        openEditNote,
        closeNoteModal,
        isTagManagerOpen,
        openTagManager,
        closeTagManager,
      }}
    >
      {children}
    </PadContext.Provider>
  );
};
