type Logger = {
  debug: typeof console.debug;
  info: typeof console.info;
  log: typeof console.log;
  error: typeof console.error;
  table: typeof console.table;
};

type OpMeta<TResult> = {
  name: string;
  params?: string;
  resultFormat?: (result: TResult) => string;
};

type OpDetailParametrized<TArgs extends unknown[], TResult> = OpMeta<TResult> & {
  op: (...args: TArgs) => Promise<TResult>;
};

type OpDetail<TResult> = OpMeta<TResult> & {
  op: () => Promise<TResult>;
};

type OpFactory<TArgs extends unknown[], R> = (...args: TArgs) => Promise<OpDetail<R>> | OpDetail<R>;

const formatParams = (params: string | undefined, args: unknown[]) =>
  params ?? args.map(arg => JSON.stringify(arg)).join(', ');

const executeOperation = <TArgs extends unknown[], R>(
  logger: Logger,
  name: string,
  op: (...args: TArgs) => Promise<R>,
  args: TArgs,
  params: string | undefined,
  resultFormatter?: (result: R) => string,
) => {
  logger.log(`[${name}] Called`, `${formatParams(params, args)}`);
  const start = performance.now();

  return op(...args)
    .then(result => {
      const end = performance.now();
      const formattedResult = resultFormatter
        ? resultFormatter(result)
        : JSON.stringify(result, null, 2);

      logger.log(`[${name}] Returned in ${end - start}ms`, `${formattedResult}`);
      return result;
    })
    .catch(e => {
      logger.error(`[${name}] Error:`, e);
      throw e;
    });
};

export const createWithLog = (logger: Logger) => {
  return <TArgs extends unknown[], TResult>(detail: OpDetailParametrized<TArgs, TResult>) => {
    const { name, params, resultFormat, op } = detail;
    return (...args: TArgs) => executeOperation(logger, name, op, args, params, resultFormat);
  };
};

export const createLogOp =
  (logger: Logger) =>
  <TArgs extends unknown[], TResult>(opFactory: OpFactory<TArgs, TResult>) =>
  async (...args: TArgs) => {
    const { name, params, resultFormat, op } = await opFactory(...args);
    const paramStr = formatParams(params, args);
    return executeOperation(logger, name, op, [], paramStr, resultFormat);
  };
