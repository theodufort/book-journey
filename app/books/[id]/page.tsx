import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import BookDetails from '@/components/BookDetails'

export const dynamic = 'force-dynamic'

export default async function BookPage({ params: { id } }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (!book) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <BookDetails book={book} />
    </div>
  )
}
