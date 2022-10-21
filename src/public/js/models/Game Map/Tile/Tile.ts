import Character from "../../Characters/Character.js";
import { InventoryItem } from "../../Items/Interfaces.js";

class Tile {
	character: Character | null;
	items: InventoryItem[];
	sprite: string;
	constructor(sprite: string) {
		this.sprite = sprite;
		this.character = null;
		this.items = [];
	}

	addCharacter(char: Character): void {
		if (this.checkForCharacter()) {
			throw new Error("There is already a character in this tile");
		} 
		else {
			this.character = char;
		}
	}

	removeCharacter(): Character {
		if (!this.checkForCharacter()) {
			throw new Error("There is no character in this tile");
		}
		else {
			// Type casting as TypeScript doesn't know this.character must be of type Character
			const char: Character = this.character as Character;
			this.character = null;
			return char;
		}
	}

	getCharacterRef(): Character | null {
		if (!this.checkForCharacter()) {
			return null;
		}
		else {
			// Type casting as TypeScript doesn't know this.character must be of type Character
			return this.character as Character;
		}
	}

	checkForCharacter(): boolean {
		if (this.character instanceof Character) {
			return true;
		}
		else return false;
	}

	addItem(item: InventoryItem): void {
		this.items.push(item);
	}

	removeItem(item: InventoryItem): InventoryItem {

		// indexOfResult is assigned here to avoid TypeScript thinking it could be accessed before being assigned.
		let indexOfResult: number = -99;
		const result: InventoryItem | undefined = this.items.find((val, index) => {
			if (item === val) {
				indexOfResult = index;
				return true;
			}
			return false;
		});
		// Sanity check on indexOfResult; should never give a result without reassigning, but checking to be sure.
		if (result === undefined || indexOfResult === -99) {
			throw new Error("Item not in tile");
		}
		this.items.splice(indexOfResult, 1);
		return result;
	}

	getAllItems(): InventoryItem[] {
		return this.items;
	}

	getSpriteInfo(): string {
		return this.sprite;
	}
}

export default Tile;