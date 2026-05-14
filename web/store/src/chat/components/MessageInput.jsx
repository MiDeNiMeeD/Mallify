import React, { useRef, useState } from 'react';
import { formatBytes } from '../utils/format';
import { isImageMime, isVideoMime } from '../utils/preview';

export const MessageInput = ({
  onSendText,
  onSendFiles,
  onTyping,
  onStopTyping,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message…',
}) => {
  const [text, setText] = useState('');
  const [pending, setPending] = useState([]);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const submit = async () => {
    if (busy) return;
    if (pending.length) {
      setBusy(true);
      try {
        await onSendFiles?.(pending, caption);
        setPending([]);
        setCaption('');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onSendText?.(text);
      setText('');
      onStopTyping?.();
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setPending((prev) => [...prev, ...files].slice(0, 10));
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePending = (i) => {
    setPending((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mc-composer">
      {replyingTo && (
        <div className="mc-composer-reply">
          <span>Replying to: {replyingTo.content?.slice(0, 80) || 'message'}</span>
          <button type="button" onClick={onCancelReply}>×</button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mc-composer-attachments">
          {pending.map((f, i) => (
            <div key={i} className="mc-pending-att">
              {isImageMime(f.type) ? (
                <img src={URL.createObjectURL(f)} alt={f.name} />
              ) : isVideoMime(f.type) ? (
                <video src={URL.createObjectURL(f)} muted />
              ) : (
                <span className="mc-pending-file">📎 {f.name}</span>
              )}
              <span className="mc-pending-size">{formatBytes(f.size)}</span>
              <button type="button" className="mc-pending-remove" onClick={() => removePending(i)}>
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            className="mc-composer-caption"
            placeholder="Add a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      )}

      <div className="mc-composer-row">
        <button
          type="button"
          className="mc-icon-btn"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || busy}
          title="Attach"
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        <textarea
          rows={1}
          value={text}
          placeholder={placeholder}
          disabled={disabled || busy}
          onChange={(e) => {
            setText(e.target.value);
            onTyping?.();
          }}
          onBlur={() => onStopTyping?.()}
          onKeyDown={onKey}
          className="mc-composer-input"
        />
        <button
          type="button"
          className="mc-send-btn"
          onClick={submit}
          disabled={disabled || busy || (!text.trim() && !pending.length)}
        >
          {busy ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
};
