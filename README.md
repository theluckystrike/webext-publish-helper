# webext-publish-helper — CWS Publishing Automation
> **Built by [Zovo](https://zovo.one)** | `npm i webext-publish-helper`

Manifest validation, store listing generation, and submission checklist with markdown output.

```typescript
import { PublishHelper } from 'webext-publish-helper';
const result = PublishHelper.validateManifest('./manifest.json');
const checklist = PublishHelper.generateChecklistMarkdown('./dist');
console.log(checklist);
```
MIT License
