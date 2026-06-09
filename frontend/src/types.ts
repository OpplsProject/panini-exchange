export interface Sticker {
  id: number;
  code: string;
  number: string;
  team: string;
  teamName: string;
  group: string;
  flag?: string;
  type: 'special' | 'badge' | 'squad' | 'player';
  name: string;
}

export interface Team {
  id: string;
  name: string;
  group: string;
  flag: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  locality?: string;
  province?: string;
}

export interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  from_username: string;
  content: string;
  read: number;
  created_at: string;
}

export interface Conversation {
  contact_id: number;
  contact_username: string;
  locality: string;
  province: string;
  last_message: string;
  last_at: string;
  from_user_id: number;
  unread: number;
}

// sticker_id -> quantity (0 = missing, 1 = have, 2+ = duplicates)
export type Collection = Record<number, number>;

export interface CompareResult {
  otherUser: { username: string; locality?: string; province?: string };
  theyCanGiveMe: Sticker[];
  iCanGiveThem: Sticker[];
  matchCount: number;
}
