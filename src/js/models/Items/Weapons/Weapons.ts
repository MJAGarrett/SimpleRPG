import { Equipable, WeaponSlot, ItemQuality } from "../Interfaces.js";

abstract class Weapon implements Equipable {
	abstract weight: number;
	abstract type: string;
	damage: number;
	baseDamage: number;
	quality: ItemQuality;
	equipSlot: WeaponSlot = "weapon";
	constructor(params: WeaponBasics) {
		const {damage, quality} = params;
		this.baseDamage = damage;
		this.damage = damage * quality.effectivenessMult;
		this.quality = quality;
	}
	getDamage(): number {
		return this.damage;
	}
	setDamage(newDamage: number): void {
		this.damage = newDamage;
	}
	abstract getFullname(): string;
}

type WeaponBasics = {
	damage: number,
	quality: ItemQuality
}

export { Weapon, WeaponBasics };