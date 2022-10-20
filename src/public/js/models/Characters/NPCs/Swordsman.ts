import Sword from "../../Items/Weapons/Sword.js";
import NPC from "./NPC.js";

class Swordsman extends NPC {
	name: string;
	constructor() {
		super();
		this.name = "Swordsman";
		this.equipment.weapon = new Sword();
	}
}

export default Swordsman;