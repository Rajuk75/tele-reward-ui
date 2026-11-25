const PageLoader = ({ label = 'Loading...', fullScreen = true }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 ${
        fullScreen ? 'min-h-screen' : 'min-h-[240px] rounded-xl border border-slate-200 bg-white'
      }`}
    >
      <img
        src={`${import.meta.env.BASE_URL}adshamper_logo-removebg-preview.png`}
        alt="adsHamper"
        className="h-9 w-auto object-contain opacity-90"
      />

      <div className="flex items-center gap-2.5 text-slate-600">
        <span
          aria-hidden="true"
          className="size-4 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"
        />
        <span className="text-xs font-medium tracking-wide">{label}</span>
      </div>
    </div>
  );
};

export default PageLoader;
