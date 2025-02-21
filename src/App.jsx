import Home from "./pages/Home.jsx"
import AISearch from "./pages/AISearch.jsx"
import Actors from "./pages/Actors.jsx"
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/ai-search" element={<AISearch/>}/>
        <Route path="/actors" element={<Actors/>}/>
      </Routes>
    </div>
  );
};
export default App;