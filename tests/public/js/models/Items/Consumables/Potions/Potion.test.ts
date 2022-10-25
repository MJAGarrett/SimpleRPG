import { expect } from "chai";
import HealthPotion from "../../../../../../../src/public/js/models/Items/Consumables/Potions/HealthPotion.js";

describe("Potion Abstract Class", () => {

	describe("consume()", () => {

		it("it should return a reference to the effect it contains", () => {
			const HPPotion = new HealthPotion(5, 5);
			const potionEffect = HPPotion.effect;
			const effect = HPPotion.consume();

			expect(effect).to.equal(potionEffect);
		});
	});
});