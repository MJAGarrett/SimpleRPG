import Sword from "../../Items/Weapons/Sword";
import NPC from "./NPC";

class Swordsman extends NPC {
	name: string;
	constructor() {
		super();
		this.name = "Swordsman";
		this.equipment.weapon = new Sword();
	}
}

export default Swordsman;