import { ReactNode, createContext, useContext, useReducer, useState } from 'react';
import { useEdgesState, useNodesState } from 'reactflow';
import { DisplayNodeData, ConfidenceEdgeData, RelevenceEdgeData } from './pageData';
import { ActionTypes } from '@/reasonScoreNext/ActionTypes';
import { flowDataReducer } from './flowDataReducer';
import { DebateData } from '@/reasonScoreNext/DebateData';

const initialArg: FlowDataState = undefined;
export const FlowDataContext = createContext<FlowDataState | undefined>(initialArg);


export function FlowDataProvider({ children }: { children: ReactNode[] }) {
  const [debateData, setDebateData] = useState<DebateData>({claims:{}, connectors:{} })

  async function dispatch(actions: ActionTypes[]) {
    flowDataReducer({ actions, setDebateData })
  }

  return (
    <FlowDataContext.Provider value={{ dispatch }}>
      {children}
    </FlowDataContext.Provider>
  );
}

export type FlowDataState = any


