import { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

const CONTRACT_ADDRESS = "0x2Ae02A3E11b8b23328127e0169b8Ae28867B7DE2";

// Minimal ABI for the reaction game contract
const CONTRACT_ABI = [
  "function submitScore(uint256 score) public",
  "function getMyBestScore() public view returns (uint256)",
  "function getBestScore() public view returns (uint256)",
  "function getTotalGames() public view returns (uint256)"
];

interface TransactionState {
  isSubmitting: boolean;
  txHash: string | null;
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
}

export const useContract = (signer: ethers.JsonRpcSigner | null) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isSubmitting: false,
    txHash: null,
    status: 'idle',
  });
  
  const { toast } = useToast();

  const submitScore = async (score: number) => {
    if (!signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTransactionState({
        isSubmitting: true,
        txHash: null,
        status: 'pending',
      });

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      toast({
        title: "Submitting score...",
        description: "Please confirm the transaction in MetaMask",
      });

      const tx = await contract.submitScore(score);
      
      setTransactionState(prev => ({
        ...prev,
        txHash: tx.hash,
      }));

      toast({
        title: "Transaction sent!",
        description: `Score submission pending: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactionState(prev => ({
          ...prev,
          isSubmitting: false,
          status: 'confirmed',
        }));

        toast({
          title: "Score submitted successfully!",
          description: `Your reaction time of ${score}ms has been recorded on-chain`,
        });
      } else {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error: any) {
      console.error('Failed to submit score:', error);
      
      setTransactionState(prev => ({
        ...prev,
        isSubmitting: false,
        status: 'failed',
      }));

      toast({
        title: "Transaction failed",
        description: error.message || "Failed to submit score to blockchain",
        variant: "destructive",
      });

      throw error;
    }
  };

  const getMyBestScore = async (): Promise<number | null> => {
    if (!signer) return null;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const score = await contract.getMyBestScore();
      return Number(score);
    } catch (error) {
      console.error('Failed to get best score:', error);
      return null;
    }
  };

  const getBestScore = async (): Promise<number | null> => {
    if (!signer) return null;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const score = await contract.getBestScore();
      return Number(score);
    } catch (error) {
      console.error('Failed to get global best score:', error);
      return null;
    }
  };

  const getTotalGames = async (): Promise<number | null> => {
    if (!signer) return null;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const total = await contract.getTotalGames();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total games:', error);
      return null;
    }
  };

  const resetTransactionState = () => {
    setTransactionState({
      isSubmitting: false,
      txHash: null,
      status: 'idle',
    });
  };

  return {
    submitScore,
    getMyBestScore,
    getBestScore,
    getTotalGames,
    resetTransactionState,
    ...transactionState,
  };
};