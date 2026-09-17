import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [view, setView] = useState('notes'); // 'notes' | 'chat'
  const [chatUser, setChatUser] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);

  const handleSelectNote = useCallback((note) => {
    setActiveNote(note);
  }, []);

  const handleNewNote = useCallback((note) => {
    setActiveNote(note);
  }, []);

  const handleUpdateNote = useCallback((updatedNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setActiveNote(updatedNote);
  }, []);

  // Secret trigger → open chat
  const handleChatLogin = useCallback((user, partner) => {
    setChatUser(user);
    setChatPartner(partner);
    setView('chat');
  }, []);

  // Return to notes from chat
  const handleBackToNotes = useCallback(() => {
    setView('notes');
    setChatUser(null);
    setChatPartner(null);
  }, []);

  const hasActiveView = activeNote || view === 'chat';

  return (
    <div className={`app-container ${hasActiveView ? 'has-active-view' : ''}`}>
      <Sidebar
        notes={notes}
        setNotes={setNotes}
        activeNote={activeNote}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
      />

      {view === 'notes' ? (
        <NoteEditor
          note={activeNote}
          onUpdateNote={handleUpdateNote}
          onChatLogin={handleChatLogin}
        />
      ) : (
        <ChatPanel
          user={chatUser}
          chatPartner={chatPartner}
          onBack={handleBackToNotes}
        />
      )}
    </div>
  );
}
