import path from 'path';

interface ErrorContext {
    schema: string;
    documentNumber: string;
    module?: string;
}
export function formatError(
    err: any,
    { schema, documentNumber, module }: ErrorContext
): string {
    if (Array.isArray((err as any).errors)) {
        const errors = (err as any).errors as unknown[];
        const header = `[${module ?? path.basename(__filename)}] Tenant=${schema} Doc=${documentNumber} [AggregateError: ${errors.length} errores]`;
        const details = errors
            .map((error, i) =>
                `${i + 1}) ${formatError(error, { schema, documentNumber, module })}`
            )
            .join('\n');

        return `${header}\n${details}`;
    }


    const file = path.basename(module ?? __filename);
    const code = err.code ?? err.status ?? 'NO_CODE';
    const msg = err.message ?? String(err);

    // Línea de origen en el stack
    const originLine = err.stack
        ?.split('\n')
        .find((line: any) => line.includes(file))
        ?.trim()
        ?? 'origen desconocido';

    // Preview de 2 líneas de stack
    const stackPreview = err.stack
        ?.split('\n')
        .slice(0, 2)
        .map((l: any) => l.trim())
        .join(' | ')
        ?? '';

    return `[${file}] Tenant=${schema} Doc=${documentNumber} [${code}] ${msg} — Origen: ${originLine} — Stack: ${stackPreview}`;
}
