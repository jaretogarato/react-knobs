import React from 'react'
import Knob from './Knob'
import { getPlatform } from '../utils/getPlatform'

const Demo = () => {
	// You can use state to manage the value of the knob if you need to respond to changes
	const [knobValue, setKnobValue] = React.useState(50)
	const platform = getPlatform()
	// You can use the platform value to modify the behavior or appearance of the component
	const knobSize = platform === 'android' ? '150px' : '100px'
	console.log('platform', platform)
	console.log('knobSize', knobSize)

	return (
		<div>
			<h1>Knob Demo</h1>
			<div style={{ width: '100px', height: '100px' }}>
				<Knob
					min={0}
					max={100}
					value={knobValue}
					angleStart={-400}
					angleEnd={360}
					onChange={(newValue) => setKnobValue(newValue)}
				/>
			</div>
			<p>Value: {knobValue}</p>
		</div>
	)
}

export default Demo
