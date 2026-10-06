// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { applyBrand, brand } from './brand.js'

describe('gym branding across student preferences', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    document.head.innerHTML = '<meta name="theme-color" content="#000000">'
    document.documentElement.dataset.accent = 'lime'
  })
  it('keeps the gym identity when an existing student has a coloured accent', () => {
    applyBrand('dark')
    expect(document.documentElement.style.getPropertyValue('--acc')).toBe('#ffffff')
    expect(document.documentElement.style.getPropertyValue('--on-acc')).toBe('#141412')
    expect(document.title).toBe(brand.name)
    expect(document.querySelector('meta[name="theme-color"]').content).toBe('#141412')
  })
  it('updates button contrast and browser chrome when switching to light mode', () => {
    applyBrand('dark')
    applyBrand('light')
    expect(document.documentElement.style.getPropertyValue('--acc')).toBe('#141412')
    expect(document.documentElement.style.getPropertyValue('--on-acc')).toBe('#ffffff')
    expect(document.querySelector('meta[name="theme-color"]').content).toBe('#f4f4f1')
    expect(document.documentElement.style.getPropertyValue('--brand-logo-bg')).toBe('#141412')
  })
})
