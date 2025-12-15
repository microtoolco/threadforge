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

export default function LandingPage() {
  const [threadUrl, setThreadUrl] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [newsletter, setNewsletter] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);

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
                <div className="bg-white rounded-lg p-6 max-h-[500px] overflow-y-auto border prose prose-slate max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-slate-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-slate-800">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-700">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-600">{children}</li>,
                      a: ({ href, children }) => <a href={href} className="text-primary hover:underline">{children}</a>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-slate-500 my-4">{children}</blockquote>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                    }}
                  >
                    {newsletter}
                  </ReactMarkdown>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Sign up to export directly to Beehiiv or Substack
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
              <CardTitle>One-Click Export</CardTitle>
              <CardDescription>
                Send your newsletter directly to Beehiiv or Substack with a single click via our
                Zapier integration.
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
                  Beehiiv & Substack export
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
