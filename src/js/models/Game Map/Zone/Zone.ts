import Tile from "../Tile/Tile.js";

interface ZoneCoordinate {
	row: number,
	column: number
}

class Zone {
	area: Array<Array<Tile>>;
	constructor() {
		this.area = new Array(10).fill(new Array(10).fill(new Tile("empty")));
	}

	getTile(coords: ZoneCoordinate): Tile {
		const { row, column } = coords;
		const errors: string[] = [];

		if (row > 7 || row < 0) errors.push("Row out of bounds.");
		if (column > 7 || column < 0) errors.push("Column out of bounds");

		if (errors.length > 0) {
			const message = errors.reduce((message, curr) => {
				return message + curr + "\n";
			}, "");
			throw new Error(message);
		}

		return this.area[row][column];
	}
}

export default Zone;

export { ZoneCoordinate };