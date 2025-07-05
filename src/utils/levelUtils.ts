import { createServerSupabaseClient } from "../lib/supabase.js";
import type { Level, LevelInsert, LevelUpdate } from "../types/database.js";

// Iconos para cada nivel
const levelIcons: Record<string, string> = {
  'beginner': '🌱',
  'elementary': '📚',
  'intermediate': '🎯',
  'advanced': '🚀'
};

// Función para obtener todos los niveles
export async function getAllLevels(accessToken?: string): Promise<Level[]> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('level')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching levels:', error);
      console.error('Error details:', error.message, error.details);
      return [];
    }
    
    console.log('Levels fetched successfully:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception while fetching levels:', err);
    return [];
  }
}

// Función para obtener un nivel por ID
export async function getLevelById(id: number, accessToken?: string): Promise<Level | null> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { data, error } = await supabase
    .from('level')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching level:', error);
    return null;
  }
  
  return data;
}

// Función para asociar un nivel con un usuario
export async function assignLevelToUser(levelId: number, userId: string, accessToken?: string): Promise<boolean> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { error } = await supabase
    .from('level')
    .update({ id_user: userId })
    .eq('id', levelId);
  
  if (error) {
    console.error('Error assigning level to user:', error);
    return false;
  }
  
  return true;
}

// Función para obtener el nivel asignado a un usuario
export async function getUserLevel(userId: string, accessToken?: string): Promise<Level | null> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { data, error } = await supabase
    .from('level')
    .select('*')
    .eq('id_user', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user level:', error);
    return null;
  }
  
  return data;
}

// Función para transformar un nivel de la BD a formato de UI
export function transformLevelForUI(level: Level) {
  const levelName = level.title?.toLowerCase() || '';
  
  return {
    id: levelName,
    title: level.title || '',
    subtitle: level.sub_title || '',
    description: level.description || '',
    icon: level.icon || levelIcons[levelName] || '📖',
    features: level.feature ? level.feature.split(', ') : []
  };
}

// Función para obtener el ID de nivel por nombre
export async function getLevelIdByName(levelName: string, accessToken?: string): Promise<number | null> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { data, error } = await supabase
    .from('level')
    .select('id')
    .eq('title', levelName.charAt(0).toUpperCase() + levelName.slice(1))
    .single();
  
  if (error) {
    console.error('Error fetching level ID:', error);
    return null;
  }
  
  return data?.id || null;
}

// Función para verificar si un usuario ya tiene un nivel asignado
export async function hasUserAssignedLevel(userId: string, accessToken?: string): Promise<boolean> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { data, error } = await supabase
    .from('level')
    .select('id')
    .eq('id_user', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking user level:', error);
    return false;
  }
  
  return data !== null;
}

// Función para desasignar nivel anterior del usuario (si existe)
export async function unassignUserFromAllLevels(userId: string, accessToken?: string): Promise<boolean> {
  const supabase = createServerSupabaseClient(accessToken);
  
  const { error } = await supabase
    .from('level')
    .update({ id_user: null })
    .eq('id_user', userId);
  
  if (error) {
    console.error('Error unassigning user levels:', error);
    return false;
  }
  
  return true;
}

// Función mejorada para asignar nivel que maneja niveles anteriores
export async function assignLevelToUserSafely(levelId: number, userId: string, accessToken?: string): Promise<boolean> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    // Primero desasignar cualquier nivel anterior
    await unassignUserFromAllLevels(userId, accessToken);
    
    // Luego asignar el nuevo nivel
    const { error } = await supabase
      .from('level')
      .update({ id_user: userId })
      .eq('id', levelId);
    
    if (error) {
      console.error('Error assigning level to user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in assignLevelToUserSafely:', error);
    return false;
  }
}
