import { ZoneCoordinate } from "../Game Map/Zone/Zone.js";
import { Equipable, InventoryItem } from "../Items/Interfaces.js";
import Character, {CharacterEquipment} from "./Character.js";

type EquipSlot = keyof CharacterEquipment;

interface MovementCommand {
	vertical?: "up" | "down",
	horizontal?: "left" | "right",
}

class Player extends Character {
	name: string;
	experience: number;
	constructor() {
		super();
		this.experience = 0;
		this.name = "Player";
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
	}

	checkIfEquipSlotEmpty(slot: EquipSlot): boolean {
		return this.equipment[slot] === null;
	}

	move(input: MovementCommand): void {
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
		if (this.zone) {
			this.zone.moveCharacter(this, {row, column});
		}
		else throw new Error("Zone not setup");
	}
}

export default Player;