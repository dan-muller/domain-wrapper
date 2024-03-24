import { CreateRootConfigTypes, RootConfig, RootConfigTypes, RuntimeConfig } from "./internals/config";
import { PickFirstDefined, ValidateShape } from "./internals/utils";
import { DefaultErrorShape, ErrorFormatterShape } from "../trpc-core/error";
import { ErrorFormatter } from "./error";
import { createBuilder } from "./internals/procedureBuilder";
import { z } from "zod";

type PartialRootConfigTypes = Partial<RootConfigTypes>;

type CreateRootConfigTypesFromPartial<TTypes extends PartialRootConfigTypes> = CreateRootConfigTypes<{
  ctx: TTypes["ctx"] extends RootConfigTypes["ctx"] ? TTypes["ctx"] : object;
  errorShape: TTypes["errorShape"];
}>;

export function wrapper<
  TOptions extends Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>,
  TParams extends PartialRootConfigTypes = object,
>(_options?: ValidateShape<TOptions, Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>> | undefined) {
  type $Generics = CreateRootConfigTypesFromPartial<TParams>;
  type $Context = $Generics["ctx"];
  type $Formatter = PickFirstDefined<TOptions["errorFormatter"], ErrorFormatter<$Context, DefaultErrorShape>>;
  type $ErrorShape = ErrorFormatterShape<$Formatter>;

  type $Config = RootConfig<{
    ctx: $Context;
    errorShape: $ErrorShape;
  }>;

  return {
    procedure: createBuilder<$Config>(),
  };
}

const a = wrapper()
  .procedure.input(z.number())
  .output(z.number())
  .resolver(({ input, ctx }) => input + 1);

a.resolve({ input: 1, ctx: {} });
