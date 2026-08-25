import { MacroNode } from '../types';

export interface MacroTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  badgeColor: string;
  tags: string[];
  nodesCount: number;
  nodes: MacroNode[];
  createdAt?: string;
}

const STORAGE_KEY = 'smart_macro_custom_templates_v3';

export const getStoredTemplates = (): MacroTemplateItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse templates from localStorage:', e);
    return [];
  }
};

export const saveStoredTemplates = (templates: MacroTemplateItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
};
