import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ReactionGame } from "@/components/ReactionGame";
import { Preloader } from "@/components/Preloader";
import { useWallet } from "@/hooks/useWallet";
import { useContract } from "@/hooks/useContract";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";

type AppState = 'loading' | 'hero' | 'game';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const { toast } = useToast();
  
  const {
    isConnected,
    address,
    signer,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const {
    submitScore,
    getMyBestScore,
    getBestScore,
    getTotalGames,
    isSubmitting,
    txHash,
    status,
    resetTransactionState,
  } = useContract(signer);

  useEffect(() => {
    // Initialize GSAP ScrollTrigger if needed
    gsap.registerPlugin();
  }, []);

  const handlePreloaderComplete = () => {
    setAppState('hero');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet connected!",
        description: "You can now participate in the reaction game",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleStartGame = () => {
    setAppState('game');
  };

  const handleScoreSubmit = async (score: number) => {
    if (!isConnected || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit scores",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitScore(score);
      // Optionally refresh best scores after submission
      await Promise.all([
        getMyBestScore(),
        getBestScore(),
        getTotalGames(),
      ]);
    } catch (error) {
      // Error is already handled in useContract hook
    }
  };

  const handleBackToMenu = () => {
    setAppState('hero');
    resetTransactionState();
  };

  if (appState === 'loading') {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-space">
      {appState === 'hero' && (
        <div>
          <HeroSection
            onStartGame={handleStartGame}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
            walletAddress={address}
          />
          
          {/* Back to top floating button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 shadow-glow z-40"
          >
            ↑
          </button>
        </div>
      )}

      {appState === 'game' && (
        <div>
          {/* Header with back button */}
          <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-primary/20">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={handleBackToMenu}
                className="text-primary hover:text-primary-glow transition-colors duration-200"
              >
                ← Back to Menu
              </button>
              
              <div className="text-center">
                <h1 className="text-xl font-bold text-glow">Monad Reaction</h1>
                {isConnected && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                )}
              </div>
              
              <div className="w-24"> {/* Spacer for centering */} </div>
            </div>
          </header>

          {/* Game content */}
          <div className="pt-20">
            <ReactionGame
              onScoreSubmit={handleScoreSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Transaction status overlay */}
          {txHash && status === 'pending' && (
            <div className="fixed bottom-8 left-8 right-8 z-50">
              <div className="glass p-4 rounded-lg border border-primary/30 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="animate-spin-slow w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Transaction Pending</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'confirmed' && (
            <div className="fixed bottom-8 left-8 right-8 z-50">
              <div className="glass p-4 rounded-lg border border-secondary/30 max-w-md mx-auto bg-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="text-secondary">✓</div>
                  <div>
                    <p className="text-sm font-medium text-secondary">Score Submitted!</p>
                    <p className="text-xs text-muted-foreground">
                      Your reaction time has been recorded on-chain
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;