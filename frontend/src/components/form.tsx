"use client";

import { useFormStatus } from "react-dom";
import type { FieldErrors } from "@/lib/types";

export function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingText : children}
    </button>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: FieldErrors;
};

export function Field({ label, name, errors, ...props }: FieldProps) {
  const messages = errors?.[name];

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={messages ? true : undefined}
        aria-describedby={messages ? `${name}-error` : undefined}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20 aria-invalid:border-red-400"
        {...props}
      />
      {messages && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {messages[0]}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
