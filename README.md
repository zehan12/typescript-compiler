# TypeScript Type Erasure Visualizer

A Next.js application that visually demonstrates how TypeScript is compiled into JavaScript through the process of "type erasure."

## Features

- **Step-by-Step Visualization**: See exactly how TypeScript removes type annotations in stages:
  - Removing Interfaces
  - Removing Parameter Types
  - Removing Return Types
  - Removing Variable Types
- **Interactive Editor**: Powered by Shiki, allowing you to write your own TypeScript code and see it transformed in real-time.
- **AST Parsing**: Utilizes the official TypeScript Compiler API to safely parse and strip types without breaking the underlying JavaScript logic.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Syntax Highlighting**: [Shiki](https://shiki.style/)
- **AST Parsing**: TypeScript Compiler API
- **Styling**: Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or yarn / pnpm / bun
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

The core logic lives in `src/lib/transformer.ts`. It takes your TypeScript code, generates an Abstract Syntax Tree (AST) using the TypeScript Compiler API, and sequentially removes specific TypeScript-only nodes (like `InterfaceDeclaration` and type annotations on parameters, returns, and variables) until pure JavaScript remains.

## License

MIT
