import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import "dayjs/locale/es";

import AppRoutes from "./routes/AppRoutes";

dayjs.locale("es");

function App() {
  return (
    <ConfigProvider locale={esES}>
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;
