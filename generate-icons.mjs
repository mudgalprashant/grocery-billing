#!/usr/bin/env node
/**
 * generate-icons.mjs
 *
 * Quick script to generate placeholder PWA icons using canvas.
 * Run once: node generate-icons.mjs
 * Then replace public/pwa-192x192.png and public/pwa-512x512.png
 * with your real icons before going live.
 *
 * Requires: npm install canvas (only needed once, not a project dependency)
 */

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#16a34a'
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Cart emoji approximation
  ctx.font = `${size * 0.5}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🛒', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

writeFileSync('public/pwa-192x192.png', generateIcon(192))
writeFileSync('public/pwa-512x512.png', generateIcon(512))
writeFileSync('public/apple-touch-icon.png', generateIcon(180))
console.log('✅ Icons generated in public/')
