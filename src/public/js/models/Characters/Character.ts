import { Equipable, InventoryItem} from "../Items/Interfaces.js";
import Zone, { ZoneCoordinate } from "../Game Map/Zone/Zone.js";
import { Weapon } from "../Items/Weapons/Weapons.js";
import { Armor } from "../Items/Armor and Clothing/Armor.js";
import { GameEvent } from "../Events/GameEvent.js";
import StatusEffect from "../Items/Consumables/StatusEffect.js";
import Consumable from "../Items/Consumables/IConsumable.js";

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

export interface CharacterStats {
	health: {
		current: number,
		max: number,
	},
	actionPoints: number,
	speed: {
		current: number,
		base: number,
	},
	level: number,
}

abstract class Character {
	abstract name: string;
	stats: CharacterStats;
	inventory: InventoryItem[];
	equipment: CharacterEquipment;
	zoneCoords?: ZoneCoordinate;
	statusEffects: StatusEffect[] = [];
	// TODO: rework
	zone?: Zone;
	constructor(health?: number, inventory?: InventoryItem[], level?: number) {
		this.stats = {
			health: {
				current: health || 100,
				max: 100,
			},
			level: level || 1,
			actionPoints: 100,
			speed: {
				current: 100,
				base: 100,
			},
		};
		this.inventory = inventory || [];
		this.equipment = initializeEquipment();
		this.zoneCoords = undefined;
		this.zone = undefined;
	}

	get health(): number {
		return this.stats.health.current;
	}
	set health(num: number) {
		this.stats.health.current = num;
	}
	get actionPoints(): number {
		return this.stats.actionPoints;
	}
	set actionPoints(num: number) {
		this.stats.actionPoints = num;
	}
	get speed(): number {
		return this.stats.speed.current;
	}
	set speed(num: number) {
		this.stats.speed.current = num;
	}
	get level(): number {
		return this.stats.level;
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

	increaseHealth(amount: number): void {
		if (this.health + amount >= this.stats.health.max) {
			this.health = this.stats.health.max;
		}
		else {
			this.health += amount;
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

	reduceActionPoints(cost: number): void {
		this.actionPoints -= cost;
		
		if (this.actionPoints <= 0) {
			this.actionPoints = this.speed + this.actionPoints;
			this.endTurn();
		}
	}

	attack(enemy: Character): void {
		const attackPower = this.calcDamage();
		const defensePower = enemy.calcDefense();
		const defRatio: number = defensePower / (attackPower * 2);

		let finalAttackPower: number;

		if (defRatio >= .80) {
			finalAttackPower = attackPower * .2;
		} 
		else {
			finalAttackPower = attackPower * (1 - defRatio);
		} 

		const attackMessage = GameEvent.attackMessage({attacker: this, defender: enemy, damage: finalAttackPower});

		this.emitEvent(attackMessage);
		this.reduceActionPoints(50);
		enemy.reduceHealth(finalAttackPower);
	}

	restoreAP(): void {
		if (this.actionPoints < this.speed) {
			this.actionPoints = this.actionPoints + this.speed;
		} 
		if (this.actionPoints > this.speed) {
			this.actionPoints = this.speed;
		}
	}

	getAP(): number {
		return this.actionPoints;
	}

	/**
	 * WIP
	 * 
	 * Intention: 
	 * Processes status effects and determines whether a character has enough AP to 
	 * start their turn. Skips turn if not.
	 */
	startTurn(): void {
		this.restoreAP();
		const expiredEffects: StatusEffect[] = [];
		for (const effect of this.statusEffects) {
			if (effect.duration > 0) {
				effect.applyEffect(this);
			}
			if (effect.duration === 0) expiredEffects.push(effect);
		}
		if (expiredEffects.length > 0) {
			this.statusEffects = this.statusEffects.filter((effect) => {
				if (expiredEffects.includes(effect)) return false;
				return true;
			});
		}
	}

	consumeItem(item: Consumable): void {
		const effect = item.consume();
		this.statusEffects.push(effect);
		this.inventory = this.inventory.filter((inventoryItem) => {
			if (inventoryItem === item) return false;
			return true;
		});
	}

	abstract endTurn(): void;
}

export default Character;

export {CharacterEquipment};