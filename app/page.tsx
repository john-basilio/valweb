'use client';
//TODO: FINISH THE SURPRISE SCREEN CONTENT AND UI
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

//  #               #
//  #     MAIN      #
//  #               #  
export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogin, setShowLogin] = useState(isLoginPhaseActive())
  const [mainState, setMainState] = useState<"playing" | "surprise">("playing");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  //    Because of browser autoplay policies, we need to trigger audio play on user interaction, 
  //    which is done in the TempLogin component. However, we also want to ensure that the BGM 
  //    stops when the surprise screen is shown. This effect listens for changes in mainState and 
  //    pauses/resets the BGM when the surprise screen is activated.
  
  useEffect(() => {
  if (mainState === "surprise" && bgmRef.current) {
    bgmRef.current.pause();
    bgmRef.current.currentTime = 0;
  }
}, [mainState]);

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

//    Expiration check, fake login screen is visible until Feb 15, 2026 12:00 A.M. GMT+8
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
        <div className="text-white text-2xl">Entering the hallway... <br/> Best with headphones</div>
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
};
  function TempLogin() {
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [loginError, setLoginError] = useState('');

    //    Hard coded login for demo purposes  
    const handleLogin = () => {
      const USER = "Gary";
      const PASS = "0214";
      

      if (loginUser === USER && loginPass === PASS) {
        setLoginError('');
        setShowLogin(false);

        if (!bgmRef.current) {
          const audio = new Audio('/asset/sounds/horrorambiance3.mp3');
          audio.loop = true;
          audio.volume = 0.4; 
          bgmRef.current = audio;
          audio.play().catch(err => console.warn('BGM play blocked:', err));
        } else {
          bgmRef.current.play().catch(err => console.warn('BGM play blocked:', err));
        }

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
    const [fadeOut, setFadeOut] = useState(false);
    const surpriseAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      requestAnimationFrame(() => {
        setFadeOut(true);
      });

      if (!surpriseAudioRef.current) {
        const audio = new Audio('/asset/sounds/surprise.mp3');
        audio.volume = 0.7; 
        surpriseAudioRef.current = audio;
        audio.play().catch(err => console.warn('Surprise audio play blocked:', err));
      } else {
        surpriseAudioRef.current.play().catch(err => console.warn('Surprise audio play blocked:', err));
      }
      return () => {};
    }, []);

    
    return (
    <div className="w-full h-full flex flex-col items-center justify-center ">
      <div className={`fixed inset-0 bg-white z-50 transition-opacity delay-1000 duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"}`}  ></div>
      <div className="w-full h-full inset-0 z-20 bg-pink-500 flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-5xl md:text-7xl font-bold text-green-500">Surprise!</h1>
        <div className="relative align-center">
          <Image
            src="/asset/images/gary_flower.png"
            alt="Gary"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        <p className="text-1xl md:text-3xl text-center font-bold text-green-500">
          Gary has surprised you on Valentine's day!
          <br />
          Say "Happy Valentine's, Gary!" to show your appreciation.
        </p>
      </div>
    </div>
    )
};

//  #                    #
//  #     MAIN BODY      #
//  #                    #  
  return (
    <div className="w-screen h-screen overflow-hidden">
      {!isLoaded && <LoadingScreen />}
      {showLogin && <TempLogin />}
      {/* Always mounts iframe so it only rerenders when needed  */}
      <iframe 
        ref={iframeRef}
        src="/game_export/valwebgame.html"
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