import { useState, useEffect, useMemo } from 'react';
import { FiBook, FiChevronRight, FiPlus, FiFileText, FiTrash2 } from 'react-icons/fi';
import { fetchNotes, createNote, deleteNote } from '../services/api';

const SUBJECTS = [
  { key: 'physics', label: 'Physics', chapters: ['Kinematics', 'Laws of Motion', 'Work & Energy', 'Gravitation', 'Oscillations'] },
  { key: 'chemistry', label: 'Chemistry', chapters: ['Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium'] },
  { key: 'maths', label: 'Maths', chapters: ['Sets & Functions', 'Trigonometry', 'Algebra', 'Coordinate Geometry', 'Calculus'] },
];

export default function Sidebar({ notes, setNotes, activeNote, onSelectNote, onNewNote }) {
  const [openSubjects, setOpenSubjects] = useState({ physics: true, chemistry: false, maths: false });
  const [loading, setLoading] = useState(true);

  // Fetch all notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (key) => {
    setOpenSubjects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNewNote = async (subject) => {
    try {
      const newNote = await createNote({
        title: '',
        body: '',
        subject,
        chapter: '',
      });
      setNotes((prev) => [newNote, ...prev]);
      onSelectNote(newNote);
    } catch (err) {
      console.error('Failed to create note:', err.message);
    }
  };

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNote?.id === noteId) {
        onSelectNote(null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err.message);
    }
  };

  // Group notes by subject
  const notesBySubject = useMemo(() => {
    const grouped = { physics: [], chemistry: [], maths: [] };
    notes.forEach((note) => {
      const subj = note.subject || 'physics';
      if (grouped[subj]) {
        grouped[subj].push(note);
      }
    });
    return grouped;
  }, [notes]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span className="sidebar-title-icon">📚</span>
          PCM Notes
        </div>
        <div className="sidebar-subtitle">Class 11 Study Material</div>
      </div>

      <div className="sidebar-subjects">
        {SUBJECTS.map((subject) => (
          <div className="subject-group" key={subject.key}>
            <div
              className="subject-label"
              onClick={() => toggleSubject(subject.key)}
            >
              <span className={`subject-dot ${subject.key}`} />
              {subject.label}
              <span className="subject-count">
                {notesBySubject[subject.key]?.length || 0}
              </span>
              <FiChevronRight
                className={`subject-chevron ${openSubjects[subject.key] ? 'open' : ''}`}
              />
            </div>

            {openSubjects[subject.key] && (
              <div className="notes-list">
                {notesBySubject[subject.key]?.map((note) => (
                  <div
                    className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                  >
                    <FiFileText className="note-item-icon" />
                    <span className="note-item-title">
                      {note.title || 'Untitled Note'}
                    </span>
                    <span
                      className="note-item-delete"
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      title="Delete note"
                    >
                      <FiTrash2 />
                    </span>
                  </div>
                ))}

                {notesBySubject[subject.key]?.length === 0 && (
                  <div
                    className="note-item"
                    style={{ color: 'var(--color-text-placeholder)', fontStyle: 'italic' }}
                  >
                    No notes yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className="new-note-btn"
          onClick={() => handleNewNote('physics')}
          id="new-note-button"
        >
          <FiPlus />
          New Note
        </button>
      </div>
    </aside>
  );
}
