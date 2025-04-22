import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from 'fs/promises';
import * as path from 'path';

// Create server instance
const server = new McpServer({
  name: "fsReader",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});






// functions
server.tool(
    "list_files",
    "List all text files in a directory",
    {
      directory: z.string().describe("Path to directory to list files from"),
    },
    async ({ directory }) => {
      try {
        const files = await fs.readdir(directory);
        const textFiles = files.filter(file => file.endsWith('.txt'));
        return {
          content: [
            {
              type: "text",
              text: `Text files found:\n${textFiles.join('\n')}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text", 
              text: `Error listing files: ${error}`,
            },
          ],
        };
      }
    }
  );
  
  server.tool(
    "read_file",
    "Read contents of a text file",
    {
      filepath: z.string().describe("Full path to the text file to read"),
    },
    async ({ filepath }) => {
      try {
        if (!filepath.endsWith('.txt')) {
          throw new Error('Only .txt files are supported');
        }
        const content = await fs.readFile(filepath, 'utf-8');
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading file: ${error}`,
            },
          ],
        };
      }
    }
  );
  
  server.tool(
    "write_file", 
    "Write content to a text file",
    {
      filepath: z.string().describe("Full path to the text file to write"),
      content: z.string().describe("Content to write to the file"),
    },
    async ({ filepath, content }) => {
      try {
        if (!filepath.endsWith('.txt')) {
          throw new Error('Only .txt files are supported');
        }
        await fs.writeFile(filepath, content, 'utf-8');
        return {
          content: [
            {
              type: "text",
              text: `Successfully wrote to ${filepath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error writing file: ${error}`,
            },
          ],
        };
      }
    }
  );
  
  // main function to run the server
  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });