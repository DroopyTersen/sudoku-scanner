import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import Recognition from "./recognition/Recognition";
import Scanner from "./scanner/Scanner";
import useApp from "./useApp";
import { CanvasMode } from "./utils/canvas";

export default function App() {
  let { status, actions, scanData } = useApp();
  console.log("App -> scanData", scanData);
  const [displayMode, setDisplayMode] = useState<CanvasMode>("original");

  return (
    <div>
      {status === "new" && (
        <button onClick={actions.startScan}>Start Scan</button>
      )}
      <div className="mode-buttons">
        <button
          className={displayMode === "original" ? "" : "outline"}
          onClick={() => setDisplayMode("original")}
        >
          Original
        </button>
        <button
          className={displayMode === "greyscale" ? "" : "outline"}
          onClick={() => setDisplayMode("greyscale")}
        >
          Greyscale
        </button>
        <button
          className={displayMode === "thresholded" ? "" : "outline"}
          onClick={() => setDisplayMode("thresholded")}
        >
          Thresholded
        </button>
      </div>
      {status === "scanning" && (
        <Scanner
          mode={displayMode}
          onSuccess={actions.completeScan}
          onCancel={actions.reset}
        />
      )}
      {status === "recognizing" && (
        <Recognition scanData={scanData} mode={displayMode} />
      )}
    </div>
  );
}
