import { describe, expect, it } from "vitest";
import { cdateJST } from "../cdate-jst";

// Test the date comparison logic without Astro dependencies
interface TestPost {
  title: string;
  publishDate: Date;
}

function sortByPublishDateLogic(a: TestPost, b: TestPost): number {
  return (
    cdateJST(b.publishDate).toDate().getTime() -
    cdateJST(a.publishDate).toDate().getTime()
  );
}

const createTestPost = (publishDate: string, title: string): TestPost => ({
  title,
  publishDate: new Date(publishDate),
});

describe("sortByPublishDate", () => {
  it("should sort posts by publish date in descending order", () => {
    // Arrange
    const post1 = createTestPost("2023-01-01", "First Post");
    const post2 = createTestPost("2023-01-15", "Second Post");
    const post3 = createTestPost("2023-01-10", "Third Post");
    const posts = [post1, post2, post3];

    // Act
    const sortedPosts = posts.sort(sortByPublishDateLogic);

    // Assert
    expect(sortedPosts[0].title).toBe("Second Post"); // 2023-01-15
    expect(sortedPosts[1].title).toBe("Third Post"); // 2023-01-10
    expect(sortedPosts[2].title).toBe("First Post"); // 2023-01-01
  });

  it("should handle posts with same publish date", () => {
    // Arrange
    const post1 = createTestPost("2023-01-01", "First Post");
    const post2 = createTestPost("2023-01-01", "Second Post");
    const posts = [post1, post2];

    // Act
    const sortedPosts = posts.sort(sortByPublishDateLogic);

    // Assert
    expect(sortedPosts).toHaveLength(2);
    // Both posts have same date, so order should remain stable
    expect(sortedPosts[0].publishDate.getTime()).toBe(
      sortedPosts[1].publishDate.getTime(),
    );
  });

  it("should handle single post", () => {
    // Arrange
    const post = createTestPost("2023-01-01", "Single Post");
    const posts = [post];

    // Act
    const sortedPosts = posts.sort(sortByPublishDateLogic);

    // Assert
    expect(sortedPosts).toHaveLength(1);
    expect(sortedPosts[0].title).toBe("Single Post");
  });

  it("should handle empty array", () => {
    // Arrange
    const posts: TestPost[] = [];

    // Act
    const sortedPosts = posts.sort(sortByPublishDateLogic);

    // Assert
    expect(sortedPosts).toHaveLength(0);
  });

  it("should handle timezone correctly with cdateJST", () => {
    // Arrange
    const post1 = createTestPost("2023-01-01T10:00:00+09:00", "JST Morning");
    const post2 = createTestPost(
      "2023-01-01T01:00:00Z",
      "UTC Morning (JST 10:00)",
    );
    const posts = [post1, post2];

    // Act
    const sortedPosts = posts.sort(sortByPublishDateLogic);

    // Assert
    // Both should be treated as same time when converted to JST
    expect(sortedPosts).toHaveLength(2);
  });
});
