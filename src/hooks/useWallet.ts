import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
}

const MONAD_TESTNET_CONFIG = {
  chainId: '0x29a', // 666 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if we're on Monad Testnet
      if (network.chainId !== 666n) {
        await switchToMonadTestnet();
      }

      setWalletState({
        isConnected: true,
        address: accounts[0],
        provider,
        signer,
        chainId: Number(network.chainId),
      });

      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const switchToMonadTestnet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_CONFIG],
          });
        } catch (addError) {
          console.error('Failed to add Monad Testnet:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to Monad Testnet:', switchError);
        throw switchError;
      }
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
    });
  };

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setWalletState({
            isConnected: true,
            address: accounts[0].address,
            provider,
            signer,
            chainId: Number(network.chainId),
          });
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({ ...prev, address: accounts[0] }));
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToMonadTestnet,
  };
};

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}