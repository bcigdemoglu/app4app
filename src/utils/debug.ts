/**
 * Measures the execution time of an asynchronous function and logs the result.
 *
 * @param fnName - The name of the function being measured.
 * @param fn - The asynchronous function to measure.
 * @returns The result of the measured function.
 *
 * @throws Re-throws any errors that occur during the execution of the measured function.
 *
 * @example
 * ```
 * await perf('fetchData', async () => fetch('www.example.com'));
 * ```
 *
 * @example
 * ```
 * await perf('fetchData', async () => {
 *   const response = await fetch('www.example.com');
 *   return response.json();
 * });
 * ```
 */
export const perf = async <T>(
  fnName: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    const isDev = process?.env?.NODE_ENV === 'development';
    if (isDev) {
      console.debug(
        `${fnName} execution time: ${elapsedTime.toFixed(0)} milliseconds`
      );
    }

    return result;
  } catch (error) {
    console.error(`${fnName} failed:`, error);
    throw error; // Re-throw to allow for error handling at the call site
  }
};
