"use client";

import React from "react";
import { getCurrentlyReading, type ReadingState } from "@/lib/literal";
import { Film, Book, Music, Mic2 } from "lucide-react";
import Image from "next/image";
import FavoriteItem from "@/components/FavoriteItem";
import AnimatedContainer, {
  AnimatedElement,
} from "@/components/AnimatedContainer";

export default function InterestsPage() {
    const [books, setBooks] = React.useState<ReadingState[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getCurrentlyReading().then((data) => {
        setBooks(data);
        setLoading(false);
        });
    }, []);

    if (loading) {
        return (
        <section className="min-h-screen py-20 px-4 pr-0 md:pr-0 md:px-0">
            <div className="max-w-3xl mx-auto">
            <div className="text-white">Loading...</div>
            </div>
        </section>
        );
    }

    return (
        <section className="min-h-screen py-20 px-4 pr-0 md:pr-0 md:px-0">
        <AnimatedContainer className="max-w-3xl mx-auto space-y-16">
            <AnimatedElement className="space-y-8">
            <p className="text-neutral-300 leading-relaxed text-lg">
                I&apos;m passionate about technology and the things I enjoy outside
                of it. I love exploring Linux{" "}
                <span className="text-indigo-500 text-sm">(arch btw)</span>,
                experimenting with homelabs, and diving into computer networks.
                Outside of tech, I enjoy reading, watching movies, basketball, and
                skateboarding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FavoriteItem
                icon={<Film size={18} />}
                label="Favorite Movie"
                value="Knockin' on Heaven's Door"
                />
                <FavoriteItem
                icon={<Book size={18} />}
                label="Favorite Book"
                value="Hitchhiker's Guide to The Galaxy"
                />
                <FavoriteItem
                icon={<Music size={18} />}
                label="Favorite Band"
                value="Radiohead"
                />
                <FavoriteItem
                icon={<Mic2 size={18} />}
                label="Favorite Song"
                value="Lover You Should've Come Over"
                />
            </div>
            </AnimatedElement>

            <AnimatedElement className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-green-400">➜</span> Currently Reading
            </h2>

            {books.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {books.map((state, index) => (
                    <AnimatedElement key={state.book.id} className="group relative">
                    {/* Book Cover */}
                    <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                        <Image
                        src={state.book.cover}
                        alt={state.book.title}
                        fill
                        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    </div>

                    <div className="mt-3 text-center">
                        <h3 className="text-sm font-medium text-white truncate px-1">
                        {state.book.title}
                        </h3>
                        <p className="text-xs text-neutral-500">
                        {state.book.authors[0]?.name}
                        </p>
                    </div>
                    </AnimatedElement>
                ))}
                </div>
            ) : (
                <p className="text-neutral-500 italic">
                Not reading anything right now...
                </p>
            )}
            </AnimatedElement>
        </AnimatedContainer>
        </section>
    );
}
