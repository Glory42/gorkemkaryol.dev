import { useEffect, useRef, useState } from "react";

interface Props {
  className?: string;
  words?: string[];
}

const DEFAULT_WORDS = [
  "linux enjoyer",
  "web developer",
  "jedi master",
  "muad'dib",
];

export function RotatingPrompt({ className, words = DEFAULT_WORDS }: Props) {
  const phrases = words.length > 0 ? words : DEFAULT_WORDS;

  // `words` is usually an inline literal (new ref each render). Read it via a ref
  // so the timer effect doesn't restart on every parent re-render.
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrasesRef.current[wordIndex] ?? "";

    let delay = isDeleting ? 55 : 90;
    if (!isDeleting && charIndex === current.length) delay = 1300;
    if (isDeleting && charIndex === 0) delay = 350;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setCharIndex((prev) => prev + 1);
          return;
        }
        setIsDeleting(true);
        return;
      }

      if (charIndex > 0) {
        setCharIndex((prev) => prev - 1);
        return;
      }

      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % phrasesRef.current.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  const visible = (phrases[wordIndex] ?? "").slice(0, charIndex);

  return <span className={className}>{visible}</span>;
}
