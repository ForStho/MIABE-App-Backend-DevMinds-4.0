export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
        return JSON.stringify(error);
    } catch {
        return 'Unknown error occurred';
    }
}

export function getErrorResponse(error: unknown): { message: string; status?: number; data?: any } {
    const err = error as any;
    return {
        message: getErrorMessage(error),
        status: err.response?.status,
        data: err.response?.data,
    };
}