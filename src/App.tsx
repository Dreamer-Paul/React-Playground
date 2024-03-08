import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import DragStaticPanel from "@/pages/DragStaticPanel";
import DragButton from "@/pages/DragButton";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drag-static-panel" element={<DragStaticPanel />} />
        <Route path="/drag-button" element={<DragButton />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
