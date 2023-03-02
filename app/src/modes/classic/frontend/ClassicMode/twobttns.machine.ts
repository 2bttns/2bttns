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
        item_queue: [],
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
            INIT: {
              actions: assign({
                item_queue: (context, event) => {
                  return [...event.args.items];
                },
                replace_policy: (context, event) => {
                  return event.args.replace ?? "keep-picked";
                },
              }),
              target: "loading_next_items",
            },
          },
        },
        checking_next_items: {
          always: [
            {
              cond: (ctx) => hasEnoughNextItems<I, DefaultOptionFields>(ctx),
              target: "loading_next_items",
            },
            {
              cond: (ctx) => !hasEnoughNextItems<I, DefaultOptionFields>(ctx),
              target: "finished",
            },
          ],
        },
        loading_next_items: {
          entry: [
            assign({
              current_options: (ctx) => {
                const updatedOptions = { ...ctx.current_options };
                Object.keys(ctx.to_replace).forEach((key) => {
                  const replaceKey =
                    key as keyof ChoiceReplacement<DefaultOptionFields>;
                  const shouldReplace = ctx.to_replace[replaceKey];
                  if (!shouldReplace) return;
                  const nextItem = ctx.item_queue.shift();
                  if (!nextItem) {
                    return;
                  }
                  updatedOptions[replaceKey] = nextItem;
                });

                return updatedOptions;
              },
            }),
          ],
          on: {
            PICK_READY: {
              target: "checking_for_enough_options",
            },
          },
        },
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
            LOAD_NEXT_ITEMS: {
              target: "checking_next_items",
            },
          },
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
  switch (context.replace_policy) {
    case "keep-picked":
    case "replace-picked":
      return context.item_queue.length >= 1;
    case "replace-all":
      return (
        context.item_queue.length >= Object.keys(context.to_replace).length
      );
    default:
      return false;
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
  const remainingItems = context.item_queue.length;
  switch (context.replace_policy) {
    case "keep-picked":
    case "replace-picked":
      return remainingItems;
    case "replace-all":
      return Math.floor(context.item_queue.length / 2);
    default:
      throw new Error(
        ":: 2bttns - Invalid replace policy while computing remaining choices."
      );
  }
}
