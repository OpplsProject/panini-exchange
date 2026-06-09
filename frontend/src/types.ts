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
}

// sticker_id -> quantity (0 = missing, 1 = have, 2+ = duplicates)
export type Collection = Record<number, number>;

export interface CompareResult {
  otherUser: { username: string };
  theyCanGiveMe: Sticker[];
  iCanGiveThem: Sticker[];
  matchCount: number;
}
