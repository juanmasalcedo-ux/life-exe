'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Today' },
  { href: '/stats', label: 'Stats' },
  { href: '/habits', label: 'Habits' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-default flex z-50 max-w-lg mx-auto">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex items-center justify-center text-[15px] font-medium transition-colors ${
              active ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
