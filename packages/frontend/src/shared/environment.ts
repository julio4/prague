/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Environment Variables defined in `.env.local`.
 * See `env.local.example` for documentation.
 */
export const env = {
	url:
		process.env.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_ENV! === 'preview'
			? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
			: process.env.NEXT_PUBLIC_URL,
	isProduction: process.env.NEXT_PUBLIC_PRODUCTION_MODE === 'true',

	defaultChain: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN!),
	supportedChains: JSON.parse(process.env.NEXT_PUBLIC_SUPPORTED_CHAINS!),

	rpcUrls: {
		1337: process.env.NEXT_PUBLIC_RPC_1337!, // Hardhat

		1: process.env.NEXT_PUBLIC_RPC_1!, // Ethereum Mainnet
		11155111: process.env.NEXT_PUBLIC_RPC_11155111!, // Sepolia

		420: process.env.NEXT_PUBLIC_RPC_420!, // Optimism Mainnet
		534353: process.env.NEXT_PUBLIC_RPC_534353!, // Scroll Testnet
	},
}
