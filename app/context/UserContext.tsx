"use client";

import { createContext } from "react";

export const UserContext = createContext<{
    user: any;
    setUser: (user: any) => void;
}>({
    user: null,
    setUser: () => {},
});