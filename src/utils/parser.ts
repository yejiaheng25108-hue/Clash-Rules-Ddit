import yaml from 'js-yaml'
import type { ClashConfig, ClashProxy, ClashProxyGroup, ClashRule } from '../types'

let ruleIdCounter = 1

/**
 * Try to decode Base64-encoded subscription content.
 * Many subscription providers return Base64-encoded proxy lists.
 */
function tryDecodeBase64(text: string): string {
  const trimmed = text.trim()
  // Quick heuristic: if it doesn't look like YAML/JSON at all, try Base64
  if (
    !trimmed.startsWith('{') &&
    !trimmed.startsWith('port:') &&
    !trimmed.startsWith('proxies:') &&
    !trimmed.startsWith('mixed-port:') &&
    !trimmed.includes('\n') &&
    trimmed.length > 50
  ) {
    try {
      const decoded = atob(trimmed)
      // If decoded text contains common proxy protocol prefixes, it was Base64
      if (
        decoded.includes('vmess://') ||
        decoded.includes('ss://') ||
        decoded.includes('trojan://') ||
        decoded.includes('vless://')
      ) {
        return decoded
      }
    } catch {
      // Not valid Base64, return original
    }
  }
  return trimmed
}

/**
 * Parse a single rule string like "DOMAIN-SUFFIX,google.com,Proxy"
 */
function parseRuleString(raw: string): ClashRule | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  const parts = trimmed.split(',')
  if (parts.length < 2) return null

  const type = parts[0].trim()

  // MATCH rule has no target, just proxy
  if (type === 'MATCH') {
    return {
      id: ruleIdCounter++,
      type,
      target: '',
      proxy: parts[1]?.trim() || 'DIRECT',
      raw: trimmed,
    }
  }

  if (parts.length < 3) return null

  return {
    id: ruleIdCounter++,
    type,
    target: parts[1].trim(),
    proxy: parts[2].trim(),
    raw: trimmed,
  }
}

/**
 * Main parser: takes raw YAML text and returns a structured ClashConfig
 */
export function parseClashYaml(text: string): ClashConfig {
  const decoded = tryDecodeBase64(text)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let doc: any
  try {
    doc = yaml.load(decoded)
  } catch (e) {
    throw new Error(`YAML 解析失败: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('无效的 Clash 配置文件: 顶层不是对象')
  }

  // ---- Proxies ----
  const rawProxies: ClashProxy[] = Array.isArray(doc.proxies)
    ? doc.proxies.map((p: Record<string, unknown>) => ({
        name: String(p.name || ''),
        type: String(p.type || ''),
        server: String(p.server || ''),
        port: Number(p.port || 0),
        ...p,
      }))
    : []

  const proxyNames = rawProxies
    .map(p => p.name)
    .filter(n => n.length > 0)

  // ---- Proxy Groups ----
  const rawGroups: ClashProxyGroup[] = Array.isArray(doc['proxy-groups'])
    ? doc['proxy-groups'].map((g: Record<string, unknown>) => ({
        name: String(g.name || ''),
        type: String(g.type || 'select'),
        proxies: Array.isArray(g.proxies)
          ? g.proxies.map((p: unknown) => String(p))
          : [],
        ...(g.url ? { url: String(g.url) } : {}),
        ...(g.interval ? { interval: Number(g.interval) } : {}),
      }))
    : []

  const proxyGroupNames = rawGroups
    .map(g => g.name)
    .filter(n => n.length > 0)

  // ---- Rules ----
  ruleIdCounter = 1
  const rawRules: ClashRule[] = Array.isArray(doc.rules)
    ? doc.rules
        .map((r: unknown) => parseRuleString(String(r)))
        .filter((r: ClashRule | null): r is ClashRule => r !== null)
    : []

  return {
    rawText: decoded,
    proxies: rawProxies,
    proxyNames,
    proxyGroups: rawGroups,
    proxyGroupNames,
    rules: rawRules,
  }
}

/**
 * Fetch a Clash subscription URL via the Vite dev proxy
 */
export async function fetchSubscription(url: string): Promise<string> {
  const proxyUrl = `/api/sub?url=${encodeURIComponent(url)}`
  const resp = await fetch(proxyUrl)
  if (!resp.ok) {
    throw new Error(`获取订阅失败: HTTP ${resp.status}`)
  }
  return resp.text()
}
