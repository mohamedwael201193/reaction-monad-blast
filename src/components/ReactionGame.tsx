import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

interface ReactionGameProps {
  onScoreSubmit: (score: number) => void;
  isSubmitting: boolean;
}

type GameState = 'waiting' | 'ready' | 'go' | 'clicked' | 'too-early';

export const ReactionGame = ({ onScoreSubmit, isSubmitting }: ReactionGameProps) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startGame = useCallback(() => {
    if (gameState !== 'waiting') return;
    
    setGameState('ready');
    setScore(null);
    
    // Random delay between 2-6 seconds
    const delay = 2000 + Math.random() * 4000;
    
    gsap.to(gameAreaRef.current, {
      backgroundColor: "hsl(0 84.2% 60.2%)",
      duration: 0.3
    });
    
    timeoutRef.current = setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
      
      gsap.to(gameAreaRef.current, {
        backgroundColor: "hsl(127 100% 50%)",
        duration: 0.1
      });
      
      // Flash effect
      gsap.fromTo(signalRef.current, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
      );
    }, delay);
  }, [gameState]);

  const handleClick = useCallback(() => {
    if (gameState === 'ready') {
      // Clicked too early
      setGameState('too-early');
      clearTimeout(timeoutRef.current);
      
      gsap.to(gameAreaRef.current, {
        backgroundColor: "hsl(0 84.2% 60.2%)",
        duration: 0.3
      });
      
      setTimeout(() => setGameState('waiting'), 2000);
      return;
    }
    
    if (gameState === 'go') {
      const reactionTime = Date.now() - startTime;
      setScore(reactionTime);
      setGameState('clicked');
      
      gsap.to(gameAreaRef.current, {
        backgroundColor: "hsl(194 100% 50%)",
        duration: 0.3
      });
      
      // Animate score display
      gsap.fromTo(scoreRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );
      
      // Update best score
      if (!bestScore || reactionTime < bestScore) {
        setBestScore(reactionTime);
      }
    }
  }, [gameState, startTime, bestScore]);

  const resetGame = () => {
    setGameState('waiting');
    setScore(null);
    clearTimeout(timeoutRef.current);
    
    gsap.to(gameAreaRef.current, {
      backgroundColor: "hsl(220 27% 12%)",
      duration: 0.3
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStateMessage = () => {
    switch (gameState) {
      case 'waiting':
        return 'Click START to begin';
      case 'ready':
        return 'Wait for GREEN...';
      case 'go':
        return 'CLICK NOW!';
      case 'clicked':
        return `${score}ms`;
      case 'too-early':
        return 'Too early! Wait for green.';
      default:
        return '';
    }
  };

  const getScoreColor = () => {
    if (!score) return 'text-foreground';
    if (score < 200) return 'text-secondary';
    if (score < 300) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          onClick={handleClick}
          className="glass relative w-full h-96 rounded-2xl cursor-pointer flex items-center justify-center border-2 border-primary/30 hover:border-primary/50 transition-all duration-300"
          style={{ backgroundColor: 'hsl(220 27% 12%)' }}
        >
          {/* Signal Indicator */}
          <div ref={signalRef} className="text-center">
            <div className="text-6xl md:text-8xl font-bold mb-4">
              {gameState === 'go' && (
                <span className="text-secondary animate-pulse-glow">⚡</span>
              )}
            </div>
            
            <div className={`text-2xl md:text-4xl font-bold ${getScoreColor()}`}>
              {getStateMessage()}
            </div>
            
            {gameState === 'clicked' && score && (
              <div ref={scoreRef} className="mt-4">
                <div className="text-lg text-muted-foreground">
                  Reaction Time
                </div>
                {score < 200 && (
                  <div className="text-secondary text-lg mt-2 animate-pulse">
                    🔥 LIGHTNING FAST!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions overlay */}
          {gameState === 'waiting' && (
            <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-muted-foreground">
              Click anywhere in this area when you see the ⚡ signal
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            {gameState === 'waiting' && (
              <Button 
                onClick={startGame}
                variant="gaming"
                size="lg"
                className="animate-pulse-glow"
              >
                START TEST
              </Button>
            )}
            
            {(gameState === 'clicked' || gameState === 'too-early') && (
              <div className="flex gap-4">
                <Button 
                  onClick={resetGame}
                  variant="cyber"
                  size="lg"
                >
                  TRY AGAIN
                </Button>
                
                {gameState === 'clicked' && score && (
                  <Button 
                    onClick={() => onScoreSubmit(score)}
                    variant="neon"
                    size="lg"
                    disabled={isSubmitting}
                    className="relative"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin-slow w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT TO BLOCKCHAIN'
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center">
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center gap-8 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className={`text-xl font-bold ${getScoreColor()}`}>
                    {score ? `${score}ms` : '---'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Best</p>
                  <p className="text-xl font-bold text-secondary">
                    {bestScore ? `${bestScore}ms` : '---'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};