"use client";

import { useState } from "react";
import { Copy, Download, Check, FileText, Linkedin, BookOpen, Instagram, Twitter } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { FormatOutput, ContentFormat } from "@/types";

interface FormatCardProps {
  format: FormatOutput;
}

const FORMAT_ICONS: Record<ContentFormat, React.ReactNode> = {
  newsletter: <FileText className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  blog: <BookOpen className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  twitter_summary: <Twitter className="w-5 h-5" />,
};

const FORMAT_COLORS: Record<ContentFormat, string> = {
  newsletter: "from-indigo-500 to-purple-500",
  linkedin: "from-blue-500 to-blue-600",
  blog: "from-green-500 to-emerald-500",
  instagram: "from-pink-500 to-rose-500",
  twitter_summary: "from-sky-400 to-blue-500",
};

export function FormatCard({ format }: FormatCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(format.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([format.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${format.format}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${FORMAT_COLORS[format.format]} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-white">
          {FORMAT_ICONS[format.format]}
          <span className="font-medium">{format.title}</span>
        </div>
        <div className="flex items-center gap-3 text-white/80 text-sm">
          {format.metadata?.readingTime && (
            <span>{format.metadata.readingTime}</span>
          )}
          {format.metadata?.slideCount && (
            <span>{format.metadata.slideCount} slides</span>
          )}
          {format.metadata?.tweetCount && (
            <span>{format.metadata.tweetCount} tweets</span>
          )}
          <span>{format.wordCount} words</span>
        </div>
      </div>

      {/* Metadata badges */}
      {format.metadata?.hashtags && format.metadata.hashtags.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-1">
          {format.metadata.hashtags.slice(0, 8).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {format.metadata.hashtags.length > 8 && (
            <span className="text-xs text-gray-400">+{format.metadata.hashtags.length - 8} more</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
        <ReactMarkdown>{format.content}</ReactMarkdown>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
