import { brand } from '../lib/brand.js'

export default function GymBrand({ compact = false }) {
  return <img className={'gym-brand' + (compact ? ' gym-brand-compact' : '')}
    src={brand.logo} alt={brand.name} width="815" height="239" />
}
