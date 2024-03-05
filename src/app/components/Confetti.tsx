import VFX from 'react-canvas-confetti/dist/presets/realistic';

export function Confetti() {
  return (
    <VFX
      autorun={{ speed: 1, duration: 500 }}
      globalOptions={{ disableForReducedMotion: true, resize: true }}
      className='pointer-events-none absolute z-50 h-full w-full'
    />
  );
}
