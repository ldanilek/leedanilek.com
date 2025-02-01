import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from './Links';
import './IosApps.css';
import { api } from '../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

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
    description: 'Calculate personal carbon footprint',
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
    description: 'Puzzle game of lasers and mirrors',
    githubUrl: 'https://github.com/ldanilek/Lazer-Maze',
    iconUrl: '/ios_images/icons/lazer-maze.png',
    screenshots: [
      '/ios_images/screenshots/lazer-maze/complex-level.PNG',
      '/ios_images/screenshots/lazer-maze/mirror-instructions.png',
      '/ios_images/screenshots/lazer-maze/menu.png',
    ]
  },
  {
    name: 'Hangmaner',
    description: 'App for identifying the best next hangman guess',
    githubUrl: 'https://github.com/ldanilek/Hangmaner',
    iconUrl: '/ios_images/icons/hangmaner.png',
    screenshots: [
      '/ios_images/screenshots/hangmaner/blockadingDvorak.png',
      '/ios_images/screenshots/hangmaner/newGameCalendar.png',
      '/ios_images/screenshots/hangmaner/probablydvorak.png',
    ]
  },
  {
    name: 'BloodBot',
    description: 'Game where you drive a robot around cleaning up a bloodstream of diseases',
    githubUrl: 'https://github.com/ldanilek/BloodBot',
    iconUrl: '/ios_images/icons/bloodbot.png',
    screenshots: [
      '/ios_images/screenshots/bloodbot/game.png',
      '/ios_images/screenshots/bloodbot/game1.png',
    ]
  },
  {
    name: 'PhysError',
    description: 'Propagating error bounds through physics equations',
    githubUrl: 'https://github.com/ldanilek/PhysError',
    iconUrl: '/ios_images/icons/physerror.png',
    screenshots: [
      '/ios_images/screenshots/physerror/calculation.png',
      '/ios_images/screenshots/physerror/withvariables.png'
    ]
  },
  {
    name: 'Play Turing',
    description: 'Puzzle game where you write rules for a Turing machine',
    githubUrl: 'https://github.com/ldanilek/Play-Turing',
    iconUrl: '/ios_images/icons/play-turing.png',
    screenshots: [
      '/ios_images/screenshots/play-turing/xor.png',
      '/ios_images/screenshots/play-turing/binaryadd1.png',
      '/ios_images/screenshots/play-turing/levels.png'
    ]
  }
];

const AppCard: React.FC<{ app: IosApp }> = ({ app }) => {
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
      <ScreenshotContainer screenshots={app.screenshots} name={app.name} />     
    </div>
  );
};

const ScreenshotContainer: React.FC<{
  screenshots: string[],
  name: string,
}> = ({ screenshots, name }) => {
  const persistedSelectedScreenshot = useQuery(api.ios.getSelectedScreenshot, { appName: name });
  const updatePersistedSelectedScreenshot = useMutation(api.ios.setSelectedScreenshot);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCurrentIndex, setActiveCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update currentIndex when scrolling
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const computeCurrentIndex = () => {
      const scrollPosition = scrollElement.scrollLeft;
      const itemWidth = scrollElement.clientWidth;
      return Math.round(scrollPosition / itemWidth);
    };

    const handleScrollEnd = () => {
      setCurrentIndex(computeCurrentIndex());
    };
    const handleScroll = () => {
      setActiveCurrentIndex(computeCurrentIndex());
    };

    scrollElement.addEventListener('scrollend', handleScrollEnd);
    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scrollend', handleScrollEnd);
      scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [scrollRef.current]);

  // If someone else selects a different screenshot, scroll to it
  useEffect(() => {
    if (persistedSelectedScreenshot) {
      const persistedIndex = screenshots.indexOf(persistedSelectedScreenshot);
      if (persistedIndex !== currentIndex) {
        scrollToIndex(persistedIndex);
      }
    }
  }, [persistedSelectedScreenshot]);

  // If we select a new screenshot, update the persisted screenshot
  useEffect(() => {
    if (persistedSelectedScreenshot !== undefined) {
      const persistedIndex = persistedSelectedScreenshot ? screenshots.indexOf(persistedSelectedScreenshot) : 0;
      if (persistedIndex !== currentIndex) {
        void updatePersistedSelectedScreenshot({ appName: name, selectedScreenshot: screenshots[currentIndex] });
      }
    }
  }, [currentIndex]);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="screenshots-container">
      <div className="screenshots-scroll" ref={scrollRef}>
        {screenshots.map((screenshot) => (
          <Screenshot key={screenshot} screenshot={screenshot} name={name} />
        ))}
      </div>
      {screenshots.length > 1 && (
        <div className="screenshot-dots">
          {screenshots.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeCurrentIndex ? 'dot-active' : ''}`}
              onClick={() => scrollToIndex(index)}
              aria-label={`View screenshot ${index + 1}`}
            />
          ))}
        </div>
      )}
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
        A collection of iOS apps I developed under the name "Ship Shape Apps" between 2011-2017. While these apps are no longer available on the App Store,
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