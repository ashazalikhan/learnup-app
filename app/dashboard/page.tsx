import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back to Learnup
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Your personalized dashboard. Pick up where you left off and keep your streak alive.
          </p>
        </div>

        {/* Progress Section */}
        <Card className="w-full text-center">
          <CardHeader className="items-center pb-4">
            <CardTitle>Current Module Progress</CardTitle>
            <CardDescription>Data Structures Fundamentals</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-md">
              <div className="mb-2 flex justify-between text-sm font-medium text-foreground">
                <span>Completed</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="w-full" />
            </div>
            <p className="text-sm text-muted-foreground">
              You're doing great! Complete 2 more lessons to finish this module.
            </p>
          </CardContent>
          <CardFooter className="justify-center pb-6">
            <Button size="lg" className="px-8">
              Resume Learning
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity / Next Up */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="text-center">
            <CardHeader className="items-center">
              <CardTitle>Next Lesson</CardTitle>
              <CardDescription>Linked Lists Overview</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Understand the memory layout and basic operations of singly linked lists.
              </p>
              <div className="rounded-md bg-muted px-3 py-2">
                <code className="font-mono text-sm text-foreground">
                  class Node {"{"} ... {"}"}
                </code>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="secondary">Start Lesson</Button>
            </CardFooter>
          </Card>

          <Card className="text-center">
            <CardHeader className="items-center">
              <CardTitle>Daily Challenge</CardTitle>
              <CardDescription>Reverse a String</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Write a function that reverses a string. The input string is given as an array of characters.
              </p>
              <div className="rounded-md bg-muted px-3 py-2">
                <code className="font-mono text-sm text-foreground">
                  reverseString(s: string[])
                </code>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline">Solve Challenge</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
