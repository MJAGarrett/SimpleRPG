import Character from "../../Characters/Character.js";
import Tile from "../Tile/Tile.js";

interface ZoneCoordinate {
	row: number,
	column: number,
}

class Zone {
	area: Array<Array<Tile>>;
	constructor() {
		const area = new Array(10);

		for (let index = 0; index < area.length; index++) {
			area[index] = new Array<Tile>(10);

			for (let innerIndex = 0; innerIndex < area[index].length; innerIndex++) {
				area[index][innerIndex] = new Tile("empty");
			}
		}
		this.area = area;

	}

	/**
	 * Returns a reference to the tile at the coordinates given.
	 * 
	 * Coords = {row: 0-7, column: 0-7};
	 * @param coords
	 * @returns A tile in the game zone.
	 */
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

	moveCharacter(char: Character, coords: ZoneCoordinate): void {
		const charInTargetTile = this.getTile(coords).character;
		if (charInTargetTile) {
			this.attack(char, charInTargetTile);
		}
		else {
			this.getTile(char.zoneCoords as ZoneCoordinate).removeCharacter();
			this.getTile(coords).addCharacter(char);
			char.updateCoordinates(coords);
		}
	}

	attack(attackingChar: Character, defendingChar: Character): void {
		console.log(
			`The attacker is ${attackingChar.name}\nThe defender is ${defendingChar.name}`,
		);
		
	}

	placeCharacter(char: Character, coords: ZoneCoordinate): void {
		this.getTile(coords).addCharacter(char);
		char.updateZoneInfo(this, coords);
	}

	removeCharacter(char: Character): void {
		const tile = this.getTile(char.zoneCoords as ZoneCoordinate);
		tile.removeCharacter();
	}
}

export default Zone;

export { ZoneCoordinate };