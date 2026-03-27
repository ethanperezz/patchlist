import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/nav-bar'
import { ShowLibrary } from '@/components/show-library'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile yet, create one
  if (!profile) {
    await supabase.from('users').upsert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      role: 'engineer',
    })
  }

  // Get shows the user has access to
  const { data: showUsers } = await supabase
    .from('show_users')
    .select('show_id, permission')
    .eq('user_id', user.id)

  const showIds = showUsers?.map(su => su.show_id) || []
  const permissionMap = Object.fromEntries(
    (showUsers || []).map(su => [su.show_id, su.permission])
  )

  let shows: any[] = []
  if (showIds.length > 0) {
    const { data } = await supabase
      .from('shows')
      .select('*')
      .in('id', showIds)
      .eq('is_template', false)
      .order('updated_at', { ascending: false })
    shows = (data || []).map(s => ({ ...s, permission: permissionMap[s.id] }))
  }

  return (
    <div className="min-h-screen">
      <NavBar userName={profile?.name || user.email} />
      <main className="mx-auto max-w-4xl p-4 pt-6">
        <ShowLibrary shows={shows} />
      </main>
    </div>
  )
}
