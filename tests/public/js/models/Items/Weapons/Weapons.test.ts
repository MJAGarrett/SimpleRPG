import chai from "chai";
import sinon from "sinon";

import Sword from "../../../../../../src/public/js/models/Items/Weapons/Sword.js";
import WeaponBuilder from "../../../../../../src/public/js/models/Items/Weapons/WeaponBuilder.js";

const expect = chai.expect;

describe("WeaponBuilder", () => {
	let swordBuilder: WeaponBuilder<Sword>;

	beforeEach(() => {
		swordBuilder = new WeaponBuilder(Sword);
	});

	describe("setDamage()", () => {
		it("it should set the damage variable on the swordBuilder", () => {
			swordBuilder.setDamage(50);

			chai.expect(swordBuilder.damage).to.equal(50);

			swordBuilder.setDamage(22);

			chai.expect(swordBuilder.damage).to.not.equal(50);
		});

		it("it should return the swordBuilder instance to allow for chaining methods", () => {
			const builder = swordBuilder.setDamage(20);
			expect(builder).to.deep.equal(swordBuilder);
		});
	});

	describe("setQuality()", () => {
		it("it should set the quality on the sword builder", () => {
			const quality = { prefix: "Fine", effectivenessMult: 1.33};
			swordBuilder.setQuality("fine");
			expect(swordBuilder.quality.prefix).to.equal(quality.prefix);
			expect(swordBuilder.quality.effectivenessMult).to.equal(quality.effectivenessMult);
		});

		it("it should return the swordBuilder instance to allow for chaining methods", () => {
			const builder = swordBuilder.setQuality("fine");
			expect(builder).to.deep.equal(swordBuilder);
		});
	});

	describe("resetDefaults()", () => {
		it("it should reset parameters to default state", () => {
			const initialDamage = swordBuilder.damage;
			const initialQuality = swordBuilder.quality;

			swordBuilder.setDamage(55).setQuality("low");
			
			swordBuilder.resetDefaults();

			expect(swordBuilder.damage).to.equal(initialDamage);
			expect(swordBuilder.quality).to.equal(initialQuality);
		});
	});

	describe("build()", () => {
		it("It should return an instance of the weapon it was instructed to make at instantiation", () => {
			const sword = swordBuilder.build();
			chai.expect(sword instanceof Sword).to.true;

			// TODO: Add more tests for different types weapons. 
		});

		it("it should return a weapon with custom stats if setter methods have been called", () => {
			const quality = { prefix: "Fine", effectivenessMult: 1.33};
			const sword = swordBuilder.setDamage(20).setQuality("fine").build();

			expect(sword.damage).to.equal(20 * quality.effectivenessMult);
			expect(sword.quality.prefix).to.equal(quality.prefix);
			expect(sword.quality.effectivenessMult).to.equal(quality.effectivenessMult);
		});

		it("it should call resetDefaults() to reset its parameters", () => {
			const swordSpy = sinon.spy(swordBuilder, "resetDefaults");
			swordBuilder.build();

			swordSpy.restore();
			expect(swordSpy.calledOnce).to.be.true;

		});
	});

});

describe("Sword", () => {
	let sword: Sword;
	beforeEach(() => {
		sword = new Sword();
	});

	describe("getDamage()", () => {
		it("it should return the damage", () => {
			expect(sword.getDamage()).to.equal(35);
		});
	});

	describe("setDamage()", () => {
		it("it should set the damage of a sword to the input value", () => {
			sword.setDamage(55);
			expect(sword.damage).to.equal(55);
		});
	});

	describe("getFullname()", () => {
		it("it should return the name of the item", () => {
			expect(sword.getFullname()).to
				.equal(sword.quality.prefix + " " + sword.type )
				.and.equal("Regular Sword");
		});
	});
});