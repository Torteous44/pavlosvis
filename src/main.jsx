import { render } from 'preact'
import './index.css'
import { App } from './app.jsx'

// Preload critical assets
const preloadAssets = () => {
  // Preload hero image
  const imageLink = document.createElement('link');
  imageLink.rel = 'preload';
  imageLink.href = '/assets/hero.avif';
  imageLink.as = 'image';
  imageLink.type = 'image/avif';
  document.head.appendChild(imageLink);
  
  // Preload font files
  const fontPaths = [
    '/assets/fonts/TestSöhne/TestSöhne-Buch.otf',
    '/assets/fonts/TestSöhne/TestSöhne-Halbfett.otf',
    '/assets/fonts/TestSöhne/TestSöhne-Kräftig.otf'
  ];
  
  fontPaths.forEach(fontPath => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = fontPath;
    fontLink.as = 'font';
    fontLink.type = 'font/otf';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
  });
};

// Execute preload
preloadAssets();

render(<App />, document.getElementById('app'))
