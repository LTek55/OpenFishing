import { createHash } from 'crypto';
import type Database from 'better-sqlite3';

type ColumnInfo = { name: string; type: string; notnull: number; dflt_value: string | null; pk: number };

export function getSchemaHash(sqlite: Database.Database): string {
	const tables = ['lure', 'tag'];
	const parts: string[] = [];

	for (const table of tables) {
		const columns = sqlite.prepare(`PRAGMA table_info('${table}')`).all() as ColumnInfo[];

		// Sort by name so column order (migrate vs push) doesn't affect the hash
		const normalized = columns
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((c) => {
				// Normalize SQLite boolean defaults: 'false'→'0', 'true'→'1'
				let dflt = c.dflt_value ?? '';
				if (dflt.toLowerCase() === 'false') dflt = '0';
				if (dflt.toLowerCase() === 'true') dflt = '1';
				return `${c.name}:${c.type.toUpperCase()}:${c.notnull}:${dflt}:${c.pk}`;
			})
			.join(',');

		parts.push(`${table}(${normalized})`);
	}

	return createHash('sha256').update(parts.join('|')).digest('hex');
}
