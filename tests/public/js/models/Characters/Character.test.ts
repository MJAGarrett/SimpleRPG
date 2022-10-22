import { expect } from "chai";
import Sinon from "sinon";
import Character from "../../../../../src/public/js/models/Characters/Character.js";
import Swordsman from "../../../../../src/public/js/models/Characters/NPCs/Swordsman.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent.js";
import Zone, { ZoneCoordinate } from "../../../../../src/public/js/models/Game Map/Zone/Zone.js";
import { Breastplate, Helmet } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword.js";

describe("Character Abstract Class", () => {

	describe("Methods", () => {

		let player: Character;

		beforeEach(() => {
			player = new Player();
		});

		describe("reduceHealth()", () => {
			it("should reduce the character's health by an input", () => {
				const previousHealth = player.health;
	
				player.reduceHealth(20);
	
				expect(player.health).to.equal(previousHealth - 20);
			});

			it("it should call the character's zone's removeCharacter() method with the character only if their health is reduced to 0 or below", () => {
				const tempZone = new Zone();
				tempZone.placeCharacter(player, {row: 2, column: 0});
				player.health = 100;
				const nonLethalReduction = player.health / 2;

				const spy = Sinon.spy(tempZone, "removeCharacter");

				player.reduceHealth(nonLethalReduction);

				expect(spy.called).to.be.false;
				
				player.reduceHealth(player.health + 10);

				expect(spy.calledOnceWithExactly(player)).to.be.true;
			});

			it("it should call the character's emitEvent() method with a deathMessage when the character's health falls to 0 or below", () => {
				const tempZone = new Zone();
				tempZone.placeCharacter(player, {row: 0, column: 0});

				const dmgToKill = player.health * 2;
				const spy = Sinon.spy(player, "emitEvent");
				const expectedMessage = JSON.stringify(GameEvent.messageEvent({
					color: "red",
					message: player.generateDeathMessage(),
				}));

				player.reduceHealth(dmgToKill);

				expect(spy.calledOnce).to.be.true;
				const [recievedMessage] = spy.args[0];
				const actualMessage = JSON.stringify(recievedMessage);
				
				expect(actualMessage === expectedMessage).to.be.true;
			});
		});

		describe("updateCoordinates()", () => {

			it("it should update a character's zoneCoords property", () => {
				player.zoneCoords = {row: 0, column: 0};

				const newCoordinates: ZoneCoordinate = {row: 2, column: 5 };
				player.updateCoordinates(newCoordinates);
				const { row, column } = player.zoneCoords;

				expect(row).to.equal(2);
				expect(column).to.equal(5);
			});
		});

		describe("updateZoneInfo()", () => {
			const zone: Zone = new Zone();

			it("it should update a player's zone property and its zoneCoords property", () => {
				player.updateZoneInfo(zone, {row: 0, column: 0});

				expect(player.zone).to.equal(zone);
				expect(player.zoneCoords?.row).to.equal(0);
				expect(player.zoneCoords?.column).to.equal(0);
			});
		});

		describe("calcDamage()", () => {
			beforeEach(() => {
				player.equipment.weapon = new Sword();
			});

			it("it should return a base amount of damage if the character does not have a weapon equipped", () => {
				player.equipment.weapon = null;
				const returnValue = player.calcDamage();
				expect(returnValue).to.be.a("number");
			});

			it("it should return a number derived from the character's weapon's damage", () => {
				const returnValue = player.calcDamage();
				expect(returnValue).to.be.a("number");
			});

			it("it should call the character's weapon's getDamage() method", () => {
				const spy = Sinon.spy(player.equipment.weapon as Sword, "getDamage");
				player.calcDamage();

				expect(spy.calledOnce).to.be.true;
				expect(spy.returnValues[0]).to.be.a("number");
			});
		});

		describe("calcDefense()", () => {
			const helmet = new Helmet();
			const breastplate = new Breastplate();
			beforeEach(() => {
				player.equipment.headwear = helmet;
				player.equipment.shirt = breastplate;
			}); 

			it("it should add the armor value of each piece of armor together and return it", () => {
				const expected = helmet.armorValue + breastplate.armorValue;

				const actual = player.calcDefense();

				expect(actual).to.equal(expected);
			});
		});

		describe("reduceActionPoints()", () => {

			it("it should reduce a character's action points by a specific amount", () => {
				const reduction = 20;
				const APBefore = player.actionPoints;
				player.reduceActionPoints(reduction);
				const APAfter = player.actionPoints;

				expect(APBefore - APAfter).to.equal(reduction);
			});

			it("it should call endTurn() if action points are reduced to 0 or below", () => {
				const spy = Sinon.spy(player, "endTurn");
				player.reduceActionPoints(120);
				expect(spy.calledOnce).to.be.true;
			});
		});

		describe("attack()", () => {
			let player: Player;
			let enemy: Swordsman;
			beforeEach(() => {
				player = new Player();
				player.equipItem(new Sword());
				enemy = new Swordsman();
			});

			it("it should call the attacking character's calcDamage() method and save the result", () => {
				const spiedAttacker = Sinon.spy(player, "calcDamage");

				player.attack(enemy);

				expect(spiedAttacker.calledOnce).to.be.true;
				expect(spiedAttacker.returnValues[0]).to.be.a("number");
			});

			it("it should call the defending character's calcDefense() method and save the result", () => {
				const spiedDefender = Sinon.spy(enemy, "calcDefense");

				player.attack(enemy);

				expect(spiedDefender.calledOnce).to.be.true;
				expect(spiedDefender.returnValues[0]).to.be.a("number");
			});

			it("it should calculate an attack value and subtract it from the defending character's health", () => {

				/**
				 * The current formula for calculating damage negation:
				 * defense / (attack * 2) = reduction %
				 * cap reduction at 80%.
				 */

				enemy.equipment.shirt = new Breastplate();
				const attackPower = player.calcDamage();
				const defensePower = enemy.calcDefense();
				const ratio = defensePower / (attackPower * 2);
				const healthBefore = enemy.health;
				let expectedDamage: number;

				if (ratio >= .8) {
					expectedDamage = attackPower * .2;
				}
				else {
					expectedDamage = attackPower * (1 - ratio);
				}
				
				player.attack(enemy);
				
				const healthAfter = enemy.health;
				expect(healthBefore - healthAfter).to.equal(expectedDamage);
			});

			it("it should call the instance's emitEvent() method with a message detailing the attack", () => {
				
				const spiedFunc = Sinon.spy(player, "emitEvent");
				const expectedMessage = JSON.stringify(GameEvent.messageEvent({
					color: "white",
					message: `You deal 35 damage to ${enemy.name}.`,
				}));

				player.attack(enemy);

				expect(spiedFunc.calledOnce);
				const [message] = spiedFunc.args[0];
				const comparableMessage = JSON.stringify(message);
				
				expect(comparableMessage).to.equal(expectedMessage);
			});
		});

		describe("emitEvent()", () => {
			let tempZone: Zone;
			
			beforeEach(() => {
				tempZone = new Zone();
				tempZone.placeCharacter(player, {row: 0, column: 0});
			});

			it("it should call the character's zone's emitEvent() method with an event", () => {
				const testEvent = GameEvent.messageEvent({
					color: "blue",
					message: "test",
				});
				const spy = Sinon.spy(tempZone, "emitEvent");

				player.emitEvent(testEvent);
				expect(spy.calledOnceWith(testEvent)).to.be.true;
			});
		});

		describe("restore AP", () => {

			it("it should restore a character's AP by an amount equal to their speed", () => {
				player.actionPoints = -100;
				player.restoreAP();

				expect(player.actionPoints).to.equal(-100 + player.speed);
			});

			it("it should not give a player more max AP than their speed", () => {
				player.actionPoints = player.speed;
				player.restoreAP();

				expect(player.actionPoints).to.equal(player.speed);
			});
		});

		describe("getAP()", () => {

			it("it should return the player's current action points", () => {
				const AP = player.getAP();

				expect(AP).to.equal(player.actionPoints);

				player.actionPoints = 40;
				const newAP = player.getAP();

				expect(newAP).to.equal(player.actionPoints);
			});
		});
	});
});