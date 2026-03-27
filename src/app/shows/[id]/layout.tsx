import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { NavBar } from '@/components/nav-bar'
import { RoleTabBar } from '@/components/patch/RoleTabBar'
import { ShowHeader } from '@/components/patch/ShowHeader'

export const dynamic = 'force-dynamic'

export default async function ShowLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: show } = await supabase
    .from('shows')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!show) notFound()

  const { data: showUser } = await supabase
    .from('show_users')
    .select('permission')
    .eq('show_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!showUser) notFound()

  const isEditor = showUser.permission === 'editor'

  return (
    <div className="min-h-screen">
      <NavBar userName={profile?.name || user.email} />
      <ShowHeader show={show} />
      <RoleTabBar showId={params.id} isEditor={isEditor} />
      <main className="mx-auto max-w-7xl p-4">
        {children}
      </main>
    </div>
  )
}
