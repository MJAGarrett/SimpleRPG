import Character, { CharacterStats } from "../../Characters/Character";

export default abstract class StatusEffect {
	abstract statAffected: keyof Extract<CharacterStats, "health">;
	abstract magnitude: number;
	abstract type: "beneficial" | "negative";
	abstract duration: number;
	// eslint-disable-next-line no-unused-vars
	abstract applyEffect(char: Character): void;
	reduceDuration(): void {
		this.duration -= 1;
	}
	static HealEffect(mag: number, dur: number): Heal {
		return new Heal(mag, dur);
	}
}

export class Heal extends StatusEffect {
	statAffected: keyof CharacterStats = "health";
	type: "beneficial" | "negative" = "beneficial";
	magnitude: number;
	duration: number;
	constructor(mag: number, dur: number) {
		super();
		this.magnitude = mag;
		this.duration = Math.round(dur);
	}
	applyEffect(char: Character): void {
		char.increaseHealth(this.magnitude);
		this.reduceDuration();
	}
}