import React, { useState, useRef, useEffect } from 'react'
import '../styles/knobs.css'
import '../styles/ui.css'

const Knob = ({
	min = 0,
	max = 100,
	value = 50,
	angleStart = -400,
	angleEnd = 360,
	onChange,
}) => {
	const [currentValue, setCurrentValue] = useState(value)
	const knobRef = useRef<HTMLDivElement>(null)
	const draggingRef = useRef(false)

	const angle =
		((currentValue - min) / (max - min)) * (angleEnd - angleStart) + angleStart

	const handleValueChange = (newValue) => {
		setCurrentValue(Math.min(max, Math.max(min, newValue)))
		console.log('newValue', newValue)

		if (onChange) {
			onChange(newValue)
		}
	}

	function toRadians(degrees) {
		return degrees * (Math.PI / 180)
	}

	// const getIndicator = ({
	// 	angle,
	// 	indicatorAutoPosition,
	// 	indicatorAutoRotate,
	// }) => {
	// 	// const self = this,
	// 	let indicator = {}

	// 	console.log('getIndicator', angle, indicatorAutoPosition)

	// 	if (indicatorAutoPosition) {
	// 		const rads = toRadians(angle)

	// 		// Subtract Y component because of canvas's inverted Y coordinate compared to output of sin.

	// 		indicator.x =
	// 			__centerPageX - __clientLeft + indicatorRadius * Math.cos(rads)

	// 		indicator.y =
	// 			__centerPageY - __clientTop - indicatorRadius * Math.sin(rads)
	// 	} else {
	// 		// If not positioning, set x & y to the center of the knob
	// 		indicator.x = __centerPageX - __clientLeft
	// 		indicator.y = __centerPageY - __clientTop
	// 	}

	// 	if (indicatorAutoRotate) {
	// 		indicator.angle = angle - indicatorStartAngle
	// 	} else {
	// 		indicator.angle = 0
	// 	}

	// 	return indicator
	// }

	// getIndicator({ angle: 45, indicatorAutoPosition: true });
	// Output: 'getIndicator', 45, true

	const calculateValueFromEvent = (e: MouseEvent | TouchEvent) => {
		if (knobRef.current) {
			const rect = knobRef.current.getBoundingClientRect()
			const centerX = rect.left + rect.width / 2
			const centerY = rect.top + rect.height / 2
			const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
			const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY
			const atan = Math.atan2(centerY - clientY, centerX - clientX)
			const newAngle = (atan * 180) / Math.PI - 90
			return (
				((newAngle - angleStart) / (angleEnd - angleStart)) * (max - min) + min
			)
		}

		// Handle the case where knobRef.current is null, return a default value or throw an error
		return 0
	}

	const handleMouseDown = (e) => {
		draggingRef.current = true
		document.addEventListener('mousemove', handleDrag)
		document.addEventListener('mouseup', handleMouseUp)
		console.log('handleMouseDown')
	}

	const handleMouseUp = () => {
		draggingRef.current = false
		document.removeEventListener('mousemove', handleDrag)
		document.removeEventListener('mouseup', handleMouseUp)
		console.log('handleMouseUp')
	}

	const handleDrag = (e) => {
		if (draggingRef.current) {
			handleValueChange(calculateValueFromEvent(e))
			console.log('handleDrag')
		}
	}

	const handleTouchStart = (e) => {
		draggingRef.current = true
		e.preventDefault() // Prevent scrolling on touch
		console.log('handleTouchStart')
	}

	const handleTouchMove = (e) => {
		if (draggingRef.current) {
			handleValueChange(calculateValueFromEvent(e))
		}
		console.log('handleTouchMove')
	}

	useEffect(() => {
		const knobContainer = knobRef.current
		if (knobContainer) {
			knobContainer.addEventListener('mousedown', handleMouseDown)
			knobContainer.addEventListener('touchstart', handleTouchStart)
			knobContainer.addEventListener('touchmove', handleTouchMove)
			return () => {
				knobContainer.removeEventListener('mousedown', handleMouseDown)
				knobContainer.removeEventListener('touchstart', handleTouchStart)
				knobContainer.removeEventListener('touchmove', handleTouchMove)
			}
		}
	}, [])

	return (
		<div
			ref={knobRef}
			className='ui-knob-container'
			style={{ position: 'relative', width: '100px', height: '100px' }}
		>
			<div
				className='ui-knob ui-knob-shadow'
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					border: '1px solid orange',
				}}
			></div>
			<div
				className='ui-knob-indicator'
				style={{ transform: `rotate(${angle}deg)`, position: 'absolute' }}
			>
				{/* Additional content for the indicator */}
			</div>
			<input
				id='position-rotate-css-knob'
				name='position-rotate-css-knob'
				type='range'
				value='50'
				min='0'
				max='100'
				data-angle-start='210'
				data-angle-end='-30'
				data-indicator-auto-position='true'
				data-indicator-auto-rotate='true'
				data-indicator-radius='22'
				style={{ display: 'none' }}
			></input>
		</div>
	)
}

export default Knob
