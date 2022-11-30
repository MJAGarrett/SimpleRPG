import { Equipable, EquipSlot, InventoryItem } from "../Items/Interfaces";
import Zone, { ZoneCoordinate } from "../Game Map/Zone/Zone";
import { Weapon } from "../Items/Weapons/Weapons";
import { Armor } from "../Items/Armor and Clothing/Armor";
import { GameEvent } from "../Events/GameEvent";
import StatusEffect from "../Items/Consumables/StatusEffect";
import Consumable from "../Items/Consumables/IConsumable";
import InventoryManager from "./InventoryManager";

interface CharacterEquipment {
	weapon: Equipable | null,
	headwear: Equipable | null,
	shirt: Equipable | null,
	pants: Equipable | null,
	footwear: Equipable | null,
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
	inventory: InventoryManager;
	zoneCoords?: ZoneCoordinate;
	statusEffects: StatusEffect[] = [];
	zone?: Zone;
	takingTurn: boolean = false;
	constructor(health?: number, level?: number) {
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
		this.inventory = new InventoryManager();
		this.zoneCoords = undefined;
		this.zone = undefined;
	}

	get equipment(): CharacterEquipment {
		return this.inventory.equippedItems;
	}
	set equipment(eq: CharacterEquipment) {
		this.inventory.equippedItems = eq;
	}

	get money(): number {
		return this.inventory.currentCurrency;
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
	private set level(level: number) {
		this.stats.level = level;
	}

	getBaseWeaponDamage(): number {
		if (this.equipment.weapon === null) return 20;
		
		const weapon: Weapon = this.equipment.weapon as Weapon;
		return weapon.getDamage();
	}

	levelUp() {
		this.level++;
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
		const baseDamage = this.getBaseWeaponDamage();
		// TODO: Implement character strength calculations when attributes are added.
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

	preprocessTurn(): void {
		this.restoreAP();
		this.processStatusEffects();

		if (this.actionPoints <= 0) {
			this.endTurn();
		}
		else {
			this.takingTurn = true;
			this.startTurn();
		}
	}

	abstract startTurn(): void;

	consumeItem(item: Consumable): void {
		const effect = item.consume();
		this.statusEffects.push(effect);
		this.inventory.removeItem(item);
	}

	addItem(item: InventoryItem): void {
		this.inventory.addItem(item);
	}

	removeItem(item: InventoryItem): void {
		this.inventory.removeItem(item);
	}

	getInventory(): InventoryItem[] {
		return this.inventory.getInventory();
	}

	equipItem(item: Equipable): void {
		this.inventory.equipItem(item);
	}

	unequipItem(slot: EquipSlot): Equipable | null {
		try {
			const item = this.inventory.unequipItem(slot);
			return item;
		}
		catch (err) {
			console.error(err);
			return null;
		}
	}

	addCurrency(amount: number): void {
		this.inventory.addCurrency(amount);
	}

	/**
	 * 
	 * @param amount 
	 * @throws Throws an error if the character's InventoryManager's reduceCurrency function also
	 * throws an error. Further handling will be necessary in higher-up calling functions.
	 */
	reduceCurrency(amount: number): void {
		try {
			this.inventory.reduceCurrency(amount);
		}
		catch (err) {
			console.error(err);
			throw err;
		}
	}

	processStatusEffects(): void {
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

	endTurn(): void {
		this.takingTurn = false;
	}
}

export default Character;

export {CharacterEquipment};