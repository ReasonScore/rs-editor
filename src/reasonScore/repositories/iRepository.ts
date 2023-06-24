import { RsData } from "../RsData";
import { Action } from "../Action";
import { Claim } from "../Claim";
import { ClaimEdge } from "../ClaimEdge";
import { Score } from "../Score";
import { ScoreTree } from "../ScoreTree";

export interface iRepository {
    rsData: RsData;
    notify(actions: Action[]): void // TODO: move notify completely out of repository?
    getClaim(id: string): Promise<Claim | undefined>
    getClaimEdge(id: string): Promise<ClaimEdge | undefined>
    getScore(id: string): Promise<Score | undefined>
    getScoreTree(id: string): Promise<ScoreTree | undefined>
    getClaimEdgesByParentId(parentId: string): Promise<ClaimEdge[]>
    getClaimEdgesByChildId(childId: string): Promise<ClaimEdge[]>
    getScoresBySourceId(sourceClaimId: string): Promise<Score[]>
    getChildrenByScoreId(scoreId: string): Promise<Score[]>
}
