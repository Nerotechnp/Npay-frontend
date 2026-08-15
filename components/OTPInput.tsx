"use client";

import { useRef } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.padEnd(length, " ").split("").slice(0, length);

  function handleChange(index: number, raw: string) {
    const char = raw.replace(/[^0-9]/g, "").slice(-1);
    const next = digits.slice();
    next[index] = char || " ";
    const joined = next.join("").trimEnd();
    onChange(joined);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-11 rounded-lg border border-line-2 bg-paper text-center text-lg font-medium text-ink focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
