import { getCollection } from "astro:content";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPosts, sortByPublishDate } from "../repositories/posts";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

const createTestPost = (publishDate: string, title: string) => ({
  data: { publishDate: new Date(publishDate), title, tags: [] },
  id: title.toLowerCase().replace(/\s+/g, "-"),
});

describe("sortByPublishDate", () => {
  describe("Positive Cases", () => {
    it("should sort posts by publish date in descending order", () => {
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-15", "Second Post");
      const post3 = createTestPost("2023-01-10", "Third Post");
      const posts = [post1, post2, post3];

      const sortedPosts = posts.sort(sortByPublishDate);

      expect(sortedPosts[0].data.title).toBe("Second Post");
      expect(sortedPosts[1].data.title).toBe("Third Post");
      expect(sortedPosts[2].data.title).toBe("First Post");
    });
  });

  describe("Edge Cases", () => {
    it("should handle posts with same publish date", () => {
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-01", "Second Post");
      const posts = [post1, post2];

      const sortedPosts = posts.sort(sortByPublishDate);

      expect(sortedPosts).toHaveLength(2);
      expect(sortedPosts[0].data.publishDate.getTime()).toBe(
        sortedPosts[1].data.publishDate.getTime(),
      );
    });

    it("should handle single post", () => {
      const post = createTestPost("2023-01-01", "Single Post");
      const posts = [post];

      const sortedPosts = posts.sort(sortByPublishDate);

      expect(sortedPosts).toHaveLength(1);
      expect(sortedPosts[0].data.title).toBe("Single Post");
    });

    it("should handle empty array", () => {
      const posts: ReturnType<typeof createTestPost>[] = [];

      const sortedPosts = posts.sort(sortByPublishDate);

      expect(sortedPosts).toHaveLength(0);
    });

    it("should handle timezone correctly with cdateJST", () => {
      const post1 = createTestPost("2023-01-01T10:00:00+09:00", "JST Morning");
      const post2 = createTestPost(
        "2023-01-01T01:00:00Z",
        "UTC Morning (JST 10:00)",
      );
      const posts = [post1, post2];

      const sortedPosts = posts.sort(sortByPublishDate);

      expect(sortedPosts).toHaveLength(2);
    });
  });
});

describe("getPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Positive Cases", () => {
    it("should return posts sorted by publish date in descending order", async () => {
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-15", "Second Post");
      const post3 = createTestPost("2023-01-10", "Third Post");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getCollection).mockResolvedValue([post1, post2, post3] as any);

      const result = await getPosts();

      expect(result[0].data.title).toBe("Second Post");
      expect(result[1].data.title).toBe("Third Post");
      expect(result[2].data.title).toBe("First Post");
    });

    it("should call getCollection with 'posts'", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getCollection).mockResolvedValue([] as any);

      await getPosts();

      expect(getCollection).toHaveBeenCalledWith("posts");
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array when no posts", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getCollection).mockResolvedValue([] as any);

      const result = await getPosts();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle single post", async () => {
      const post = createTestPost("2023-01-01", "Single Post");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getCollection).mockResolvedValue([post] as any);

      const result = await getPosts();

      expect(result).toHaveLength(1);
      expect(result[0].data.title).toBe("Single Post");
    });
  });
});
