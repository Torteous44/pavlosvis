import './assets/fonts.css';
import './styles/global.css';

import { Hero } from './components/Hero';
import { Content } from './components/Content';
import { Paper } from './components/Paper';

export function App() {
  return (
    <>
      <Hero />
      <div className="container">
        <main>
          <Content />
          <Paper />
        </main>
      </div>
    </>
  );
}
