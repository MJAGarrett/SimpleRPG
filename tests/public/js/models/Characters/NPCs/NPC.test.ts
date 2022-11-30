import { expect } from "chai";
import Sinon from "sinon";
import NPCGenerator from "../../../../../../src/public/js/models/Characters/NPCs/NPCGenerator";

describe("NPC Abstract Class", () => {

	describe("generateDeathMessage", () => {
		
		it("it should return a string of \"{NPCName} has died.\"", () => {
			const swordsman = NPCGenerator.swordsman();
			expect(swordsman.generateDeathMessage()).to.equal(`${swordsman.name} has died.`);
		});
	});

	describe("startTurn()", () => {
		const swordsman = NPCGenerator.swordsman();
		const AIStub = Sinon.stub(swordsman.AI, "takeTurn");

		after(() => {
			AIStub.restore();
		});

		it("it should call the NPC's AI's startTurn() method", () => {
			swordsman.startTurn();

			expect(AIStub.calledOnce).to.be.true;
		});
	});
});