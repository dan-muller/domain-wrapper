import { z } from "zod";
import createBuilder from "../builder.js";

describe("builder", () => {
  it("should work", async () => {
    const builder = createBuilder({}).context<{ add: number; sub: number }>();
    const wMiddleware = builder.use(({ ctx, next }) =>
      next<{
        mult?: number;
        add: number;
        sub: number;
      }>({ ctx })
    );
    const wInput = wMiddleware.input(z.number());
    const wOutput = wInput.output(z.number());
    const wResolve = wOutput.resolve(({ ctx, input }) => ctx.add + input - ctx.sub);
    const wExtension = wResolve.extend(async ({ ctx, next }) => {
      const result = await next();
      return result.ok ? (result.data * (ctx.mult ?? 1)).toString() : null;
    });

    const r1 = await wResolve({
      ctx: { add: 1, sub: 2 },
      input: 3,
    });
    console.log("result 1:", r1);

    const r2 = await wExtension({
      ctx: { add: 1, sub: 2, mult: 4 },
      input: 3,
    });
    console.log("result 2:", r2);
  });
});
