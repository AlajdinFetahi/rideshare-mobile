"use client";

import { useEffect } from "react";

export function Pwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let filled = false;
    let disposed = false;
    const fill = () => {
      if (!disposed && !filled && navigator.serviceWorker.controller) {
        filled = true;
        void fetch("/api/udhetimet", { cache: "no-store", credentials: "omit" }).catch(() => {});
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", fill);
    void navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready).then(fill).catch(() => {});
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", fill);
    };
  }, []);

  return (
    <aside style={{ maxWidth: 720, margin: "auto", padding: "12px 24px" }}>
      <a href="/offline.html">Lista për lexim pa internet</a>
      <small style={{ display: "block" }}>Kopja mund të jetë e vjetër; nuk konfirmohen rezervime.</small>
    </aside>
  );
}
