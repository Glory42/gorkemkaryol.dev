# Gathin

Event and community management platform built at [Lodos](https://lodos.io). One
place for the whole job - public event pages, community pages, ticketing and
payments, and a full organizer panel - instead of stitching five separate tools
together.

**[gathin.com →](https://gathin.com)**

![Gathin landing](/projects/gathin/landing-page.webp)

## What I built

On the frontend team since April 2026: 70 merged PRs and 300+ commits across
the attendee site, the organizer panel, and the design system under both.

**Community features**

- **Community Wall**: Twitter-style posts on the real backend, with share links
  that scroll to the post.
- **Wall Studio**: polls with live results, announcements and posts
  in the community's own name, replies from the panel, and a wall overview with
  turnout, activity and vote-over-time charts.
- **Community Environments**: a permanent join-order list of every community,
  with hide/unhide controls for admins.
- **Sponsors**: community sponsor management with drag-to-reorder, tier frames,
  an active/archived split, and three event display styles (Marquee, Spotlight,
  Tiered Grid).
- Redesigned the **communities directory**, the **community page** sidebar, and
  the **announcements** admin and its public sidebar.

**Events and tickets**

- **Support events** ("Destek ol"): fundraising pages with animated tiers and a
  goal bar, plus admin for refunds, notes, export, mail, and a supports ledger.
  Shipped behind a runtime flag.
- Made **Events the homepage** and retired Discover. Added a sticky day
  timeline, Registered/Saved filters, a full-bleed hero, and a marketing landing
  for signed-out visitors.
- **Ticket poster sharing**: posters drawn client-side in three skins and three
  sizes, plus share images personalised with who's going.
- **Event schedules** (create, edit, and a stacked day-grouped view), **speaker
  drag-and-drop ordering**, and a **Google-Photos-style gallery**.
- Hardened **checkout**: real names, foreign billing, retries, form answers per
  ticket, and an order that survives browser back and a reload.

**Messaging and profiles**

- **Direct messages** between attendees and organizers over Socket.IO: an inbox
  page, live notifications, unread badges, read receipts, and event context
  cards.
- Rebuilt **profile and community pages** around a shared events timeline, with
  a badge wall, a certificate grid, a **profile QR code**, and **avatar hover
  cards** across every list.

**Organizer panel**

- Reworked the **Revenue page**: tabs, commission and payout notes, and a
  45-day countdown.
- Moved every delete onto **one shared confirmation dialog** that shows what is
  being removed, with name retyping for events and communities.
- Unsaved-edit guards on every way out of a panel page, **Excel export** for
  ticket holders, and a check-in scanner that works at every screen width.

**Design system and quality**

- Built the **design tokens** (spacing, radius, z-index, colour), then moved
  every text size in the app onto **one type scale** with named roles and a
  guard test.
- Made server-rendered images show before hydration, with no flash on cached
  ones, and cut duplicate event-list fetches.
- A long run of **phone and tablet fixes**, dark-theme contrast fixes, and
  hundreds of unit tests and Storybook page stories, written up in ADRs and
  help-centre articles.
- Persisted **language preference** through the backend; fixed a Places API
  race and a rich-text cursor-reset bug.

## Attendee side

An events feed of everything upcoming across the platform, grouped by day, with
the most popular communities alongside. Public event pages are server-rendered
and built to convert: cover, dates and venue, organizers, ticket flows, a
schedule, speakers, sponsors, and comments.

![Events feed](/projects/gathin/events.webp)

![Public event page](/projects/gathin/event-page.webp)

Every community gets its own branded page - events, a community wall,
organizers, and sponsor tiers - and a place in the communities directory.

![Community page](/projects/gathin/community.webp)

![Communities directory](/projects/gathin/communities.webp)

## Organizer panel

One panel for running a community, so organizers don't have to switch between
apps.

- **Community** - members and segments, sponsors, certificates, a links page,
  and moderation for the community wall.
- **Events** - tickets and waitlists, participants and QR check-in, schedule,
  speakers, sponsorships, forms and surveys, and the gallery.
- **Communication** - bulk mail with reusable templates, and an inbox for
  attendee messages.
- **Performance** - revenue and payouts, event and community analytics, and
  visitor analytics.

## Stack

Next.js 15 (App Router, self-hosted SSR on Dokploy), React 19, TypeScript in
strict mode, Leaflet for maps, Axios for HTTP. Tested with Vitest (unit, hook,
service, and component layers), Storybook against a mock backend, and Playwright
(visual regression). Ships in six languages.
