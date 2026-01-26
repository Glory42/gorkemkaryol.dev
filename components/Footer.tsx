import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="absolute bottom-8 left-6 right-6 text-xs text-neutral-400">
            <p>Görkem Karyol</p>
            <span>
                <a
                    href="https://www.websitecarbon.com/website/gorkemkaryol-dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-accent-primary transition-all duration-200"
                >
                    This visit generated 0.01g of CO₂.
                </a>
            </span>
        </footer>
    );
}

export default Footer;
