#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const { AutoComplete, Input, Select } = require('enquirer');
const glob = require('glob');

/**
 * @typedef {Object} GameObject
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} tagIds
 * @property {Object} [key]
 */

/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} OutputShape
 * @property {GameObject[]} gameObjects
 * @property {Tag[]} tags
 */

const outputShape = {
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

// Function to get first level keys in JSON object
function getFirstLevelKeys(obj) {
  return Object.keys(obj);
}

// Function to get all unique keys in an array of objects
function getUniqueKeys(arr) {
  const keys = new Set();
  arr.forEach(obj => {
    Object.keys(obj).forEach(key => keys.add(key));
  });
  return Array.from(keys);
}

// Function to get nested JSON by path
function getNestedJSON(input, path) {
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

/**
 * @param {any} input
 * @param {string} path
 * @param {Record<string, string | undefined>} mappings
 * @returns {OutputShape}
 */
function convertJSON(input, path, mappings) {
  const output = { ...outputShape };

  // Extract the required nested structure from the input JSON
  const nestedInput = getNestedJSON(input, path);

  // Map the gameObjects based on user mappings
  if (Array.isArray(nestedInput)) {
    output.gameObjects = nestedInput.map((item) => {
      const gameObject = { ...outputShape.gameObjects[0] };
      gameObject.id = cuid();

      for (const key in mappings) {
        if (mappings.hasOwnProperty(key)) {
          const inputKey = mappings[key];
          if (inputKey !== undefined) {
            const inputValue = item[inputKey];
            if (key === 'tagIds') {
              if (Array.isArray(inputValue)) {
                gameObject[key] = inputValue;
              } else {
                gameObject[key] = inputValue !== undefined ? inputValue : gameObject[key];
              }
            } else {
              gameObject[key] = inputValue !== undefined ? inputValue : gameObject[key];
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
    const inputPathPrompt = new Input({
      name: 'inputPath',
      message: '📁 Enter the path of the input JSON file: ',
    });

    const inputPath = await inputPathPrompt.run();

    // Read the input JSON file
    const inputData = fs.readFileSync(inputPath, 'utf-8');
    const inputJSON = JSON.parse(inputData);

    // Get first level keys in JSON
    const keys = getFirstLevelKeys(inputJSON);

    // Ask for the path in JSON
    const jsonPathPrompt = new Select({
      name: 'jsonPath',
      message: '🔍 Select the path in JSON where the data to be converted is located: ',
      choices: keys,
    });

    const jsonPath = await jsonPathPrompt.run();

    // Get the nested JSON data and extract unique keys
    const nestedInput = getNestedJSON(inputJSON, jsonPath);
    const uniqueKeys = getUniqueKeys(nestedInput);

    // Collect user mappings
    const mappings = {};
    const fields = Object.keys(outputShape.gameObjects[0]);
    for (const field of fields) {
      const fieldType = typeof outputShape.gameObjects[0][field];
      const promptMessage = `⭐️ Which key in your JSON corresponds to "${field}" with value type "${fieldType}"?` + '\n' + ` 👉 Enter "none" if none exists.`;
      const keyPrompt = new Select({
        name: 'key',
        message: promptMessage,
        choices: [...uniqueKeys, 'none'],
      });
      const key = await keyPrompt.run();
      mappings[field] = key === 'none' ? undefined : key;
    }

    // Convert the input JSON based on user mappings
    const convertedJSON = convertJSON(inputJSON, jsonPath, mappings);
    const outputData = JSON.stringify(convertedJSON, null, 2);

    // Ask for the output path
    const outputPathPrompt = new Input({
      name: 'outputPath',
      message: '📁 Enter the path where you want to save the output JSON file (e.g., /your/path/name/): ',
    });

    const outputPath = await outputPathPrompt.run();

    // Concatenate the output path with the output file name
    const fullOutputPath = path.join(outputPath, 'ready-for-upload.json');

    // Write the output JSON file
    fs.writeFileSync(fullOutputPath, outputData, 'utf-8');
    console.log('✅ Output JSON file saved successfully! ✅');

    // Exit the process
    process.exit(0);
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
  }
}

// Start the conversion process
startConversion();
