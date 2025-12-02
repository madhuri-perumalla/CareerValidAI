export async function generatePDF(htmlContent: string, filename: string = 'resume.pdf'): Promise<void> {
  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    // Enhanced HTML template with better styling for PDF
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resume</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #2563EB;
          }
          
          h2 {
            font-size: 16px;
            margin: 15px 0 8px 0;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 3px;
          }
          
          h3 {
            font-size: 14px;
            margin: 10px 0 5px 0;
            color: #374151;
          }
          
          p {
            margin: 5px 0;
          }
          
          ul {
            margin: 5px 0;
            padding-left: 20px;
          }
          
          li {
            margin: 3px 0;
          }
          
          .contact-info {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563EB;
          }
          
          .section {
            margin-bottom: 15px;
          }
          
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 10px 0;
          }
          
          .skill-item {
            background: #f8fafc;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #2563EB;
          }
          
          .project {
            margin-bottom: 12px;
            padding: 10px;
            background: #f9fafb;
            border-radius: 4px;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    printWindow.document.write(fullHtml);
    printWindow.document.close();

    // Wait for content to load
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: download as HTML file
    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = filename.replace('.pdf', '.html');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

export function downloadSessionData(sessionData: any, filename: string = 'careervalid-session.json'): void {
  const dataStr = JSON.stringify(sessionData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const element = document.createElement('a');
  element.href = URL.createObjectURL(dataBlob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function uploadSessionData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const data = JSON.parse(result);
            resolve(data);
          } else {
            reject(new Error('Failed to read file'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    
    input.click();
  });
}
