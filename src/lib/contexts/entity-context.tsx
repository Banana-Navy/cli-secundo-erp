"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Entity, UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface EntityContextValue {
  /** Currently selected entity, or null for "Global" view */
  activeEntity: Entity | null;
  /** Set the active entity (null = global) */
  setActiveEntity: (entity: Entity | null) => void;
  /** All entities accessible to the user */
  entities: Entity[];
  /** Current user profile */
  profile: UserProfile | null;
  /** Whether context is loading */
  loading: boolean;
}

export const EntityContext = createContext<EntityContextValue>({
  activeEntity: null,
  setActiveEntity: () => {},
  entities: [],
  profile: null,
  loading: true,
});

const STORAGE_KEY = "erp-secundo-active-entity";

interface EntityProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function EntityProvider({ children, userId }: EntityProviderProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeEntity, setActiveEntityState] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Fetch user's accessible entities via join
      const { data: accessData } = await supabase
        .from("user_entity_access")
        .select("entity_id, entities(*)")
        .eq("user_id", userId);

      const userEntities: Entity[] = (accessData ?? [])
        .map((a) => a.entities as unknown as Entity)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      setEntities(userEntities);
      setProfile(
        profileData
          ? { ...profileData, entities: userEntities } as UserProfile
          : null
      );

      // Restore last selected entity from localStorage
      const savedCode = localStorage.getItem(STORAGE_KEY);
      if (savedCode) {
        const found = userEntities.find((e) => e.code === savedCode);
        if (found) {
          setActiveEntityState(found);
        }
      }

      setLoading(false);
    }

    load();
  }, [userId]);

  const setActiveEntity = useCallback(
    (entity: Entity | null) => {
      setActiveEntityState(entity);
      if (entity) {
        localStorage.setItem(STORAGE_KEY, entity.code);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      activeEntity,
      setActiveEntity,
      entities,
      profile,
      loading,
    }),
    [activeEntity, setActiveEntity, entities, profile, loading]
  );

  return (
    <EntityContext.Provider value={value}>{children}</EntityContext.Provider>
  );
}
