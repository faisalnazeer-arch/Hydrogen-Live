interface AnnouncementBarProps {
  messages?: string[];
}

export function AnnouncementBar({ messages = [] }: AnnouncementBarProps) {
  if (messages.length === 0) return null;
  // Triple so the loop never shows a gap regardless of message count
  const items = [...messages, ...messages, ...messages];
  return (
    <div className="bg-crimson text-crimson-foreground overflow-hidden">
      <div className="flex py-2 text-xs sm:text-sm">
        <div className="flex animate-[announcement-scroll_25s_linear_infinite] gap-12 whitespace-nowrap font-medium tracking-wide">
          {items.map((m, i) => (
            <span key={i} className="flex-shrink-0">★ {m}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes announcement-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
