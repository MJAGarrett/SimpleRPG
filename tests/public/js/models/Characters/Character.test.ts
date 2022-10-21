import { expect } from "chai";
import Sinon from "sinon";
import Character from "../../../../../src/public/js/models/Characters/Character.js";
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
				console.log(actualMessage);
				console.log(expectedMessage);
				
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
	});
});