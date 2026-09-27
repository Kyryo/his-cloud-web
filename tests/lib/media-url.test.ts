import { describe, expect, it } from "vitest";

import {
  absoluteMediaUrl,
  withBrowserAvatar,
} from "@/lib/server/media-url";

const API_URL = "http://localhost:8000/api/v1";

describe("absoluteMediaUrl", () => {
  it("points stored media paths at the API host", () => {
    expect(
      absoluteMediaUrl("/media/users/12/avatar/photo.png", API_URL),
    ).toBe("http://localhost:8000/media/users/12/avatar/photo.png");
  });

  it("leaves absolute and empty urls unchanged", () => {
    expect(
      absoluteMediaUrl("https://cdn.example.com/photo.png", API_URL),
    ).toBe("https://cdn.example.com/photo.png");
    expect(absoluteMediaUrl("", API_URL)).toBe("");
    expect(absoluteMediaUrl("/media/users/12/avatar/photo.png", "")).toBe(
      "/media/users/12/avatar/photo.png",
    );
  });
});

describe("withBrowserAvatar", () => {
  it("rewrites a relative avatar and leaves other users alone", () => {
    expect(
      withBrowserAvatar({
        id: 12,
        avatar_url: "/media/users/12/avatar/photo.png",
      }),
    ).toMatchObject({
      avatar_url: expect.stringMatching(/\/media\/users\/12\/avatar\/photo\.png$/),
    });

    expect(withBrowserAvatar({ id: 12, avatar_url: "" })).toEqual({
      id: 12,
      avatar_url: "",
    });
  });
});
