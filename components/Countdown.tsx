import React, { useEffect, useRef, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownProps {
  habit: any;
  calculateNextEndDate: (habit: any) => Date;
}

const Countdown: React.FC<CountdownProps> = ({ habit, calculateNextEndDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endDate = calculateNextEndDate(habit);
      const diffInSeconds = differenceInSeconds(endDate, now);

      if (diffInSeconds <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diffInSeconds / (24 * 60 * 60));
        const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
        const seconds = diffInSeconds % 60;

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [habit, calculateNextEndDate]);

  return (
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
      <div className="flex flex-col">
        <span
          className="countdown font-mono text-5xl"
          style={{ "--value": timeLeft.days } as React.CSSProperties}
        >
          {timeLeft.days > 99
            ? timeLeft.days.toString()
            : timeLeft.days.toString().padStart(2, "0")}
        </span>
        days
      </div>
      <div className="flex flex-col">
        <span
          className="countdown font-mono text-5xl"
          style={{ "--value": timeLeft.hours } as React.CSSProperties}
        >
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        hours
      </div>
      <div className="flex flex-col">
        <span
          className="countdown font-mono text-5xl"
          style={{ "--value": timeLeft.minutes } as React.CSSProperties}
        >
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        min
      </div>
      <div className="flex flex-col">
        <span
          className="countdown font-mono text-5xl"
          style={{ "--value": timeLeft.seconds } as React.CSSProperties}
        >
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        sec
      </div>
    </div>
  );
};

export default Countdown;
