'use client';
//TODO: FINISH THE GAME'S GRAPHICS AND LEVEL DESIGN
//TODO: FINISH THE SURPRISE SCREEN CONTENT AND UI
import { useState, useEffect } from "react";
import Image from "next/image";

//  #               #
//  #     MAIN      #
//  #               #  
export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(isLoginPhaseActive())
  const [mainState, setMainState] = useState<"playing" | "surprise">("playing");
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    // (GODOT) when player collides with wall, it will send a post message that will be recieved by this variable
    const handleMessage = (event: MessageEvent) => {
      // TODO: After making the website live (1)
      // if (event.origin !== "https://domain.com") return;
      
      // Is where we access postmessage from godot game+iframe
      const data = event.data;

      //Awaits ready signal from godot, shows loading screen until the main scene is fullyloaded
      if (data === "is_loaded" || (typeof data === 'object' && data?.type === "is_loaded")) {
        setIsLoaded(true);
      }
      // Handles the switch screen signal from godot
      if (data === "switch_screen" || (typeof data === 'object' && data?.type === "switch_screen")) {
        setMainState("surprise");
      }
    };

    //Initialize the listener
    window.addEventListener('message', handleMessage);

    //Recommended memory cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

//  #                           #
//  #     HELPER FUNCTIONS      #
//  #                           #

// Expiration check, fake login screen is visible until Feb 15, 2026 12:00 A.M. GMT+8
  function isLoginPhaseActive(): boolean {
    // Feb 15, 2026 00:00:00 GMT+8 = 2026-02-14 16:00:00 UTC
    const cutoffdate = new Date('2026-02-14T16:00:00Z'); // Z = UTC
    return new Date() < cutoffdate;
  }
//  #                     #
//  #     COMPONENTS      #
//  #                     #  

  function LoadingScreen() {
    return (
      <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-white text-2xl">Entering the hallway...</div>
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  function TempLogin() {
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [loginError, setLoginError] = useState('');

    //Hard coded login for demo purposes  
    const handleLogin = () => {
      const USER = "";
      const PASS = "";

      if (loginUser === USER && loginPass === PASS) {
        setLoginError('');
        setShowLogin(false);
      } else {
        setLoginError('Try again');
      }
    };

  return (
    <div className="opacity-75 absolute inset-0 z-20 flex items-center justify-center    backdrop-blur-md">
      <div className="w-full max-w-lg mx-6 p-10 backdrop-blur-xl rounded-2xl  text-white flex flex-col items-center gap-6">
        <input
          type="text"
          value={loginUser}
          onChange={(e) => setLoginUser(e.target.value)}
          className="px-4 py-2 rounded-xl bg-black/15 border border-white/30 text-white placeholder-white/60 focus:outline-none"
        />
        <input
          type="password"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
          className="px-4 py-2 rounded-xl bg-black/15 border border-white/30 text-white placeholder-white/60 focus:outline-none"
        />

        {loginError && (
          <div className="text-center text-red-400 text-sm">{loginError}</div>
        )}

        <button
          onClick={handleLogin}
          className="px-4 py-2 rounded-xl bg-black/15 border border-white/30 text-white placeholder-white/60 focus:outline-none"
        >
          Enter
        </button>
      </div>
    </div>
  )
};

  function Surprise() {
    return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="absolute inset-0 z-20 bg-gray-900/90 flex flex-col items-center justify-center gap-8 p-6 text-white">
        <h1 className="text-5xl md:text-7xl font-bold text-green-500">Surprise!</h1>
        <p className="text-2xl md:text-3xl text-center">
          You won!<br />Great job.
        </p>
      </div>
    </div>
    )
  }

//  #                    #
//  #     MAIN BODY      #
//  #                    #  
  return (
    <div className="w-screen h-screen overflow-hidden">
      {!isLoaded && <LoadingScreen />}
      {showLogin && <TempLogin />}
      {/* Always mounts iframe so it only rerenders when needed  */}
      <iframe 
        src="/valwebgame/valwebgame.html"
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
      />
      {mainState === "surprise" && (
        <Surprise />
      )}
    </div>
  );
}