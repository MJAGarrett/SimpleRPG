import {expect} from "chai";
import Sinon from "sinon";
import Player from "../../../../../../src/public/js/models/Characters/Player.js";
import Tile from "../../../../../../src/public/js/models/Game Map/Tile/Tile.js";
import Zone, { ZoneCoordinate } from "../../../../../../src/public/js/models/Game Map/Zone/Zone.js";

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
		});
	});
});