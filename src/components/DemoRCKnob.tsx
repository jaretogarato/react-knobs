import React, { useState } from 'react'
import ReactCanvasKnob from './ReactCanvasKnob.tsx'

const DemoRCKnob = () => {
	const [value, setValue] = useState(50) // Initial value of the knob

	const handleChange = (newValue) => {
		setValue(newValue)
	}

	const computeSixLevels = (value) => {
		if (value < 10) {
			return 1
		} else if (value < 20) {
			return 2
		} else if (value < 30) {
			return 3
		} else if (value < 40) {
			return 4
		} else if (value < 50) {
			return 5
		} else {
			return 6
		}
	}

	return (
		<div style={{ padding: '20px', textAlign: 'center' }}>
			<h1>Cool Knob Control</h1>
			<ReactCanvasKnob
				value={value}
				onChange={handleChange}
				min={0}
				max={60}
				step={1}
				width={200}
				height={200}
				thickness={0.4}
				lineCap='round'
				bgColor='#f0f0f0'
				fgColor='#3498db'
				displayInput
				angleArc={270}
				angleOffset={-135}
				title='Cool Knob'
			/>
			<p>Value: {value}</p>
			{/* <p>Value: {computeSixLevels(value)}</p> */}
		</div>
	)
}

export default DemoRCKnob
