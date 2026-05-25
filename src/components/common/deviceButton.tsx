import { useEffect, useState } from "react";
import { MEDIA_CONSTRAINTS } from "../../utils/constants";

const DeviceButton = ({ videoRef }: {videoRef: any }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [device, setDevice] = useState<MediaDeviceInfo | null>(null);

  const refreshDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(mediaDevices.filter((device: MediaDeviceInfo) => device.kind === "videoinput"));
    } catch (err: any) {
      console.error(`${err.name}: ${err.message}`);
    }
  }

  const handleClick = async (e: any, newDevice: MediaDeviceInfo) => {
    e.preventDefault();

    if (device?.deviceId === newDevice.deviceId) {
      return;
    }

    setDevice(newDevice);

    const constraints: any = {...MEDIA_CONSTRAINTS}
    constraints["video"]["deviceId"] = newDevice.deviceId
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.current.srcObject?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    videoRef.current.srcObject = stream;
  }

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
    }
  }, [])

  return (
    <div className="dropdown">
      <button onClick={refreshDevices} className="btn btn-dark btn-sm btn-outline-light dropdown-toggle w-100" id="deviceButton" data-bs-toggle="dropdown" aria-expanded="false">
      {(device === null) ? "Select a Device": `Device: ${device.label.split("(")[0]}`}
      </button>
      <ul className="dropdown-menu" aria-labelledby="deviceButton">
        {devices.map(device => 
          <li key={device.deviceId}>
            <a onClick={(e) => handleClick(e, device)} className="dropdown-item" href="#">
              {device.label.split("(")[0]}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default DeviceButton;
