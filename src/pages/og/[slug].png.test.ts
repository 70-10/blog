/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOgImage } from "@/components/OgpImage";
import { getPosts } from "@/lib/repositories/posts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, getStaticPaths } from "./[slug].png";

vi.mock("@/lib/repositories/posts");
vi.mock("@/components/OgpImage");
vi.mock("astro:content", () => ({
  getEntry: vi.fn(),
}));
vi.mock("@/lib/environments", () => ({
  isProduction: false,
  shouldSkipOgGeneration: false,
}));

describe("getStaticPaths", () => {
  describe("Positive Cases", () => {
    it("should return all post slugs as params", async () => {
      vi.mocked(getPosts).mockResolvedValue([
        {
          id: "post-1",
          data: { title: "Post 1", publishDate: new Date(), tags: [] },
        },
        {
          id: "post-2",
          data: { title: "Post 2", publishDate: new Date(), tags: [] },
        },
      ] as any);
      const result = await getStaticPaths();
      expect(result).toEqual([
        { params: { slug: "post-1" } },
        { params: { slug: "post-2" } },
      ]);
    });
  });
  describe("Edge Cases", () => {
    it("should return empty array when no posts", async () => {
      vi.mocked(getPosts).mockResolvedValue([] as any);
      const result = await getStaticPaths();
      expect(result).toEqual([]);
    });
  });
});

describe("GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Positive Cases", () => {
    it("should return PNG response for valid slug", async () => {
      const { getEntry } = await import("astro:content");
      vi.mocked(getEntry).mockResolvedValue({
        data: { title: "Test Post" },
      } as any);
      vi.mocked(getOgImage).mockResolvedValue(Buffer.from("fake-png"));

      const response = await GET({ params: { slug: "test-post" } } as any);
      expect(response.headers.get("Content-Type")).toBe("image/png");
    });
  });

  describe("Negative Cases", () => {
    it("should throw error when slug is undefined", async () => {
      await expect(GET({ params: { slug: undefined } } as any)).rejects.toThrow(
        "Slug not found",
      );
    });

    it("should throw error when slug is empty string", async () => {
      await expect(GET({ params: { slug: "" } } as any)).rejects.toThrow(
        "Slug not found",
      );
    });
  });
});
