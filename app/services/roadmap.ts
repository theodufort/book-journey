import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface RoadmapItem {
  id: string
  created_at: string
  title: string
  description: string
  is_approved: boolean
  tags: string[]
  votes: number
  status: 'ideas' | 'planned' | 'inProgress' | 'completed'
}

export async function fetchRoadmapItems() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('roadmap')
    .select('*')
    .order('votes', { ascending: false })

  if (error) {
    console.error('Error fetching roadmap items:', error)
    return []
  }

  return data as RoadmapItem[]
}

export async function submitIdea(idea: { title: string; description: string; tags: string[] }) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('roadmap')
    .insert([
      {
        title: idea.title,
        description: idea.description,
        tags: idea.tags,
        status: 'ideas'
      }
    ])

  if (error) {
    console.error('Error submitting idea:', error)
    throw error
  }
}

export async function updateVotes(id: string, increment: boolean) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .rpc('increment_votes', {
      row_id: id,
      increment: increment
    })

  if (error) {
    console.error('Error updating votes:', error)
    throw error
  }
}
