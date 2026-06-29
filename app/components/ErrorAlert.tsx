"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AppErrorCode } from "@/lib/errors";
import { getErrorMessage } from "@/lib/errorMessages";

type ErrorAlertProps = {
  code: AppErrorCode;
};

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export default function ErrorAlert({ code }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertIcon />
      <div className="min-w-0 flex-1">
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription className="break-words leading-relaxed">
          {getErrorMessage(code)}
        </AlertDescription>
      </div>
    </Alert>
  );
}
