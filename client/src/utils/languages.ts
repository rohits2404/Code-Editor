import type { Language } from '../types';

export const LANGUAGES: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    judge0Id: 63,
    defaultCode: `// JavaScript Code
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    judge0Id: 71,
    defaultCode: `# Python Code
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")`
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    judge0Id: 62,
    defaultCode: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
    
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    judge0Id: 54,
    defaultCode: `// C++ Code
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    return 0;
}`
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    judge0Id: 60,
    defaultCode: `// Go Code
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Printf("Fibonacci(10): %d\\n", fibonacci(10))
}`
  }
];

export const getLanguageById = (id: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.id === id);
};