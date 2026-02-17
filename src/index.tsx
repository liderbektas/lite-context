import { createContext, useCallback, useContext, useRef, useSyncExternalStore } from "react";

export default function createLiteContext<Store>(initialState: Store) {

    function useStoreData() {
        const store = useRef(initialState);
        const subscribers = useRef(new Set<() => void>())

        const get = useCallback(() => store.current, [])

        const set = useCallback((updater: (store: Store) => Store) => {
            store.current = updater(store.current);
            subscribers.current.forEach((cb) => cb());
        }, []);

        const subscribe = useCallback((callback: () => void) => {
            subscribers.current.add(callback);
            return () => subscribers.current.delete(callback)
        }, [])

        return { get, set, subscribe }
    }

    type UseStoreDataReturnType = ReturnType<typeof useStoreData>

    const StoreContext = createContext<UseStoreDataReturnType | null>(null)

    function Provider({ children }: { children: React.ReactNode }) {
        return (
            <StoreContext.Provider value={useStoreData()} >
                {children}
            </StoreContext.Provider>
        );
    }

    function useStore<SelectorOutput>(
        selector: (store: Store) => SelectorOutput
    ): [SelectorOutput, (updater: (store: Store) => Store) => void] {
        const store = useContext(StoreContext);
        if (!store) {
            throw new Error('Store not found');
        }

        const state = useSyncExternalStore(
            store.subscribe,
            () => selector(store.get()),
        );

        return [state, store.set];
    }

    return {
        Provider,
        useStore,
    };
}