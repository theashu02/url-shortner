import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import myLinksReducer from "./my-links-slice";
import analyticsReducer from "./analytics-slice";
import shortenReducer from "./shorten-slice";
import profileReducer from "./profile-slice";

export const store = configureStore({
  reducer: {
    myLinks: myLinksReducer,
    analytics: analyticsReducer,
    shorten: shortenReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
