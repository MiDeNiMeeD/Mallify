# Mallify Chat — Shared Frontend Module

Drop-in React chat UI that talks to the `chat-service` backend via the api-gateway.
Works in both **Vite + React 19** and **CRA + React 18**. No build step.

## Source of truth + sync

`web/shared/chat/` is the canonical version. Because the host apps are CRA
(react-scripts), they cannot import code from outside `src/`. Each consuming
app gets a vendored copy at `src/chat/`. To refresh the copies after editing
the canonical module:

```bash
# Windows:
web\shared\chat\sync.cmd

# Unix-like:
bash web/shared/chat/sync.sh
```

## Install in a host app

1. From the host app folder, install `socket.io-client`:
   ```bash
   npm install socket.io-client
   ```
2. Import the styles once in the app entry (e.g. `src/main.jsx` or `src/index.js`):
   ```js
   import '../../shared/chat/styles/chat.css';
   ```
   (Path is relative — adjust to your app's depth.)
3. Wrap the part of the tree that needs chat with `<ChatProvider>`, providing how to
   resolve the current user (and optionally a user-name/avatar lookup):
   ```jsx
   import { ChatProvider, ChatLayout } from '../../shared/chat';

   const chatConfig = {
     apiBaseUrl: 'http://localhost:4000',
     getToken: () => localStorage.getItem('accessToken'),
     getCurrentUserId: () => JSON.parse(localStorage.getItem('user') || '{}')?.id,
     resolveUser: (id) => userDirectory[id],   // optional: { id, name, avatar }
   };

   export const ChatPage = () => (
     <ChatProvider config={chatConfig}>
       <div className="mc-root" style={{ height: 'calc(100vh - 80px)' }}>
         <ChatLayout />
       </div>
     </ChatProvider>
   );
   ```
4. To open a chat with a specific peer (e.g. from a "Message" button on a product
   page), pass `initialPeerId` or call the client directly:
   ```jsx
   <ChatLayout initialPeerId={boutiqueOwnerId} />
   ```

## Theming

All classes are prefixed `mc-`. Override CSS variables on `.mc-root` (or any
ancestor) to re-theme without touching the module's CSS:

```css
.mc-root {
  --mc-primary: #16a34a;
  --mc-bubble-mine: #16a34a;
  --mc-radius: 18px;
}
```

## Components

- `<ChatLayout>` — full sidebar + thread responsive shell. Drop in.
- `<ConversationList>` — sidebar only.
- `<ChatThread conversation={...}>` — thread only (use if you have a custom layout).
- Atoms: `<Avatar>`, `<MessageBubble>`, `<MessageInput>`, `<TypingIndicator>`.

## Hooks

- `useChat()` → `{ client, socket, connected, currentUserId, config }`
- `useConversations({ archived })` → list + realtime updates
- `useMessages(conversationId)` → paginated + realtime + send/edit/delete/react
- `useTyping(conversationId)` → `{ typingUsers, notifyTyping, stopTyping }`
- `usePresence([userId, ...])` → `{ [userId]: { online, lastSeen } }`

## Low-level

`ChatClient` exposes every REST endpoint, `createSocket(config)` returns a
configured socket.io client. Useful when building a custom UI.
