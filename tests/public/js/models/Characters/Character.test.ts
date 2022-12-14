import { expect } from "chai";
import Sinon from "sinon";
import Character from "../../../../../src/public/js/models/Characters/Character";
import Swordsman from "../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import Player from "../../../../../src/public/js/models/Characters/Player";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent";
import Zone, { ZoneCoordinate } from "../../../../../src/public/js/models/Game Map/Zone/Zone";
import Game from "../../../../../src/public/js/models/Game";
import { Breastplate, Helmet } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor";
import Consumable from "../../../../../src/public/js/models/Items/Consumables/IConsumable";
import HealthPotion from "../../../../../src/public/js/models/Items/Consumables/Potions/HealthPotion";
import StatusEffect, { Heal } from "../../../../../src/public/js/models/Items/Consumables/StatusEffect";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword";
import { InventoryItem } from "../../../../../src/public/js/models/Items/Interfaces";

describe("Character Abstract Class", () => {

	describe("Methods", () => {
		let tempZone: Zone;
		let player: Character;
		let game: Game;

		beforeEach(() => {
			player = new Player();
			game = new Game();
			tempZone = new Zone(game);
		});

		describe("reduceHealth()", () => {
			it("should reduce the character's health by an input", () => {
				const previousHealth = player.health;
	
				player.reduceHealth(20);
	
				expect(player.health).to.equal(previousHealth - 20);
			});

			it("it should call the character's zone's removeCharacter() method with the character only if their health is reduced to 0 or below", () => {
				tempZone.placeCharacter(player, {row: 2, column: 0});
				player.health = 100;
				const nonLethalReduction = player.health / 2;

				const stub = Sinon.stub(tempZone, "removeCharacter");

				player.reduceHealth(nonLethalReduction);

				expect(stub.called).to.be.false;
				
				player.reduceHealth(player.health + 10);

				expect(stub.calledOnceWithExactly(player)).to.be.true;
				stub.restore();
			});

			it("it should call the character's emitEvent() method with a deathMessage when the character's health falls to 0 or below", () => {
				tempZone.placeCharacter(player, {row: 0, column: 0});

				// Stubbed to prevent calling emit event twice via a UIUpdate event.
				const UIStub = Sinon.stub(player as Player, "UIChange");

				const dmgToKill = player.health * 2;
				const stub = Sinon.stub(player, "emitEvent");
				const expectedMessage = JSON.stringify(GameEvent.messageEvent({
					color: "red",
					message: player.generateDeathMessage(),
				}));
				
				player.reduceHealth(dmgToKill);
				UIStub.restore();
				
				expect(stub.calledOnce).to.be.true;
				const [recievedMessage] = stub.args[0];
				const actualMessage = JSON.stringify(recievedMessage);
				
				expect(actualMessage === expectedMessage).to.be.true;
				stub.restore();
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

			it("it should update a character's zone property and its zoneCoords property", () => {
				player.updateZoneInfo(tempZone, {row: 0, column: 0});

				expect(player.zone).to.equal(tempZone);
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
				tempZone = new Zone(game);
				tempZone.placeCharacter(player, {row: 0, column: 0});
			});

			it("it should call the character's zone's emitEvent() method with an event", () => {
				const testEvent = GameEvent.messageEvent({
					color: "blue",
					message: "test",
				});
				const stub = Sinon.stub(tempZone, "emitEvent");

				player.emitEvent(testEvent);
				expect(stub.calledOnceWith(testEvent)).to.be.true;
				stub.restore();
			});
		});

		describe("restoreAP()", () => {

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

		describe("preprocessTurn()", () => {
			let statusEffectsStub: Sinon.SinonStub;
			let restoreAPStub: Sinon.SinonStub;
			let startTurnStub: Sinon.SinonStub;

			beforeEach(() => {
				statusEffectsStub = Sinon.stub(player, "processStatusEffects");
				restoreAPStub = Sinon.stub(player, "restoreAP");
				startTurnStub = Sinon.stub(player, "startTurn");
			});

			afterEach(() => {		
				statusEffectsStub.reset();
				restoreAPStub.reset();
				startTurnStub.reset();
			});

			after(() => {
				statusEffectsStub.restore();
				restoreAPStub.restore();
				startTurnStub.restore();
			});

			it("it should call restoreAP on the character", () => {
				player.preprocessTurn();
				expect(restoreAPStub.calledOnce).to.be.true;
			});

			it("it should call processStatusEffects on the character", () => {
				player.preprocessTurn();
				expect(statusEffectsStub.calledOnce).to.be.true;
			});

			it("it should call the character's endTurn method if their AP is 0 or below", () => {
				const endTurnStub = Sinon.stub(player, "endTurn");
				player.actionPoints = -10000; // Very large negative number to counteract initial restoreAP call.
				player.preprocessTurn();

				expect(endTurnStub.calledOnce).to.be.true;
				endTurnStub.restore();
			});

			it("it should set character's takingTurn field to true if their actionPoints are above 0", () => {
				player.takingTurn = false;
				player.actionPoints = 100;
				player.preprocessTurn();

				expect(player.takingTurn).to.be.true;
			});

			it("it should call the character's startTurn method if their actionPoints are above 0", () => {
				player.actionPoints = 100;
				player.preprocessTurn();

				expect(startTurnStub.calledOnce).of.be.true;
			});
		});

		describe("processStatusEffects()", () => {
			let effect1: StatusEffect;
			let effect1Stub: Sinon.SinonStub;
			let effect2: StatusEffect;
			let effect2Stub: Sinon.SinonStub;

			beforeEach(() => {
				effect1 = new Heal(5, 8);
				effect1Stub = Sinon.stub(effect1, "applyEffect");
				effect2 = new Heal(10, 1);
				effect2Stub = Sinon.stub(effect2, "applyEffect");
				player.statusEffects = [effect1, effect2];
			});

			afterEach(() => {		
				effect1Stub.reset();
				effect2Stub.reset();
			});

			after(() => {
				effect1Stub.restore();
				effect2Stub.restore();
			});

			it("it should apply effects with a duration greater than zero", () => {
				effect2.duration = 0;

				player.preprocessTurn();
				expect(effect1Stub.calledOnceWith(player)).to.be.true;
				expect(effect2Stub.calledOnce).to.be.false;
			});

			it("it should remove status effects with a duration of <= 0", () => {
				effect2.duration = 0;
				effect1.duration = 10;

				player.preprocessTurn();
				expect(player.statusEffects.includes(effect2)).to.be.false;
				expect(player.statusEffects.includes(effect1)).to.be.true;

			});
		});

		describe("consumeItem()", () => {

			let consumable: Consumable;

			beforeEach(() => {
				consumable = new HealthPotion(5, 5);
				player.inventory.inventory = [consumable];
			});

			it("it should call the consumable item's consume() method", () => {
				const spy = Sinon.spy(consumable, "consume");
				player.consumeItem(consumable);
				spy.restore();

				expect(spy.calledOnce).to.be.true;
			});

			it("it should add the status effect returned from the consumable to the character's statusEffects array", () => {
				player.consumeItem(consumable);

				expect(player.statusEffects.includes(consumable.effect)).to.be.true;
			});

			it("it should remove the consumable from the character's inventory", () => {
				player.consumeItem(consumable);

				expect(player.getInventory().includes(consumable)).to.be.false;
			});
		});

		describe("increaseHealth()", () => {

			it("it should increase a character's health by the amount given, if the sum of the current health \
			plus the amount is less than the character's max health stat", () => {
				const initial: number = 50;
				const increase: number = 5;
				player.health = initial;
				player.increaseHealth(increase);

				expect(player.health).to.equal(initial + increase);
			});

			it("it should increase a character's health up to their max health stat and no further", () => {
				const increase: number = 5;
				player.health = player.stats.health.max - increase;

				for (let i = 0; i < 5; i++) {
					player.increaseHealth(increase);
				}
				expect(player.health).to.equal(player.stats.health.max);
			});
		});

		describe("levelUp()", () => {

			it("it should increase a character's level by one", () => {
				const prevLevel = player.level;
				player.levelUp();

				expect(player.level).to.equal(prevLevel + 1);
			});
		});

		describe("addItem()", () => {

			it("it should call the character's InventoryManager's addItem method with the item passed to it", () => {
				const stub = Sinon.stub(player.inventory, "addItem");
				const sword = new Sword();
				player.addItem(sword);

				expect(stub.calledWith(sword)).to.be.true;
				stub.restore();
			});
		});

		describe("removeItem()", () => {

			it("it should call the character's InventoryManager's removeItem method with the item passed to it", () => {
				const stub = Sinon.stub(player.inventory, "removeItem");
				const sword = new Sword();
				player.removeItem(sword);

				expect(stub.calledWith(sword)).to.be.true;
				stub.restore();
			});
		});

		describe("getInventory()", () => {

			it("it should call the character's InventoryManager's getInventory method", () => {
				const stub = Sinon.stub(player.inventory, "getInventory");
				player.getInventory();

				expect(stub.calledOnce).to.be.true;
				stub.restore();
			});

			it("it should return the character's current inventory", () => {
				const fakeInventory: InventoryItem[] = [new Sword(), new Breastplate()];
				const stub = Sinon.stub(player.inventory, "getInventory");
				stub.returns(fakeInventory);

				const returnedVal = player.getInventory();

				expect(returnedVal).to.equal(fakeInventory);
				stub.restore();
			});
		});

		describe("equipItem()", () => {

			it("it should call the character's InventoryManager's equipItem method with the given item", () => {
				const stub = Sinon.stub(player.inventory, "equipItem");
				const sword = new Sword();
				player.equipItem(sword);

				expect(stub.calledWith(sword)).to.be.true;
				stub.restore();
			});
		});

		describe("unequipItem()", () => {
			let stub: Sinon.SinonStub;

			beforeEach(() => {
				stub = Sinon.stub(player.inventory, "unequipItem");
			});

			afterEach(() => {
				stub.restore();
			});
			
			it("it should call the character's InventoryManager's unequipItem method with the given slot", () => {
				player.unequipItem("headwear");

				expect(stub.calledWith("headwear")).to.be.true;
			});

			it("it should return null if the InventoryManager's unequipItem method throws", () => {
				stub.throws();

				const returnedVal = player.unequipItem("pants");
				expect(returnedVal).to.be.null;
			});

			it("it should return the item returned from the InventoryManager's unequipItem method if it doesn't throw", () => {
				const sword = new Sword();
				stub.returns(sword);

				const returnedVal = player.unequipItem("weapon");
				expect(returnedVal).to.equal(sword);
			});
		});

		describe("addCurrency()", () => {

			it("it should call the character's InventoryManager's addCurrency method with the provided amount", () => {
				const stub = Sinon.stub(player.inventory, "addCurrency");
				const amnt = 1000;
				player.addCurrency(amnt);

				expect(stub.calledOnceWith(amnt)).to.be.true;
			});
		});

		describe("reduceCurrency()", () => {

			it("it should call the character's InventoryManager's reduceCurrency method with the provided amount", () => {
				const stub = Sinon.stub(player.inventory, "reduceCurrency");
				const amnt = 1000;
				player.reduceCurrency(amnt);

				expect(stub.calledOnceWith(amnt)).to.be.true;
			});

			it("it should throw an error if the InventoryManager's reduceCurrency method throws an error", () => {
				const stub = Sinon.stub(player.inventory, "reduceCurrency");
				stub.throws();

				expect(() => player.reduceCurrency(100)).to.throw();
			});
		});

		describe("endTurn()", () => {

			it("it should set the character's takingTurn field to false", () => {
				player.takingTurn = true;

				player.endTurn();
				expect(player.takingTurn).to.be.false;
			});
		});
	});
});