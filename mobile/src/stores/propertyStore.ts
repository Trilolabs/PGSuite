import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { propertyApi } from '../lib/api';

interface Property {
  id: string;
  name: string;
  code: string;
  type: string;
  gender: string;
  city: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  is_active: boolean;
}

interface PropertyState {
  properties: Property[];
  selectedPropertyId: string | null;
  isLoading: boolean;
  loadProperties: () => Promise<void>;
  setSelectedProperty: (id: string) => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  selectedPropertyId: null,
  isLoading: true,

  loadProperties: async () => {
    try {
      const res = await propertyApi.list();
      const props = res.data.results || res.data || [];
      const saved = await AsyncStorage.getItem('selected_property');
      const selectedId = saved && props.find((p: Property) => p.id === saved)
        ? saved
        : props[0]?.id || null;
      set({ properties: props, selectedPropertyId: selectedId, isLoading: false });
      if (selectedId) await AsyncStorage.setItem('selected_property', selectedId);
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedProperty: (id) => {
    set({ selectedPropertyId: id });
    AsyncStorage.setItem('selected_property', id);
  },
}));
