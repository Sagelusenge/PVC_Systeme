import { useCallback, useEffect, useState } from "react";

export default function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
  const refresh = useCallback(async () => { setLoading(true); setError(null); try { setData(await fetcher()); } catch (err) { setError(err); } finally { setLoading(false); } }, dependencies);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh, setData };
}
