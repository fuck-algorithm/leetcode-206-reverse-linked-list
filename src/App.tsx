import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Navbar from './components/Navbar';
import IterativePage from './pages/IterativePage';
import RecursivePage from './pages/RecursivePage';
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
          </Routes>
          <WechatGroupFloat />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
