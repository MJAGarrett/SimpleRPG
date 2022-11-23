import {expect} from "chai";
import Player from "../../../../../../src/public/js/models/Characters/Player";
import Tile from "../../../../../../src/public/js/models/Game Map/Tile/Tile";
import { Breastplate, Helmet } from "../../../../../../src/public/js/models/Items/Armor and Clothing/Armor";
import Sword from "../../../../../../src/public/js/models/Items/Weapons/Sword";

describe("Tile", () => {
	let tile: Tile;

	describe("Constructor", () => {
		
		it("it should initialize a Tile with a sprite string, a null character slot and an empty array\
		for the items slot", () => {
			const spriteString = "empty";
			tile = new Tile(spriteString);
			expect(tile.character).to.be.null;
			expect(tile.items).to.be.an("array");
			expect(tile.items.length).to.equal(0);
			expect(tile.sprite).to.equal(spriteString);
		});
	});

	describe("Methods", () => {
		beforeEach(() => {
			tile = new Tile("grass");
		});

		describe("Player-Oriented", () => {

			beforeEach(() => {
				tile.character = null;
			});
	
			describe("addCharacter()", () => {
				beforeEach(() => {
					tile.character = null;
				});
	
				it("it should store a reference to a character into it's character property if the tile is empty", () => {
					expect(tile.character).to.be.null;
	
					const playerCharacter = new Player();
					tile.addCharacter(playerCharacter);
	
					expect(tile.character).to.equal(playerCharacter);
				});
	
				it("it should throw an error if there is already a character in the character prop", () => {
					tile.addCharacter(new Player());
	
					expect(function wrappedAddCharacter() {
						tile.addCharacter(new Player());
					})
						.to.throw();
				});
			});
	
			describe("removeCharacter()", () => {
	
				it("it should throw an error if there is no character in the square", () => {
					tile.character = null;
					expect(tile.removeCharacter).to.throw();
				});
	
				it("it should reset its character property and return a reference to the character if one exists", () => {
					const playerCharacter = new Player();
					tile.addCharacter(playerCharacter);
	
					const character = tile.removeCharacter();
	
					expect(tile.character).to.equal(null);
					expect(character).to.equal(playerCharacter);
				});
			});
	
			describe("getCharacterRef()", () => {
	
				beforeEach(() => {
					tile.character = null;
				});
	
				it("it should return null if there is no character in the tile", () => {
					expect(tile.getCharacterRef()).to.be.null;
				});
				
				it("it should return a reference to the character in the tile", () => {
					const character = new Player();
					tile.character = character;
	
					const charInTile = tile.getCharacterRef();
					expect(charInTile).to.equal(character);
					expect(tile.character).to.equal(character);
				});
			});
	
			describe("checkForCharacter()", () => {
	
				it("it should return false if there is not a character in the tile", () => {
					expect(tile.checkForCharacter()).to.be.false;
				});
	
				it("it should return true if there is a character in the tile", () => {
					tile.character = new Player();
					
					expect(tile.checkForCharacter()).to.be.true;
				});
			});
		});

		describe("Item-Oriented", () => {

			beforeEach(() => {
				tile = new Tile("grass");
			});

			describe("addItem()", () => {
				it("it should add an item to the items array", () => {
					const sword = new Sword();
					tile.addItem(sword);
					expect(tile.items).to.include(sword);
				});
			});

			describe("removeItem()", () => {

				beforeEach(() => {
					tile.items = [];
				});

				it("it should remove an item from the items array and return a reference to the removed item", () => {
					const sword = new Sword();
					tile.items.push(sword);

					const removedItem = tile.removeItem(sword);
					expect(tile.items).to.not.include(sword);
					expect(removedItem).to.equal(sword);
				});

				it("it should throw an error if the item is not in the array", () => {
					const sword = new Sword();

					expect(() => tile.removeItem(sword)).to.throw();
				});

				it("it should not remove any items other than the one it specifies from the array", () => {
					const sword = new Sword();
					const helmet = new Helmet();
					const breastplate = new Breastplate();
					tile.items.push(sword, helmet, breastplate);

					tile.removeItem(sword);
					expect(tile.items.length).to.equal(2);
					expect(tile.items).to.include(helmet).and.include(breastplate);
				});
			});

			describe("getAllItems()", () => {
				before(() => {
					tile.items = [new Helmet(), new Sword(), new Breastplate()];
				});

				after(() => {
					tile.items = [];
				});

				it("it should return a reference to the array of all items in the tile", () => {
					const items = tile.getAllItems();
					expect(items === tile.items).to.be.true;
				});
			});
		});

		describe("getSpriteInfo()", () => {
			it("it should return information about the sprite for the tile -- WIP --", () => {
				const info = tile.getSpriteInfo();
				expect(info).to.be.a("string");
			});
		});
	});
});