import { Edge, Handle, NodeProps, Position, ReactFlowState, getBezierPath, useStore } from 'reactflow';
import { halfStroke, maxStrokeWidth } from './config';
import { ConfidenceEdgeData, DisplayNodeData } from './pageData';
import { Fragment, useContext, useState } from 'react';
import { DevContext } from './page';
import { Button, TextArea, Tooltip } from '@blueprintjs/core';
import { RsRepoContext } from './page';

export function DisplayNode(props: NodeProps<DisplayNodeData>) {
    const { data, id, xPos, yPos } = props
    const isDev = useContext(DevContext);
    const rsRepo = useContext(RsRepoContext)
    const [nodeText, setNodeText] = useState(data.claim.content);
    const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>, id: string) => {
        setNodeText(e.target.value);
        rsRepo.updateClaim(id, e.target.value);
    };

    const allSources = useStore((s: ReactFlowState) => {
        const originalSources: Edge<ConfidenceEdgeData>[] = s.edges.filter(
            (e) => e.target === id && e.data?.type !== 'relevance'
        );

        return originalSources;
    });

    // console.log({ [id]: { x: xPos.toFixed(0), y: yPos.toFixed(0) } })

    const relevance = <div className="rsCalc" style={{ gridArea: 'relevance', width: '50px' }}>
        <svg
            height={data.score.relevance * maxStrokeWidth}
            width={'50px'}>
            <polygon
                style={{ opacity: .4, fill: `var(--${data.pol})` }}
                points={`
                        0                 , 0
                        0                 , ${data.score.relevance * maxStrokeWidth}
                        50 , ${maxStrokeWidth}
                        50 , 0
                    `}
            />
            <polygon
                style={{ fill: `var(--${data.pol})` }}
                points={`
                        0                 , ${(data.score.relevance * halfStroke) - (data.score.confidence * maxStrokeWidth)}
                        0                 , ${(data.score.relevance * halfStroke) + (data.score.confidence * maxStrokeWidth)}
            50 , ${(data.score.confidence) * maxStrokeWidth}
            50 , 0
                    `}
            />
        </svg>
    </div>

    const cancelOut = <div className="rsCalc" style={{ gridArea: 'cancelOut', position: "relative" }}>
        <div style={{ opacity: .4, backgroundColor: `var(--${data.pol})`, height: `${maxStrokeWidth}px` }}>
        </div>
        <div style={{
            backgroundColor: `var(--${data.pol})`,
            height: `${data.score.confidence * maxStrokeWidth}px`,
            position: 'absolute', top: '0px', left: '0px',
            width: '100%'
        }}>
        </div>

        {allSources.length > 0 && <>
            <svg
                style={{ position: 'absolute', right: '0px', top: '0px' }}

                height={maxStrokeWidth}
                width={maxStrokeWidth * 2}>

                <polygon
                    fill='url(#cancelOutPattern)'
                    points={`
                        ${maxStrokeWidth} , 0
                        ${maxStrokeWidth}  , ${maxStrokeWidth}
                        ${maxStrokeWidth * 2} , ${maxStrokeWidth}
                        ${maxStrokeWidth * 2} , 0
                    `}
                />

                {/* <svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><rect width='800%' height='800%' transform='translate(0,0)' fill='url(#a)' /></svg> */}

                <polygon
                    style={{ fill: `var(--${data.pol})` }}
                    points={`
                                    0                 , ${data.cancelOutStacked.top * maxStrokeWidth}
                                    0                 , ${data.cancelOutStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth * 2} , ${data.cancelOutStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth * 2} , ${data.cancelOutStacked.top * maxStrokeWidth}
                                `}
                />
            </svg>
        </>}
    </div>

    const scaleTo1 = <div className="rsCalc" style={{ gridArea: 'scaleTo1' }}>
        {allSources.length > 0 && <>
            <svg
                height={(
                    (allSources[allSources.length - 1]?.data?.targetTop || 1) + (allSources[allSources.length - 1].data?.maxImpact || 0)
                ) * maxStrokeWidth}
                width={'50px'}>
                {allSources.map(s => {
                    const data = s.data;
                    if (data) {

                        const {
                            consolidatedStacked,
                            scaledTo1Stacked,
                        } = data;

                        return <Fragment key={s.id}>

                            <polygon
                                style={{ fill: `var(--${s.data?.pol})` }}
                                points={`
                        0                 , ${scaledTo1Stacked.top * maxStrokeWidth}
                        0                 , ${scaledTo1Stacked.bottom * maxStrokeWidth}
                        50 , ${consolidatedStacked.bottom * maxStrokeWidth}
                        50 , ${consolidatedStacked.top * maxStrokeWidth}
                    `}
                            />
                        </Fragment>
                    }
                }

                )}
            </svg>
        </>}
    </div>

    const consolidate = <div className="rsCalc" style={{ gridArea: 'consolidate' }}>
        {allSources.length > 0 && <>
            <svg
                height={(
                    (allSources[allSources.length - 1]?.data?.targetTop || 1) + (allSources[allSources.length - 1].data?.maxImpact || 0)
                ) * maxStrokeWidth}
                width={'100px'}>
                {allSources.map(s => {
                    const data = s.data;
                    if (data) {

                        const {
                            reducedImpactStacked,
                            consolidatedStacked
                        } = data;

                        const [edgePath, labelX, labelY] = getBezierPath({
                            sourceX: 100,
                            sourceY: reducedImpactStacked.center * maxStrokeWidth,
                            sourcePosition: Position.Left,
                            targetX: 0,
                            targetY: consolidatedStacked.center * maxStrokeWidth,
                            targetPosition: Position.Right,
                        });

                        return <Fragment key={s.id}>
                            <path
                                style={{
                                    stroke: `var(--${s.data?.pol})`,
                                    strokeWidth: (reducedImpactStacked.bottom - reducedImpactStacked.top) * maxStrokeWidth,
                                }}

                                d={edgePath}
                            />
                        </Fragment>
                    }
                }

                )}
            </svg>
        </>}
    </div>

    const weightByConfidence = <div className="rsCalc" style={{ gridArea: 'weightByConfidence' }}>
        {allSources.length > 0 && <>
            <svg
                height={(
                    (allSources[allSources.length - 1]?.data?.targetTop || 1) + (allSources[allSources.length - 1].data?.maxImpact || 0)
                ) * maxStrokeWidth}
                width={maxStrokeWidth}>
                {allSources.map(s => {
                    const data = s.data;
                    if (data) {

                        const {
                            maxImpactStacked,
                            impactStacked,
                            reducedImpactStacked,
                            reducedMaxImpactStacked
                        } = data;

                        return <Fragment key={s.id}>

                            <polygon
                                style={{ opacity: .4, fill: `var(--${s.data?.pol})` }}
                                points={`
                                    0                 , ${reducedMaxImpactStacked.top * maxStrokeWidth}
                                    0                 , ${reducedMaxImpactStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth} , ${maxImpactStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth} , ${maxImpactStacked.top * maxStrokeWidth}
                                `}
                            />

                            <polygon
                                style={{ fill: `var(--${s.data?.pol})` }}
                                points={`
                                    0                 , ${reducedImpactStacked.top * maxStrokeWidth}
                                    0                 , ${reducedImpactStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth} , ${impactStacked.bottom * maxStrokeWidth}
                                    ${maxStrokeWidth} , ${impactStacked.top * maxStrokeWidth}
                                `}
                            />
                        </Fragment>
                    }
                }

                )}
            </svg>
        </>}
    </div>

    return (
        <div className="rsNode" >
            <div className="rsNodeGrid" style={{ minHeight: (allSources?.length || 1) * maxStrokeWidth }}>
                {relevance}
                {cancelOut}
                {scaleTo1}
                {consolidate}
                {weightByConfidence}
                <div style={{ gridArea: "content" }} className={`rsContent ${data.pol}`}>
                    {isDev ? <>
                        {/* <p>scoreId: {data.score.id}</p> */}
                        {/* <p>nodeId: {id}</p> */}
                        {/* <p>claimId: {data.claim.id}</p> */}

                        {/* data.score values: */}
                        {/*
                        "affects": "confidence",
                        "childrenAveragingWeight": 1,
                        "childrenConfidenceWeight": 1,
                        "childrenRelevanceWeight": 1,
                        "childrenWeight": 1,
                        "confidence": 1,
                        "content": "",
                        "descendantCount": 0,
                        "fraction": 0.5,
                        "fractionSimple": 0.25,
                        "generation": 1,
                        "id": "costScore",
                        "parentScoreId": "mainClaimScore",
                        "percentOfWeight": 0.3333333333333333,
                        "priority": "",
                        "proParent": false,
                        "relevance": 1,
                        "reversible": false,
                        "scoreRootId": "ScoreRoot",
                        "sourceClaimId": "cost",
                        "sourceEdgeId": "costEdge",
                        "type": "score",
                        "weight": 1 
                        */}

                        <table>
                            <tbody>
                                {
                                Object.entries(data.score).map(([key, value]) => {
                                    const values = [
                                        "id",
                                        "confidence", 
                                        "relevance",
                                    ]
                                    if (values.includes(key)) {
                                        return <tr key={key}>
                                            <td>{key}</td>
                                            <td>{((typeof value === "number") ? value.toFixed(2) : value)}</td>
                                        </tr>
                                    }
                                })}
                            </tbody>
                        </table>

                        <Tooltip content="data" position="right">
                            <Button
                                minimal
                                small
                                className="mb-1"
                                icon="database"
                                onClick={() => {
                                    console.log("data", id)
                                    console.log(id, data)
                                    console.log("cancelOutStacked", data.cancelOutStacked)
                                }}
                            />
                        </Tooltip>
                        <Tooltip content="allSources" position="right">
                            <Button
                                minimal
                                small
                                className="mb-1"
                                icon="database"
                                onClick={() => {
                                    console.log("allSources", allSources)
                                }}
                            />
                        </Tooltip>
                    </> : <>
                        <TextArea
                            className="invisible-input text-white"
                            value={nodeText}
                            onChange={(e) => handleChangeText(e, data.claim.id)}
                            autoResize
                            asyncControl
                        />
                    </>}
                </div>
            </div>

            <Handle type="target"
                id="relevance"
                position={Position.Top}
                style={{ left: 50 - halfStroke + 'px' }}
            />

            <Handle type="source"
                position={Position.Left}
                style={{ top: 0 }}
                isConnectableStart={false}
            />

            <Handle
                type="target"
                id="confidence"
                position={Position.Right}
                style={{ top: 0 }}
                isConnectable={true}
            />
        </div>
    );
}