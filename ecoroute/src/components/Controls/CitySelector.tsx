import { useFlightContext } from '../../context/FlightContext'
import { CityDropdown } from './CityDropdown'

export default function CitySelector() {
  const { state, setOrigin, setDestination } = useFlightContext()

  return (
    <div className="flex flex-col gap-3">
      <CityDropdown
        label="From"
        value={state.origin}
        exclude={state.destination}
        onChange={setOrigin}
      />
      <CityDropdown
        label="To"
        value={state.destination}
        exclude={state.origin}
        onChange={setDestination}
      />
    </div>
  )
}
