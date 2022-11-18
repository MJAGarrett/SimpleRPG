import Qualities from "../ItemQuality.js";
import { ArmorSlot, Equipable, ItemQuality } from "../Interfaces.js";

abstract class Armor implements Equipable {
	abstract equipSlot: ArmorSlot;
	abstract type: string;
	abstract quality: ItemQuality;
	abstract weight: number;
	armorValue: number;
	color: string;
	constructor(protection: number, color: string) {
		this.armorValue = protection;
		this.color = color;
	}
	getFullname(): string {
		return this.quality.prefix + " " + this.type;
	}
}

/**
 * ************************
 * End of code not specific
 * to a piece of armor
 * ************************
 */

class Helmet extends Armor {
	equipSlot: ArmorSlot;
	type: string;
	quality: ItemQuality;
	weight: number;
	constructor(
		protection: number = 10, 
		color: string = "gray", 
		quality: ItemQuality = Qualities.standard,
	) {
		super(protection, color);
		this.equipSlot = "headwear";
		this.type = "Helmet";
		this.quality = quality;
		this.weight = 5;
	}
}

class Breastplate extends Armor {
	equipSlot: ArmorSlot;
	type: string;
	quality: ItemQuality;
	weight: number;
	constructor(
		protection: number = 20, 
		color: string = "gray", 
		quality: ItemQuality = Qualities.standard,
	) {
		super(protection, color);
		this.equipSlot = "shirt";
		this.type = "Breastplate";
		this.quality = quality;
		this.weight = 25;
	}
}

export {Armor, Helmet, Breastplate};