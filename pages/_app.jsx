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
import Script from "next/script"


export default function MyAppComponent({ Component, pageProps }) {
  const router = useRouter();
  const path = router.asPath;
  const pathName = router.pathname;
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loader, setLoader] = useState(true);
  let componentMounted = true;
  const { handleLoading } = bookingsAction;

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

    // if (currentUser !== null) {
    //   router.push("/"); // you can get login user
    // } else {
    //   console.log(`redirecting >>> `);

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
