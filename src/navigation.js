import { createContext, useContext } from 'react';

export const NavContext = createContext({ navigate: () => {}, goHome: () => {}, route: 'Home' });
export const useNav = () => useContext(NavContext);
