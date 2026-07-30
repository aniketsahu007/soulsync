import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import "@/hooks/usePWAInstall";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#10b981" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "SoulSync" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "SoulSync - AI-Powered Peer Support" },
      {
        name: "description",
        content:
          "A safe, accessible, and intelligent peer support system for students. Anonymous, empathetic, and proactive emotional support.",
      },
      { name: "author", content: "Code Catalysts" },
      { property: "og:title", content: "SoulSync - AI-Powered Peer Support" },
      {
        property: "og:description",
        content:
          "Not just a chat app - an intelligent emotional support system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "SoulSync - AI-Powered Peer Support" },
      {
        name: "twitter:description",
        content:
          "Anonymous, empathetic, and proactive emotional support for students.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Plus+Jakarta+Sans:wght@500;600&display=swap",
      },
      {
        rel: "manifest",
        href: "/manifest.webmanifest",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/icons/apple-touch-icon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Scripts />
      </body>
    </html>
  );
}

import { useAnonymousIdentity } from "../hooks/useAnonymousIdentity";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoulSyncStoryModal } from "@/components/SoulSyncStoryModal";

function RootComponent() {
  useAnonymousIdentity(); // Initialize anonymous identity on mount
  useServiceWorker();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SoulSyncStoryModal />
      <Outlet />
    </ThemeProvider>
  );
}
