import React, { useState, useEffect, Fragment } from "react";
import "node_modules/react-image-gallery/styles/scss/image-gallery.scss";
import Head from "next/head";
import { useRouter } from "next/router";
import "../public/assets/scss/color.scss";
import { ToastContainer } from "react-toastify";
import ChatContextProvider from "../helpers/chatContext/chatCtx";
import CustomizerContextProvider from "../helpers/customizerContext/customizerCtx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import store from "../app/store";
import AuthGuard, {
  handlePublicRoutes,
} from "../app/components/auth/AuthGuard";
import { SocketContext, getSocket } from "../app/components/socket";
import { LOCAL_STORAGE_KEYS, routingPaths } from "../app/common/constants";
import { bookingsAction } from "../app/components/common/common.slice";
import Script from "next/script";
import { getMe } from "../app/components/auth/auth.api";
import trackerAssist from '@openreplay/tracker-assist';
import Tracker from '@openreplay/tracker';


export default function MyAppComponent({ Component, pageProps }) {
  const router = useRouter();
  const path = router.asPath;
  const pathName = router.pathname;
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loader, setLoader] = useState(true);
  let componentMounted = true;
  const { handleLoading } = bookingsAction;

  // Initialize OpenReplay tracker
  const initializeTracker = async () => {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const userResponse = await getMe();
        const userInfo = userResponse.userInfo;
        
        if (userInfo && userInfo._id) {
           
           
          
          const newTracker = new Tracker({
            projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY,
            ingestPoint: "https://analytics.netqwix.com/ingest",
            // Enable comprehensive tracking
            captureIFrames: true,
            captureCanvas: true,
            captureCrossOriginIframes: true,
            respectDoNotTrack: false,
            // Network tracking
            captureNetworkRequests: true,
            captureNetworkResponses: true,
            captureNetworkHeaders: true,
            // Media tracking
            captureMedia: true,
            captureVideo: true,
            captureAudio: true,
            // DOM tracking
            captureDOM: true,
            captureCSS: true,
            captureStyles: true,
            // Performance tracking
            capturePerformance: true,
            captureMemory: true,
            captureErrors: true,
            captureConsole: true,
            // User interactions
            captureMouse: true,
            captureKeyboard: true,
            captureTouch: true,
            captureScroll: true,
            captureFocus: true,
            captureBlur: true,
            // File tracking
            captureFiles: true,
            captureImages: true,
            captureFonts: true,
            // Advanced features
            captureWebGL: true,
            captureWebWorkers: true,
            captureServiceWorkers: true,
            captureWebSockets: true,
            captureWebRTC: true,
            // Privacy and performance
            maskTextInputs: false,
            maskAllInputs: false,
            blockClass: 'openreplay-block',
            blockSelector: null,
            ignoreClass: 'openreplay-ignore',
            // Session recording
            recordCanvas: true,
            recordCrossOriginIframes: true,
            // Custom settings
            enableStrictMode: false,
            enableInjection: true,
            enableCompression: true,
            enableCache: true,
            // Timeouts
            networkTimeout: 10000,
            sessionTimeout: 3600000, // 1 hour
            // Sampling
            sampling: 100, // 100% of sessions
            // Debug mode
            debug: process.env.NODE_ENV === 'development',

            network:{
              capturePayload: true,
              captureHeaders: true,
              captureResponseHeaders: true,
              captureResponsePayload: true,
              captureRequestHeaders: true,
              captureRequestPayload: true,
              captureResponseStatus: true,
              captureResponseTime: true,
              captureRequestTime: true,
              captureRequestStatus: true,
            }
          });
          
          // Add comprehensive plugins
          newTracker.use(trackerAssist());
          
          newTracker.start();
          newTracker.setUserID(userInfo.email);
          newTracker.setMetadata(userInfo.email, userInfo.account_type || localStorage.getItem(LOCAL_STORAGE_KEYS.ACC_TYPE));
          
          // Set additional tracking properties using setMetadata
          newTracker.setMetadata("userAgent", navigator.userAgent);
          newTracker.setMetadata("screenResolution", `${screen.width}x${screen.height}`);
          newTracker.setMetadata("viewport", `${window.innerWidth}x${window.innerHeight}`);
          newTracker.setMetadata("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
          newTracker.setMetadata("language", navigator.language);
          newTracker.setMetadata("platform", navigator.platform);
          newTracker.setMetadata("cookieEnabled", navigator.cookieEnabled.toString());
          newTracker.setMetadata("onLine", navigator.onLine.toString());
          
          if (navigator.connection) {
            newTracker.setMetadata("connectionEffectiveType", navigator.connection.effectiveType);
            newTracker.setMetadata("connectionDownlink", navigator.connection.downlink.toString());
            newTracker.setMetadata("connectionRtt", navigator.connection.rtt.toString());
          }
          
          // Track performance metrics
          if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
              newTracker.setMetadata("pageLoadTime", (perfData.loadEventEnd - perfData.loadEventStart).toString());
              newTracker.setMetadata("domContentLoaded", (perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toString());
              
              const firstPaint = performance.getEntriesByName('first-paint')[0];
              if (firstPaint) {
                newTracker.setMetadata("firstPaint", firstPaint.startTime.toString());
              }
              
              const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0];
              if (firstContentfulPaint) {
                newTracker.setMetadata("firstContentfulPaint", firstContentfulPaint.startTime.toString());
              }
            }
          }
          
           
        } else {
           
        }
      } else {
         
      }
    } catch (error) {
      console.error("Error initializing tracker:", error);
    }
  };

  useEffect(() => {
    document.body.classList.add("sidebar-active");
    let localStorageUser = localStorage.getItem("email");
    // get all details about authenticate login users
    if (currentUser === undefined) {
      if(pathName !== "/meeting"){
        handlePublicRoutes(pathName, path, router);
      }
    } else {
      setCurrentUser(localStorageUser);
    }

    // Initialize tracker when component mounts
    initializeTracker();

    // if (currentUser !== null) {
    //   router.push("/"); // you can get login user
    // } else {
    //    

    //   handlePublicRoutes(pathName, path, router);
    // }
    // Page Loader
    setTimeout(() => {
      setLoader(false);
      store.dispatch(handleLoading(false));
    }, 1500);

    return () => {
      // This code runs when component is unmounted
      componentMounted = false; // (4) set it to false if we leave the page
    };
  }, [currentUser]);


  return (
    <Fragment>
       <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/sfxnljmqst";
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "sfxnljmqst");
          `,
        }}
      />
      <GoogleOAuthProvider clientId={process?.env?.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Head>
          <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />

          {/* <meta http-equiv="Content-Security-Policy" content="default-src *; img-src * 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src  'self' 'unsafe-inline' *" /> */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Netquix" />
          <meta name="keywords" content="Netquix" />
          <meta name="author" content="Netquix" />
          <link rel="icon" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="stylesheet" href="path/to/custom.css" />
          <title>Qwick Lessons Over the Net</title>
        </Head>
        <Provider store={store}>
          <AuthGuard>
            {/* adding socket as context hook */}
            {/* <SocketContext.Provider  value={getSocket()}>  */}
            {loader && (
              // <div className="chitchat-loader">
              //   <img src="/assets/images/logo/logo_big.png" alt="" />
              //   <h3>Simple, secure messaging for fast connect to world..!</h3>
              // </div>
              <div className="chitchat-loader">
                <img src="/assets/images/netquix_logo_beta.png" alt="images" />
              </div>
            )}
            <div>
              <CustomizerContextProvider>
                <ChatContextProvider>
                  <Component {...pageProps} />
                </ChatContextProvider>
              </CustomizerContextProvider>
              <ToastContainer />
            </div>
            {/* </SocketContext.Provider> */}
          </AuthGuard>
        </Provider>
      </GoogleOAuthProvider>
    </Fragment>
  );
}
