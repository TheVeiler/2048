// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace Board {
		type TslideCondition = (x: number, y: number) => boolean;
		type TslideStep = (x: number, y: number) => number[];
	}

	namespace Tile {
		type Tstyle = { bgColor: string; color: string; fontSize: string };
		type TsortingFunction = (tileA: Tile, tileB: Tile) => number;
	}

	//! unsatisfactory when slotsPerRow/Col != 4
	//! we can use number but then we lose the precision of being a power of 2
	type TpowerOfTwo = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}

export {};
