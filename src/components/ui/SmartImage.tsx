import { useEffect, useRef, useState } from "react";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

// Shimmer until loaded, then cross-fade; checks `img.complete` for cache hits that skip onLoad.
export function SmartImage({
  className,
  wrapperClassName,
  onLoad,
  alt,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <span
      className={`relative block overflow-hidden${wrapperClassName ? ` ${wrapperClassName}` : ""}`}
    >
      <span
        aria-hidden
        className={`image-shimmer pointer-events-none absolute inset-0 z-0 transition-opacity duration-500${loaded ? " opacity-0" : ""}`}
      />
      <img
        {...props}
        ref={ref}
        alt={alt ?? ""}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`relative z-[1] transition-opacity duration-500 ease-out${loaded ? " opacity-100" : " opacity-0"}${className ? ` ${className}` : ""}`}
      />
    </span>
  );
}
