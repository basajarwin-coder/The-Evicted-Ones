import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Members } from './collections/Members'
import { Gallery } from './collections/Gallery'
import { Scrims } from './collections/Scrims'
import { Achievements } from './collections/Achievements'
import { Announcements } from './collections/Announcements'
import { Applications } from './collections/Applications'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const options = {
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { 'en': adminLanguage },
  },
  collections: [Admins, Users, Members, Gallery, Scrims, Achievements, Announcements, Applications, Media, Folders, Tags],
  globals: [SiteSettings],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
}

export default process.env.FIGMA_EID || process.env.FIGMA
  ? buildFigmaConfig({ ...options, figma: {} })
  : options
