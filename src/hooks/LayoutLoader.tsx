import FullScreenLoader from "@/components/FullScreenLoader";
import { useIsLoading } from "@/store/LoaderStore";

export default function LayoutLoader() {
  const isLoading = useIsLoading();

  return <FullScreenLoader visible={isLoading} />;
}
