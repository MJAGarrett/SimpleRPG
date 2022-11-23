import { expect } from "chai";
import NPCGenerator from "../../../../../../src/public/js/models/Characters/NPCs/NPCGenerator";
import Swordsman from "../../../../../../src/public/js/models/Characters/NPCs/Swordsman";

describe("NPCGenerator Class", () => {

	describe("Methods", () => {

		describe("swordsman()", () => {
			
			it("it should return a new Swordsman reference", () => {
				const swordsman = NPCGenerator.swordsman();

				expect(swordsman instanceof Swordsman).to.be.true;
			});
		});
	});
});