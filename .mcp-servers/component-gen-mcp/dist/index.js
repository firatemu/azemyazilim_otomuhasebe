#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
class ComponentGenServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'component-gen-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate_crud_page',
                    description: 'Material UI CRUD sayfası oluşturur (liste, ekleme, düzenleme, silme)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            modelName: {
                                type: 'string',
                                description: 'Model adı (örn: User, Stok, Cari)',
                            },
                            fields: {
                                type: 'string',
                                description: 'Alanlar (JSON string: [{name, type, required}])',
                            },
                        },
                        required: ['modelName', 'fields'],
                    },
                },
                {
                    name: 'generate_form',
                    description: 'Form component\'i oluşturur (react-hook-form + Zod)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            formName: {
                                type: 'string',
                                description: 'Form adı',
                            },
                            fields: {
                                type: 'string',
                                description: 'Alanlar (JSON string)',
                            },
                        },
                        required: ['formName', 'fields'],
                    },
                },
                {
                    name: 'generate_hooks',
                    description: 'TanStack Query hooks oluşturur (useQuery, useMutation)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            modelName: {
                                type: 'string',
                                description: 'Model adı',
                            },
                            endpoint: {
                                type: 'string',
                                description: 'API endpoint (örn: /api/users)',
                            },
                        },
                        required: ['modelName', 'endpoint'],
                    },
                },
                {
                    name: 'generate_types',
                    description: 'TypeScript type tanımları oluşturur',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            modelName: {
                                type: 'string',
                                description: 'Model adı',
                            },
                            fields: {
                                type: 'string',
                                description: 'Alanlar (JSON string)',
                            },
                        },
                        required: ['modelName', 'fields'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'generate_crud_page':
                        return await this.generateCrudPage(args?.modelName, args?.fields);
                    case 'generate_form':
                        return await this.generateForm(args?.formName, args?.fields);
                    case 'generate_hooks':
                        return await this.generateHooks(args?.modelName, args?.endpoint);
                    case 'generate_types':
                        return await this.generateTypes(args?.modelName, args?.fields);
                    default:
                        throw new Error(`Bilinmeyen komut: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Hata: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    async generateCrudPage(modelName, fieldsJson) {
        const fields = JSON.parse(fieldsJson);
        const lowerModel = modelName.toLowerCase();
        const crudPage = `
# ${modelName} CRUD Sayfası

## \`${modelName}Page.tsx\`

\`\`\`typescript
import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { use${modelName}s, useCreate${modelName}, useUpdate${modelName}, useDelete${modelName} } from './hooks';
import { ${modelName}Form } from './${modelName}Form';
import type { ${modelName} } from './types';

export function ${modelName}Page() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<${modelName} | null>(null);

  const { data: items = [], isLoading } = use${modelName}s();
  const createMutation = useCreate${modelName}();
  const updateMutation = useUpdate${modelName}();
  const deleteMutation = useDelete${modelName}();

  const handleSubmit = async (data: Partial<${modelName}>) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <h1>${modelName} Yönetimi</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Yeni Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
${fields.map(f => `              <TableCell>${f.name}</TableCell>`).join('\n')}
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
${fields.map(f => `                <TableCell>{item.${f.name}}</TableCell>`).join('\n')}
                <TableCell align="right">
                  <IconButton onClick={() => { setEditingItem(item); setOpen(true); }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Düzenle' : 'Yeni Ekle'}</DialogTitle>
        <DialogContent>
          <${modelName}Form
            initialData={editingItem || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
\`\`\`
    `.trim();
        return {
            content: [{ type: 'text', text: crudPage }],
        };
    }
    async generateForm(formName, fieldsJson) {
        const fields = JSON.parse(fieldsJson);
        const formComponent = `
# ${formName} Form Component

## \`${formName}.tsx\`

\`\`\`typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, TextField } from '@mui/material';

const schema = z.object({
${fields.map(f => `  ${f.name}: z.${f.type === 'number' ? 'number()' : 'string()'}${f.required ? '' : '.optional()'},`).join('\n')}
});

type FormData = z.infer<typeof schema>;

interface ${formName}Props {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function ${formName}({ initialData, onSubmit, onCancel }: ${formName}Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
${fields.map(f => `
      <TextField
        label="${f.name}"
        {...register('${f.name}'${f.type === 'number' ? ', { valueAsNumber: true }' : ''})}
        error={!!errors.${f.name}}
        helperText={errors.${f.name}?.message}
        ${f.required ? 'required' : ''}
      />`).join('\n')}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="contained">Kaydet</Button>
      </Box>
    </Box>
  );
}
\`\`\`
    `.trim();
        return {
            content: [{ type: 'text', text: formComponent }],
        };
    }
    async generateHooks(modelName, endpoint) {
        const lowerModel = modelName.toLowerCase();
        const hooks = `
# ${modelName} TanStack Query Hooks

## \`use${modelName}.ts\`

\`\`\`typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { ${modelName} } from './types';

const API_URL = '${endpoint}';

// Tümünü getir
export function use${modelName}s() {
  return useQuery({
    queryKey: ['${lowerModel}s'],
    queryFn: async () => {
      const { data } = await axios.get<${modelName}[]>(API_URL);
      return data;
    },
  });
}

// Tek kayıt getir
export function use${modelName}(id: string) {
  return useQuery({
    queryKey: ['${lowerModel}', id],
    queryFn: async () => {
      const { data } = await axios.get<${modelName}>(\`\${API_URL}/\${id}\`);
      return data;
    },
    enabled: !!id,
  });
}

// Yeni oluştur
export function useCreate${modelName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: Partial<${modelName}>) => {
      const { data } = await axios.post<${modelName}>(API_URL, newItem);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${lowerModel}s'] });
    },
  });
}

// Güncelle
export function useUpdate${modelName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<${modelName}> }) => {
      const { data } = await axios.put<${modelName}>(\`\${API_URL}/\${id}\`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['${lowerModel}s'] });
      queryClient.invalidateQueries({ queryKey: ['${lowerModel}', variables.id] });
    },
  });
}

// Sil
export function useDelete${modelName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(\`\${API_URL}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${lowerModel}s'] });
    },
  });
}
\`\`\`
    `.trim();
        return {
            content: [{ type: 'text', text: hooks }],
        };
    }
    async generateTypes(modelName, fieldsJson) {
        const fields = JSON.parse(fieldsJson);
        const types = `
# ${modelName} TypeScript Types

## \`types.ts\`

\`\`\`typescript
export interface ${modelName} {
  id: string;
${fields.map(f => `  ${f.name}${f.required ? '' : '?'}: ${f.type};`).join('\n')}
  createdAt: string;
  updatedAt: string;
}

export type Create${modelName}Input = Omit<${modelName}, 'id' | 'createdAt' | 'updatedAt'>;
export type Update${modelName}Input = Partial<Create${modelName}Input>;
\`\`\`
    `.trim();
        return {
            content: [{ type: 'text', text: types }],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Frontend Component Generator MCP server çalışıyor...');
    }
}
const server = new ComponentGenServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map