import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

const app = createApp(pool);

app.listen(config.PORT, () => {
  console.log(`Stats service listening on http://localhost:${config.PORT}`);
});
