import { expect } from "chai";
import NPCGenerator from "../../../../../../src/public/js/models/Characters/NPCs/NPCGenerator.js";

describe("NPC Abstract Class", () => {

	describe("generateDeathMessage", () => {
		
		it("it should return a string of \"{NPCName} has died.\"", () => {
			const swordsman = NPCGenerator.swordsman();
			expect(swordsman.generateDeathMessage()).to.equal(`${swordsman.name} has died.`);
		});
	});
});