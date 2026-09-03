import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-16 flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-8 flex-1">
            
            {/* Col 1: Vertical Sidebar Menu */}
            <aside className="hidden lg:flex flex-col gap-1 pr-4 border-r border-border h-full">
              <Link href="/dashboard" className="px-4 py-2 bg-surface-secondary text-brand-400 font-medium text-sm border-l-2 border-brand-400">
                Overview
              </Link>
              <Link href="#" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 font-medium text-sm transition-colors">
                Curriculum
              </Link>
              <Link href="#" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 font-medium text-sm transition-colors">
                Practice
              </Link>
              <Link href="#" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 font-medium text-sm transition-colors">
                Leaderboard
              </Link>
              <Link href="#" className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 font-medium text-sm transition-colors">
                Settings
              </Link>
            </aside>

            {/* Col 2: Centralized Main Module */}
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-card border border-border p-12 text-center h-full">
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Current Focus</h2>
              <h3 className="text-3xl font-bold text-foreground mb-4">Data Structures Fundamentals</h3>
              <p className="text-text-secondary max-w-md mb-8">
                Continue your progress in Module 2 covering Lists, Stacks, and Queues.
              </p>
              <Button size="lg" className="px-10">
                Resume Module
              </Button>
            </div>

            {/* Col 3: Flat Utilities (Stats & Daily Challenge) */}
            <div className="space-y-6 lg:pl-4">
              
              {/* Daily Challenge */}
              <div className="bg-background border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Daily Challenge</h3>
                  <span className="text-xs font-mono text-brand-400 bg-brand-400/10 px-2 py-1">In-Place</span>
                </div>
                <p className="text-sm text-foreground font-medium mb-2">Reverse a String In-Place</p>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Write a function that reverses a string given as an array of characters. O(1) extra memory.
                </p>
                <Button variant="outline" className="w-full text-xs">
                  Solve Challenge
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="bg-background border border-border p-5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary uppercase">Problems</span>
                    <span className="text-sm font-mono font-bold text-foreground">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary uppercase">Lessons</span>
                    <span className="text-sm font-mono font-bold text-foreground">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary uppercase">XP</span>
                    <span className="text-sm font-mono font-bold text-brand-400">940</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary uppercase">Rank</span>
                    <span className="text-sm font-mono font-bold text-foreground">15%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
