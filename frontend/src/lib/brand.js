import brand from '../../brand.json'

export { brand }

// Branding belongs to this gym's deployment, not to the student's synced preferences.
export function applyBrand(theme) {
  const root = document.documentElement
  const palette = brand.themes[theme] || brand.themes.dark
  root.dataset.gym = brand.id
  for (const [key, value] of Object.entries({
    '--bg': palette.background, '--bg-el': palette.background,
    '--surface': palette.surface, '--acc': palette.accent,
    '--acc-2': palette.accentSecondary, '--on-acc': palette.onAccent,
    '--brand-logo-bg': brand.logoBackground,
  })) root.style.setProperty(key, value)
  document.title = brand.name
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = palette.background
}
