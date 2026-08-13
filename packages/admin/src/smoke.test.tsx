// @vitest-environment jsdom
// T0: packages/admin のテストが本体の vitest 設定で動くことを確かめるための使い捨て。
// 通ることを確かめたら消す（test-design/test-cases.md の T0）。
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

function Hello({ name }: { name: string }) {
  return <p>hello {name}</p>;
}

describe("smoke", () => {
  describe("Positive Cases", () => {
    it("should render a tsx component under jsdom", async () => {
      // Arrange
      const container = document.createElement("div");
      document.body.append(container);

      // Act
      await act(async () => {
        createRoot(container).render(<Hello name="admin" />);
      });

      // Assert
      expect(container.textContent).toBe("hello admin");
    });
  });
});
