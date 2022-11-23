import { expect } from "chai";
import Sinon from "sinon";
import Character from "../../../../../../src/public/js/models/Characters/Character";
import Swordsman from "../../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import { Heal } from "../../../../../../src/public/js/models/Items/Consumables/StatusEffect";

describe("Heal Class", () => {
	let effect: Heal;
	let character: Character;
	beforeEach(() => {
		effect = new Heal(5, 5);
		character = new Swordsman();
	});

	describe("applyEffect()", () => {
		
		it("it should call reduceDuration()", () => {
			const stub = Sinon.stub(effect, "reduceDuration");
			effect.applyEffect(character);
			stub.restore();

			expect(stub.calledOnce).to.be.true;
		});

		it("it should call a character's increaseHealth() method with its magnitude", () => {
			const stub = Sinon.stub(character, "increaseHealth");
			effect.applyEffect(character);
			stub.restore();

			expect(stub.calledWith(effect.magnitude)).to.be.true;
		});
	});
});