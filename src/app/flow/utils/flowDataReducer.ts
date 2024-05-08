import { ActionTypes } from "@/reasonScoreNext/ActionTypes";
import { Dispatch, SetStateAction } from "react";
import { Node, Edge } from "reactflow";
import { rsReducer } from "@/reasonScoreNext/rsReducer";
import { DebateData } from "@/reasonScoreNext/DebateData";
import { calculateScores } from "@/reasonScoreNext/scoring/TypeA/calculateScores";
import {
    DisplayNodeData,
    NodeArray,
    EdgeArray,
    DispatchType,
    DisplayEdgeData,
} from "@/app/flow/types/types";
import getLayoutedElements from "./getLayoutedElements";
import { scaleStacked, sizeStacked, stackSpace } from "@/utils/stackSpace";
import { GUTTER } from "../data/config";
import { getNewScore } from "@/reasonScoreNext/scoring/TypeA/Score";
import { Connector } from "@/reasonScoreNext/Connector";
import { Debate } from "@/reasonScoreNext/Debate";

const sortConnectors = (a: Connector, b: Connector): number => {
    const affects = b.affects.localeCompare(a.affects);
    if (affects !== 0) return affects;
    if (a.proTarget === b.proTarget) return 0;
    return a.proTarget ? -1 : 1;
};

export function flowDataReducer({
    actions,
    setDisplayEdges,
    setDebateData,
    setAnimating,
    displayNodes,
    setDisplayNodes,
    debate,
    setDebate,
}: {
    actions: ActionTypes[]
    setDisplayEdges: DispatchType<EdgeArray>
    setDebateData: Dispatch<SetStateAction<DebateData>>
    setAnimating: Dispatch<boolean>
    displayNodes: Node<DisplayNodeData>[]
    setDisplayNodes: DispatchType<NodeArray>
    debate: Debate
    setDebate: Dispatch<SetStateAction<Debate>>
}) {
    // TODO: Right now all data changes so does a lot of screen updating. Refactor
    //  * Apply actions to reasonScore debate data
    setDebateData((oldDebateData) => {
        let newDisplayNodes: Node<DisplayNodeData>[] = [];
        let newDisplayEdges: Edge<DisplayEdgeData>[] = [];

        const newDebateData = rsReducer(actions, oldDebateData);
        const newScores = calculateScores(newDebateData);
        const connectors = newDebateData.connectors;
        // 
        // Process Nodes
        // 
        const cancelOut = stackSpace();
        for (const score of Object.values(newScores)) {
            const claim = newDebateData.claims[score.id]
            if (!claim) {
                console.error("No claim found for id:", score.id);
                continue;
            }

            // 
            // Process Connectors
            // 
            let lastConfidenceBottom = 0;
            let lastRelevanceTop = 0;
            const maxImpactStack = stackSpace(GUTTER);
            const maxImpactStackRelevance = stackSpace(GUTTER);
            const consolidatedStack = stackSpace();
            const relevanceStack = stackSpace();

            // Get all connectors where this score is the target
            const scoreConnectors: { [id: string]: Connector } = Object.values(connectors)
                .filter(conn => conn.target === score.id)
                .sort(sortConnectors)
                .reduce((acc, conn) => ({ ...acc, [conn.id]: conn }), {})


            for (const connector of Object.values(scoreConnectors)) {

                // 
                // TODO: Separate confidence and relevance edges
                // relevance only needs maxImpact
                // and consolidatedStack is getting affected by relevance edges in this loop
                // steps to repo: add 2 confidence edges, then add a relevance edge, then add another confidence edge
                // 
                let sourceScore = newScores[connector.source];
                if (!sourceScore) {
                    sourceScore = getNewScore({ id: connector.id, type: "score" })
                    console.log("new score generated")
                }
                const skipRelevance = connector.affects === "relevance"
                const skipConfidence = connector.affects === "confidence"
                const impact = Math.max(sourceScore.confidence, 0) * sourceScore.relevance;

                const maxImpact = sourceScore.relevance || 1;
                const maxImpactStacked = maxImpactStack(skipRelevance ? 0 : sourceScore.relevance);
                const impactStacked = sizeStacked(maxImpactStacked, impact);
                const reducedImpactStacked = scaleStacked(impactStacked, sourceScore.confidence);
                const reducedMaxImpactStacked = scaleStacked(maxImpactStacked, sourceScore.confidence);
                const consolidatedStacked = consolidatedStack(impact * (skipRelevance ? 0 : sourceScore.confidence));
                const relevanceStacked = relevanceStack(impact * (skipConfidence ? 0 : sourceScore.confidence));
                const maxImpactStackedRelevance = maxImpactStackRelevance(skipConfidence ? 0 : sourceScore.relevance);

                const sourceScorePolarity = newDebateData.claims[sourceScore.id].pol
                const type = connector.affects

                const persistedData = {
                    pol: sourceScorePolarity,
                    // claimEdge: ClaimEdge,
                    sourceScore,
                    type,
                }
                const calculatedData = {
                    maxImpactStacked,
                    maxImpactStackedRelevance,
                    impactStacked,
                    reducedImpactStacked,
                    reducedMaxImpactStacked,
                    consolidatedStacked,
                    relevanceStacked,
                    impact,
                    targetConfidenceTop: lastConfidenceBottom,
                    targetRelevanceBottom: lastRelevanceTop,
                    maxImpact,
                }
                const data = {
                    ...persistedData,
                    ...calculatedData
                }

                newDisplayEdges.push({
                    id: connector.id,
                    source: connector.source,
                    targetHandle: connector.affects,
                    target: connector.target,
                    type: "rsEdge",
                    data
                });

                if (type === "confidence") {
                    lastConfidenceBottom += maxImpact;
                }
                if (type === "relevance") {
                    lastRelevanceTop += maxImpact;
                }
                lastConfidenceBottom += GUTTER;
                lastRelevanceTop += GUTTER;
            }

            newDisplayNodes.push({
                id: score.id,
                type: "rsNode",
                position: { x: 0, y: 0 }, // position()
                data: {
                    scoreId: score.id,
                    pol: claim.pol || "pro",
                    score: score,
                    claim: newDebateData.claims[score.id],
                    scoreNumberText: "scoreNumberText", // TODO
                    scoreNumber: 50, // TODO
                    cancelOutStacked: cancelOut(score.confidence),
                },
            });
        }


        const { nodes, edges } = getLayoutedElements(newDisplayNodes, newDisplayEdges)

        setAnimating(true);
        setDisplayNodes(nodes);
        setDisplayEdges(edges);
        setTimeout(() => setAnimating(false), 1000);
        return newDebateData;
    });

}
