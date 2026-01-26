"use client";

import React, { useEffect, useState } from "react";
import { TimeProps } from '@/types/components';

const Time: React.FC<TimeProps> = ({ location, shortName, className }) => {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: location,
            hour12: false,
        });
        setTime(formatter.format(now));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [location]);

    if (!time) {
        return <div className={className}>--:--:-- @ {shortName}</div>;
    }

    return (
        <div className={className}>
        {time} <span className="text-neutral-600">@ {shortName}</span>
        </div>
    );
};

export default Time;