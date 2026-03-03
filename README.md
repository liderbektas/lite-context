# @liderbektas/lite-context

A lightweight, type-safe React state management library with two approaches: **Context-based scoped stores** with Provider isolation, and **vanilla global stores** without any wrapper. Built on `useSyncExternalStore` with selector-based subscriptions — components only re-render when selected state actually changes.

```bash
npm install @liderbektas/lite-context
```

---

## Two Ways to Manage State

This library gives you two functions depending on your needs:

**`createLiteContext`** — Scoped state with a Provider. Each Provider creates its own isolated store instance. Great when the same store structure needs to exist in multiple places independently.

**`createStore`** — Global state without any Provider or wrapper. Direct access from anywhere, including outside React.

---

## createLiteContext

### Define

```ts
import createLiteContext from "@liderbektas/lite-context";

const { Provider, useStore } = createLiteContext({
  count: 0,
  name: "Counter",
});
```

### Wrap

```tsx
function App() {
  return (
    <Provider>
      <Counter />
      <Display />
    </Provider>
  );
}
```

### Use

```tsx
function Counter() {
  const [count, set] = useStore((state) => state.count);

  return (
    <button onClick={() => set((prev) => ({ ...prev, count: prev.count + 1 }))}>
      {count}
    </button>
  );
}

function Display() {
  const [name] = useStore((state) => state.name);
  return <p>{name}</p>;
}
```

`Counter` only re-renders when `count` changes. `Display` only re-renders when `name` changes. They are completely independent.

### Multiple Instances

Because state lives inside the Provider, you can render the same store structure in multiple places with fully isolated state:

```tsx
function App() {
  return (
    <>
      <Provider>
        <Counter /> {/* This has its own count */}
      </Provider>
      <Provider>
        <Counter /> {/* This has its own count */}
      </Provider>
    </>
  );
}
```

---

## createStore

### Define

```ts
import { createStore } from "@liderbektas/lite-context";

const store = createStore({ count: 0, name: "Counter" });
```

### Use inside React

```tsx
function useCount() {
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.get().count
  );
  return [state, store.set] as const;
}
```

### Use outside React

```ts
// Read
console.log(store.get());

// Write
store.set({ count: 10 });
store.set((state) => ({ count: state.count + 1 }));

// Listen
const unsubscribe = store.subscribe(() => {
  console.log("changed:", store.get());
});
```

No hooks, no components — direct access from event handlers, timers, or any JavaScript context.

---

## API Reference

### `createLiteContext(initialState)`

Returns `{ Provider, useStore }`.

- **`Provider`** — Wrap your component tree. Each Provider creates an isolated store instance.
- **`useStore(selector)`** — Returns `[selectedValue, set]`. The `set` function receives the full previous state and expects the full next state: `set(prev => ({ ...prev, count: prev.count + 1 }))`.

### `createStore(initialState)`

Returns `{ get, set, subscribe }`.

- **`get()`** — Returns the current state.
- **`set(partial)`** — Accepts a partial object or an updater function. State is shallowly merged.
- **`subscribe(listener)`** — Registers a listener for all state changes. Returns an unsubscribe function.

---

## When to Use Which

**Use `createLiteContext` when:**
- You need isolated state per component subtree
- Multiple instances of the same store should not share state
- You want React-scoped lifecycle (state resets when Provider unmounts)

**Use `createStore` when:**
- You need global state accessible from anywhere
- State should persist across component mounts/unmounts
- You need to read or write state outside React

---

## Requirements

- React **18+**
- TypeScript **4.7+** (recommended, not required)

---

## License

MIT