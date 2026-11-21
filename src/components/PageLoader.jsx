const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(90deg, #1d4ed8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      {/* Loader card */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo */}
        <img
          src="/adshamper_logo-removebg-preview.png"
          alt="Adshamper"
          className="h-16 w-auto object-contain mb-10"
          style={{ animation: 'fadeInDown 0.5s ease forwards' }}
        />

        {/* Spinner ring */}
        <div className="relative w-14 h-14 mb-8">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          {/* Active arc */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500"
            style={{ animation: 'spin 0.9s linear infinite' }}
          />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
            style={{ animation: 'progressBar 1.8s ease-in-out infinite' }}
          />
        </div>

        {/* Text */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
          style={{ animation: 'fadeIn 0.5s ease 0.3s both' }}>
          Loading
          <span style={{ animation: 'dotFlash 1.4s linear infinite' }}>...</span>
        </p>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes progressBar {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 0; }
          100% { width: 0%;   margin-left: 100%; }
        }
        @keyframes dotFlash {
          0%, 100% { opacity: 1; }
          33%       { opacity: 0; }
          66%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
