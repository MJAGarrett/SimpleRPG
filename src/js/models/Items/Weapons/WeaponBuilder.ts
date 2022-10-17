import { ItemQuality } from "../Interfaces.js";
import Qualities from "../ItemQuality.js";
import { Weapon } from "./Weapons.js";

type WeaponBasics = {
	damage: number,
	quality: ItemQuality
}

class WeaponBuilder<T extends Weapon > {
	damage: number;
	quality: ItemQuality;
	build: () => T;
	// eslint-disable-next-line no-unused-vars
	constructor(c: new (params: WeaponBasics) => T) {
		this.damage = 35;
		this.quality = Qualities.standard;
		this.build = (): T => {
			const params: WeaponBasics = {
				damage: this.damage,
				quality: this.quality,
			};
			this.resetDefaults();
			return new c(params);
		};
	}
	/**
	 * Sets the damage for the weapon to be constructed.
	 * @param damage A number representing the damage for the weapon to do.
	 * @returns This instance of WeaponBuilder to allow for method chaining.
	 */
	setDamage(damage: number): WeaponBuilder<T> {
		this.damage = damage;
		return this;
	}

	/**
	 * Sets the quality of weapon to create from this builder.
	 * @param quality A string representing the quality of weapon to create
	 * @returns The instance of WeaponBuilder to allow for chaining methods.
	 */
	setQuality(quality: "low" | "fine" | "standard"): WeaponBuilder<T> {
		switch(quality) {
		case "fine": 
			this.quality = Qualities[quality];
			break;
		case "low": 
			this.quality = Qualities[quality];
			break;
		default:
			this.quality = Qualities[quality];
		}
		return this;
	}

	/**
	 * Resets the builder parameters to the defaults.
	 */
	resetDefaults(): void {
		this.damage = 35;
		this.quality = Qualities.standard;
	}
}

export default WeaponBuilder;