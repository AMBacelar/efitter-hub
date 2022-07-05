import { AppProps } from 'next/app';
import Head from 'next/head';
import 'semantic-ui-css/semantic.min.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to simple-scraper!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
