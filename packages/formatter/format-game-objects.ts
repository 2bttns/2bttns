#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import cuid = require('cuid');

// Define the output shape
interface GameObject {
  id: string;
  name: string;
  description: string;
  tagIds: string[];
  [key: string]: any;
}

interface Tag {
  id: string;
  name: string;
  description: string;
}

interface OutputShape {
  gameObjects: GameObject[];
  tags: Tag[];
}

const outputShape: OutputShape = {
  gameObjects: [
    {
      id: '',
      name: '',
      description: '',
      tagIds: []
    }
  ],
  tags: [
    {
      id: '',
      name: '',
      description: ''
    }
  ]
};

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt the user for input
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question + '\n', (answer) => {
      resolve(answer);
    });
  });
}

// Function to get nested JSON by path
function getNestedJSON(input: any, path: string): any {
  const pathParts = path.split('.');
  let current = input;
  for (const part of pathParts) {
    if (current[part] === undefined) {
      throw new Error(`Could not find ${part} in the JSON data.`);
    }
    current = current[part];
  }
  return current;
}

function convertJSON(input: any, path: string, mappings: Record<string, string | undefined>): OutputShape {
  const output: OutputShape = { ...outputShape };

  // Extract the required nested structure from the input JSON
  const nestedInput = getNestedJSON(input, path);

  // Map the gameObjects based on user mappings
  if (Array.isArray(nestedInput)) {
    output.gameObjects = nestedInput.map((item: any) => {
      const gameObject: GameObject = { ...outputShape.gameObjects[0] };
      gameObject.id = cuid();

      for (const key in mappings) {
        if (mappings.hasOwnProperty(key)) {
          const inputKey = mappings[key];
          if (inputKey !== undefined) {
            const inputValue = item[inputKey];
            if (key === 'tagIds') {
              if (Array.isArray(inputValue)) {
                gameObject[key as keyof GameObject] = inputValue as string & string[];
              } else {
                gameObject[key as keyof GameObject] = inputValue !== undefined ? inputValue : gameObject[key as keyof GameObject];
              }              
            } else {
              gameObject[key as keyof GameObject] = inputValue !== undefined ? inputValue : gameObject[key as keyof GameObject];
            }
          }
        }
      }
      return gameObject;
    });
  }

  return output;
}

// Function to start the conversion process
async function startConversion() {
  try {
    // Ask for the path of the input JSON file
    const inputPath = await prompt('📁 Enter the path of the input JSON file: ');

    // Read the input JSON file
    const inputData = fs.readFileSync(inputPath, 'utf-8');
    const inputJSON = JSON.parse(inputData);

    // Ask for the path in JSON
    const jsonPath = await prompt('🔍 Enter the path in JSON (e.g., parent.child.data) where the data to be converted is located: ');

    // Collect user mappings
    const mappings: Record<string, string | undefined> = {};
    const fields = Object.keys(outputShape.gameObjects[0]);
    for (const field of fields) {
      const fieldType = typeof outputShape.gameObjects[0][field];
      const promptMessage = `⭐️ Which key in your JSON corresponds to "${field}" with value type "${fieldType}"?` + '\n' + ` 👉 Enter "none" if none exists.`;
      const key = await prompt(promptMessage);
      mappings[field] = key === 'none' ? undefined : key;
    }

    // Convert the input JSON based on user mappings
    const convertedJSON = convertJSON(inputJSON, jsonPath, mappings);
    const outputData = JSON.stringify(convertedJSON, null, 2);

    // Ask for the output path
    const outputPath = await prompt('📁 Enter the path where you want to save the output JSON file (e.g., /your/path/name/): ');

    // Concatenate the output path with the output file name
    const fullOutputPath = path.join(outputPath, 'ready-for-upload.json');

    // Write the output JSON file
    fs.writeFileSync(fullOutputPath, outputData, 'utf-8');
    console.log('✅ Output JSON file saved successfully! ✅');

    rl.close();
  } catch (error) {
    console.error('❌ An error occurred:', error);
    rl.close();
  }
}

// Start the conversion process
startConversion();
