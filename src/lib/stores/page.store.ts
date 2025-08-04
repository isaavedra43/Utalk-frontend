import type { PageFormData } from '$lib/types/auth';
import { writable } from 'svelte/store';

export interface PageData {
  status?: number;
  error?: unknown;
  url?: string;
  form?: PageFormData | null;
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
export function setFormData(form: PageFormData | null) {
  pageStore.update(state => ({ ...state, form }));
}
