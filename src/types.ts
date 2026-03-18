// ---- Clash Config Types ----

/** A single proxy node from the `proxies` array */
export interface ClashProxy {
  name: string
  type: string
  server: string
  port: number
  [key: string]: unknown // other provider-specific fields
}

/** A proxy group from the `proxy-groups` array */
export interface ClashProxyGroup {
  name: string
  type: 'select' | 'url-test' | 'fallback' | 'load-balance' | string
  proxies: string[]
  url?: string
  interval?: number
  [key: string]: unknown
}

/** A parsed rule (from `rules` array, format: "TYPE,target,proxy") */
export interface ClashRule {
  id: number
  type: string
  target: string
  proxy: string
  raw: string // original string
  isCustom?: boolean // Flag for user handwritten rules
}

/** Full parsed Clash config */
export interface ClashConfig {
  /** Raw YAML text */
  rawText: string
  /** Proxy node list */
  proxies: ClashProxy[]
  /** Proxy node names (convenience) */
  proxyNames: string[]
  /** Proxy groups */
  proxyGroups: ClashProxyGroup[]
  /** Proxy group names (convenience) */
  proxyGroupNames: string[]
  /** Parsed rules */
  rules: ClashRule[]
}
