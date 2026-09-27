// ============================================================
// Guest Mode Context
// Manages guest/demo mode without database authentication
// ============================================================

import { createContext, useContext, useState, type ReactNode } from 'react';

interface GuestContextType {
  isGuest: boolean;
  guestUser: {
    id: string;
    email: string;
    display_name: string;
  } | null;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [guestUser, setGuestUser] = useState<GuestContextType['guestUser']>(null);

  const enterGuestMode = () => {
    setIsGuest(true);
    setGuestUser({
      id: 'guest-demo-user',
      email: 'guest@demo.local',
      display_name: 'کاربر مهمان',
    });
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    setGuestUser(null);
  };

  return (
    <GuestContext.Provider value={{ isGuest, guestUser, enterGuestMode, exitGuestMode }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
