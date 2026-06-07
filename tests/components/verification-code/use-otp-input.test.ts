import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOtpInput } from "@/components/verification-code/use-otp-input";

describe("useOtpInput", () => {
  it("calls onChange as digits are entered", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOtpInput({ length: 6, autoFocus: false, onChange }),
    );

    act(() => {
      result.current.handleInput(0, "1");
      result.current.handleInput(1, "2");
    });

    expect(onChange).toHaveBeenLastCalledWith("12");
    expect(result.current.code).toBe("12");
  });

  it("calls onComplete when all digits are filled", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useOtpInput({ length: 4, autoFocus: false, onComplete }),
    );

    act(() => {
      result.current.setCode("1234");
    });

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("rejects non-numeric input", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOtpInput({ length: 6, autoFocus: false, onChange }),
    );

    act(() => {
      result.current.handleInput(0, "a");
    });

    expect(result.current.code).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the code", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOtpInput({ length: 6, autoFocus: false, onChange }),
    );

    act(() => {
      result.current.setCode("123");
      result.current.clear();
    });

    expect(result.current.code).toBe("");
    expect(onChange).toHaveBeenLastCalledWith("");
  });
});
