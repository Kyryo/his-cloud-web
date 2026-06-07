"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

const NUMERIC_PATTERN = /^\d$/;

type UseOtpInputOptions = {
  length: number;
  value?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
};

type UseOtpInputResult = {
  digits: string[];
  focusedIndex: number;
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  code: string;
  setCode: (nextCode: string) => void;
  clear: () => void;
  focusInput: (index: number) => void;
  handleInput: (index: number, value: string) => void;
  handleKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (index: number, event: ClipboardEvent<HTMLInputElement>) => void;
  handleFocus: (index: number) => void;
};

function createEmptyDigits(length: number): string[] {
  return Array.from({ length }, () => "");
}

function sanitizeDigits(value: string, maxLength: number): string[] {
  const numeric = value.replace(/\D/g, "").slice(0, maxLength);
  const digits = createEmptyDigits(maxLength);
  for (let index = 0; index < numeric.length; index += 1) {
    digits[index] = numeric[index];
  }
  return digits;
}

function isCompleteCode(digits: string[], length: number): boolean {
  return digits.length === length && digits.every((digit) => digit !== "");
}

/**
 * Manages multi-digit OTP input: focus, keyboard navigation, and paste handling.
 */
export function useOtpInput({
  length,
  value,
  disabled = false,
  autoFocus = true,
  onChange,
  onComplete,
}: UseOtpInputOptions): UseOtpInputResult {
  const isControlled = value !== undefined;
  const [internalDigits, setInternalDigits] = useState<string[]>(() =>
    createEmptyDigits(length),
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const onChangeRef = useRef(onChange);
  const onCompleteRef = useRef(onComplete);
  const hasAutoFocusedRef = useRef(false);

  const digits = useMemo(
    () => (isControlled ? sanitizeDigits(value, length) : internalDigits),
    [internalDigits, isControlled, length, value],
  );

  const digitsRef = useRef(digits);

  useEffect(() => {
    digitsRef.current = digits;
  }, [digits]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const code = useMemo(() => digits.join(""), [digits]);

  const focusInput = useCallback(
    (index: number) => {
      if (disabled) return;
      const clamped = Math.max(0, Math.min(index, length - 1));
      setFocusedIndex(clamped);
      inputRefs.current[clamped]?.focus();
      inputRefs.current[clamped]?.select();
    },
    [disabled, length],
  );

  const emitChange = useCallback(
    (nextDigits: string[]) => {
      const nextCode = nextDigits.join("");
      onChangeRef.current?.(nextCode);

      if (isCompleteCode(nextDigits, length)) {
        onCompleteRef.current?.(nextCode);
      }
    },
    [length],
  );

  const commitDigits = useCallback(
    (nextDigits: string[], focusAt: number) => {
      digitsRef.current = nextDigits;
      if (!isControlled) {
        setInternalDigits(nextDigits);
      }
      emitChange(nextDigits);
      focusInput(focusAt);
    },
    [emitChange, focusInput, isControlled],
  );

  const setCode = useCallback(
    (nextCode: string) => {
      const nextDigits = sanitizeDigits(nextCode, length);
      commitDigits(nextDigits, Math.min(nextCode.replace(/\D/g, "").length, length - 1));
    },
    [commitDigits, length],
  );

  const clear = useCallback(() => {
    const empty = createEmptyDigits(length);
    if (!isControlled) {
      setInternalDigits(empty);
    }
    onChangeRef.current?.("");
    focusInput(0);
  }, [focusInput, isControlled, length]);

  const handleInput = useCallback(
    (index: number, rawValue: string) => {
      if (disabled) return;

      const digit = rawValue.slice(-1);
      if (digit && !NUMERIC_PATTERN.test(digit)) {
        return;
      }

      const nextDigits = [...digitsRef.current];
      nextDigits[index] = digit;
      commitDigits(nextDigits, digit ? Math.min(index + 1, length - 1) : index);
    },
    [commitDigits, disabled, length],
  );

  const handleKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        const nextDigits = [...digitsRef.current];

        if (digitsRef.current[index]) {
          nextDigits[index] = "";
          commitDigits(nextDigits, index);
          return;
        }

        if (index > 0) {
          nextDigits[index - 1] = "";
          commitDigits(nextDigits, index - 1);
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusInput(index + 1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusInput(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusInput(length - 1);
      }
    },
    [commitDigits, disabled, focusInput, length],
  );

  const handlePaste = useCallback(
    (index: number, event: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const pasted = event.clipboardData.getData("text");
      const numeric = pasted.replace(/\D/g, "");
      if (!numeric) return;

      event.preventDefault();

      const nextDigits = [...digitsRef.current];
      for (let offset = 0; offset < numeric.length && index + offset < length; offset += 1) {
        nextDigits[index + offset] = numeric[offset];
      }

      const filledCount = nextDigits.filter((digit) => digit !== "").length;
      commitDigits(nextDigits, Math.min(filledCount, length - 1));
    },
    [commitDigits, disabled, length],
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Auto-focus the first input after mount (client-only).
  useEffect(() => {
    if (!autoFocus || disabled || hasAutoFocusedRef.current) {
      return;
    }

    hasAutoFocusedRef.current = true;
    focusInput(0);
  }, [autoFocus, disabled, focusInput]);

  return {
    digits,
    focusedIndex,
    inputRefs,
    code,
    setCode,
    clear,
    focusInput,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFocus,
  };
}
