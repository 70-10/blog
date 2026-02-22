/* eslint-disable @typescript-eslint/no-explicit-any */
import rss from "@astrojs/rss";
import { marked } from "marked";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPosts } from "../lib/repositories/posts";
import { GET } from "./rss.xml";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));
vi.mock("../lib/repositories/posts");
vi.mock("marked", () => ({
  marked: {
    parse: vi.fn((text: string) => `<p>${text}</p>`),
  },
}));
vi.mock("@astrojs/rss", () => ({
  default: vi.fn(() => new Response("rss xml")),
}));

describe("GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Positive Cases", () => {
    it("should map posts to RSS items correctly", async () => {
      vi.mocked(getPosts).mockResolvedValue([
        {
          id: "post-1",
          data: {
            title: "Post 1",
            publishDate: new Date("2024-01-01"),
            tags: [],
          },
          body: "body 1",
        },
        {
          id: "post-2",
          data: {
            title: "Post 2",
            publishDate: new Date("2024-01-02"),
            tags: [],
          },
          body: "body 2",
        },
      ] as any);

      const context = { site: new URL("https://example.com") } as any;
      await GET(context);

      expect(rss).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Blog",
          description: "Blog written by 70_10",
          site: "https://example.com/",
          items: expect.arrayContaining([
            expect.objectContaining({
              title: "Post 1",
              link: "/posts/post-1",
            }),
          ]),
        }),
      );
    });

    it("should use context.site correctly", async () => {
      vi.mocked(getPosts).mockResolvedValue([] as any);
      const context = { site: new URL("https://blog.example.com") } as any;
      await GET(context);
      expect(rss).toHaveBeenCalledWith(
        expect.objectContaining({
          site: "https://blog.example.com/",
        }),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined context.site", async () => {
      vi.mocked(getPosts).mockResolvedValue([] as any);
      const context = { site: undefined } as any;
      await GET(context);
      expect(rss).toHaveBeenCalledWith(
        expect.objectContaining({
          site: "",
        }),
      );
    });

    it("should handle post with undefined body", async () => {
      vi.mocked(getPosts).mockResolvedValue([
        {
          id: "post-1",
          data: {
            title: "Post 1",
            publishDate: new Date("2024-01-01"),
            tags: [],
          },
          body: undefined,
        },
      ] as any);
      const context = { site: new URL("https://example.com") } as any;
      await GET(context);
      expect(marked.parse).toHaveBeenCalledWith("");
    });

    it("should handle empty posts array", async () => {
      vi.mocked(getPosts).mockResolvedValue([] as any);
      const context = { site: new URL("https://example.com") } as any;
      await GET(context);
      expect(rss).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        }),
      );
    });
  });
});
