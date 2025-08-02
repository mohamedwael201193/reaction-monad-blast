import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete
      });

      // Initial setup
      gsap.set(initialsRef.current, { scale: 0, opacity: 0 });
      gsap.set(progressRef.current, { width: "0%" });

      // Spinning orbit animation
      gsap.to(orbitRef.current, {
        rotation: 360,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1
      });

      // Main animation sequence
      tl.to(initialsRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(2)"
      })
      .to(progressRef.current, {
        width: "100%",
        duration: 2,
        ease: "power2.inOut"
      }, "-=0.5")
      .to(preloaderRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, "+=0.5");

    }, preloaderRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={preloaderRef}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-primary rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative text-center">
        {/* Spinning Orbit */}
        <div 
          ref={orbitRef}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
          <div className="absolute inset-2 border border-primary/40 rounded-full" />
          <div className="absolute inset-4 border border-primary/60 rounded-full" />
          
          {/* Moving dots */}
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-glow" />
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-secondary rounded-full transform -translate-x-1/2 translate-y-1/2 shadow-neon" />
        </div>

        {/* MW Initials */}
        <div 
          ref={initialsRef}
          className="text-6xl font-bold mb-8 text-glow bg-gradient-primary bg-clip-text text-transparent"
        >
          MW
        </div>

        {/* Loading text */}
        <div className="text-xl text-muted-foreground mb-6">
          Initializing Monad Reaction Game...
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-gradient-primary rounded-full shadow-glow"
          />
        </div>

        {/* Version */}
        <div className="text-sm text-muted-foreground mt-6 font-mono">
          v1.0.0 • Monad Testnet
        </div>
      </div>
    </div>
  );
};