import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from './Links';
import './IosApps.css';

interface IosApp {
  name: string;
  description: string;
  githubUrl: string;
  iconUrl: string;
  screenshots: string[];
}

const apps: IosApp[] = [
  {
    name: 'Multi-Calc',
    description: 'A calculator app that does graphing, calculus, trigonometry, unit conversions, and more',
    githubUrl: 'https://github.com/ldanilek/Multi-Calc',
    iconUrl: '/ios_images/icons/multi-calc.png',
    screenshots: [
      '/ios_images/screenshots/multi-calc/home.PNG',
      '/ios_images/screenshots/multi-calc/extrema.png',
      '/ios_images/screenshots/multi-calc/expressions.png',
      '/ios_images/screenshots/multi-calc/triangle-solver.png',
      '/ios_images/screenshots/multi-calc/graph.PNG',
      '/ios_images/screenshots/multi-calc/unit-conversion.png',
    ]
  },
  {
    name: 'Color Identify',
    description: 'Identify color names, for the colorblind like me',
    githubUrl: 'https://github.com/ldanilek/Color-ID',
    iconUrl: '/ios_images/icons/color-id.png',
    screenshots: [
      '/ios_images/screenshots/color-id/marker.PNG',
      '/ios_images/screenshots/color-id/puppy.jpg',
      '/ios_images/screenshots/color-id/about-color.png',
    ]
  },
  {
    name: 'CO2 Footprint',
    description: 'Calculate and track your carbon footprint with detailed breakdowns',
    githubUrl: 'https://github.com/ldanilek/CO2-Footprint',
    iconUrl: '/ios_images/icons/co2-footprint.png',
    screenshots: [
      '/ios_images/screenshots/co2-footprint/extrapolation.PNG',
      '/ios_images/screenshots/co2-footprint/input.PNG',
      '/ios_images/screenshots/co2-footprint/improvements.PNG',
    ]
  },
  {
    name: 'Lazer-Maze',
    description: 'A puzzle game where you guide laser beams through mazes using mirrors and prisms',
    githubUrl: 'https://github.com/leedanilek/lazer-maze-ios',
    iconUrl: '/ios_images/icons/lazer-maze.png',
    screenshots: [
      '/ios_images/screenshots/lazer-maze/complex-level.PNG',
      '/ios_images/screenshots/lazer-maze/instructions.PNG',
      '/ios_images/screenshots/lazer-maze/menu.png',
    ]
  },
  {
    name: 'Hangmaner',
    description: 'A unique take on the classic Hangman game with multiple categories and difficulty levels',
    githubUrl: 'https://github.com/leedanilek/hangmaner-ios',
    iconUrl: '/ios_images/icons/hangmaner.png',
    screenshots: [
      '/ios_images/screenshots/hangmaner-1.png',
      '/ios_images/screenshots/hangmaner-2.png'
    ]
  },
  {
    name: 'BloodBot',
    description: 'Track and analyze blood glucose levels with smart insights and trends',
    githubUrl: 'https://github.com/leedanilek/bloodbot-ios',
    iconUrl: '/ios_images/icons/bloodbot.png',
    screenshots: [
      '/ios_images/screenshots/bloodbot-1.png',
      '/ios_images/screenshots/bloodbot-2.png'
    ]
  },
  {
    name: 'PhysError',
    description: 'Calculate and propagate uncertainties in physics measurements and calculations',
    githubUrl: 'https://github.com/leedanilek/physerror-ios',
    iconUrl: '/ios_images/icons/physerror.png',
    screenshots: [
      '/ios_images/screenshots/physerror-1.png',
      '/ios_images/screenshots/physerror-2.png'
    ]
  }
];

const AppCard: React.FC<{ app: IosApp }> = ({ app }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update currentIndex when scrolling
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const scrollPosition = scrollElement.scrollLeft;
      const itemWidth = scrollElement.clientWidth;
      const newIndex = Math.round(scrollPosition / itemWidth);
      setCurrentIndex(newIndex);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  return (
    <div className="app-card">
      <div className="app-header">
        <div className="app-header-main">
          <img src={app.iconUrl} alt={`${app.name} icon`} className="app-icon" />
          <h3>{app.name}</h3>
        </div>
        <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="github-link" aria-label="View on GitHub">
          <GitHubIcon />
        </a>
      </div>
      <p className="app-description">{app.description}</p>
      <div className="screenshots-container">
        <div className="screenshots-scroll" ref={scrollRef}>
          {app.screenshots.map((screenshot) => (
            <Screenshot key={screenshot} screenshot={screenshot} name={app.name} />
          ))}
        </div>
        {app.screenshots.length > 1 && (
          <div className="screenshot-dots">
            {app.screenshots.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'dot-active' : ''}`}
                onClick={() => scrollToIndex(index)}
                aria-label={`View screenshot ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Screenshot: React.FC<{ screenshot: string, name: string }> = ({ screenshot, name }) => {
  return (
    <div className="screenshot-container">
      <img src={screenshot} alt={`${name} screenshot`} className="app-screenshot" />
    </div>
  );
};

const IosApps: React.FC = () => {
  return (
    <div className="ios-apps">
      <header className="ios-apps-header">
        <Link to="/">
          <h1>Lee Danilek</h1>
        </Link>
      </header>
      <h2>iOS Apps</h2>
      <p className="ios-apps-intro">
        A collection of iOS apps I developed between 2012-2016. While these apps are no longer available on the App Store,
        you can explore their source code on GitHub.
      </p>
      
      <div className="apps-grid">
        {apps.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </div>
    </div>
  );
};

export default IosApps; 