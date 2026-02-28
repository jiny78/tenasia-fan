"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export interface IdolItem {
  id: number;
  name: string;
  photo_url?: string | null;
  type: "artist" | "group";
  href: string;
}

const PAGE_SIZE = 20;
const INTERVAL_MS = 4000;
const FADE_MS = 350;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function IdolCarousel({ items }: { items: IdolItem[] }) {
  const [visible, setVisible] = useState<IdolItem[]>([]);
  const [fading, setFading] = useState(false);
  const poolRef = useRef<IdolItem[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    poolRef.current = shuffle(items);
    indexRef.current = 0;
    setVisible(poolRef.current.slice(0, PAGE_SIZE));
  }, [items]);

  useEffect(() => {
    if (items.length <= PAGE_SIZE) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        const pool = poolRef.current;
        indexRef.current = (indexRef.current + PAGE_SIZE) % pool.length;
        const next: IdolItem[] = [];
        for (let i = 0; i < PAGE_SIZE; i++) {
          next.push(pool[(indexRef.current + i) % pool.length]);
        }
        setVisible(next);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items]);

  if (visible.length === 0) return null;

  return (
    <div
      className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    >
      {visible.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          href={item.href}
          className="group flex flex-col items-center gap-1.5"
        >
          <div className="relative w-full aspect-square rounded-full overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-200">
            {item.photo_url ? (
              <Image
                src={item.photo_url}
                alt={item.name}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 25vw, 10vw"
                unoptimized
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center text-white text-lg font-bold ${
                  item.type === "group"
                    ? "bg-gradient-to-br from-pink-500 to-orange-400"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}
              >
                {item.name.charAt(0)}
              </div>
            )}
          </div>
          <p className="truncate text-[10px] font-medium text-center w-full group-hover:text-primary transition-colors">
            {item.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
