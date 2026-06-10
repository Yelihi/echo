# Auth Loading Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated full-page loading route that starts Google OAuth and keeps the user in a clear progress state before the OAuth provider redirect and final home redirect.

**Architecture:** The login button becomes a route trigger, not the OAuth owner. A new client page at `/auth/loading` validates the query string, starts Supabase OAuth once, and renders progress or an error. The existing callback page becomes responsible for returning the browser to the API callback route so server redirects update the actual location.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase SSR/browser client, Jest, Testing Library.

---

## File Structure

- Create `src/app/(auth)/loading/page.tsx`: client route that renders the intermediate loading UI and starts OAuth.
- Create `src/app/(auth)/loading/page.test.tsx`: verifies provider validation, OAuth call, and error display.
- Modify `src/features/login/ui/LoginButton.tsx`: route to `/auth/loading` on click and remove local spinner state.
- Create `src/features/login/ui/LoginButton.test.tsx`: verifies the button sends users to the loading route.
- Modify `src/app/(auth)/callback/page.tsx`: use `window.location.assign('/api/auth/callback?...')` after extracting the OAuth code.

## Task 1: Login Button Routes To Loading Page

**Files:**

- Modify: `src/features/login/ui/LoginButton.tsx`
- Test: `src/features/login/ui/LoginButton.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

import { LoginButton } from "@/features/login/ui/LoginButton";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginButton", () => {
  it("moves to the auth loading page with provider and next path", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<LoginButton provider="google">Google login</LoginButton>);

    await userEvent.click(screen.getByRole("button", { name: "Google login" }));

    expect(push).toHaveBeenCalledWith("/auth/loading?provider=google&next=/home");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- LoginButton.test.tsx --runInBand`

Expected: FAIL because `LoginButton` still calls Supabase directly instead of `router.push`.

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components";
import type { LoginButtonProps } from "@/features/login/models/interface";

export function LoginButton({ children, provider }: LoginButtonProps) {
  const router = useRouter();

  const requestLogin = () => {
    router.push(`/auth/loading?provider=${provider}&next=/home`);
  };

  return (
    <Button size="lg" className="w-full" onClick={requestLogin}>
      {children}
    </Button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- LoginButton.test.tsx --runInBand`

Expected: PASS.

## Task 2: Auth Loading Page Starts OAuth

**Files:**

- Create: `src/app/(auth)/loading/page.tsx`
- Test: `src/app/(auth)/loading/page.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import AuthLoadingPage from "@/app/(auth)/loading/page";
import { getSupabaseBrowserClient } from "@/shared/lib/supabase/client";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/shared/lib/supabase/client", () => ({
  getSupabaseBrowserClient: jest.fn(),
}));

describe("AuthLoadingPage", () => {
  it("starts Google OAuth with the callback redirect", async () => {
    const signInWithOAuth = jest.fn().mockResolvedValue({ error: null });
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("provider=google&next=/home"),
    );
    (getSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: { signInWithOAuth },
    });

    render(<AuthLoadingPage />);

    expect(await screen.findByText("구글 로그인으로 이동하고 있습니다.")).toBeInTheDocument();
    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost/auth/callback?next=%2Fhome",
        },
      });
    });
  });

  it("shows an error for an unsupported provider", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("provider=github&next=/home"),
    );

    render(<AuthLoadingPage />);

    expect(await screen.findByText("지원하지 않는 로그인 방식입니다.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- page.test.tsx --runInBand`

Expected: FAIL because the loading route does not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import type { SupabaseAuthConnectedProvider } from "@/features/login/models/interface";

const SUPPORTED_PROVIDERS = new Set<SupabaseAuthConnectedProvider>(["google"]);

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }

  return value;
}

export default function AuthLoadingPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") as SupabaseAuthConnectedProvider | null;
    const nextPath = getSafeNextPath(searchParams.get("next"));

    if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
      setError("지원하지 않는 로그인 방식입니다.");
      return;
    }

    const client = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    void client.auth
      .signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      .then(({ error: authError }) => {
        if (authError) {
          setError(authError.message);
        }
      });
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      {error ? (
        <>
          <p className="text-body-2 font-semibold text-red-600">{error}</p>
          <Link className="text-body-3 font-medium text-black underline" href="/login">
            로그인으로 돌아가기
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="size-10 animate-spin text-black" aria-hidden="true" />
          <p className="text-body-2 font-semibold text-black">구글 로그인으로 이동하고 있습니다.</p>
          <p className="text-body-3 text-gray-600">잠시만 기다려주세요.</p>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- page.test.tsx --runInBand`

Expected: PASS.

## Task 3: Callback Page Performs Browser Navigation

**Files:**

- Modify: `src/app/(auth)/callback/page.tsx`

- [ ] **Step 1: Change callback navigation**

```tsx
window.location.assign(
  `/api/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(nextPath)}`,
);
```

- [ ] **Step 2: Preserve invalid access handling**

Keep the existing `error` state and show `올바르지 않은 접근입니다.` when no code exists.

- [ ] **Step 3: Run typecheck and lint**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

## Self-Review

- Spec coverage: the plan covers login route transition, loading page OAuth start, callback completion, error handling, and type/lint verification.
- Placeholder scan: no placeholder tasks remain.
- Type consistency: provider type stays `SupabaseAuthConnectedProvider`, `next` remains a path string, and callback navigation keeps the existing API route contract.
