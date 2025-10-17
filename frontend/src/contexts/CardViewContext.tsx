import { createContext, Dispatch, useEffect, useReducer } from "react";

import { ViewState, ViewType } from "../types/ContextTypes";

type CardViewContext = [ViewState, Dispatch<Action>];

export const CardViewContext = createContext<CardViewContext | undefined>(
    undefined
);

const initialState: ViewState = {
    view: "grid",
};

const getInitialState = (): ViewState => {
    try {
        const cached = localStorage.getItem("cardView");
        return cached ? (JSON.parse(cached) as ViewState) : { view: "grid" };
    } catch {
        return { view: "grid" };
    }
};

type Action =
    | { type: "setView"; payload: { view: ViewType } }
    | {
          type: "reset";
      };

function cardViewReducer(state: ViewState, action: Action) {
    switch (action.type) {
        case "setView":
            return {
                ...state,
                view: action.payload.view,
            };
        case "reset":
            return initialState;
        default:
            return state;
    }
}

interface CardViewProviderProps {
    children: React.ReactNode;
}

const CardViewProvider = ({ children }: CardViewProviderProps) => {
    const [state, dispatch] = useReducer(
        cardViewReducer,
        initialState,
        getInitialState
    );

    useEffect(() => {
        localStorage.setItem("cardView", JSON.stringify(state));
    }, [state]);
    return (
        <CardViewContext.Provider value={[state, dispatch]}>
            {children}
        </CardViewContext.Provider>
    );
};

export default CardViewProvider;
