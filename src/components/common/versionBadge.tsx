const VersionBadge = () => {
  return (
    <div
      className="position-fixed bottom-0 end-0 m-1 px-2 py-1 text-white-50 bg-dark bg-opacity-75 small rounded-1"
      style={{ zIndex: 1080, pointerEvents: "none" }}
      aria-label={`ChessCam version ${__APP_VERSION__}, build ${__APP_BUILD_ID__}`}
    >
      v{__APP_VERSION__} · {__APP_BUILD_ID__}
    </div>
  );
}

export default VersionBadge;
