import { getCollection } from "astro:content";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPosts, sortByPublishDate } from "../repositories/posts";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

type Posts = Awaited<ReturnType<typeof getCollection>>;

const createTestPost = (publishDate: string, title: string) => ({
  data: { publishDate: new Date(publishDate), title, tags: [] },
  id: title.toLowerCase().replace(/\s+/g, "-"),
});

describe("sortByPublishDate", () => {
  describe("Positive Cases", () => {
    it("should sort posts by publish date in descending order", () => {
      // Arrange
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-15", "Second Post");
      const post3 = createTestPost("2023-01-10", "Third Post");
      const posts = [post1, post2, post3];

      // Act
      const sortedPosts = posts.sort(sortByPublishDate);

      // Assert
      expect(sortedPosts[0].data.title).toBe("Second Post");
      expect(sortedPosts[1].data.title).toBe("Third Post");
      expect(sortedPosts[2].data.title).toBe("First Post");
    });
  });

  describe("Edge Cases", () => {
    it("should handle posts with same publish date", () => {
      // Arrange
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-01", "Second Post");
      const posts = [post1, post2];

      // Act
      const sortedPosts = posts.sort(sortByPublishDate);

      // Assert
      expect(sortedPosts).toHaveLength(2);
      expect(sortedPosts[0].data.publishDate.getTime()).toBe(
        sortedPosts[1].data.publishDate.getTime(),
      );
    });

    it("should handle single post", () => {
      // Arrange
      const post = createTestPost("2023-01-01", "Single Post");
      const posts = [post];

      // Act
      const sortedPosts = posts.sort(sortByPublishDate);

      // Assert
      expect(sortedPosts).toHaveLength(1);
      expect(sortedPosts[0].data.title).toBe("Single Post");
    });

    it("should handle empty array", () => {
      // Arrange
      const posts: ReturnType<typeof createTestPost>[] = [];

      // Act
      const sortedPosts = posts.sort(sortByPublishDate);

      // Assert
      expect(sortedPosts).toHaveLength(0);
    });

    it("should sort posts with different timezone representations correctly", () => {
      // Arrange
      const postJST = createTestPost(
        "2023-01-01T10:00:00+09:00",
        "JST Morning",
      );
      const postUTC = createTestPost("2023-01-02T10:00:00Z", "UTC Next Day");
      const posts = [postJST, postUTC];

      // Act
      const sortedPosts = posts.sort(sortByPublishDate);

      // Assert
      expect(sortedPosts[0].data.title).toBe("UTC Next Day");
      expect(sortedPosts[1].data.title).toBe("JST Morning");
    });
  });
});

describe("getPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Positive Cases", () => {
    it("should return posts sorted by publish date in descending order", async () => {
      // Arrange
      const post1 = createTestPost("2023-01-01", "First Post");
      const post2 = createTestPost("2023-01-15", "Second Post");
      const post3 = createTestPost("2023-01-10", "Third Post");
      vi.mocked(getCollection).mockResolvedValue([
        post1,
        post2,
        post3,
      ] as unknown as Posts);

      // Act
      const result = await getPosts();

      // Assert
      expect(result[0].data.title).toBe("Second Post");
      expect(result[1].data.title).toBe("Third Post");
      expect(result[2].data.title).toBe("First Post");
    });

    it("should call getCollection with 'posts'", async () => {
      // Arrange
      vi.mocked(getCollection).mockResolvedValue([] as unknown as Posts);

      // Act
      await getPosts();

      // Assert
      expect(getCollection).toHaveBeenCalledWith("posts");
    });
  });

  describe("Edge Cases", () => {
    it("should return empty array when no posts", async () => {
      // Arrange
      vi.mocked(getCollection).mockResolvedValue([] as unknown as Posts);

      // Act
      const result = await getPosts();

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle single post", async () => {
      // Arrange
      const post = createTestPost("2023-01-01", "Single Post");
      vi.mocked(getCollection).mockResolvedValue([post] as unknown as Posts);

      // Act
      const result = await getPosts();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].data.title).toBe("Single Post");
    });
  });
});
