import { ConvexProvider, ConvexReactClient } from "convex/react";
import Header from "./components/Header";
import About from "./components/About";
import Links from "./components/Links";
import Projects from "./components/Projects";
import ReadingList from "./components/ReadingList";
import "./App.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function App() {
  return (
    <ConvexProvider client={convex}>
      <div>
        <Header />
        <main className="bodydiv">
          <About />
          <Links />
          <Projects />
          <ReadingList />
        </main>
      </div>
    </ConvexProvider>
  );
}

export default App;
