import { describe, expect, it } from "vitest";
import { getEdgeInfo } from "@/server/edge/edge";
import { sourceCtx } from "@/server/common/source";
import type { RuntimeEnv } from "@/lib/env";

const ENV = {} as RuntimeEnv;

function request(
  cf: Record<string, unknown> | undefined,
  headers: Record<string, string>,
): Request {
  return { cf, headers: new Headers(headers) } as unknown as Request;
}

function info(cf: Record<string, unknown> | undefined, headers: Record<string, string>) {
  const result = getEdgeInfo(ENV, sourceCtx({ request: request(cf, headers) }));
  if (!result.ok) throw new Error("expected ok");
  return result.data;
}

describe("getEdgeInfo", () => {
  it("prefers the rich request.cf fields", () => {
    const edge = info(
      {
        colo: "IST",
        country: "TR",
        city: "Istanbul",
        timezone: "Europe/Istanbul",
        asOrganization: "Tellcom",
        asn: 34984,
        httpProtocol: "HTTP/3",
        tlsVersion: "TLSv1.3",
        clientTcpRtt: 21,
      },
      { "cf-connecting-ip": "84.51.1.2", "user-agent": "UA/1.0" },
    );

    expect(edge.colo).toBe("IST");
    expect(edge.city).toBe("Istanbul");
    expect(edge.asn).toBe(34984);
    expect(edge.tcpRttMs).toBe(21);
    expect(edge.ip).toBe("84.51.1.2");
    expect(edge.userAgent).toBe("UA/1.0");
  });

  it("falls back to headers when cf is absent", () => {
    const edge = info(undefined, {
      "cf-ray": "8f1c2d3e4f5a6b7c-FRA",
      "cf-ipcountry": "DE",
      "cf-connecting-ip": "1.2.3.4",
    });

    expect(edge.colo).toBe("FRA");
    expect(edge.country).toBe("DE");
    expect(edge.ip).toBe("1.2.3.4");
    expect(edge.city).toBeNull();
    expect(edge.asn).toBeNull();
  });

  it("returns all nulls with no request", () => {
    const result = getEdgeInfo(ENV, sourceCtx());
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.colo).toBeNull();
    expect(result.data.ip).toBeNull();
    expect(result.data.userAgent).toBeNull();
  });
});
