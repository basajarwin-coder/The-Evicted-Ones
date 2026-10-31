'use client'

export default function teoImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const q = quality ?? 75
  const join = src.includes('?') ? '&' : '?'
  return `${src}${join}w=${width}&q=${q}`
}
