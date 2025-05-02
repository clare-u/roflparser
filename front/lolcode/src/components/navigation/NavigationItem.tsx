"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItemProps {
  href: string;
  icon?: string;
  children: React.ReactNode;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  href,
  icon,
  children,
}) => {
  const pathname = usePathname();
  // 정확히 일치하거나 href가 '/'가 아닐 때만 활성화
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex h-[80px] items-center justify-center gap-[10px] whitespace-nowrap px-[20px] py-[26px] text-16 text-white ${
        isActive ? "font-extrabold" : ""
      } hover:bg-indigo-900`}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </Link>
  );
};

export default NavigationItem;
