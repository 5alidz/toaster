// FLIP animation for toasts
// https://aerotwist.com/blog/flip-your-animations/
import { useEffect, useRef } from 'react';

function createToasterNode() {
  const previous = document.querySelector('gui-toast-group');
  if (previous != null) return previous as HTMLElement;

  const node = document.createElement('section');
  node.classList.add('gui-toast-group');

  document.body.appendChild(node);
  return node;
}

function createToastNode(text: string) {
  const node = document.createElement('output');

  node.innerText = text;
  node.classList.add('gui-toast');
  node.setAttribute('role', 'status');

  return node;
}

function createFlipToast(Toaster: HTMLElement) {
  return function flipToast(toast: HTMLOutputElement) {
    // FIRST
    const first = Toaster.offsetHeight;
    // add new child to change container size
    Toaster.appendChild(toast);
    // LAST
    const last = Toaster.offsetHeight;
    // INVERT
    const invert = last - first;
    // PLAY
    const animation = Toaster.animate(
      [
        { transform: `translateY(${invert}px)` },
        { transform: 'translateY(0)' },
      ],
      {
        duration: 150,
        easing: 'ease-out',
      }
    );

    animation.startTime = document.timeline.currentTime;
  };
}

function createToast(Toaster: HTMLElement) {
  return function Toast(text: string) {
    const toast = createToastNode(text);

    const { matches: motionOK } = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    );

    if (Toaster.children.length > 0 && motionOK) {
      // https://aerotwist.com/blog/flip-your-animations/
      const flipToast = createFlipToast(Toaster);
      flipToast(toast);
    } else {
      Toaster.appendChild(toast);
    }

    return new Promise(async (resolve) => {
      await Promise.allSettled(
        toast.getAnimations().map((animation) => animation.finished)
      );
      Toaster.removeChild(toast);
      resolve(null);
    });
  };
}

export function useToast() {
  const thingRef = useRef<null | ((s: string) => void)>(null);

  useEffect(() => {
    const Toaster = createToasterNode();
    const Toast = createToast(Toaster);

    thingRef.current = Toast;

    return () => {
      document
        .querySelectorAll('gui-toast-group')
        .forEach((node) => node.remove());
    };
  }, []);

  return (text: string) => thingRef.current && thingRef.current(text);
}
