import { useEffect, useMemo, useState } from "react";

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

export default function RotatingPrompt({
  className,
  words = DEFAULT_WORDS,
}: Props) {
  const phrases = useMemo(
    () => (words.length > 0 ? words : DEFAULT_WORDS),
    [words],
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[wordIndex] ?? "";

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
      setWordIndex((prev) => (prev + 1) % phrases.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, phrases]);

  const visible = (phrases[wordIndex] ?? "").slice(0, charIndex);

  return (
    <>
      <span className={className}>{visible}</span>
    </>
  );
}
