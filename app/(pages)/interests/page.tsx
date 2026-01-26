import { Film, Book, Music, Mic2 } from "lucide-react";
import FavoriteItem from "@/components/FavoriteItem";
import AnimatedContainer, {
  AnimatedElement,
} from "@/components/AnimatedContainer";
import BooksClient from "@/components/BooksClient";

export default function InterestsPage() {
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

            <BooksClient />
            </AnimatedElement>
        </AnimatedContainer>
        </section>
    );
}
