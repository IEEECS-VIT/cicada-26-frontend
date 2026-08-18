import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './Components/Footer/Footer';
import AdminDashboard from './Components/Admin/AdminDashboard';
import Terminal from './Components/Terminal/Terminal';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#131313] text-[#e5e2e1] font-mono min-h-screen">
        <main>
          <Routes>
            <Route path="/" element={<Footer />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/terminal" element={<Terminal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
