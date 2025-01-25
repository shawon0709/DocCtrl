import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToConsultantDataProvider } from '../components/classes/ToConsultantDataProvider'
import { DocHistoryDataProvider } from "@/components/classes/DocHistoryDataProvider";
import { FromConsultantDataProvider } from "@/components/classes/FromConsultantDataProvider";
import { FromEmployerDataProvider } from "@/components/classes/FromEmployerDataProvider";
import { FromOthersDataProvider } from "@/components/classes/FromOthersDataProvider";
import { ToOthersDataProvider } from "@/components/classes/ToOthersDataProvider";
import { ToEmployerDataProvider } from "@/components/classes/ToEmployerDataProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DocHistoryDataProvider>
      <FromConsultantDataProvider>        
          <FromEmployerDataProvider>
            <FromOthersDataProvider>
              <ToConsultantDataProvider>
                <ToEmployerDataProvider>
                  <ToOthersDataProvider>
                    <Component {...pageProps} />
                  </ToOthersDataProvider>
                </ToEmployerDataProvider>
              </ToConsultantDataProvider>
          </FromOthersDataProvider>
        </FromEmployerDataProvider>        
      </FromConsultantDataProvider>
    </DocHistoryDataProvider>
  );
}
