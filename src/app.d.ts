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
    
    type TpowerOfTwo = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048; //! unsatisfactory
}

export {};
