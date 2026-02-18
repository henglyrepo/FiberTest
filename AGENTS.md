# AGENTS.md - FiberTest Speed Test Application

## Project Overview

This is a Next.js-based internet speed test application that measures download speed, upload speed, ping, and jitter using public CDN endpoints. The app uses the Next.js App Router with TypeScript and TailwindCSS.

## Build, Lint, and Test Commands

### Development
```bash
# Start development server
npm run dev

# Start production server (after build)
npm run start
```

### Building
```bash
# Build for production
npm run build

# Build with verbose output
npm run build -- --verbose
```

### Linting
```bash
# Run ESLint on all files
npm run lint

# Lint specific file
npx eslint src/app/page.tsx

# Lint with fix
npm run lint -- --fix
```

### Type Checking
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/hooks/useSpeedTest.ts
```

## Code Style Guidelines

### General Principles

- **Use TypeScript**: All code must be written in TypeScript. Avoid `any` type when possible.
- **Strict Mode**: Enable strict TypeScript checking in tsconfig.json.
- **Functional Components**: Use React functional components with hooks. No class components.
- **Client Components**: Mark components that use client-side features with `"use client"` directive.

### Imports and Exports

- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Group imports in the following order:
  1. React/Next imports
  2. Third-party library imports
  3. Internal imports (components, hooks, utils)
  4. Type imports
- Use named exports for components and functions
- Default exports only for page components (`page.tsx`)

```typescript
// Good
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Activity, Upload, Download } from "lucide-react";
import { SpeedGauge } from "@/components/SpeedGauge";
import { useSpeedTest, type SpeedTestResult } from "@/hooks/useSpeedTest";

// Avoid
import * as Icons from "lucide-react";
import { SpeedGauge as SG } from "@/components/SpeedGauge";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `SpeedGauge`, `ServerInfo`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSpeedTest`, `useFetch`)
- **Interfaces/Types**: PascalCase (e.g., `SpeedTestResult`, `ServerInfoData`)
- **Constants**: UPPER_SNAKE_CASE for configuration (e.g., `CDN_ENDPOINTS`)
- **Variables/Functions**: camelCase
- **Files**: kebab-case for general files (e.g., `use-speed-test.ts`), PascalCase for components

### Type Definitions

- Always define explicit return types for functions, especially hooks
- Use interfaces for object shapes
- Use type unions for enum-like values
- Avoid `any`, use `unknown` when type is truly unknown

```typescript
// Good
interface SpeedTestResult {
  ping: number;
  download: number;
  upload: number;
  jitter: number;
}

export type TestStatus = "idle" | "testing" | "completed";
export type TestPhase = "ping" | "download" | "upload" | "done";

export function useSpeedTest(): {
  status: TestStatus;
  phase: TestPhase;
  results: SpeedTestResult;
  startTest: () => Promise<void>;
} {
  // ...
}

// Avoid
const useBadPractice = () => {
  const [data, setData] = useState<any>(null);
  return data;
};
```

### React Patterns

- Use `useCallback` for functions passed as props to prevent unnecessary re-renders
- Use `useMemo` for expensive computations
- Prefer early returns for cleaner code
- Destructure props in function parameters when possible

```typescript
// Good
interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  label: string;
  unit?: string;
}

export function SpeedGauge({ speed, maxSpeed = 100, label, unit = "Mbps" }: SpeedGaugeProps) {
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedSpeed(speed), 100);
    return () => clearTimeout(timer);
  }, [speed]);

  if (speed < 0) return null;
  // ...
}

// Avoid
export function SpeedGauge(props) {
  const speed = props.speed;
  // ...
}
```

### Error Handling

- Always wrap async operations in try/catch
- Provide fallback UI for error states
- Log errors appropriately (use `console.error` for errors, not `console.log`)
- Handle loading states explicitly

```typescript
// Good
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error("Failed to fetch data:", error);
  setError(true);
}

// For API calls, handle specific error codes
if (response.status === 404) {
  // Handle not found
} else if (response.status >= 500) {
  // Handle server error
}
```

### CSS and Styling

- Use TailwindCSS utility classes for styling
- Avoid inline styles except for dynamic values
- Use consistent spacing (follow Tailwind's spacing scale)
- Use dark mode friendly colors (gray-400, gray-600, etc. for text)

```typescript
// Good
<div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm">
  <span className="text-2xl font-bold text-white">{value}</span>
</div>

// Avoid
<div style={{ display: 'flex', padding: '16px', backgroundColor: '#333' }}>
```

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main speed test page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SpeedGauge.tsx    # Animated speed gauge
│   └── ServerInfo.tsx    # ISP information display
├── hooks/                 # Custom React hooks
│   └── useSpeedTest.ts  # Speed test logic
└── types/                 # TypeScript type definitions (if needed)
```

### TailwindCSS v4 Notes

This project uses TailwindCSS v4 which uses a new configuration approach:

- No `tailwind.config.js` needed - configuration is in CSS
- Use `@theme` directive for custom theme values
- Use `@import "tailwindcss";` at the top of CSS files

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
  }
}
```

### Performance Considerations

- Use `React.memo` for components that don't need to re-render often
- Lazy load components that aren't needed immediately
- Use `next/image` for optimized images
- Avoid large bundle sizes - use tree shaking

### Testing Guidelines

- Currently no test framework is set up
- If adding tests, use Vitest or Jest with React Testing Library
- Test user interactions and component renders
- Mock external API calls

```bash
# If adding Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Run tests
npx vitest

# Run single test file
npx vitest run src/hooks/useSpeedTest.test.ts
```

### Common Issues and Solutions

1. **Build fails with "workUnitAsyncStorage" error**: This is a known issue with Next.js 16. Consider using Next.js 14.x or 15.x for production.

2. **ESLint errors about "use client"**: Ensure client components that use hooks or browser APIs have `"use client"` at the top of the file.

3. **TypeScript errors with XMLHttpRequest**: Use the `XMLHttpRequest` type from the global scope or add `declare const XMLHttpRequest: any;` temporarily.

4. **TailwindCSS not applying styles**: Ensure `@import "tailwindcss";` is at the top of globals.css and PostCSS is configured correctly.

### External Dependencies Used

- **next**: ^16.1.6 - Next.js framework
- **react**: ^19.2.3 - React library
- **lucide-react**: ^0.574.0 - Icon library
- **recharts**: ^3.7.0 - Chart library (available for future use)
- **tailwindcss**: ^4 - CSS framework

### External APIs Used

- **ipapi.co**: For getting user IP address, location, and ISP information
- **speed.cloudflare.com**: For download speed testing
- **speed.hetzner.de**: Alternative download endpoint
- **proof.ovh.net**: Alternative download endpoint
- **httpbin.org/post**: For upload testing
- **reqres.in/api/posts**: Alternative upload endpoint
