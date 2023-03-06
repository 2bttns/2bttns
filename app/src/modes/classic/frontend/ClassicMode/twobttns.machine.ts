import { assign, createMachine } from "xstate";
import {
  ChoiceReplacement,
  Context,
  DefaultOptionFields,
  EventObject,
  Item,
  TypeState,
  UserChoice,
} from "./types";

const createMachine2bttns = <I extends Item = Item>() => {
  return (
    /** @xstate-layout N4IgpgJg5mDOIC5QCYBGAXdA7WA6W6AhgE7oCWWUAxAJIByNAKoqAA4D2sZ57WLIAD0QBWAJy4AHKOQAWAMyi5wgOxLR8gGwAaEAE9Ec5MlwaADDNUTZGgIzLlNuQF8nOtJhy4ANu0IQKUAD6WGAC6IHcYAC2sFT8HFw8fEiCiMjKuMrCGhrCwjaiwnIywjKmyDr6CMIScrgKcqamGsi2tsqiLm4Y2HisZADGANYBVAAKNADCANKBTACiALLxnNxkvPxCCDKyJjsSpsoSB8jFGsqViLbCkoqmNubKMjJWNl0g7r24-cMBgf6wQioLyQKgAGQA8gBBAAigTo8wAGow5owlgBlFaJdbJUBbBQ3OTXfKNMrZGyXbYvXCmCQ1cp5RxyDoaFyuEBYdgQOD8T6eAgkciULFrDYpLbZXA2VoSaWiZT3UTnCSU6z1OQa4qGHIPInvPl4Hx+P4hMIRdDReApBKi3GpBDIcREsw2eTIJoKFrCSnyCQmGw2CS2F6PQz6nqeH4jYXW1ZJTZpXJSxzSQwydTIRzaPRXR31O6BsQFYSncMePqDaNBAFAkEQEXx8WIMrGR3S56NJmmOSUooaXDp4oMuwWQ5lr4AMwoZFgAAtIA2cQmHWITBoJDJckodsgxD2cwhVOJ1w8dqY8lknuOcIuxXiDJlsrl8oViqVyjJKSP1Zrdx1ZY6yBsk4QA */
    createMachine<
      Context<I, DefaultOptionFields>,
      EventObject,
      TypeState<I, DefaultOptionFields>
    >({
      context: {
        current_options: { first: null, second: null },
        items: { type: "preload", payload: { item_queue: [] } },
        results: [],
        to_replace: { first: true, second: true },
        replace_policy: "keep-picked",
        callbacks: {
          afterItemLoad: [],
          beforeItemLoad: [],
        },
      },
      id: "2bttns",
      initial: "starting",
      states: {
        starting: {
          on: {
            INIT_ITEMS_PRELOAD: {
              // "preload" means that the calling code will provide a queue of items to be used
              actions: assign((context, event) => {
                return {
                  items: event.args.items,
                  replace_policy: event.args.replace ?? context.replace_policy,
                };
              }),
              target: "loading_next_items_preload",
            },
            INIT_ITEMS_LOAD_ON_DEMAND: {
              actions: assign((context, event) => {
                // "load-on-demand" means that the calling code will provide a function to load items on demand, e.g. via an API call
                return {
                  items: event.args.items,
                  replace_policy: event.args.replace ?? context.replace_policy,
                };
              }),
              target: "loading_next_items_load_on_demand",
            },
          },
        },
        loading_next_items_preload: {
          entry: [
            assign((context, event) => {
              if (context.items.type !== "preload") {
                throw new Error(
                  'Unexpected context.items.type -- expected "preload"'
                );
              }
              const item_queue = [...context.items.payload.item_queue] as I[];

              const updatedOptions = { ...context.current_options };
              Object.keys(context.to_replace).forEach((key) => {
                const replaceKey =
                  key as keyof ChoiceReplacement<DefaultOptionFields>;
                const shouldReplace = context.to_replace[replaceKey];
                if (!shouldReplace) return;
                const nextItem = item_queue.shift();
                if (!nextItem) return;
                updatedOptions[replaceKey] = nextItem;
              });

              const updatedItemsContext = {
                ...context.items,
                payload: { ...context.items.payload, item_queue },
              };
              return {
                ...context,
                current_options: updatedOptions,
                items: updatedItemsContext,
              };
            }),
          ],
          on: {
            PICK_READY: {
              target: "checking_for_enough_options",
            },
          },
        },
        loading_next_items_load_on_demand: {
          on: {
            LOAD_NEXT_ITEMS_LOAD_ON_DEMAND: {
              actions: assign({
                current_options: (context, event) => {
                  if (context.items.type !== "load-on-demand") {
                    throw new Error(
                      'Unexpected context.items.type -- expected "load-on-demand"'
                    );
                  }
                  const updatedOptions = { ...context.current_options };
                  Object.keys(context.to_replace).forEach((key) => {
                    const replaceKey =
                      key as keyof ChoiceReplacement<DefaultOptionFields>;
                    const shouldReplace = context.to_replace[replaceKey];
                    if (!shouldReplace) return;
                    const nextItem = event.args.itemsToLoad.shift();
                    if (!nextItem) return;
                    updatedOptions[replaceKey] = nextItem;
                  });
                  return updatedOptions;
                },
              }),
              target: "loaded_items_load_on_demand",
            },
          },
        },
        loaded_items_load_on_demand: {
          always: {
            target: "checking_for_enough_options",
          },
        },
        // This state is used to check if there are enough pickable options for the user to continue
        checking_for_enough_options: {
          always: [
            {
              cond: (ctx) => hasEnoughOptions<I, DefaultOptionFields>(ctx),
              target: "picking",
            },
            {
              cond: (ctx) => !hasEnoughOptions<I, DefaultOptionFields>(ctx),
              target: "finished",
            },
          ],
        },
        picking: {
          on: {
            PICK_ITEM: {
              actions: assign({
                results: (context, event) => {
                  const choiceKey = event.args
                    .key as keyof ChoiceReplacement<DefaultOptionFields>;
                  const { current_options } = context;
                  const picked = current_options[choiceKey];

                  const notPicked: DefaultOptionFields =
                    choiceKey === "first" ? "second" : "first";
                  const not_picked = current_options[notPicked];

                  if (!picked || !not_picked) {
                    throw new Error("Unexpected null value");
                  }

                  const choice: UserChoice<I> = {
                    picked,
                    not_picked,
                  };

                  return context.results.concat(choice);
                },
                to_replace: (context, event) => {
                  const choiceKey = event.args
                    .key as keyof ChoiceReplacement<DefaultOptionFields>;

                  const toReplace = { ...context.to_replace };

                  Object.keys(context.to_replace).forEach((k) => {
                    const key =
                      k as keyof ChoiceReplacement<DefaultOptionFields>;

                    switch (context.replace_policy) {
                      case "keep-picked":
                        toReplace[key] = key !== choiceKey;
                        break;
                      case "replace-all":
                        toReplace[key] = true;
                        break;
                      case "replace-picked":
                        toReplace[key] = key === choiceKey;
                        break;
                    }
                  });

                  return toReplace;
                },
              }),
              target: "picking_disabled",
            },
          },
        },
        picking_disabled: {
          on: {
            LOAD_NEXT_ITEMS_PRELOADED: {
              target: "checking_next_items",
            },
          },
        },
        // This state is used to check if there are enough incoming items to continue
        checking_next_items: {
          always: [
            {
              cond: (ctx) =>
                ctx.items.type === "preload" &&
                hasEnoughNextItems<I, DefaultOptionFields>(ctx),
              target: "loading_next_items_preload",
            },
            {
              cond: (ctx) =>
                ctx.items.type === "load-on-demand" &&
                hasEnoughNextItems<I, DefaultOptionFields>(ctx),
              target: "loading_next_items_load_on_demand",
            },

            {
              cond: (ctx) => !hasEnoughNextItems<I, DefaultOptionFields>(ctx),
              target: "finished",
            },
          ],
        },
        finished: {
          entry: () => {
            console.log("FINISHED");
          },
        },
      },
    })
  );
};

export default createMachine2bttns;

export function hasEnoughNextItems<I extends Item, OptionFields extends string>(
  context: Context<I, OptionFields>
) {
  switch (context.items.type) {
    case "preload":
      switch (context.replace_policy) {
        case "keep-picked":
        case "replace-picked":
          return context.items.payload.item_queue.length >= 1;
        case "replace-all":
          return (
            context.items.payload.item_queue.length >=
            Object.keys(context.to_replace).length
          );
        default:
          return false;
      }
    case "load-on-demand":
      switch (context.replace_policy) {
        case "keep-picked":
        case "replace-picked":
          return context.items.payload.itemsToLoad >= 1;
        case "replace-all":
          return (
            context.items.payload.itemsToLoad >=
            Object.keys(context.to_replace).length
          );
        default:
          return false;
      }
    default:
      throw new Error("Unexpected context.items.type");
  }
}

export function hasEnoughOptions<I extends Item, OptionFields extends string>(
  context: Context<I, OptionFields>
) {
  return Object.values(context.current_options).every((v) => v !== null);
}

export function getChoicesRemaining<
  I extends Item,
  OptionFields extends string
>(context: Context<I, OptionFields>) {
  switch (context.items.type) {
    case "preload":
      const remainingPreloadItems = context.items.payload.item_queue.length;
      switch (context.replace_policy) {
        case "keep-picked":
        case "replace-picked":
          return remainingPreloadItems;
        case "replace-all":
          return Math.floor(context.items.payload.item_queue.length / 2);
        default:
          throw new Error(
            ":: 2bttns - Invalid replace policy while computing remaining choices."
          );
      }
    case "load-on-demand":
      const remainingLoadOnDemandItems = context.items.payload.itemsToLoad;
      switch (context.replace_policy) {
        case "keep-picked":
        case "replace-picked":
          return remainingLoadOnDemandItems;
        case "replace-all":
          return Math.floor(context.items.payload.itemsToLoad / 2);
        default:
          throw new Error(
            ":: 2bttns - Invalid replace policy while computing remaining choices."
          );
      }
    default:
      throw new Error("Unexpected context.items.type");
  }
}
