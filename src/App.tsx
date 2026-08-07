import { Analytics } from "@vercel/analytics/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import About from "./components/About";
import Links from "./components/Links";
import Projects from "./components/Projects";
import ReadingList from "./components/ReadingList";
import TideChart from './components/TideChart';
import IosApps from './components/IosApps';
import "./App.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function MainContent() {
  return (
    <>
      <Header />
      <main className="bodydiv">
        <About />
        <Links />
        <Projects />
        <ReadingList />
      </main>
    </>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/tide.py" element={<TideChart />} />
          <Route path="/ios" element={<IosApps />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </ConvexProvider>
  );
}

export default App;
