import { Link, Route, Routes } from "react-router";
import { DraftEditorPage } from "./routes/DraftEditorPage";
import { DraftListPage } from "./routes/DraftListPage";

export function App() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
      <header>
        <Link to="/" className="font-bold">
          下書き
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<DraftListPage />} />
          {/* /drafts/new は識別子なしで開く。最初の保存で URL が差し替わる */}
          <Route path="/drafts/new" element={<DraftEditorPage />} />
          <Route path="/drafts/:id" element={<DraftEditorPage />} />
        </Routes>
      </main>
    </div>
  );
}
