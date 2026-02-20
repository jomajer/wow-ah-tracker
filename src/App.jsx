// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ItemPrice from "./components/ItemPrice";
import MidnightTailoring from "./pages/MidnightTailoring";

export default function App() {
  return (
   <BrowserRouter>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Arathor Spear Tracker</Link>
        <Link to="/midnight-tailoring">Midnight Tailoring</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ItemPrice />} />
        <Route path="/item/:itemId" element={<ItemPrice />} />   {/* novo */}
        <Route path="/midnight-tailoring" element={<MidnightTailoring />} />
      </Routes>
    </BrowserRouter>
  );
}

