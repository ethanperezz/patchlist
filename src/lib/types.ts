export type UserRole = 'admin' | 'engineer'
export type Permission = 'editor' | 'viewer'
export type EventType = 'worship' | 'concert' | 'corporate' | 'other'
export type InputType = 'xlr_mic' | 'di' | 'wireless' | 'line' | 'comms'
export type MixType = 'wedge' | 'iem' | 'fx' | 'matrix'

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
}

export interface Show {
  id: string
  name: string
  venue: string | null
  show_date: string | null
  event_type: EventType | null
  created_by: string | null
  updated_at: string
  is_template: boolean
  show_notes: string | null
}

export interface ShowUser {
  show_id: string
  user_id: string
  permission: Permission
}

export interface ChannelGroup {
  id: string
  show_id: string
  name: string
  sort_order: number
}

export interface Channel {
  id: string
  show_id: string
  channel_number: number
  name: string
  stage_port: string | null
  input_type: InputType | null
  mic_model: string | null
  phantom_48v: boolean
  notes: string | null
  sort_order: number
  group_id: string | null
}

export interface Mix {
  id: string
  show_id: string
  mix_number: string
  name: string
  type: MixType | null
  system: string | null
  position: string | null
  sort_order: number
  feeds: string[] | null
}

export interface MixNote {
  id: string
  mix_id: string
  user_id: string | null
  body: string
  created_at: string
  user?: User
}

export interface Wireless {
  id: string
  show_id: string
  channel_id: string
  pack_id: string | null
  frequency: number | null
  system: string | null
  channel?: Channel
}

export interface ChangelogEntry {
  id: string
  show_id: string
  channel_id: string | null
  user_id: string | null
  field_changed: string | null
  previous_value: string | null
  new_value: string | null
  changed_at: string
  channel?: Channel
  user?: User
}

export interface ShowWithPermission extends Show {
  permission: Permission
}
