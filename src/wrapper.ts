import type { CreateRootConfigTypes, RootConfig, RootConfigTypes, RuntimeConfig } from "./core/internals/config";
import type { DefaultErrorShape, ErrorFormatter, ErrorFormatterShape } from "./core/error";
import type { PickFirstDefined, ValidateShape } from "./core/internals/utils";
import { createBuilder } from "./core/internals/procedureBuilder";

type PartialRootConfigTypes = Partial<RootConfigTypes>;
type CreateRootConfigTypesFromPartial<TTypes extends PartialRootConfigTypes> = CreateRootConfigTypes<{
  ctx: TTypes["ctx"] extends RootConfigTypes["ctx"] ? TTypes["ctx"] : object;
  errorShape: TTypes["errorShape"];
}>;

export function wrapper<
  TOptions extends Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>,
  TParams extends PartialRootConfigTypes = object,
>(_options: ValidateShape<TOptions, Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>> | undefined) {
  type $Generics = CreateRootConfigTypesFromPartial<TParams>;
  type $Formatter = PickFirstDefined<TOptions["errorFormatter"], ErrorFormatter<$Generics["ctx"], DefaultErrorShape>>;
  type $ErrorShape = ErrorFormatterShape<$Formatter>;
  return createBuilder<
    RootConfig<{
      ctx: $Generics["ctx"];
      errorShape: $ErrorShape;
    }>
  >();
}
