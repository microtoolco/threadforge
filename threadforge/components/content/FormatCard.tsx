"use client";

import { useState } from "react";
import { Copy, Download, Check, FileText, Linkedin, BookOpen, Instagram, Twitter, Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, ThumbsUp, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { FormatOutput, ContentFormat } from "@/types";

interface FormatCardProps {
  format: FormatOutput;
}

export function FormatCard({ format }: FormatCardProps) {
  const [copied, setCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Render format-specific preview
  const renderPreview = () => {
    switch (format.format) {
      case "linkedin":
        return <LinkedInPreview content={format.content} hashtags={format.metadata?.hashtags} />;
      case "instagram":
        return (
          <InstagramPreview
            slides={format.metadata?.slides || []}
            hashtags={format.metadata?.hashtags}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
          />
        );
      case "twitter_summary":
        return <TwitterPreview tweets={format.metadata?.tweets || []} />;
      case "blog":
        return <BlogPreview content={format.content} title={format.title} readingTime={format.metadata?.readingTime} />;
      default:
        return <NewsletterPreview content={format.content} title={format.title} readingTime={format.metadata?.readingTime} />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {renderPreview()}

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xs text-gray-500">{format.wordCount} words</span>
        <div className="flex gap-2">
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
    </div>
  );
}

// Newsletter Preview - Professional styled newsletter
function NewsletterPreview({ content, title, readingTime }: { content: string; title: string; readingTime?: string }) {
  // Extract first paragraph as intro if content is long enough
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <span className="inline-block bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
          From X Thread to Newsletter
        </span>
        <h2 className="text-white text-xl font-bold mb-1">ThreadForge</h2>
        <p className="text-white/70 text-sm">AI-powered content transformation</p>
      </div>

      {/* Newsletter Card */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {title || "Your Newsletter Title"}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                You
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">@yourhandle</p>
                <p className="text-gray-500 text-xs">
                  {readingTime || "5 min read"} · Originally posted on X
                </p>
              </div>
            </div>

            {/* Content with custom styling */}
            <article className="newsletter-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-600 leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 space-y-3 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-600 leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <div className="my-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                      <div className="text-amber-900 font-medium">{children}</div>
                    </div>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-purple-700">{children}</em>
                  ),
                  hr: () => (
                    <hr className="my-6 border-gray-200" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                This newsletter was converted from an X thread using <strong className="text-gray-700">ThreadForge</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="text-center pb-4">
        <span className="inline-block bg-white/10 text-white/80 text-xs px-4 py-2 rounded-full">
          ⚡ Powered by ThreadForge
        </span>
      </div>
    </div>
  );
}

// LinkedIn Preview - Looks like a LinkedIn post
function LinkedInPreview({ content, hashtags }: { content: string; hashtags?: string[] }) {
  return (
    <div className="bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Linkedin className="w-5 h-5" />
          <span className="font-medium">LinkedIn Post</span>
        </div>
      </div>
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* LinkedIn post header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            You
          </div>
          <div>
            <p className="font-semibold text-gray-900">Your Name</p>
            <p className="text-xs text-gray-500">Your headline • 1h • 🌐</p>
          </div>
        </div>

        {/* Post content */}
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">
          {content}
        </div>

        {/* Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-blue-600 text-sm">#{tag}</span>
            ))}
          </div>
        )}

        {/* Engagement bar */}
        <div className="border-t border-gray-200 pt-2 mt-3">
          <div className="flex justify-between text-gray-500">
            <button className="flex items-center gap-1 hover:text-blue-600 p-2 rounded hover:bg-gray-100">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600 p-2 rounded hover:bg-gray-100">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600 p-2 rounded hover:bg-gray-100">
              <Repeat2 className="w-5 h-5" />
              <span className="text-sm">Repost</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600 p-2 rounded hover:bg-gray-100">
              <Send className="w-5 h-5" />
              <span className="text-sm">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Instagram Preview - Carousel slides
function InstagramPreview({
  slides,
  hashtags,
  currentSlide,
  setCurrentSlide
}: {
  slides: Array<{ slideNumber: number; text: string; visualDirection?: string }>;
  hashtags?: string[];
  currentSlide: number;
  setCurrentSlide: (n: number) => void;
}) {
  if (!slides || slides.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500">
        No slides generated
      </div>
    );
  }

  const slide = slides[currentSlide] || slides[0];

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Instagram className="w-5 h-5" />
          <span className="font-medium">Instagram Carousel</span>
          <span className="ml-auto text-sm opacity-80">{slides.length} slides</span>
        </div>
      </div>

      {/* Instagram post frame */}
      <div className="bg-black">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 bg-white border-b">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full"></div>
          <span className="font-semibold text-sm">yourhandle</span>
          <MoreHorizontal className="w-5 h-5 ml-auto text-gray-600" />
        </div>

        {/* Slide content */}
        <div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-8 relative">
          <div className="text-center text-white">
            <p className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg">
              {slide.text}
            </p>
            {slide.visualDirection && (
              <p className="text-xs mt-4 opacity-70 italic">
                Visual tip: {slide.visualDirection}
              </p>
            )}
          </div>

          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            >
              ‹
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            >
              ›
            </button>
          )}
        </div>

        {/* Engagement bar */}
        <div className="bg-white p-3">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-gray-800 hover:text-red-500 cursor-pointer" />
              <MessageCircle className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer" />
              <Send className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer" />
            </div>
            <Bookmark className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer" />
          </div>
          <p className="text-sm font-semibold">1,234 likes</p>
        </div>
      </div>

      {/* Hashtags preview */}
      {hashtags && hashtags.length > 0 && (
        <div className="p-3 bg-gray-50 border-t max-h-24 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-1">Suggested hashtags:</p>
          <p className="text-xs text-blue-600">
            {hashtags.map(tag => `#${tag}`).join(' ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Twitter Preview - Thread of tweets
function TwitterPreview({ tweets }: { tweets: Array<{ number: number; content: string; charCount: number }> }) {
  if (!tweets || tweets.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-gray-500">
        No tweets generated
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Twitter className="w-5 h-5" />
          <span className="font-medium">Twitter Thread</span>
          <span className="ml-auto text-sm opacity-80">{tweets.length} tweets</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {tweets.map((tweet, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  You
                </div>
                {/* Thread line */}
                {index < tweets.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mx-auto mt-1"></div>
                )}
              </div>

              {/* Tweet content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-gray-900 text-sm">Your Name</span>
                  <span className="text-gray-500 text-sm">@yourhandle</span>
                  <span className="text-gray-400 text-sm">· 1m</span>
                </div>
                <p className="text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {tweet.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">{tweet.charCount}/280</p>

                {/* Engagement */}
                <div className="flex justify-between mt-3 max-w-md text-gray-500">
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">12</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500">
                    <Repeat2 className="w-4 h-4" />
                    <span className="text-xs">48</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">156</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Blog Preview - Professional blog article style
function BlogPreview({ content, title, readingTime }: { content: string; title: string; readingTime?: string }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <span className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
          SEO-Optimized Blog Post
        </span>
        <h2 className="text-white text-xl font-bold mb-1">ThreadForge</h2>
        <p className="text-white/70 text-sm">Thread to blog in seconds</p>
      </div>

      {/* Blog Card */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
              {title || "Your Blog Post Title"}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {readingTime || "5 min read"}
              </span>
              <span>•</span>
              <span>Converted from X Thread</span>
            </div>

            {/* Content */}
            <article>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-600 leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 space-y-2 list-disc list-inside">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 space-y-3 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-600 leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <div className="my-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-xl p-4">
                      <div className="text-emerald-900 italic">{children}</div>
                    </div>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  hr: () => (
                    <hr className="my-6 border-gray-200" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Ready to publish • Generated by <strong className="text-gray-700">ThreadForge</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="text-center pb-4">
        <span className="inline-block bg-white/10 text-white/80 text-xs px-4 py-2 rounded-full">
          ⚡ SEO-ready for your blog
        </span>
      </div>
    </div>
  );
}
