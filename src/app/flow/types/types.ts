// starting to put types in here, then can separate out into separate files later
import { ClaimEdge } from '@/reasonScore/rs';
import { Score } from "@/reasonScoreNext/scoring/TypeA/Score";
import { Claim } from "@/reasonScoreNext/Claim";
import { Dispatch, SetStateAction } from 'react';
import { Node, Edge } from "reactflow";
import { ActionTypes } from '@/reasonScoreNext/ActionTypes';
import { EdgeChange, NodeChange } from 'reactflow';
import { DebateData } from '@/reasonScoreNext/DebateData';

export type DisplayNodeData = DisplayNodePersisted & DisplayNodeCalculated

/**
 * DisplayNodePersisted - Flow Data: Persisted
 *
 * @typedef {Object} DisplayNodePersisted
 * @property {("pro" | "con")} pol - The polarity of the claim, either supporting (pro) or opposing (con).
 * @property {Claim} claim - The claim object representing the statement about reality.
 */
export type DisplayNodePersisted = {
    pol: "pro" | "con",
    claim: Claim
}

/**
 * DisplayNodeCalculated - Flow Data: Calculated
 *
 * @typedef {Object} DisplayNodeCalculated
 * @property {Score} score - The score object containing metrics about the claim's confidence and relevance within the debate.
 * @property {string} scoreNumberText - The textual representation of the score number, formatted for display.
 * @property {number} scoreNumber - The numerical value of the score, calculated from the score's metrics.
 * @property {Stacked | undefined} cancelOutStacked - (Optional) The visual stacking space representation for layout calculations.
 */
export type DisplayNodeCalculated = {
    score: Score,
    scoreNumberText: string,
    scoreNumber: number,
    cancelOutStacked?: Stacked
}

export type DisplayEdgeData = ConfidenceEdgeData | RelevanceEdgeData
export type ConfidenceEdgeData = ConfidenceEdgePersisted & ConfidenceEdgeCalculated
export type RelevanceEdgeData = RelevanceEdgePersisted & RelevanceEdgeCalculated

/**
 * ConfidenceEdgePersisted - Flow Data: Persisted
 *
 * @typedef {Object} ConfidenceEdgePersisted
 * @property {string} pol - The polarity indicating whether the edge is supporting (pro) or opposing (con) the claim.
 * @property {ClaimEdge | undefined} claimEdge - The claim edge object representing the relationship between claims.
 * @property {Score | undefined} sourceScore - The source score object associated with the confidence edge.
 * @property {"confidence"} type - The type of the edge data, indicating it's a confidence edge.
 */
export type ConfidenceEdgePersisted = {
    pol: string,
    claimEdge: ClaimEdge,
    sourceScore: Score,
    type: "confidence",
}

/**
 * ConfidenceEdgeCalculated - Flow Data: Calculated
 *
 * *Stacked = stacked for visual representation.
 * 
 * @typedef {Object} ConfidenceEdgeCalculated
 * @property {Stacked} maxImpactStacked - The maximum impact of the claim. 
 * @property {Stacked} impactStacked - The impact of the claim.
 * @property {Stacked} reducedImpactStacked - The reduced impact of the claim.
 * @property {Stacked} reducedMaxImpactStacked - The reduced maximum impact of the claim.
 * @property {Stacked} consolidatedStacked - The consolidated impact of the claim.
 * @property {Stacked} scaledTo1Stacked - The impact of the claim scaled to 1.
 * @property {number} impact - The numerical value of the impact.
 * @property {number} targetTop - The top position of the target score.
 * @property {number} maxImpact - The maximum possible impact.
 */
export type ConfidenceEdgeCalculated = {
    maxImpactStacked: Stacked,
    impactStacked: Stacked,
    reducedImpactStacked: Stacked,
    reducedMaxImpactStacked: Stacked,
    consolidatedStacked: Stacked,
    scaledTo1Stacked: Stacked,
    impact: number,
    targetTop: number,
    maxImpact: number
}

/**
 * RelevanceEdgePersisted - Flow Data: Persisted
 *
 * @typedef {Object} RelevanceEdgePersisted
 * @property {string} pol - The polarity indicating whether the edge is supporting (pro) or opposing (con) the claim.
 * @property {ClaimEdge} claimEdge - The claim edge object representing the relationship between claims.
 * @property {Score} sourceScore - The source score object associated with the relevance edge.
 * @property {"relevance"} type - The type of the edge data, indicating it's a relevance edge.
 */
export type RelevanceEdgePersisted = {
    pol: string,
    claimEdge: ClaimEdge,
    sourceScore: Score,
    type: "relevance",
}

/**
 * RelevanceEdgeCalculated - Flow Data: Calculated
 *
 * @typedef {Object} RelevanceEdgeCalculated
 * @property {number} maxImpact - The maximum possible impact of the claim on its target.
 */
export type RelevanceEdgeCalculated = {
    maxImpact: number
}

/**
 * Stacked - Flow Data: Calculated
 *
 * This type defines a structured format to manage spatial dimensions or positions within a visual layout.
 * It's utilized for graphical representation within a flow, aiding in the precise positioning of visual elements
 * like nodes or connectors. The `top`, `center`, and `bottom` properties  specify respective positions along a 
 * vertical axis, aiding in layout calculations.
 *
 * @typedef {Object} Stacked
 * @property {number} top - The position value at the top edge of a visual element or space.
 * @property {number} bottom - The position value at the bottom edge of a visual element or space.
 * @property {number} center - The position value at the center point of a visual element or space.
 */
export type Stacked = {
    top: number,
    bottom: number,
    center: number
}

/**
 * DevContextState - Flow Data: Persisted
 *
 * This type represents the development context state within a flow.
 *
 * @typedef {Object} DevContextState
 * @property {boolean} isDev - A flag indicating whether the application is currently in development mode.
 * @property {DispatchType<boolean>} setDevMode - A dispatcher function to toggle the development mode on or off.
 */
export type DevContextState = {
    isDev: boolean,
    setDevMode: DispatchType<boolean>,
};

/**
* FlowDataState - Flow Data
*
* This type encapsulates the data elements and handlers related to a flow, including dispatch function, 
* node change and edge change handlers, and debate data.
*
* @typedef {Object} FlowDataState
* @property {function} dispatch - A function to dispatch an array of action types to alter the state of the flow.
* @property {OnChange<NodeChange>} onNodesChange - A handler function to be invoked when there is a change in nodes.
* @property {OnChange<EdgeChange>} onEdgesChange - A handler function to be invoked when there is a change in edges.
* @property {DebateData} debateData - The debate data associated with this flow.
* @property {Node<DisplayNodeData, string | undefined>[]} displayNodes - An array of display node data objects.
* @property {Edge<DisplayEdgeData>[]} displayEdges - An array of display edge data objects.
*/
export type FlowDataState = {
    dispatch: (actions: ActionTypes[]) => void,
    displayNodes: Node<DisplayNodeData>[],
    displayEdges: Edge<DisplayEdgeData>[],
    onNodesChange: OnChange<NodeChange>,
    onEdgesChange: OnChange<EdgeChange>,
    debateData: DebateData
}


/**
 * OnChange - Debate Data
 *
 * This type defines a generic handler function to be invoked when certain changes occur within a flow. 
 * It encapsulates an array of changes of a specified type.
 *
 * @template ChangesType The type of changes the handler function is concerned with.
 * @typedef {function} OnChange
 * @param {ChangesType[]} changes - An array of changes.
 * @returns {void}
 */
export type OnChange<ChangesType> = (changes: ChangesType[]) => void;

/**
 * NodeArray - Debate Data
 *
 * This type represents an array of display node data objects within a flow. 
 *
 * @typedef {Array} NodeArray
 * @property {Node<DisplayNodeData>[]} - An array of display node data objects.
 */
export type NodeArray = Node<DisplayNodeData>[];

/**
 * EdgeArray - Debate Data
 *
 * This type represents an array of display edge data objects within a flow.
 *
 * @typedef {Array} EdgeArray
 * @property {Edge<DisplayEdgeData>[]} - An array of display edge data objects.
 */
export type EdgeArray = Edge<DisplayEdgeData>[];

/**
 * DispatchType - Debate Data
 *
 * This type defines a generic dispatch function to alter the state of a specified type within a flow.
 *
 * @template T The type of the state the dispatch function is concerned with.
 * @typedef {function} DispatchType
 * @param {SetStateAction<T>} action - The action to dispatch.
 * @returns {void}
 */
export type DispatchType<T> = Dispatch<SetStateAction<T>>;
