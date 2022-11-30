import { GameEvent } from "../Events/GameEvent";
import { ZoneCoordinate } from "../Game Map/Zone/Zone";
import { Equipable } from "../Items/Interfaces";
import Character, {CharacterEquipment, CharacterStats} from "./Character";

type EquipSlot = keyof CharacterEquipment;

interface MovementCommand {
	vertical?: "up" | "down",
	horizontal?: "left" | "right",
}

interface PlayerStats extends CharacterStats {
	experience: number;
}

class Player extends Character {
	name: string;
	stats: PlayerStats;
	constructor() {
		super();
		this.stats = {
			level: 1,
			health: {
				current: 100,
				max: 100,
			},
			speed: {
				current: 100,
				base: 100,
			},
			actionPoints: 100,
			experience: 0,
		};
		this.name = "Player";
	}
	get health(): number {
		return this.stats.health.current;
	}
	get actionPoints(): number {
		return this.stats.actionPoints;
	}
	get speed(): number {
		return this.stats.speed.current;
	}
	get level(): number {
		return this.stats.level;
	}
	set health(num: number) {
		this.stats.health.current = num;
		this.UIChange();
	}
	set actionPoints(num: number) {
		this.stats.actionPoints = num;
		this.UIChange();
	}
	set speed(num: number) {
		this.stats.speed.current = num;
		this.UIChange();
	}
	private set level(level: number) {
		this.stats.level = level;
		this.UIChange();
	}
	get experience(): number {
		return this.stats.experience;
	}
	set experience(num: number) {
		this.stats.experience = num;
	}

	/**
	 * Overwritten to induce a UI update.
	 * @param item 
	 */
	equipItem(item: Equipable): void {
		this.inventory.equipItem(item);
		this.UIChange();
	}

	/**
	 * Overwritten to induce a UI update.
	 * @param slot 
	 * @returns 
	 */
	unequipItem(slot: EquipSlot): Equipable | null {
		try {
			const item = this.inventory.unequipItem(slot);
			this.UIChange();
			return item;
		}
		catch {
			return null;
		}
	}

	/**
	 * 
	 * @param input 
	 * @throws Will throw an error if the player does not have a zoneCoords or does not have a zone
	 * reference.
	 */
	handleInput(input: MovementCommand): void {
		if (!this.zoneCoords || !this.zone) throw new Error("Character not placed in a zone");
		let { row, column }: ZoneCoordinate = this.zoneCoords;
		if (input.horizontal) {
			if (input.horizontal === "left") {
				column -= 1;
			} 
			else {
				column += 1;
			}
		}
		if (input.vertical) {
			if (input.vertical === "up") {
				row -= 1;
			} 
			else {
				row += 1;
			}
		}
		let enemy: Character | null;
		try {
			// getTile could throw if if looking for a tile that's out of bounds.
			enemy = this.zone.getTile({row, column}).getCharacterRef();
		} 
		catch (err) {
			// Just prevent further processing.
			return;
		}
		if (enemy) {
			this.attack(enemy);
		}
		else {
			this.reduceActionPoints(100);
			this.zone.moveCharacter(this, {row, column});
		}
	}

	generateDeathMessage(): string {
		return "You have died.";
	}

	UIChange() {
		this.emitEvent(GameEvent.playerUIChange());
	}

	endTurn(): void {
		this.takingTurn = false;
		this.emitEvent(GameEvent.endTurnEvent());
	}

	startTurn(): void {
		/**
		 * TODO: Take away input processing for the player actor when ending a turn and restore it
		 * when beginning a new turn.
		 */
	}
}

export default Player;

export { MovementCommand };