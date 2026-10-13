export class WhereBuilder {
    private clauses: string[] = [];
    readonly values: unknown[] = [];

    add(clause: string, value: unknown): void {
        this.values.push(value);
        this.clauses.push(clause.replace('?', `$${this.values.length}`));
    }

    toSql(): string {
        return this.clauses.length > 0 ? `WHERE ${this.clauses.join(' AND ')}` : '';
    }
}

export const escapeLike = (value: string): string => value.replace(/[\\%_]/g, '\\$&');