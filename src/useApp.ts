import { useMemo, useReducer } from "preact/hooks";

interface AppState {
  status: "new" | "scanning" | "recognizing" | "solving" | "success" | "error";
  scanData: {
    boxes: any[];
    [key: string]: any;
  };
  error: string;
}

const initialState: AppState = {
  status: "new",
  scanData: null,
  error: "",
};

const reducer = (state: AppState, action): AppState => {
  if (action.type === "START_SCAN") {
    return {
      ...state,
      status: "scanning",
      scanData: null,
      error: "",
    };
  }
  if (action.type === "COMPLETE_SCAN") {
    return {
      ...state,
      status: "recognizing",
      scanData: action.scanData,
      error: "",
    };
  }
  if (action.type === "RESET") {
    return initialState;
  }
  return state;
};

export default function useApp() {
  let [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(() => {
    return {
      reset: () => dispatch({ type: "RESET" }),
      startScan: () => dispatch({ type: "START_SCAN" }),
      completeScan: (scanData) => dispatch({ type: "COMPLETE_SCAN", scanData }),
    };
  }, [dispatch]);

  return {
    ...state,
    actions,
  };
}
