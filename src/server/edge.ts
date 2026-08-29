// What the Cloudflare edge knows about the current request. `request.cf` carries
// the rich fields in production; a few headers are the fallback everywhere else.

export interface EdgeInfo {
  ip: string | null;
  colo: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  isp: string | null;
  asn: number | null;
  httpProtocol: string | null;
  tlsVersion: string | null;
  tlsCipher: string | null;
  tcpRttMs: number | null;
  userAgent: string | null;
}

function text(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  return null;
}

export function getEdgeInfo(request: Request): EdgeInfo {
  const cf = (request as { cf?: Record<string, unknown> }).cf ?? {};
  const h = request.headers;

  // cf-ray is "<id>-<COLO>"; the suffix names the datacenter that answered.
  const ray = h.get("cf-ray");
  const rayColo =
    ray && ray.includes("-") ? ray.slice(ray.lastIndexOf("-") + 1) : null;

  return {
    ip: h.get("cf-connecting-ip") ?? h.get("x-real-ip"),
    colo: text(cf.colo) ?? rayColo,
    country: text(cf.country) ?? h.get("cf-ipcountry"),
    city: text(cf.city),
    region: text(cf.region),
    timezone: text(cf.timezone),
    latitude: text(cf.latitude),
    longitude: text(cf.longitude),
    isp: text(cf.asOrganization),
    asn: typeof cf.asn === "number" ? cf.asn : null,
    httpProtocol: text(cf.httpProtocol),
    tlsVersion: text(cf.tlsVersion),
    tlsCipher: text(cf.tlsCipher),
    tcpRttMs: typeof cf.clientTcpRtt === "number" ? cf.clientTcpRtt : null,
    userAgent: h.get("user-agent"),
  };
}
