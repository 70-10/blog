import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Login } from "./pages/Login";
import { PostEditor } from "./pages/PostEditor";
import { PostList } from "./pages/PostList";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/new" element={<PostEditor mode="new" />} />
        <Route path="/posts/:slug" element={<PostEditor mode="edit" />} />
        <Route path="*" element={<Navigate to="/posts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
