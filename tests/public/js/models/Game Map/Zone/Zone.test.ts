import {expect} from "chai";
import Sinon from "sinon";
import Swordsman from "../../../../../../src/public/js/models/Characters/NPCs/Swordsman.js";
import Player from "../../../../../../src/public/js/models/Characters/Player.js";
import { GameEvent } from "../../../../../../src/public/js/models/Events/GameEvent.js";
import Tile from "../../../../../../src/public/js/models/Game Map/Tile/Tile.js";
import Zone, { ZoneCoordinate } from "../../../../../../src/public/js/models/Game Map/Zone/Zone.js";
import { Breastplate } from "../../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";
import Sword from "../../../../../../src/public/js/models/Items/Weapons/Sword.js";
import game from "../../../../../../src/public/js/models/Game.js";

describe("Zone", () => {
	let zone: Zone;
	beforeEach(() => {
		zone = new Zone();
	});

	describe("Constructor", () => {
		
		it("it should initialize a game area as a 10 x 10 2D array of Tile objects", () => {
			expect(zone.area).to.be.an("array");
			for (const row of zone.area) {
				expect(row).to.be.an("array");
				expect(row instanceof Array<Tile>).to.be.true;
				expect(row[0] instanceof Tile).to.be.true;
			}
		});
	});

	describe("Methods", () => {
		describe("getTile()", () => {
			it("it should return a reference to the tile corresponding to it's input", () => {
				const tile: Tile = zone.getTile({row: 0, column: 0});

				expect(tile === zone.area[0][0]).to.be.true;
			});

			it("it should throw an error if the row or column coords are out of bounds", () => {
				expect(() => zone.getTile({row: -1, column: 4})).to.throw();
				expect(() => zone.getTile({row: 2, column: 12})).to.throw();
				expect(() => zone.getTile({row: 10, column: -21})).to.throw();
			});
		});

		describe("moveCharacter()", () => {
			let player: Player;

			beforeEach(() => {
				zone = new Zone();
				player = new Player();
			});

			it("it should call attack() with the appropriate characters if there is already a character in the square", () => {
				const attackingChar = new Player();
				const defendingChar = new Player();
				zone.area[0][1].character = attackingChar;
				zone.area[0][0].character = defendingChar;

				const attackSpy = Sinon.spy(zone, "attack");

				zone.moveCharacter(attackingChar, {
					row: 0,
					column: 0,
				});

				expect(attackSpy.calledWithExactly(attackingChar, defendingChar)).to.be.true;
			});

			it("it should not call removeCharacter() or addCharacter() on tiles if there is a character already in a square", () => {
				const attackingChar = new Player();
				const defendingChar = new Player();
				zone.area[0][1].character = attackingChar;
				zone.area[0][0].character = defendingChar;

				const attackTileSpy = Sinon.spy(zone.area[0][1], "removeCharacter");
				const defendTileSpy = Sinon.spy(zone.area[0][0], "addCharacter");

				zone.moveCharacter(attackingChar, {
					row: 0,
					column: 0,
				});

				expect(attackTileSpy.notCalled).to.be.true;
				expect(defendTileSpy.notCalled).to.be.true;
			});

			it("it should call the tile's addCharacter() method", () => {
				const newCoords: ZoneCoordinate = {
					row: 0,
					column: 0,
				};
				const spiedFunc = Sinon.spy(zone.area[0][0], "addCharacter");

				zone.area[1][1].character = player;
				player.zoneCoords = { row: 1, column: 1};

				zone.moveCharacter(player, newCoords);

				expect(spiedFunc.calledOnce).to.be.true;
			});

			it("it should take a character and an adjacent coordinate and attempt to move the character to it", () => {			
				const newCoords: ZoneCoordinate = {
					row: 0,
					column: 0,
				};

				zone.area[1][1].character = player;
				player.zoneCoords = { row: 1, column: 1};
				zone.moveCharacter(player, newCoords);
		
				expect(zone.area[0][0].character).to.equal(player);
			});

			it("it should call the removeCharacter() method on the character's original tile", () => {
				const newCoords: ZoneCoordinate = {
					row: 0,
					column: 0,
				};

				zone.area[1][1].character = player;
				player.updateCoordinates({row: 1, column: 1});
				const spiedFunc = Sinon.spy(zone.area[1][1], "removeCharacter");

				zone.moveCharacter(player, newCoords);

				expect(spiedFunc.calledOnce).to.be.true;
			});

			it("it should call the character's updateCoordinates() method", () => {
				const newCoordinates: ZoneCoordinate = {
					row: 1,
					column: 1,
				};
				player.zoneCoords = {row: 0, column: 0};
				zone.area[0][0].character = player;
				const spied = Sinon.spy(player, "updateCoordinates");

				zone.moveCharacter(player, newCoordinates);
				expect(spied.calledOnce).to.be.true;
			});
		});

		describe("placeCharacter()", () => {
			let player: Player;
			let coords: ZoneCoordinate;

			beforeEach(() => {
				player = new Player();
				coords = {
					row: 0,
					column: 0,
				};
				zone = new Zone();
			});

			it("it should call the appropriate tile's addCharacter method with the Character reference it was passed", () => {
				const spiedTile = Sinon.spy(zone.area[coords.row][coords.column], "addCharacter");

				zone.placeCharacter(player, coords);

				expect(spiedTile.calledOnceWith(player)).to.be.true;
			});

			it("it should call updateZoneInfo on the character it has placed", () => {
				const spy = Sinon.spy(player, "updateZoneInfo");
				zone.placeCharacter(player, coords);
				expect(spy.calledOnceWith(zone, coords)).to.be.true;
			});
		});

		describe("removeCharacter()", () => {
			let player: Player;
			beforeEach(() => {
				player = new Player();
				zone.placeCharacter(player, {row: 0, column: 0});
			});

			it("it should remove a character reference from its area", () => {
				zone.removeCharacter(player);

				expect(zone.area[0][0].character).to.be.null;
			});

			/**
			 * This does not remove references from the Character being removed to the zone itself.
			 * This is because the Character reference will be unreachable from the root, and thus
			 * able to be garbage collected.
			 */
		});

		describe("attack()", () => {
			let player: Player;
			let enemy: Swordsman;
			beforeEach(() => {
				player = new Player();
				player.equipItem(new Sword());
				enemy = new Swordsman();
				zone.placeCharacter(player, {row: 2, column: 2});
				zone.placeCharacter(enemy, {row: 2, column: 3});
				game.currentZone = zone;
				game.player = player;
			});

			it("it should call the attacking character's calcDamage() method and save the result", () => {
				const spiedAttacker = Sinon.spy(player, "calcDamage");

				zone.attack(player, enemy);

				expect(spiedAttacker.calledOnce).to.be.true;
				expect(spiedAttacker.returnValues[0]).to.be.a("number");
			});

			it("it should call the defending character's calcDefense() method and save the result", () => {
				const spiedDefender = Sinon.spy(enemy, "calcDefense");

				zone.attack(player, enemy);

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
				
				zone.attack(player, enemy);
				
				const healthAfter = enemy.health;
				expect(healthBefore - healthAfter).to.equal(expectedDamage);
			});

			it("it should call the instance's emitEvent() method with a message detailing the attack", () => {
				
				const spiedFunc = Sinon.spy(zone, "emitEvent");
				const expectedMessage = JSON.stringify(GameEvent.messageEvent({
					color: "white",
					message: `You deal 35 damage to ${enemy.name}.`,
				}));

				zone.attack(player, enemy);

				expect(spiedFunc.calledOnce);
				const [message] = spiedFunc.args[0];
				const comparableMessage = JSON.stringify(message);
				
				expect(comparableMessage).to.equal(expectedMessage);
			});
		});

		describe("emitEvent()", () => {

			afterEach(() => {
				game.currentZone = undefined;
			});

			it("it should pass an event onto the game's handleEvent() method", () => {
				const message = GameEvent.messageEvent({
					color: "white",
					message: "test",
				});
				game.currentZone = zone;
				const spy = Sinon.spy(game, "handleEvent");

				zone.emitEvent(message);
				expect(spy.calledOnceWith(message)).to.be.true;

			});
		});
	});
});