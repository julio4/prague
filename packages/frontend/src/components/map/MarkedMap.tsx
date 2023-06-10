import { FC, PropsWithChildren, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import Map from './Map'
import { Offer } from '../../types/app'
import OfferMarker from '../marker/OfferMarker'
import ZoomContext from '@shared/zoomContext'
import { DetailedOffer } from '../offer/DetailedOffer'

import 'twin.macro'

interface MarkedMapProps {
  onIdle?: (map: google.maps.Map) => void
  onClick?: (e: google.maps.MapMouseEvent) => void
  onMarkerClick: (payload: Offer) => void
  markers?: Offer[]
  center: google.maps.LatLngLiteral
  zoom: number
  highlightedMarker?: Offer | null
}

const MarkedMap = ({
  onClick,
  onIdle,
  zoom,
  center,
  markers,
  onMarkerClick,
  highlightedMarker,
}: MarkedMapProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);

  const render = (status: Status) => {
    console.log('Map status', status)
    return <></>
  }

  return (
    <ZoomContext.Provider value={{ zoomLevel, setZoomLevel }}>

      <div tw="absolute flex min-h-full min-w-full flex-col">
        <main tw="relative flex grow flex-col">
          <Wrapper
            apiKey={
              process.env
                .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
            }
            render={render}
          >
            <Map
              center={center}
              zoom={zoom}
              minZoom={14}
              maxZoom={18}
              onIdle={onIdle}
              onClick={onClick}
              onZoomChange={setZoomLevel}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              zoomControl={false}
              clickableIcons={false}
            >
              {markers?.map((marker) => (
                <OfferMarker
                  key={marker.id}
                  offer={marker}
                  onClick={onMarkerClick}
                  highlight={
                    highlightedMarker?.id === marker.id}
                />
              ))}
            </Map>
              <DetailedOffer offer={highlightedMarker} />
          </Wrapper>
        </main>
      </div>
    </ZoomContext.Provider>

  )
}

export default MarkedMap
