export function load({ cookies }) {
	const bestScore = parseInt(cookies.get('best score') ?? '0');

	return {
		bestScore
	};
}
