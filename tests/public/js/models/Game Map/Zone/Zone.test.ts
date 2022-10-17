import {expect} from "chai";
import Tile from "../../../../../../src/js/models/Game Map/Tile/Tile.js";
import Zone from "../../../../../../src/js/models/Game Map/Zone/Zone.js";

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
				expect(() => zone.getTile({row: 2, column: 8})).to.throw();
				expect(() => zone.getTile({row: 10, column: -21})).to.throw();
			});
		});
	});
});