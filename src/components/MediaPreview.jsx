import { FiFileText } from 'react-icons/fi';

export default function MediaPreview({ url, type, onImageClick }) {
  if (!url) return null;

  if (type === 'image') {
    return (
      <div className="message-media" onClick={onImageClick} style={{ cursor: onImageClick ? 'pointer' : 'default' }}>
        <img
          src={url}
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
          <source src={url} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className="message-media audio-player" style={{ padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
        <audio controls src={url} style={{ height: '36px', outline: 'none' }} />
      </div>
    );
  }

  if (type === 'document') {
    const filename = url.split('/').pop();
    return (
      <div className="message-media document-preview" style={{ padding: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiFileText size={24} />
        <a href={url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-all', fontSize: '13px' }}>
          {filename}
        </a>
      </div>
    );
  }

  return null;
}
