import Home from "./pages/Home.jsx"
import AISearch from "./pages/AISearch.jsx"
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/ai-search" element={<AISearch/>}/>
      </Routes>
    </div>
  );
};
export default App;