import { ItemQuality } from "../../Interfaces";
import Consumable from "../IConsumable";
import StatusEffect from "../StatusEffect";

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
	getFullname(): string {
		return this.name;
	}
}

export default Potion;