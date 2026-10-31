// Plain data shared by dashboard server and client code. No server imports here.
const gameModes = ['Search & Destroy', 'Hardpoint', 'Domination', 'Control', 'Frontline', 'Team Deathmatch', 'Battle Royale', 'Other']
const photoCategories = [
  { label: 'Member photo', value: 'member' },
  { label: 'Team photo', value: 'team' },
  { label: 'Gameplay screenshot', value: 'gameplay' },
  { label: 'Clan activity', value: 'activity' },
  { label: 'Tournament', value: 'tournament' },
  { label: 'Victory screenshot', value: 'victory' },
]

export type Option = { label: string; value: string }
export type FieldDef = {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox' | 'image' | 'lines' | 'relation' | 'multirelation'
  options?: Option[]
  required?: boolean
  hint?: string
  half?: boolean
  min?: number
}
export type EntityKey = 'members' | 'scrims' | 'achievements' | 'announcements' | 'users'
export type EntityDef = {
  slug: EntityKey
  singular: string
  plural: string
  fields: FieldDef[]
  roles: ('owner' | 'member-manager' | 'results-manager')[]
}

const opt = (...v: string[]): Option[] => v.map((x) => ({ label: x, value: x }))

export const entities: Record<EntityKey, EntityDef> = {
  members: {
    slug: 'members',
    singular: 'Member',
    plural: 'Members',
    roles: ['owner', 'member-manager'],
    fields: [
      { name: 'avatar', label: 'Profile picture', type: 'image' },
      { name: 'ign', label: 'CODM IGN', type: 'text', required: true, half: true },
      { name: 'socials.name', label: 'Real name', type: 'text', half: true, hint: 'Shown with the IGN on the site.' },
      { name: 'position', label: 'Clan title', type: 'select', required: true, half: true, hint: 'Owner / Clan Master is shown first, then Vice Clan Master.', options: [
        { label: 'Owner / Clan Master', value: 'Clan Master' },
        { label: 'Vice Clan Master', value: 'Vice Clan Master' },
        { label: 'Web Developer', value: 'Web Developer' },
        { label: 'Member', value: 'Member' },
        { label: 'Captain', value: 'Captain' },
        { label: 'IGL', value: 'IGL' },
        { label: 'Entry', value: 'Entry' },
        { label: 'Support', value: 'Support' },
        { label: 'Sniper', value: 'Sniper' },
        { label: 'Coach', value: 'Coach' },
      ] },
      { name: 'mode', label: 'Main game mode', type: 'select', required: true, half: true, options: [{ label: 'Multiplayer (MP)', value: 'MP' }, { label: 'Battle Royale (BR)', value: 'BR' }, { label: 'MP + BR', value: 'BOTH' }] },
      { name: 'socials.team', label: 'Team', type: 'select', half: true, hint: 'Shown in the Teams section.', options: [
        { label: 'Not set', value: 'NONE' },
        { label: 'Competitive roster', value: 'COMPE' },
        { label: 'Casual', value: 'CASUAL' },
        { label: 'Scrim', value: 'SCRIM' },
      ] },
      { name: 'socials.main', label: 'Main', type: 'select', half: true, hint: 'The weapon this member mainly uses.', options: [
        { label: 'Not set', value: 'NONE' },
        { label: 'SG', value: 'SG' },
        { label: 'SR', value: 'SR' },
        { label: 'AR', value: 'AR' },
        { label: 'SMG', value: 'SMG' },
      ] },
      { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
      { name: 'description', label: 'Short description', type: 'textarea', hint: 'Shown on the member card (max 220 characters).' },
      { name: 'introduction', label: 'Personal introduction', type: 'textarea' },
      { name: 'highlights', label: 'Tournament / scrim highlights', type: 'lines', hint: 'One highlight per line.' },
      { name: 'achievements', label: 'Individual achievements', type: 'lines', hint: 'One achievement per line.' },
      { name: 'socials.facebook', label: 'Facebook URL', type: 'text', half: true },
      { name: 'socials.instagram', label: 'Instagram URL', type: 'text', half: true },
      { name: 'socials.tiktok', label: 'TikTok URL', type: 'text', half: true },
      { name: 'featured', label: 'Feature on homepage', type: 'checkbox' },
    ],
  },
  scrims: {
    slug: 'scrims',
    singular: 'Match result',
    plural: 'Scrim results',
    roles: ['owner', 'results-manager'],
    fields: [
      { name: 'opponent', label: 'Opponent clan', type: 'text', required: true, half: true },
      { name: 'matchDate', label: 'Match date', type: 'date', required: true, half: true },
      { name: 'mode', label: 'Game mode', type: 'select', required: true, half: true, options: opt(...gameModes) },
      { name: 'map', label: 'Map', type: 'text', required: true, half: true },
      { name: 'matchType', label: 'Match type', type: 'select', required: true, half: true, options: [{ label: 'Scrim', value: 'scrim' }, { label: 'Tournament', value: 'tournament' }] },
      { name: 'outcome', label: 'Outcome', type: 'select', required: true, half: true, options: [{ label: 'WIN', value: 'win' }, { label: 'LOSS', value: 'loss' }, { label: 'DRAW', value: 'draw' }] },
      { name: 'teoScore', label: 'TEO score', type: 'number', required: true, half: true, min: 0 },
      { name: 'opponentScore', label: 'Opponent score', type: 'number', required: true, half: true, min: 0 },
      { name: 'screenshot', label: 'Result screenshot', type: 'image' },
      { name: 'description', label: 'Match notes (optional)', type: 'textarea' },
    ],
  },
  achievements: {
    slug: 'achievements',
    singular: 'Achievement',
    plural: 'Achievements',
    roles: ['owner'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, half: true, options: [{ label: 'Tournament placement', value: 'tournament' }, { label: 'Scrim achievement', value: 'scrim' }, { label: 'Championship win', value: 'championship' }, { label: 'Individual achievement', value: 'individual' }, { label: 'Clan milestone', value: 'milestone' }] },
      { name: 'date', label: 'Date', type: 'date', required: true, half: true },
      { name: 'member', label: 'Member (individual achievements)', type: 'relation' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },
  announcements: {
    slug: 'announcements',
    singular: 'Announcement',
    plural: 'Announcements',
    roles: ['owner'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Type', type: 'select', required: true, half: true, options: [{ label: 'Clan announcement', value: 'announcement' }, { label: 'Scrim schedule', value: 'schedule' }, { label: 'Tournament', value: 'tournament' }, { label: 'New member', value: 'new-member' }, { label: 'Clan update', value: 'update' }, { label: 'Reminder', value: 'reminder' }] },
      { name: 'publishedAt', label: 'Publication date', type: 'date', required: true, half: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'pinned', label: 'Pin to top', type: 'checkbox' },
    ],
  },
  users: {
    slug: 'users',
    singular: 'Staff account',
    plural: 'User management',
    roles: ['owner'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true },
      { name: 'role', label: 'Role', type: 'select', required: true, half: true, options: [{ label: 'Owner / Super Admin', value: 'owner' }, { label: 'Member Manager', value: 'member-manager' }, { label: 'Results Manager', value: 'results-manager' }] },
      { name: 'password', label: 'Password', type: 'password', half: true, hint: 'Min 10 characters. Leave blank when editing to keep the current one.' },
      { name: 'assignedMembers', label: 'Assigned member profiles', type: 'multirelation', hint: 'Member Managers can only edit these profiles.' },
      { name: 'active', label: 'Account active', type: 'checkbox' },
    ],
  },
}

export const categoryOptions = photoCategories
export const labelOf = (opts: Option[] | undefined, v?: string | null) => opts?.find((o) => o.value === v)?.label ?? v ?? ''
