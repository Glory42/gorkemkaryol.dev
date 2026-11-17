export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
export const INTERIS_BASE = "https://interis.gorkemkaryol.dev";

export interface BandItem {
  name: string;
  image: string;
  url?: string;
}

export const interestsIntro =
  "This page captures the things I keep coming back to. Books, films, and series shape how I think, while basketball and skateboarding keep me moving. Recently, I’ve been building habits around the gym and playing guitar. Slow progress, but consistent.";

export const favoriteBands: BandItem[] = [
  {
    name: "Radiohead",
    image: "/radiohead.webp",
    url: "https://radiohead.com/",
  },
  {
    name: "Deftones",
    image: "/deftones.webp",
    url: "https://www.deftones.com/",
  },
];
