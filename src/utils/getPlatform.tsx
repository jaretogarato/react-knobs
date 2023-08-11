export function getPlatform() {
	if (typeof navigator.userAgent !== 'undefined') {
		if (/android/.test(navigator.userAgent.toLowerCase())) {
			return 'android'
		}
		return navigator.platform
	}

	return 'unknown'
}
