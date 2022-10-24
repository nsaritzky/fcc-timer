import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Duration, DateTime } from "luxon";
import { ChevronDown, ChevronUp, Pause, Play, TimerReset } from "lucide-react";
import useInterval from "./use-interval";

const Minute = Duration.fromObject({ minutes: 1 });
const initialSession = Duration.fromObject({ minutes: 25 });
const initialRest = Duration.fromObject({ minutes: 5 });

function App() {
  const [session, setSession] = useState(initialSession);
  const [rest, setRest] = useState(initialRest);
  const [timeLeft, setTimeLeft] = useState(
    Duration.fromObject({ minutes: 25 })
  );
  const [endTime, setEndTime] = useState(null as null | DateTime);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(false);
  const [isSession, setIsSession] = useState(true);

  const beep = useRef<HTMLAudioElement>(null);

  const handleTimer = () => {
    if (running && endTime) {
      setTimeLeft(endTime.diff(DateTime.now()));
    }
    if (timeLeft.as("milliseconds") < 100) {
      console.log(`Time left in ms: ${timeLeft.as("millisecond")}`);
      setEndTime(DateTime.now().plus(isSession ? rest : session));
      setTimeLeft(isSession ? rest : session);
      setIsSession((t) => !t);
    }
  };

  useInterval(
    () => {
      handleTimer();
    },
    running ? 100 : null
  );

  const startStop = () => {
    if (!active) {
      setEndTime(DateTime.now().plus(session));
      setActive(true);
    }
    if (!running) {
      setEndTime(DateTime.now().plus(timeLeft));
      setRunning(true);
    } else if (running) {
      setRunning(false);
    }
  };

  const reset = () => {
    if (active) {
      setActive(false);
    }
    setRunning(false);
    setSession(initialSession);
    setRest(initialRest);
    setTimeLeft(initialSession);
    setIsSession(true);
    beep.current!.pause();
    beep.current!.currentTime = 0;
  };

  const incTime = (d: Duration) => {
    if (d.as("minutes") < 60 && !active) {
      return d.plus(Minute);
    } else {
      return d;
    }
  };

  const decTime = (d: Duration) => {
    if (d.as("minutes") > 1 && !active) {
      return d.minus(Minute);
    } else {
      return d;
    }
  };

  useEffect(() => {
    if (timeLeft.toFormat("mm:ss") === "00:00") {
      beep.current?.play();
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(session);
  }, [session]);

  return (
    <div className="max-w-md m-auto">
      <div className="flex justify-between my-10">
        <div className="flex flex-col w-24 items-center">
          <div id="session-label">Session</div>
          <div className="flex">
            <div id="session-decrement" onClick={() => setSession(decTime)}>
              <ChevronDown />
            </div>
            <div className="w-6" id="session-length">
              {session.minutes}
            </div>
            <div id="session-increment" onClick={() => setSession(incTime)}>
              <ChevronUp />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-24 items-center">
          <div id="break-label">Break</div>
          <div className="flex">
            <div id="break-decrement" onClick={() => setRest(decTime)}>
              <ChevronDown />
            </div>
            <div id="break-length" className="w-6">
              {rest.minutes}
            </div>
            <div id="break-increment" onClick={() => setRest(incTime)}>
              <ChevronUp />
            </div>
          </div>
        </div>
      </div>
      <button className="p-2" id="start_stop" onClick={() => startStop()}>
        {running ? <Pause /> : <Play />}
      </button>
      <button className="p-2" id="reset" onClick={reset}>
        <TimerReset />
      </button>
      <div id="timer-label">{isSession ? "Session" : "Rest"}</div>
      <audio
        id="beep"
        ref={beep}
        src="./build_testable-projects-fcc_audio_BeepSound.wav"
      ></audio>
      <div id="time-left" className="text-3xl">
        {timeLeft.as("millisecond") > 0 ? timeLeft.toFormat("mm:ss") : "00:00"}
      </div>
    </div>
  );
}

export default App;
