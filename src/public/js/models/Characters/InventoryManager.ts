import { Equipable, EquipSlot, InventoryItem } from "../Items/Interfaces";
import { CharacterEquipment } from "./Character";

export default class InventoryManager {
	equippedItems: CharacterEquipment;
	inventory: InventoryItem[];
	maxCarryWeight: number;
	currentWeight: number;
	currentCurrency: number;

	constructor() {
		this.equippedItems = {
			headwear: null,
			weapon: null,
			shirt: null,
			pants: null,
			footwear: null,
		};

		this.inventory = [];
		this.maxCarryWeight = 200;
		this.currentWeight = 0;
		this.currentCurrency = 0;
	}

	getInventory(): InventoryItem[] {
		return this.inventory;
	}

	/**
	 * 
	 * @param item 
	 * @throws Throws an error if the item to be added will cause the current weight to go over the
	 * maximum limit.
	 */
	addItem(item: InventoryItem): void {
		if (this.currentWeight + item.weight > this.maxCarryWeight) {
			throw new Error("Too Heavy");
		}
		else {
			this.inventory.push(item);
			this.currentWeight += item.weight;
		}
	}

	/**
	 * 
	 * @param item 
	 * @throws Will throw an error if the item to remove is not in the character's inventory.
	 */
	removeItem(item: InventoryItem): void {
		if (this.inventory.includes(item)) {
			this.inventory = this.inventory.filter(invItem => invItem !== item);
			this.currentWeight -= item.weight;
		}
		else {
			throw new Error("No such item in inventory.");
		}
	}

	equipItem(item: Equipable): void {
		if (this.equippedItems[item.equipSlot] !== null) {
			this.addItem(this.equippedItems[item.equipSlot] as InventoryItem);
		}

		this.equippedItems[item.equipSlot] = item;

		if (this.inventory.includes(item)) {
			this.removeItem(item);
		}
	}

	/**
	 * Removes and returns the item in the given equip slot.
	 * @param slot 
	 * @throws Will throw an error if there is no item in the given equip slot.
	 * @returns The item that was in the given equip slot.
	 */
	unequipItem(slot: EquipSlot): Equipable {
		const temp = this.equippedItems[slot];

		if (!temp) throw new Error("No item in slot");
		else {
			this.equippedItems[slot] = null;
			return temp;
		}
	}

	addCurrency(amount: number): void {
		this.currentCurrency += amount;
	}

	/**
	 * Reduces current currency by the amount given.
	 * @param amount 
	 * @throws Will throw an error if the current currency is less then the amount it is
	 * to be reduced by.
	 */
	reduceCurrency(amount: number): void {
		if (this.currentCurrency - amount < 0) {
			throw new Error("Not enough money");
		}
		else {
			this.currentCurrency -= amount;
		}
	}
}