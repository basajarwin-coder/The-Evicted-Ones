import sharp from 'sharp'
import type { Payload } from 'payload'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const TYPES: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
}

function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString() === 'GIF8') return 'image/gif'
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'image/webp'
  return null
}

export function isUploadedFile(v: FormDataEntryValue | null): v is File {
  return typeof v === 'object' && v !== null && 'arrayBuffer' in v && (v as File).size > 0
}

/** Validate size, extension, declared type and magic bytes. Throws a user-readable error. */
export async function validateImage(file: File) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`"${file.name}" is larger than 8 MB.`)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const buf = Buffer.from(await file.arrayBuffer())
  const real = sniff(buf)
  if (!real || !TYPES[real].includes(ext) || (file.type && file.type !== real)) {
    throw new Error(`"${file.name}" is not a valid JPG, PNG, WebP or GIF image.`)
  }
  return { buf, mimetype: real }
}

/** Center-crop every upload to a square so member and gallery frames stay even. */
export async function squareImage(buf: Buffer) {
  const image = sharp(buf, { animated: false }).rotate()
  const meta = await image.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (!width || !height) throw new Error('Could not read that picture.')
  const side = Math.min(width, height)
  const squared = image.extract({
    left: Math.floor((width - side) / 2),
    top: Math.floor((height - side) / 2),
    width: side,
    height: side,
  })
  const sized = side > 1200 ? squared.resize(1200, 1200) : squared
  const data = await sized.jpeg({ quality: 86 }).toBuffer()
  return { data, mimetype: 'image/jpeg' as const }
}

export async function uploadImage(payload: Payload, user: any, file: File, alt: string): Promise<string> {
  const { buf } = await validateImage(file)
  const square = await squareImage(buf)
  const media = await payload.create({
    collection: 'media',
    data: { alt: alt.slice(0, 160) || 'TEO upload' },
    file: { data: square.data, mimetype: square.mimetype, name: `${Date.now()}.jpg`, size: square.data.length },
    user,
    overrideAccess: false,
  })
  return String(media.id)
}

export async function deleteMedia(payload: Payload, id?: string | { id: string } | null) {
  const mid = typeof id === 'object' && id ? id.id : id
  if (!mid) return
  await payload.delete({ collection: 'media', id: mid, overrideAccess: true }).catch(() => {})
}
