import { findCorners } from "../../utils/findCorners";
import { useDispatch } from 'react-redux';
import SidebarButton from "./sidebarButton";

const CornersButton = ({ piecesModelRef, xcornersModelRef, videoRef, canvasRef, setText}: 
  {piecesModelRef: any, xcornersModelRef: any, videoRef: any, canvasRef: any, setText: any}) => {
  const dispatch = useDispatch();

  const handleClick = (e: any) => {
    e.preventDefault();

    if ((piecesModelRef.current === undefined) || (xcornersModelRef.current === undefined)) {
      setText(["Still loading models"]);
      return;
    }

    setText(["Finding corners"]);
    findCorners(piecesModelRef, xcornersModelRef, videoRef, canvasRef, dispatch, setText)
      .catch((err: Error) => {
        console.error(err);
        setText(["Find corners failed", err.message]);
      });
  }

  return (
    <SidebarButton onClick={handleClick}>
      Find Corners
    </SidebarButton>
  );
};

export default CornersButton;
