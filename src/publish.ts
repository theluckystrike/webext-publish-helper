import * as fs from 'fs';
import * as path from 'path';

/**
 * Publish Helper — CWS publishing preparation and validation
 */
export class PublishHelper {
    /** Validate manifest for CWS submission */
    static validateManifest(manifestPath: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        try {
            const raw = fs.readFileSync(manifestPath, 'utf8');
            const manifest = JSON.parse(raw);
            if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3');
            if (!manifest.name) errors.push('Missing name');
            if (!manifest.version) errors.push('Missing version');
            if (!manifest.description) errors.push('Missing description');
            if (manifest.description && manifest.description.length > 132) errors.push('Description exceeds 132 char limit');
            if (!manifest.icons) errors.push('Missing icons');
            else { if (!manifest.icons['128']) errors.push('Missing 128x128 icon'); }
        } catch (e) { errors.push(`Failed to read manifest: ${(e as Error).message}`); }
        return { valid: errors.length === 0, errors };
    }

    /** Generate CWS store listing */
    static generateListing(manifest: Record<string, any>): { name: string; summary: string; category: string } {
        return { name: manifest.name || 'Untitled', summary: (manifest.description || '').slice(0, 132), category: 'Productivity' };
    }

    /** Get submission checklist */
    static getChecklist(dirPath: string): Array<{ item: string; status: 'pass' | 'fail' | 'warn'; detail: string }> {
        const checks: Array<{ item: string; status: 'pass' | 'fail' | 'warn'; detail: string }> = [];
        const manifestPath = path.join(dirPath, 'manifest.json');
        checks.push({ item: 'manifest.json exists', status: fs.existsSync(manifestPath) ? 'pass' : 'fail', detail: manifestPath });
        if (fs.existsSync(manifestPath)) {
            const v = this.validateManifest(manifestPath);
            checks.push({ item: 'Manifest valid', status: v.valid ? 'pass' : 'fail', detail: v.errors.join(', ') || 'OK' });
        }
        const iconPath = path.join(dirPath, 'icons');
        checks.push({ item: 'Icons directory', status: fs.existsSync(iconPath) ? 'pass' : 'warn', detail: fs.existsSync(iconPath) ? 'Found' : 'Missing icons/' });
        const readmePath = path.join(dirPath, 'README.md');
        checks.push({ item: 'README.md', status: fs.existsSync(readmePath) ? 'pass' : 'warn', detail: fs.existsSync(readmePath) ? 'Found' : 'Missing' });
        return checks;
    }

    /** Generate checklist markdown */
    static generateChecklistMarkdown(dirPath: string): string {
        const checks = this.getChecklist(dirPath);
        const icons = { pass: '✅', fail: '❌', warn: '⚠️' };
        let md = '# CWS Submission Checklist\n\n';
        checks.forEach((c) => { md += `${icons[c.status]} **${c.item}** — ${c.detail}\n`; });
        return md;
    }
}
