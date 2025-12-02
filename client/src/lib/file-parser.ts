export async function parseFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        // For text-based extraction, we'll use a simplified approach
        // In a real implementation, you'd use libraries like pdf-parse or mammoth
        resolve(result);
      } else if (result instanceof ArrayBuffer) {
        // Convert ArrayBuffer to text (simplified)
        const decoder = new TextDecoder();
        const text = decoder.decode(result);
        resolve(text);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    if (file.type === 'application/pdf') {
      // For PDF files, we'd normally use pdf-parse or PDF.js
      // For now, we'll read as ArrayBuffer and extract basic text
      reader.readAsArrayBuffer(file);
    } else if (file.type.includes('document') || file.type.includes('word')) {
      // For DOCX files, we'd normally use mammoth.js
      // For now, we'll read as ArrayBuffer
      reader.readAsArrayBuffer(file);
    } else {
      // For other file types, read as text
      reader.readAsText(file);
    }
  });
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF, DOCX, and text files are supported' };
  }

  return { valid: true };
}
