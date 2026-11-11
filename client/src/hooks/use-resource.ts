import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import axios from "axios";

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener("petvet:data", retry);
    return () => window.removeEventListener("petvet:data", retry);
  }, [retry]);
  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get<T>(path, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setData(response.data);
      })
      .catch((error) => {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          setData(null);
          setError(errorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, revision]);
  return { data, loading, error, retry };
}
