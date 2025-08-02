import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

interface HeroSectionProps {
  onStartGame: () => void;
  isConnected: boolean;
  onConnectWallet: () => void;
  walletAddress?: string;
}

export const HeroSection = ({ onStartGame, isConnected, onConnectWallet, walletAddress }: HeroSectionProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
      .from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.5")
      .from(buttonsRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.3");

      // Floating animation for the container
      gsap.to(heroRef.current, {
        y: -10,
        duration: 3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <iframe 
          src="https://my.spline.design/particlenebula-UGeRzev80DAQDL8PTlQAJKlp/" 
          frameBorder="0" 
          width="100%" 
          height="100%"
          className="w-full h-full"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80 z-10" />

      {/* Content */}
      <div ref={heroRef} className="relative z-20 text-center px-6 max-w-4xl mx-auto">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold mb-6 text-glow bg-gradient-primary bg-clip-text text-transparent"
        >
          MONAD
          <br />
          <span className="text-neon text-secondary">REACTION</span>
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Test your lightning reflexes in this blockchain-powered reaction game. 
          Submit your scores on-chain and compete globally.
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button 
                onClick={onStartGame}
                variant="gaming"
                size="xl"
                className="animate-pulse-glow"
              >
                START REACTION TEST
              </Button>
              <div className="glass px-4 py-2 rounded-lg">
                <p className="text-sm text-muted-foreground">Connected:</p>
                <p className="text-primary font-mono text-sm">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <Button 
                onClick={onConnectWallet}
                variant="neon"
                size="xl"
                className="animate-pulse-glow"
              >
                CONNECT WALLET
              </Button>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to submit scores on Monad Testnet
              </p>
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="mt-12 flex justify-center">
          <div className="glass p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-primary">Global Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-secondary">1,247</p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">156ms</p>
                <p className="text-sm text-muted-foreground">Best Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient particles effect */}
      <div className="absolute inset-0 z-10 opacity-50">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};