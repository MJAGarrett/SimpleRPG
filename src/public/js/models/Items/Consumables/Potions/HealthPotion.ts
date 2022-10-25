import { ItemQuality } from "../../Interfaces.js";
import Qualities from "../../ItemQuality.js";
import StatusEffect from "../StatusEffect.js";
import Potion from "./Potion.js";

export default class HealthPotion extends Potion {
	type: "potion" | "poison" = "potion";
	quality: ItemQuality;
	name: string;
	liquidColor: string;
	effect: StatusEffect;
	constructor(mag: number, dur: number) {
		super();
		this.effect = StatusEffect.HealEffect(mag, dur);
		this.liquidColor = "red";
		this.name = "Health Potion";
		this.quality = Qualities.standard;
	}
}