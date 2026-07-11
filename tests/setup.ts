import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = vi.fn();
}

vi.mock("@/lib/fonts", () => ({
  appFont: {
    className: "font-dm-sans-mock",
    variable: "--font-dm-sans",
  },
}));

process.env.HMIS_API_URL = "http://localhost:8000/api/v1";
