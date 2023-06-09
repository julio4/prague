import { ChakraProvider } from '@chakra-ui/react'
import { BaseLayout } from '@components/layout/BaseLayout'
import { HotToastConfig } from '@components/layout/HotToastConfig'
import { cache } from '@emotion/css'
import { CacheProvider } from '@emotion/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { env } from '@shared/environment'
import { chains, wagmiConfig } from '@shared/wagmiConfig'
import GlobalStyles from '@styles/GlobalStyles'
import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
import NProgress from 'nprogress'
import { WagmiConfig } from 'wagmi'

// Router Loading Animation with @tanem/react-nprogress
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			{/* TODO SEO */}
			<DefaultSeo
				dangerouslySetAllPagesToNoFollow={!env.isProduction}
				dangerouslySetAllPagesToNoIndex={!env.isProduction}
				defaultTitle="EthPrague" // TODO
				titleTemplate="%s | EthPrague" // TODO
				description="EthPrague" // TODO
				openGraph={{
					type: 'website',
					locale: 'en',
					url: env.url,
					site_name: 'EthPrague', // TODO
					images: [
						{
							url: `${env.url}/images/cover.jpg`, // TODO
							width: 1200,
							height: 670,
						},
					],
				}}
				twitter={{
					handle: '@julio4__',
				}}
			/>

			<Head>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>

			<CacheProvider value={cache}>
				<ChakraProvider>
					<GlobalStyles />

					<WagmiConfig config={wagmiConfig}>
						<RainbowKitProvider
							chains={chains}
							coolMode={true}
							showRecentTransactions={true}
							appInfo={{
								appName: 'EthPrague', // TODO
								learnMoreUrl: 'https://ethprague.com/images/cover.jpg', // TODO
								disclaimer: undefined,
							}}
						>
							<BaseLayout>
								<Component {...pageProps} />
							</BaseLayout>
						</RainbowKitProvider>
					</WagmiConfig>

					<HotToastConfig />
				</ChakraProvider>
			</CacheProvider>
		</>
	)
}

export default MyApp
