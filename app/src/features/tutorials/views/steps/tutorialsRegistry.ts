import { apiKeyPageTutorialFromHome } from "./apiKeyPageTutorialFromHome";
import { gameObjectsPageTutorialFromHome } from "./gameObjectsPageTutorialFromHome";
import { gamesPageTutorialFromHome } from "./gamesPageTutorialFromHome";
import { homePageTutorial } from "./homePageTutorial";
import { tagsPageTutorialFromHome } from "./tagsPageTutorialFromHome";

// Unified place to register 2bttns console tutorials
// IMPORTANT: Keys for tutorials added here must match the tutorial's ID field
//  e.g. homePageTutorial.id is "homePageTutorial", so its key here must be "homePageTutorial"
//   -- This allows type checking/autocompletion when referencing tutorials through the registry
export const tutorialsRegistry = {
  homePageTutorial,
  gamesPageTutorialFromHome,
  tagsPageTutorialFromHome,
  gameObjectsPageTutorialFromHome,
  apiKeyPageTutorialFromHome,
};
