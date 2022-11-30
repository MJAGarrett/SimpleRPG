import { expect } from "chai";
import NPCAI from "../../../../../../../src/public/js/models/Characters/NPCs/AI/NPCAI";
import Swordsman from "../../../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import Zone, { ZoneCoordinate } from "../../../../../../../src/public/js/models/Game Map/Zone/Zone";
import Player from "../../../../../../../src/public/js/models/Characters/Player";
import NPC from "../../../../../../../src/public/js/models/Characters/NPCs/NPC";
import Game from "../../../../../../../src/public/js/models/Game";
import Sinon from "sinon";
import Character from "../../../../../../../src/public/js/models/Characters/Character";
import Tile from "../../../../../../../src/public/js/models/Game Map/Tile/Tile";

describe("NPCAI Class", () => {
	let AI: NPCAI;
	let NPC: NPC;
	let zone: Zone;
	let game: Game;

	beforeEach(() => {
		game = new Game();
		NPC = new Swordsman();
		AI = new NPCAI(NPC);
		zone = game.currentZone;
	});

	describe("takeTurn()", () => {
		let decideStub: Sinon.SinonStub;
		let endTurnStub: Sinon.SinonStub;

		beforeEach(() => {
			decideStub = Sinon.stub(AI, "decideMove");
			endTurnStub = Sinon.stub(AI.NPCActor, "endTurn");
		});

		afterEach(() => {
			decideStub.restore();
			endTurnStub.restore();
		});

		it("it should skip decideMove() if the NPC's actionPoints are <= 0 or if their turnTaking field = false", () => {
			AI.NPCActor.takingTurn = false;

			AI.takeTurn();

			expect(decideStub.called).to.be.false;
			expect(endTurnStub.calledOnce).to.be.true;

			endTurnStub.reset();
			AI.NPCActor.takingTurn = true;
			AI.NPCActor.actionPoints = 0;

			AI.takeTurn();

			expect(decideStub.called).to.be.false;
			expect(endTurnStub.calledOnce).to.be.true;
		});

		it("it should call decideMove() if the NPC's AP are >= 0 and their takingTurn field is true", () => {
			// Fake behavior to prevent infinite loop.
			decideStub.callsFake(() => {
				AI.NPCActor.takingTurn = false;
			});

			AI.NPCActor.actionPoints = 100;
			AI.NPCActor.takingTurn = true;

			AI.takeTurn();
			expect(decideStub.calledOnce).to.be.true;
		});
	});

	describe("decideMove()", () => {
		let attackStub: Sinon.SinonStub;
		let wanderStub: Sinon.SinonStub;

		beforeEach(() => {
			attackStub = Sinon.stub(AI, "attackTarget");
			wanderStub = Sinon.stub(AI, "wander");
		});
		afterEach(() => {
			attackStub.restore();
			wanderStub.restore();
		});

		it("it should begin attack logic if a valid target exists in the same zone as the NPC", () => {
			const target = new Player();
			zone.placeCharacter(target, { row: 0, column: 0 });
			zone.placeCharacter(NPC, { row: 5, column: 5 });

			AI.decideMove();

			expect(attackStub.calledOnceWith(target)).to.be.true;
		});

		it("it should default to wandering if no other actions are valid", () => {
			zone.placeCharacter(NPC, { row: 0, column: 0 });

			AI.decideMove();

			expect(wanderStub.calledOnce).to.be.true;
		});
	});

	describe("wander()", () => {
		let findMovesStub: Sinon.SinonStub;
		let endTurnStub: Sinon.SinonStub;
		let pickAMoveStub: Sinon.SinonStub;
		let moveStub: Sinon.SinonStub;

		beforeEach(() => {
			zone.placeCharacter(NPC, { row: 1, column: 1});
			findMovesStub = Sinon.stub(AI, "findPotentialMoves").returns([]);
			endTurnStub = Sinon.stub(AI.NPCActor, "endTurn");
			pickAMoveStub = Sinon.stub(AI, "pickAMove");
			moveStub = Sinon.stub(AI, "moveActor");
		});
		afterEach(() => {
			findMovesStub.restore();
			endTurnStub.restore();
			pickAMoveStub.restore();
			moveStub.restore();
		});

		it("it should end a character's turn without moving a character or reducing its AP if there are no potential moves they can take", () => {
			AI.wander();

			expect(moveStub.called).to.be.false;
			expect(endTurnStub.calledOnce).to.be.true;
		});

		it("it should attempt to move a character and reduce their AP when a valid move is found", () => {
			const moveCoords: ZoneCoordinate = { row: 0, column: 0 };
			findMovesStub.returns([moveCoords]);
			pickAMoveStub.returns(moveCoords);

			AI.wander();

			expect(moveStub.calledOnceWith(moveCoords)).to.be.true;
		});
	});

	describe("attackTarget()", () => {
		
		let attackStub: Sinon.SinonStub;
		let moveStub: Sinon.SinonStub;
		let findMoveStub: Sinon.SinonStub;
		let target: Character;

		beforeEach(() => {
			target = new Swordsman();
			attackStub = Sinon.stub(AI.NPCActor, "attack");
			moveStub = Sinon.stub(AI, "moveActor");
			findMoveStub = Sinon.stub(AI, "findMoveTowardTarget");
		});
		afterEach(() => {
			attackStub.restore();
			moveStub.restore();
			findMoveStub.restore();
		});

		it("it should attack a target if the NPC is within attack range", () => {
			zone.placeCharacter(target, { row: 0, column: 0 });
			zone.placeCharacter(NPC, { row: 1, column: 0 });

			AI.attackTarget(target);
			expect(attackStub.calledOnceWith(target)).to.be.true;
		});

		it("it should make the NPC move closer to its target if it is out of attack range", () => {
			zone.placeCharacter(target, { row: 0, column: 0 });
			zone.placeCharacter(NPC, { row: 2, column: 0 });
			const move: ZoneCoordinate = { row: 1, column: 0 };
			findMoveStub.returns(move);

			AI.attackTarget(target);
			expect(findMoveStub.calledOnceWith(NPC.zoneCoords, target.zoneCoords)).to.be.true;
			expect(moveStub.calledOnceWith(move)).to.be.true;
		});
	});

	describe("findMoveTowardTarget()", () => {
		const NPCTestPositions: ZoneCoordinate[] = [
			{ row: 0, column: 5 },
			{ row: 9, column: 5 },
			{ row: 5, column: 0 },
			{ row: 5, column: 9 },
			{ row: 0, column: 0 },
			{ row: 9, column: 9 },
			{ row: 0, column: 9 },
			{ row: 9, column: 0 },
		];
		const targetPosition: ZoneCoordinate = { row: 5, column: 5};

		it("it should return a ZoneCoordinate with a distance to the target less than that of its original position", () => {
			for (const position of NPCTestPositions) {
				const originalDist = distBetweenPoints(position, targetPosition);
				const move: ZoneCoordinate = AI.findMoveTowardTarget(position, targetPosition);
				expect(distBetweenPoints(move, targetPosition)).to.be.lessThan(originalDist);
			}
		});
	});

	describe("findPotentialMoves()", () => {
		const coords: ZoneCoordinate = { row: 2, column: 5};
		let getTileStub: Sinon.SinonStub;

		beforeEach(() => {
			zone.placeCharacter(NPC, coords);
			getTileStub = Sinon.stub(zone, "getTile").returns(new Tile("empty"));
		});
		afterEach(() => {
			getTileStub.restore();
		});

		it("it should return an array of ZoneCoordinates representing potential moves", () => {
			const moves: ZoneCoordinate[] = AI.findPotentialMoves(coords);

			expect(moves.length).to.be.greaterThan(0);
			expect(moves.includes(coords)).to.be.false;
		});

		it("it should not return a move into a square that has a potential blocker", () => {
			const blockedTile: Tile = new Tile("empty");
			blockedTile.character = new Swordsman();
			getTileStub.returns(blockedTile);
			const moves = AI.findPotentialMoves(coords);

			expect(moves.length).to.equal(0);
		});

		it("it should not return a tile if getTile throws an out of bounds error", () => {
			const baseNumofMoves: number = AI.findPotentialMoves(coords).length;
			getTileStub.resetHistory();

			getTileStub.onCall(5).throws();
			const moves = AI.findPotentialMoves(coords);

			expect(moves.length).to.be.greaterThan(0);
			expect(moves.length).to.be.lessThan(baseNumofMoves);
		});
	});

	describe("pickAMove()", () => {

		it("it should return a random coordinate from the given ZoneCoordinate Array", () => {
			/**
			 * Will not test the random component as that is the realm of the node Math module.
			 * 
			 * pickAMove should never pick an index out of bounds of its array given that: 
			 * Math.random() * (L - 1) will return values in a range of [0, (L - 1)] which will always 
			 * stay within the bounds of an array with length = L.
			 */
			const arr: ZoneCoordinate[] = [];

			for (let row = 0; row < 10; row++) {
				for (let column = 0; column < 10; column++) {
					arr.push({ row, column });
				}
			}

			for (let i = 0; i < 100; i++) {
				const choice = AI.pickAMove(arr);
				expect(arr.includes(choice)).to.be.true;
			}
		});
	});
});

function distBetweenPoints(pointA: ZoneCoordinate, pointB: ZoneCoordinate): number {
	const a = (pointA.row - pointB.row) ** 2;
	const b = (pointA.column - pointB.column) ** 2;
	const c = Math.sqrt(a + b);
	return c;
}