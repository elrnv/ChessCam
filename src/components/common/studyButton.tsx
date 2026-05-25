import { useState, useEffect } from "react";
import { SetStudy, Study } from "../../types";
import { userSelect } from "../../slices/userSlice";
import { lichessSetStudies } from "../../utils/lichess";

const StudyButton = ({ study, setStudy, onlyBroadcasts }: 
  {study: Study | null, setStudy: SetStudy, onlyBroadcasts: boolean }
) => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const user = userSelect();

  const refreshStudies = async () => {
    setLoading(true);
    setError("");
    try {
      await lichessSetStudies(user.token, setStudies, user.username, onlyBroadcasts);
      setLoaded(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load");
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStudies();
  }, [user.token, user.username, onlyBroadcasts]);

  const handleClick = (e: any, study: Study) => {
    e.preventDefault();
    setStudy(study);
  }

  const label = () => {
    if (study !== null) {
      return `Study: ${study.name}`;
    } else if (loading) {
      return "Loading...";
    } else if (error !== "") {
      return "Study load failed";
    } else if (loaded && studies.length === 0) {
      return onlyBroadcasts ? "No Broadcasts" : "No Studies";
    }
    return onlyBroadcasts ? "Select a Broadcast" : "Select a Study";
  }

  return (
    <div className="dropdown">
      <button onClick={refreshStudies} className="btn btn-dark btn-sm btn-outline-light dropdown-toggle w-100" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        {label()}
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
        {error !== "" &&
          <li>
            <span className="dropdown-item-text">{error}</span>
          </li>
        }
        {studies.map(study => 
          <li key={study.id}>
            <a onClick={(e) => handleClick(e, study)} className="dropdown-item" href="#">{study.name} ({study.id})</a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default StudyButton;
