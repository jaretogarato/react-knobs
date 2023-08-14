// This is entirely based on JoshJG's react-canvas-knob. I couldn't npm install it with my version of React, so I just refactored it to use functional components. I also chose to refactor it using typescript.

import React, { useState, useEffect, useRef } from 'react'

interface KnobProps {
	value: number
	onChange: (value: number) => void
	onChangeEnd?: (value: number) => void
	min?: number
	max?: number
	step?: number
	log?: boolean
	width?: number
	height?: number
	thickness?: number
	lineCap?: 'butt' | 'round'
	bgColor?: string
	fgColor?: string
	inputColor?: string
	font?: string
	fontWeight?: string
	clockwise?: boolean
	cursor?: number | boolean
	stopper?: boolean
	readOnly?: boolean
	disableTextInput?: boolean
	displayInput?: boolean
	displayCustom?: () => JSX.Element
	angleArc?: number
	angleOffset?: number
	disableMouseWheel?: boolean
	title?: string
	className?: string
	canvasClassName?: string
}

const getArcToValue = (
	v: number,
	{
		min = 0,
		max = 100,
		angleArc = 360,
		angleOffset = 0,
		log = false,
		clockwise = true,
		cursor = false,
	}: Partial<KnobProps>,
	{ endAngle, cursorExt }: { endAngle: number; cursorExt: number }
) => {
	let startAngle: number
	let endAngleCalc: number
	// const angle = !log
	// 	? ((v - min) * (angleArc * Math.PI)) / 180 / (max - min)
	// 	: Math.log(Math.pow(v / min, (angleArc * Math.PI) / 180)) /
	// 	  Math.log(max / min)

	const angle = !log
		? ((v - min) * angleArc) / (max - min)
		: Math.log(Math.pow(v / min, angleArc)) / Math.log(max / min)

	console.log('angle', angle)

	if (!clockwise) {
		startAngle = endAngle + 0.00001
		endAngleCalc = startAngle - angle - 0.00001
	} else {
		startAngle = 1.5 * Math.PI + angleOffset - 0.00001
		endAngleCalc = startAngle + angle + 0.00001
	}

	if (cursor) {
		startAngle = endAngleCalc - cursorExt
		endAngleCalc += cursorExt
	}

	return {
		startAngle,
		endAngle: endAngleCalc,
		acw: !clockwise && !cursor,
	}
}

const getCanvasScale = (ctx: CanvasRenderingContext2D): number => {
	const devicePixelRatio: number = window.devicePixelRatio || 1
	const backingStoreRatio: number =
		(ctx as any).webkitBackingStorePixelRatio || 1
	return devicePixelRatio / backingStoreRatio
}

const coerceToStep = (
	v: number,
	log: boolean,
	step: number,
	max: number,
	min: number
): number => {
	let val = !log
		? Math.floor((v < 0 ? -0.5 : 0.5) + v / step) * step
		: Math.pow(
				step,
				Math.floor(
					(Math.abs(v) < 1 ? -0.5 : 0.5) + Math.log(v) / Math.log(step)
				)
		  )
	val = Math.max(Math.min(val, max), min)
	if (isNaN(val)) {
		val = 0
	}
	return Math.round(val * 1000) / 1000
}

const ReactCanvasKnob: React.FC<KnobProps> = ({
	value,
	onChange,
	onChangeEnd = () => {},
	min = 0,
	max = 100,
	step = 1,
	log = false,
	width = 200,
	height = 200,
	thickness = 0.35,
	lineCap = 'butt',
	bgColor = '#EEE',
	fgColor = '#EA2',
	inputColor = '',
	font = 'Arial',
	fontWeight = 'bold',
	clockwise = true,
	cursor: cursorProp = false,
	stopper = true,
	readOnly = false,
	disableTextInput = false,
	displayInput = true,
	angleArc: angleArcProp = 360,
	angleOffset: angleOffsetProp = 0,
	disableMouseWheel = false,
	title,
	className,
	canvasClassName,
	displayCustom,
}) => {
	const [touchIndex, setTouchIndex] = useState<number>(0)

	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	// from old constructor:
	const [w, setW] = useState(width || 200)
	const [h, setH] = useState(height || w)
	const cursorExt = cursorProp === true ? 0.3 : 1
	const angleArc = (angleArcProp * Math.PI) / 180
	const angleOffset = (angleOffsetProp * Math.PI) / 180
	const startAngle = 1.5 * Math.PI + angleOffset
	const endAngle = 1.5 * Math.PI + angleOffset + angleArc
	const digits =
		Math.max(String(Math.abs(min)).length, String(Math.abs(max)).length, 2) + 2

	useEffect(() => {
		const touchStartHandler = (e: TouchEvent) => handleTouchStart(e as any)
		drawCanvas()
		if (!readOnly) {
			canvasRef.current?.addEventListener('touchstart', touchStartHandler, {
				passive: false,
			})
		}

		// Cleanup function for componentWillUnmount
		return () => {
			canvasRef.current?.removeEventListener('touchstart', touchStartHandler)
		}
	}, []) // Runs once on mount and unmount

	// For componentWillReceiveProps
	useEffect(() => {
		if (width && w !== width) {
			setW(width)
		}
		if (height && h !== height) {
			setH(height)
		}
	}, [width, height]) // Runs when width or height changes

	// For componentDidUpdate
	useEffect(() => {
		drawCanvas()
	}) // Runs on every update, or you can specify dependencies

	const eventToValue = (
		e:
			| MouseEvent
			| React.MouseEvent<HTMLCanvasElement, MouseEvent>
			| TouchEvent
			| React.TouchEvent<HTMLCanvasElement>
	) => {
		const bounds = canvasRef.current?.getBoundingClientRect() ?? {
			left: 0,
			top: 0,
		}
		let clientX: number, clientY: number

		if ('touches' in e) {
			const touch = e.touches[touchIndex]
			clientX = touch.clientX
			clientY = touch.clientY
		} else {
			clientX = e.clientX
			clientY = e.clientY
		}

		const x = clientX - bounds.left
		const y = clientY - bounds.top
		let a = Math.atan2(x - w / 2, w / 2 - y) - angleOffset
		if (!clockwise) {
			a = angleArc - a - 2 * Math.PI
		}
		if (angleArc !== Math.PI * 2 && a < 0 && a > -0.5) {
			a = 0
		} else if (a < 0) {
			a += Math.PI * 2
		}
		const val = !log
			? (a * (max - min)) / angleArc + min
			: Math.pow(max / min, a / angleArc) * min

		return coerceToStep(val, log, step, max, min) // Assuming coerceToStep takes these parameters
	}

	const handleMouseDown = (
		e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
	) => {
		onChange(eventToValue(e))
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
		document.addEventListener('keyup', handleEsc)
	}

	const handleMouseMove = (e: MouseEvent) => {
		e.preventDefault()
		onChange(eventToValue(e))
	}

	const handleMouseUp = (e: MouseEvent) => {
		onChangeEnd(eventToValue(e))
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
		document.removeEventListener('keyup', handleEsc)
	}

	const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
		e.preventDefault()
		setTouchIndex(e.targetTouches.length - 1)
		onChange(eventToValue(e))
		document.addEventListener('touchmove', handleTouchMove, {
			passive: false,
		})
		document.addEventListener('touchend', handleTouchEnd)
		document.addEventListener('touchcancel', handleTouchEnd)
	}

	const handleTouchMove = (e: TouchEvent) => {
		e.preventDefault()
		onChange(eventToValue(e))
	}

	const handleTouchEnd = (e: TouchEvent) => {
		onChangeEnd(eventToValue(e))
		document.removeEventListener('touchmove', handleTouchMove)
		document.removeEventListener('touchend', handleTouchEnd)
		document.removeEventListener('touchcancel', handleTouchEnd)
	}

	const handleEsc = (e: KeyboardEvent) => {
		if (e.keyCode === 27) {
			e.preventDefault()

			// Create a new MouseEvent to simulate the mouse-up event
			const mouseEvent = new MouseEvent('mouseup')

			// Call handleMouseUp with the required arguments
			handleMouseUp(mouseEvent)
		}
	}

	const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = Math.max(Math.min(+e.target.value, max), min) || min
		onChange(val)
	}

	const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault()
		if (e.deltaX > 0 || e.deltaY > 0) {
			onChange(
				coerceToStep(!log ? value + step : value * step, log, step, max, min)
			)
		} else if (e.deltaX < 0 || e.deltaY < 0) {
			onChange(
				coerceToStep(!log ? value - step : value / step, log, step, max, min)
			)
		}
	}

	const handleArrowKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.keyCode === 37 || e.keyCode === 40) {
			e.preventDefault()
			onChange(
				coerceToStep(!log ? value - step : value / step, log, step, max, min)
			)
		} else if (e.keyCode === 38 || e.keyCode === 39) {
			e.preventDefault()
			onChange(
				coerceToStep(!log ? value + step : value * step, log, step, max, min)
			)
		}
	}

	const drawCanvas = () => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d')
			if (ctx) {
				const scale = getCanvasScale(ctx) // Assuming getCanvasScale is defined
				canvasRef.current.width = w * scale // clears the canvas
				canvasRef.current.height = h * scale
				ctx.scale(scale, scale)
				const xy = w / 2 // coordinates of canvas center
				const lineWidth = xy * thickness
				const radius = xy - lineWidth / 2
				ctx.lineWidth = lineWidth
				ctx.lineCap = lineCap
				// background arc
				ctx.beginPath()
				ctx.strokeStyle = bgColor
				ctx.arc(xy, xy, radius, endAngle - 0.00001, startAngle + 0.00001, true)
				ctx.stroke()
				// foreground arc
				const a = getArcToValue(
					value,
					{
						min,
						max,
						angleArc,
						angleOffset,
						log,
						clockwise,
						cursor: cursorProp,
					},
					{ endAngle, cursorExt }
				)

				ctx.beginPath()
				ctx.strokeStyle = fgColor
				ctx.arc(xy, xy, radius, a.startAngle, a.endAngle, a.acw)
				ctx.stroke()
			}
		}
	}

	// Usage inside the component:
	// useEffect(() => {
	//   drawCanvas()
	// }, [w, h, thickness, lineCap, bgColor, fgColor, value, startAngle, endAngle]) // Add dependencies as needed

	const renderCenter = (props) => {
		const { displayCustom, displayInput, disableTextInput, readOnly, value } =
			props

		if (displayInput) {
			return (
				<input
					style={inputStyle()} // Assuming inputStyle is defined in the component
					type='text'
					value={value}
					onChange={handleTextInput} // Assuming handleTextInput is defined in the component
					onKeyDown={handleArrowKey} // Assuming handleArrowKey is defined in the component
					readOnly={readOnly || disableTextInput}
				/>
			)
		} else if (displayCustom && typeof displayCustom === 'function') {
			return displayCustom()
		}
		return null
	}

	const inputStyle = (): React.CSSProperties => ({
		width: `${(w / 2 + 4) >> 0}px`,
		height: `${(w / 3) >> 0}px`,
		position: 'absolute',
		verticalAlign: 'middle',
		marginTop: `${(w / 3) >> 0}px`,
		marginLeft: `-${((w * 3) / 4 + 2) >> 0}px`,
		border: 0,
		background: 'none',
		font: `${fontWeight} ${(w / digits) >> 0}px ${font}`,
		textAlign: 'center',
		color: inputColor || fgColor,
		padding: '0px',
		WebkitAppearance: 'none',
	})

	return (
		<div
			className={className}
			style={{ width: w, height: h, display: 'inline-block' }} // Assuming w and h are defined in the component
			onWheel={readOnly || disableMouseWheel ? undefined : handleWheel}
			// Assuming handleWheel is defined in the component
		>
			<canvas
				ref={canvasRef}
				className={canvasClassName}
				style={{ width: '100%', height: '100%' }}
				onMouseDown={readOnly ? undefined : handleMouseDown}
				title={title ? `${title}: ${value}` : value.toString()}
			/>
			{/* // Assuming renderCenter is defined in the component and expects the props */}
			{renderCenter({
				displayCustom,
				displayInput,
				disableTextInput,
				readOnly,
				value,
			})}
		</div>
	)
}

export default ReactCanvasKnob
