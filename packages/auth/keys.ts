import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
    },
    client: {
    },
    runtimeEnv: {
    },
  });
