import { Equipable, InventoryItem} from "../Items/Interfaces.js";
import Zone, { ZoneCoordinate } from "../Game Map/Zone/Zone.js";
import { Weapon } from "../Items/Weapons/Weapons.js";
import { Armor } from "../Items/Armor and Clothing/Armor.js";
import { GameEvent } from "../Events/GameEvent.js";

interface CharacterEquipment {
	weapon: Equipable | null,
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
	zoneCoords?: ZoneCoordinate;
	// TODO: rework
	zone?: Zone;
	constructor(health?: number, inventory?: InventoryItem[], level?: number) {
		this.health = health || 100;
		this.inventory = inventory || [];
		this.level = level || 1;
		this.equipment = initializeEquipment();
		this.zoneCoords = undefined;
		this.zone = undefined;
	}
	
	reduceHealth(damage: number): void {
		this.health -= damage;

		if (this.health <= 0 && this.zone) {
			this.zone.removeCharacter(this);
			const deathEvent = GameEvent.messageEvent({
				color: "red",
				message: this.generateDeathMessage(),
			});
			this.emitEvent(deathEvent);
		} 
	}

	updateCoordinates(coords: ZoneCoordinate): void {
		this.zoneCoords = coords;
	}

	updateZoneInfo(zone: Zone, coords: ZoneCoordinate): void {
		this.zone = zone;
		this.zoneCoords = coords;
	}

	calcDamage(): number {
		if (this.equipment.weapon === null) return 20;
		const weapon: Weapon = this.equipment.weapon as Weapon;

		// TODO: Implement character strength calculations when attributes are added.
		const baseDamage = weapon.getDamage();
		return baseDamage;
	}

	calcDefense(): number {
		let armorPower = 0;
		const equipment = Object.values(this.equipment);
		for (const item of equipment) {		
			if (item instanceof Armor) {
				armorPower += item.armorValue;
			}
		}
		return armorPower;
	}

	abstract generateDeathMessage(): string 

	emitEvent(evt: GameEvent): void {
		this.zone?.emitEvent(evt);
	}
}

export default Character;

export {CharacterEquipment};