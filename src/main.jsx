import { render } from 'preact'
import './index.css'
import { App } from './app.jsx'

// Preload critical assets
const preloadAssets = () => {
  // Add meta tags for WebGL content
  const webglMeta = document.createElement('meta');
  webglMeta.name = 'hardware-accelerated';
  webglMeta.content = 'true';
  document.head.appendChild(webglMeta);

  // Preload Three.js library
  const threeJsPreload = document.createElement('link');
  threeJsPreload.rel = 'modulepreload';
  threeJsPreload.href = '/node_modules/three/build/three.module.js';
  document.head.appendChild(threeJsPreload);
  
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

  // Check for WebGL compatibility
  const checkWebGLCompatibility = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  // Add a class to the body based on WebGL support
  if (checkWebGLCompatibility()) {
    document.body.classList.add('webgl-supported');
  } else {
    document.body.classList.add('webgl-not-supported');
    console.warn('WebGL is not supported in this browser. Fallback visuals will be used.');
  }
};

// Execute preload
preloadAssets();

render(<App />, document.getElementById('app'))
