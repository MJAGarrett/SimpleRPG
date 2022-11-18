import Qualities from "../ItemQuality.js";
import { Weapon, WeaponBasics } from "./Weapons.js";

class Sword extends Weapon {
	type: string;
	weight: number;
	constructor(params: WeaponBasics = {damage: 35, quality: Qualities.standard}) {
		super(params);
		const {quality} = params;
		this.weight = 10 * quality.effectivenessMult;
		this.type = "Sword";
	}
}

export default Sword;