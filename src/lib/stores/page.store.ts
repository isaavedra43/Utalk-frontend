import { writable } from 'svelte/store';

export interface PageData {
  status?: number;
  error?: any;
  url?: string;
  form?: any;
}

export const pageStore = writable<PageData>({
  status: 500,
  error: null,
  url: '',
  form: null
});

// Función para actualizar el estado de la página
export function setPageData(data: PageData) {
  pageStore.set(data);
}

// Función para actualizar la URL actual
export function setCurrentUrl(url: string) {
  pageStore.update(state => ({ ...state, url }));
}

// Función para actualizar form data
export function setFormData(form: any) {
  pageStore.update(state => ({ ...state, form }));
}
