"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  FileText,
  Download,
  Copy,
  LogOut,
  Plus,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Send,
  Sparkles,
  BarChart3,
  CreditCard,
  Link as LinkIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Stats, Thread, Affiliate } from "@/types";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [profile, setProfile] = useState<{ plan: string; credits: number } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  // Converter state
  const [threadUrl, setThreadUrl] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Affiliate modal state
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({ name: "", url: "", keywords: "" });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser({ email: user.email!, id: user.id });

      // Fetch profile
      const { data: profileData } = await supabase
        .from("users")
        .select("plan, credits")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch stats
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch threads
      const { data: threadsData } = await supabase
        .from("threads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setThreads(threadsData || []);

      // Fetch affiliates
      const { data: affiliatesData } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id);
      setAffiliates(affiliatesData || []);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleConvert = async () => {
    setConverting(true);
    setResult(null);

    // Validate URL format if using URL mode
    if (threadUrl && !showManual) {
      const validUrlPattern = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+/i;
      if (!validUrlPattern.test(threadUrl)) {
        alert("Invalid URL format. Please use a direct link to a tweet, like:\nhttps://x.com/username/status/123456789\n\nMake sure the URL contains '/status/' followed by numbers.");
        setConverting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadUrl: threadUrl || undefined,
          manualContent: manualContent || undefined,
          style: "professional",
          includeAffiliates: true,
        }),
      });

      const data = await response.json();
      if (data.success && data.newsletter) {
        setResult(data.newsletter);
        // Refresh stats and threads
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) setStats(await statsRes.json());

        const supabase = createClient();
        const { data: threadsData } = await supabase
          .from("threads")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setThreads(threadsData || []);
      } else {
        alert(data.error || "Conversion failed");
      }
    } catch {
      alert("Failed to convert thread");
    } finally {
      setConverting(false);
    }
  };

  const handleExport = async (threadId: string, platform: "beehiiv" | "substack") => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, platform }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Sent to ${platform}!`);
      } else {
        alert(data.error || "Export failed");
      }
    } catch {
      alert("Export failed");
    }
  };

  const handleAddAffiliate = async () => {
    if (!newAffiliate.name || !newAffiliate.url) return;

    const supabase = createClient();
    const { error } = await supabase.from("affiliates").insert({
      user_id: user?.id,
      name: newAffiliate.name,
      url: newAffiliate.url,
      keywords: newAffiliate.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    });

    if (!error) {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user?.id);
      setAffiliates(data || []);
      setNewAffiliate({ name: "", url: "", keywords: "" });
      setShowAffiliateForm(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">ThreadForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={profile?.plan === "free" ? "secondary" : "default"}>
              {profile?.plan === "lifetime" ? "Lifetime" : profile?.plan === "monthly" ? "Pro" : "Free"}
            </Badge>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Checkout success banner */}
      {checkoutSuccess && (
        <div className="bg-green-500 text-white py-3 text-center">
          <CheckCircle2 className="inline w-4 h-4 mr-2" />
          Payment successful! Your account has been upgraded.
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalThreads || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Threads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalExports || 0}</p>
                  <p className="text-sm text-muted-foreground">Exports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.creditsRemaining ?? 0}
                    {stats?.monthlyLimit && (
                      <span className="text-sm font-normal text-muted-foreground">/{stats.monthlyLimit}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.plan === "free" ? "Free Credits" : "Left This Month"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Converter */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Convert Thread
                </CardTitle>
                <CardDescription>
                  Paste a thread URL or enter content manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://x.com/username/status/..."
                    value={threadUrl}
                    onChange={(e) => setThreadUrl(e.target.value)}
                    disabled={showManual}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => setShowManual(!showManual)}>
                    {showManual ? "Use URL" : "Manual"}
                  </Button>
                </div>

                {!showManual && (
                  <div className="text-xs text-muted-foreground bg-slate-100 p-3 rounded-md">
                    <p className="font-medium mb-1">How to get a thread URL:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Find a thread on X (Twitter)</li>
                      <li>Click on the first tweet to open it</li>
                      <li>Copy the URL from your browser (should look like: x.com/username/status/123...)</li>
                    </ol>
                  </div>
                )}

                {showManual && (
                  <Textarea
                    placeholder="Paste your thread content..."
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                )}

                <Button
                  onClick={handleConvert}
                  disabled={converting || (!threadUrl && !manualContent)}
                  className="w-full"
                >
                  {converting ? "Converting..." : "Convert to Newsletter"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {result && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{result.title}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([result.content], { type: "text/markdown" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "newsletter.md";
                            a.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{result.content}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Threads */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Threads</CardTitle>
              </CardHeader>
              <CardContent>
                {threads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No threads converted yet. Try converting one above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{thread.title || "Untitled"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(thread.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {thread.exported_to && (
                            <Badge variant="success" className="text-xs">
                              {thread.exported_to}
                            </Badge>
                          )}
                          {profile?.plan !== "free" && !thread.exported_to && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport(thread.id, "beehiiv")}
                              >
                                Beehiiv
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport(thread.id, "substack")}
                              >
                                Substack
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {profile?.plan === "free" && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Upgrade to Pro</CardTitle>
                  <CardDescription>
                    Unlock unlimited conversions and newsletter exports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <a href="/api/checkout?plan=monthly">
                      $9/month
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/api/checkout?plan=lifetime">
                      $99 Lifetime
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Affiliates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Affiliate Links</CardTitle>
                  <CardDescription>Auto-insert in newsletters</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAffiliateForm(!showAffiliateForm)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {showAffiliateForm && (
                  <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
                    <Input
                      placeholder="Name (e.g., ConvertKit)"
                      value={newAffiliate.name}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                    />
                    <Input
                      placeholder="URL (with affiliate code)"
                      value={newAffiliate.url}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, url: e.target.value })}
                    />
                    <Input
                      placeholder="Keywords (comma-separated)"
                      value={newAffiliate.keywords}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, keywords: e.target.value })}
                    />
                    <Button size="sm" onClick={handleAddAffiliate} className="w-full">
                      Add Affiliate
                    </Button>
                  </div>
                )}

                {affiliates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No affiliates yet. Add one to auto-insert links.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {affiliates.map((aff) => (
                      <div
                        key={aff.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded"
                      >
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{aff.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {aff.keywords.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
