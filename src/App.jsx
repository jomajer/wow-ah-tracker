// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ItemPrice from "./components/ItemPrice";
import MidnightTailoring from "./pages/MidnightTailoring";
import TailoringRecipes from "./pages/TailoringRecipes";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          AH Tracker
        </Link>
        <Link to="/midnight-tailoring" style={{ marginRight: "1rem" }}>
          Materijali
        </Link>
        <Link to="/tailoring-recipes">
          Tailoring recepti
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<ItemPrice />} />
        <Route path="/item/:itemId" element={<ItemPrice />} />
        <Route path="/midnight-tailoring" element={<MidnightTailoring />} />
        <Route path="/tailoring-recipes" element={<TailoringRecipes />} />
      </Routes>
    </BrowserRouter>
  );
}