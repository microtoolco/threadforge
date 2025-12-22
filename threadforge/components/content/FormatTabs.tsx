"use client";

import { useState } from "react";
import { FileText, Linkedin, BookOpen, Instagram, Twitter, Lock } from "lucide-react";
import type { FormatOutput, ContentFormat } from "@/types";
import { FormatCard } from "./FormatCard";

interface FormatTabsProps {
  formats: Partial<Record<ContentFormat, FormatOutput>>;
  isPro: boolean;
  onUpgrade?: () => void;
}

const FORMAT_CONFIG: Record<ContentFormat, { label: string; icon: React.ReactNode; color: string }> = {
  newsletter: {
    label: "Newsletter",
    icon: <FileText className="w-4 h-4" />,
    color: "text-indigo-600",
  },
  linkedin: {
    label: "LinkedIn",
    icon: <Linkedin className="w-4 h-4" />,
    color: "text-blue-600",
  },
  blog: {
    label: "Blog",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-green-600",
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-4 h-4" />,
    color: "text-pink-600",
  },
  twitter_summary: {
    label: "Twitter",
    icon: <Twitter className="w-4 h-4" />,
    color: "text-sky-500",
  },
};

const ALL_FORMATS: ContentFormat[] = ["newsletter", "linkedin", "blog", "instagram", "twitter_summary"];

export function FormatTabs({ formats, isPro, onUpgrade }: FormatTabsProps) {
  const [activeTab, setActiveTab] = useState<ContentFormat>("newsletter");

  const availableFormats = Object.keys(formats) as ContentFormat[];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
        {ALL_FORMATS.map((format) => {
          const config = FORMAT_CONFIG[format];
          const isAvailable = availableFormats.includes(format);
          const isActive = activeTab === format;
          const isLocked = !isPro && format !== "newsletter";

          return (
            <button
              key={format}
              onClick={() => {
                if (isLocked && onUpgrade) {
                  onUpgrade();
                } else if (isAvailable) {
                  setActiveTab(format);
                }
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive && isAvailable
                  ? `bg-gray-900 text-white`
                  : isLocked
                    ? "bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200"
                    : isAvailable
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-300"
                }
              `}
              disabled={!isAvailable && !isLocked}
            >
              <span className={isActive ? "text-white" : config.color}>
                {isLocked ? <Lock className="w-4 h-4" /> : config.icon}
              </span>
              {config.label}
              {isLocked && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">PRO</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {formats[activeTab] ? (
          <FormatCard format={formats[activeTab]!} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Upgrade to Pro for {FORMAT_CONFIG[activeTab].label}
            </h3>
            <p className="text-gray-500 mb-4">
              Get all 5 content formats from a single thread conversion.
            </p>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
