export const formatDataPreviewForPrompt = (data: unknown) => {
    let dataPreview = data;
    const dataStr = JSON.stringify(data);
  if (dataStr.length > 2000) {
    if (Array.isArray(data)) {
      dataPreview = {
        _type: 'array',
        _length: (data as any[]).length,
        _preview: (data as any[]).slice(0, 3),
        _note: `... and ${(data as any[]).length - 3} more items`
      };
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      dataPreview = {
        _type: 'object',
        _keys: keys,
        _preview: Object.fromEntries(keys.slice(0, 5).map(k => [k, (data as any)[k]])),
        _note: keys.length > 5 ? `... and ${keys.length - 5} more properties` : ''
      };
    }
  }
  return dataPreview;
}