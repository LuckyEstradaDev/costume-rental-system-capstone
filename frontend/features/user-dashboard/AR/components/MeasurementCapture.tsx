import {useEffect, useRef, useState, type RefObject} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import type {AcceptedCapture, MeasurementRequest} from "../lib/measurementCapture";

type CaptureState =
  | {phase: "closed" | "ready" | "waiting" | "retry"}
  | ({phase: "review"} & AcceptedCapture);

type Props = {
  requestRef: RefObject<MeasurementRequest | null>;
  accepted: AcceptedCapture | null;
  onAccept: (capture: AcceptedCapture) => void;
  onRetake: () => void;
};

export function MeasurementCapture({requestRef, accepted, onAccept, onRetake}: Props) {
  const [state, setState] = useState<CaptureState>({phase: accepted ? "closed" : "ready"});
  const [waistInput, setWaistInput] = useState(accepted?.waistInches?.toString() ?? "");
  const [waistError, setWaistError] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.phase !== "waiting") return;
    const timeout = window.setTimeout(() => {
      if (!requestRef.current) return;
      requestRef.current = null;
      setState({phase: "retry"});
    }, 20000);
    return () => {
      window.clearTimeout(timeout);
      requestRef.current = null;
    };
  }, [state.phase, requestRef]);

  function start() {
    const input = waistInput.trim();
    const waistInches = input ? Number(input) : null;
    if (waistInches !== null && (!/^(?:\d+\.?\d*|\.\d+)$/.test(input) || !Number.isFinite(waistInches) || waistInches <= 0)) {
      setWaistError(true);
      return;
    }
    onRetake();
    requestRef.current = {
      samples: [],
      complete: (values) => setState({phase: "review", values, waistInches}),
    };
    setState({phase: "waiting"});
  }

  function close() {
    requestRef.current = null;
    setState({phase: "closed"});
  }

  return (
    <Dialog open={state.phase !== "closed"} onOpenChange={(open) => {
      if (!open) close();
      else if (accepted) setState({phase: "review", ...accepted});
      else setState({phase: "ready"});
    }}>
      <DialogTrigger asChild>
        <Button>{accepted ? "View measurements" : "Measure body"}</Button>
      </DialogTrigger>
      <DialogContent overlayClassName="bg-transparent supports-backdrop-filter:backdrop-blur-none" onOpenAutoFocus={(event) => {
        event.preventDefault();
        titleRef.current?.focus();
      }} className={state.phase === "waiting"
        ? "top-auto bottom-4 max-h-[85dvh] translate-y-0 overflow-y-auto"
        : "max-h-[90dvh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle ref={titleRef} tabIndex={-1}>{state.phase === "review" ? "Your measurements" : "Measure your body"}</DialogTitle>
          <DialogDescription aria-live="polite">
            {state.phase === "ready" && "Your camera is calibrated. Tap Start measurement, then step back so your shoulders, hips and wrists are visible."}
            {state.phase === "waiting" && "Face the camera with your shoulders, hips and wrists in view. Hold still for a second and your measurements will appear here."}
            {state.phase === "retry" && "We couldn’t get a steady reading. Check that your camera is on and step back until your hips and wrists are visible."}
            {state.phase === "review" && "These measurements stay fixed while you move or compare sizes."}
          </DialogDescription>
        </DialogHeader>
        {state.phase === "ready" && (
          <form id="ar-measure-body" className="space-y-2" onSubmit={(event) => { event.preventDefault(); start(); }}>
            <label htmlFor="ar-waist">Waist circumference in inches (optional)</label>
            <Input id="ar-waist" inputMode="decimal" value={waistInput} aria-invalid={waistError} aria-describedby="ar-waist-help" onChange={(event) => {
              setWaistInput(event.target.value);
              setWaistError(false);
            }} />
            <p id="ar-waist-help" className="text-sm text-muted-foreground">{waistError ? "Enter a number greater than zero, or leave this blank." : "Wrap a tape around your natural waist and enter the full distance around."}</p>
          </form>
        )}
        {state.phase === "review" && (
          <dl className="space-y-3">
            {[
              ["Shoulder width", state.values.shoulderIn],
              ["Torso length", state.values.torsoIn],
              ["Sleeve length", state.values.sleeveIn],
              ["Waist circumference", state.waistInches],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-base">{label}</dt>
                <dd className="text-right">
                  {typeof value === "number"
                    ? <span className="text-2xl font-semibold tabular-nums">{value.toFixed(1)} <span className="text-base">in</span></span>
                    : <span className="text-sm text-muted-foreground">Not measured</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <DialogFooter>
          {state.phase === "ready" && <Button type="submit" form="ar-measure-body">Start measurement</Button>}
          {state.phase === "retry" && <Button onClick={start}>Try again</Button>}
          {state.phase === "review" && <Button variant="outline" onClick={() => { onRetake(); setState({phase: "ready"}); }}>Measure again</Button>}
          <DialogClose asChild><Button onClick={() => {
            if (state.phase === "review" && !accepted) onAccept({values: state.values, waistInches: state.waistInches});
          }} variant={state.phase === "review" ? "default" : "outline"}>{state.phase === "review" ? (accepted ? "Done" : "Start try-on") : "Cancel"}</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
