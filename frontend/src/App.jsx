import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';

const apiUrl = import.meta.env.VITE_API_URL || '';

/**
 * App — Root component that sets up client-side routing.
 * We use BrowserRouter for clean URLs (no hash fragments).
 */
function App() {
  useEffect(() => {
    // Only count as a new visit if the session is new
    // sessionStorage persists only as long as the tab is open
    if (!sessionStorage.getItem('visited')) {
      fetch(`${apiUrl}/api/track-visit`, { method: 'POST' })
        .then(response => {
          if (response.ok) {
            sessionStorage.setItem('visited', 'true');
          }
        })
        .catch(() => {
          // Silently fail if tracking fails, no need to alert the user
        });
    }
  }, []);
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
