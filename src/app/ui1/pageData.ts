import { rsData } from './rsData';
import { Action, Claim, ClaimEdge, RepositoryLocalPure, Score, calculateScoreActions, isClaimEdge, isScore } from './rs';
import { Edge, Node } from 'reactflow';
import { maxStrokeWidth } from './config';
import { Stacked, scaleStacked, sizeStacked, stackSpace } from './stackSpace';

export const gutter = .25;

export function isConfidenceEdgeData(data: ConfidenceEdgeData | RelevenceEdgeData | undefined): data is ConfidenceEdgeData {
    return data?.type === "confidence";
}

export function isRelevanceEdgeData(data: ConfidenceEdgeData | RelevenceEdgeData | undefined): data is RelevenceEdgeData {
    return data?.type === "relevance";
}

export interface DisplayNodeData {
    pol: "pro" | "con"
    score: Score
    claim: Claim
    scoreNumberText: string
    scoreNumber: number
    cancelOutStacked: Stacked
}

export interface ConfidenceEdgeData {
    pol: string
    claimEdge: ClaimEdge
    sourceScore: Score
    maxImpactStacked: Stacked
    impactStacked: Stacked
    reducedImpactStacked: Stacked
    reducedMaxImpactStacked: Stacked
    consolidatedStacked: Stacked
    scaledTo1Stacked: Stacked
    type: "confidence"


    // TODO: Remove all below
    impact: number
    targetTop: number
    maxImpact: number
}

export interface RelevenceEdgeData {
    pol: string
    claimEdge: ClaimEdge
    sourceScore: Score
    type: "relevance"
    maxImpact: number
}

export const initialPositions: { [key: string]: { x: number, y: number } } = {
    "mainClaim": {
        "x": 100,
        "y": 0
    },
    "footTraffic": {
        "x": 600,
        "y": -130
    }
    ,
    "payoff": {
        "x": 750,
        "y": -285
    }
    ,
    "traintracks": {
        "x": 1100,
        "y": 203
    }
    ,
    "children": {
        "x": 750,
        "y": -14
    }
    ,
    "test": {
        "x": 1100,
        "y": 127
    }
    ,
    "test2": {
        "x": 1100,
        "y": 49
    }
    ,
    "resedential": {
        "x": 600,
        "y": 111
    },
    "cost": {
        "x": 600,
        "y": 263
    }
}

type ProcessEdgesProps = {
    rsRepo: RepositoryLocalPure,
    targetScore: Score,
    edges: Edge<ConfidenceEdgeData | RelevenceEdgeData>[]
   }
  
type ProcessClaimsProps = {
    rsRepo: RepositoryLocalPure,
    targetScore: Score,
    generationItems?: { [key: string]: number },
    nodes: Node<DisplayNodeData>[],
    position?: { x: number, y: number }
  };

  // TODO: consolidate nodes/newNodes and edges/newEdges
export async function processConfidenceEdges({ rsRepo, targetScore, edges }: ProcessEdgesProps) {
    // get the score's confidence edges
    const claimEdges = await rsRepo.getClaimEdgesByParentId(targetScore.sourceClaimId);
    const confidenceEdges = claimEdges.filter(ce => ce.affects === "confidence");
    confidenceEdges.sort((a, b) => a.proMain === targetScore.proMain ? -1 : 1);
    let lastBottom = 0;
    const maxImpactStack = stackSpace(gutter);
    const consolidatedStack = stackSpace();
    const scaledTo1Stack = stackSpace();
    // let lastProMain = undefined;
    let newEdges: Edge<ConfidenceEdgeData>[] = [];
    for (const confidenceEdge of confidenceEdges) {
        // console.log(`confidenceEdge`, confidenceEdge)
        const sourceScore = (await rsRepo.getScoresBySourceId(confidenceEdge.childId))[0];
        const impact = Math.max(sourceScore.confidence, 0) * sourceScore.relevance;
        const maxImpact = sourceScore.relevance;
        // const proChangeGap = lastProMain === true && sourceScore.proMain === false ? 1 : 0
        const maxImpactStacked = maxImpactStack(sourceScore.relevance);
        const impactStacked = sizeStacked(maxImpactStacked, impact);
        const reducedImpactStacked = scaleStacked(impactStacked, sourceScore.confidence);
        const reducedMaxImpactStacked = scaleStacked(maxImpactStacked, sourceScore.confidence);
        const consolidatedStacked = consolidatedStack(impact * sourceScore.confidence);
        const scaledTo1Stacked = scaledTo1Stack(sourceScore.percentOfWeight);

        if (edges.some(edge => edge.id === confidenceEdge.id)) {
            continue;
        }
        const edge: Edge<ConfidenceEdgeData> = {
            id: confidenceEdge.id,
            type: "rsEdge",
            target: targetScore.id,
            targetHandle: 'confidence',
            source: sourceScore.id,
            data: {
                pol: sourceScore.proMain ? "pro" : "con",
                maxImpact,
                impact: impact,
                targetTop: lastBottom,
                claimEdge: confidenceEdge,
                sourceScore,
                maxImpactStacked,
                impactStacked,
                reducedImpactStacked,
                reducedMaxImpactStacked,
                consolidatedStacked,
                scaledTo1Stacked,
                type: "confidence",
            }
        };

        lastBottom += maxImpact;
        lastBottom += gutter;
        // lastProMain = sourceScore.proMain;
        edges.push(edge);
        newEdges.push(edge);
    }
    return {newEdges, edges};
}

// TODO: consolidate nodes/newNodes and edges/newEdges
export async function processRelevanceEdges({ rsRepo, targetScore, edges }: ProcessEdgesProps) {
    const claimEdges = await rsRepo.getClaimEdgesByParentId(targetScore.sourceClaimId);
    const relevanceEdges = claimEdges.filter(ce => ce.affects === "relevance");
    let newEdges: Edge<ConfidenceEdgeData | RelevenceEdgeData>[] = [];
    for (const relevanceEdge of relevanceEdges) {
        const sourceScore = (await rsRepo.getScoresBySourceId(relevanceEdge.childId))[0];
        const maxImpact = sourceScore.relevance;
        if (edges.some(edge => edge.id === relevanceEdge.id)) {
            continue;
        }
        
        const edge: Edge<RelevenceEdgeData> = {
            id: relevanceEdge.id,
            type: "rsEdge",
            target: targetScore.id,
            targetHandle: 'relevance',
            source: sourceScore.id,
            data: {
                pol: sourceScore.proMain ? "pro" : "con",
                claimEdge: relevanceEdge,
                sourceScore,
                maxImpact,
                type: "relevance",
            }
        };

        edges.push(edge);
        newEdges.push(edge);
    }
    return {newEdges, edges};
}
  
// TODO: consolidate nodes/newNodes and edges/newEdges
export async function processClaims({
    rsRepo,
    targetScore,
    generationItems = {},
    nodes,
    position
  }: ProcessClaimsProps) {
    const claim = await rsRepo.getClaim(targetScore.sourceClaimId);
    if (!generationItems[targetScore.generation]) generationItems[targetScore.generation] = 0;

    // check if node 
    
    
    // TODO: Math and text ---------- move to a central function
    let scoreNumber = 0;
    let scoreNumberText = "--";
    let confidence = targetScore.confidence < 0 ? 0 : targetScore.confidence;
    scoreNumber = Math.round(confidence * targetScore.relevance * 100);
    if (targetScore.affects === "relevance") {
        const sign = targetScore.pro ? "X" : "÷";
        scoreNumberText = `${sign} ${(targetScore.relevance + 1).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
    } else {
        if (scoreNumber === 100) scoreNumber = 99;
        scoreNumberText = `${scoreNumber.toString().padStart(2, " ")}%`;
    }
    // end TODO
    if (nodes.some(node => node.id === targetScore.id)) {
        return;
    }
    if (!claim) return

    const positionToSet = position || initialPositions[claim.id] || {
        y: (generationItems[targetScore.generation]),
        x: (targetScore.generation * 500) + 100,
    };


    const cancelOut = stackSpace();
    const cancelOutStacked = cancelOut(targetScore.confidence);
    const node: Node<DisplayNodeData> = {
        id: targetScore.id,
        type: 'rsNode',
        position: positionToSet,
        data: {
            pol: targetScore.proMain ? "pro" : "con",
            score: targetScore,
            claim: claim,
            scoreNumberText: scoreNumberText,
            scoreNumber: scoreNumber,
            cancelOutStacked
        }
    };
    
    nodes.push(node);
    generationItems[targetScore.generation] += (maxStrokeWidth * 2) + ((claim?.content?.length || 0) * 1.1);
    return {nodes, node};
}

// TODO: consolidate nodes/newNodes and edges/newEdges
export async function getEdgesAndNodes(
    rsRepo: RepositoryLocalPure, 
    nodes: Node<DisplayNodeData>[] = [],
    edges: Edge<ConfidenceEdgeData | RelevenceEdgeData>[] = [],
    position?: { x: number, y: number }
    ) {
        let scores: Score[] = [];
        const mainScoreId = (await rsRepo.getScoreRoot(rsData.ScoreRootIds[0]))?.topScoreId;
        const mainScore = await rsRepo.getScore(mainScoreId || "");
        scores = await rsRepo.getDescendantScoresById(mainScoreId || "");
        scores.reverse();
        scores.sort((a, b) => a.proMain ? -1 : 1)
        if (mainScore) scores.unshift(mainScore);
        let newNodes = [];
        let newEdges = [];
        for (const targetScore of scores) {
            const newEdgeFromConfidence = await processConfidenceEdges({rsRepo, targetScore, edges});
            if (newEdgeFromConfidence.newEdges) newEdges.push(newEdgeFromConfidence.newEdges) // TODO: Refactor
            const newEdgeFromRelevance = await processRelevanceEdges({rsRepo, targetScore, edges});
            if (newEdgeFromRelevance.newEdges) newEdges.push(newEdgeFromRelevance.newEdges) // TODO: Refactor
            const returnedNodes = await processClaims({rsRepo, targetScore, nodes, position});
            if (returnedNodes) newNodes.push(returnedNodes?.node) // TODO: Refactor
        }
        return { nodes, edges, newNodes, newEdges }
}
