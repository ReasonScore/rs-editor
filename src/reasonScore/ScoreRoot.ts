import { newId } from "./newId";
import { Item } from "./Item";
import { ItemTypes } from "./Item";
/**
 * Represents an intentional top of a tree of scores.
 */
export class ScoreRoot implements Item {
    type: ItemTypes = 'scoreRoot'

    constructor(
        /** The claim to which this score belongs */
        public sourceClaimId: string,
        /** The top of the tree of scores that this belongs to. Used for indexing */
        public topScoreId: string,
        /** how confident we sould be in the claim. (AKA True) */
        public confidence: number = 1,
        public id: string = newId(),
        public descendantCount: number = 0,
    ) {
    }
}