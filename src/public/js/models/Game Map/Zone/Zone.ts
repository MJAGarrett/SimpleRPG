import Character from "../../Characters/Character.js";
import Tile from "../Tile/Tile.js";
import game from "../../Game.js";
import { GameEvent } from "../../Events/GameEvent.js";

interface ZoneCoordinate {
	row: number,
	column: number,
}

class Zone {
	area: Array<Array<Tile>>;
	game: typeof game;
	constructor() {
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
	 * Coords = {row: 0-7, column: 0-7};
	 * @param coords
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
		try {
			const tile = this.getTile(coords);
			if (tile.checkForCharacter()) {
				this.attack(char, tile.getCharacterRef());
			}
			else {
				this.getTile(char.zoneCoords as ZoneCoordinate).removeCharacter();
				tile.addCharacter(char);
				char.updateCoordinates(coords);
			}
		} 
		catch (err) {
			console.error(err);
		}
	}

	attack(attackingChar: Character, defendingChar: Character): void {
		const attackPower = attackingChar.calcDamage();
		const defensePower = defendingChar.calcDefense();
		const defRatio: number = defensePower / (attackPower * 2);

		let finalAttackPower: number;

		if (defRatio >= .80) {
			finalAttackPower = attackPower * .2;
		} 
		else {
			finalAttackPower = attackPower * (1 - defRatio);
		} 

		const attackMessage = GameEvent.messageEvent({
			color: defendingChar === this.game.player ? "red" : "white",
			message: `${attackingChar === this.game.player ? "You deal" : attackingChar.name + " deals"} ${finalAttackPower} damage to ${defendingChar === this.game.player ? "you" : defendingChar.name}.`,
		});

		this.emitEvent(attackMessage);
		defendingChar.reduceHealth(finalAttackPower);
	}

	placeCharacter(char: Character, coords: ZoneCoordinate): void {
		this.getTile(coords).addCharacter(char);
		char.updateZoneInfo(this, coords);
	}

	removeCharacter(char: Character): void {
		const tile = this.getTile(char.zoneCoords as ZoneCoordinate);
		tile.removeCharacter();
	}

	emitEvent(evt: GameEvent): void {
		this.game.handleEvent(evt);
	}
}

export default Zone;

export { ZoneCoordinate };