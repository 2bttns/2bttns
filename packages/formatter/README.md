# Game Object Formatter
This script converts JSON data into a format readable by the 2bttns Console.

## Usage 

   ```bash
   npx @2bttns/formatter
   ```

   ```
    📁 Enter the path of the input JSON file: 
    test-data/genres.json
    🔍 Enter the path in JSON (e.g., parent.child.data) where the data to be converted is located: 
    genres
    ⭐️ Which key in your JSON corresponds to "id" with value type "string"?
    👉 Enter "none" if none exists.
    id
    ⭐️ Which key in your JSON corresponds to "name" with value type "string"?
    👉 Enter "none" if none exists.
    name
    ⭐️ Which key in your JSON corresponds to "description" with value type "string"?
    👉 Enter "none" if none exists.
    none
    ⭐️ Which key in your JSON corresponds to "tagIds" with value type "object"?
    👉 Enter "none" if none exists.
    none
    📁 Enter the path where you want to save the output JSON file: 
    /Users/user/Downloads/
    ✅ Output JSON file saved successfully! ✅
   ```


## Table of Contents
1. [Data Model](#game-objects-model)
2. [Usage](#usage)
3. [Example](#example)
4. [Upload to Console](#upload-to-console)
5. [License](#license)


---


#### Warnin
> The Tags section at the bottom of the output JSON is currently set to have empty strings for `id`, `name`, and `description` fields. <br/> As a result, a new Tag object will be generated in the Console.


## Game Objects Model
The script converts any size JSON into the data model below. 

> Your JSON must contain a `name` equivalent field. These values are loaded as choices within your Game buttons.
>
> Fields not represented in the Game Objects model are ignored. See [Example](#example) for more information.

```typescript
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
```

Interface Type
```typescript
interface GameObject {
  id: string;
  name: string;
  description: string;
  tagIds: string[];
  [key: string]: any;
}
```

## Example

Here's an example of the input JSON:

```json
{
    "chords": [
      {
        "name": "C Major",
        "notes": ["C", "E", "G"]
      },
      {
        "name": "C Minor",
        "notes": ["C", "Eb", "G"]
      },
      {
        "name": "D Major",
        "notes": ["D", "F#", "A"]
      },
      ...
    ]
}
```

And here's the resulting output JSON:

```json
{
  "gameObjects": [
    {
      "id": "cljgvm1w00000679s2l9a5zql",
      "name": "C Major",
      "description": "",
      "tagIds": []
    },
    {
      "id": "cljgvm1w10001679sdppzbk1p",
      "name": "C Minor",
      "description": "",
      "tagIds": []
    },
    {
      "id": "cljgvm1w10002679sda2j6i75",
      "name": "D Major",
      "description": "",
      "tagIds": []
    },
    ...
  ],
  "tags": [
    {
      "id": "",
      "name": "",
      "description": ""
    }
  ]
}
```

## Upload to Console

Now your new json is ready to be uploaded.

1. Locate your converted data inside `output`.
2. Open your Console
3. Navigate to Game Objects
4. Click Actions then Import from JSON
5. Upload the `ready-for-upload.json` file and click Confirm.

Your Game Objects are now ready to be Tagged!

## License

This project is licensed under the [MIT License](/MIT_LICENSE.txt).
