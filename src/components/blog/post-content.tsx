"use client";

import React from "react";
import { isSafeUrl, normalizeImageUrl } from "@/lib/data";

interface PostContentProps {
  content: string;
}

// Helper to extract YouTube video ID
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
}

export interface HighlightStyle {
  label: string;
  previewBadge: string;
  className: string;
}

export const HIGHLIGHT_THEME_STYLES: Record<string, HighlightStyle> = {
  theme: {
    label: "Theme Accent",
    previewBadge: "bg-primary/20 text-primary border-primary/30",
    className: "bg-primary/15 text-primary-950 dark:bg-primary/25 dark:text-primary-100 border-b border-primary/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  primary: {
    label: "Theme Accent",
    previewBadge: "bg-primary/20 text-primary border-primary/30",
    className: "bg-primary/15 text-primary-950 dark:bg-primary/25 dark:text-primary-100 border-b border-primary/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  yellow: {
    label: "Amber Yellow",
    previewBadge: "bg-amber-300 text-amber-950 border-amber-400",
    className: "bg-amber-300/40 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200 border-b border-amber-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  amber: {
    label: "Amber Yellow",
    previewBadge: "bg-amber-300 text-amber-950 border-amber-400",
    className: "bg-amber-300/40 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200 border-b border-amber-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  green: {
    label: "Emerald Green",
    previewBadge: "bg-emerald-300 text-emerald-950 border-emerald-400",
    className: "bg-emerald-300/40 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200 border-b border-emerald-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  emerald: {
    label: "Emerald Green",
    previewBadge: "bg-emerald-300 text-emerald-950 border-emerald-400",
    className: "bg-emerald-300/40 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200 border-b border-emerald-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  purple: {
    label: "Violet Purple",
    previewBadge: "bg-purple-300 text-purple-950 border-purple-400",
    className: "bg-purple-300/40 text-purple-950 dark:bg-purple-400/20 dark:text-purple-200 border-b border-purple-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  violet: {
    label: "Violet Purple",
    previewBadge: "bg-purple-300 text-purple-950 border-purple-400",
    className: "bg-purple-300/40 text-purple-950 dark:bg-purple-400/20 dark:text-purple-200 border-b border-purple-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  rose: {
    label: "Rose Coral",
    previewBadge: "bg-rose-300 text-rose-950 border-rose-400",
    className: "bg-rose-300/40 text-rose-950 dark:bg-rose-400/20 dark:text-rose-200 border-b border-rose-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  pink: {
    label: "Rose Coral",
    previewBadge: "bg-rose-300 text-rose-950 border-rose-400",
    className: "bg-rose-300/40 text-rose-950 dark:bg-rose-400/20 dark:text-rose-200 border-b border-rose-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  cyan: {
    label: "Cyan Sky",
    previewBadge: "bg-cyan-300 text-cyan-950 border-cyan-400",
    className: "bg-cyan-300/40 text-cyan-950 dark:bg-cyan-400/20 dark:text-cyan-200 border-b border-cyan-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  sky: {
    label: "Cyan Sky",
    previewBadge: "bg-cyan-300 text-cyan-950 border-cyan-400",
    className: "bg-cyan-300/40 text-cyan-950 dark:bg-cyan-400/20 dark:text-cyan-200 border-b border-cyan-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  blue: {
    label: "Ocean Blue",
    previewBadge: "bg-blue-300 text-blue-950 border-blue-400",
    className: "bg-blue-300/40 text-blue-950 dark:bg-blue-400/20 dark:text-blue-200 border-b border-blue-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  orange: {
    label: "Warm Orange",
    previewBadge: "bg-orange-300 text-orange-950 border-orange-400",
    className: "bg-orange-300/40 text-orange-950 dark:bg-orange-400/20 dark:text-orange-200 border-b border-orange-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
  red: {
    label: "Crimson Red",
    previewBadge: "bg-red-300 text-red-950 border-red-400",
    className: "bg-red-300/40 text-red-950 dark:bg-red-400/20 dark:text-red-200 border-b border-red-400/40 px-1.5 py-0.5 rounded-md font-medium box-decoration-clone inline transition-colors",
  },
};

export interface FontSizeOption {
  key: string;
  label: string;
  description: string;
  previewText: string;
  className: string;
}

export const FONT_SIZE_STYLES: Record<string, FontSizeOption> = {
  xs: {
    key: "xs",
    label: "Extra Small",
    description: "Tiny captions, tags, small print",
    previewText: "Small print (12px)",
    className: "text-xs leading-normal",
  },
  sm: {
    key: "sm",
    label: "Small",
    description: "Captions, footnotes, subtext",
    previewText: "Subtext / Footnote (14px)",
    className: "text-sm leading-normal",
  },
  small: {
    key: "sm",
    label: "Small",
    description: "Captions, footnotes, subtext",
    previewText: "Subtext / Footnote (14px)",
    className: "text-sm leading-normal",
  },
  base: {
    key: "base",
    label: "Normal",
    description: "Standard body text size",
    previewText: "Standard body (16px)",
    className: "text-base leading-relaxed",
  },
  normal: {
    key: "base",
    label: "Normal",
    description: "Standard body text size",
    previewText: "Standard body (16px)",
    className: "text-base leading-relaxed",
  },
  md: {
    key: "base",
    label: "Normal",
    description: "Standard body text size",
    previewText: "Standard body (16px)",
    className: "text-base leading-relaxed",
  },
  lg: {
    key: "lg",
    label: "Large",
    description: "Lead paragraphs, prominent statements",
    previewText: "Lead paragraph (18px)",
    className: "text-lg font-medium leading-relaxed",
  },
  large: {
    key: "lg",
    label: "Large",
    description: "Lead paragraphs, prominent statements",
    previewText: "Lead paragraph (18px)",
    className: "text-lg font-medium leading-relaxed",
  },
  xl: {
    key: "xl",
    label: "Extra Large",
    description: "Callout quotes, major emphasis",
    previewText: "Callout emphasis (20px)",
    className: "text-xl font-medium leading-snug tracking-tight",
  },
  "2xl": {
    key: "2xl",
    label: "Huge (2XL)",
    description: "Display text, section titles",
    previewText: "Display headline (24px)",
    className: "text-2xl font-bold font-lora leading-snug tracking-tight",
  },
  huge: {
    key: "2xl",
    label: "Huge (2XL)",
    description: "Display text, section titles",
    previewText: "Display headline (24px)",
    className: "text-2xl font-bold font-lora leading-snug tracking-tight",
  },
  "3xl": {
    key: "3xl",
    label: "Super Huge (3XL)",
    description: "Hero impact quote or banner",
    previewText: "Hero banner (30px)",
    className: "text-3xl sm:text-4xl font-bold font-lora leading-tight tracking-tight",
  },
};

const RICH_INLINE_REGEX =
  /(\[([^\]]+)\]\(([^)]+)\))|(\[size=([a-zA-Z0-9]+)\]([\s\S]*?)\[\/size\])|(<small>([\s\S]*?)<\/small>)|(<big>([\s\S]*?)<\/big>)|(==(?:(theme|primary|yellow|amber|green|emerald|purple|violet|rose|pink|cyan|sky|blue|orange|red):)?([^\n=]+)==)|(<mark(?: class="([^"]*)")?>([\s\S]*?)<\/mark>)|(\*\*([^*\n]+)\*\*)|(\*([^*\n]+)\*)/g;

function parseRichInline(text: string, keyPrefix: string = "root"): React.ReactNode[] {
  const regex = new RegExp(RICH_INLINE_REGEX.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const nodes: React.ReactNode[] = [];
  let itemIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${itemIndex++}`;

    if (match[1]) {
      // Link: match[2]=text, match[3]=url
      const rawHref = match[3].trim();
      if (isSafeUrl(rawHref)) {
        nodes.push(
          <a
            key={key}
            href={rawHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            {match[2]}
          </a>
        );
      } else {
        nodes.push(
          <span key={key} className="text-muted-foreground">
            {match[2]}
          </span>
        );
      }
    } else if (match[4]) {
      // Font size: match[5]=sizeKey, match[6]=content
      const sizeKey = match[5].toLowerCase();
      const styleConfig = FONT_SIZE_STYLES[sizeKey] || FONT_SIZE_STYLES.base;
      nodes.push(
        <span key={key} className={styleConfig.className}>
          {parseRichInline(match[6], `${key}-sz`)}
        </span>
      );
    } else if (match[7]) {
      // <small>
      nodes.push(
        <span key={key} className={FONT_SIZE_STYLES.sm.className}>
          {parseRichInline(match[8], `${key}-sm`)}
        </span>
      );
    } else if (match[9]) {
      // <big>
      nodes.push(
        <span key={key} className={FONT_SIZE_STYLES.lg.className}>
          {parseRichInline(match[10], `${key}-bg`)}
        </span>
      );
    } else if (match[11]) {
      // Highlight ==...== : match[12]=color, match[13]=content
      const colorKey = (match[12] || "theme").toLowerCase();
      const styleConfig = HIGHLIGHT_THEME_STYLES[colorKey] || HIGHLIGHT_THEME_STYLES.theme;
      nodes.push(
        <mark key={key} className={styleConfig.className}>
          {parseRichInline(match[13], `${key}-hl`)}
        </mark>
      );
    } else if (match[14]) {
      // Highlight <mark>: match[15]=class, match[16]=content
      const colorKey = (match[15] || "theme").toLowerCase();
      const styleConfig = HIGHLIGHT_THEME_STYLES[colorKey] || HIGHLIGHT_THEME_STYLES.theme;
      nodes.push(
        <mark key={key} className={styleConfig.className}>
          {parseRichInline(match[16], `${key}-mk`)}
        </mark>
      );
    } else if (match[17]) {
      // Bold: match[18]=content
      nodes.push(
        <strong key={key} className="font-bold text-foreground">
          {parseRichInline(match[18], `${key}-b`)}
        </strong>
      );
    } else if (match[19]) {
      // Italic: match[20]=content
      nodes.push(
        <em key={key} className="italic">
          {parseRichInline(match[20], `${key}-i`)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

export function renderInlineFormatting(text: string): React.ReactNode {
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`code-${i}`}
          className="px-1.5 py-0.5 rounded bg-muted text-primary text-xs font-mono font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={`fmt-${i}`}>{parseRichInline(part, `p-${i}`)}</React.Fragment>;
  });
}

export function PostContent({ content }: PostContentProps) {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  let inList = false;
  let listItems: string[] = [];
  let isNumberedList = false;

  let inCustomSize: string | null = null;

  const flushList = (key: string) => {
    if (!inList || listItems.length === 0) return;
    if (isNumberedList) {
      elements.push(
        <ol key={key} className="list-decimal list-inside space-y-1.5 my-4 text-foreground/90 leading-relaxed pl-2 font-sans">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1.5 my-4 text-foreground/90 leading-relaxed pl-2 font-sans">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
    }
    inList = false;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check code block fences
    if (line.startsWith("```")) {
      flushList(`list-${i}`);
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.replace("```", "").trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={`code-${i}`} className="my-6 rounded-xl overflow-hidden border border-border/60 bg-muted/50 dark:bg-slate-950">
            {codeBlockLang && (
              <div className="px-4 py-1.5 bg-muted/80 border-b border-border/40 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {codeBlockLang}
              </div>
            )}
            <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed">
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Block-level custom font size tags [size=lg] ... [/size]
    const sizeOpenMatch = line.match(/^\[size=([a-zA-Z0-9]+)\]$/i);
    if (sizeOpenMatch) {
      flushList(`list-${i}`);
      inCustomSize = sizeOpenMatch[1].toLowerCase();
      continue;
    }
    if (line === "[/size]") {
      flushList(`list-${i}`);
      inCustomSize = null;
      continue;
    }

    // Blank line
    if (!line) {
      flushList(`list-${i}`);
      continue;
    }

    // Check for lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (inList && isNumberedList) flushList(`list-${i}`);
      inList = true;
      isNumberedList = false;
      listItems.push(line.slice(2));
      continue;
    }

    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (inList && !isNumberedList) flushList(`list-${i}`);
      inList = true;
      isNumberedList = true;
      listItems.push(numberedMatch[1]);
      continue;
    }

    // If we were in a list and hit another element, flush it
    flushList(`list-${i}`);

    // Check for Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-3xl sm:text-4xl font-bold font-lora text-foreground mt-8 mb-4 tracking-tight">
          {renderInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-bold font-lora text-foreground mt-7 mb-3 tracking-tight">
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold font-lora text-foreground mt-6 mb-2 tracking-tight">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-primary pl-4 py-2 my-5 text-muted-foreground font-lora italic text-base bg-primary/5 rounded-r-lg"
        >
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (line === "---" || line === "***") {
      elements.push(
        <hr key={`hr-${i}`} className="my-8 border-border/50" />
      );
      continue;
    }

    // Custom Video Tag: @[video](url) OR standalone YouTube URL
    const videoTagMatch = line.match(/^@\[video\]\(([^)]+)\)$/);
    const ytIdFromUrl = extractYouTubeId(line);

    if (videoTagMatch || ytIdFromUrl) {
      const videoUrl = videoTagMatch ? videoTagMatch[1] : line;
      const ytId = extractYouTubeId(videoUrl);

      if (ytId) {
        elements.push(
          <div key={`video-${i}`} className="my-6">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/50 shadow-md bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title="YouTube Video Embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        );
        continue;
      } else if (isSafeUrl(videoUrl) && videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        elements.push(
          <div key={`video-${i}`} className="my-6">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-2xl border border-border/50 shadow-md"
            />
          </div>
        );
        continue;
      }
    }

    // Markdown Image: ![Caption](imageUrl)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const caption = imageMatch[1];
      const imageUrl = normalizeImageUrl(imageMatch[2].trim());
      if (isSafeUrl(imageUrl)) {
        elements.push(
          <figure key={`img-${i}`} className="my-6">
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={caption || "Post image"}
                className="w-full max-h-[550px] object-cover mx-auto"
                loading="lazy"
              />
            </div>
            {caption && (
              <figcaption className="text-center text-xs text-muted-foreground mt-2 font-mono italic">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }
      continue;
    }

    // Regular paragraph (respects active block-level font size if active)
    const activeSizeClass = inCustomSize ? (FONT_SIZE_STYLES[inCustomSize]?.className || "") : "";
    elements.push(
      <p key={`p-${i}`} className={`my-4 text-foreground/90 font-sans leading-relaxed ${activeSizeClass || "text-base"}`}>
        {renderInlineFormatting(rawLine)}
      </p>
    );
  }

  // Flush any trailing list
  flushList(`list-end`);

  return <div className="prose-container space-y-1">{elements}</div>;
}
