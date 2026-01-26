import React from 'react';
import { getRepoReadme } from '@/lib/github';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm'; 
import rehypeRaw from 'rehype-raw'; 
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/icons';
import Template from '@/components/Template';
import 'github-markdown-css/github-markdown-dark.css'; 
import 'highlight.js/styles/github-dark.css';

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ProjectDetail({ params }: Props) {
    const { slug } = await params;
    const markdown = await getRepoReadme(slug);
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "your_username";
    const repoUrl = `https://github.com/${username}/${slug}`;

    if (!markdown) return <div className="text-center py-20 text-neutral-500">Not Found</div>;

    return (
        <article className="min-h-screen py-20 md:py-20 px-4 pr-0 ">
        
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
            <Link 
                href="/projects"
                className="inline-flex items-center gap-2 text-white md:text-neutral-400 hover:text-white transition-colors font-mono text-sm group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                cd ..
            </Link>

            <a 
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-all hover:border-neutral-700"
            >
                <GithubIcon size={16} /> 
                <span>View on GitHub</span>
            </a>
        </div>

        <div className="w-full max-w-4xl mx-auto">
            <div className="markdown-body" style={{ backgroundColor: 'transparent' }}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                urlTransform={(value) => {
                if (value.startsWith('http')) return value;
                const cleanPath = value.replace(/^\.?\//, '');
                return `https://raw.githubusercontent.com/${username}/${slug}/main/${cleanPath}`;
                }}
            >
                {markdown}
            </ReactMarkdown>
            </div>
        </div>
        </article>
    );
}