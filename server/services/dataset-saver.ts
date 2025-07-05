import { promises as fs } from 'fs';
import path from 'path';
import type { GeneratedCode } from '@shared/schema';

export class DatasetSaver {
  private baseDir = 'generated-code-dataset';

  async saveGeneratedCode(generatedCode: GeneratedCode, prompt: string): Promise<void> {
    try {
      // Create folder name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const folderName = `generation_${generatedCode.id}_${timestamp}`;
      const folderPath = path.join(this.baseDir, folderName);

      // Create the folder
      await fs.mkdir(folderPath, { recursive: true });

      // Save individual files
      await Promise.all([
        // Save prompt
        fs.writeFile(
          path.join(folderPath, 'prompt.txt'),
          prompt,
          'utf8'
        ),
        
        // Save HTML
        fs.writeFile(
          path.join(folderPath, 'index.html'),
          generatedCode.htmlCode,
          'utf8'
        ),
        
        // Save CSS
        fs.writeFile(
          path.join(folderPath, 'style.css'),
          generatedCode.cssCode,
          'utf8'
        ),
        
        // Save JavaScript
        fs.writeFile(
          path.join(folderPath, 'script.js'),
          generatedCode.jsCode,
          'utf8'
        ),
        
        // Save metadata
        fs.writeFile(
          path.join(folderPath, 'metadata.json'),
          JSON.stringify({
            id: generatedCode.id,
            prompt: prompt,
            aiModel: generatedCode.aiModel,
            createdAt: generatedCode.createdAt,
            timestamp: new Date().toISOString(),
            files: {
              html: 'index.html',
              css: 'style.css',
              javascript: 'script.js',
              prompt: 'prompt.txt'
            }
          }, null, 2),
          'utf8'
        )
      ]);

      console.log(`Generated code saved to dataset: ${folderPath}`);
    } catch (error) {
      console.error('Error saving generated code to dataset:', error);
    }
  }

  async getDatasetStats(): Promise<{
    totalGenerations: number;
    totalSize: string;
    latestGeneration: string | null;
  }> {
    try {
      const entries = await fs.readdir(this.baseDir);
      const generations = entries.filter(entry => entry.startsWith('generation_'));
      
      // Get folder sizes (simplified)
      let totalSize = 0;
      for (const generation of generations) {
        const generationPath = path.join(this.baseDir, generation);
        const files = await fs.readdir(generationPath);
        for (const file of files) {
          const filePath = path.join(generationPath, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      // Convert bytes to human readable format
      const sizeInKB = (totalSize / 1024).toFixed(2);
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      const formattedSize = totalSize > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

      // Get latest generation
      const sortedGenerations = generations.sort().reverse();
      const latestGeneration = sortedGenerations[0] || null;

      return {
        totalGenerations: generations.length,
        totalSize: formattedSize,
        latestGeneration
      };
    } catch (error) {
      console.error('Error getting dataset stats:', error);
      return {
        totalGenerations: 0,
        totalSize: '0 KB',
        latestGeneration: null
      };
    }
  }

  async exportDatasetForTraining(): Promise<{
    prompts: string[];
    htmlOutputs: string[];
    cssOutputs: string[];
    jsOutputs: string[];
    metadata: any[];
  }> {
    try {
      const entries = await fs.readdir(this.baseDir);
      const generations = entries.filter(entry => entry.startsWith('generation_'));
      
      const prompts: string[] = [];
      const htmlOutputs: string[] = [];
      const cssOutputs: string[] = [];
      const jsOutputs: string[] = [];
      const metadata: any[] = [];

      for (const generation of generations) {
        const generationPath = path.join(this.baseDir, generation);
        
        try {
          const [prompt, html, css, js, meta] = await Promise.all([
            fs.readFile(path.join(generationPath, 'prompt.txt'), 'utf8'),
            fs.readFile(path.join(generationPath, 'index.html'), 'utf8'),
            fs.readFile(path.join(generationPath, 'style.css'), 'utf8'),
            fs.readFile(path.join(generationPath, 'script.js'), 'utf8'),
            fs.readFile(path.join(generationPath, 'metadata.json'), 'utf8').then(JSON.parse)
          ]);

          prompts.push(prompt);
          htmlOutputs.push(html);
          cssOutputs.push(css);
          jsOutputs.push(js);
          metadata.push(meta);
        } catch (error) {
          console.error(`Error reading generation ${generation}:`, error);
        }
      }

      return {
        prompts,
        htmlOutputs,
        cssOutputs,
        jsOutputs,
        metadata
      };
    } catch (error) {
      console.error('Error exporting dataset for training:', error);
      return {
        prompts: [],
        htmlOutputs: [],
        cssOutputs: [],
        jsOutputs: [],
        metadata: []
      };
    }
  }
}

export const datasetSaver = new DatasetSaver();