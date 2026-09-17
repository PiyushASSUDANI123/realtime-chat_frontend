import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiLoader, FiChevronDown } from 'react-icons/fi';
import { useAutoSave } from '../hooks/useAutoSave';
import { loginWithPhrase } from '../services/api';

const SUBJECT_OPTIONS = [
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'maths', label: 'Maths' },
];

export default function NoteEditor({ note, onUpdateNote, onChatLogin }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('physics');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const { triggerSave, flushSave } = useAutoSave(note?.id, 2000);

  // Sync local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setSubject(note.subject || 'physics');
      setSaveStatus('idle');
    }
  }, [note?.id]);

  // Auto-save on body or subject change
  const handleAutoSave = useCallback(
    (newData) => {
      triggerSave(
        newData,
        () => setSaveStatus('saving'),
        () => {
          setSaveStatus('saved');
          if (onUpdateNote) {
            onUpdateNote({ ...note, ...newData });
          }
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      );
    },
    [triggerSave, note, onUpdateNote]
  );

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
  };

  const handleTitleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = title.trim();

      // Check for secret phrases
      if (trimmed === 'password - piyush' || trimmed === 'password - tannu') {
        try {
          const result = await loginWithPhrase(trimmed);
          if (result.success) {
            setTitle(''); // Clear silently
            onChatLogin(result.user, result.chatPartner);
            return;
          }
        } catch (err) {
          // If auth fails, just save as normal note
          console.error('Auth check failed:', err.message);
        }
      }

      // Normal title — auto-save
      handleAutoSave({ title: trimmed, body, subject });
    }
  };

  const handleBodyChange = (e) => {
    const val = e.target.value;
    setBody(val);
    handleAutoSave({ title, body: val, subject });
  };

  const handleSubjectChange = (key) => {
    setSubject(key);
    setShowSubjectDropdown(false);
    handleAutoSave({ title, body, subject: key });
  };

  // Flush save when navigating away
  useEffect(() => {
    return () => {
      flushSave();
    };
  }, [flushSave]);

  if (!note) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">Select a note or create a new one</div>
          <div className="empty-state-sub">Your notes auto-save as you type</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`editor-subject-badge ${subject}`}>
            <span className={`subject-dot ${subject}`} />
            {SUBJECT_OPTIONS.find((s) => s.key === subject)?.label}
          </span>

          <div className="subject-selector">
            <button
              className="subject-selector-btn"
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            >
              Change <FiChevronDown />
            </button>
            {showSubjectDropdown && (
              <div className="subject-dropdown">
                {SUBJECT_OPTIONS.map((s) => (
                  <div
                    key={s.key}
                    className="subject-dropdown-item"
                    onClick={() => handleSubjectChange(s.key)}
                  >
                    <span className={`subject-dot ${s.key}`} />
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`save-indicator ${saveStatus}`}>
          <span className="save-dot" />
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'idle' && 'Auto-save on'}
        </div>
      </div>

      <div className="editor-body">
        <input
          className="editor-title-input"
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          id="note-title-input"
          autoComplete="off"
          spellCheck={false}
        />
        <textarea
          className="editor-content-textarea"
          placeholder="Start writing your notes here..."
          value={body}
          onChange={handleBodyChange}
          id="note-body-textarea"
        />
      </div>
    </div>
  );
}
