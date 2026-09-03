import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-text-secondary mt-1">
                Welcome back. Here is your learning progress.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-surface-secondary border border-border rounded-lg px-4 py-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-energy">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span className="font-semibold text-sm">3 Day Streak</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Progress & Modules */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Module */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Data Structures Fundamentals</CardTitle>
                  <CardDescription>Module 2 • Lists, Stacks, and Queues</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">Progress</span>
                      <span className="text-text-secondary">65%</span>
                    </div>
                    <Progress value={65} className="w-full h-2" />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <div className="text-xs font-medium text-text-muted uppercase mb-1">Current Lesson</div>
                      <div className="font-semibold text-foreground">Singly Linked Lists</div>
                    </div>
                    <div className="bg-surface-secondary border border-border p-4 rounded-lg">
                      <div className="text-xs font-medium text-text-muted uppercase mb-1">Up Next</div>
                      <div className="font-semibold text-foreground">Doubly Linked Lists</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-surface-secondary/50 border-t border-border py-4">
                  <Link href="/dashboard" className="ml-auto">
                    <Button size="sm">Resume Module</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                <Card className="border-border bg-card shadow-sm">
                  <div className="divide-y divide-border">
                    {[
                      { title: "Arrays: Two Pointers", date: "Today", status: "Completed", score: "100%" },
                      { title: "Big O Notation Quiz", date: "Yesterday", status: "Completed", score: "90%" },
                      { title: "Introduction to Arrays", date: "2 days ago", status: "Completed", score: "100%" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-secondary/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm text-foreground">{activity.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{activity.date}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-accent-green font-medium">{activity.score}</span>
                          <span className="text-text-secondary hidden sm:inline-block">{activity.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Daily Challenge & Stats */}
            <div className="space-y-8">
              
              <Card className="border-brand-500/30 bg-surface shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                <CardHeader>
                  <CardTitle className="text-brand-400 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Daily Challenge
                  </CardTitle>
                  <CardDescription className="text-foreground font-medium pt-1">Reverse a String In-Place</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    Write a function that reverses a string. The input string is given as an array of characters. Do not allocate extra space for another array.
                  </p>
                  <div className="rounded-md bg-background border border-border p-3">
                    <code className="font-mono text-xs text-foreground">
                      reverseString(s: string[])
                    </code>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-400">
                      Solve Challenge
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Quick Stats */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm uppercase text-text-muted tracking-wider">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-xs text-text-secondary">Problems Solved</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-xs text-text-secondary">Lessons Finished</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-energy">940</p>
                    <p className="text-xs text-text-secondary">XP Earned</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">Top 15%</p>
                    <p className="text-xs text-text-secondary">Rank</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
