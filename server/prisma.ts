import { PrismaClient } from '@prisma/client';

const JSON_FIELDS: Record<string, string[]> = {
  Campaign: ['questions', 'badgeConfig', 'missions'],
  Feedback: ['ratings', 'files', 'internalTags'],
};

function serializeJsonFields(model: string, data: Record<string, any>) {
  const fields = JSON_FIELDS[model] || [];
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
      data[field] = JSON.stringify(data[field]);
    }
  }
}

function deserializeRecord(model: string, record: Record<string, any> | null) {
  if (!record) return record;
  const fields = JSON_FIELDS[model] || [];
  const result = { ...record };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch {
        // keep as string
      }
    }
  }
  return result;
}

const basePrisma = new PrismaClient();

// Middleware: serialize on write, deserialize on read
basePrisma.$use(async (params, next) => {
  // Serialize before write
  const writeActions = ['create', 'update', 'upsert', 'createMany', 'updateMany'];
  if (params.model && writeActions.includes(params.action)) {
    const model = params.model as string;
    if (params.args?.data) {
      serializeJsonFields(model, params.args.data);
    }
    if (params.action === 'upsert') {
      if (params.args?.create) serializeJsonFields(model, params.args.create);
      if (params.args?.update) serializeJsonFields(model, params.args.update);
    }
  }

  const result = await next(params);

  // Deserialize after read
  if (params.model) {
    const model = params.model as string;
    if (Array.isArray(result)) {
      return result.map((r) => deserializeRecord(model, r));
    } else if (result && typeof result === 'object') {
      return deserializeRecord(model, result);
    }
  }

  return result;
});

export const prisma = basePrisma;
