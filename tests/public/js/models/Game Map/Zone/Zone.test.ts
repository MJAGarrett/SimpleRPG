import {expect} from "chai";
import Sinon from "sinon";
import Player from "../../../../../../src/public/js/models/Characters/Player";
import { GameEvent } from "../../../../../../src/public/js/models/Events/GameEvent";
import Tile from "../../../../../../src/public/js/models/Game Map/Tile/Tile";
import Zone, { ZoneCoordinate } from "../../../../../../src/public/js/models/Game Map/Zone/Zone";
import Game from "../../../../../../src/public/js/models/Game";
import Swordsman from "../../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import Character from "../../../../../../src/public/js/models/Characters/Character";

describe("Zone", () => {
	let zone: Zone;
	let game: Game;
	const stubbedMethods: any[] = [];
	let handleEventStub: any;

	beforeEach(() => {
		game = new Game();
		zone = new Zone(game);
		stubbedMethods.push(Sinon.stub(game, "notifyController"));
		handleEventStub = Sinon.stub(game, "handleEvent");
		stubbedMethods.push(handleEventStub);
	});

	afterEach(() => {
		stubbedMethods.forEach((method) => method.restore());
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
				zone = new Zone(game);
				player = new Player();
			});

			it("it should not call removeCharacter() or addCharacter() on tiles if there is a character already in a square", () => {
				const attackingChar = new Player();
				const defendingChar = new Player();
				zone.placeCharacter(attackingChar, {row: 0, column: 1});
				zone.placeCharacter(defendingChar, {row: 0, column: 0});

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
				zone = new Zone(game);
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

			it("it should add a reference to the character to the zone's npcs set if the character is an NPC", () => {
				const NPC = new Swordsman();
				zone.npcs = new Set<Character>();

				zone.placeCharacter(NPC, coords);

				expect(zone.npcs.has(NPC)).to.be.true;
			});

			it("it should not add a reference to the character to the npcs set if the character is the player", () => {
				zone.npcs = new Set<Character>();

				zone.placeCharacter(player, coords);
				expect(zone.npcs.has(player)).to.be.false;
			});

			it("it should save a reference to the player on the zone if the character is the player", () => {
				zone.player = null;

				zone.placeCharacter(player, coords);
				expect(zone.player === player).to.be.true;
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
			 * This does not remove references to the zone from the character being removed.
			 * This is because the Character reference will be unreachable from the root, and thus
			 * able to be garbage collected.
			 */

			it("it should remove the character from its npcs set if the character is an npc", () => {
				const NPC = new Swordsman();
				zone.placeCharacter(NPC, {row: 0, column: 2});

				zone.removeCharacter(NPC);

				expect(zone.npcs.has(NPC)).to.be.false;
			});

			it("it should set the zone's player field to null if the character is the player", () => {
				expect(zone.player).to.not.be.null;
				zone.removeCharacter(player);

				expect(zone.player).to.be.null;
			});
		});

		describe("emitEvent()", () => {

			it("it should pass an event onto the game's handleEvent() method", () => {
				const message = GameEvent.messageEvent({
					color: "white",
					message: "test",
				});
				game.currentZone = zone;

				zone.emitEvent(message);
				expect(handleEventStub.calledOnceWith(message)).to.be.true;
			});
		});
	});
});