# Gathin

Event and community management platform built at [Lodos](https://lodos.io). One
place for the whole job - discovery, public event pages, ticketing and payments,
and a full organizer panel - instead of stitching five separate tools together.

**[gathin.com →](https://gathin.com)**

![Gathin landing](/projects/gathin/landing-page.png)

## What I built

On the frontend team since April 2026 - ~150 commits across 22 PRs, spanning the
attendee site and the organizer panel.

- Rebuilt the **profile and community pages** around a shared events timeline, and
  merged the split Participant/Organizer views into one members modal.
- Redesigned the **event gallery** into a Google-Photos-style grid, and the
  **blog** around a featured post with card polish.
- Shipped a **direct-message** flow between attendees and event organizers.
- Built **client-side ticket poster sharing** (three skins, three sizes) and an
  **avatar hover-card** used across the app.
- Added **event schedule** support, **community sponsor management**, **speaker
  drag-and-drop ordering**, and **Excel export** for ticket holders to the panel.
- Wired **language preference** to persist through the backend; fixed a Places API
  race in the location picker and a cursor-reset bug in the rich-text editor.

## Attendee side

A discovery feed of every upcoming event across the platform, filtered by date
and type, with a map view. Public event pages are server-rendered and built to
convert: hero image, venue and capacity, RSVP and ticket flows, speakers,
sponsors, and a gallery. Every community gets its own branded page with events
flowing inline, and every member a public profile.

![Discovery feed](/projects/gathin/discover.png)

![Public event page](/projects/gathin/event-page.png)

## Organizer panel

Members and segments, events, ticketing, bulk email, payments, gallery, and
settings in a single panel built around how organizers actually work - no
jumping between apps.

![Organizer panel overview](/projects/gathin/panel.png)

- **Ticketing & payments** - ticket tiers with quota, price, sale window, and
  refund rules; the public page updates instantly, and paid tickets flow into
  the community's balance.
- **Door check-in** - every ticket carries a QR; the participant list updates
  live as people arrive, with a printable door QR.
- **Speakers & schedule** - build the lineup with photos, bios, and
  drag-and-drop ordering; lay out the day session by session with rooms and
  time slots.
- **Forms** - custom registration, application, and feedback forms attached to
  an event, collecting structured responses without a third-party tool.
- **Certificates** - design a certificate in a visual editor with a
  verification QR; every credential gets a public verification page.
- **Sponsorships** - add backing companies with logos and links, grouped into
  tiers.

![Community analytics](/projects/gathin/analytics.png)

## Stack

Next.js 15 (App Router, self-hosted SSR on Dokploy), React 19, TypeScript in
strict mode, Leaflet for maps, Axios for HTTP. Tested with Vitest (unit, hook,
service, and component layers) and Playwright (visual regression). Ships in six
languages.
