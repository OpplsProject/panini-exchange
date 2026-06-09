import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Conversation, Message, User } from '../types';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<string>(searchParams.get('with') || '');
  const [contact, setContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [startError, setStartError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getConversations().then(setConversations).finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    setLoadingMsgs(true);
    setSearchParams({ with: activeUser });
    api.getConversation(activeUser)
      .then(({ contact, messages }) => {
        setContact(contact);
        setMessages(messages);
        // Mark as read locally
        setConversations(prev => prev.map(c =>
          c.contact_username === activeUser ? { ...c, unread: 0 } : c
        ));
      })
      .catch(() => setContact(null))
      .finally(() => setLoadingMsgs(false));
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeUser) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(activeUser, newMsg.trim());
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
      // Update conversation list
      setConversations(prev => {
        const exists = prev.find(c => c.contact_username === activeUser);
        if (exists) {
          return prev.map(c => c.contact_username === activeUser
            ? { ...c, last_message: msg.content, last_at: msg.created_at, from_user_id: user!.id }
            : c
          );
        }
        return [{
          contact_id: contact!.id,
          contact_username: activeUser,
          locality: contact?.locality || '',
          province: contact?.province || '',
          last_message: msg.content,
          last_at: msg.created_at,
          from_user_id: user!.id,
          unread: 0,
        }, ...prev];
      });
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  async function startNewConversation(e: React.FormEvent) {
    e.preventDefault();
    setStartError('');
    const username = newUsername.trim().toLowerCase();
    if (!username) return;
    if (username === user?.username) {
      setStartError('No podés enviarte mensajes a vos mismo');
      return;
    }
    setActiveUser(username);
    setNewUsername('');
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  function locationText(locality?: string, province?: string) {
    if (locality && province) return `${locality}, ${province}`;
    if (locality) return locality;
    if (province) return province;
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
        <div className="flex h-full">

          {/* Sidebar — conversations */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-base mb-2">💬 Mensajes</h2>
              {/* New conversation */}
              <form onSubmit={startNewConversation} className="flex gap-1">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="Escribir a @usuario..."
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-panini-blue"
                />
                <button
                  type="submit"
                  className="bg-panini-blue text-white px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                >✎</button>
              </form>
              {startError && <p className="text-red-500 text-xs mt-1">{startError}</p>}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  <div className="text-3xl mb-2">💬</div>
                  <p>Todavía no tenés conversaciones.</p>
                  <p className="mt-1">Buscá un usuario arriba o compará colecciones para iniciar un intercambio.</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.contact_id}
                    onClick={() => setActiveUser(conv.contact_username)}
                    className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeUser === conv.contact_username ? 'bg-blue-50 border-l-4 border-l-panini-blue' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-panini-blue flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                          {conv.contact_username[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">@{conv.contact_username}</div>
                          {locationText(conv.locality, conv.province) && (
                            <div className="text-xs text-gray-400 truncate">📍 {locationText(conv.locality, conv.province)}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs text-gray-400">{formatTime(conv.last_at)}</span>
                        {conv.unread > 0 && (
                          <span className="bg-panini-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold mt-0.5">{conv.unread}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1 pl-10">{conv.last_message}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="font-medium">Seleccioná una conversación</p>
                  <p className="text-sm mt-1">o escribí el nombre de un usuario para empezar</p>
                </div>
              </div>
            ) : loadingMsgs ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-3xl animate-spin">⚽</div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-panini-blue flex items-center justify-center text-white font-bold">
                    {activeUser[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">@{activeUser}</div>
                    {contact && locationText(contact.locality, contact.province) && (
                      <div className="text-xs text-gray-500">📍 {locationText(contact.locality, contact.province)}</div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      <div className="text-3xl mb-2">👋</div>
                      <p>Empezá la conversación con @{activeUser}</p>
                    </div>
                  )}
                  {messages.map(msg => {
                    const isMine = msg.from_user_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-panini-blue text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-0.5 ${isMine ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder={`Mensaje para @${activeUser}...`}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panini-blue"
                    maxLength={500}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMsg.trim()}
                    className="bg-panini-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
