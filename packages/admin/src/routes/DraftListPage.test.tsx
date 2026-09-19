// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../lib/api";
import { DraftListPage, UNTITLED } from "./DraftListPage";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function render() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <DraftListPage />
      </MemoryRouter>,
    );
  });
}

function titles() {
  return [...container.querySelectorAll("li span")].map(
    (node) => node.textContent,
  );
}

beforeEach(() => {
  vi.spyOn(api, "listDrafts");
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("DraftListPage", () => {
  describe("Positive Cases", () => {
    it("should list drafts newest first", async () => {
      // Arrange
      vi.mocked(api.listDrafts).mockResolvedValue([
        { id: "a", title: "新しい", updatedAt: "2026-08-13T00:00:00.000Z" },
        { id: "b", title: "中くらい", updatedAt: "2026-08-05T00:00:00.000Z" },
        { id: "c", title: "古い", updatedAt: "2026-08-01T00:00:00.000Z" },
      ]);

      // Act
      await render();

      // Assert
      expect(titles()).toEqual(["新しい", "中くらい", "古い"]);
    });
  });

  describe("Edge Cases", () => {
    it("should show a placeholder for a draft without a title", async () => {
      // Arrange
      vi.mocked(api.listDrafts).mockResolvedValue([
        { id: "a", title: "", updatedAt: "2026-08-13T00:00:00.000Z" },
      ]);

      // Act
      await render();

      // Assert
      expect(titles()).toEqual([UNTITLED]);
    });

    it("should show an empty state when there is no draft", async () => {
      // Arrange
      vi.mocked(api.listDrafts).mockResolvedValue([]);

      // Act
      await render();

      // Assert
      expect(container.textContent).toContain("下書きはありません");
      expect(container.querySelector("li")).toBeNull();
    });
  });
});
