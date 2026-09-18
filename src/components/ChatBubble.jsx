import { useState } from 'react';
import { FiCheck, FiCopy, FiEdit2, FiTrash2, FiPlay, FiFileText, FiDownload } from 'react-icons/fi';
import MediaPreview from './MediaPreview';

export default function ChatBubble({ message, currentUserId, onReact, onEdit, onDelete, onImageClick }) {
  const [showReactions, setShowReactions] = useState(false);
  const isSent = message.sender_id === currentUserId;
  const direction = isSent ? 'sent' : 'received';

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    if (!isSent) {
      onReact(message.id, '❤️');
    }
  };

  const handleDownload = async () => {
    if (!message.media_url) return;
    const url = message.media_url.startsWith('/') 
      ? `${import.meta.env.VITE_API_URL || 'https://chat.piyushassudani.in'}${message.media_url}` 
      : message.media_url;
      
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = message.media_url.split('/').pop() || 'media';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleCopy = () => {
    if (message.message_text) {
      navigator.clipboard.writeText(message.message_text);
    }
  };

  const renderStatus = () => {
    if (!isSent) return null;
    if (message.status === 'seen') {
      return <span className="message-status seen"><FiCheck /><FiCheck style={{ marginLeft: '-4px' }}/></span>;
    }
    if (message.status === 'delivered') {
      return <span className="message-status"><FiCheck /><FiCheck style={{ marginLeft: '-4px' }}/></span>;
    }
    return <span className="message-status"><FiCheck /></span>;
  };

  const renderReactions = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) return null;
    
    // Count unique reactions
    const counts = {};
    Object.values(message.reactions).forEach(r => {
      counts[r] = (counts[r] || 0) + 1;
    });

    return (
      <div className="reactions-container" onClick={() => setShowReactions(!showReactions)}>
        {Object.entries(counts).map(([emoji, count]) => (
          <span key={emoji}>{emoji}{count > 1 ? ` ${count}` : ''}</span>
        ))}
      </div>
    );
  };

  return (
    <div className={`message-row ${direction}`} onDoubleClick={handleDoubleTap}>
      <div className="message-actions">
        {message.media_url && <button className="action-btn" onClick={handleDownload} title="Download"><FiDownload /></button>}
        <button className="action-btn" onClick={handleCopy} title="Copy"><FiCopy /></button>
        {isSent && <button className="action-btn" onClick={() => onEdit(message)} title="Edit"><FiEdit2 /></button>}
        {isSent && <button className="action-btn delete" onClick={() => onDelete(message.id)} title="Unsend"><FiTrash2 /></button>}
        {!isSent && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="reaction-emoji" onClick={() => onReact(message.id, '❤️')}>❤️</span>
            <span className="reaction-emoji" onClick={() => onReact(message.id, '😂')}>😂</span>
            <span className="reaction-emoji" onClick={() => onReact(message.id, '😮')}>😮</span>
          </div>
        )}
      </div>

      <div className={`message-bubble ${direction}`}>
        {/* Media content */}
        {message.media_url && (
          <MediaPreview
            url={message.media_url}
            type={message.media_type}
            onImageClick={() => onImageClick && onImageClick(message.media_url)}
          />
        )}

        {/* Text content */}
        {message.message_text && (
          <div className="message-text">
            {message.message_text}
            {message.is_edited && <span className="edited-tag">(edited)</span>}
          </div>
        )}

        {/* Caption */}
        {message.caption && (
          <div className="message-caption">
            {message.caption}
          </div>
        )}

        <div className="message-time">
          {formatTime(message.sent_at)}
          {renderStatus()}
        </div>

        {renderReactions()}
      </div>
    </div>
  );
}
