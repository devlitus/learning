import { createServerSupabaseClient } from "../lib/supabase.js";
import type { TopicCategory, Topic, UserTopic, UserTopicInsert } from "../types/database.js";

// Función para obtener todas las categorías de temas
export async function getAllTopicCategories(accessToken?: string): Promise<TopicCategory[]> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('topic_category')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching topic categories:', error);
      console.error('Error details:', error.message, error.details);
      return [];
    }
    
    console.log('Topic categories fetched successfully:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception while fetching topic categories:', err);
    return [];
  }
}

// Función para obtener todos los temas con sus categorías
export async function getAllTopicsWithCategories(accessToken?: string): Promise<(Topic & { category: TopicCategory })[]> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('topic')
      .select(`
        *,
        category:topic_category(*)
      `)
      .order('category_id')
      .order('id');
    
    if (error) {
      console.error('Error fetching topics with categories:', error);
      console.error('Error details:', error.message, error.details);
      return [];
    }
    
    console.log('Topics with categories fetched successfully:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception while fetching topics with categories:', err);
    return [];
  }
}

// Función para obtener temas agrupados por categoría (para UI)
export async function getTopicCategoriesWithTopics(accessToken?: string) {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('topic_category')
      .select(`
        *,
        topics:topic(*)
      `)
      .order('id');
    
    if (error) {
      console.error('Error fetching categories with topics:', error);
      return [];
    }
    
    console.log('Categories with topics fetched successfully:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception while fetching categories with topics:', err);
    return [];
  }
}

// Función para transformar categorías con temas de BD a formato UI
export function transformCategoryForUI(category: any) {
  return {
    id: category.category_id,
    title: category.title,
    icon: category.icon,
    description: category.description,
    topics: category.topics?.map((topic: Topic) => ({
      id: topic.topic_id,
      name: topic.name,
      description: topic.description
    })) || []
  };
}

// Función para obtener los temas seleccionados por un usuario
export async function getUserSelectedTopics(userId: string, accessToken?: string): Promise<Topic[]> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('user_topic')
      .select(`
        topic:topic(*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user selected topics:', error);
      return [];
    }
    
    return data?.map(item => item.topic).filter(Boolean) || [];
  } catch (err) {
    console.error('Exception while fetching user selected topics:', err);
    return [];
  }
}

// Función para guardar los temas seleccionados por un usuario
export async function saveUserTopicSelections(
  userId: string, 
  topicIds: string[], 
  levelId?: number,
  accessToken?: string
): Promise<boolean> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    // Primero eliminar las selecciones anteriores del usuario
    const { error: deleteError } = await supabase
      .from('user_topic')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting previous topic selections:', deleteError);
      return false;
    }
    
    // Obtener los IDs numéricos de los temas desde topic_id
    const { data: topics, error: topicsError } = await supabase
      .from('topic')
      .select('id, topic_id')
      .in('topic_id', topicIds);
    
    if (topicsError) {
      console.error('Error fetching topic IDs:', topicsError);
      return false;
    }
    
    if (!topics || topics.length === 0) {
      console.error('No topics found for the provided topic IDs');
      return false;
    }
    
    // Crear las nuevas selecciones
    const userTopics: UserTopicInsert[] = topics.map(topic => ({
      user_id: userId,
      topic_id: topic.id,
      level_id: levelId || null
    }));
    
    const { error: insertError } = await supabase
      .from('user_topic')
      .insert(userTopics);
    
    if (insertError) {
      console.error('Error inserting user topic selections:', insertError);
      return false;
    }
    
    console.log(`Successfully saved ${userTopics.length} topic selections for user ${userId}`);
    return true;
  } catch (err) {
    console.error('Exception while saving user topic selections:', err);
    return false;
  }
}

// Función para obtener un tema por su topic_id
export async function getTopicByTopicId(topicId: string, accessToken?: string): Promise<Topic | null> {
  const supabase = createServerSupabaseClient(accessToken);
  
  try {
    const { data, error } = await supabase
      .from('topic')
      .select('*')
      .eq('topic_id', topicId)
      .single();
    
    if (error) {
      console.error('Error fetching topic by topic_id:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception while fetching topic by topic_id:', err);
    return null;
  }
}
