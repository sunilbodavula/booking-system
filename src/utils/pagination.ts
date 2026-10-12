import { PaginatedResult } from "../types";

export const toPage = <T>(rows: T[], total: number, page: number, limit: number): PaginatedResult<T> => ({
    data: rows,
    pagination: {page, limit, total, totalPages: Math.ceil(total/limit)},
});