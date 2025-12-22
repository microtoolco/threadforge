"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  FileText,
  Share2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Mail,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";

// Color themes for newsletter variations
const colorThemes = [
  {
    name: "indigo",
    gradient: "from-indigo-500 via-purple-500 to-indigo-600",
    accent: "text-indigo-600",
    bullet: "bg-indigo-500",
    border: "border-indigo-400",
    bgLight: "bg-indigo-50/50",
    callout: "from-yellow-50 via-orange-50 to-pink-50 border-yellow-400",
  },
  {
    name: "ocean",
    gradient: "from-cyan-500 via-blue-500 to-teal-600",
    accent: "text-cyan-600",
    bullet: "bg-cyan-500",
    border: "border-cyan-400",
    bgLight: "bg-cyan-50/50",
    callout: "from-cyan-50 via-sky-50 to-blue-50 border-cyan-400",
  },
  {
    name: "sunset",
    gradient: "from-orange-500 via-rose-500 to-pink-600",
    accent: "text-rose-600",
    bullet: "bg-rose-500",
    border: "border-rose-400",
    bgLight: "bg-rose-50/50",
    callout: "from-orange-50 via-rose-50 to-pink-50 border-rose-400",
  },
  {
    name: "forest",
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    accent: "text-emerald-600",
    bullet: "bg-emerald-500",
    border: "border-emerald-400",
    bgLight: "bg-emerald-50/50",
    callout: "from-emerald-50 via-green-50 to-teal-50 border-emerald-400",
  },
  {
    name: "royal",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    accent: "text-violet-600",
    bullet: "bg-violet-500",
    border: "border-violet-400",
    bgLight: "bg-violet-50/50",
    callout: "from-violet-50 via-purple-50 to-fuchsia-50 border-violet-400",
  },
  {
    name: "midnight",
    gradient: "from-slate-700 via-slate-800 to-slate-900",
    accent: "text-slate-700",
    bullet: "bg-slate-600",
    border: "border-slate-400",
    bgLight: "bg-slate-50/50",
    callout: "from-slate-50 via-gray-50 to-zinc-50 border-slate-400",
  },
  {
    name: "coral",
    gradient: "from-red-400 via-orange-400 to-amber-500",
    accent: "text-orange-600",
    bullet: "bg-orange-500",
    border: "border-orange-400",
    bgLight: "bg-orange-50/50",
    callout: "from-red-50 via-orange-50 to-amber-50 border-orange-400",
  },
];

export default function LandingPage() {
  const [threadUrl, setThreadUrl] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [newsletter, setNewsletter] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(colorThemes[0]);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadUrl: threadUrl || undefined,
          manualContent: manualContent || undefined,
          style: "professional",
        }),
      });
      const data = await response.json();
      if (data.success && data.newsletter) {
        setNewsletter(data.newsletter.content);
        // Pick a random theme for each conversion
        const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
        setTheme(randomTheme);
      } else {
        setNewsletter(`Error: ${data.error || "Conversion failed"}`);
      }
    } catch {
      setNewsletter("Error: Failed to connect to server");
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newsletter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([newsletter], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">ThreadForge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="/auth/login" className="text-muted-foreground hover:text-foreground transition">
              Login
            </a>
            <Button asChild>
              <a href="/auth/signup">Get Started</a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Transform threads in seconds
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Convert X Threads to
          <br />
          <span className="text-primary">Professional Newsletters</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Paste any X thread URL, and our AI transforms it into a polished, ready-to-send newsletter
          with headings, formatting, and optional affiliate links.
        </p>

        {/* Demo Converter */}
        <Card className="max-w-3xl mx-auto text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Try it now - Free demo
            </CardTitle>
            <CardDescription>
              Paste an X thread URL or enter thread content manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://x.com/username/status/123456..."
                value={threadUrl}
                onChange={(e) => setThreadUrl(e.target.value)}
                className="flex-1"
                disabled={showManual}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManual(!showManual)}
              >
                {showManual ? "Use URL" : "Paste manually"}
              </Button>
            </div>

            {showManual && (
              <Textarea
                placeholder="Paste your thread content here...&#10;&#10;1/ First tweet of the thread...&#10;&#10;2/ Second tweet continues..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="min-h-[150px]"
              />
            )}

            <Button
              onClick={handleConvert}
              disabled={isConverting || (!threadUrl && !manualContent)}
              className="w-full"
              size="lg"
            >
              {isConverting ? (
                "Converting..."
              ) : (
                <>
                  Convert to Newsletter
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            {newsletter && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Your Newsletter</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
                {/* Beautiful Newsletter Preview with Dynamic Theme */}
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-br ${theme.gradient} px-6 py-8 text-center`}>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                      AI-Converted Newsletter
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-1">ThreadForge Output</h2>
                    <p className="text-white/80 text-sm">X Thread → Professional Newsletter in seconds</p>
                  </div>

                  {/* Newsletter Content Card */}
                  <div className={`bg-gradient-to-br ${theme.gradient.replace(/500|600|700|800|900/g, '100')} bg-opacity-10 p-4`} style={{ background: `linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))` }}>
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-h-[500px] overflow-y-auto">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 leading-tight">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className={`text-xl font-bold mt-8 mb-4 ${theme.accent}`}>{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-800">{children}</h3>
                          ),
                          p: ({ children }) => {
                            const text = String(children);
                            // Check if this is a callout (starts with emoji or special markers)
                            if (text.includes('winning right now') || text.includes('key takeaway') || text.includes('remember:') || text.includes('bottom line') || text.includes('important:')) {
                              return (
                                <div className={`my-6 p-4 rounded-lg bg-gradient-to-r ${theme.callout} border-l-4`}>
                                  <p className="text-slate-700 font-medium">{children}</p>
                                </div>
                              );
                            }
                            return <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>;
                          },
                          ul: ({ children }) => (
                            <ul className="my-4 space-y-3">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className={`w-2 h-2 ${theme.bullet} rounded-full mt-2 flex-shrink-0`}></span>
                              <span>{children}</span>
                            </li>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} className={`${theme.accent} hover:opacity-80 underline transition`}>{children}</a>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className={`my-6 pl-4 border-l-4 ${theme.border} ${theme.bgLight} py-3 pr-4 rounded-r-lg`}>
                              <p className="text-slate-600 italic">{children}</p>
                            </blockquote>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-800">{children}</strong>
                          ),
                          hr: () => (
                            <hr className="my-6 border-t border-slate-200" />
                          ),
                        }}
                      >
                        {newsletter}
                      </ReactMarkdown>

                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                          Enjoyed this newsletter? It was converted from an X thread using ThreadForge —
                          <br />transforming social content into professional newsletters in seconds.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Branding Footer */}
                  <div className={`bg-gradient-to-br ${theme.gradient} px-6 py-3 text-center`}>
                    <p className="text-white/90 text-sm flex items-center justify-center gap-1">
                      Powered by ThreadForge <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    </p>
                  </div>
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-2">Change theme:</span>
                  {colorThemes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTheme(t)}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${t.gradient} border-2 transition-all ${
                        theme.name === t.name ? "border-slate-900 scale-110" : "border-transparent hover:scale-105"
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Sign up to get all 5 content formats from every thread
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to repurpose content
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Conversion</CardTitle>
              <CardDescription>
                Our AI extracts tweets, adds proper structure, headings, and transforms them into
                flowing newsletter content.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>5 Formats, One Click</CardTitle>
              <CardDescription>
                Get Newsletter, LinkedIn, Blog, Instagram carousel & Twitter summary - all from a
                single thread conversion.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Affiliate Auto-Insert</CardTitle>
              <CardDescription>
                Add your affiliate links database. Our AI naturally incorporates relevant links
                into your newsletter content.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-slate-50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-muted-foreground text-center mb-12">
          Start free, upgrade when you need more
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Try it out</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  3 conversions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Copy/download output
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  No export integration
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <a href="/auth/signup">Get Started</a>
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="border-primary shadow-lg relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            <CardHeader>
              <CardTitle>Pro Monthly</CardTitle>
              <CardDescription>For active creators</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Unlimited conversions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  All 5 content formats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Affiliate link database
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full" asChild>
                <a href="/api/checkout?plan=monthly">Subscribe Now</a>
              </Button>
            </CardContent>
          </Card>

          {/* Lifetime Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Lifetime</CardTitle>
              <CardDescription>One-time payment</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground"> once</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  All future updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Early feature access
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <a href="/api/checkout?plan=lifetime">Get Lifetime Access</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to repurpose your content?</h2>
        <p className="text-muted-foreground mb-8">
          Join creators who save hours every week with ThreadForge
        </p>
        <Button size="lg" asChild>
          <a href="/auth/signup">
            Start Converting Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">ThreadForge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition">Privacy</a>
              <a href="#" className="hover:text-foreground transition">Terms</a>
              <a href="mailto:support@threadforge.app" className="hover:text-foreground transition flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
