import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Home";
import DragStaticPanel from "@/pages/DragStaticPanel";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/drag-static-panel" element={<DragStaticPanel />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
