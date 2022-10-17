import { Equipable, InventoryItem } from "../Items/Interfaces.js";
import Character, {CharacterEquipment} from "./Character.js";

type EquipSlot = keyof CharacterEquipment;

class Player extends Character {
	experience: number;
	constructor() {
		super();
		this.experience = 0;
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
		if(!this.checkIfEquipSlotEmpty(item.equipSlot))
			this.inventory.push(this.equipment[item.equipSlot] as InventoryItem);
		this.equipment[item.equipSlot] = item;
	}

	checkIfEquipSlotEmpty(slot: EquipSlot): boolean {
		return this.equipment[slot] === null;
	}

}

export default Player;