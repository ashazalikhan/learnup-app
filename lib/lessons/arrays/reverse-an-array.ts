import type { Lesson } from "@/lib/lessons/types";

export const reverseAnArrayLesson: Lesson = {
  key: "arrays/reverse-an-array",
  path: "arrays",
  slug: "reverse-an-array",
  title: "Reverse an Array",
  statement: `Given an array of **n** integers, print the elements in **reverse order**, space-separated on a single line.

Read from standard input and write to standard output. Do not add extra labels or debug text.`,
  ioRules: `- The first line contains the integer **n** (1 ≤ n ≤ 1000).
- The second line contains **n** space-separated integers.
- Print the **n** integers in reverse order, separated by single spaces.
- Do not print trailing spaces or extra blank lines.`,
  examples: [
    {
      input: "3\n1 2 3",
      output: "3 2 1",
      explanation: "The reversed order of 1, 2, 3 is 3, 2, 1.",
    },
    {
      input: "1\n42",
      output: "42",
      explanation: "A single element stays the same.",
    },
  ],
  fixtures: [
    { stdin: "3\n1 2 3\n", expectedStdout: "3 2 1" },
    { stdin: "1\n42\n", expectedStdout: "42" },
    { stdin: "5\n10 20 30 40 50\n", expectedStdout: "50 40 30 20 10" },
    { stdin: "4\n-1 0 1 2\n", expectedStdout: "2 1 0 -1" },
  ],
  starters: {
    javascript: `const fs = require("fs");

const raw = fs.readFileSync(0, "utf8").trim();
const tokens = raw.length ? raw.split(/\\s+/).map(Number) : [];
const n = tokens[0] ?? 0;
const arr = tokens.slice(1, 1 + n);

// TODO: reverse arr and print the elements space-separated on one line
`,
    python: `import sys

data = list(map(int, sys.stdin.read().split()))
n = data[0]
arr = data[1 : 1 + n]

# TODO: reverse arr and print the elements space-separated on one line
`,
    c: `#include <stdio.h>

int main(void) {
  int n;
  if (scanf("%d", &n) != 1) return 0;
  int arr[1000];
  for (int i = 0; i < n; i++) {
    scanf("%d", &arr[i]);
  }

  // TODO: print the array in reverse order, space-separated
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>

int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) {
    std::cin >> arr[i];
  }

  // TODO: print the array in reverse order, space-separated
  return 0;
}
`,
    java: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) {
      arr[i] = sc.nextInt();
    }

    // TODO: print the array in reverse order, space-separated
  }
}
`,
  },
};
