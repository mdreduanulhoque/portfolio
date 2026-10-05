"use client";

import React from "react";

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

// Helper to render inline formatting (bold, italic, code, link)
function renderInlineFormatting(text: string): React.ReactNode {
  // Split by inline code first
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-muted text-primary text-xs font-mono font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Process links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const partsWithLinks: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        partsWithLinks.push(
          formatBoldAndItalic(part.substring(lastIndex, match.index), `${i}-${lastIndex}`)
        );
      }
      partsWithLinks.push(
        <a
          key={`${i}-link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < part.length) {
      partsWithLinks.push(formatBoldAndItalic(part.substring(lastIndex), `${i}-end`));
    }

    return <React.Fragment key={i}>{partsWithLinks}</React.Fragment>;
  });
}

function formatBoldAndItalic(text: string, keyPrefix: string): React.ReactNode {
  // Process bold **text**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);

  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${bIdx}`} className="font-bold text-foreground">
          {bPart.slice(2, -2)}
        </strong>
      );
    }

    // Process italic *text*
    const italicParts = bPart.split(/(\*[^*]+\*)/g);
    return italicParts.map((iPart, iIdx) => {
      if (iPart.startsWith("*") && iPart.endsWith("*")) {
        return (
          <em key={`${keyPrefix}-i-${bIdx}-${iIdx}`} className="italic">
            {iPart.slice(1, -1)}
          </em>
        );
      }
      return iPart;
    });
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
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-bold font-lora text-foreground mt-7 mb-3 tracking-tight">
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold font-lora text-foreground mt-6 mb-2 tracking-tight">
          {line.slice(4)}
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
      } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
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
      const imageUrl = imageMatch[2];
      elements.push(
        <figure key={`img-${i}`} className="my-6">
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/30">
            {/* Using standard img for arbitrary user-provided URLs */}
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
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-4 text-foreground/90 font-sans text-base leading-relaxed">
        {renderInlineFormatting(rawLine)}
      </p>
    );
  }

  // Flush any trailing list
  flushList(`list-end`);

  return <div className="prose-container space-y-1">{elements}</div>;
}
