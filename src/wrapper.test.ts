import { wrapper } from "./wrapper";
import { z, ZodError } from "zod";

describe("wrapper", () => {
  type Context = {
    add?: number;
    subtract?: number;
  };

  const widget = wrapper({
    name: "widget",
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  })
    .context<Context>()
    .input(z.number())
    .output(z.string())
    .resolve(({ input, ctx: { add, subtract } }) => {
      return (input + (add ?? 0) - (subtract ?? 0)).toString();
    });

  it("should return input", async () => {
    const result = await widget({ ctx: {}, input: 1 });
    expect(result).toBe("1");
  });

  it("should return input with add", async () => {
    const result = await widget({ ctx: { add: 2 }, input: 1 });
    expect(result).toBe("3");
  });

  it("should return input with subtract", async () => {
    const result = await widget({ ctx: { subtract: 2 }, input: 1 });
    expect(result).toBe("-1");
  });

  it("should return input with add and subtract", async () => {
    const result = await widget({ ctx: { add: 2, subtract: 3 }, input: 1 });
    expect(result).toBe("0");
  });

  it("should error when input fails to parse", async () => {
    await expect(widget({ ctx: {}, input: "1" })).rejects.toThrowError();
  });

  describe("with plugin", () => {
    const gadget = widget.with(async ({ next }) => {
      const widget = await next();
      const gizmo = await next({ ctx: { add: 10 } });
      const whatsit = await next({ ctx: { subtract: 20 } });
      return { widget, gizmo, whatsit };
    });

    it("should return return plugin result", async () => {
      const input = 100;
      const result = await gadget({
        ctx: {
          add: 200,
          subtract: 300,
        },
        input: input,
      });
      expect(result).toMatchObject({
        gizmo: "110",
        whatsit: "80",
        widget: "0",
      });
    });

    it("should error when input fails to parse", async () => {
      await expect(gadget({ ctx: {}, input: "1" })).rejects.toThrowError();
    });
  });
});
