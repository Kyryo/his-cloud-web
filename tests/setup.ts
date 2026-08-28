import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = vi.fn();
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("@/lib/fonts", () => ({
  appFont: {
    className: "font-dm-sans-mock",
    variable: "--font-dm-sans",
  },
}));

process.env.HMIS_API_URL = "http://localhost:8000/api/v1";
