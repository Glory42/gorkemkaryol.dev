import React from 'react';
import Link from 'next/link';
import { getFeaturedRepos } from '@/lib/github';
import { GitHubCalendar } from 'react-github-calendar';
import { Star } from 'lucide-react';

import AnimatedContainer, { AnimatedElement } from '@/components/AnimatedContainer'; 

export default async function ProjectsPage() {
    const repos = await getFeaturedRepos();
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "your_username";

    return (
        <section className="min-h-screen py-20 space-y-16">
        
        <AnimatedElement className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">/contributions</h1>
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm overflow-hidden">
                <GitHubCalendar 
                    username={username} 
                    colorScheme="dark"
                    fontSize={12}
                    blockSize={12}
                    theme={{
                    dark: ['#161b22', '#2f363d', '#444c56', '#a3a3a3', '#ffffff'],
                    }}
                />
            </div>
        </AnimatedElement>

        <div className="space-y-6">
            <AnimatedElement>
                <h2 className="text-2xl font-bold tracking-tight text-white">/featured_projects</h2>
            </AnimatedElement>
            

            <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {repos.map((repo: any) => (
                
                <AnimatedElement key={repo.name}>
                    <Link 
                    href={`/projects/${repo.name}`}
                    className="group block p-6 h-full rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-white/50 transition-all duration-300"
                    >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-mono font-semibold text-white group-hover:underline decoration-1 underline-offset-4">
                        {repo.name}
                        </h3>
                        <div className="flex items-center gap-1 text-neutral-400">
                            <Star size={14} />
                            <span className="text-xs">{repo.stargazerCount}</span>
                        </div>
                    </div>

                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                        {repo.description}
                    </p>

                    
                    </Link>
                </AnimatedElement>
            ))}
            </AnimatedContainer>
        </div>

        </section>
    );
}