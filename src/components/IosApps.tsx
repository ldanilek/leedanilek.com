import React from 'react';
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
    description: 'Identify colors in real-time using your camera and get their RGB/HSV values',
    githubUrl: 'https://github.com/leedanilek/color-identify-ios',
    iconUrl: '/ios_images/icons/color-identify.png',
    screenshots: [
      '/ios_images/screenshots/color-identify-1.png',
      '/ios_images/screenshots/color-identify-2.png'
    ]
  },
  {
    name: 'CO2 Footprint',
    description: 'Calculate and track your carbon footprint with detailed breakdowns',
    githubUrl: 'https://github.com/leedanilek/co2-footprint-ios',
    iconUrl: '/ios_images/icons/co2-footprint.png',
    screenshots: [
      '/ios_images/screenshots/co2-footprint-1.png',
      '/ios_images/screenshots/co2-footprint-2.png'
    ]
  },
  {
    name: 'Lazer-Maze',
    description: 'A puzzle game where you guide laser beams through mazes using mirrors and prisms',
    githubUrl: 'https://github.com/leedanilek/lazer-maze-ios',
    iconUrl: '/ios_images/icons/lazer-maze.png',
    screenshots: [
      '/ios_images/screenshots/lazer-maze-1.png',
      '/ios_images/screenshots/lazer-maze-2.png'
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

const IosApps: React.FC = () => {
  return (
    <div className="ios-apps">
      <h2>iOS Apps</h2>
      <p className="ios-apps-intro">
        A collection of iOS apps I developed between 2012-2016. While these apps are no longer available on the App Store,
        you can explore their source code on GitHub.
      </p>
      
      <div className="apps-grid">
        {apps.map((app) => (
          <div key={app.name} className="app-card">
            <div className="app-header">
              <img src={app.iconUrl} alt={`${app.name} icon`} className="app-icon" />
              <h3>{app.name}</h3>
            </div>
            <p className="app-description">{app.description}</p>
            <div className="screenshots-container">
              <div className="screenshots-scroll">
                {app.screenshots.map((screenshot, index) => (
                  <img 
                    key={index}
                    src={screenshot} 
                    alt={`${app.name} screenshot ${index + 1}`} 
                    className="app-screenshot"
                  />
                ))}
              </div>
              {app.screenshots.length > 1 && (
                <div className="screenshot-dots">
                  {app.screenshots.map((_, index) => (
                    <span key={index} className="dot" />
                  ))}
                </div>
              )}
            </div>
            <div className="app-links">
              <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="github-link">
                View on GitHub
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IosApps; 