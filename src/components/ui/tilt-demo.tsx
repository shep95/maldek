
import { Tilt } from "@/components/ui/tilt";
import { Spotlight } from "@/components/ui/spotlight";

export function BasicTiltCard() {
  return (
    <Tilt rotationFactor={8} isRevese>
      <div
        style={{
          borderRadius: '12px',
        }}
        className='flex max-w-[270px] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900'
      >
        <img
          src='https://images.unsplash.com/photo-1688961406558-9eadc772a391'
          alt='Aesthetic image'
          className='h-48 w-full object-cover'
        />
        <div className='p-2'>
          <h1 className='font-mono leading-snug text-zinc-950 dark:text-zinc-50'>
            Ghost in the Shell
          </h1>
          <p className='text-zinc-700 dark:text-zinc-400'>Kôkaku kidôtai</p>
        </div>
      </div>
    </Tilt>
  );
}

export function TiltSpotlight() {
  return (
    <div className='aspect-video max-w-sm'>
      <Tilt
        rotationFactor={6}
        isRevese
        style={{
          transformOrigin: 'center center',
        }}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
        className='group relative rounded-lg'
      >
        <Spotlight
          className='z-10 from-white/50 via-white/20 to-white/10 blur-2xl'
          size={248}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />
        <img
          src='https://images.unsplash.com/photo-1688961505799-6fbd990579a8'
          alt='Space odyssey'
          className='h-32 w-full rounded-lg object-cover grayscale duration-700 group-hover:grayscale-0'
        />
      </Tilt>
      <div className='flex flex-col space-y-0.5 pb-0 pt-3'>
        <h3 className='font-mono text-sm font-medium text-zinc-500 dark:text-zinc-400'>
          2001: A Space Odyssey
        </h3>
        <p className='text-sm text-black dark:text-white'>Stanley Kubrick</p>
      </div>
    </div>
  );
}
