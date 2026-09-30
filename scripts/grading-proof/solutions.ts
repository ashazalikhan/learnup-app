import type { SupportedLanguage } from "@/lib/curriculum/types";

/** Path order from content/paths/arrays/path.json */
export const LESSON_SLUGS = [
  "what-is-an-array",
  "indexing",
  "traversal",
  "sum",
  "find-max",
  "linear-search",
  "update-in-place",
  "reverse-an-array",
  "two-pointer-swap",
  "capstone-second-largest",
] as const;

export type LessonSlug = (typeof LESSON_SLUGS)[number];

export const WRONG_ANSWER_SENTINEL = "GRADING_PROOF_WRONG";

type SolutionMap = Record<LessonSlug, Record<SupportedLanguage, string>>;

const correct: SolutionMap = {
  "what-is-an-array": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
console.log(n);
console.log(arr[0]);
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
print(n)
print(arr[0])
`,
    c: `#include <stdio.h>
int main(void) {
  int n;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  printf("%d\\n%d\\n", n, arr[0]);
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  std::cout << n << "\\n" << arr[0] << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    System.out.println(n);
    System.out.println(arr[0]);
  }
}
`,
  },
  indexing: {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
const k = parseInt(lines[2], 10);
console.log(arr[k]);
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
k = int(lines[2])
print(arr[k])
`,
    c: `#include <stdio.h>
int main(void) {
  int n, k;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  scanf("%d", &k);
  printf("%d\\n", arr[k]);
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n, k;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  std::cin >> k;
  std::cout << arr[k] << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    int k = sc.nextInt();
    System.out.println(arr[k]);
  }
}
`,
  },
  traversal: {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
console.log(arr.join(" "));
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
print(" ".join(map(str, arr)))
`,
    c: `#include <stdio.h>
int main(void) {
  int n;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  for (int i = 0; i < n; i++) {
    if (i) printf(" ");
    printf("%d", arr[i]);
  }
  printf("\\n");
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  for (int i = 0; i < n; i++) {
    if (i) std::cout << " ";
    std::cout << arr[i];
  }
  std::cout << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
import java.util.stream.Collectors;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < n; i++) {
      if (i > 0) sb.append(" ");
      sb.append(arr[i]);
    }
    System.out.println(sb);
  }
}
`,
  },
  sum: {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
console.log(arr.reduce((a, b) => a + b, 0));
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
print(sum(arr))
`,
    c: `#include <stdio.h>
int main(void) {
  int n, s = 0;
  scanf("%d", &n);
  for (int i = 0; i < n; i++) {
    int x;
    scanf("%d", &x);
    s += x;
  }
  printf("%d\\n", s);
  return 0;
}
`,
    cpp: `#include <iostream>
int main() {
  int n, s = 0;
  std::cin >> n;
  for (int i = 0; i < n; i++) {
    int x;
    std::cin >> x;
    s += x;
  }
  std::cout << s << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    long s = 0;
    for (int i = 0; i < n; i++) s += sc.nextInt();
    System.out.println(s);
  }
}
`,
  },
  "find-max": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
console.log(Math.max(...arr));
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
print(max(arr))
`,
    c: `#include <stdio.h>
int main(void) {
  int n, mx, x;
  scanf("%d", &n);
  scanf("%d", &mx);
  for (int i = 1; i < n; i++) {
    scanf("%d", &x);
    if (x > mx) mx = x;
  }
  printf("%d\\n", mx);
  return 0;
}
`,
    cpp: `#include <iostream>
#include <algorithm>
#include <vector>
int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  std::cout << *std::max_element(arr.begin(), arr.end()) << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int mx = Integer.MIN_VALUE;
    for (int i = 0; i < n; i++) {
      int x = sc.nextInt();
      if (x > mx) mx = x;
    }
    System.out.println(mx);
  }
}
`,
  },
  "linear-search": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
const target = parseInt(lines[2], 10);
let idx = -1;
for (let i = 0; i < n; i++) {
  if (arr[i] === target) { idx = i; break; }
}
console.log(idx);
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
target = int(lines[2])
idx = -1
for i in range(n):
    if arr[i] == target:
        idx = i
        break
print(idx)
`,
    c: `#include <stdio.h>
int main(void) {
  int n, target, idx = -1;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  scanf("%d", &target);
  for (int i = 0; i < n; i++) {
    if (arr[i] == target) { idx = i; break; }
  }
  printf("%d\\n", idx);
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n, target;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  std::cin >> target;
  int idx = -1;
  for (int i = 0; i < n; i++) {
    if (arr[i] == target) { idx = i; break; }
  }
  std::cout << idx << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    int target = sc.nextInt();
    int idx = -1;
    for (int i = 0; i < n; i++) {
      if (arr[i] == target) { idx = i; break; }
    }
    System.out.println(idx);
  }
}
`,
  },
  "update-in-place": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
const [i, x] = lines[2].split(/\\s+/).map(Number);
arr[i] = x;
console.log(arr.join(" "));
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
i, x = map(int, lines[2].split())
arr[i] = x
print(" ".join(map(str, arr)))
`,
    c: `#include <stdio.h>
int main(void) {
  int n, i, x;
  scanf("%d", &n);
  int arr[1000];
  for (int j = 0; j < n; j++) scanf("%d", &arr[j]);
  scanf("%d %d", &i, &x);
  arr[i] = x;
  for (int j = 0; j < n; j++) {
    if (j) printf(" ");
    printf("%d", arr[j]);
  }
  printf("\\n");
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n, i, x;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int j = 0; j < n; j++) std::cin >> arr[j];
  std::cin >> i >> x;
  arr[i] = x;
  for (int j = 0; j < n; j++) {
    if (j) std::cout << " ";
    std::cout << arr[j];
  }
  std::cout << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int j = 0; j < n; j++) arr[j] = sc.nextInt();
    int i = sc.nextInt();
    int x = sc.nextInt();
    arr[i] = x;
    StringBuilder sb = new StringBuilder();
    for (int j = 0; j < n; j++) {
      if (j > 0) sb.append(" ");
      sb.append(arr[j]);
    }
    System.out.println(sb);
  }
}
`,
  },
  "reverse-an-array": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const tokens = raw.length ? raw.split(/\\s+/).map(Number) : [];
const n = tokens[0] ?? 0;
const arr = tokens.slice(1, 1 + n);
console.log(arr.reverse().join(" "));
`,
    python: `import sys
raw = sys.stdin.read().strip()
tokens = list(map(int, raw.split())) if raw else []
n = tokens[0] if tokens else 0
arr = tokens[1 : 1 + n]
arr.reverse()
print(" ".join(map(str, arr)))
`,
    c: `#include <stdio.h>
int main(void) {
  int n;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  for (int i = 0; i < n; i++) {
    if (i) printf(" ");
    printf("%d", arr[n - 1 - i]);
  }
  printf("\\n");
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  for (int i = 0; i < n; i++) {
    if (i) std::cout << " ";
    std::cout << arr[n - 1 - i];
  }
  std::cout << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    StringBuilder sb = new StringBuilder();
    for (int i = n - 1; i >= 0; i--) {
      if (sb.length() > 0) sb.append(" ");
      sb.append(arr[i]);
    }
    System.out.println(sb);
  }
}
`,
  },
  "two-pointer-swap": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
const t = arr[0];
arr[0] = arr[n - 1];
arr[n - 1] = t;
console.log(arr.join(" "));
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
arr[0], arr[-1] = arr[-1], arr[0]
print(" ".join(map(str, arr)))
`,
    c: `#include <stdio.h>
int main(void) {
  int n;
  scanf("%d", &n);
  int arr[1000];
  for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
  int t = arr[0];
  arr[0] = arr[n - 1];
  arr[n - 1] = t;
  for (int i = 0; i < n; i++) {
    if (i) printf(" ");
    printf("%d", arr[i]);
  }
  printf("\\n");
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
int main() {
  int n;
  std::cin >> n;
  std::vector<int> arr(n);
  for (int i = 0; i < n; i++) std::cin >> arr[i];
  std::swap(arr[0], arr[n - 1]);
  for (int i = 0; i < n; i++) {
    if (i) std::cout << " ";
    std::cout << arr[i];
  }
  std::cout << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
    int t = arr[0];
    arr[0] = arr[n - 1];
    arr[n - 1] = t;
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < n; i++) {
      if (i > 0) sb.append(" ");
      sb.append(arr[i]);
    }
    System.out.println(sb);
  }
}
`,
  },
  "capstone-second-largest": {
    javascript: `const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim();
const lines = raw.split(/\\n/);
const n = parseInt(lines[0], 10);
const arr = lines[1].split(/\\s+/).map(Number);
let best = -Infinity, second = -Infinity;
for (const v of arr) {
  if (v > best) { second = best; best = v; }
  else if (v > second && v < best) second = v;
}
console.log(second);
`,
    python: `import sys
lines = sys.stdin.read().strip().split("\\n")
n = int(lines[0])
arr = list(map(int, lines[1].split()))
best = second = float("-inf")
for v in arr:
    if v > best:
        second, best = best, v
    elif best > v > second:
        second = v
print(int(second))
`,
    c: `#include <stdio.h>
int main(void) {
  int n;
  scanf("%d", &n);
  int best = -1000000000, second = -1000000000, x;
  for (int i = 0; i < n; i++) {
    scanf("%d", &x);
    if (x > best) { second = best; best = x; }
    else if (x > second) second = x;
  }
  printf("%d\\n", second);
  return 0;
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <climits>
int main() {
  int n;
  std::cin >> n;
  int best = INT_MIN, second = INT_MIN, x;
  for (int i = 0; i < n; i++) {
    std::cin >> x;
    if (x > best) { second = best; best = x; }
    else if (x > second) second = x;
  }
  std::cout << second << "\\n";
  return 0;
}
`,
    java: `import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int best = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
    for (int i = 0; i < n; i++) {
      int x = sc.nextInt();
      if (x > best) { second = best; best = x; }
      else if (x > second) second = x;
    }
    System.out.println(second);
  }
}
`,
  },
};

export function getCorrectSolution(slug: LessonSlug, language: SupportedLanguage): string {
  return correct[slug][language];
}

export function wrongFromStarter(starter: string, language: SupportedLanguage): string {
  const s = WRONG_ANSWER_SENTINEL;
  switch (language) {
    case "javascript":
      return `${starter}console.log("${s}");\n`;
    case "python":
      return `${starter}print("${s}")\n`;
    case "c":
      return starter.replace(
        /return 0;\s*\}\s*$/,
        `printf("${s}\\n");\n  return 0;\n}\n`
      );
    case "cpp":
      return starter.replace(
        /return 0;\s*\}\s*$/,
        `std::cout << "${s}" << "\\n";\n  return 0;\n}\n`
      );
    case "java":
      return starter.replace(
        /\/\/ TODO:[^\n]*\n(\s*)\}\s*\}\s*$/,
        `System.out.println("${s}");\n$1}\n}\n`
      );
    default:
      return starter;
  }
}

export function assertSolutionCoverage(languages: SupportedLanguage[]): void {
  for (const slug of LESSON_SLUGS) {
    for (const lang of languages) {
      const c = getCorrectSolution(slug, lang).trim();
      if (!c) {
        throw new Error(`Missing correct solution for ${slug}/${lang}`);
      }
    }
  }
}
