import { ItemQuality } from "../../Interfaces.js";
import Consumable from "../IConsumable.js";
import StatusEffect from "../StatusEffect.js";

abstract class Potion implements Consumable {
	abstract name: string;
	abstract effect: StatusEffect;
	abstract liquidColor: string;
	abstract type: "potion" | "poison";
	abstract quality: ItemQuality;
	weight: number = 5;
	consume(): StatusEffect {
		return this.effect;
	}
}

export default Potion;