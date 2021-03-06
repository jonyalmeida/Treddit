import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { Provider, createClient } from "urql";

const client = createClient({
    url: "http://localhost:8081/graphql",
    fetchOptions: {
        credentials: "include",
    },
});

import theme from "../theme";

function MyApp({ Component, pageProps }: any) {
    return (
        <Provider value={client}>
            <ThemeProvider theme={theme}>
                <CSSReset />
                <Component {...pageProps} />
            </ThemeProvider>
        </Provider>
    );
}

export default MyApp;
