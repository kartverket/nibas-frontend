/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Gjør om exports fra en module til et objekt med value som er en mocked function.
 * Dette gir autocompletion på typer til mockfunksjonene
 *
 * ```
 * import * as module from '../module';
 * const mock = jest.createMockFromModule("../module") as MockedModule<typeof module>;
 * ```
 */
export type MockedModule<
  Module extends { [name: string]: (...args: any[]) => any }
> = {
  [Property in keyof Module]: jest.Mock<ReturnType<Module[Property]>>;
};
