import { expect } from "chai";
import Swordsman from "../../../../../src/public/js/models/Characters/NPCs/Swordsman.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent.js";

describe("GameEvent Abstract Class", () => {

	describe("Static Methods", () => {
		
		describe("messageEvent()", () => {
			
			it("it should return an instance of message event with properties defined by input", () => {
				const message = "Test message";
				const color = "blue";
				const event = GameEvent.messageEvent({ color, message });

				expect(event.type === "MESSAGE").to.be.true;
				expect(event.details.color).to.equal(color);
				expect(event.details.message).to.equal(message);
			});
		});

		describe("attackEvent()", () => {

			it("it should return an instance of MessageEvent with the given details", () => {
				const testAttacker = new Player();
				const testDefender = new Swordsman();
				const testDamage = 20;
				const expectedMessage = "You deal 20 damage to Swordsman.";
				const expectedColor = "white";

				const event = GameEvent.attackMessage({
					attacker: testAttacker,
					defender: testDefender,
					damage: testDamage,
				});

				expect(event.type === "MESSAGE").to.be.true;
				expect(event.details.message).to.be.equal(expectedMessage);
				expect(event.details.color).to.equal(expectedColor);
			});
		});

		describe("endTurnEvent()", () => {
			
			it("it should return an instance of EndTurnEvent", () => {
				const event = GameEvent.endTurnEvent();

				expect(event.type === "TURN_OVER").to.be.true;
			});
		});

		describe("moveEvent()", () => {
			
			it("it should return an instance of MoveEvent", () => {
				const event = GameEvent.moveEvent({});

				expect(event.type === "MOVE").to.be.true;
			});
		});

	});
});

/**
 * Tests for the various GameEvent subclasses are, as of yet, unnecessary. The above
 * tests on GameEvent's static methods implicitly test the constructors/properties
 * of each subclass. The current (10/22/2022) subclasses have no unique behaviors;
 * as such, the above tests cover all salient aspects of the subclasses.
 */