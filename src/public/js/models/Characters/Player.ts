import { GameEvent } from "../Events/GameEvent.js";
import { ZoneCoordinate } from "../Game Map/Zone/Zone.js";
import { Equipable, InventoryItem } from "../Items/Interfaces.js";
import Character, {CharacterEquipment, CharacterStats} from "./Character.js";

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
	 * Adds an item to the player's inventory.
	 * @param item An inventory item to add to player's inventory;
	 */
	addItem(item: InventoryItem): void {
		this.inventory.push(item);
	}

	getInventory(): InventoryItem[] {
		return this.inventory;
	}

	equipItem(item: Equipable): void {
		if (!this.checkIfEquipSlotEmpty(item.equipSlot))
			this.inventory.push(this.equipment[item.equipSlot] as InventoryItem);
		this.equipment[item.equipSlot] = item;

		this.UIChange();
	}

	checkIfEquipSlotEmpty(slot: EquipSlot): boolean {
		return this.equipment[slot] === null;
	}

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
		this.emitEvent(GameEvent.endTurnEvent());
	}
}

export default Player;

export { MovementCommand };