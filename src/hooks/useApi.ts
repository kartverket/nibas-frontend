import { useEffect, useMemo, useReducer } from "react";

type Action<T> =
  | { type: "fetch" }
  | { type: "success"; data: T }
  | { type: "error"; error: string };

const fetchStart = <T>(): Action<T> => ({
  type: "fetch",
});

const fetchSuccess = <T>(data: T): Action<T> => ({
  type: "success",
  data,
});

const fetchError = <T>(error: string): Action<T> => ({
  type: "error",
  error,
});

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// vi må wrappe reduceren i en funksjon for å gjøre den type-sikker
const createApiReducer =
  <T>() =>
  (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case "fetch": {
        return {
          data: null,
          error: null,
          loading: true,
        };
      }
      case "success": {
        return {
          data: action.data,
          loading: false,
          error: null,
        };
      }
      case "error": {
        return {
          error: action.error,
          loading: false,
          data: null,
        };
      }
    }
  };

const useApi = <T>(url: string, initialData: T | null = null) => {
  const apiReducer = useMemo(() => createApiReducer<T>(), []);
  const [state, dispatch] = useReducer(apiReducer, {
    data: initialData,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // hvis komponenten unmounter før fetch er ferdig, ikke oppdater state
    let isMounted = true;

    const fetchData = async () => {
      dispatch(fetchStart());

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (isMounted) {
          dispatch(fetchSuccess(json));
        }
      } catch (error) {
        if (isMounted) {
          dispatch(fetchError(error as string));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};

export default useApi;
