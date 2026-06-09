import type { Collection, CompareResult, Conversation, Message, Sticker, Team, User } from '../types';

const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data as T;
}

export const api = {
  register(email: string, username: string, password: string) {
    return request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  login(login: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
  },

  getStickers() {
    return request<Sticker[]>('/stickers');
  },

  getTeams() {
    return request<Team[]>('/stickers/teams');
  },

  getMyCollection() {
    return request<Collection>('/users/me/stickers');
  },

  updateSticker(stickerId: number, quantity: number) {
    return request<{ ok: boolean }>(`/users/me/stickers/${stickerId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  compareWith(username: string) {
    return request<CompareResult>(`/users/compare/${username}`);
  },

  getMyProfile() {
    return request<User>('/users/me');
  },

  updateProfile(locality: string, province: string) {
    return request<{ ok: boolean }>('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify({ locality, province }),
    });
  },

  getConversations() {
    return request<Conversation[]>('/messages');
  },

  getUnreadCount() {
    return request<{ count: number }>('/messages/unread');
  },

  getConversation(username: string) {
    return request<{ contact: User; messages: Message[] }>(`/messages/${username}`);
  },

  sendMessage(username: string, content: string) {
    return request<Message>(`/messages/${username}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  searchStickerSuggestions(q: string) {
    return request<Sticker[]>(`/search/stickers?q=${encodeURIComponent(q)}`);
  },

  searchDuplicates(stickerId: number, province?: string, locality?: string) {
    const params = new URLSearchParams({ stickerId: String(stickerId) });
    if (province) params.set('province', province);
    if (locality) params.set('locality', locality);
    return request<{ sticker: Sticker; users: { id: number; username: string; locality: string; province: string; quantity: number }[] }>(
      `/search/duplicates?${params}`
    );
  },
};
