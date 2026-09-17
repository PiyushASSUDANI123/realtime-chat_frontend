import { FiFileText } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'https://chat.piyushassudani.in';
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
};

export default function MediaPreview({ url, type, onImageClick }) {
  if (!url) return null;
  const fullUrl = getFullUrl(url);

  if (type === 'image') {
    return (
      <div className="message-media" onClick={onImageClick} style={{ cursor: onImageClick ? 'pointer' : 'default' }}>
        <img
          src={fullUrl}
          alt="Shared media"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="message-media">
        <video
          controls
          playsInline
          preload="metadata"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        >
          <source src={fullUrl} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className="message-media audio-player" style={{ padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
        <audio controls src={fullUrl} style={{ height: '36px', outline: 'none' }} />
      </div>
    );
  }

  if (type === 'document') {
    const filename = url.split('/').pop();
    return (
      <div className="message-media document-preview" style={{ padding: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiFileText size={24} color="#4F6EF7" />
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none', fontWeight: 500 }}>
          {filename}
        </a>
      </div>
    );
  }

  return null;
}
