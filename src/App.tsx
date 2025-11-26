import { Analyzer } from "./components/Analyzer.tsx";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

dayjs.locale("ko");

export default function App() {
  return (
    <MantineProvider>
      <DatesProvider
        settings={{
          locale: "ko",
        }}
      >
        <Analyzer />
      </DatesProvider>
    </MantineProvider>
  );
}
