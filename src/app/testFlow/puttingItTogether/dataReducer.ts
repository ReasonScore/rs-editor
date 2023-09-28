import { ActionTypes } from "@/reasonScoreNext/ActionTypes";
import { Dispatch, SetStateAction } from "react";
import { rsReducer } from "@/reasonScoreNext/rsReducer";
import { DebateData } from "@/reasonScoreNext/DebateData";
import { calculateScores } from "@/reasonScoreNext/scoring/TypeA/calculateScores";


export function dataReducer({ actions, setDebateData }: {
    actions: ActionTypes[],
    setDebateData: Dispatch<SetStateAction<DebateData>>
}) {
    // TODO: Right now all data changes so does a lot of screen updating. Refactor
    //  * Apply actions to reasonScore debate data
    setDebateData((oldDebateData) => {
        const newDebateData = rsReducer(actions, oldDebateData);
        // const newScores = calculateScores(newDebateData);

        return newDebateData;
    })
}
