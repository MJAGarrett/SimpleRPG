import { Equipable, InventoryItem} from "../Items/Interfaces.js";

interface CharacterEquipment {
	weapon: Equipable | null
	headwear: Equipable | null,
	shirt: Equipable | null,
	pants: Equipable | null,
	footwear: Equipable | null,
}

function initializeEquipment(): CharacterEquipment {
	const basicEquipment = {
		weapon: null,
		headwear: null,
		shirt: null,
		pants: null,
		footwear: null,
	};
	return basicEquipment;
}

abstract class Character {
	health: number;
	inventory: InventoryItem[];
	level: number;
	equipment: CharacterEquipment;
	constructor(health?: number, inventory?: InventoryItem[], level?: number) {
		this.health = health || 100;
		this.inventory = inventory || [];
		this.level = level || 1;
		this.equipment = initializeEquipment();
	}
	
	reduceHealth(damage: number): void {
		this.health -= damage;
	}
}

export default Character;

export {CharacterEquipment};