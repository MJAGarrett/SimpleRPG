import { ZoneCoordinate } from "../../../Game Map/Zone/Zone";
import Character from "../../Character";
import NPC from "../NPC";

class NPCAI {
	NPCActor: NPC;
	constructor(npc: NPC) {
		this.NPCActor = npc;
	}
	
	takeTurn(): void {
		while (this.NPCActor.actionPoints > 0 && this.NPCActor.takingTurn === true) {	
			this.decideMove();
		}
		this.NPCActor.endTurn();
	}

	/**
	 * Entry point for move decision logic.
	 */
	decideMove(): void {
		if (this.NPCActor.zone?.player) {
			this.attackTarget(this.NPCActor.zone.player);
		}
		else
			this.wander();
	}

	wander(): void {
		const currentPos = this.NPCActor.zoneCoords as ZoneCoordinate;
		const potentialMoves = this.findPotentialMoves(currentPos);

		if (potentialMoves.length === 0) {
			// if no moves end turn to prevent infinite loop in takeTurn() method.
			this.NPCActor.endTurn();
			return;
		}
		
		const move = this.pickAMove(potentialMoves);
		this.moveActor(move);
	}

	moveActor(move: ZoneCoordinate): void {
		this.NPCActor.reduceActionPoints(100);
		this.NPCActor.zone?.moveCharacter(this.NPCActor, move);
	}

	attackTarget(target: Character): void {
		const targetPos = target.zoneCoords as ZoneCoordinate;
		const curRow = this.NPCActor.zoneCoords?.row as number;
		const curCol = this.NPCActor.zoneCoords?.column as number;

		if (Math.abs(targetPos.row - curRow) <= 1 && Math.abs(targetPos.column - curCol) <= 1) {
			this.NPCActor.attack(target);
		}
		else {
			const move = this.findMoveTowardTarget({row: curRow, column: curCol}, targetPos);
			this.moveActor(move);
		}
	}

	findMoveTowardTarget(currentPos: ZoneCoordinate, targetPos: ZoneCoordinate): ZoneCoordinate {
		let newRow: number = currentPos.row;
		let newCol: number = currentPos.column;
		
		currentPos.row > targetPos.row 
			? newRow = currentPos.row - 1 
			: newRow = currentPos.row + 1;

		currentPos.column > targetPos.column 
			? newCol = currentPos.column - 1 
			: newCol = currentPos.column + 1; 

		return { row: newRow, column: newCol};
	}

	/**
	 * Finds all possible coordinates that an NPC can move to within their current zone. 
	 * @param currentPos NPC's current coordinates in their zone.
	 * @returns An array of coordinates for potential moves.
	 */
	findPotentialMoves(currentPos: ZoneCoordinate): Array<ZoneCoordinate> {
		const moves: Array<ZoneCoordinate> = [];
		const { row, column } = currentPos;

		for (let potentialRow = row - 1; potentialRow <= row + 1; potentialRow++) {

			for (let potentialCol = column - 1; potentialCol <= column + 1; potentialCol++) {
				if (potentialRow === row && potentialCol === column) continue;

				const potentialCoords: ZoneCoordinate = {row: potentialRow, column: potentialCol};

				try {
					const blocker = this.NPCActor.zone?.getTile(potentialCoords).character;
					if (!blocker) moves.push(potentialCoords);
				}
				catch {
					// getTile will throw if out of bounds. The only necessary action is to continue loop without pushing to moves.
					continue;
				}
			}
		}

		return moves;
	}

	/**
	 * Randomly selects and returns a move coordinate. If there is only one option simply returns that coordinate.
	 * @param moves 
	 * @returns A randomly selected coordinate for a potential move.
	 */
	pickAMove(moves: ZoneCoordinate[]): ZoneCoordinate {
		const len = moves.length;
		if (len === 1) return moves[0];

		const index = Math.round(Math.random() * (len - 1));
		return moves[index];
	}
}

export default NPCAI;