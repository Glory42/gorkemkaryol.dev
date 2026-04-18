import type { FeaturedRepository } from "@/types/github";

// Set to false to re-enable live GitHub fetching in projects/index.astro
export const USE_STATIC_PROJECTS = true;

export const staticProjects: FeaturedRepository[] = [
  {
    name: "WasteWise",
    description: "Smart waste management system using IoT sensors and MQTT messaging.",
    url: "https://github.com/Glory42/wastewise",
    stargazerCount: 0,
    topics: ["IoT", "MongoDB", "MQTT"],
    primaryLanguage: null,
    updatedAt: "",
  },
  {
    name: "Tatlas",
    description: "Restaurant review platform built with Node.js and Express.",
    url: "https://github.com/Glory42/tatlas",
    stargazerCount: 0,
    topics: ["Node.js", "Express", "MongoDB"],
    primaryLanguage: null,
    updatedAt: "",
  },
];
