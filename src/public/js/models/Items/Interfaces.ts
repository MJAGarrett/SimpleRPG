import { CharacterEquipment } from "../Characters/Character";

type EquipSlot = keyof CharacterEquipment;
type ArmorSlot = Exclude<EquipSlot, "weapon">;
type WeaponSlot = Extract<EquipSlot, "weapon">

interface Equipable extends InventoryItem {
  equipSlot: WeaponSlot | EquipSlot;
}

type ItemQuality = {
	effectivenessMult: number,
	prefix: string,
}

interface InventoryItem {
	weight: number,
	type: string,
	quality: ItemQuality,
	getFullname(): string,
}

export { Equipable, ArmorSlot, EquipSlot, WeaponSlot, InventoryItem, ItemQuality };