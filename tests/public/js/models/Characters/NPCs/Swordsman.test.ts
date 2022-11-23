import { expect } from "chai";
import Swordsman from "../../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import Sword from "../../../../../../src/public/js/models/Items/Weapons/Sword";

describe("NPCGenerator Class", () => {

	describe("Constructor", () => {
		let swordsman: Swordsman;
		before(() => {
			swordsman = new Swordsman();
		});

		it("it should initialize a Swordsman instance with the name \"Swordsman\"", () => {
			expect(swordsman.name).to.equal("Swordsman");
		});

		it("it should initialize the swordsman with a sword as their weapon", () => {
			expect(swordsman.equipment.weapon instanceof Sword).to.be.true;
		});
	});
});