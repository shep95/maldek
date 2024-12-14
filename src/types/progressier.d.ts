interface Progressier {
  install: () => void;
}

interface Window {
  progressier?: Progressier;
}