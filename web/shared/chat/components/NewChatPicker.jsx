import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { useContacts } from '../hooks/useContacts';

const TAB_LABELS = {
  admins: 'Admins',
  managers: 'Managers',
  boutiqueOwners: 'Boutique owners',
  customers: 'Customers',
};

export const NewChatPicker = ({ onPick, onClose, title = 'Start a new chat' }) => {
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const { mode, users, buckets, loading, debug, meta } = useContacts({ q });

  const renderUserList = (list) => {
    if (!list?.length) {
      return <div className="mc-empty">No matches</div>;
    }
    return list.map((u) => (
      <button
        type="button"
        key={u.id}
        className="mc-picker-item"
        onClick={() => onPick?.(u)}
      >
        <Avatar src={u.avatar} name={u.name} id={u.id} size={36} />
        <div className="mc-picker-item-body">
          <div className="mc-picker-item-name">{u.name || u.id}</div>
          <div className="mc-picker-item-sub">{u.email || u.role || ''}</div>
        </div>
      </button>
    ));
  };

  const bucketTabs =
    mode === 'buckets' && buckets
      ? Object.keys(buckets).filter((k) => TAB_LABELS[k])
      : [];

  const effectiveTab = activeTab || bucketTabs[0] || null;

  return (
    <div className="mc-picker-backdrop" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="mc-picker">
        <div className="mc-picker-header">
          <h3>{title}</h3>
          <button type="button" className="mc-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="mc-picker-search">
          <input
            type="search"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </div>

        {mode === 'buckets' && bucketTabs.length > 0 && (
          <div className="mc-picker-tabs">
            {bucketTabs.map((key) => (
              <button
                type="button"
                key={key}
                className={`mc-picker-tab ${effectiveTab === key ? 'is-active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {TAB_LABELS[key]}
                <span className="mc-picker-tab-count">{buckets[key]?.length || 0}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mc-picker-list">
          {loading && <div className="mc-empty">Loading…</div>}
          {!loading && mode === 'search' && renderUserList(users)}
          {!loading && mode === 'buckets' && effectiveTab && renderUserList(buckets[effectiveTab])}
        </div>

        {debug && (
          <div className="mc-picker-debug">
            <strong>Debug:</strong>
            {Object.entries(debug).map(([k, v]) => (
              <div key={k}><code>{k}</code> {v}</div>
            ))}
            {meta && typeof meta.myBoutiqueCount === 'number' && (
              <div><code>boutiqueCount</code> {meta.myBoutiqueCount}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
