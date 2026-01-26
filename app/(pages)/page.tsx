"use client";

import { motion } from "framer-motion";
import { Mail, FileText, MapPin, Clock } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import ContactLink from "@/components/ContactLink";
import TechCard from "@/components/TechCard";
import Time from "@/components/Time";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.4 } },
};

export default function MePage() {
    return (
        <section className="min-h-screen w-full py-20 md:py-12 md:pl-7 pl-7 flex items-center justify-center">
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full p-8 md:p-12 rounded-sm"
        >
            <motion.div variants={fadeInUp} className="mb-12 space-y-6">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Hi, I am Görkem
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs font-mono text-neutral-500 pt-2">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-white" />
                        <span>Istanbul, Türkiye</span>
                    </div>
                    
                    <span className="hidden sm:block text-Black">|</span>
                    
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white" />
                        <Time 
                            location="Europe/Istanbul" 
                            shortName="UTC+3" 
                            className="min-w-25" 
                        />
                    </div>
                </div>
            <p className="text-sm md:text-lg leading-relaxed text-neutral-400 font-light">
                I am a computer engineering student with a strong passion for
                back-end development and web projects. Enthusiastic about
                contributing to open-source projects and continually exploring new
                technologies to deliver high-quality solutions.
            </p>
            
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-wider text-white mb-6">
                Contact
            </h2>
            <div className="flex flex-wrap gap-6">
                <ContactLink
                href="https://github.com/glory42"
                icon={<GithubIcon size={18} />}
                label="Github"
                />
                <ContactLink
                href="https://linkedin.com/in/glory42"
                icon={<LinkedinIcon size={18} />}
                label="Linkedin"
                />
                <ContactLink
                href="mailto:me@gorkemkaryol.dev"
                icon={<Mail size={18} />}
                label="Mail"
                />
                <ContactLink
                href="/Görkem_Karyol_CV.pdf"
                icon={<FileText size={18} />}
                label="CV"
                />
            </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                Tech{" "}
                <span className="h-px w-full bg-neutral-200 dark:bg-neutral-800"></span>
            </h2>

            <div className="text-base md:text-xl flex flex-col gap-4">
                <TechCard
                title="Laptop"
                spec="ASUS Zenbook UM3402YAR"
                desc="I have been using this for more than a year. It's light and useful."
                />
                <TechCard
                title="OS"
                spec="Arch Linux (btw), Hyprland"
                desc="It was a mental challenge, best decision I've made."
                />
                <TechCard
                title="Mouse"
                spec="Logitech G302"
                desc="I have been using for 4 years, it's fine for now."
                />
                <TechCard
                title="Keyboard"
                spec="Inca IKG-441 Blue Switch"
                desc="Best price performance blue-switch keyboard."
                />
            </div>
            </motion.div>
        </motion.div>
        </section>
    );
}
