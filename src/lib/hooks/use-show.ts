'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Show, Channel, ChannelGroup, Mix, MixNote, Wireless, ChangelogEntry, Permission } from '@/lib/types'

export function useShow(showId: string) {
  const supabase = createClient()
  const [show, setShow] = useState<Show | null>(null)
  const [permission, setPermission] = useState<Permission>('viewer')
  const [channels, setChannels] = useState<Channel[]>([])
  const [groups, setGroups] = useState<ChannelGroup[]>([])
  const [mixes, setMixes] = useState<Mix[]>([])
  const [mixNotes, setMixNotes] = useState<MixNote[]>([])
  const [wirelessEntries, setWirelessEntries] = useState<Wireless[]>([])
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const isEditor = permission === 'editor'

  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      showRes,
      permRes,
      channelsRes,
      groupsRes,
      mixesRes,
      wirelessRes,
      changelogRes,
    ] = await Promise.all([
      supabase.from('shows').select('*').eq('id', showId).single(),
      supabase.from('show_users').select('permission').eq('show_id', showId).eq('user_id', user.id).single(),
      supabase.from('channels').select('*').eq('show_id', showId).order('sort_order'),
      supabase.from('channel_groups').select('*').eq('show_id', showId).order('sort_order'),
      supabase.from('mixes').select('*').eq('show_id', showId).order('sort_order'),
      supabase.from('wireless').select('*, channel:channels(*)').eq('show_id', showId),
      supabase.from('changelog').select('*, channel:channels(id, name), user:users(id, name)').eq('show_id', showId).order('changed_at', { ascending: false }).limit(100),
    ])

    if (showRes.data) setShow(showRes.data)
    if (permRes.data) setPermission(permRes.data.permission as Permission)
    if (channelsRes.data) setChannels(channelsRes.data)
    if (groupsRes.data) setGroups(groupsRes.data)
    if (mixesRes.data) {
      setMixes(mixesRes.data)
      // Fetch mix notes for all mixes
      const mixIds = mixesRes.data.map(m => m.id)
      if (mixIds.length > 0) {
        const { data: notes } = await supabase
          .from('mix_notes')
          .select('*, user:users(id, name)')
          .in('mix_id', mixIds)
          .order('created_at', { ascending: false })
        if (notes) setMixNotes(notes)
      }
    }
    if (wirelessRes.data) setWirelessEntries(wirelessRes.data)
    if (changelogRes.data) setChangelog(changelogRes.data)

    setLoading(false)
  }, [showId, supabase])

  // Initial fetch
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Realtime subscriptions
  useEffect(() => {
    const channelSub = supabase
      .channel(`show-${showId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels', filter: `show_id=eq.${showId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChannels(prev => {
            // Deduplicate — optimistic add may have already placed this
            if (prev.some(ch => ch.id === (payload.new as Channel).id)) return prev
            return [...prev, payload.new as Channel].sort((a, b) => a.sort_order - b.sort_order)
          })
        } else if (payload.eventType === 'UPDATE') {
          setChannels(prev => prev.map(ch => ch.id === payload.new.id ? payload.new as Channel : ch))
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => prev.filter(ch => ch.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mixes', filter: `show_id=eq.${showId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMixes(prev => {
            if (prev.some(m => m.id === (payload.new as Mix).id)) return prev
            return [...prev, payload.new as Mix].sort((a, b) => a.sort_order - b.sort_order)
          })
        } else if (payload.eventType === 'UPDATE') {
          setMixes(prev => prev.map(m => m.id === payload.new.id ? payload.new as Mix : m))
        } else if (payload.eventType === 'DELETE') {
          setMixes(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mix_notes' }, (payload) => {
        const note = payload.new as MixNote
        // Check if this note is for a mix in our show
        const isMixInShow = mixes.some(m => m.id === note.mix_id)
        if (isMixInShow) {
          setMixNotes(prev => [note, ...prev])
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'changelog', filter: `show_id=eq.${showId}` }, (payload) => {
        setChangelog(prev => [payload.new as ChangelogEntry, ...prev].slice(0, 100))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channelSub)
    }
  }, [showId, supabase, mixes])

  return {
    show,
    permission,
    isEditor,
    channels,
    groups,
    mixes,
    mixNotes,
    wirelessEntries,
    changelog,
    loading,
    refetch: fetchAll,
    setChannels,
    setMixes,
  }
}
