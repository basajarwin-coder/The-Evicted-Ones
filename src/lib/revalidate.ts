import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

export const CONTENT_TAG = 'teo-content'

/** Invalidate every cached public read (lists + detail pages) after any content write. */
export function invalidateContent() {
  try {
    revalidateTag(CONTENT_TAG, 'max')
  } catch {
    // Outside a Next request (e.g. Payload CLI seeding) there is no cache to invalidate.
  }
}

export const afterChangeRevalidate: CollectionAfterChangeHook = ({ doc }) => {
  invalidateContent()
  return doc
}
export const afterDeleteRevalidate: CollectionAfterDeleteHook = ({ doc }) => {
  invalidateContent()
  return doc
}
export const globalAfterChangeRevalidate: GlobalAfterChangeHook = ({ doc }) => {
  invalidateContent()
  return doc
}
