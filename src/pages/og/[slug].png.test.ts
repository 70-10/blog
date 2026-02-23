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

type Post = {
  id: string;
  data: { title: string; publishDate: Date; tags: string[] };
};

type GetEntryResult = {
  data: { title: string };
};

type OgAPIContext = {
  params: { slug: string | undefined };
};

describe("getStaticPaths", () => {
  describe("Positive Cases", () => {
    it("should return all post slugs as params", async () => {
      // Arrange
      vi.mocked(getPosts).mockResolvedValue([
        {
          id: "post-1",
          data: { title: "Post 1", publishDate: new Date(), tags: [] },
        },
        {
          id: "post-2",
          data: { title: "Post 2", publishDate: new Date(), tags: [] },
        },
      ] as unknown as Post[]);

      // Act
      const result = await getStaticPaths();

      // Assert
      expect(result).toEqual([
        { params: { slug: "post-1" } },
        { params: { slug: "post-2" } },
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array when no posts", async () => {
      // Arrange
      vi.mocked(getPosts).mockResolvedValue([] as unknown as Post[]);

      // Act
      const result = await getStaticPaths();

      // Assert
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
      // Arrange
      const { getEntry } = await import("astro:content");
      vi.mocked(getEntry).mockResolvedValue({
        data: { title: "Test Post" },
      } as unknown as GetEntryResult);
      vi.mocked(getOgImage).mockResolvedValue(Buffer.from("fake-png"));

      // Act
      const response = await GET({
        params: { slug: "test-post" },
      } as unknown as OgAPIContext);

      // Assert
      expect(response.headers.get("Content-Type")).toBe("image/png");
    });
  });

  describe("Negative Cases", () => {
    it("should return 404 when shouldSkipOgGeneration is true", async () => {
      // Arrange
      vi.resetModules();
      vi.doMock("@/lib/environments", () => ({
        isProduction: false,
        shouldSkipOgGeneration: true,
      }));
      const { GET: GET2 } = await import("./[slug].png");

      // Act
      const response = await GET2({
        params: { slug: "test-post" },
      } as unknown as OgAPIContext);

      // Assert
      expect(response.status).toBe(404);
    });

    it("should throw error when slug is undefined", async () => {
      // Act & Assert
      await expect(
        GET({ params: { slug: undefined } } as unknown as OgAPIContext),
      ).rejects.toThrow("Slug not found");
    });

    it("should throw error when slug is empty string", async () => {
      // Act & Assert
      await expect(
        GET({ params: { slug: "" } } as unknown as OgAPIContext),
      ).rejects.toThrow("Slug not found");
    });
  });
});
