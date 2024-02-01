import React, { createContext, useContext, useState } from "react";

type Error = {
    title: string;
    description: string;
    additionalInfo?: string;
    errorCode?: string;
} | null;

export type ErrorHandlingContextValue = {
    error: Error;
    setError: (error: Error) => void;
};

export const ErrorHandlingContext = createContext<ErrorHandlingContextValue | undefined>(undefined);

export const ErrorHandlingProvider = ({ children }: { children: React.ReactNode }) => {
    const [error, setError] = useState<Error>(null);

    const value = {
        error,
        setError,
    };

    return <ErrorHandlingContext.Provider value={value}>{children}</ErrorHandlingContext.Provider>;
};

export const useErrorHandling = () => {
    const context = useContext(ErrorHandlingContext);
    if (!context) {
        throw new Error("useErrorHandling must be used within a ErrorHandlingContext");
    }

    return context;
};
