import Qualities from "../ItemQuality";
import { Weapon } from "./Weapons";

class Unarmed extends Weapon {
	type: string;
	weight: number;
	constructor() {
		super({damage: 20 ,quality: Qualities.standard});
		this.type = "Unarmed";
		this.weight = 0;
	}
	getFullname(): string {
		return this.type;
	}
}

export default Unarmed;