/**
 * src/styles/colors.js
 *
 * Single source of truth for the platform's color tokens, for the rare
 * cases where a component needs an inline style instead of a Tailwind
 * class (e.g. dynamic chart colors, canvas/SVG fills, third-party
 * components that don't accept className). Keep these values in sync
 * with tailwind.config.js and globals.css.
 */

export const COLORS = {
  brand: '#1D4ED8',
  brandDark: '#1E3A8A',
  brandLight: '#DBEAFE',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  surface: '#FFFFFF',
  background: '#F0F4F8',
  border: '#CBD5E1',
};

export default COLORS;
