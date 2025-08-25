export interface BrandingConfig {
  /** Path to the logo image inside the public folder */
  logo: string
  /** Display name for the brand */
  name: string
}

const DEFAULT_BRANDING: BrandingConfig = {
  logo: '/sparta-brokers-logo.svg',
  name: 'Sparta Brokers',
}

const DOMAIN_BRANDING: Record<string, BrandingConfig> = {
  'localhost': DEFAULT_BRANDING,
  // Additional domains can be configured here
}

export function getBranding(hostname?: string): BrandingConfig {
  const host = hostname?.toLowerCase() || (typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '')
  return DOMAIN_BRANDING[host] || DEFAULT_BRANDING
}
