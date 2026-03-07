import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';

/**
 * App — Root component that sets up client-side routing.
 * We use BrowserRouter for clean URLs (no hash fragments).
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results/:username" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
