import Character from "../../Characters/Character";
import Tile from "../Tile/Tile";
import { GameEvent } from "../../Events/GameEvent";
import Game from "../../Game";
import NPC from "../../Characters/NPCs/NPC";
import Player from "../../Characters/Player";

interface ZoneCoordinate {
	row: number,
	column: number,
}

class Zone {
	area: Array<Array<Tile>>;
	npcs: Set<Character> = new Set<Character>();
	game: Game;
	player: Player | null = null;
	constructor(game: Game) {
		const area = new Array(10);

		for (let index = 0; index < area.length; index++) {
			area[index] = new Array<Tile>(10);

			for (let innerIndex = 0; innerIndex < area[index].length; innerIndex++) {
				area[index][innerIndex] = new Tile("empty");
			}
		}
		this.area = area;
		this.game = game;
	}

	/**
	 * Returns a reference to the tile at the coordinates given.
	 * 
	 * Coords = {row: 0-9, column: 0-9};
	 * @param coords
	 * @throws Will throw an error if row or column coords are out of bounds.
	 * @returns A tile in the game zone.
	 */
	getTile(coords: ZoneCoordinate): Tile {
		const { row, column } = coords;
		const errors: string[] = [];

		if (row > 9 || row < 0) errors.push("Row out of bounds.");
		if (column > 9 || column < 0) errors.push("Column out of bounds");

		if (errors.length > 0) {
			const message = errors.reduce((message, curr) => {
				return message + curr + "\n";
			}, "");
			throw new Error(message);
		}

		return this.area[row][column];
	}

	moveCharacter(char: Character, coords: ZoneCoordinate): void {
		const tile = this.getTile(coords);
		if (!tile.checkForCharacter()) {
			this.getTile(char.zoneCoords as ZoneCoordinate).removeCharacter();
			tile.addCharacter(char);
			char.updateCoordinates(coords);
			this.emitEvent(GameEvent.moveEvent({}));
		}
	}

	placeCharacter(char: Character, coords: ZoneCoordinate): void {
		this.getTile(coords).addCharacter(char);
		char.updateZoneInfo(this, coords);

		if (char instanceof NPC) {
			this.npcs.add(char);
		}
		else if (char instanceof Player) {
			this.player = char;
		}
	}

	removeCharacter(char: Character): void {
		const tile = this.getTile(char.zoneCoords as ZoneCoordinate);
		tile.removeCharacter();

		if (char instanceof NPC && this.npcs.has(char)) {
			this.npcs.delete(char);
		}
		else if (char instanceof Player) {
			this.player = null;
		}
	}

	emitEvent(evt: GameEvent): void {
		this.game.handleEvent(evt);
	}
}

export default Zone;

export { ZoneCoordinate };