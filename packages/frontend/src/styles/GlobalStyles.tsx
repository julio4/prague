import { Global } from '@emotion/react'
import 'nprogress/nprogress.css'
import tw, { css, GlobalStyles as BaseStyles } from 'twin.macro'

const customStyles = css`
	html {
		${tw`scroll-smooth antialiased`}
	}
	body {
		${tw`bg-white text-black`}
		${tw`relative h-screen min-h-screen`}
	}

	#__next,
	#__next > div {
		${tw`relative flex h-full min-h-full flex-col`}
	}

	/* Progress Bar */
	#nprogress > .bar {
		${tw`bg-green-500`}
	}
	#nprogress > .spinner {
		${tw`!hidden`}
	}
`

const GlobalStyles = () => (
	<>
		<BaseStyles />
		<Global styles={customStyles} />
	</>
)

export default GlobalStyles
