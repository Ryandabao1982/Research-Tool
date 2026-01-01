import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface RelatedNote {
  id: string;
  title: string;
  updated_at: string;
  tags: string[];
}

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setEditTitle(note.title);
        setEditContent(note.content);
        setIsEditing(true);
        loadRelatedNotes(note.id, note.content);
      }
    } else {
      setEditTitle('');
      setEditContent('');
      setIsEditing(false);
      setRelatedNotes([]);
    }
  }, [selectedNoteId, notes]);

  const loadNotes = async () => {
    try {
      const result = await invoke('get_notes') as any[];
      setNotes(result || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedNotes = async (noteId: string, content: string) => {
    try {
      const result = await invoke('get_related_notes', {
        noteContent: content,
        limit: 10,
        currentNoteId: noteId,
      }) as any[];
      setRelatedNotes(result || []);
    } catch (error) {
      console.error('Failed to load related notes:', error);
      setRelatedNotes([]);
    }
  };

  const handleCreateNote = () => {
    const newId = crypto.randomUUID();
    setEditTitle('');
    setEditContent('');
    setSelectedNoteId(newId);
    setIsEditing(true);
    setRelatedNotes([]);
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId) return;

    const isNew = !notes.find(n => n.id === selectedNoteId);

    try {
      if (isNew) {
        await invoke('create_note', {
          title: editTitle || 'Untitled Note',
          content: editContent,
        });
      } else {
        await invoke('update_note', {
          id: selectedNoteId,
          title: editTitle,
          content: editContent,
        });
      }
      await loadNotes();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleCancelEdit = () => {
    setSelectedNoteId(null);
    setIsEditing(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await invoke('delete_note', { id: noteId });
      await loadNotes();
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ marginLeft: 240, minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading notes...
        </div>
      </div>
    );
  }

  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;

  return (
    <div style={{ marginLeft: 240, minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        height: 60,
        backgroundColor: '#eeeeee',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: '#000' }}>
          {selectedNoteId ? (selectedNote?.title || 'Untitled Note') : 'Notes'}
        </span>
        <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#666' }}>
          ⌘K Search
        </span>
      </header>

      {/* Main Content - Split View */}
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Left: Editor Pane */}
        <div style={{
          width: 720,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #ddd',
          padding: '20px 40px',
          overflow: 'auto',
        }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title Input */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title..."
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  color: '#000',
                }}
              />

              {/* Content Textarea */}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Start writing..."
                style={{
                  flex: 1,
                  minHeight: 400,
                  fontSize: 16,
                  lineHeight: 1.6,
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  color: '#000',
                }}
              />

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    border: 'none',
                    backgroundColor: '#0066FF',
                    color: '#fff',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Notes List */}
              {notes.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: '60px 0' }}>
                  No notes yet. Create your first note.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      cursor: 'pointer',
                      backgroundColor: selectedNoteId === note.id ? '#f5f5f5' : '#fff',
                    }}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    <div style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#000',
                      marginBottom: 4,
                    }}>
                      {note.title || 'Untitled'}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginBottom: 8,
                    }}>
                      {new Date(note.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {note.content?.substring(0, 100)}...
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      style={{
                        marginTop: 8,
                        padding: '4px 8px',
                        fontSize: 12,
                        border: '1px solid #ff4444',
                        backgroundColor: '#fff',
                        color: '#ff4444',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}

              {/* New Note Button */}
              <button
                onClick={handleCreateNote}
                style={{
                  padding: '16px',
                  fontSize: 16,
                  border: '2px dashed #ddd',
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                + New Note
              </button>
            </div>
          )}
        </div>

        {/* Right: Related Notes Pane */}
        <div style={{
          width: 720,
          backgroundColor: '#f5f5f5',
          padding: '20px',
          overflow: 'auto',
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#666',
            letterSpacing: '0.5px',
            marginBottom: 20,
          }}>
            RELATED NOTES
          </div>

          {!selectedNoteId ? (
            <div style={{ color: '#999', fontSize: 14 }}>
              Select or create a note to see related notes.
            </div>
          ) : relatedNotes.length === 0 ? (
            <div style={{ color: '#999', fontSize: 14 }}>
              No related notes found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {relatedNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#000',
                    marginBottom: 4,
                  }}>
                    {note.title || 'Untitled'}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#999',
                  }}>
                    {new Date(note.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {note.tags && note.tags.length > 0 && ` | ${note.tags.map((t: string) => `#${t}`).join(' ')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
