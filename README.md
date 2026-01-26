![Portfolio Screenshot](public/preview/previewImage.png)

# [gorkemkaryol.dev](https://www.gorkemkaryol.dev/)

Welcome to the repository of my personal portfolio website. This project is a modern, minimalist digital garden built with **Next.js 16**, designed to showcase my projects, experience, and interests with a terminal-inspired aesthetic.


# ⚡ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Markdown:** `react-markdown` + `github-markdown-css` (for project README rendering)


## 🗺️ Routes & Features

- **`/` (Home)**: Introduction and "About Me" terminal.
- **`/projects`**:
  - Dynamically fetches my pinned/featured repositories from GitHub via GraphQL.
  - **`/projects/[slug]`**: Renders the actual `README.md` of any project directly on the site, styled exactly like GitHub.
- **`/experience`**: A "Git Commit" style vertical timeline of my work history.
- **`/interests`**:
  - Fetches my "Currently Reading" shelf in real-time from [Literal.club](https://literal.club).
  - Lists favorite media (Movies, Music, etc.).
- **`/cool`**: An interactive "Do Not Touch" button mini-game (Easter Egg).

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm or yarn

### Installation
```bash
$ git clone https://github.com/Glory42/ma-portfolio.git
$ cd ma-portfolio
$ npm install
$ npm run dev
```

Navigate to `http://localhost:4321` to see the development server in action.

### Environment Variables

Create a `.env` or `.env.local` file in the root of your project and add variables if you use any APIs or secrets (e.g., Github, Spotify, Literal, etc.):

```bash
# GitHub Configuration (for fetching repos & READMEs)
GITHUB_TOKEN=your_personal_access_token_here
NEXT_PUBLIC_GITHUB_USERNAME=Glory42

# Literal Club Configuration (for fetching books)
# Note: Literal requires email/password login to generate a temporary token
LITERAL_EMAIL=your_email@example.com
LITERAL_PASSWORD=your_literal_password
```

## Architecture
- Server-Side Fetching: Data fetching (GitHub Repos, READMEs, Book lists) happens inside Async Server Components, ensuring fast initial loads and better SEO.

- Client-Side Interactivity: Framer Motion animations and the "Cool" button game are handled by isolated Client Components (use client).

- Markdown Rendering: Project pages pull raw Markdown from GitHub and render it using react-markdown with GFM (GitHub Flavored Markdown) support, ensuring tables, code blocks, and images render correctly.
 

## License

This project is licensed under the **GNU General Public License v3.0** – see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, feel free to reach out to me at `me@gorkemkaryol.dev`.