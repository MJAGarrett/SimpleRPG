import { ItemQuality } from "../../Interfaces";
import Qualities from "../../ItemQuality";
import StatusEffect from "../StatusEffect";
import Potion from "./Potion";

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