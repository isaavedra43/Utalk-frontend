import { writable } from 'svelte/store';

interface SidebarState {
  collapsed: boolean;
  width: number;
}

const initialState: SidebarState = {
  collapsed: false,
  width: 240
};

export const sidebarStore = writable<SidebarState>(initialState);

export const toggleSidebar = () => {
  sidebarStore.update(state => {
    const newCollapsed = !state.collapsed;
    return {
      collapsed: newCollapsed,
      width: newCollapsed ? 80 : 240
    };
  });
};

export const setSidebarCollapsed = (collapsed: boolean) => {
  sidebarStore.update(state => ({
    collapsed,
    width: collapsed ? 80 : 240
  }));
};

export const setSidebarWidth = (width: number) => {
  sidebarStore.update(state => ({
    ...state,
    width
  }));
};
