"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIONS, type ActionType } from "@/app/types";
import ErrorAlert from "@/app/components/ErrorAlert";
import type { AppErrorCode } from "@/lib/errors";
import { requestGenerate } from "@/lib/apiClient";
import { LOADING_MESSAGES } from "@/lib/prompts";

type Status = "idle" | "loading" | "success" | "error";

export default function ArticleForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [result, setResult] = useState("");
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [copied, setCopied] = useState(false);

  const resultSectionRef = useRef<HTMLElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (status === "success" && result) {
      resultSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [status, result]);

  function handleClear() {
    requestIdRef.current += 1;
    setUrl("");
    setStatus("idle");
    setActiveAction(null);
    setResult("");
    setErrorCode(null);
    setTruncated(false);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleGenerate(action: ActionType) {
    const requestId = ++requestIdRef.current;

    setStatus("loading");
    setActiveAction(action);
    setErrorCode(null);
    setResult("");
    setTruncated(false);
    setCopied(false);

    const response = await requestGenerate(url, action);

    if (requestId !== requestIdRef.current) return;

    if (!response.ok) {
      setErrorCode(response.code);
      setStatus("error");
      return;
    }

    setResult(response.result);
    setTruncated(response.truncated);
    setStatus("success");
  }

  function getLoadingMessage(): string {
    if (activeAction && activeAction in LOADING_MESSAGES) {
      return LOADING_MESSAGES[activeAction];
    }
    return "Chargement...";
  }

  const canCopy = status === "success" && Boolean(result);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 sm:gap-8">
      <header className="space-y-2 px-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
          Mon-referent-FR
        </h1>
        <p className="text-sm leading-relaxed text-blue-100 sm:text-base">
          Traitement pour les reseaux sociaux — article francophone vers contenu
          social
        </p>
      </header>

      <section className="rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:p-5 lg:p-6">
        <div className="mb-3 flex flex-col gap-2 sm:mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <label
            htmlFor="article-url"
            className="min-w-0 text-sm font-medium text-slate-700"
          >
            URL de l&apos;article en francais
          </label>
          <button
            type="button"
            onClick={handleClear}
            disabled={status === "loading"}
            className="w-full shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#002395] hover:text-[#002395] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-1.5"
          >
            Очистить
          </button>
        </div>
        <input
          id="article-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://exemple.fr/article"
          className="w-full min-w-0 rounded-xl border border-blue-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-blue-200 sm:text-sm"
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => {
          const isLoading = status === "loading" && activeAction === action.id;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                void handleGenerate(action.id);
              }}
              disabled={status === "loading"}
              className="min-w-0 rounded-xl border border-blue-100 bg-white/95 px-4 py-4 text-left shadow-md backdrop-blur-sm transition hover:border-[#002395] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="block break-words font-semibold text-slate-900">
                {isLoading ? "Generation..." : action.label}
              </span>
              <span className="mt-1 block break-words text-sm leading-snug text-slate-500">
                {action.description}
              </span>
            </button>
          );
        })}
      </section>

      <section
        ref={resultSectionRef}
        className="scroll-mt-4 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:scroll-mt-6 sm:p-5 lg:p-6"
      >
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-lg font-semibold text-[#002395]">Resultat</h2>
          <div className="flex flex-wrap items-center gap-2">
            {status === "loading" && (
              <span className="text-sm font-medium text-[#002395]">
                Generation en cours...
              </span>
            )}
            {canCopy && (
              <button
                type="button"
                onClick={() => {
                  void handleCopy();
                }}
                className="rounded-lg border border-[#002395] px-3 py-2 text-sm font-medium text-[#002395] transition hover:bg-blue-50 sm:py-1.5"
              >
                {copied ? "Скопировано" : "Копировать"}
              </button>
            )}
          </div>
        </div>

        {status === "idle" && (
          <p className="text-sm leading-relaxed text-slate-500">
            Saisissez une URL et choisissez une action pour afficher le resultat
            ici.
          </p>
        )}

        {status === "error" && errorCode && <ErrorAlert code={errorCode} />}

        {(status === "loading" || status === "success") && (
          <>
            {status === "success" && truncated && (
              <p className="mb-3 break-words rounded-xl bg-amber-50 px-4 py-2 text-sm leading-relaxed text-amber-800">
                Le contenu de l&apos;article a ete tronque (limite 12 000
                caracteres) avant l&apos;envoi a l&apos;IA.
              </p>
            )}
            <pre className="max-w-full min-h-40 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {status === "loading" ? getLoadingMessage() : result}
            </pre>
          </>
        )}
      </section>
    </div>
  );
}
