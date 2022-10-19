import { expect } from "chai";
import Character from "../../../../../src/public/js/models/Characters/Character.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import Zone, { ZoneCoordinate } from "../../../../../src/public/js/models/Game Map/Zone/Zone.js";

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
	});
});