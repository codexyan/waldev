"use client";

import { useEffect, useRef } from "react";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void },
  ) => string;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Widget Turnstile. Hanya aktif jika NEXT_PUBLIC_TURNSTILE_SITE_KEY di-set;
 * jika tidak, tidak merender apa pun (server juga melewati verifikasi).
 */
export function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onVerify);
  callbackRef.current = onVerify;
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !rendered.current) {
        rendered.current = true;
        window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => callbackRef.current(token),
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", renderWidget);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget);
    document.head.appendChild(script);
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="my-2" />;
}
