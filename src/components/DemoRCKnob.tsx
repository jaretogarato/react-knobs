import React, { useState } from 'react'
import ReactCanvasKnob from './ReactCanvasKnob.tsx'

const DemoRCKnob = () => {
	const [value, setValue] = useState(50) // Initial value of the knob

	const handleChange = (newValue) => {
		setValue(newValue)
	}

	return (
		<div style={{ padding: '20px', textAlign: 'center' }}>
			<h1>Cool Knob Control</h1>
			<ReactCanvasKnob
				value={value}
				onChange={handleChange}
				min={0}
				max={100}
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
		</div>
	)
}

export default DemoRCKnob
