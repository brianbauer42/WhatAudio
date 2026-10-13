import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import TrackCard from './TrackCard.jsx';
import Mist from './Mist.jsx';
import { CARD_WIDTH } from './cardTexture.js';

const TAU = Math.PI * 2;
// With the camera this close to a ring this wide, roughly a third of the
// circle is in frame: enough to read the curve without seeing the far side.
const MIN_RADIUS = 9;
const CAMERA_DISTANCE = 9;
const CAMERA_HEIGHT = 2.6;
const LOOK_HEIGHT = -0.6;

/** Ring radius grows with the playlist so the cards never crowd each other. */
export function ringRadius(count) {
  return Math.max(MIN_RADIUS, (count * CARD_WIDTH * 1.3) / TAU);
}

/**
 * The playlist as a ring of cards. The focused card is rotated to the front,
 * nearest the camera, with the rest sweeping away to either side.
 */
export default function Ring({ tracks, focusedIndex, currentId, onSelect }) {
  const groupRef = useRef(null);
  const spin = useRef({ current: 0, target: 0 });
  const camera = useThree((state) => state.camera);

  const count = tracks.length;
  const step = count > 0 ? TAU / count : 0;
  const radius = ringRadius(count);

  // Pick the equivalent target angle nearest the current one, so moving from
  // the last card to the first takes the short way round.
  useEffect(() => {
    const ideal = -focusedIndex * step;
    const { current } = spin.current;
    const turns = Math.round((current - ideal) / TAU);
    spin.current.target = ideal + turns * TAU;
  }, [focusedIndex, step]);

  useEffect(() => {
    camera.position.set(0, CAMERA_HEIGHT, radius + CAMERA_DISTANCE);
    camera.lookAt(0, LOOK_HEIGHT, radius);
  }, [camera, radius]);

  useFrame((state, delta) => {
    const s = spin.current;
    s.current += (s.target - s.current) * (1 - Math.exp(-delta * 6));
    if (groupRef.current) groupRef.current.rotation.y = s.current;

    // Gentle parallax from the pointer.
    const k = 1 - Math.exp(-delta * 3);
    camera.position.x += (state.pointer.x * 0.9 - camera.position.x) * k;
    camera.position.y += (CAMERA_HEIGHT + state.pointer.y * 0.45 - camera.position.y) * k;
    camera.lookAt(0, LOOK_HEIGHT, radius);
  });

  return (
    <>
      <Mist radius={radius} />
      <group ref={groupRef}>
        {tracks.map((track, index) => (
        <TrackCard
          key={track._id}
          track={track}
          index={index}
          angle={index * step}
          radius={radius}
          isFocused={index === focusedIndex}
          isCurrent={track._id === currentId}
          onSelect={onSelect}
        />
      ))}
      </group>
    </>
  );
}
