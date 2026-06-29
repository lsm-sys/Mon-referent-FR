"use client";

import { useEffect } from "react";

import ErrorAlert from "@/app/components/ErrorAlert";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4">
        <ErrorAlert code="UNKNOWN" />
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl bg-[#002395] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#001a70]"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}
