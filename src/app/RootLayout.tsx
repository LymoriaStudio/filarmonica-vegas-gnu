import { useNavigation, Outlet } from "react-router";
import { PageLoader } from "./components/PageLoader";

export default function RootLayout() {
  const navigation = useNavigation();
  return (
    <>
      {navigation.state === 'loading' && <PageLoader message="Carregando página..." />}
      <Outlet />
    </>
  );
}
