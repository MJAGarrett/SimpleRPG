import { CharacterEquipment } from "../../models/Characters/Character";
import Player from "../../models/Characters/Player";
import { GameEventTypes } from "../../models/Events/GameEvent";
import ComponentController from "../ComponentController";

const StatsToUpdate = [
	"health", 
	"weapon", 
	"level", 
	"speed", 
	"actionPoints", 
	"name", 
	"headwear", 
	"shirt", 
	"pants", 
	"footwear",
];

const equipment = ["weapon", "headwear", "shirt", "pants", "footwear"]; 

class PlayerInfoController implements ComponentController {
	handleType: GameEventTypes;
	componentToUpdate: HTMLElement;
	subcomponents = new Map<string, HTMLSpanElement>();
	playerRef: Player;
	constructor(player: Player) {
		this.handleType = "PLAYER_UI_CHANGE";
		this.playerRef = player;
		this.componentToUpdate = document.querySelector(".player-info") as HTMLElement;
		this.#setupSubcomponents(this.componentToUpdate);		
	}
	updateComponent(): void {
		for (const [key, element] of this.subcomponents) {	
			if (equipment.includes(key)) {		
				const value = this.playerRef.equipment[key as keyof CharacterEquipment];
					
				element.textContent = value?.type ? value?.type : "None";
			}
			else {
				const value = this.playerRef[key as keyof Player];
				element.textContent = value?.toString() as string;
			}
		}
	}

	#setupSubcomponents(elem: HTMLElement): void {
		for (const key of StatsToUpdate) {
			const element = elem.querySelector("." + key);
			this.subcomponents.set(key, element as HTMLElement);
		}
	}
}

export default PlayerInfoController;