import React, { useContext } from "react";
import { DevContext, FlowDataContext } from "./FlowDataProvider";
import { Drawer, Button, IconName, Divider } from "@blueprintjs/core";
import { ClaimActions, ConnectorActions } from "@/reasonScoreNext/ActionTypes";
import { calculateScores } from "@/reasonScoreNext/scoring/TypeA/calculateScores";

const DevButton = ({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon: IconName;
    onClick: () => void;
}) => {
    return (
        <Button
            className="w-full justify-start"
            onClick={onClick}
            icon={icon}
            minimal
            text={label}
        />
    );
};

const DevPanel = () => {
    const flowDataState = useContext(FlowDataContext);
    const dev = useContext(DevContext);

    const deleteAll = () => {
        const nodeActions: Array<ClaimActions> = flowDataState.displayNodes.map((node) => ({
            type: "delete",
            newData: { id: node.id, type: "claim" },
        }));
        const edgeActions: Array<ConnectorActions> = flowDataState.displayEdges.map((edge) => ({
            type: "delete",
            newData: { id: edge.id, type: "connector" },
        }));

        flowDataState.dispatch([...nodeActions, ...edgeActions]);
    };

    return (
        <div className="bp5-dark">
            <Button
                hidden={dev.isDev}
                className={"absolute top-0 right-0 focus:outline-none"}
                onClick={() => dev.setDevMode(true)}
                icon="chevron-left"
                minimal
            >
                Dev
            </Button>
            <Drawer
                hasBackdrop={false}
                isOpen={dev.isDev}
                onClose={() => dev.setDevMode(false)}
                title="Dev"
                canOutsideClickClose={false}
                canEscapeKeyClose={true}
                position="right"
                size={"150px"}
                className={"bp5-dark"}
                usePortal={false}
                enforceFocus={false}
                autoFocus={false}
            >
                <div className="flex flex-col space-y-2 mt-4">
                    {/* <DevButton
                        icon={"send-to-graph"}
                        onClick={() => addNode({ x })}
                        label={"Add Node"}
                    /> */}
                    <Divider />
                    <DevButton
                        icon={"console"}
                        onClick={() => console.log(flowDataState.displayNodes)}
                        label={"Nodes"}
                    />
                    <DevButton
                        icon={"console"}
                        onClick={() => console.log(flowDataState.displayEdges)}
                        label={"Edges"}
                    />
                    <DevButton
                        icon={"console"}
                        onClick={() => { console.log("claims", flowDataState.debateData.claims); console.log("connectors", flowDataState.debateData.connectors) }}
                        label={"DebateData"}
                    />
                    <Divider />
                    <DevButton
                        icon={"sort"}
                        onClick={() => {
                            const calcScore = calculateScores(flowDataState.debateData);
                            console.log(calcScore);
                        }}
                        label={"Calculate Score"}
                    />
                    <Divider />
                    <DevButton
                        onClick={deleteAll}
                        icon={"trash"}
                        label={"Delete All"}
                    />
                </div>
            </Drawer>
        </div>
    );
};

export default DevPanel;
