import { ItemQuality } from "./Interfaces";

const standardQuality: ItemQuality = {
	prefix: "Regular",
	effectivenessMult: 1,
};

const fineQuality: ItemQuality = {
	prefix: "Fine",
	effectivenessMult: 1.33,
};

const lowQuality: ItemQuality = {
	prefix: "Shoddy",
	effectivenessMult: .8,
};

const Qualities: Record<"low" | "standard" | "fine", ItemQuality> = {
	low: lowQuality,
	standard: standardQuality,
	fine: fineQuality,
};

export default Qualities;