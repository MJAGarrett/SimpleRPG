import Game from "../models/Game.js";
import Tile from "../models/Game Map/Tile/Tile.js";
import Zone from "../models/Game Map/Zone/Zone.js";

class GameController {
	gameModel?: typeof Game;
	gameArea: HTMLElement | null;
	constructor(game?: typeof Game) {
		if (game) {
			this.gameModel = game;
			game.registerController(this);
		}
		this.gameArea = document.querySelector(".game-area");
	}
	notify(): void {
		if (!this.gameModel) throw new Error("No game registered with this controller");
		this.renderZone(this.gameModel.currentZone);
	}

	private renderZone(zone: Zone): void {
		const areaTiles: HTMLElement[] = [];
	
		for (const row of zone.area) {
			for (const column of row) {
				const tile = this.renderTile(column);
				areaTiles.push(tile);
			}
		}
		this.gameArea?.replaceChildren(...areaTiles);
	}

	private renderTile(tile: Tile): HTMLElement {
		const tileDiv = document.createElement("div");
		// add sprite style info here once sprites are in
		tileDiv.classList.add(tile.sprite);

		if (tile.character) {
			const charSpan  = document.createElement("span");
			charSpan.textContent = tile.character.name.charAt(0).toUpperCase();
			tileDiv.append(charSpan);
		}

		for (const item of tile.items) {
			const itemSpan = document.createElement("span");
			itemSpan.textContent = item.type;
			tileDiv.append(itemSpan);
		}

		return tileDiv;
	}

}

export default GameController;