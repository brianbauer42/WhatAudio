import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Nebula from './Nebula.jsx';
import Starfield from './Starfield.jsx';
import Ring from './Ring.jsx';
import Effects from './Effects.jsx';
import { palette } from '../theme.js';

export default function Scene({ tracks, focusedIndex, currentId, onSelect }) {
  return (
    <div className="scene">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 48, near: 0.1, far: 1000, position: [0, 1.6, 14] }}
      >
        <color attach="background" args={[palette.background]} />
        <fog attach="fog" args={[palette.background, 16, 48]} />
        <Suspense fallback={null}>
          <Nebula />
          <Starfield />
          <Ring
            tracks={tracks}
            focusedIndex={focusedIndex}
            currentId={currentId}
            onSelect={onSelect}
          />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
}
