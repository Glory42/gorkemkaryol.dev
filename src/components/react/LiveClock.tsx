import { useEffect, useState } from "react";

interface Props {
  location: string;
  shortName: string;
  className?: string;
  showAt?: boolean;
  timezoneClassName?: string;
}

export default function LiveClock({
  location,
  shortName,
  className,
  showAt = true,
  timezoneClassName,
}: Props) {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const update = () => {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: location,
      });

      setTime(formatter.format(new Date()));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [location]);

  return (
    <span className={className}>
      {time}{" "}
      <span className={timezoneClassName ?? "text-[var(--text-3)]"}>
        {showAt ? `@ ${shortName}` : shortName}
      </span>
    </span>
  );
}
