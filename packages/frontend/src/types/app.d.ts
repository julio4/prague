import { Category } from './category'
import { BadgeInfo } from './badge'

type Marker = {
	id: number
	location: {
		latitude: number
		longitude: number
	}
}

type Offer = Marker & {
	price: number
	category: Category
	author?: Author
	title: string
	description: string
	images?: string[]
	id: number
}

type RawOffer = {
	id: string
	offerId: number
	offerer: string
	isActive: boolean
	hash: string[]
	tokens: number
}

type PopulatedOffer = {
	offerer: string
	isActive: boolean
} & Offer

type Author = {
	id: number
	name: string
	description?: string
	avatar?: StaticImageData
	isVerified: boolean
	numberOfReviews: number
	rating: RatingType
	badges?: BadgeInfo[]
}

type RatingType = {
	average: number
	numberOfReviews: number
}

export { Marker, Offer, Author, RatingType, RawOffer, PopulatedOffer }
