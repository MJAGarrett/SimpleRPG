import { Equipable, InventoryItem} from "../Items/Interfaces.js";
import Zone, { ZoneCoordinate } from "../Game Map/Zone/Zone.js";

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
	abstract name: string;
	health: number;
	inventory: InventoryItem[];
	level: number;
	equipment: CharacterEquipment;
	zoneCoords: ZoneCoordinate;
	// TODO: rework
	zone?: Zone;
	constructor(health?: number, inventory?: InventoryItem[], level?: number) {
		this.health = health || 100;
		this.inventory = inventory || [];
		this.level = level || 1;
		this.equipment = initializeEquipment();
		this.zoneCoords = {row: 0, column: 0};
		this.zone = undefined;
	}
	
	reduceHealth(damage: number): void {
		this.health -= damage;
	}

	updateCoordinates(coords: ZoneCoordinate): void {
		this.zoneCoords = coords;
	}
}

export default Character;

export {CharacterEquipment};