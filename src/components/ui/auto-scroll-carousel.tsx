"use client";

import * as React from "react";
import { useState, useRef, useMemo } from "react";

interface AutoScrollCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  idKey?: (item: T, index: number) => string;
  durationSeconds?: number;
  className?: string;
}

export function AutoScrollCarousel<T>({
  items,
  renderItem,
  idKey = (_, idx) => String(idx),
  durationSeconds = 42,
  className = "",
}: AutoScrollCarouselProps<T>) {
  const [isTouched, setIsTouched] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Drag tracking refs for touch and mouse
  const isPointerDownRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const currentDragRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Repeat items so each track is long enough to span across wide monitors
  const repeatCount = useMemo(() => {
    if (items.length === 0) return 1;
    // Aim for at least 8-10 cards per track
    return Math.max(2, Math.ceil(8 / items.length));
  }, [items.length]);

  const trackItems = useMemo(() => {
    if (items.length === 0) return [];
    const list: { item: T; key: string }[] = [];
    for (let r = 0; r < repeatCount; r++) {
      items.forEach((item, index) => {
        list.push({
          item,
          key: `${idKey(item, index)}-r${r}`,
        });
      });
    }
    return list;
  }, [items, repeatCount, idKey]);

  if (items.length === 0) return null;

  // Touch event handlers (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsTouched(true);
    pointerStartXRef.current = e.touches[0].clientX;
    currentDragRef.current = dragOffset;
    hasDraggedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - pointerStartXRef.current;
    if (Math.abs(diff) > 6) {
      hasDraggedRef.current = true;
    }
    setDragOffset(currentDragRef.current + diff);
  };

  const handleTouchEnd = () => {
    // When user lifts their hand, resume auto-scroll after a short pause
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsTouched(false);
      hasDraggedRef.current = false;
    }, 900);
  };

  // Mouse event handlers (Desktop drag exploration)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    isPointerDownRef.current = true;
    pointerStartXRef.current = e.clientX;
    currentDragRef.current = dragOffset;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return;
    const diff = e.clientX - pointerStartXRef.current;
    if (Math.abs(diff) > 6) {
      hasDraggedRef.current = true;
    }
    setDragOffset(currentDragRef.current + diff);
  };

  const handleMouseUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      hasDraggedRef.current = false;
    }, 300);
  };

  const handleMouseLeave = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      hasDraggedRef.current = false;
    }
  };

  // Prevent link clicks if user was actively dragging/swiping
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  const isPaused = isTouched || isPointerDownRef.current;

  return (
    <div
      className={`relative w-full overflow-hidden group/marquee ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClickCapture={handleClickCapture}
    >
      {/* Left and Right vignette gradients for a sleek fade look */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Interactive Drag Wrapper */}
      <div
        className="flex w-max cursor-grab active:cursor-grabbing select-none py-3"
        style={{
          transform: dragOffset !== 0 ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
          transition: !isPointerDownRef.current && !isTouched ? "transform 0.4s ease-out" : "none",
        }}
      >
        {/* Track 1 */}
        <div
          className="flex shrink-0 items-stretch gap-6 sm:gap-8 pr-6 sm:pr-8 animate-marquee-ltr group-hover/marquee:[animation-play-state:paused]"
          style={{
            animationDuration: `${durationSeconds}s`,
            animationPlayState: isPaused ? "paused" : undefined,
          }}
        >
          {trackItems.map(({ item, key }, index) => (
            <div key={`t1-${key}`} className="h-full flex flex-col shrink-0">
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {/* Track 2 (exact duplicate for seamless loop) */}
        <div
          className="flex shrink-0 items-stretch gap-6 sm:gap-8 pr-6 sm:pr-8 animate-marquee-ltr group-hover/marquee:[animation-play-state:paused]"
          style={{
            animationDuration: `${durationSeconds}s`,
            animationPlayState: isPaused ? "paused" : undefined,
          }}
          aria-hidden="true"
        >
          {trackItems.map(({ item, key }, index) => (
            <div key={`t2-${key}`} className="h-full flex flex-col shrink-0">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
