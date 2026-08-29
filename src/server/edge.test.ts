import { describe, expect, it } from "vitest";
import { getEdgeInfo } from "@/server/edge";

function request(
  cf: Record<string, unknown> | undefined,
  headers: Record<string, string>,
): Request {
  return { cf, headers: new Headers(headers) } as unknown as Request;
}

describe("getEdgeInfo", () => {
  it("prefers the rich request.cf fields", () => {
    const info = getEdgeInfo(
      request(
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
      ),
    );

    expect(info.colo).toBe("IST");
    expect(info.city).toBe("Istanbul");
    expect(info.asn).toBe(34984);
    expect(info.tcpRttMs).toBe(21);
    expect(info.ip).toBe("84.51.1.2");
    expect(info.userAgent).toBe("UA/1.0");
  });

  it("falls back to headers when cf is absent", () => {
    const info = getEdgeInfo(
      request(undefined, {
        "cf-ray": "8f1c2d3e4f5a6b7c-FRA",
        "cf-ipcountry": "DE",
        "cf-connecting-ip": "1.2.3.4",
      }),
    );

    expect(info.colo).toBe("FRA");
    expect(info.country).toBe("DE");
    expect(info.ip).toBe("1.2.3.4");
    expect(info.city).toBeNull();
    expect(info.asn).toBeNull();
  });

  it("returns all nulls off the edge", () => {
    const info = getEdgeInfo(request(undefined, {}));
    expect(info.colo).toBeNull();
    expect(info.ip).toBeNull();
    expect(info.userAgent).toBeNull();
  });
});
