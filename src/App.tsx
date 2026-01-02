import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Navbar from './components/Navbar';
import IterativePage from './pages/IterativePage';
import RecursivePage from './pages/RecursivePage';
import CycleDetectionPage from './pages/CycleDetectionPage';
import WechatGroupFloat from './components/WechatGroupFloat';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename="/leetcode-206-reverse-linked-list">
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/iterative" replace />} />
            <Route path="/iterative" element={<IterativePage />} />
            <Route path="/recursive" element={<RecursivePage />} />
            <Route path="/cycle-detection" element={<CycleDetectionPage />} />
          </Routes>
          <WechatGroupFloat />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
