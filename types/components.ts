import React from "react";

export interface TechCardProps {
    title: string;
    spec: string;
    desc: string;
}

export interface FavoriteItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

export interface TimeProps {
  location: string;   
  shortName: string;  
  className?: string;
}

export type BooksClientProps = Record<string, never>;

export type GitHubReposClientProps = Record<string, never>;

export interface GitHubReadmeClientProps {
    repoName: string;
}

export interface AnimatedContainerProps {
    className?: string;
    children: React.ReactNode;
}

export interface AnimatedElementProps {
    className?: string;
    children: React.ReactNode;
}
