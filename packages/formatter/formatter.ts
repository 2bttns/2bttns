#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const { AutoComplete, Input, Select } = require('enquirer');
const glob = require('glob');

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

function getFirstLevelKeys(obj) {
  return Object.keys(obj);
}

function getUniqueKeys(arr) {
  const keys = new Set();
  arr.forEach(obj => {
    Object.keys(obj).forEach(key => keys.add(key));
  });
  return Array.from(keys);
}

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

function convertJSON(input, path, mappings) {
  const output = { ...outputShape };
  const nestedInput = getNestedJSON(input, path);

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
              if (!Array.isArray(inputValue)) {
                throw new Error('The value for "tagIds" should be an array.');
              } 
              gameObject[key] = inputValue;
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

async function startConversion() {
  try {
    const initialPrompt = new Select({
      name: 'initialChoice',
      message: 'What do you want to do?',
      choices: ['Format data for 2bttns Console', 'Get ready-to-upload json data'],
    });

    const initialChoice = await initialPrompt.run();

    if (initialChoice === 'Format data for 2bttns Console') {
      const inputPathPrompt = new Input({
        name: 'inputPath',
        message: '📁 Enter the path of the input JSON file: ',
      });

      const inputPath = await inputPathPrompt.run();
      const inputData = fs.readFileSync(inputPath, 'utf-8');
      const inputJSON = JSON.parse(inputData);

      const keys = getFirstLevelKeys(inputJSON);

      const jsonPathPrompt = new Select({
        name: 'jsonPath',
        message: '🔍 Select the path in JSON where the data to be converted is located: ',
        choices: keys,
      });

      const jsonPath = await jsonPathPrompt.run();

      const nestedInput = getNestedJSON(inputJSON, jsonPath);
      const uniqueKeys = getUniqueKeys(nestedInput);

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

      const convertedJSON = convertJSON(inputJSON, jsonPath, mappings);
      const outputData = JSON.stringify(convertedJSON, null, 2);

      const outputPathPrompt = new Input({
        name: 'outputPath',
        message: '📁 Enter the path where you want to save the output JSON file (e.g., /your/path/name/): ',
      });

      const outputPath = await outputPathPrompt.run();

      const outputFileNamePrompt = new Input({
        name: 'outputFileName',
        message: '📁 Enter the output file name (e.g., my-output.json): ',
      });

      const outputFileName = await outputFileNamePrompt.run();

      const fullOutputPath = path.join(outputPath, outputFileName);

      fs.writeFileSync(fullOutputPath, outputData, 'utf-8');
      console.log('✅ Output JSON file saved successfully! ✅');
    } else if (initialChoice === 'Get ready-to-upload json data') {
      const files = fs.readdirSync(path.join(__dirname, '/formatted-data')).filter(file => file.endsWith('.json'));

      const filePrompt = new Select({
        name: 'selectedFile',
        message: 'Select the JSON file you want to output from the /formatted-data folder:',
        choices: files,
      });

      const selectedFile = await filePrompt.run();

      const outputPathPrompt = new Input({
        name: 'outputPath',
        message: '📁 Enter the path where you want to save the output JSON file (e.g., /your/path/name/): ',
      });

      const outputPath = await outputPathPrompt.run();

      const fullOutputPath = path.join(outputPath, selectedFile);

      fs.copyFileSync(path.join(__dirname, '/formatted-data', selectedFile), fullOutputPath);
      console.log('✅ Output JSON file saved successfully! ✅');
    }

    process.exit(0);
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
  }
}

startConversion();
