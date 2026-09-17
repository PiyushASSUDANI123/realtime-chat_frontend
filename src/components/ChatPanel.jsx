import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowLeft, FiPaperclip, FiSend, FiX, FiMic, FiSquare } from 'react-icons/fi';
import { useSocket } from '../hooks/useSocket';
import { fetchMessages, uploadMedia } from '../services/api';
import ChatBubble from './ChatBubble';

export default function ChatPanel({ user, chatPartner, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Media / Audio
  const [mediaPreview, setMediaPreview] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Editing
  const [editingMessage, setEditingMessage] = useState(null);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState(null);

  // Pagination
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const oldestMessageIdRef = useRef(null);

  const messagesEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    socket,
    isConnected,
    partnerOnline,
    partnerTyping,
    newMessage,
    sendMessage,
    emitTyping,
  } = useSocket(user);

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 5 minutes = 300000 ms
      timeoutId = setTimeout(() => {
        onBack();
      }, 300000);
    };

    resetTimer(); // start initially
    
    // Listen to user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [onBack]);

  // Load initial messages
  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async (cursor = null) => {
    try {
      if (cursor) setLoadingOlder(true);
      const data = await fetchMessages(user.id, cursor);
      
      if (data.length < 50) setHasMore(false);
      
      if (data.length > 0) {
        if (cursor) {
          setMessages((prev) => [...data, ...prev]);
        } else {
          setMessages(data);
          // Wait for render then scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 100);
        }
        oldestMessageIdRef.current = data[0].id;
      }
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    } finally {
      if (cursor) setLoadingOlder(false);
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !loadingOlder && hasMore) {
      loadMessages(oldestMessageIdRef.current);
    }
  };

  // Handle socket events inside useEffect via the socket instance directly
  // The hook provides `newMessage`, but we also need other events. 
  // Let's hook into them. Since useSocket is mostly for general connection, 
  // we'll handle specific chat events by getting the socket from window or passing it.
  // Actually, we can just listen via a side-effect if we export the socket ref, 
  // but to keep it simple, we can listen for window events or update the hook.
  // Wait, I didn't expose the socket in `useSocket`. Let me do that.
  // For now, I will use `newMessage` and rely on a polling mechanism or similar if needed.
  // Actually, I should update `useSocket` to return the `socketRef` so I can bind more events here.

  // Let's assume `useSocket` returns `socket` now. (I will update useSocket right after this)
  
  useEffect(() => {
    const unseenIds = messages
      .filter(m => m.receiver_id === user.id && m.status !== 'seen')
      .map(m => m.id);

    if (unseenIds.length > 0 && isConnected && socket) {
      socket.emit('mark_seen', { messageIds: unseenIds, userId: user.id });
    }
  }, [messages, isConnected, user.id, socket]);

  // Handle custom socket events
  useEffect(() => {
    if (!socket) return;

    const handleMessagesSeen = ({ messageIds }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, status: 'seen' } : m));
    };

    const handleMessagesDelivered = ({ userId }) => {
      if (userId === chatPartner.id) {
        setMessages(prev => prev.map(m => m.status === 'sent' && m.receiver_id === userId ? { ...m, status: 'delivered' } : m));
      }
    };

    const handleMessageEdited = ({ messageId, newText, isEdited }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, message_text: newText, is_edited: isEdited } : m));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    const handleMessageReacted = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    };

    socket.on('messages_seen', handleMessagesSeen);
    socket.on('messages_delivered', handleMessagesDelivered);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reacted', handleMessageReacted);

    return () => {
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('messages_delivered', handleMessagesDelivered);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reacted', handleMessageReacted);
    };
  }, [socket, chatPartner.id]);

  // Handle new incoming messages from socket
  useEffect(() => {
    if (newMessage) {
      if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [newMessage, user?.id]);


  const handleInputChange = (e) => {
    setInputText(e.target.value);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    const currentCaption = captionText.trim();
    const currentMedia = mediaPreview;
    const currentEditingMessage = editingMessage;

    if (!text && !currentMedia) return;

    // Clear input immediately to prevent double sends
    setInputText('');
    setCaptionText('');
    setMediaPreview(null);

    let mediaUrl = null;
    let mediaType = null;

    if (currentMedia) {
      try {
        setUploading(true);
        const uploadResult = await uploadMedia(currentMedia.file);
        mediaUrl = uploadResult.mediaUrl;
        mediaType = uploadResult.mediaType;
      } catch (err) {
        console.error('Upload failed:', err.message);
        setUploading(false);
        // Put the media back if it failed
        setMediaPreview(currentMedia);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (currentEditingMessage) {
      if (socket) {
        socket.emit('edit_message', { messageId: currentEditingMessage.id, newText: text, userId: user.id });
      }
      setEditingMessage(null);
    } else {
      sendMessage({
        senderId: user.id,
        receiverId: chatPartner.id,
        messageText: text || null,
        mediaUrl,
        mediaType,
        caption: currentCaption || null,
      });
    }

    emitTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isDoc = file.type.startsWith('application/');

    if (!isImage && !isVideo && !isAudio && !isDoc) {
      alert('Unsupported file format');
      return;
    }

    let type = 'document';
    if (isImage) type = 'image';
    if (isVideo) type = 'video';
    if (isAudio) type = 'audio';

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview({
      file,
      url: previewUrl,
      type,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
    });
    e.target.value = '';
  };

  const removeMediaPreview = () => {
    if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    setCaptionText('');
  };

  // Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        const previewUrl = URL.createObjectURL(file);
        setMediaPreview({
          file,
          url: previewUrl,
          type: 'audio',
          name: 'Voice Note',
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };


  // Actions
  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setInputText(msg.message_text || '');
  };

  const handleDelete = (messageId) => {
    if (window.confirm('Unsend this message for everyone?')) {
      if (socket) {
        socket.emit('delete_message', { messageId, userId: user.id });
      }
    }
  };

  const handleReact = (messageId, reaction) => {
    if (socket) {
      socket.emit('react_message', { messageId, reaction, username: user.username });
    }
  };

  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderMessages = () => {
    let lastDate = '';
    return messages.map((msg, idx) => {
      const msgDate = new Date(msg.sent_at).toLocaleDateString();
      let showDateSeparator = false;
      if (msgDate !== lastDate) {
        showDateSeparator = true;
        lastDate = msgDate;
      }
      return (
        <div key={msg.id || idx}>
          {showDateSeparator && (
            <div className="date-separator">
              <div className="date-separator-line" />
              <span className="date-separator-text">{isToday(msg.sent_at) ? 'Today' : msgDate}</span>
              <div className="date-separator-line" />
            </div>
          )}
          <ChatBubble 
            message={msg} 
            currentUserId={user.id} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
            onImageClick={(url) => setLightboxImg(url)}
          />
        </div>
      );
    });
  };

  return (
    <div className="chat-container">
      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}><FiX /></button>
          <img src={lightboxImg} className="lightbox-img" alt="Fullscreen preview" />
        </div>
      )}

      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack} title="Back to Notes"><FiArrowLeft /></button>
        <div className="chat-user-avatar">{(chatPartner?.username || '?')[0].toUpperCase()}</div>
        <div className="chat-user-info">
          <div className="chat-user-name">{chatPartner?.username || 'Chat'}</div>
          <div className={`chat-user-status ${partnerOnline ? 'online' : 'offline'}`}>
            <span className={`status-dot ${partnerOnline ? 'online' : ''}`} />
            {partnerOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" onScroll={handleScroll} ref={chatScrollRef}>
        {loadingOlder && <div style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>Loading older messages...</div>}
        {renderMessages()}
        {partnerTyping && (
          <div className="typing-indicator">
            <div className="typing-dots"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
            <span>{chatPartner?.username} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview Modal / Area */}
      {mediaPreview && (
        <div className="media-upload-preview" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {mediaPreview.type === 'image' && <img src={mediaPreview.url} alt="Preview" className="media-upload-thumb" />}
            {mediaPreview.type === 'video' && <video src={mediaPreview.url} className="media-upload-thumb" />}
            {mediaPreview.type === 'audio' && <audio src={mediaPreview.url} controls style={{ height: '40px' }} />}
            {mediaPreview.type === 'document' && <div className="media-upload-thumb" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DOC</div>}
            
            <div className="media-upload-info">
              <div>{mediaPreview.name}</div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>{mediaPreview.size}</div>
            </div>
            <button className="media-upload-remove" onClick={removeMediaPreview}><FiX /></button>
          </div>
          <input 
            type="text" 
            placeholder="Add a caption..." 
            value={captionText} 
            onChange={e => setCaptionText(e.target.value)}
            style={{ marginTop: '10px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', outline: 'none' }}
          />
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        {editingMessage && (
          <div style={{ position: 'absolute', top: '-30px', left: '20px', fontSize: '12px', color: '#4F6EF7', background: 'white', padding: '2px 8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            Editing message <FiX style={{ cursor: 'pointer', marginLeft: '5px' }} onClick={() => { setEditingMessage(null); setInputText(''); }}/>
          </div>
        )}
        
        <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach file"><FiPaperclip /></button>
        <input type="file" ref={fileInputRef} className="hidden-file-input" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFileSelect} />

        {isRecording ? (
          <div className="recording-indicator">
            <span className="recording-dot" /> Recording...
          </div>
        ) : (
          <textarea
            className="chat-text-input"
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chat-message-input"
          />
        )}

        {!inputText.trim() && !mediaPreview && !editingMessage && !isRecording && (
          <button className={`chat-record-btn`} onClick={startRecording} title="Hold to record audio">
            <FiMic />
          </button>
        )}

        {isRecording && (
          <button className={`chat-record-btn recording`} onClick={stopRecording} title="Stop recording">
            <FiSquare />
          </button>
        )}

        {(inputText.trim() || mediaPreview || editingMessage) && !isRecording && (
          <button className="chat-send-btn" onClick={handleSend} title="Send"><FiSend /></button>
        )}
      </div>
    </div>
  );
}
