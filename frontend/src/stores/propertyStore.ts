import { create } from 'zustand';

interface Property {
    id: string;
    name: string;
    code: string;
    type: string;
    gender: string;
    total_rooms: number;
    total_beds: number;
    occupied_beds: number;
}

interface PropertyState {
    properties: Property[];
    selectedPropertyId: string | null;
    setProperties: (properties: Property[]) => void;
    setSelectedProperty: (id: string) => void;
    selectedProperty: () => Property | undefined;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
    properties: [],
    selectedPropertyId: localStorage.getItem('selected_property'),

    setProperties: (properties) => {
        set({ properties });
        if (!get().selectedPropertyId && properties.length > 0) {
            const id = properties[0].id;
            set({ selectedPropertyId: id });
            localStorage.setItem('selected_property', id);
        }
    },

    setSelectedProperty: (id) => {
        set({ selectedPropertyId: id });
        localStorage.setItem('selected_property', id);
    },

    selectedProperty: () => {
        const { properties, selectedPropertyId } = get();
        return properties.find((p) => p.id === selectedPropertyId);
    },
}));
