import { create } from "zustand";

export type NotifType = "apply" | "status" | "system";

export type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const FAKE_NOTIFS: Notif[] = [
  {
    id: "n1",
    type: "apply",
    title: "Candidature envoyée",
    body: "Ta candidature a bien été envoyée à Blumdesk Sarl.",
    time: "Aujourd’hui • 12:10",
    read: false,
  },
  {
    id: "n2",
    type: "status",
    title: "Statut mis à jour",
    body: "Bonne nouvelle : ta candidature a été acceptée par StageConnect Labs 🎉",
    time: "Hier • 18:42",
    read: false,
  },
  {
    id: "n3",
    type: "status",
    title: "Statut mis à jour",
    body: "Ta candidature chez Nova Studio a été refusée. Ne lâche rien 💪",
    time: "Il y a 5 jours",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Bienvenue sur StageConnect",
    body: "Complète ton profil pour augmenter tes chances (CV, domaine, ville).",
    time: "Il y a 1 semaine",
    read: true,
  },
];

type State = {
  items: Notif[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const computeUnread = (items: Notif[]) => items.filter((n) => !n.read).length;

export const useNotificationsStore = create<State>((set, get) => ({
  items: FAKE_NOTIFS,
  unreadCount: computeUnread(FAKE_NOTIFS),

  markAllRead: () => {
    const next = get().items.map((n) => ({ ...n, read: true }));
    set({ items: next, unreadCount: 0 });
  },

  markRead: (id: string) => {
    const next = get().items.map((n) => (n.id === id ? { ...n, read: true } : n));
    set({ items: next, unreadCount: computeUnread(next) });
  },
}));